import { writeFile } from "node:fs/promises";
import { performance as clock } from "node:perf_hooks";
import {
  test as base,
  type ConsoleMessage,
  type Frame,
  type Page,
  type Request,
  type Response,
} from "@playwright/test";

export { expect } from "@playwright/test";
export type { Locator, Page } from "@playwright/test";

type DiagnosticEvent = {
  elapsedMs: number;
  page: number;
  kind: string;
  [key: string]: unknown;
};

/** Keep paths useful without storing query parameters or fragments in this log. */
function location(raw: string): string {
  try {
    const url = new URL(raw);
    return /^https?:$/.test(url.protocol)
      ? `${url.origin}${url.pathname}`
      : url.protocol;
  } catch {
    return raw.slice(0, 500);
  }
}

/**
 * Observe each isolated test context without altering navigation or application code.
 * The trace/HTML report retains fixture/action timing; this bounded log adds browser
 * errors and local-server failures. Only unexpected failures write an attachment.
 */
export const test = base.extend<{ _failureDiagnostics: void }>({
  _failureDiagnostics: [
    async ({ context }, use, testInfo) => {
      const started = clock.now();
      const startedAt = new Date().toISOString();
      const events: DiagnosticEvent[] = [];
      const pages: Page[] = [];
      const cleanups: (() => void)[] = [];
      let droppedEvents = 0;
      const record = (page: number, kind: string, details = {}) => {
        if (events.length >= 200) {
          droppedEvents++;
          return;
        }
        events.push({
          elapsedMs: Math.round(clock.now() - started),
          page,
          kind,
          ...details,
        });
      };
      const observe = (page: Page) => {
        if (pages.includes(page)) return;
        const id = pages.push(page);
        record(id, "page-created");
        const consoleError = (message: ConsoleMessage) => {
          if (message.type() === "error")
            record(id, "console-error", {
              message: message.text().slice(0, 2000),
              source: location(message.location().url),
            });
        };
        const pageError = (error: Error) =>
          record(id, "page-error", {
            message: error.message.slice(0, 2000),
            stack: error.stack?.slice(0, 4000),
          });
        const failedRequest = (request: Request) => {
          // Both applications and their assets use local HTTP origins in this lab.
          // HTTP failures and transport failures are distinct; record both.
          if (/^https?:\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(request.url()))
            record(id, "request-failed", {
              url: location(request.url()),
              method: request.method(),
              resourceType: request.resourceType(),
              error: request.failure()?.errorText,
            });
        };
        const response = (response: Response) => {
          if (
            response.status() >= 400 &&
            /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(response.url())
          )
            record(id, "http-error", {
              url: location(response.url()),
              status: response.status(),
              resourceType: response.request().resourceType(),
            });
        };
        const navigated = (frame: Frame) => {
          if (frame === page.mainFrame())
            record(id, "navigation", { url: location(frame.url()) });
        };
        const domReady = () =>
          record(id, "domcontentloaded", { url: location(page.url()) });
        const loaded = () => record(id, "load", { url: location(page.url()) });
        page.on("console", consoleError);
        page.on("pageerror", pageError);
        page.on("requestfailed", failedRequest);
        page.on("response", response);
        page.on("framenavigated", navigated);
        page.on("domcontentloaded", domReady);
        page.on("load", loaded);
        cleanups.push(() => {
          page.off("console", consoleError);
          page.off("pageerror", pageError);
          page.off("requestfailed", failedRequest);
          page.off("response", response);
          page.off("framenavigated", navigated);
          page.off("domcontentloaded", domReady);
          page.off("load", loaded);
        });
      };
      context.on("page", observe);
      context.pages().forEach(observe);
      try {
        await use();
      } finally {
        context.off("page", observe);
        cleanups.forEach((cleanup) => cleanup());
        if (testInfo.status !== testInfo.expectedStatus) {
          const states = [];
          // A crashed/unresponsive renderer must not make diagnostics hang. This
          // bounds best-effort collection; it does not extend the test deadline.
          for (const [index, page] of pages.slice(0, 3).entries()) {
            const state = {
              page: index + 1,
              url: location(page.url()),
              closed: page.isClosed(),
            };
            let timer: ReturnType<typeof setTimeout> | undefined;
            try {
              const browserState = page.isClosed()
                ? { unavailable: "Page closed" }
                : await Promise.race([
                    page.evaluate(() => ({
                      timeOrigin: performance.timeOrigin,
                      readyState: document.readyState,
                      rootPresent: Boolean(document.getElementById("root")),
                      mainPresent: Boolean(document.querySelector("main")),
                      loadingWorkspace:
                        document
                          .querySelector("main")
                          ?.textContent?.includes("Loading your workspace") ??
                        false,
                      headings: [...document.querySelectorAll("h1")]
                        .slice(0, 5)
                        .map((heading) => heading.textContent?.slice(0, 200)),
                      language: document.documentElement.lang,
                      direction: document.documentElement.dir,
                      // These are browser navigation/paint timings, not invented React
                      // readiness metrics. The DOM fields describe capture time only.
                      navigation: performance
                        .getEntriesByType("navigation")
                        .map((entry) => {
                          const timing = entry as PerformanceNavigationTiming;
                          return {
                            startTime: timing.startTime,
                            requestStart: timing.requestStart,
                            responseEnd: timing.responseEnd,
                            domInteractive: timing.domInteractive,
                            domContentLoadedEventEnd:
                              timing.domContentLoadedEventEnd,
                            loadEventEnd: timing.loadEventEnd,
                            duration: timing.duration,
                          };
                        }),
                      paints: performance
                        .getEntriesByType("paint")
                        .map((entry) => ({
                          name: entry.name,
                          startTime: entry.startTime,
                        })),
                    })),
                    new Promise((resolve) => {
                      timer = setTimeout(
                        () =>
                          resolve({
                            unavailable:
                              "Renderer did not respond within diagnostic collection budget",
                          }),
                        1000,
                      );
                    }),
                  ]);
              states.push({ ...state, browserState });
            } catch (error) {
              states.push({
                ...state,
                unavailable: String(error).slice(0, 1000),
              });
            } finally {
              clearTimeout(timer);
            }
          }
          const file = testInfo.outputPath("failure-diagnostics.json");
          await writeFile(
            file,
            JSON.stringify(
              {
                observerReadyAt: startedAt,
                elapsedSinceObserverReadyMs: Math.round(clock.now() - started),
                note: "Observer starts after context setup, not at test/browser launch. Use HTML report/trace for full fixture timing. DOM state is sampled at failure, not an exact app-ready timestamp.",
                status: testInfo.status,
                expectedStatus: testInfo.expectedStatus,
                workerIndex: testInfo.workerIndex,
                parallelIndex: testInfo.parallelIndex,
                testTimeoutMs: testInfo.timeout,
                droppedEvents,
                omittedPages: Math.max(0, pages.length - 3),
                events,
                pages: states,
              },
              null,
              2,
            ),
          );
          await testInfo.attach("failure-diagnostics", {
            path: file,
            contentType: "application/json",
          });
        }
      }
    },
    { auto: true },
  ],
});
