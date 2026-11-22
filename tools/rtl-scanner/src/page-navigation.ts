/**
 * A cold Vite dev server may reload once shortly after the first load ("optimized dependencies changed"),
 * destroying the page's execution context mid-evaluation. Re-run page work that raced such a reload.
 * Only that specific failure is retried; every other error, and the final attempt, propagates unchanged.
 */
export async function retryAcrossNavigation<T>(operation: () => Promise<T>, attempts = 3): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try { return await operation(); }
    catch (error) {
      if (attempt >= attempts || !/Execution context was destroyed/.test(error instanceof Error ? error.message : String(error))) throw error;
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }
}
