"""Render review from approved source illustrations and saved CoeFont takes."""
from pathlib import Path
import json, subprocess, wave, math, hashlib
import numpy as np

ROOT=Path(__file__).resolve().parent
def run(args):
    return subprocess.run(args,check=True,capture_output=True).stdout
def probe(path):
    return json.loads(run(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(path)]))
timeline=[]; chapters=[]; parts=[]; offset=0
for page in range(6):
    local=.35; entries=[]
    for n in ([page*2,page*2+1] if page<5 else [10,11,12]):
        source=ROOT/f'exam02-v6-voice-{n+1:02d}.mp3'
        raw=run(['ffmpeg','-v','error','-i',str(source),'-f','s16le','-ac','1','-ar','48000','-'])
        duration=len(raw)/96000
        entry={'voice':n+1,'page':page+1,'speaker':'senior' if n%2 else 'junior','start':round(offset+local,4),'end':round(offset+local+duration,4),'duration':duration}
        entries.append((local,local+duration,entry));timeline.append(entry)
        local+=duration+.28
    length=math.ceil((local+.5)*30)/30
    pcm=np.zeros(round(length*48000),dtype=np.int16)
    for start,end,e in entries:
        raw=run(['ffmpeg','-v','error','-i',str(ROOT/f"exam02-v6-voice-{e['voice']:02d}.mp3"),'-f','s16le','-ac','1','-ar','48000','-'])
        a=np.frombuffer(raw,dtype=np.int16); pos=round(start*48000);pcm[pos:pos+len(a)]=a
    wav=ROOT/f'.drip-scene-{page}.wav'
    with wave.open(str(wav),'wb') as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(48000);w.writeframes(pcm.tobytes())
    filters=[]
    # Independent speaker dots; fixed medical figure and text remain stable.
    for start,end,e in entries:
        x=35 if e['speaker']=='junior' else 1010
        filters.append(f"drawbox=x={x}:y=620:w=26:h=26:color=0xED5791@0.9:t=fill:enable='between(t,{start},{end})'")
    # Attention marker beside the diagram; the source illustration remains fixed.
    
    # Sequential markers beside the three givens, matching the calculation discussion.
    if page in (2,3,4):
        start,end,e=entries[1]; step=(end-start)/3
        for k in range(3):
            filters.append(f"drawbox=x=24:y={1050+k*90}:w=12:h=60:color=0x7566A8@0.8:t=fill:enable='between(t,{start+k*step},{end})'")
    out=ROOT/f'.drip-scene-{page}.mp4'
    run(['ffmpeg','-v','error','-y','-loop','1','-i',str(ROOT/f'exam02-v6-page-{page+1:02d}.jpg'),'-i',str(wav),'-vf',','.join(filters),'-t',str(length),'-r','30','-c:v','libx264','-preset','veryfast','-crf','26','-pix_fmt','yuv420p','-c:a','aac','-b:a','96k','-ar','48000','-movflags','+faststart',str(out)])
    chapters.append({'page':page+1,'start':round(offset,4),'end':round(offset+length,4)});parts.append(out);offset+=length
    print(f'Page {page+1}: {length:.2f}s',flush=True)
(ROOT/'.drip-concat.txt').write_text(''.join(f"file '{p.name}'\n" for p in parts))
movie=ROOT/'exam02-v6-review.mp4'
run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',str(ROOT/'.drip-concat.txt'),'-c','copy','-movflags','+faststart',str(movie)])
run(['ffmpeg','-v','error','-i',str(movie),'-f','null','-'])
manifest={'lessonId':'exam02','status':'review-only; old lesson retained','chapters':chapters,'voices':timeline,'probe':probe(movie),'sha256':hashlib.sha256(movie.read_bytes()).hexdigest(),'decode':'PASS','medicalReview':'sources checked 2026-10-01; facility ranges and measurement conditions stated','audioTranscriptReview':'generation text checked; listening and ASR not yet completed','motion':'speaker indicator and sequential diagram-margin markers; illustrations remain fixed; approximate attention timing, not word alignment','snsSafeArea':'not certified','bytes':movie.stat().st_size}
(ROOT/'exam02-v6-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
assert movie.stat().st_size<25*1024*1024
assert len(timeline)==13 and timeline[-1]['end']<offset
print(json.dumps({'duration':offset,'bytes':movie.stat().st_size,'voices':len(timeline)}),flush=True)
