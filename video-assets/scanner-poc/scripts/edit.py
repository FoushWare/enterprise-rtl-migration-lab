from pathlib import Path
import subprocess
root=Path(__file__).resolve().parents[1]
shots=[(235,4.5,'01  SOURCE','styles.css:290  |  .chart-labels  |  padding-left: 40px'),(180,4.5,'02  PARSER','css.ts  |  extractCss()  >  postcss.parse()  >  walkDecls()'),(0,4.5,'03  REAL CLI','npm run rtl:scan  |  output saved, then selected with Node'),(75,4.5,'04  EVIDENCE','Actual report: stylesheet/.chart-labels  |  padding-left: 40px'),(90,5.5,'05  RULE > FINDING','RTL.CSS.PHYSICAL  >  MANUAL_REVIEW  |  Minor / High')]
font='/System/Library/Fonts/Supplemental/Arial.ttf'
for i,(start,dur,title,caption) in enumerate(shots):
    (root/f'raw/title{i}.txt').write_text(title)
    (root/f'raw/caption{i}.txt').write_text(caption)
    vf=f"crop=2462:1384:0:0,scale=1920:1080,zoompan=z='1+0.015*on/{int(dur*30)}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1920x1080:fps=30,drawbox=x=0:y=925:w=iw:h=155:color=0x081321@0.96:t=fill,drawbox=x=55:y=945:w=5:h=95:color=0x55d7c2:t=fill,drawtext=fontfile='{font}':textfile='{root}/raw/title{i}.txt':fontsize=25:fontcolor=0x55d7c2:x=80:y=947,drawtext=fontfile='{font}':textfile='{root}/raw/caption{i}.txt':fontsize=30:fontcolor=white:x=80:y=990"
    subprocess.run(['ffmpeg','-y','-v','error','-ss',str(start),'-i',str(root/'raw/final-take.mp4'),'-t',str(dur),'-vf',vf,'-an','-r','30','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p',str(root/f'raw/clip{i}.mp4')],check=True)
args=['ffmpeg','-y','-v','error']
for i in range(5): args+=['-i',str(root/f'raw/clip{i}.mp4')]
f='';prev='0:v';offset=4.25
for i in range(1,5):
 out=f'v{i}'; f+=f'[{prev}][{i}:v]xfade=transition=fade:duration=0.25:offset={offset}[{out}];';prev=out;offset+=shots[i][1]-.25
args+=['-filter_complex',f.rstrip(';'),'-map',f'[{prev}]','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-r','30','-movflags','+faststart',str(root/'scanner-flow-poc.mp4')]
subprocess.run(args,check=True)
