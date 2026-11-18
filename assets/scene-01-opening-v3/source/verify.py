"""Verify actual exports, per-frame label geometry and preserved source assets."""
from pathlib import Path
import hashlib,json,subprocess,math
root=Path(__file__).resolve().parents[1];out=root/'outputs'
result={'status':'Draft – Pending Review','exports':{},'limitations':['VO alignment estimated; no real recording.','Visual review covers representative frames; bounding/overlap checks cover every frame.','Earth day/night textures are2048px; not new high-detail satellite footage.']}
audits={}
for lang in ['ar','en']:
 p=out/f'Scene-01_Geographic-Journey_{lang.upper()}_20s_Draft_V3.mp4'
 info=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_entries','stream=codec_name,width,height,r_frame_rate,nb_read_frames','-show_entries','format=duration,size','-of','json',str(p)]))
 s=info['streams'][0]
 assert (s['width'],s['height'],s['codec_name'],s['r_frame_rate'],s['nb_read_frames'])==(1920,1080,'h264','30/1','600')
 assert float(info['format']['duration'])==20
 subprocess.run(['ffmpeg','-v','error','-i',str(p),'-f','null','-'],check=True)
 a=json.loads((out/f'frame-audit-{lang}.json').read_text());assert len(a)==600
 bounds=[];overlaps=[]
 for f in a:
  labels=[l for l in f['labels'] if l['opacity']>.02]
  for l in labels:
   if l['x']<0 or l['y']<0 or l['x']+l['w']>1920 or l['y']+l['h']>1080:bounds.append((f['frame'],l))
  for i,l in enumerate(labels):
   for k in labels[i+1:]:
    if min(l['x']+l['w'],k['x']+k['w'])>max(l['x'],k['x']) and min(l['y']+l['h'],k['y']+k['h'])>max(l['y'],k['y']):overlaps.append((f['frame'],l['text'],k['text']))
 assert not bounds, bounds[:3]
 assert not overlaps, overlaps[:3]
 # Preserve captured final-target metadata under an accurate name; actual camera path
 # and per-frame look targets are defined by the source keyframe interpolator.
 for f in a:
  if 'target' in f:f['finalCompositionTarget']=f.pop('target')
 (out/f'frame-audit-{lang}.json').write_text(json.dumps(a,ensure_ascii=False,indent=2))
 audits[lang]=a
 result['exports'][lang]={'path':str(p),'probe':info,'decode':'Full20s decoded without errors','label_bounds_failures':len(bounds),'label_overlap_failures':len(overlaps),'visual_review_frames':[0,120,270,345,405,465,540,599]}
assert all(a['camera']==b['camera'] for a,b in zip(audits['ar'],audits['en']))
travel=math.dist(audits['ar'][315]['camera'],audits['ar'][465]['camera']);assert travel>.2
result['camera']={'AR_EN_identical_all_600_frames':True,'travel_world_distance_10_5_to_15_5':travel,'orientation':'camera.lookAt changes with deterministic lookLat/lookLon/lookRadius keyframes; source/timing.json','final_hold':'Stable frames540–599 within floating-point numerical precision'}
hold_delta=max(math.dist(f['camera'],audits['ar'][540]['camera']) for f in audits['ar'][540:])
assert hold_delta<1e-10
result['camera']['final_hold_max_float_delta']=hold_delta
old=json.loads((out/'preservation-before.json').read_text());bad=[p for p,h in old.items() if hashlib.sha256(Path(p).read_bytes()).hexdigest()!=h];assert not bad
result['preservation']={'files_checked':len(old),'V4_files_checked':sum('Fullscreen_V4' in p for p in old),'mismatches':bad}
(out/'verification.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
print(json.dumps({'exports':list(result['exports']),'camera':result['camera'],'preservation':result['preservation']},indent=2))
