import json,pathlib
r=pathlib.Path(__file__).resolve().parents[1];s=json.loads((r/'source/timing.json').read_text());t=0;out=['# Egyptian Arabic narration and storyboard','', 'Timing follows measured TTS segments; total 59.664 seconds.','']
visuals=['Real detection.test.ts recording + readable formatted fixture; progressively identify direction expression.','Real rules.ts recording + selected source checks; expand direction → CallExpression → not StringLiteral.','Show explicit diagnostics.push excerpt; animate blocking Diagnostic as a data record.','Separate add() excerpt and separately reveal Finding; retain Diagnostic alongside it.','Show verified invocation summary; route both records separately toward conceptual Report.']
for i,x in enumerate(s):out += [f'## {i+1}. {x["title"]} — {t:.3f}–{t+x["duration"]:.3f}s',x['text'],'',visuals[i],''];t+=x['duration']
(r/'STORYBOARD-AND-NARRATION.md').write_text('\n'.join(out))
