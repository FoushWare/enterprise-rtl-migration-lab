from pathlib import Path
import json,subprocess
r=Path(__file__).resolve().parents[1];clips=[]
for i,s in enumerate(json.loads((r/'timeline/base.json').read_text())):
 p=r/f'media/base-{i}.mp4';clips.append(p)
 if p.exists():continue
 a=['ffmpeg','-v','error']
 if s['source']:a+=['-ss',str(s['in']),'-i',s['source']];f=f"crop={':'.join(map(str,s['crop']))},scale=1920:1080,setsar=1,fps=30,setpts=N/(30*TB)"
 else:a+=['-f','lavfi','-i','color=c=0x071426:s=1920x1080:r=30'];f='setsar=1'
 a+=['-vf',f,'-r','30','-fps_mode','cfr','-frames:v',str(round(s['duration']*30)),'-an','-c:v','libx264','-preset','veryfast','-crf','18','-threads','2',str(p)];subprocess.run(a,check=True);print(i,flush=True)
p=r/'media/base-concat.txt';p.write_text(''.join(f"file '{x}'\n" for x in clips));out=r/'media/base.mp4'
if not out.exists():subprocess.run(['ffmpeg','-v','error','-f','concat','-safe','0','-i',str(p),'-vf','setpts=N/(30*TB)','-r','30','-frames:v','3900','-an','-c:v','libx264','-preset','fast','-crf','18','-threads','2',str(out)],check=True)
