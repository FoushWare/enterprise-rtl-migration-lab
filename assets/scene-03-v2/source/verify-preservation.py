"""Verify protected Study bytes and historical renders after production."""
from pathlib import Path
import json,hashlib,subprocess,re
r=Path(__file__).resolve().parents[1];s=r.parents[2]/'enterprise-rtl-migration-lab-study'
def git(*a):return subprocess.check_output(['git',*a],cwd=s).decode()
b=json.loads((r/'evidence/before.json').read_text());assert b['head']==git('rev-parse','HEAD').strip();assert b['branch']==git('branch','--show-current').strip();assert b['status']==git('status','--porcelain')
for p,h in b['hashes'].items():assert hashlib.sha256((s/p).read_bytes()).hexdigest()==h,p
hist=json.loads((r/'evidence/historical-hashes.json').read_text())
for p,h in hist.items():assert hashlib.sha256(Path(p).read_bytes()).hexdigest()==h,p
checks=json.loads((r/'evidence/media-verification.json').read_text());assert len(checks)==8 and all(x['decode']=='PASS' for x in checks)
for lang in ['ar','en']:
 a=json.loads((r/f'outputs/audit-{lang}.json').read_text());assert len(a)==3900;assert len(set(x['shot'] for x in a))==12;assert not any(x['visibleCode'] for x in a)
# Coded slice hashes prove no picture recompression; concat can add H.264 parameter sets to packets.
cache={}
def hashes(p):
 p=str(p)
 if p in cache:return cache[p]
 data=subprocess.check_output(['ffmpeg','-v','error','-i',p,'-map','0:v:0','-an','-c:v','copy','-bsf:v','h264_mp4toannexb','-f','h264','-'])
 result=[hashlib.sha256(n).hexdigest() for n in re.split(b'\x00\x00\x00?\x01',data) if n and n[0]&31 in [1,5]]
 cache[p]=result
 return result
manifest=json.loads((r/'master/timeline.json').read_text());packet_checks=[]
for v in manifest['variants']:
 actual=hashes(v['output']);sources=[hashes(p) for p in v['sources']];expected=sum(sources,[]);assert actual==expected,v['output'];packet_checks.append({'master':v['output'],'scene_coded_slice_counts':list(map(len,sources)),'all_coded_slice_payloads_identical':True})
proof={'head':b['head'],'branch':b['branch'],'tracked_source_files_unchanged':len(b['hashes']),'historical_mp4_files_unchanged':len(hist),'git_status_unchanged':True,'new_source_changes':0,'new_commits':0,'picture_preservation':packet_checks}
(r/'evidence/preservation.json').write_text(json.dumps(proof,indent=2))
qa=['# Scene03 V2 — QA Report','\nDraft – Pending Review. Verified 2026-10-29.','\n## Media validation','All eight scene/master deliveries passed full FFmpeg video/audio decode. Scene03:130.000s/3900frames. Master:314.000s/9420frames. 1920×1080,30fps,H.264,AAC48k stereo.','\n|Delivery|Duration|Frames|Audio peak dBFS|Decode|','|---|---|---|---|---|']
for x in checks:qa.append(f'|{Path(x["file"]).name}|{x["duration"]}|{x["frames"]}|{x["audio_peak_dbfs"]}|{x["decode"]}|')
qa+=['\n## Visual review','Representative encoded Preview frames from all12 shots in both languages reviewed, including both genuine application clips. Contacts and full-resolution frames are under evidence/final/. Arabic shaping and mixed technical terms checked in rendered guides. Main labels use30–100px typography, mostly34px or larger; long pill labels fit their boxes automatically. At small mobile sizes secondary provenance notes and source UI details still require fullscreen playback.','\nNo editor or terminal is a visual input to Scene03 V2. All3900 frame records per language cover exactly12 shots. This frame audit is composition metadata, supplemented by representative visual inspection; it is not OCR of every frame. Historical Scenes01/02 retain their original approved contents.','\nMotion includes eased entrances/exits, continuous camera drift, flowing connection pulses, sequential layer reveals and a scan beam. No synthetic narration. Audio peak remains below−18dBFS; original separate stems and frame-addressed cues are editable.','\n## Architecture integrity','Blue Invoicing; teal Procurement; purple Design System; amber Shared; cyan runtime; magenta Scanner; pink Codemod. No app-to-app import link. Tooling outside runtime boundary. Dialog usage qualified to Invoicing. Runtime diagram is conceptual; document RTL and fixed MUI LTR are verified current Study states. Invoice1048 uses Northstar Studio/$4800/Pending, not storyboard placeholder data.','\n## Non-destructive assembly',f'All{len(b["hashes"])} tracked Study files, HEAD, branch and pre-existing status remain identical. All{len(hist)} historical MP4s retain SHA256. Master V3 uses independently exported Scenes01V5 →02V5 →03V2 at0/50/184s. All H.264 coded picture slice payloads match the corresponding source scenes exactly. Picture assembly uses stream-copy; H.264 parameter-set insertion during concat can change packet hashes without changing pixels. Original scene PCM mixes concatenated and AAC-encoded once.','\n## Remaining review items','Presenter is an isolated original vector silhouette awaiting replacement. Narration/phrase times are estimates pending real voice recording; no word-level timing claim. Genuine browser excerpts are reused recordings, not a fresh live run; recorded UI language is preserved in both editions. Detailed runtime footage is intentionally secondary to architectural explanation. Creative approval and real-device mobile readability remain human review steps. Scene03 source is full-range H.264 while earlier scenes are limited-range; generic raw-frame hashes can differ through decoder output conversion. Coded slice preservation passes for all masters; final color review in the intended player is recommended. No fresh scanner/build/test/CI claims. No hands-on Scanner scene started.']
(r/'outputs/Scene-03_QA_Report.md').write_text('\n'.join(qa))
(r/'master/Master-Video-Scene-Manifest.md').write_text('# Master V3 — Draft – Pending Review\n\n|Scene|Time|Source|\n|---|---|---|\n|01|0–50s|Scene01 V5 independent exports|\n|02|50–184s|Scene02 V5 independent exports|\n|03|184–314s|Scene03 V2 independent exports|\n\nPicture stream-copy verified by coded slice hashes against all three source scenes. Audio original PCM concatenation, encoded once. Earlier masters preserved. Full absolute inputs in timeline.json.\n')
print(json.dumps(proof,indent=2))
