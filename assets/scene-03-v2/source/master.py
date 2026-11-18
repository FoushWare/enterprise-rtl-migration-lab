"""Master V3 comes from independent scene sources, preserving earlier masters."""
from pathlib import Path
import json,subprocess,wave
r=Path(__file__).resolve().parents[1];manifest={'status':'Draft – Pending Review','duration':314,'scenes':[{'version':'Scene01 V5','timeline':[0,50]},{'version':'Scene02 V5','timeline':[50,184]},{'version':'Scene03 V2','timeline':[184,314]}],'method':'Stream-copy of independently editable scenes, no previous compressed master as input','variants':[]}
# Only assemble after the scene has passed actual decode validation.
checks=json.loads((r/'evidence/media-verification.json').read_text());assert len([x for x in checks if 'Scene-03' in Path(x['file']).name and x['decode']=='PASS'])==4
mix=r/'master/SFX-Mix.wav'
tracks=[r.parent/'scene-01-v5/audio/SFX-Mix.wav',r.parent/'rtl-production-v5/scene02/audio/SFX-Mix.wav',r/'audio/SFX-Mix.wav']
with wave.open(str(mix),'wb') as w:
 w.setnchannels(2);w.setsampwidth(2);w.setframerate(48000)
 for track,duration in zip(tracks,[50,134,130]):
  with wave.open(str(track)) as a:
   assert (a.getnchannels(),a.getsampwidth(),a.getframerate(),a.getnframes())==(2,2,48000,duration*48000)
   w.writeframes(a.readframes(a.getnframes()))
manifest['audio']={'source':'Original48kHz stereo PCM scene mixes, concatenated at exact50s/184s offsets and encoded once as AAC','tracks':list(map(str,tracks)),'mix':str(mix)}
for lang in ['AR','EN']:
 for variant in ['Clean','Preview']:
  paths=[r.parent/f'scene-01-v5/outputs/Scene-01_Business-Expansion_{lang}_V5_{variant}.mp4',r.parent/f'rtl-production-v5/scene02/outputs/Scene-02_Broken-RTL_{lang}_V5_{variant}.mp4',r/f'outputs/Scene-03_Architecture_{lang}_V2_{variant}.mp4'];p=r/f'master/concat-{lang}-{variant}.txt';p.write_text(''.join(f"file '{f}'\nduration {d}\n" for f,d in zip(paths,[50,134,130])));out=r/f'master/CoffeeBreakWeb_RTL-Migration_{lang}_Master_V3_{variant}.mp4'
  if out.exists():raise RuntimeError('Refusing overwrite')
  picture=r/f'master/picture-{lang}-{variant}.mp4'
  subprocess.run(['ffmpeg','-v','error','-f','concat','-safe','0','-i',str(p),'-map','0:v','-an','-c:v','copy',str(picture)],check=True)
  subprocess.run(['ffmpeg','-v','error','-i',str(picture),'-i',str(mix),'-map','0:v','-map','1:a','-c:v','copy','-c:a','aac','-b:a','192k','-t','314','-movflags','+faststart',str(out)],check=True)
  manifest['variants'].append({'language':lang,'variant':variant,'sources':list(map(str,paths)),'output':str(out),'transitions':'Existing individual-scene entrance/exit animation and quiet SFX tails; natural cut184s from real Procurement to replaceable presenter. No repeated RTL demonstration at this boundary.'})
(r/'master/timeline.json').write_text(json.dumps(manifest,indent=2));print('Master V3 assembled from three independent verified scene sources.')
