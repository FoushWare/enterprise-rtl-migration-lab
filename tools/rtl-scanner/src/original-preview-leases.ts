import { randomUUID } from 'node:crypto';

/**
 * Reference-counted ownership of original-application servers. Each successful start request receives one
 * unguessable lease token. A server stops only when its last token is released; an unknown or already-released
 * token never changes state, so one session cannot end another session's server.
 */
export class OriginalPreviewLeases {
  private readonly tokens = new Map<string, Set<string>>();

  /** Issues a new token for the application key and records it. */
  acquire(key: string): string {
    const token = randomUUID();
    const set = this.tokens.get(key) ?? new Set<string>();
    set.add(token);
    this.tokens.set(key, set);
    return token;
  }

  /**
   * Releases one token. Throws `ORIGINAL_LEASE_NOT_FOUND` for an unknown, expired, or foreign token.
   * `last` is true only when no token remains for the key.
   */
  release(key: string, token: string): { readonly last: boolean } {
    const set = this.tokens.get(key);
    if (!set || !set.has(token)) throw Error('ORIGINAL_LEASE_NOT_FOUND');
    set.delete(token);
    if (set.size === 0) {
      this.tokens.delete(key);
      return { last: true };
    }
    return { last: false };
  }

  /** True when the token is still held for the key. Used to make a retried start idempotent. */
  has(key: string, token: string): boolean {
    return this.tokens.get(key)?.has(token) === true;
  }

  /** Number of tokens held across every key. Zero means no session needs any original server. */
  count(): number {
    let total = 0;
    for (const set of this.tokens.values()) total += set.size;
    return total;
  }
}
