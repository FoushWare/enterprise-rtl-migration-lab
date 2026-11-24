// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';

// jsdom ships without type declarations here; only the surface this test uses is typed.
interface JsdomInstance { readonly window: Window & Record<string, any> }
const { JSDOM } = createRequire(import.meta.url)('jsdom') as { JSDOM: new (html: string, options: Record<string, unknown>) => JsdomInstance };
import { dashboardHtml } from '../src/dashboard-html.js';
import { toSchemaV2Presentation } from '../src/presentation-adapter.js';
import type { Report } from '../src/model.js';

// Renders the real dashboard client in jsdom. The companion is a stub that refuses connections until the test marks it
// ready, and the preview session is simulated by setting window.rtlPreviewState and dispatching the same
// `rtl-preview-state` event that the overlay publishes. Nothing is reloaded between states.

const report: Report = {
  schemaVersion: 2, kind: 'rtl-risk-report', policyDigest: 'policy', inputDigest: 'input', files: ['a.tsx'], skipped: [], evidence: [], diagnostics: [],
  findings: [{ id: 'f1', ruleId: 'R1', ruleVersion: 1, category: 'MANUAL_REVIEW', severity: 'Major', confidence: 'High', title: 'Physical margin', sourceMechanism: 'css', applications: [], path: 'a.tsx', range: { start: { offset: 0, line: 1, column: 1 }, end: { offset: 1, line: 1, column: 2 } }, original: 'x', context: 'x', ownership: 'owner', rationale: 'x', treatment: 'review', evidenceIds: [], relatedLocations: [], issueIds: [], suggestion: null, limitation: 'x' }],
  metrics: { byCategory: { MANUAL_REVIEW: 1 }, bySeverity: { Major: 1 }, byConfidence: { High: 1 }, uniqueAffectedFiles: 1, referenceCaseIds: [] }, complete: true,
} as unknown as Report;

const settle = (ms = 250) => new Promise(resolve => setTimeout(resolve, ms));

interface Scenario { readonly state?: 'starting' | 'startup_failed' | 'static' }

async function openDashboard(scenario: Scenario) {
  const html = dashboardHtml(toSchemaV2Presentation(report));
  const companion = { ready: false, sourceRequests: 0 };
  const dom = new JSDOM(html, {
    url: 'http://127.0.0.1:4320/rtl-report-dashboard.html', runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(window: Record<string, unknown>) {
      const w = window;
      if (scenario.state) w.rtlPreviewState = { state: scenario.state };
      w.fetch = async (url: string) => {
        if (String(url).includes('/review/source-context')) {
          companion.sourceRequests++;
          if (!companion.ready) throw new TypeError('fetch failed');
          return { ok: true, status: 200, json: async () => ({ data: JSON.parse(/<script type="application\/json" id="rtl-dashboard-data">([\s\S]*?)<\/script>/.exec(html)![1]), transition: null }) };
        }
        return { ok: false, status: 404, json: async () => ({ error: 'NOT_STUBBED' }) };
      };
      w.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
      w.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
      w.scrollTo = () => {};
      w.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } };
    },
  });
  const visibleText = () => {
    const clone = dom.window.document.body.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('script,style').forEach(node => node.remove());
    return clone.textContent ?? '';
  };
  // Simulates the overlay publishing a readiness change. Whatever the page is waiting for is then allowed to continue.
  const publish = (state: string) => {
    companion.ready = state === 'ready';
    dom.window.rtlPreviewState = { state };
    dom.window.dispatchEvent(new dom.window.CustomEvent('rtl-preview-state', { detail: { state, ready: state === 'ready' } }));
  };
  await settle();
  return { dom, companion, visibleText, publish };
}

describe('dashboard readiness without a page reload', () => {
  it('keeps the report visible while the preview starts, then clears the unverified state once the server is ready', async () => {
    const page = await openDashboard({ state: 'starting' });
    expect(page.companion.sourceRequests).toBe(1);
    expect(page.dom.window.document.querySelectorAll('.finding').length).toBeGreaterThan(0);
    expect(page.visibleText()).toContain('SOURCE UNVERIFIED');
    page.publish('ready');
    await settle();
    expect(page.companion.sourceRequests).toBe(2);
    expect(page.visibleText()).not.toContain('SOURCE UNVERIFIED');
    expect(page.visibleText()).not.toContain('Source context blocked');
    expect(page.dom.window.document.querySelectorAll('.finding').length).toBeGreaterThan(0);
  });

  it('recovers after a failed start once Retry Preview makes the session ready, without a reload', async () => {
    const page = await openDashboard({ state: 'startup_failed' });
    expect(page.visibleText()).toContain('SOURCE UNVERIFIED');
    expect(page.companion.sourceRequests).toBe(1);
    page.publish('starting');
    await settle(50);
    expect(page.companion.sourceRequests).toBe(1);
    page.publish('ready');
    await settle();
    expect(page.companion.sourceRequests).toBe(2);
    expect(page.visibleText()).not.toContain('SOURCE UNVERIFIED');
  });

  it('stays on the static report when the user continues without live preview', async () => {
    const page = await openDashboard({ state: 'startup_failed' });
    page.publish('static');
    await settle();
    expect(page.companion.sourceRequests).toBe(1);
    expect(page.visibleText()).toContain('SOURCE UNVERIFIED');
    expect(page.dom.window.document.querySelectorAll('.finding').length).toBeGreaterThan(0);
  });

  it('does not wait or retry when there is no preview session (static report)', async () => {
    const page = await openDashboard({});
    expect(page.companion.sourceRequests).toBe(1);
    expect(page.visibleText()).toContain('SOURCE UNVERIFIED');
    // No preview session was ever started, so nothing is waited for and nothing is retried.
    page.publish('ready');
    await settle();
    expect(page.companion.sourceRequests).toBe(1);
    expect(page.visibleText()).toContain('SOURCE UNVERIFIED');
  });
});
