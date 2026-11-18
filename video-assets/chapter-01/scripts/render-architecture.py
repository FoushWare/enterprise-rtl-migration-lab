"""Render experiment B from inspected source relationships; no simulated IDE footage."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import subprocess, math, json
ROOT=Path(__file__).resolve().parents[1]
W,H,FPS,DURATION=1920,1080,30,36
FONT='/System/Library/Fonts/Supplemental/Arial.ttf'
BOLD='/System/Library/Fonts/Supplemental/Arial Bold.ttf'
MONO='/System/Library/Fonts/Menlo.ttc'
fonts={}
def font(s,b=False):
 k=(s,b)
 if k not in fonts:fonts[k]=ImageFont.truetype(BOLD if b else FONT,s)
 return fonts[k]
def ease(v):
 v=max(0,min(1,v));return v*v*(3-2*v)
def alpha(t,start,d=.8):return ease((t-start)/d)
def text(d,xy,s,size=28,fill='#d9e5f7',bold=False,anchor=None):d.text(xy,s,font=font(size,bold),fill=fill,anchor=anchor)
base=Image.new('RGB',(W,H),'#091522');db=ImageDraw.Draw(base)
for y in range(H):
 c=int(9+12*y/H);db.line((0,y,W,y),fill=(c,20+int(10*y/H),34+int(14*y/H)))
for x in range(0,W,48):db.line((x,150,x,H-95),fill='#182a3b')
for y in range(150,H-95,48):db.line((0,y,W,y),fill='#182a3b')

def panel(im,t,start,box,title,path,lines,accent):
 a=alpha(t,start)
 if not a:return
 x,y,w,h=box;y+=int(22*(1-a));layer=Image.new('RGBA',(W,H));d=ImageDraw.Draw(layer)
 d.rounded_rectangle((x,y,x+w,y+h),radius=22,fill='#14283b',outline=accent,width=2)
 d.rounded_rectangle((x,y,x+7,y+h),radius=3,fill=accent)
 text(d,(x+28,y+24),title,34,'#ffffff',True)
 text(d,(x+28,y+72),path,24,accent)
 for i,line in enumerate(lines):text(d,(x+28,y+116+i*32),line,25)
 layer.putalpha(layer.getchannel('A').point(lambda p:int(p*a)));im.alpha_composite(layer)

def edge(im,t,start,points,color,label=None,labelxy=None):
 a=alpha(t,start,1.5)
 if not a:return
 layer=Image.new('RGBA',(W,H));d=ImageDraw.Draw(layer)
 total=sum(math.dist(points[i],points[i+1]) for i in range(len(points)-1));remain=total*a;end=points[0];previous=points[0]
 for p,q in zip(points,points[1:]):
  length=math.dist(p,q)
  if remain<=0:break
  frac=min(1,remain/length);end=(p[0]+(q[0]-p[0])*frac,p[1]+(q[1]-p[1])*frac);d.line([p,end],fill=color,width=5);previous=p;remain-=length
 ang=math.atan2(end[1]-previous[1],end[0]-previous[0]);d.polygon([end,(end[0]-19*math.cos(ang-.45),end[1]-19*math.sin(ang-.45)),(end[0]-19*math.cos(ang+.45),end[1]-19*math.sin(ang+.45))],fill=color)
 if label and a>.85:
  x,y=labelxy;box=d.textbbox((x,y),label,font=font(22,True));d.rounded_rectangle((box[0]-10,box[1]-7,box[2]+10,box[3]+7),radius=6,fill='#091522');text(d,(x,y),label,22,color,True)
 im.alpha_composite(layer)

def frame(t):
 im=base.copy().convert('RGBA');d=ImageDraw.Draw(im)
 d.rounded_rectangle((86,46,105,65),radius=9,fill='#5ee6b1');text(d,(120,39),'COFFEE BREAK WEB  /  CHAPTER 01',23,'#92b6d5',True)
 text(d,(90,91),'One workspace. Two applications.',52,'#ffffff',True)
 text(d,(1830,51),'NX MONOREPO',23,'#5ee6b1',True,'ra')
 d.rounded_rectangle((85,195,1835,900),radius=30,outline='#38546c',width=2)
 text(d,(115,215),'Enterprise RTL Migration Lab',27,'#a9c9e4',True)
 text(d,(1805,220),'SOURCE-VERIFIED  ·  b127325',20,'#7998b1',False,'ra')
 panel(im,t,3,(180,300,640,180),'Invoicing','apps/invoicing',['Invoices · customers · settings'],'#62b4ff')
 panel(im,t,6,(1100,300,640,180),'Procurement','apps/procurement',['Purchase orders · status filtering'],'#62b4ff')
 panel(im,t,11,(180,675,640,185),'Design system','libs/design-system',['AppShell · Sidebar · MUI / Emotion'],'#5ee6b1')
 panel(im,t,14,(1100,675,640,185),'Shared','libs/shared',['Fixtures · totals · locale'],'#f4c46b')
 edge(im,t,18,[(390,480),(390,660)],'#62b4ff')
 edge(im,t,20,[(1550,480),(1550,660)],'#62b4ff')
 edge(im,t,22,[(700,480),(700,550),(1270,550),(1270,660)],'#62b4ff')
 edge(im,t,24,[(1220,480),(1220,595),(600,595),(600,660)],'#62b4ff')
 edge(im,t,28,[(835,770),(1085,770)],'#f4c46b','locale + types',(875,718))
 if t<3:caption='Start with the system, before changing its direction.'
 elif t<11:caption='Two separate applications, inside one Nx workspace.'
 elif t<18:caption='Reusable UI and business utilities live in shared libraries.'
 elif t<28:caption='Both applications import both libraries.'
 elif t<32:caption='The design system also imports shared locale and types.'
 else:caption='A shared change can affect both applications.'
 text(d,(960,963),caption,31,'#ffffff',True,'mm')
 text(d,(960,1015),'Arrows show source imports — not network requests.  Libraries do not import the applications.',22,'#95aec6',False,'mm')
 d.rectangle((0,1074,int(W*min(1,t/DURATION)),1080),fill='#5ee6b1')
 return im.convert('RGB')

def main():
 out=ROOT/'experiments/02-animated-architecture.mp4'
 cmd=['ffmpeg','-y','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s','1920x1080','-r',str(FPS),'-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(out)]
 p=subprocess.Popen(cmd,stdin=subprocess.PIPE)
 try:
  for n in range(FPS*DURATION):p.stdin.write(frame(n/FPS).tobytes())
 finally:p.stdin.close()
 assert p.wait()==0
 for t in [2,8,16,26,32,35]:frame(t).save(ROOT/'raw-recordings'/f'B-preview-{t:02}.png')
 print(out)
if __name__=='__main__':main()
