"""Render the non-destructive V5 edit from genuine raw recordings and V4 annotation layers."""
from pathlib import Path
import json,subprocess,concurrent.futures
from PIL import Image,ImageDraw,ImageFont
r=Path(__file__).resolve().parents[1];cfg=json.loads((r/'scene02/timeline.json').read_text());segments=r/'scene02/segments';segments.mkdir(exist_ok=True)
font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf',25)
for app,color in [('invoicing','#2563eb'),('procurement','#7c3aed')]:
 im=Image.new('RGBA',(1920,1080));d=ImageDraw.Draw(im);text=app.upper();w=round(d.textlength(text,font=font))+40;x=960-w//2;d.rounded_rectangle((x,18,x+w,62),radius=8,fill=color);d.text((x+20,25),text,font=font,fill='white');im.save(r/f'scene02/{app}-badge.png')
def run(a):subprocess.run(list(map(str,a)),check=True)
def render(lang):
 clips=[]
 for s in cfg['shots']:
  i=s['index'];duration=s['duration'];out=segments/f'{lang}-{i:02}.mp4';clips.append(out)
  if out.exists():continue
  base=f"crop={':'.join(map(str,s['source_crop']))},scale=1920:1080,setsar=1,fps=30,trim=end_frame={duration*30},setpts=PTS-STARTPTS"
  a=['ffmpeg','-v','error','-ss',s['start'],'-i',s['source']];issue=s.get('issue');next_index=1
  if issue:
   a+=['-loop','1','-framerate','30','-i',s['overlay'][lang]];next_index=2
   end=duration-.9;hold=(duration-1.2)*30;finish=(duration-.6)*30
   gain=f'if(lt(on,30),0,if(lt(on,48),(1-cos(PI*(on-30)/18))/2,if(lt(on,{hold}),1,if(lt(on,{finish}),(1+cos(PI*(on-{hold})/18))/2,0))))'
   z=f"1+{s['zoom_max']-1:.5f}*({gain})";x,y,w,h=issue['rect'];cx=x+w/2;cy=y+h/2
   xp='0' if i==2 else f'min(iw-iw/zoom,max(0,{cx}-iw/(2*zoom)))';yp=f'min(ih-ih/zoom,max(0,{cy}-ih/(2*zoom)))'
   f=f"[0:v]{base}[v];[1:v]format=rgba,fade=t=in:st=1.65:d=0.3:alpha=1,fade=t=out:st={end}:d=0.3:alpha=1[o];[v][o]overlay=0:0:shortest=1[m];[m]zoompan=z='{z}':x='{xp}':y='{yp}':d=1:s=1920x1080:fps=30[picture]"
  elif s.get('terminal_camera'):
   f=f"[0:v]{base},zoompan=z='1+0.38*if(lt(on,24),0,if(lt(on,42),(1-cos(PI*(on-24)/18))/2,1))':x='min(iw-iw/zoom,max(0,1080-iw/(2*zoom)))':y='min(ih-ih/zoom,max(0,480-ih/(2*zoom)))':d=1:s=1920x1080:fps=30[picture]"
  else:f=f'[0:v]{base}[picture]'
  if s['browser']:
   a+=['-loop','1','-framerate','30','-i',r/f"scene02/{s['app']}-badge.png"]
   f+=f';[picture][{next_index}:v]overlay=0:0:shortest=1,format=yuv420p[out]'
  else:f+=';[picture]format=yuv420p[out]'
  a+=['-filter_complex_threads','1','-filter_complex',f,'-map','[out]','-frames:v',duration*30,'-an','-c:v','libx264','-preset','veryfast','-crf','18','-threads','2',out]
  print(lang,i,s['name'],flush=True);run(a)
 lst=r/f'scene02/concat-{lang}.txt';lst.write_text(''.join(f"file '{p}'\n" for p in clips));picture=r/f'scene02/outputs/picture-{lang}.mp4'
 if not picture.exists():run(['ffmpeg','-v','error','-f','concat','-safe','0','-i',lst,'-vf','setpts=N/(30*TB)','-r','30','-fps_mode','cfr','-frames:v','4020','-c:v','libx264','-preset','fast','-crf','18','-threads','2','-an','-movflags','+faststart',picture])
 print('PICTURE COMPLETE',lang,flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as p:list(p.map(render,['AR','EN']))
