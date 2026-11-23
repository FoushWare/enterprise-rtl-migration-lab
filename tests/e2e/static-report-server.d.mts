// Declarations for static-report-server.mjs (the runtime module is unchanged).

export interface StaticReportServer {
  /** Base URL on the loopback interface, for example http://127.0.0.1:4320. */
  readonly url: string;
  /** Closes the listener and resolves once it is released. */
  close(): Promise<void>;
}

/** Serves only regular files directly inside `directory`, bound to 127.0.0.1 on `port` (0 chooses a free port). */
export function startStaticReportServer(options: { readonly directory: string; readonly port: number }): Promise<StaticReportServer>;
