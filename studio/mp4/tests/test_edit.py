import copy
import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
import shutil
import array

MODULE = Path(__file__).resolve().parents[1]/'edit.py'
spec = importlib.util.spec_from_file_location('mp4_edit', MODULE)
e = importlib.util.module_from_spec(spec)
spec.loader.exec_module(e)

class EditTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory(prefix='mp4-test-')
        cls.root = Path(cls.tmp.name)
        e.ff(['-f','lavfi','-i','color=red:s=160x120:r=10:d=1','-f','lavfi','-i','color=lime:s=160x120:r=10:d=1','-filter_complex','[0:v][1:v]concat=n=2:v=1:a=0[v]','-map','[v]',*e.encode(),cls.root/'changing.mp4'])
        e.ff(['-f','lavfi','-i','color=blue:s=120x160:r=15:d=2',*e.encode(),cls.root/'blue.mp4'])
        e.ff(['-f','lavfi','-i','sine=frequency=440:duration=1.8',cls.root/'voice.wav'])
        cls.template = {'version':1,'output':{'size':[160,120],'fps':10},'audio':[{'file':'voice.wav'}],
            'subtitle_style':{'font':'DejaVu Sans','size':20,'color':'#FFFF00','position':[80,60]},
            'scenes':[{'id':'blue','file':'blue.mp4','in':.5,'out':1.5,'subtitles':[{'text':'FIRST','start':.1,'end':.9}]},
                      {'id':'green','file':'changing.mp4','in':1,'out':2}]}
        cls.m=cls.root/'scene_manifest.json'; cls.m.write_text(json.dumps(cls.template))
        cls.out=cls.root/'out'; e.edit(cls.m,cls.out)

    @classmethod
    def tearDownClass(cls): cls.tmp.cleanup()

    def manifest(self,d):
        p=self.root/'test.json'; p.write_text(json.dumps(d)); return p

    def pixel(self,path,at):
        raw=e.run(['ffmpeg','-v','error','-ss',str(at),'-i',path,'-frames:v','1','-vf','crop=2:2:80:60','-f','rawvideo','-pix_fmt','rgb24','-threads','1','-'])
        return tuple(raw[:3])

    def test_order_trim_size_fps_audio_duration(self):
        p=self.out/'master.mp4'; blue=self.pixel(p,.5); green=self.pixel(p,1.5)
        self.assertGreater(blue[2],220); self.assertLess(blue[0],20)
        self.assertGreater(green[1],220); self.assertLess(green[0],20)
        data=e.probe(p); v=next(s for s in data['streams'] if s['codec_type']=='video'); a=next(s for s in data['streams'] if s['codec_type']=='audio')
        self.assertEqual((v['width'],v['height'],v['r_frame_rate'],v['nb_frames']),(160,120,'10/1','20'))
        self.assertEqual(v['pix_fmt'],'yuv420p'); self.assertEqual(a['codec_name'],'aac')
        self.assertAlmostEqual(float(data['format']['duration']),2,places=1)
        raw=e.run(['ffmpeg','-v','error','-ss','1.6','-i',p,'-t','0.1','-f','f32le','-ac','1','-'])
        self.assertGreater(max(abs(x) for x in array.array('f',raw)),.05)

    def test_subtitle_only_reuses_master_without_sources(self):
        out=self.root/'subtitle-only'; shutil.copytree(self.out,out,dirs_exist_ok=True)
        before=e.sha(out/'master.mp4'); mtime=(out/'master.mp4').stat().st_mtime_ns; old=e.sha(out/'final.mp4')
        d=copy.deepcopy(self.template); d['scenes'][0]['subtitles'][0].update(text='CHANGED',style={'color':'#FFFFFF','size':15,'position':[80,30]})
        p=self.manifest(d); source=self.root/'blue.mp4'; source.rename(self.root/'hidden.mp4')
        try: report=e.edit(p,out,'subtitles')
        finally: (self.root/'hidden.mp4').rename(source)
        self.assertTrue(report['master_reused']); self.assertEqual(e.sha(out/'master.mp4'),before)
        self.assertEqual((out/'master.mp4').stat().st_mtime_ns,mtime); self.assertNotEqual(e.sha(out/'final.mp4'),old)
        fresh=self.root/'fresh'; e.edit(p,fresh)
        self.assertEqual(e.sha(out/'final.mp4'),e.sha(fresh/'final.mp4'))
        self.assertIn('CHANGED',(out/'captions.ass').read_text()); self.assertNotIn('FIRST',(out/'captions.ass').read_text())

    def test_cache_reuse(self): self.assertTrue(e.edit(self.m,self.out)['master_reused'])

    def test_missing_font_rejected(self):
        d=copy.deepcopy(self.template); d['subtitle_style']['font']='YAKUBON_NONEXISTENT_FONT'
        with self.assertRaisesRegex(ValueError,'Font not installed'):
            e.edit(self.manifest(d),self.root/'bad-font')

    def test_missing_input_cli_error_and_no_outputs(self):
        d=copy.deepcopy(self.template); d['scenes'][0]['file']='missing.mp4'; out=self.root/'missing-output'
        p=subprocess.run(['python3',str(MODULE),'build',str(self.manifest(d)),'--output-dir',str(out)],capture_output=True,text=True)
        self.assertEqual(p.returncode,2); self.assertIn('Input file missing',p.stderr); self.assertFalse(out.exists())

    def test_changed_timeline_rejected_in_subtitles_mode(self):
        d=copy.deepcopy(self.template); d['scenes'].reverse()
        with self.assertRaisesRegex(ValueError,'timeline/audio settings changed'): e.edit(self.manifest(d),self.out,'subtitles')

    def test_invalid_trim_and_audio_overrun(self):
        for value,message in [(4,'Trim exceeds'),(.5,'exceed')]:
            d=copy.deepcopy(self.template); d['scenes'][0]['out']=value
            with self.assertRaisesRegex(ValueError,message): e.edit(self.manifest(d),self.root/'bad')
        d=copy.deepcopy(self.template); d['audio'][0]['at']=.5
        with self.assertRaisesRegex(ValueError,'Audio would be cut off'): e.edit(self.manifest(d),self.root/'bad')

    def test_literal_subtitle_and_invalid_style(self):
        for text in ('{\\pos(0,0)}oops','\\N'):
            d=copy.deepcopy(self.template); d['scenes'][0]['subtitles'][0]['text']=text
            with self.assertRaisesRegex(ValueError,'literal'): e.edit(self.manifest(d),self.root/'bad')
        d=copy.deepcopy(self.template); d['subtitle_style']['color']='yellow'
        with self.assertRaisesRegex(ValueError,'#RRGGBB'): e.edit(self.manifest(d),self.root/'bad')

    def test_corrupt_master_rejected(self):
        out=self.root/'corrupt'; shutil.copytree(self.out,out,dirs_exist_ok=True)
        with (out/'master.mp4').open('ab') as f: f.write(b'changed')
        with self.assertRaisesRegex(ValueError,'Master missing, changed'): e.edit(self.m,out,'subtitles')

if __name__=='__main__': unittest.main()
