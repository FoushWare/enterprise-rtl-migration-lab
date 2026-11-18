"""Create original deterministic non-speech sound effects and separate stereo stems."""
from pathlib import Path
from array import array
import math,random,wave,json
r=Path(__file__).resolve().parents[1];sr=48000;n=130*sr
shots=json.loads((r/'timeline/shots.json').read_text());cues=[]
for i,shot in enumerate(shots):
 t=shot['start'];cues.append(('reveals',t+.1,.35,'reveal',.05,'Shot '+shot['id']+' first visual reveal'))
 if i in [1,6,10]:
  start,count={1:(.65,3),6:(.55,4),10:(.3,5)}[i]
  for j in range(count):cues.append(('layers',t+start+j*.65,.22,'pulse',.035,'Staggered layer entrance'))
 if i==8:
  for j in range(5):cues.append(('connections',t+3.8+j*.8,.3,'pulse',.035,'Verified import connection'))
 if i in [2,3,9]:cues.append(('camera',t+.15,.45,'whoosh',.025,'Transition to genuine footage'))

cues.append(('reveals',27.6,.35,'reveal',.05,'Procurement product reveal'))
stems={key:array('f',[0])*(n*2) for key in sorted(set(c[0] for c in cues))};events=[]
for idx,(stem,t,d,kind,amp,desc) in enumerate(cues):
 frame=math.ceil(t*30-1e-8);t=frame/30;start=round(t*sr);length=round(d*sr);rng=random.Random(500+idx);lp=0
 for j in range(length):
  u=j/max(1,length-1);sec=j/sr;lp=.88*lp+.12*rng.uniform(-1,1)
  if kind in ['air','whoosh']:
   env=math.sin(math.pi*u)**2;sample=(lp*1.8+.10*math.sin(2*math.pi*(100*sec+190*sec*sec)))*env
  elif kind=='click':sample=(rng.uniform(-1,1)*.7+math.sin(2*math.pi*950*sec)*.3)*math.exp(-12*u)*min(1,u*40)
  elif kind=='impact':sample=(.75*math.sin(2*math.pi*(78*sec-14*sec*sec))+.2*lp)*math.exp(-6*u)*min(1,u*20)
  else:
   freq={'pulse':680,'reveal':850,'notify':740,'warning':420}[kind];sample=(math.sin(2*math.pi*freq*sec)*.65+math.sin(2*math.pi*freq*1.5*sec)*.25)*math.exp(-6*u)*min(1,u*25)
  pan=(u*.65-.325) if kind=='whoosh' else 0;left=math.sqrt((1-pan)/2);right=math.sqrt((1+pan)/2);pos=(start+j)*2
  if pos+1<len(stems[stem]):stems[stem][pos]+=sample*amp*left;stems[stem][pos+1]+=sample*amp*right
 events.append({'track':stem,'frame':frame,'time':t,'duration':d,'kind':kind,'description':desc,'license':'Original procedural synthesis created for this project; no sampled speech/music/stock'})
mix=array('f',[0])*(n*2)
for values in stems.values():
 for i,x in enumerate(values):mix[i]+=x
peak=max(abs(x) for x in mix);gain=min(5,.115/max(peak,1e-9))
def write(p,values):
 pcm=array('h',(round(max(-1,min(1,x*gain))*32767) for x in values))
 with wave.open(str(p),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes(pcm.tobytes())
for key,val in stems.items():write(r/f'audio/stems/{key}.wav',val)
write(r/'audio/SFX-Mix.wav',mix)
(r/'timeline/sound-cues.json').write_text(json.dumps({'sample_rate':sr,'duration':130,'mix_peak_dbfs':20*math.log10(peak*gain),'events':events},indent=2))
lines=['# Scene03 V1 — Sound-design cue sheet','\nOriginal deterministic procedural non-speech effects. No external stock assets, synthetic narration, music, voice clone or lip sync. Stereo48kHz PCM stems remain separate; AAC is used only in final MP4s. Quiet around presenter; no continuous130s effect bed. All cue starts snap to the first30fps frame at/after the visual emphasis. Editorial clicks are not claimed to be live recorded click audio.','\n|Time|Frame|Track|Duration|Cue|','|---|---|---|---|']
for e in events:lines.append(f"|{e['time']:.3f}|{e['frame']}|{e['track']}|{e['duration']}|{e['description']}|")
lines+=['\nPre-AAC sample peak: '+f'{20*math.log10(peak*gain):.2f}dBFS. Headroom reserved for future VO; this is not a promised future final-mix loudness. Edit stem levels or cue JSON/generator and re-export to a new version.']
(r/'outputs/Scene-03_Sound-Design_CueSheet.md').write_text('\n'.join(lines));print('Original SFX stems and mix created. Peak',20*math.log10(peak*gain),'dBFS')
