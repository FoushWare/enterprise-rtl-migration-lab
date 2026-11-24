import { describe, expect, it } from 'vitest';
import { PreviewSupersession } from '../src/preview-supersession.js';

describe('latest-selection-wins preview gate', () => {
  it('keeps only the most recent request for a workflow current', () => {
    const gate = new PreviewSupersession();
    const first = gate.begin('wf');
    const second = gate.begin('wf');
    const third = gate.begin('wf');
    expect(gate.isCurrent('wf', first)).toBe(false);
    expect(gate.isCurrent('wf', second)).toBe(false);
    expect(gate.isCurrent('wf', third)).toBe(true);
  });

  it('keeps workflows independent', () => {
    const gate = new PreviewSupersession();
    const a = gate.begin('a');
    const b = gate.begin('b');
    expect(gate.isCurrent('a', a)).toBe(true);
    expect(gate.isCurrent('b', b)).toBe(true);
  });

  it('treats a forgotten workflow as having no current request', () => {
    const gate = new PreviewSupersession();
    const seq = gate.begin('wf');
    gate.forget('wf');
    expect(gate.isCurrent('wf', seq)).toBe(false);
  });

  it('simulates eight rapid selections: only the last queued request runs', () => {
    const gate = new PreviewSupersession();
    const queued = Array.from({ length: 8 }, () => gate.begin('wf'));
    const executed = queued.filter(seq => gate.isCurrent('wf', seq));
    expect(executed).toEqual([queued[7]]);
  });
});
