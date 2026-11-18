"""Create four independent scene deliverables; captions are removable from Clean."""
from pathlib import Path
import subprocess,concurrent.futures
r=Path(__file__).resolve().parents[1];o=r/'outputs'
def export(lang):
 clean=o/f'Scene-03_Architecture_{lang}_V1_Clean.mp4';preview=o/f'Scene-03_Architecture_{lang}_V1_Preview.mp4'
 if not clean.exists():subprocess.run(['ffmpeg','-v','error','-i',str(o/f'picture-{lang.lower()}.mp4'),'-i',str(r/'audio/SFX-Mix.wav'),'-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-b:a','192k','-t','130','-movflags','+faststart',str(clean)],check=True)
 if not preview.exists():subprocess.run(['ffmpeg','-v','error','-i',str(clean),'-vf',f"ass=filename='{r/f'timeline/guide-{lang}.ass'}'",'-c:v','libx264','-preset','fast','-crf','18','-threads','2','-pix_fmt','yuv420p','-c:a','copy','-movflags','+faststart',str(preview)],check=True)
 print('Exported',lang,flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as p:list(p.map(export,['AR','EN']))
