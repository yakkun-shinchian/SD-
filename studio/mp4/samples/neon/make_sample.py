"""Reproduce synthetic comparison; no CoeFont/API calls. Run from any cwd."""
import importlib.util
import json
from pathlib import Path

root = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location('edit', root.parents[1]/'edit.py')
e = importlib.util.module_from_spec(spec); spec.loader.exec_module(e)
e.ff(['-f','lavfi','-i','color=0x09152F:s=540x960:r=30:d=4',
      '-vf',"drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf:text='SYNTHETIC SAMPLE - NOT CoeFont':fontsize=22:fontcolor=white:x=(w-tw)/2:y=740",
      *e.encode(),root/'scene.mp4'])
e.ff(['-f','lavfi','-i','sine=frequency=440:duration=3.9',root/'tone.wav'])
manifest={'version':1,'output':{'size':[540,960],'fps':30,'max_duration':60},
 'subtitle_preset':'neon_green',
 'subtitle_style':{'size':52,'position':[270,250],'glow':{'blur':10,'strength':.7}},
 'audio':[{'file':'tone.wav','in':0,'out':3.9,'speed':1.3}],
 'scenes':[{'id':'sample','file':'scene.mp4','in':0,'out':4,'subtitles':[
   {'audio_index':0,'start':0,'end':1.95,'text':'緑ネオン字幕\n検証用サンプル'},
   {'audio_index':0,'start':1.95,'end':3.9,'text':'音程を保って\n１．３倍速'}]}]}
(root/'scene_manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
after=e.edit(root/'scene_manifest.json',root/'after')
manifest.pop('subtitle_preset');manifest['subtitle_style'].update(font='Noto Sans CJK JP',color='#FFD166',size=34,glow={'strength':0})
manifest['audio'][0]['speed']=1
manifest['scenes'][0]['subtitles'][1]['text']='通常速度\n１．０倍速'
(root/'before.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
before=e.edit(root/'before.json',root/'before')
# Sequential comparison allows both audio tracks to be heard independently.
e.ff(['-i',root/'before/final.mp4','-i',root/'after/final.mp4',
      '-filter_complex','[0:v]drawtext=text=BEFORE - 1.0x:fontsize=32:fontcolor=white:x=30:y=60[v0];[1:v]drawtext=text=AFTER - 1.3x:fontsize=32:fontcolor=white:x=30:y=60[v1];[v0][0:a][v1][1:a]concat=n=2:v=1:a=1[v][a]',
      '-map','[v]','-map','[a]',*e.encode(),'-c:a','aac','-movflags','+faststart',root/'comparison.mp4'])
(root/'timing-results.json').write_text(json.dumps({'before':before,'after':after},indent=2)+'\n')
e.ff(['-ss','1','-i',root/'after/final.mp4','-frames:v','1',root/'preview.png'])
# Decode AAC and measure tone end/pitch (synthetic tone only, not speech alignment).
import array
signals = {}
for name in ('before', 'after'):
    pcm = array.array('f', e.run(['ffmpeg','-v','error','-i',root/name/'final.mp4',
                                 '-ac','1','-ar','48000','-f','f32le','-']))
    active = [i for i, value in enumerate(pcm) if abs(value) > .005]
    section = pcm[48000:72000]
    signals[name] = {'signal_end_seconds_threshold_0_005': (active[-1]+1)/48000,
                     'frequency_hz_zero_crossing': sum(a<=0<b for a,b in zip(section, section[1:]))/.5,
                     'decoded_samples': len(pcm)}
(root/'signal-results.json').write_text(json.dumps(signals, indent=2)+'\n')
