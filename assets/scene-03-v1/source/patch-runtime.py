"""Apply the localized runtime-label refinement as a separately rendered10s source layer."""
from pathlib import Path
import subprocess
r=Path(__file__).resolve().parents[1];o=r/'outputs';picture=o/'picture-ar.mp4';old=o/'picture-ar-initial-runtime-labels.mp4';patch=o/'picture-ar-runtime.mp4'
if old.exists():raise RuntimeError('Already patched; refusing overwrite')
for p,frames in [(picture,3900),(patch,300)]:
 n=int(subprocess.check_output(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=nb_frames','-of','csv=p=0',str(p)]));assert n==frames,(p,n)
picture.rename(old)
filters='[0:v]split=2[p][q];[p]trim=end_frame=1950,setpts=PTS-STARTPTS[a];[1:v]setpts=PTS-STARTPTS[b];[q]trim=start_frame=2250,setpts=PTS-STARTPTS[c];[a][b][c]concat=n=3:v=1:a=0,setpts=N/(30*TB)[v]'
subprocess.run(['ffmpeg','-v','error','-i',str(old),'-i',str(patch),'-filter_complex',filters,'-map','[v]','-frames:v','3900','-r','30','-an','-c:v','libx264','-preset','fast','-crf','16','-pix_fmt','yuv420p','-threads','2','-movflags','+faststart',str(picture)],check=True)
print('Arabic runtime text refined; initial picture preserved.')
