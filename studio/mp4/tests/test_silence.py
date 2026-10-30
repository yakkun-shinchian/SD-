"""Real FFmpeg tests with synthetic narration and an independent BGM bus."""
import copy
import json
import tempfile
import unittest
from pathlib import Path
from test_edit import e


class SilenceTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        e.ff(['-f','lavfi','-i','color=blue:s=160x120:r=10:d=8',*e.encode(),self.root/'v.mp4'])
        # Source: silence 0..2, tone 2..4, silence 4..6, tone 6..8, silence 8..10.
        e.ff(['-f','lavfi','-i',"aevalsrc=if(between(t\,2\,4)+between(t\,6\,8)\,0.2*sin(2*PI*440*t)\,0):s=48000:d=10",self.root/'n.wav'])
        e.ff(['-f','lavfi','-i','sine=frequency=220:duration=8',self.root/'bgm.wav'])
        self.d = {'version':1,'output':{'size':[160,120],'fps':10},
            'scenes':[{'id':'ct','file':'v.mp4','in':0,'out':8}],
            'audio':[{'file':'n.wav','in':1,'out':9,'speed':2,'at':1}, {'file':'bgm.wav'}],
            'silence_check':{'narration_tracks':[0],'noise_db':-40,'min_duration':.3,
                'keep':[{'start':2.6,'end':3.4,'reason':'CT inspection'}]}}

    def build(self, d=None, mode='build'):
        p=self.root/'m.json'; p.write_text(json.dumps(d or self.d))
        return e.edit(p,self.root/'out',mode)

    def test_rendered_times_bgm_and_partial_keep(self):
        r=self.build()['silence_report']
        for c, expected in zip(r['candidates'],[(0,1.5),(2.5,3.5),(4.5,8)]):
            self.assertAlmostEqual(c['start'],expected[0],delta=.04)
            self.assertAlmostEqual(c['end'],expected[1],delta=.04)
        self.assertEqual(len(r['candidates']),3)
        self.assertEqual([w['kind'] for w in r['warnings']],['leading','internal','internal','trailing'])
        self.assertEqual(r['kept'][0]['reason'],'CT inspection')
        self.assertEqual((r['kept'][0]['start'],r['kept'][0]['end']),(2.6,3.4))
        master=e.sha(self.root/'out/master.mp4')
        d=copy.deepcopy(self.d); d['silence_check']['keep']=[{'start':2.4,'end':3.6,'reason':'3D view'}]
        r=self.build(d)
        self.assertTrue(r['master_reused']); self.assertEqual(e.sha(self.root/'out/master.mp4'),master)
        self.assertEqual(len(r['silence_report']['warnings']),2)
        self.assertTrue(r['silence_report']['detection_reused'])
        (self.root/'n.wav').unlink(); (self.root/'v.mp4').unlink()
        self.assertTrue(self.build(d,'subtitles')['master_reused'])
        d['silence_check']['noise_db']=-50
        with self.assertRaisesRegex(ValueError,'Input file missing'): self.build(d,'subtitles')

    def test_threshold_duration_and_no_narration(self):
        d=copy.deepcopy(self.d); d['silence_check']['min_duration']=2
        r=self.build(d)['silence_report']; self.assertEqual(len(r['candidates']),1)
        self.assertEqual(r['warnings'][0]['kind'],'trailing')
        d['silence_check'].update(noise_db=0,min_duration=.3,keep=[])
        r=self.build(d)['silence_report']; self.assertEqual(r['warnings'][0]['kind'],'entire')
        d['silence_check']['narration_tracks']=[]
        self.assertEqual(self.build(d)['silence_report']['status'],'no_narration')

    def test_overlap_and_check_does_not_change_media(self):
        d=copy.deepcopy(self.d)
        d['silence_check']['narration_tracks']=[0,1]
        self.assertEqual(self.build(d)['silence_report']['warnings'],[])
        before=e.sha(self.root/'out/final.mp4')
        d['silence_check']['enabled']=False
        r=self.build(d)
        self.assertEqual(r['silence_report']['status'],'disabled')
        self.assertTrue(r['master_reused'])
        self.assertEqual(e.sha(self.root/'out/final.mp4'),before)

    def test_invalid_settings(self):
        for key,value in [('noise_db',float('nan')),('noise_db',1),('min_duration',0),
                          ('narration_tracks',[2]),('narration_tracks',[True]),
                          ('keep',[{'start':3,'end':2,'reason':'CT'}])]:
            d=copy.deepcopy(self.d); d['silence_check'][key]=value
            with self.assertRaises(ValueError): self.build(d)
