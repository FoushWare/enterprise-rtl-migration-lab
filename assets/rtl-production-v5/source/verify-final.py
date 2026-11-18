"""Verify delivery media and preservation using real decode and content hashes."""
from pathlib import Path
import json,subprocess,hashlib,concurrent.futures,math,array
r=Path(__file__).resolve().parents[1];study=Path('/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study');out={}
def digest(p):
 h=hashlib.sha256()
 with open(p,'rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
files=list((r/'scene02/outputs').glob('Scene-02*.mp4'))+list((r/'master/outputs').glob('*.mp4'))
def verify(p):
 d=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(p)]));v=next(s for s in d['streams'] if s['codec_type']=='video');a=next(s for s in d['streams'] if s['codec_type']=='audio');dur=184 if 'Master' in p.name else 134;assert int(v['nb_frames'])==dur*30,(p,v);assert (v['width'],v['height'],v['r_frame_rate'],v['codec_name'])==(1920,1080,'30/1','h264');assert abs(float(d['format']['duration'])-dur)<.08,(p,d['format']['duration']);assert a['codec_name']=='aac' and a['sample_rate']=='48000'
 result=subprocess.run(['ffmpeg','-v','error','-threads','2','-i',str(p),'-map','0:v','-map','0:a','-f','null','-'],capture_output=True);assert result.returncode==0 and not result.stderr,(p,result.stderr.decode())
 pcm=subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-map','0:a','-f','s16le','-ac','2','-ar','48000','-']);samples=array.array('h');samples.frombytes(pcm);peak=max(abs(x) for x in samples)/32768;assert peak>0 and peak<.25
 return {'file':str(p),'duration':d['format']['duration'],'frames':v['nb_frames'],'fps':v['r_frame_rate'],'resolution':[1920,1080],'video':'H.264','audio':'AAC stereo48k','audio_peak_dbfs':round(20*math.log10(peak),2),'audio_pcm_sha256':hashlib.sha256(pcm).hexdigest(),'full_decode':'PASS'}
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as p:out['media']=list(p.map(verify,files))
for group in ['scene02','master']:
 audio={x['audio_pcm_sha256'] for x in out['media'] if ('Master' in x['file'])==(group=='master')};assert len(audio)==1,(group,audio)
out['audio_consistency']='All AR/EN Clean/Preview decoded audio identical within each delivery group.'
before=json.loads((r/'audit/study-before.json').read_text());after={k:subprocess.check_output(['git','-C',str(study),*v]).decode() for k,v in {'head':['rev-parse','HEAD'],'branch':['branch','--show-current'],'status':['status','--porcelain=v1'],'diff':['diff','--binary'],'staged':['diff','--cached','--binary']}.items()}
assert all(before[k]==v for k,v in after.items()),'Study Git state changed';bad=[p for p,h in before['tracked_hashes'].items() if not (study/p).is_file() or digest(study/p)!=h];assert not bad,bad
old=json.loads((r/'audit/preserved-media.json').read_text());assert all(digest(p)==h for p,h in old.items()),'Historical media changed'
out['preservation']={'study_git_state':'identical before/after','tracked_files_hashed':len(before['tracked_hashes']),'historical_media_hashed':len(old),'source_changes':0,'commits_pushes':0};(r/'verification.json').write_text(json.dumps(out,indent=2));print(json.dumps(out,indent=2))
