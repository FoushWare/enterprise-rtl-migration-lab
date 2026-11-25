/**
 * Latest-selection-wins gate for preview preparations, per review workflow.
 *
 * A preparation request takes a sequence number when it arrives. Preparations queue behind the workflow lock, and a
 * queued request runs only if no newer request for the same workflow has arrived. Obsolete requests are skipped before
 * they touch the candidate or start a runtime. A preparation that has already started is not interrupted.
 */
export class PreviewSupersession {
  private sequence = 0;
  private latest = new Map<string, number>();
  /** Registers a new request and returns its sequence number. */
  begin(workflowId: string): number {
    const seq = ++this.sequence;
    this.latest.set(workflowId, seq);
    return seq;
  }
  /** True when no newer preparation request has been registered for this workflow since `seq` was issued. */
  isCurrent(workflowId: string, seq: number): boolean {
    return this.latest.get(workflowId) === seq;
  }
  /** Forgets a workflow (for example when it is removed from the store). */
  forget(workflowId: string): void {
    this.latest.delete(workflowId);
  }
}
