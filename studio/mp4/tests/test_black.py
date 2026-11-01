"""Synthetic FFmpeg regressions: strict detection and shared timeline trim."""
import array
import json
import tempfile
import unittest
from pathlib import Path
from test_edit import e


class BlackTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.d = {'version': 1, 'output': {'size': [160,120], 'fps': 10},
                  'scenes': [{'id':'ct','file':'v.mp4','in':0,'out':2}],
                  'silence_check': {'enabled': False}}

    def video(self, color='black', content=True, mark=False):
        first = f'color={color}:s=160x120:r=10:d=1'
        if mark:
            first += ',drawbox=x=80:y=60:w=4:h=4:color=white:t=fill'
        if content:
            e.ff(['-f','lavfi','-i',first,'-f','lavfi','-i',
                  'color=gray:s=160x120:r=10:d=1', '-filter_complex',
                  '[0:v][1:v]concat=n=2:v=1:a=0[v]','-map','[v]',
                  *e.encode(),self.root/'v.mp4'])
        else:
            e.ff(['-f','lavfi','-i',first.replace('d=1','d=2'),
                  *e.encode(),self.root/'v.mp4'])

    def build(self, mode='build'):
        p=self.root/'m.json'; p.write_text(json.dumps(self.d))
        return e.edit(p,self.root/'out',mode)

    def test_detect_default_and_explicit_cut(self):
        self.video()
        r=self.build(); b=r['black_report']
        self.assertEqual((b['detected_start'],b['detected_end'],b['proposed_cut_seconds'],b['cut_seconds']), (0,1,.9,0))
        self.assertEqual(r['duration'],2)
        master=e.sha(self.root/'out/master.mp4')
        self.d['leading_black']={'auto_cut':True}
        r=self.build()
        self.assertEqual(r['black_report']['cut_frames'],9)
        self.assertAlmostEqual(r['duration'],1.1)
        self.assertEqual(e.sha(self.root/'out/master.mp4'),master)
        raw=e.run(['ffmpeg','-v','error','-i',self.root/'out/final.mp4',
                   '-pix_fmt','rgb24','-f','rawvideo','-threads','1','-'])
        n=160*120*3
        self.assertLess(max(raw[:n]),5)
        self.assertGreater(max(raw[n:2*n]),100)  # first content frame retained
        (self.root/'v.mp4').unlink()
        self.assertTrue(self.build('subtitles')['master_reused'])
        self.d['leading_black']['auto_cut']=False
        self.assertEqual(self.build('subtitles')['duration'],2)

    def test_dark_navy_black_without_boundary_and_no_black(self):
        self.d['leading_black']={'auto_cut':True}
        for color,content in [('0x081426',False),('0x000004',False),('black',False),('gray',True)]:
            with self.subTest(color=color):
                self.video(color,content)
                r=self.build()
                self.assertEqual(r['black_report']['cut_seconds'],0)
                self.assertEqual(r['duration'],2)

    def test_small_ct_feature_protects_frame(self):
        self.video(mark=True)
        self.d['leading_black']={'auto_cut':True}
        self.assertEqual(self.build()['black_report']['cut_seconds'],0)

    def test_audio_subtitle_and_silence_times_shift_together(self):
        self.video()
        e.ff(['-f','lavfi','-i',
              'aevalsrc=if(gte(t\\,1)\\,0.2*sin(2*PI*440*t)\\,0):s=48000:d=2',self.root/'n.wav'])
        self.d['audio']=[{'file':'n.wav','out':2}]
        self.d['silence_check']={'enabled':True,'min_duration':.2}
        self.d['leading_black']={'auto_cut':True}
        self.d['subtitle_style']={'font':'DejaVu Sans','size':20}
        self.d['scenes'][0]['subtitles']=[{'text':'CT','start':1,'end':2},
                                         {'text':'discard','start':0,'end':.5},
                                         {'text':'overlap','start':.8,'end':1.2}]
        r=self.build()
        self.assertAlmostEqual(r['subtitle_times'][0]['start'],.1)
        self.assertEqual(r['subtitle_times'][1]['start'],0)
        self.assertEqual(len(r['subtitle_times']),2)
        self.assertAlmostEqual(r['final_audio_ends'][0],1.1)
        self.assertAlmostEqual(r['final_silence_report']['candidates'][0]['end'],.1,delta=.03)
        raw=e.run(['ffmpeg','-v','error','-i',self.root/'out/final.mp4',
                   '-f','f32le','-ac','1','-ar','48000','-'])
        samples=array.array('f',raw)
        self.assertLess(max(abs(x) for x in samples[:2400]),.01)
        self.assertGreater(max(abs(x) for x in samples[7200:9600]),.1)
        self.assertAlmostEqual(r['audio_stream_duration'],1.1,delta=.03)
        text=(self.root/'out/captions.ass').read_text()
        self.assertIn('0:00:00.10,0:00:01.10',text)
        self.assertNotIn('discard',text)

    def test_boolean_required(self):
        for value in ('true',1,None):
            self.d['leading_black']={'auto_cut':value}
            with self.assertRaisesRegex(ValueError,'boolean'):
                self.build()

    def test_scan_limit_preserves_long_black(self):
        self.video(content=False)
        e.ff(['-f','lavfi','-i','color=black:s=160x120:r=10:d=4',
              *e.encode(),self.root/'v.mp4'])
        self.d['scenes'][0]['out']=4
        self.d['leading_black']={'auto_cut':True}
        self.assertEqual(self.build()['black_report']['status'],'protected')
