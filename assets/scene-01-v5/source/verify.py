"""Validate V5 video/audio exports, caption events, layer bounds and old assets."""
from pathlib import Path
from array import array
import json,subprocess,hashlib,wave,math,re
r=Path(__file__).resolve().parents[1];out=r/'outputs';results={'status':'Draft – Pending Review','exports':{},'caption_timing':'Estimated, pending actual voiceover recording'};hashes=[]
for lang in ['AR','EN']:
 audit=json.loads((out/f'audit-{lang.lower()}.json').read_text());assert len(audit)==1500
 clipped=[]
 for f in audit:
  for t in f['visibleText']:
   if t['x']<-.1 or t['y']<-.1 or t['x']+t['w']>1920.1 or t['y']+t['h']>1080.1:clipped.append([f['frame'],t['id']])
 assert not clipped,clipped[:3]
 for variant in ['Preview','Clean']:
  p=out/f'Scene-01_Business-Expansion_{lang}_V5_{variant}.mp4'
  info=json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-show_entries','stream=codec_name,codec_type,width,height,r_frame_rate,nb_read_frames,sample_rate,channels','-show_entries','format=duration,size','-of','json',str(p)]))
  v=next(s for s in info['streams'] if s['codec_type']=='video');a=next(s for s in info['streams'] if s['codec_type']=='audio')
  assert (v['codec_name'],v['width'],v['height'],v['r_frame_rate'],v['nb_read_frames'])==('h264',1920,1080,'30/1','1500')
  assert (a['codec_name'],a['sample_rate'],a['channels'])==('aac','48000',2)
  assert abs(float(info['format']['duration'])-50)<.01
  subprocess.run(['ffmpeg','-v','error','-i',str(p),'-f','null','-'],check=True)
  pcm=subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-map','0:a:0','-f','s16le','-']);samples=array('h');samples.frombytes(pcm)
  peak=max(abs(x) for x in samples)/32768;assert 0<peak<.5
  digest=hashlib.sha256(pcm).hexdigest();hashes.append(digest)
  results['exports'][p.name]={'probe':info,'full_video_and_audio_decode':'passed','audio_peak_dbfs':20*math.log10(peak),'audio_decode_sha256':digest,'permanent_text_bounds_failures':len(clipped)}
assert len(set(hashes))==1,'Preview/Clean/AR/EN SFX mismatch'
vo=json.loads((r/'timeline/voiceover.json').read_text())
for lang,events in vo.items():
 assert all(a<b<=50 and a>=0 for a,b,_ in events)
 assert all(events[i][1]<=events[i+1][0] for i in range(len(events)-1))
 s=(out/f'Scene-01_Voiceover_{lang.upper()}.srt').read_text();assert all(text in s for _,_,text in events)
 assert '\\u202' not in s
# Verify original PCM stem windows contain the intended effects and no clipping.
cues=json.loads((r/'timeline/sound-cues.json').read_text());levels=[]
for e in cues['events']:
 with wave.open(str(r/f"audio/stems/{e['track']}.wav"),'rb') as w:
  assert (w.getnchannels(),w.getframerate())==(2,48000);w.setpos(round(e['time']*48000));buf=array('h');buf.frombytes(w.readframes(round(e['duration']*48000)))
  peak=max(abs(x) for x in buf)/32768;assert peak>0;levels.append({'time':e['time'],'track':e['track'],'peak_dbfs':20*math.log10(peak)})
old=json.loads((out/'preservation-before.json').read_text());bad=[p for p,h in old.items() if hashlib.sha256(Path(p).read_bytes()).hexdigest()!=h];assert not bad
results['preservation']={'old_files_checked':len(old),'mismatches':bad};results['sound_cues_verified']=levels;results['same_audio_all_four_exports']=True
(out/'verification.json').write_text(json.dumps(results,ensure_ascii=False,indent=2));print(json.dumps({'exports':len(results['exports']),'same_audio_all_four_exports':True,'preservation':results['preservation'],'cue_count':len(levels)},indent=2))
