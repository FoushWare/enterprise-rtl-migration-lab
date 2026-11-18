"""Inspect encoded scene frames and perform full-stream decode, not file-existence-only QA."""
from pathlib import Path
import subprocess,json,hashlib,concurrent.futures
from PIL import Image,ImageDraw
r=Path(__file__).resolve().parents[1];q=r/'scene02/qa';q.mkdir(exist_ok=True);shots=json.loads((r/'scene02/timeline.json').read_text())['shots']
def check(p):
 data=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)]));v=next(s for s in data['streams'] if s['codec_type']=='video');a=next(s for s in data['streams'] if s['codec_type']=='audio');assert (v['width'],v['height'],v['r_frame_rate'],v['codec_name'],int(v['nb_frames']))==(1920,1080,'30/1','h264',4020);assert abs(float(data['format']['duration'])-134)<.05;assert a['codec_name']=='aac'
 subprocess.run(['ffmpeg','-v','error','-threads','2','-i',str(p),'-map','0:v','-map','0:a','-f','null','-'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
 return {'file':str(p),'duration':data['format']['duration'],'frames':v['nb_frames'],'fps':v['r_frame_rate'],'resolution':[1920,1080],'video':v['codec_name'],'audio':a['codec_name'],'full_decode':'PASS'}
files=sorted((r/'scene02/outputs').glob('Scene-02*.mp4'))
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as p:result=list(p.map(check,files))
for lang in ['AR','EN']:
 f=r/f'scene02/outputs/Scene-02_Broken-RTL_{lang}_V5_Preview.mp4'
 for s in shots:
  t=s['timeline_start']+min(3,s['duration']/2);dest=q/f'{lang}-{s["index"]:02}.jpg';subprocess.run(['ffmpeg','-v','error','-ss',str(t),'-i',str(f),'-frames:v','1','-q:v','2',str(dest)],check=True)
 for first in [0,10]:
  im=Image.new('RGB',(1600,5*250),'#cbd5e1');d=ImageDraw.Draw(im)
  for j in range(10):
   i=first+j;a=Image.open(q/f'{lang}-{i:02}.jpg');a.thumbnail((798,225));x=j%2*800;y=j//2*250;im.paste(a,(x,y));d.text((x+8,y+226),f'{i:02} @ {shots[i]["timeline_start"]}s',fill='black')
  im.save(q/f'contact-{lang}-{first}.jpg')
(r/'scene02/verification.json').write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2))
