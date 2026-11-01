import copy
from pathlib import Path
import sys
import runpy
import unittest
import numpy as np
from PIL import ImageChops
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'motion'))
from render import Timeline, Camera, Painter, prepare_overlays, render_frame
from ct_annotations import ct_font
SAMPLE=Path(__file__).resolve().parents[1]/'samples/ct/timeline.json'

class CTTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not SAMPLE.with_name("fixture.png").exists():
            runpy.run_path(str(SAMPLE.with_name("make_fixture.py")))

    def setUp(self):
        self.tl=Timeline(str(SAMPLE)); self.tl.duration=2
        self.cam=Camera(self.tl)
    def test_atomic_first_last_and_one_second(self):
        overlays=prepare_overlays(self.tl)
        visible=[]
        for i in range(60):
            t=i/30
            frame=render_frame(self.tl,self.cam,overlays,t)
            bg=render_frame(self.tl,self.cam,[],t)
            visible.append(ImageChops.difference(frame,bg).getbbox() is not None)
        self.assertEqual([i for i,v in enumerate(visible) if v],list(range(15,45)))
        a=render_frame(self.tl,self.cam,overlays,.5)
        b=render_frame(self.tl,self.cam,overlays,44/30)
        self.assertIsNone(ImageChops.difference(a,b).getbbox())
        for item in overlays[0]['items']:
            x,y=item['at_point']
            self.assertIsNotNone(ImageChops.difference(a,render_frame(self.tl,self.cam,[],.5)).crop((x-90,y-50,x+90,y+50)).getbbox())
            x,y=item['points'][-1]
            self.assertNotEqual(a.getpixel((x,y)),self.tl.img.getpixel((x,y)))
    def test_camera_mapping_and_antialiasing(self):
        self.tl.W,self.tl.H=720,1280
        self.tl.d['camera']=[{'at':0,'focus':[100,200,880,1500],'pad':0,'move':0}]
        cam=Camera(self.tl); o=prepare_overlays(self.tl)
        a=render_frame(self.tl,cam,o,.5); bg=render_frame(self.tl,cam,[],.5)
        pt=Painter(self.tl,cam.at(.5))
        for item in o[0]['items']:
            x,y=pt.P(*item['points'][-1]); x,y=round(x/2),round(y/2)
            self.assertNotEqual(a.getpixel((x,y)),bg.getpixel((x,y)))
        # Supersampled edges contain intermediate coverage levels.
        diff=np.asarray(ImageChops.difference(a,bg))
        self.assertGreater(len(np.unique(diff)),30)
    def test_fractional_start_and_rates(self):
        for fps in [24,30,60]:
            self.tl.fps=fps
            self.tl.d['ct_annotations'][0]['start']=.501
            o=prepare_overlays(self.tl)[0]
            self.assertEqual(o['_count'],fps)
            self.assertGreaterEqual(o['_first']/fps,.501)
    def test_japanese_glyphs_and_font_size(self):
        o=prepare_overlays(self.tl)[0]
        f=ct_font(o['font_path'],96)
        self.assertGreater(f.getlength('側脳室'),250)
        self.assertTrue(all(i['font']>=40 for i in o['items']))
    def test_invalid_inputs(self):
        original=copy.deepcopy(self.tl.d)
        for field,value in [('duration',-1),('duration',float('nan')),('start',2)]:
            self.tl.d=copy.deepcopy(original)
            self.tl.d['ct_annotations'][0][field]=value
            with self.assertRaises(ValueError): prepare_overlays(self.tl)
        self.tl.d=original
        self.tl.d['ct_annotations'][0]['items'][0]['points'][0]=[-1,0]
        with self.assertRaisesRegex(ValueError,'outside'): prepare_overlays(self.tl)
    def test_m3_m4_cannot_enable_ct(self):
        for profile in ['M3','M4',None]:
            self.tl.d['profile']=profile
            with self.assertRaisesRegex(ValueError,'requires profile CT'): prepare_overlays(self.tl)
    def test_missing_font_fails(self):
        self.tl.d['ct_font']='missing.otf'
        with self.assertRaises(OSError): prepare_overlays(self.tl)
    def test_clipped_label_fails(self):
        self.tl.d['ct_annotations'][0]['items'][0]['at_point']=[0,0]
        with self.assertRaisesRegex(ValueError,'clipped'):
            render_frame(self.tl,self.cam,prepare_overlays(self.tl),.5)

if __name__=='__main__': unittest.main()
