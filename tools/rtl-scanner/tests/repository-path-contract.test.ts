import { describe, expect, it } from 'vitest';
import { isRepositoryRelativePath, REVIEW_SOURCE, validateReviewIdentity, validateReviewPath } from '../src/review-session.js';

// Repository-relative paths are POSIX on every platform. These cases must give the same answer on Windows, macOS and
// Linux; the platform path module is not part of the contract.

const identity = (sourcePath: string) => ({ findingId: 'finding-1', sourcePath, schemaVersion: 2, inputDigest: 'input', policyDigest: 'policy' }) as unknown as Parameters<typeof validateReviewIdentity>[0];

describe('repository-relative path contract', () => {
  it.each([
    'src/reading.css',
    'libs/ui/src/index.tsx',
    'apps/invoicing/src/pages/Dashboard.tsx',
    'a b/c.css',
    'é.css',
    '😀.css',
    'index.html',
  ])('accepts valid POSIX-relative path %s', path => {
    expect(isRepositoryRelativePath(path)).toBe(true);
    expect(() => validateReviewIdentity(identity(path))).not.toThrow();
  });

  it.each([
    ['parent traversal', '../secret.css'],
    ['traversal in the middle', 'src/../../secret.css'],
    ['trailing traversal', 'src/..'],
    ['absolute POSIX path', '/etc/passwd'],
    ['backslash separator', 'src\\reading.css'],
    ['backslash traversal', 'src\\..\\secret.css'],
    ['drive letter with forward slash', 'C:/project/src/a.css'],
    ['drive letter with backslash', 'C:\\project\\src\\a.css'],
    ['drive-relative form', 'c:a.css'],
    ['current-directory segment', './src/a.css'],
    ['doubled separator', 'src//a.css'],
    ['trailing separator', 'src/'],
    ['empty path', ''],
    ['embedded newline', 'src/a\n.css'],
    ['embedded NUL', 'src/a\0.css'],
  ])('rejects %s', (_label, path) => {
    expect(isRepositoryRelativePath(path)).toBe(false);
    expect(() => validateReviewIdentity(identity(path))).toThrow('INVALID_REVIEW_IDENTITY');
  });

  it('rejects non-string values', () => {
    expect(isRepositoryRelativePath(undefined)).toBe(false);
    expect(isRepositoryRelativePath(42)).toBe(false);
    expect(isRepositoryRelativePath(null)).toBe(false);
  });

  it('accepts the approved review source through the review path check', () => {
    expect(validateReviewPath('/project', REVIEW_SOURCE)).toBeTruthy();
  });

  it.each([
    ['absolute POSIX path', '/etc/passwd'],
    ['backslash separator', 'src\\reading.css'],
    ['drive letter', 'C:/project/a.css'],
    ['traversal', '../secret.css'],
  ])('review path check rejects %s with INVALID_REVIEW_PATH', (_label, path) => {
    expect(() => validateReviewPath('/project', path)).toThrow('INVALID_REVIEW_PATH');
  });
});
