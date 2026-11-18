"""Extract real-footage selections without modifying source media."""
from pathlib import Path
import subprocess,json,concurrent.futures
root=Path(__file__).resolve().parents[1];edl=json.loads((root/'timeline/edit.json').read_text());media=root/'media'
def make(job):
 lang,i,s=job;out=media/f'{lang}-{i:02}.mp4'
 if out.exists():return out
 dur=s['end']-s['start'];src=Path(s['source'].replace('{LANG}',lang))
 filters=[]
 if 'crop' in s:filters.append('crop='+':'.join(map(str,s['crop'])))
 filters += [f"setpts=(PTS-STARTPTS)/{s.get('speed',1)}",'scale=1920:1080','setsar=1','fps=30']
 subprocess.run(['ffmpeg','-v','error','-ss',str(s['in']),'-i',str(src),'-vf',','.join(filters),'-frames:v',str(round(dur*30)),'-an','-c:v','libx264','-threads','2','-preset','fast','-crf','18','-pix_fmt','yuv420p',str(out)],check=True)
 return out
jobs=[(lang,i,s) for lang in ['AR','EN'] for i,s in enumerate(edl['shots'])]
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as p:
 for f in p.map(make,jobs):print(f.name,flush=True)
for lang in ['AR','EN']:
 listing=media/f'base-{lang}.txt';listing.write_text('\n'.join("file '"+str(media/f'{lang}-{i:02}.mp4')+"'" for i in range(len(edl['shots']))))
 out=media/f'base-{lang}.mp4'
 if not out.exists():subprocess.run(['ffmpeg','-v','error','-f','concat','-safe','0','-i',str(listing),'-c','copy','-an','-movflags','+faststart',str(out)],check=True)
