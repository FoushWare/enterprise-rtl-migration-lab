"""Assemble without re-encoding V3; verify outputs and source preservation."""
from pathlib import Path
import subprocess,json,hashlib
r=Path(__file__).resolve().parents[1];out=r/'outputs';old=json.loads((out/'preservation-before.json').read_text())
result={'status':'Draft – Pending Review','exports':{},'audio':'None; no generated narration or inherited SFX','presenter':'Original faceless replaceable silhouette26–32; real presenter pending','limitations':['Storyboard shot times adjusted because existing20s V3 is retained.','Only four verified issue examples teased, not all nine.','Real VO and presenter recording still required.']}
def decoded_hashes(p,frames):
 raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-frames:v',str(frames),'-an','-f','framemd5','-']).decode()
 return [l.split(',')[-1].strip() for l in raw.splitlines() if l and not l.startswith('#')]
for lang in ['AR','EN']:
 geo=r.parent/'scene-01-opening-v3/outputs'/f'Scene-01_Geographic-Journey_{lang}_20s_Draft_V3.mp4'
 tail=out/f'tail-{lang.lower()}.mp4';target=out/f'Scene-01_Business-Expansion_{lang}_50s_Draft_V4.mp4'
 listing=r/'timeline'/f'concat-{lang}.txt';listing.write_text(f"file '{geo}'\nfile '{tail}'\n")
 if not target.exists():subprocess.run(['ffmpeg','-v','warning','-f','concat','-safe','0','-i',str(listing),'-map','0:v:0','-c:v','copy','-an','-movflags','+faststart',str(target)],check=True)
 probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_entries','stream=codec_name,width,height,r_frame_rate,nb_read_frames','-show_entries','format=duration,size','-of','json',str(target)]))
 s=probe['streams'][0];assert (s['codec_name'],s['width'],s['height'],s['r_frame_rate'],s['nb_read_frames'])==('h264',1920,1080,'30/1','1500'),probe
 assert abs(float(probe['format']['duration'])-50)<.001,probe
 subprocess.run(['ffmpeg','-v','error','-i',str(target),'-f','null','-'],check=True)
 a,b=decoded_hashes(geo,600),decoded_hashes(target,600);assert a==b and len(a)==600
 audit=json.loads((out/f'audit-{lang.lower()}.json').read_text());assert len(audit)==900
 clipped=[]
 for f in audit:
  for t in f['visibleText']:
   if t['x']<0 or t['y']<0 or t['x']+t['w']>1920 or t['y']+t['h']>1080:clipped.append([f['frame'],t['id']])
 assert not clipped,clipped[:10]
 result['exports'][lang]={'path':str(target),'probe':probe,'decode':'Complete50second decode passed','first600_decoded_frames_identical_to_V3':True,'tail_text_bounds_checked':900,'clipped_text_frames':len(clipped)}
bad=[p for p,h in old.items() if hashlib.sha256(Path(p).read_bytes()).hexdigest()!=h];assert not bad,bad
result['preservation']={'old_assets_checked':len(old),'mismatches':bad}
(out/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps(result,ensure_ascii=False,indent=2))
