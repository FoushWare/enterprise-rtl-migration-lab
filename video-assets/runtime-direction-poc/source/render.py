from PIL import Image,ImageDraw,ImageFont
import arabic_reshaper
from bidi.algorithm import get_display
import json,pathlib,subprocess,math,re,wave,struct
R=pathlib.Path(__file__).resolve().parents[1]; scenes=json.loads((R/'source/timing.json').read_text());starts=[];total=0
for s in scenes: starts.append(total);s['duration']=s['audioDuration'];total+=s['duration']
(R/'source/timing.json').write_text(json.dumps(scenes,ensure_ascii=False,indent=2))
F='/System/Library/Fonts/Supplemental/Arial.ttf';M='/System/Library/Fonts/Menlo.ttc';A='/System/Library/Fonts/Supplemental/Arial.ttf'
def font(n,mono=False,ar=False):return ImageFont.truetype(A if ar else M if mono else F,n)
def ar(s):return get_display(arabic_reshaper.reshape(s))
def ease(x):return 1-(1-max(0,min(1,x)))**3
subs=[]
for i,s in enumerate(scenes):
 words=s['text'].split();chunks=[' '.join(words[j:j+9]) for j in range(0,len(words),9)]
 for j,c in enumerate(chunks):subs.append((starts[i]+s['duration']*j/len(chunks),starts[i]+s['duration']*(j+1)/len(chunks),c))
