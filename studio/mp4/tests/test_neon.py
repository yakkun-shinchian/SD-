from test_edit import e
import array
import copy
import json
from pathlib import Path
import tempfile
import unittest

class NeonTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.root = Path(cls.tmp.name)
        e.ff(['-f','lavfi','-i','color=0x09152F:s=320x240:r=30:d=4',*e.encode(),cls.root/'scene.mp4'])
        e.ff(['-f','lavfi','-i','sine=frequency=440:duration=3.9',cls.root/'tone.wav'])
        cls.template = {'version':1,'output':{'size':[320,240],'fps':30,'max_duration':60},
            'subtitle_preset':'neon_green','subtitle_style':{'font':'DejaVu Sans','size':30,'position':[160,80]},
            'audio':[{'file':'tone.wav','in':.65,'out':3.9,'at':.5,'speed':1.3}],
            'scenes':[{'id':'sample','file':'scene.mp4','in':0,'out':4,
                'subtitles':[{'audio_index':0,'start':1.3,'end':2.6,'text':'SAMPLE'}]}]}
        cls.m=cls.root/'manifest.json'; cls.m.write_text(json.dumps(cls.template))
        cls.out=cls.root/'render'; cls.report=e.edit(cls.m,cls.out)

    @classmethod
    def tearDownClass(cls): cls.tmp.cleanup()

    def write(self,d):
        p=self.root/'test.json'; p.write_text(json.dumps(d)); return p

    def pcm(self,start,duration):
        return array.array('f',e.run(['ffmpeg','-v','error','-ss',str(start),'-i',self.out/'final.mp4','-t',str(duration),'-ar','48000','-ac','1','-f','f32le','-']))

    def test_source_time_conversion_and_audio_end(self):
        self.assertEqual(self.report['subtitle_times'],[{'start':1.,'end':2.}])
        self.assertAlmostEqual(self.report['audio_ends'][0],3.)
        self.assertAlmostEqual(self.report['audio_stream_duration'],4.,places=1)
        self.assertGreater(max(map(abs,self.pcm(2.9,.05))),.05)
        self.assertLess(max(map(abs,self.pcm(3.1,.1))),.001)
        self.assertLess(max(map(abs,self.pcm(.1,.1))),.001)

    def test_pitch_preserved(self):
        samples=self.pcm(1,.5)
        crossings=sum(a<=0<b for a,b in zip(samples,samples[1:]))
        self.assertAlmostEqual(crossings/.5,440,delta=4)

    def test_glow_layers_and_visible_timing(self):
        ass=(self.out/'captions.ass').read_text()
        self.assertEqual(ass.count('Dialogue:'),3)
        self.assertIn(r'\blur10',ass)
        for at,visible in ((.9,False),(1.1,True),(1.9,True),(2.1,False)):
            frames=[]
            for name in ('master.mp4','final.mp4'):
                frames.append(e.run(['ffmpeg','-v','error','-ss',str(at),'-i',self.out/name,'-frames:v','1','-f','rawvideo','-pix_fmt','rgb24','-threads','1','-']))
            changed=sum(abs(a-b)>30 for a,b in zip(*frames))
            self.assertEqual(changed>100,visible)

    def test_style_reuses_master_and_speed_invalidates(self):
        before=e.sha(self.out/'master.mp4'); mtime=(self.out/'master.mp4').stat().st_mtime_ns
        d=copy.deepcopy(self.template); d['subtitle_style'].update(size=35,position=[160,120],glow={'blur':15,'strength':.9})
        source=self.root/'tone.wav'; source.rename(self.root/'hidden.wav')
        try: report=e.edit(self.write(d),self.out,'subtitles')
        finally: (self.root/'hidden.wav').rename(source)
        self.assertTrue(report['master_reused']); self.assertEqual(before,e.sha(self.out/'master.mp4'))
        self.assertEqual(mtime,(self.out/'master.mp4').stat().st_mtime_ns)
        d['audio'][0]['speed']=1.2
        with self.assertRaisesRegex(ValueError,'run build'): e.edit(self.write(d),self.out,'subtitles')

    def test_bad_settings_and_overrun(self):
        for rate in (0,-1,True,float('nan'),float('inf'),2.1):
            d=copy.deepcopy(self.template); d['audio'][0]['speed']=rate
            with self.assertRaises(ValueError): e.load(self.write(d))
        d=copy.deepcopy(self.template); d['audio'][0]['speed']=.5; d['scenes'][0]['subtitles']=[]
        with self.assertRaisesRegex(ValueError,'cut off'): e.edit(self.write(d),self.root/'bad')
        for glow in ({'blur':51},{'strength':1.1},{'blur':-1}):
            d=copy.deepcopy(self.template); d['subtitle_style']['glow']=glow
            with self.assertRaises(ValueError): e.edit(self.write(d),self.root/'bad')
        d=copy.deepcopy(self.template); d['output']['max_duration']=3
        with self.assertRaisesRegex(ValueError,'max_duration'): e.load(self.write(d))

    def test_linked_cue_rejects_outside_trim_and_scene(self):
        for start,end in ((0,1),(1,4),(.65,.651)):
            d=copy.deepcopy(self.template); d['scenes'][0]['subtitles'][0].update(start=start,end=end)
            with self.assertRaises(ValueError): e.edit(self.write(d),self.root/'bad')
        d=copy.deepcopy(self.template); d['audio'][0]['at']=3
        with self.assertRaisesRegex(ValueError,'outside scene'): e.load(self.write(d))

    def test_multiple_scenes_and_tracks(self):
        d=copy.deepcopy(self.template)
        d['scenes'][0]['out']=2
        d['scenes'][0]['subtitles']=[]
        d['scenes'].append({'id':'second','file':'scene.mp4','in':0,'out':2,
                           'subtitles':[{'audio_index':1,'start':1.3,'end':2.6,'text':'SECOND'}]})
        d['audio']=[{'file':'tone.wav','in':0,'out':1,'at':0},
                    {'file':'tone.wav','in':1.3,'out':2.6,'at':2.5,'speed':1.3}]
        result=e.edit(self.write(d),self.root/'multi')
        self.assertEqual(result['subtitle_times'],[{'start':2.5,'end':3.5}])
        self.assertEqual(result['audio_ends'],[1,3.5])

    def test_unlinked_timing_and_implicit_audio_end(self):
        d=copy.deepcopy(self.template)
        d['audio'][0].update(at=0,**{'in':0})
        del d['audio'][0]['out']
        cue=d['scenes'][0]['subtitles'][0]; del cue['audio_index']
        result=e.edit(self.write(d),self.root/'unlinked')
        self.assertEqual(result['subtitle_times'],[{'start':1.3,'end':2.6}])
        self.assertAlmostEqual(result['audio_ends'][0],3.)
