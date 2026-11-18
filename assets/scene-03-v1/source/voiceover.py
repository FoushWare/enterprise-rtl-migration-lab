# -*- coding: utf-8 -*-
"""Narration guides are editable and never synthetic speech."""
from pathlib import Path
import json,re
r=Path(__file__).resolve().parents[1];shots=json.loads((r/'timeline/shots.json').read_text())
ar=[
'دلوقتي نبص جوّه المشروع. قبل أي تعديل، لازم نعرف المكوّنات الرئيسية، ومين مسؤول عن كل جزء.',
'ده Nx monorepo: تطبيقين، ومكتبات مشتركة، وأدوات. هنفصل بين كود التطبيق، وكود العرض المشترك، وأدوات التحليل.',
'أول تطبيق هو Invoicing، لإدارة الفواتير وصفحات عرضها وتفاصيلها، وله نقطة بداية ومسارات خاصة بيه. والتاني Procurement، لإدارة طلبات الشراء وتفاصيلها، برضه له نقطة بداية ومسارات، والتطبيقين بيستخدموا مكتبات مشتركة.',
'ده App الحقيقي للفواتير. الـRouter بيحدد الصفحة، وApp يحتفظ ببيانات الفواتير ويمرّرها للصفحات اللي محتاجاها.',
'الـDesign System فيه الـShell والحقول والجداول والـDialog. عشان كده نفس المكوّن ممكن يؤثر على التطبيقين.',
'مكتبة shared فيها البيانات والـFixtures، وحساب المجموع وتنسيق المبلغ، والتخزين المحلي. ومنها كمان بنوصل للـLocale والترجمة.',
'الترجمة واتجاه المستند والـStyling حاجات مختلفة. في الـStudy، المستند RTL والـTheme لسه LTR. والأيقونات بتتراجع حسب معناها، مش انعكاس تلقائي.',
'الـScanner بيجمع أدلة ثابتة ومخاطر محتملة. والـCodemod بيخطط لتغييرات بشروط أمان؛ مش موافقة تلقائية على الإصلاح.',
'الخريطة دي من الـimports الفعلية، مش علاقات مفترضة. التطبيقين بيستخدموا Design System وshared. والأدوات بتحلل المصدر، مش اعتماد بين التطبيقين.',
'مثالنا الحقيقي: الفاتورة 1048 للعميل Northstar Studio، بقيمة أربعة آلاف وتمنمية دولار، وحالتها Pending. من الجدول بنفتح نفس بيانات التفاصيل.',
'المشكلة ممكن تبان في التطبيق، لكن قرارها يكون في مكوّن مشترك أو في الـRuntime. لازم نثبت السبب، مش نفترضه.',
'إزاي نكتشف مخاطر الـRTL وسط كل الكود ده؟']
en=[
'Let’s look under the hood. Before changing code, identify the main components and who owns each responsibility.',
'This Nx monorepo contains two applications, shared libraries, and tools. Separate application logic, shared presentation, and source analysis.',
'Invoicing manages invoices, with its own entry point, routes, list, and detail pages. Procurement manages purchase orders through its own entry and routes. Both applications use shared libraries.',
'This is the real Invoicing App. The router selects pages; App owns invoice state and passes it to the pages that need it.',
'The Design System supplies the shell, fields, tables, and dialogs. One shared component can therefore affect both applications.',
'Shared contains business types, fixtures, totals, money formatting, and local storage. It also exports the locale and translation interface.',
'Locale, document direction, styling, and icon meaning are separate. Study uses document RTL and MUI LTR; icons require semantic review, not automatic mirroring.',
'The Scanner collects static evidence and potential risks. The Codemod constrains changes through safety checks; a finding is not automatic repair approval.',
'These relationships come from actual imports. Both applications use Design System and Shared. Tools analyze source files; neither application imports the other.',
'Our real example is invoice1048: Northstar Studio, four thousand eight hundred US dollars, Pending. The actual table link opens the same invoice details.',
'A symptom may appear in an application while its owner is a shared component or runtime layer. Establish causality before changing code.',
'How do we find RTL risks across this codebase?']
def tm(t,srt=False):
 n=round(t*(1000 if srt else 100));b=1000 if srt else 100;return f'{n//(3600*b):02}:{n//(60*b)%60:02}:{n//b%60:02}{"," if srt else "."}{n%b:0{3 if srt else 2}}'
header='''[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0
ScaledBorderAndShadow: yes
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Guide,Arial,43,&H00FFFFFF,&H00FFFFFF,&H00121A26,&H50121A26,0,0,0,0,100,100,0,0,3,5,0,2,140,140,35,1
Style: GuideLeft,Arial,40,&H00FFFFFF,&H00FFFFFF,&H00121A26,&H50121A26,0,0,0,0,100,100,0,0,3,5,0,2,100,1260,100,1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
allvo={}
for lang,texts in [('AR',ar),('EN',en)]:
 events=[];srt=[];ass=header;md=[f'# Scene03 Voiceover {lang}','\nDraft – Pending Review. Natural-delivery estimates, not recorded word timings. No synthetic voice. Twelve-shot order preserved.','\n|Shot|Start–End|Estimated speech|Exact narration sentence|','|---|---|---|---|']
 for i,(s,text) in enumerate(zip(shots,texts)):
  a=s['start']+.3;b=s['end']-.3;estimate=len(text.split())/(2.5 if lang=='AR' else 2.7);assert estimate<=b-a,(lang,i,estimate,b-a)
  md.append(f'|{s["id"]}|{a:.2f}–{b:.2f}s|{estimate:.1f}s|{text}|')
  # Split only at sentence/phrase boundaries so guides stay mobile-readable.
  phases=[(a,b,text)]
  if i==2:
   pivot=' والتاني ' if lang=='AR' else ' Procurement '
   first,second=text.split(pivot,1)
   second=('والتاني ' if lang=='AR' else 'Procurement ')+second
   phases=[(20.3,27.2,first),(27.6,34.7,second)]
  planned=[]
  for pa,pb,part in phases:
   pieces=[p for p in re.split(r'(?<=[.،؛])\s+',part) if p];weight=sum(len(p.split()) for p in pieces);pt=pa
   for j,piece in enumerate(pieces):
    pe=pb if j==len(pieces)-1 else pt+(pb-pa)*len(piece.split())/weight
    planned.append((pt,pe,piece));pt=pe
  for t,end,p in planned:
   cap=p
   if lang=='AR':cap='\u202b'+re.sub(r'([A-Za-z][A-Za-z0-9-]*)',lambda m:'\u202a'+m[0]+'\u202c',p)+'\u202c'
   style='GuideLeft' if i==5 else 'Guide'
   pos=r'{\an8\pos(960,760)}' if i==7 else ''
   ass+=f'Dialogue: 0,{tm(t)},{tm(end)},{style},,0,0,0,,{pos}{cap}\n';srt.extend([str(len(events)+1),f'{tm(t,True)} --> {tm(end,True)}',p,'']);events.append({'start':t,'end':end,'text':p,'shot':s['id'],'estimated_only':True});t=end
 (r/f'timeline/guide-{lang}.ass').write_text(ass);(r/f'outputs/Scene-03_Voiceover_{lang}.md').write_text('\n'.join(md));(r/f'outputs/Scene-03_Voiceover_{lang}.srt').write_text('\n'.join(srt));allvo[lang]=events
(r/'timeline/voiceover.json').write_text(json.dumps(allvo,ensure_ascii=False,indent=2))
print('Estimated narration timing fits all12 shots; guides remain separate from picture labels.')
