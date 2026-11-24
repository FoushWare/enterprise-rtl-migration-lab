import { describe, expect, it } from 'vitest';
import { range } from '../src/model.js';

// Reference implementation: the original definition, kept here to prove the indexed version is identical.
function referenceRange(text: string, start: number, end: number) {
  const point = (offset: number) => { const lines = text.slice(0, offset).split(/\r\n|\r|\n/); return { offset, line: lines.length, column: lines.at(-1)!.length + 1 }; };
  return { start: point(start), end: point(end) };
}

// Deterministic pseudo-random generator so failures are reproducible.
function generator(seed: number) { let state = seed >>> 0; return () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; }; }

describe('indexed source ranges match the original line/column definition', () => {
  it('agrees with the reference for random texts, including CR, LF, CRLF and out-of-range offsets', () => {
    const random = generator(20260625);
    const alphabet = ['a', 'b', ' ', '\r', '\n', '\r\n', 'é', '😀'];
    for (let round = 0; round < 400; round++) {
      let text = '';
      const length = Math.floor(random() * 60);
      for (let i = 0; i < length; i++) text += alphabet[Math.floor(random() * alphabet.length)];
      for (let probe = 0; probe < 25; probe++) {
        const a = Math.floor(random() * (text.length + 4)) - 2;
        const b = Math.floor(random() * (text.length + 4)) - 2;
        expect(range(text, a, b)).toEqual(referenceRange(text, a, b));
      }
    }
  });

  it('handles a CRLF pair cut by the offset exactly as the reference does', () => {
    const text = 'a\r\nb';
    expect(range(text, 2, 3)).toEqual(referenceRange(text, 2, 3));
    expect(range(text, 3, 4)).toEqual(referenceRange(text, 3, 4));
  });

  it('keeps an empty text and the document end correct', () => {
    expect(range('', 0, 0)).toEqual(referenceRange('', 0, 0));
    expect(range('x\n', 2, 2)).toEqual(referenceRange('x\n', 2, 2));
  });
});
