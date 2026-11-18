"""Create Clean and guide-caption previews with the same original SFX mix."""
from pathlib import Path
import json,subprocess,re,concurrent.futures
r=Path(__file__).resolve().parents[1];out=r/'outputs';vo=json.loads((r/'timeline/voiceover.json').read_text())
def ass_time(t):
 n=round(t*100);return f'{n//360000}:{n//6000%60:02}:{n//100%60:02}.{n%100:02}'
for lang,events in vo.items():
 ass='''[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Guide,Arial,52,&H00FFFFFF,&H00FFFFFF,&H00121A26,&H50121A26,0,0,0,0,100,100,0,0,3,6,0,2,170,170,42,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
 for a,b,text in events:
  # Isolate English technical tokens for native bidi layout; SRT stays verbatim.
  if lang=='ar':text=re.sub(r'(Enterprise|Invoicing|Procurement|Requirement|Business|Direction|LTR|RTL|UI)',lambda m:'\u202a'+m[0]+'\u202c',text)
  if lang=='ar':text='\u202b'+text+'\u202c'
  pos=r'{\an8\pos(1150,130)}' if a==40 else ''
  ass+=f'Dialogue: 0,{ass_time(a)},{ass_time(b)},Guide,,0,0,0,,{pos}{text}\n'
 (r/f'timeline/guide-{lang}.ass').write_text(ass)
def export(lang):
 code=lang.upper();picture=out/f'picture-{lang}.mp4';clean=out/f'Scene-01_Business-Expansion_{code}_V5_Clean.mp4';preview=out/f'Scene-01_Business-Expansion_{code}_V5_Preview.mp4'
 if not clean.exists():subprocess.run(['ffmpeg','-v','error','-i',str(picture),'-i',str(r/'audio/SFX-Mix.wav'),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-t','50','-movflags','+faststart',str(clean)],check=True)
 if not preview.exists():subprocess.run(['ffmpeg','-v','error','-i',str(clean),'-vf',f"ass=filename='{r/f'timeline/guide-{lang}.ass'}'",'-c:v','libx264','-threads','2','-preset','fast','-crf','18','-pix_fmt','yuv420p','-c:a','copy','-movflags','+faststart',str(preview)],check=True)
 print('Exported',code,flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as p:list(p.map(export,['ar','en']))
