"""Validate completed experiments without substituting for missing authentic footage."""
from pathlib import Path
import subprocess,json,hashlib
base=Path(__file__).resolve().parents[1]
results=[]
for name in ['01-developer-screencast.mp4','02-animated-architecture.mp4','03-hybrid-screencast.mp4']:
 p=base/'experiments'/name
 if not p.exists():results.append({'file':name,'status':'NOT_PRODUCED','reason':'Authentic VS Code desktop capture/control required.'});continue
 metadata=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)]))
 streams=metadata['streams'];v=next(s for s in streams if s['codec_type']=='video');duration=float(metadata['format']['duration'])
 assert v['codec_name']=='h264';assert (v['width'],v['height'])==(1920,1080);assert v['avg_frame_rate']=='30/1';assert 30<=duration<=45
 assert not any(s['codec_type']=='audio' for s in streams)
 subprocess.run(['ffmpeg','-v','error','-i',str(p),'-f','null','-'],check=True)
 results.append({'file':name,'status':'PASS','codec':'h264','resolution':[1920,1080],'fps':30,'duration':duration,'audioTracks':0,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'fullDecode':'PASS'})
(base/'scripts/video-validation.json').write_text(json.dumps(results,indent=2)+'\n')
print(json.dumps(results,indent=2))
