"""Decode every delivery stream and inspect representative encoded frames."""
from pathlib import Path
import json,subprocess,hashlib,array,math,concurrent.futures
from PIL import Image,ImageDraw
r=Path(__file__).resolve().parents[1];o=r/'outputs';q=r/'evidence/final';q.mkdir(exist_ok=True)
def verify(p):
 d=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)]));v=next(s for s in d['streams'] if s['codec_type']=='video');a=next(s for s in d['streams'] if s['codec_type']=='audio');duration=314 if 'Master_V2' in p.name else 130
 assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames']),v['codec_name'])==(1920,1080,'30/1',duration*30,'h264'),(p,v)
 assert abs(float(d['format']['duration'])-duration)<.08,(p,d['format']['duration']);assert a['codec_name']=='aac' and a['sample_rate']=='48000'
 z=subprocess.run(['ffmpeg','-v','error','-threads','2','-i',str(p),'-map','0:v','-map','0:a','-f','null','-'],capture_output=True);assert z.returncode==0 and not z.stderr,(p,z.stderr.decode())
 pcm=subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-map','0:a','-f','s16le','-ac','2','-ar','48000','-']);vals=array.array('h');vals.frombytes(pcm);peak=max(abs(x) for x in vals)/32768;assert 0<peak<.25
 return {'file':str(p),'duration':d['format']['duration'],'frames':v['nb_frames'],'resolution':[1920,1080],'fps':'30','video':'H.264','audio':'AAC stereo48k','audio_peak_dbfs':round(20*math.log10(peak),2),'audio_pcm_sha256':hashlib.sha256(pcm).hexdigest(),'decode':'PASS'}
files=list(o.glob('Scene-03_Architecture*.mp4'))+list((r/'master').glob('CoffeeBreak*.mp4'))
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as p:checks=list(p.map(verify,files))
for lang in ['AR','EN']:
 f=o/f'Scene-03_Architecture_{lang}_V1_Preview.mp4';times=[5,15,24,31,40,50,60,70,80,93,108,120,127.5]
 for i,t in enumerate(times):subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(f),'-frames:v','1','-q:v','2',str(q/f'{lang}-{i:02}.jpg')],check=True)
 for first in [0,7]:
  selected=list(range(first,min(first+7,len(times))));im=Image.new('RGB',(1600,((len(selected)+1)//2)*470),'#cbd5e1');d=ImageDraw.Draw(im)
  for n,i in enumerate(selected):
   a=Image.open(q/f'{lang}-{i:02}.jpg');a.thumbnail((795,447));x=n%2*800;y=n//2*470;im.paste(a,(x,y));d.text((x+4,y+450),f'{lang} @ {times[i]}s',fill='black')
  im.save(q/f'contact-{lang}-{first}.jpg')
(r/'evidence/media-verification.json').write_text(json.dumps(checks,indent=2));print(json.dumps(checks,indent=2))
