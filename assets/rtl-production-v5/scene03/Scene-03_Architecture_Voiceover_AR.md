# Scene03 Architecture Voiceover AR
**Draft – Pending Review.** Preparation only. Proposed narration/timings require review and final alignment to the presenter recording. No Scene03 footage, scanner execution or fixes produced.


No synthetic voice. These are proposed educational sentences, not claims that Scene03 footage already exists. Exact word alignment awaits the presenter recording.

|Shot|Start–end|Estimated spoken duration|Exact proposed sentence|
|---|---|---|---|
|01|0–10s|8.0s at natural delivery|قبل ما نصلّح، لازم نعرف كل جزء مسؤول عن إيه. نفس مشكلة المحاذاة ظهرت في تطبيقين، فهنبدأ من الحاجات المشتركة.|
|02|10–24s|8.0s at natural delivery|ده Nx monorepo: تطبيق للفواتير وتطبيق للمشتريات، ومعاهم مكتبات وأدوات. أوامر التشغيل بتختار المشروع؛ Nx بينظم المهام، مش بيحسب الفواتير.|
|03|24–36s|9.6s at natural delivery|الـimports بتوضح إن التطبيقين بيستخدموا design-system وshared. لو Nx graph ما أظهرش العلاقة، ده مش معناه إنها مش موجودة. الخريطة دي مبنية على الكود.|
|04|36–50s|9.2s at natural delivery|الـdesign-system مسؤول عن الـShell والحقول والجداول والـDialog. shared فيها البيانات وحساب المجموع واللغة. هنغيّر طريقة العرض بعدين، من غير ما نغيّر معنى البيانات.|
|05|50–66s|9.2s at natural delivery|نقطة البداية main.tsx. الـProvider برّه الـRouter والـLocaleProvider. في نسخة الـStudy دي، الـProvider بيختار LTR theme ثابت؛ وجود rtlTheme لوحده مش معناه إنه مستخدم.|
|06|66–86s|9.6s at natural delivery|لما نختار العربي، setLanguage بيغيّر الـquery عن طريق الـRouter. LocaleProvider يختار الترجمة ويضبط lang وdir على المستند. لكن ده مش بيغيّر حالة الفاتورة المخزّنة.|
|07|86–106s|11.2s at natural delivery|هنا الفرق: المستند RTL، لكن MUI لسه LTR. وفيه Emotion styled وCSS قديم بمسافات ثابتة. تغيير اللغة وحده مش بيوحّد الطبقات دي؛ لازم نفهم مين بيملك كل قرار.|
|08|106–122s|10.4s at natural delivery|الفاتورة 1048 جاية من seedInvoices لو مفيش بيانات محفوظة. mockApi يقراها، App يحتفظ بيها، والـTable والـDetails يعرضوها. total يحسب 4800، وmoney ينسّقها؛ العربي ما يغيّرش القيمة.|
|09|122–132s|8.4s at natural delivery|دلوقتي عرفنا حدود النظام. في المشهد الجاي هنشغّل الـScanner مع بعض، ونفرّق بين Evidence وFinding وعيب شفناه فعلًا، قبل أي تعديل.|