def stamp(t):
 ms=round(t*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
(R/'subtitles.ar.srt').write_text('\n\n'.join(f'{i+1}\n{stamp(a)} --> {stamp(b)}\n{c}' for i,(a,b,c) in enumerate(subs))+'\n')
# Narration stays separate and replaceable.
for i,s in enumerate(scenes):subprocess.run(['ffmpeg','-y','-v','error','-i',str(R/f'audio/scene-{i+1:02}.mp3'),'-ar','48000','-ac','1',str(R/f'audio/scene-{i+1:02}.wav')],check=True)
with wave.open(str(R/'audio/narration.wav'),'wb') as out:
 out.setparams((1,2,48000,0,'NONE','not compressed'))
 for i in range(5):
  with wave.open(str(R/f'audio/scene-{i+1:02}.wav'),'rb') as w:out.writeframes(w.readframes(w.getnframes()))
# Original synthesized cues, no third-party music.
sfx=[0.0]*int(total*48000)
for onset in starts[1:]:
 for k in range(7200):
  n=int(onset*48000)+k
  if n<len(sfx):sfx[n]+=.045*math.sin(2*math.pi*(540*k/48000+170*(k/48000)**2))*math.exp(-k/1700)
with wave.open(str(R/'audio/sfx.wav'),'wb') as w:w.setparams((1,2,48000,0,'NONE','not compressed'));w.writeframes(b''.join(struct.pack('<h',int(max(-1,min(1,x))*32767)) for x in sfx))
cmd=['ffmpeg','-y','-v','error','-f','rawvideo','-pix_fmt','rgb24','-s','1920x1080','-r','30','-i','-','-an','-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p',str(R/'render/motion.mp4')]
p=subprocess.Popen(cmd,stdin=subprocess.PIPE)
for frame in range(math.ceil(total*30)):
 t=frame/30;i=max(j for j,a in enumerate(starts) if a<=t);u=t-starts[i];s=scenes[i]
 im=Image.new('RGB',(1920,1080),'#080e19');d=ImageDraw.Draw(im)
 for y in range(1080):
  c=int(7+8*(1-y/1080));d.line((0,y,1920,y),fill=(c,c+7,c+17))
 # Continuous navigation spine, current segment travels rather than slide cuts.
 d.text((70,43),'COFFEE BREAK WEB',font=font(24),fill='#e9f2ff');d.text((1400,48),'VERIFIED CODE / b127325',font=font(20,True),fill='#7996b3')
 for j,l in enumerate(['SOURCE','AST INSPECTION','DIAGNOSTIC','FINDING','REPORT']):
  x=75+j*360;d.line((x,110,x+315,110),fill='#284052',width=2);d.text((x,124),l,font=font(20),fill='#66e4cd' if j==i else '#6c809a')
 d.line((75,110,75+min(1755,t/total*1755),110),fill='#66e4cd',width=4)
 title=['الاتجاه جاي من فانكشن؟','نفهم التعبير قبل ما نحكم','حدود التحليل مش عيب في الواجهة','قرار منفصل: محتاج مراجعة','نفس التحليل، مخرجين مختلفين'][i]
 d.text((80,192),ar(title),font=font(43,ar=True),fill='#eef5ff')
 d.rounded_rectangle((70,277,1210,665),radius=22,fill='#111f31',outline='#2a4058',width=2)
 labels=['TEST EXAMPLE / formatted for readability','rules.ts:52 / selected source, line breaks added','rules.ts:52 / diagnostic branch excerpt','rules.ts:52 / separate add() call excerpt','Verified invocation / actual output summary']
 d.text((100,302),labels[i],font=font(20),fill='#91abc8')
 code=[['import { createTheme } from "@mui/material";','createTheme({','  direction: getDirection(),','});'],['ts.isCallExpression(n)','// resolve imported createTheme; inspect direction','!ts.isStringLiteral(p.initializer)','// inspect structure; never call getDirection()'],['diagnostics.push({','  code: "RUNTIME_DIRECTION_UNKNOWN",','  impact: "DIRECTIONAL_UNSUPPORTED",','  blocking: true, /* plus source location */','});'],['add(','  "RTL.RUNTIME.DIRECTION_UNKNOWN",','  "Dynamic runtime direction requires review",','  a, "RUNTIME_CONFIG", /* rationale + treatment */','  /* owner */, [], "Low"',');'],['Parser:     evidence []   diagnostics []','detect():   adds 1 Diagnostic + 1 Finding','Finding:    RUNTIME_CONFIG / Minor / Low','suggestion: null   evidenceIds: []']][i]
 for k,line in enumerate(code):
  yy=357+k*45
  if i in (2,3) and k==min(len(code)-1,int(u/2)):
   d.rounded_rectangle((90,yy-4,1185,yy+39),radius=6,fill='#243b4c')
  if (i==0 and k==2)or(i==1 and k==2):d.rounded_rectangle((90,yy-4,1185,yy+39),radius=6,fill='#19453f')
  # Lexical highlighting without pretending this is an IDE.
  x=102
  for token in re.split(r'("[^"]*"|\b(?:true|null|import|from)\b)',line):
   color='#9ee7bf' if token.startswith('"') else '#ccacff' if token in ['true','null','import','from'] else '#e5ecf7'
   d.text((x,yy),token,font=font(26,True),fill=color);x+=d.textlength(token,font=font(26,True))
 # Actual screen recording will occupy this framed area.
 d.rounded_rectangle((1260,275,1850,700),radius=16,fill='#101a27',outline='#34516b',width=2)
 d.text((1270,716),'REAL VS CODE / source evidence',font=font(20),fill='#92abc6')
 # Progressive AST/outcome lanes: information physically grows from the source.
 yy=792;alpha=ease(u/1.3);nodes=[('direction',80,290),('CallExpression',420,360),('not StringLiteral',840,360)]
 if i in (0,1):
  for j,(label,x,w) in enumerate(nodes):
   a=ease((u-j*.85)/.8)
   if a>0:
    d.rounded_rectangle((x,yy+30*(1-a),x+w,yy+85),radius=14,fill='#173438',outline='#59d8c0',width=2);d.text((x+22,yy+26),label,font=font(24,True),fill='#c8fff2')
    if j:
     d.line((x-110,yy+43,x-15,yy+43),fill='#54d5c0',width=3)
     px=x-110+95*((u*.6)%1);d.ellipse((px-5,yy+38,px+5,yy+48),fill='#b4fff0')
  if i==1 and u>3:d.text((1275,800),ar('تحليل ساكن فقط'),font=font(31,ar=True),fill='#f5c971')
 else:
  items=[('Diagnostic','RUNTIME_DIRECTION_UNKNOWN','#f3c36a',80),('Finding','RTL.RUNTIME.DIRECTION_UNKNOWN','#a69aff',920)]
  for j,(label,key,col,x) in enumerate(items):
   if i==2 and j==1:continue
   a=ease((u-(.5 if i<4 else j*1.0))/.9)
   if a>0:
    d.rounded_rectangle((x,770+35*(1-a),x+790,897),radius=16,fill='#162233',outline=col,width=2)
    d.text((x+24,788),label,font=font(26),fill=col);d.text((x+24,838),key,font=font(23,True),fill='#e4eefb')
  if i==4:
   # Flow particles reach report: outputs stay separate.
   for x in [470,1310]:
    d.line((x,900,x,938,890,938),fill='#52738e',width=2)
    q=(u*.5)%1;d.ellipse((x-5,900+q*36-5,x+5,900+q*36+5),fill='#6fe6d1')
   d.text((810,910),'Report',font=font(25,True),fill='#6fe6d1')
 # Scene-timed editable caption, proper RTL shaping.
 cap=next((c for a,b,c in subs if a<=t<b),'')
 d.rounded_rectangle((55,975,1865,1060),radius=15,fill='#050a12')
 txt=ar(cap);bbox=d.textbbox((0,0),txt,font=font(34,ar=True));d.text(((1920-(bbox[2]-bbox[0]))/2,991),txt,font=font(34,ar=True),fill='white')
 p.stdin.write(im.tobytes())
p.stdin.close();assert p.wait()==0
print('Rendered',total,'seconds')
