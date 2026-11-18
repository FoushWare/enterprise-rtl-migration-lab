"""Ignore container/SPS packaging and verify unchanged H.264 coded slice payloads."""
from pathlib import Path
import subprocess,json,re,hashlib
r=Path(__file__).resolve().parents[1];m=json.loads((r/'master/timeline.json').read_text());cache={};out=[]
def slices(p):
 if p not in cache:
  b=subprocess.check_output(['ffmpeg','-v','error','-i',p,'-map','0:v','-an','-c:v','copy','-bsf:v','h264_mp4toannexb','-f','h264','-'])
  cache[p]=[hashlib.sha256(n).hexdigest() for n in re.split(b'\x00\x00\x00?\x01',b) if n and n[0]&31 in [1,5]]
 return cache[p]
for v in m['variants']:
 ss=[slices(p) for p in v['sources']];assert slices(v['output'])==sum(ss,[])
 out.append({'file':v['output'],'coded_slice_payloads_identical':True,'source_slice_counts':list(map(len,ss))})
(r/'evidence/bitstream-preservation.json').write_text(json.dumps(out,indent=2));print('All four masters preserve original coded slice payloads.')
