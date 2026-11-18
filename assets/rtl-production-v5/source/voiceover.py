"""Keep estimated narration timing and removable guide captions separate from defect labels."""
from pathlib import Path
import json,re
r=Path(__file__).resolve().parents[1];shots=json.loads((r/'scene02/timeline.json').read_text())['shots']
ar=['دي نسخة الـStudy. بنشغّل التطبيق الحقيقي من الـTerminal.','الواجهة شغّالة بالإنجليزي. نبدّل للعربي من نفس اختيار اللغة.','العربي اتفعّل، لكن الـSidebar فضل على الشمال.','الـLogo بالإنجليزي.','بالعربي، تركيب الـLogo اتقلب والنقطة اتحركت قبل الاسم.','هنا أيقونة الـKPI داخلة على عنوان الكارت.','ترتيب الشهور انعكس، لكن مسار الرسم نفسه ما اتغيرش.','سهم التفاصيل بالإنجليزي.','السهم اتحرك للشمال، لكنه لسه بيشاور لليمين.','الفاتورة بتتفتح صح؛ المشكلة اتجاه السهم.','الصفحات بتتغيّر صح، لكن سهم التالي مش متوافق مع ترتيبها بالعربي.','نفتح نموذج إنشاء فاتورة الحقيقي.','عناوين الحقول لسه متظبطة على الشمال، رغم إن الواجهة عربي.','ودي بيانات العملاء التجريبية.','جوه الـDialog، زرار القفل داخل على عنوان العميل.','نفس العنوان الإنجليزي، لكن رقم أربعة وعشرين ظهر في آخره.','نروح للمشتريات، ونبدّل اللغة من الاختيار الحقيقي.','عناوين الجدول العربي لسه على الشمال جوه الأعمدة.','ونفس مشكلة المحاذاة ظاهرة في عنوان فلتر الحالة.','البيانات ثابتة. الجاي نفهم طبقات الكود.']
en=['This is the Study workspace, running the real application from its terminal.','The English interface works. Switch to Arabic through its actual language selector.','Arabic is active, but the sidebar remains on the left.','The English logo.','Arabic reverses the logo composition and moves its dot before the name.','The KPI icon occupies the Arabic heading’s space.','The month labels reverse, but the plotted line remains unchanged.','The English detail arrow.','The control moves left in Arabic, but its arrow still points right.','Navigation works. The icon direction is wrong.','Pagination changes records correctly, but Next contradicts the Arabic page order.','Open the real invoice creation form.','Arabic field labels retain their left positioning. The form has not acquired RTL styling.','These are fictional customer fixtures.','The close button overlaps the customer dialog title.','The stored English address is unchanged, but its leading number appears at the end.','Move to Procurement and use its actual language selector.','Arabic table headings remain left-aligned inside their columns.','The floating Status label has the same alignment problem.','Data remains intact. Next, trace responsibility through the code.']
def stamp(t,srt=False):
 n=round(t*(1000 if srt else 100));base=1000 if srt else 100
 return f'{n//(3600*base):02}:{n//(60*base)%60:02}:{n//base%60:02}{"," if srt else "."}{n%base:0{3 if srt else 2}}'
header='''[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0
ScaledBorderAndShadow: yes
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Guide,Arial,42,&H00FFFFFF,&H00FFFFFF,&H00121A26,&H50121A26,0,0,0,0,100,100,0,0,3,5,0,2,180,180,35,1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
allvo={}
for lang,lines in [('AR',ar),('EN',en)]:
 events=[];srt=[];ass=header;md=[f'# Scene02 Voiceover {lang}','\nDraft – Pending Review. Estimated natural-delivery timing; no voice generated. Record real voice before word-level alignment. Captions are editable; defect labels are a separate picture layer.','\n| Start–End | Estimated speech / allotted | Exact guide sentence |','|---|---|---|']
 for i,(s,text) in enumerate(zip(shots,lines)):
  a=s['timeline_start']+.25;b=s['timeline_start']+s['duration']-.25;est=round(len(text.split())/(2.5 if lang=='AR' else 2.7),1)
  # A single caption line has a compact box, not a permanent caption band.
  cap=text
  if lang=='AR':cap='\u202b'+re.sub(r'(Study|Terminal|Sidebar|Logo|KPI|Dialog|RTL|Next)',lambda m:'\u202a'+m[0]+'\u202c',cap)+'\u202c'
  # Keep narration above the lower chart/pagination labels; all other shots use the bottom.
  position=r'{\an8\pos(1120,120)}' if i in [6,10] else ''
  ass+=f'Dialogue: 0,{stamp(a)},{stamp(b)},Guide,,0,0,0,,{position}{cap}\n'
  srt+=[str(i+1),f'{stamp(a,True)} --> {stamp(b,True)}',text,''];events.append({'start':a,'end':b,'estimated_spoken_duration':est,'text':text,'position':position,'shot':i})
  md.append(f'|{a:.2f}–{b:.2f}s|{est:.1f}s / {b-a:.1f}s|{text}|')
 (r/f'scene02/Scene-02_Voiceover_{lang}.md').write_text('\n'.join(md));(r/f'scene02/Scene-02_Voiceover_{lang}.srt').write_text('\n'.join(srt));(r/f'scene02/guide-{lang}.ass').write_text(ass);allvo[lang]=events
(r/'scene02/voiceover.json').write_text(json.dumps(allvo,ensure_ascii=False,indent=2));print('Voiceover guides prepared; estimates, not recorded speech.')
