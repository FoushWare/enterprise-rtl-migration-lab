"""Read actual source into clearly labeled excerpts and a non-destructive scene EDL."""
from pathlib import Path
import json,hashlib
r=Path(__file__).resolve().parents[1];s=Path('/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study');media=s/'study/demo/videos'
spans=[(0,10),(10,20),(20,35),(35,45),(45,55),(55,65),(65,75),(75,85),(85,100),(100,115),(115,125),(125,130)]
shots=[]
for i,(a,b) in enumerate(spans):shots.append({'id':f'03-{i+1:02}','start':a,'end':b,'frames':(b-a)*30})
def excerpt(p,a,b):
 lines=(s/p).read_text().splitlines();return {'path':p,'start':a,'end':b,'lines':[f'{i+1:>3}  '+lines[i] for i in range(a-1,b)],'sha256':hashlib.sha256((s/p).read_bytes()).hexdigest()}
x={'design':excerpt('libs/design-system/src/index.tsx',166,184),'shared':excerpt('libs/shared/src/index.ts',128,141),'runtime':excerpt('libs/design-system/src/runtime.tsx',77,84),'locale':excerpt('libs/shared/src/i18n.tsx',45,53),'app':excerpt('apps/invoicing/src/App.tsx',18,26),'main':excerpt('apps/invoicing/src/main.tsx',8,18)}
(r/'source/excerpts.json').write_text(json.dumps(x,indent=2));(r/'timeline/shots.json').write_text(json.dumps(shots,indent=2))
# Actual recordings, never a fabricated IDE. Unrecorded source material is explicitly an editorial excerpt.
raw=[{'start':0,'duration':10,'source':str(r/'media/VSCode_Architecture_Original.mov'),'in':0,'crop':[3330,1872,0,30]},
 {'start':10,'duration':10,'source':None},
 {'start':20,'duration':7.5,'source':str(media/'fullscreen-v4/originals/Invoicing_EN.mov'),'in':25,'crop':[2944,1656,112,238]},
 {'start':27.5,'duration':7.5,'source':str(media/'expanded-v1/originals/Procurement_EN.mov'),'in':20,'crop':[2944,1656,112,238]},
 {'start':35,'duration':10,'source':str(r/'media/VSCode_Architecture_Original.mov'),'in':2,'crop':[2330,1310,930,170]},
 {'start':45,'duration':55,'source':None},
 {'start':100,'duration':15,'source':str(media/'fullscreen-v4/originals/Invoice_1048_Arrow_Action.mov'),'in':48,'crop':[2944,1656,112,238]},
 {'start':115,'duration':15,'source':None}]
(r/'timeline/base.json').write_text(json.dumps(raw,indent=2));print('Actual source excerpts and EDL prepared.')
