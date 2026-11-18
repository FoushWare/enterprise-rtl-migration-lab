"""Mux the clean scene and render guide-caption previews; never replace historical exports."""
from pathlib import Path
import subprocess,concurrent.futures,json
r=Path(__file__).resolve().parents[1];o=r/'scene02/outputs'
def export(lang):
 clean=o/f'Scene-02_Broken-RTL_{lang}_V5_Clean.mp4';preview=o/f'Scene-02_Broken-RTL_{lang}_V5_Preview.mp4'
 if not clean.exists():subprocess.run(['ffmpeg','-v','error','-i',str(o/f'picture-{lang}.mp4'),'-i',str(r/'scene02/audio/SFX-Mix.wav'),'-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-b:a','192k','-t','134','-movflags','+faststart',str(clean)],check=True)
 if not preview.exists():subprocess.run(['ffmpeg','-v','error','-i',str(clean),'-vf',f"ass=filename='{r/f'scene02/guide-{lang}.ass'}'",'-c:v','libx264','-preset','fast','-crf','18','-threads','2','-pix_fmt','yuv420p','-c:a','copy','-movflags','+faststart',str(preview)],check=True)
 print('Scene02 export',lang,flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as p:list(p.map(export,['AR','EN']))
