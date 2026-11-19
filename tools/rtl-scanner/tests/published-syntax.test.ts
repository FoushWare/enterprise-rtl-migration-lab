import { describe, expect, it } from 'vitest';
import { extractHtml } from '../src/html.js';
import { extractTypescript } from '../src/typescript.js';
import { extractScss } from '../src/css.js';
import { detect } from '../src/rules.js';
import type { Policy } from '../src/policy.js';

const policy = { ownership: {}, approvals: [], exceptions: [], issueBindings: [], roles: [] } as unknown as Policy;
describe('published 0.2 CLI syntax compatibility', () => {
  it('detects HTML utility classes without making a utility repair available', () => {
    const text = '<!doctype html><html><body><div class="ml-4 float-sm-right border-left-0"></div></body></html>';
    const parsed = extractHtml('index.html', text);
    const findings = detect(parsed.evidence, new Map([['index.html', text]]), policy, []);
    expect(findings.map(f => f.ruleId)).toEqual(Array(3).fill('RTL.UTILITY.PHYSICAL'));
    expect(findings.every(f => f.ownership === 'utility-compiler' && f.suggestion === null)).toBe(true);
  });
  it('retains React.createElement, Emotion css and MUI styled static evidence', () => {
    const text = `import {css} from '@emotion/react';import {styled} from '@mui/material/styles';
      const Card=styled('div')\`margin-left: 12px;\`;
      const X=()=> <div css={css\`padding-right: 8px;\`}/>;
      React.createElement('div',{style:{textAlign:'left'}});`;
    const result = extractTypescript('component.jsx', text);
    expect(result.diagnostics).toEqual([]);
    expect(result.evidence.map(e => e.property)).toEqual(['margin-left', 'padding-right', 'textAlign']);
  });
  it('retains bounded static SCSS detection and reports unresolved imports', () => {
    expect(extractScss('style.scss', '.card { margin-left: 12px; }').evidence.map(e => e.property)).toEqual(['margin-left']);
    const result = extractScss('style.scss', '@use "theme"; .card { margin-left: 12px; }');
    expect(result.diagnostics.some(d => d.code === 'SOURCE_COVERAGE')).toBe(true);
  });
});
