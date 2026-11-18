# Egyptian Arabic narration and storyboard

Timing follows measured TTS segments; total 59.664 seconds.

## 1. السؤال — 0.000–8.448s
إزاي السكانر يعرف اتجاه الصفحة، لو القيمة جاية من فانكشن؟ المثال ده موجود فعلًا في اختبارات المشروع.

Real detection.test.ts recording + readable formatted fixture; progressively identify direction expression.

## 2. تحليل الكود — 8.448–20.400s
جوه ديتكت، الكود بيتحلل كشجرة إيه إس تي. جِت دايركشن هنا، كول إكسبريشن، مش نص ثابت. والسكانر ما بيشغّلش الفانكشن.

Real rules.ts recording + selected source checks; expand direction → CallExpression → not StringLiteral.

## 3. Diagnostic — 20.400–32.016s
عشان كده، بيسجّل دايجنوستك: القيمة مش محسومة بالتحليل الساكن. وبيعلّمها بلوكينج، عشان التقرير ما يدّعيش إن التحليل كامل.

Show explicit diagnostics.push excerpt; animate blocking Diagnostic as a data record.

## 4. Finding — 32.016–45.744s
وبنداء منفصل، بيضيف فايندنج، من نوع ران تايم كونفيج. المطلوب مراجعة تزامن اتجاه الصفحة، والثيم، والكاش. مش تحويل تلقائي للكود.

Separate add() excerpt and separately reveal Finding; retain Diagnostic alongside it.

## 5. الخلاصة — 45.744–59.664s
الاتنين ناتجين من نفس التحليل، بس كل واحد له وظيفة. الدايجنوستك بيوضّح حدود المعرفة. والفايندنج بيوضّح إيه اللي محتاج مراجعة. الاتنين بيظهروا في التقرير.

Show verified invocation summary; route both records separately toward conceptual Report.
