import { describe, it, expect } from 'vitest';
import { runInNewContext } from 'node:vm';
import { contextualBridgeSource } from '../src/contextual-preview-bridge.js';
import { contextualPreviewClientSource } from '../src/dashboard-contextual-preview.js';

interface Target {index:number;key:string|null;keyGuaranteed:boolean;ambiguous:boolean;label:string}
interface BridgeMessage {type:string;targets:Target[]}
interface MockNode {
  matches(selector:string):boolean;querySelector(selector:string):MockNode|null;
}
type MessageListener=(event:unknown)=>Promise<void>;

describe('contextual target identity & safe restoration', () => {
  it('assigns unique guaranteed keys and handles duplicate / anonymous elements deterministically', async () => {
    // Setup mock DOM environment in vm
    const messages: BridgeMessage[] = [];
    const parent = { postMessage: (msg: BridgeMessage) => messages.push(msg) };
    let messageListener: MessageListener = async () => {};

    // Mock DOM elements
    const createMockNode = (attrs: Record<string, string>, textContent: string = '', children: MockNode[] = []) => {
      const node = {
        getAttribute: (attr: string) => attrs[attr] ?? null,
        closest: () => null,
        matches: (selector: string) => {
          if (selector.includes('.contact-name') && attrs.class?.includes('contact-name')) return true;
          if (selector.includes('h2') && attrs.tag === 'h2') return true;
          return false;
        },
        querySelector: (selector: string) => {
          for (const c of children) {
            if (c.matches?.(selector)) return c;
            const sub:MockNode|null = c.querySelector?.(selector);
            if (sub) return sub;
          }
          return null;
        },
        querySelectorAll: () => children,
        getBoundingClientRect: () => ({ x: 10, y: 10, width: 100, height: 40, top: 10, left: 10, right: 110, bottom: 50 }),
        scrollIntoView: () => {},
        textContent,
        style: {},
      };
      return node;
    };

    // Node 0: Nadia with unique email
    const nodeA = createMockNode(
      { class: 'contact-card', 'data-id': 'user-nadia' },
      '',
      [createMockNode({ class: 'contact-name', tag: 'h2' }, 'Nadia / نادية'), createMockNode({ class: 'contact-email' }, 'nadia@example.com')]
    );
    // Node 1: Omar with unique email
    const nodeB = createMockNode(
      { class: 'contact-card', 'data-id': 'user-omar' },
      '',
      [createMockNode({ class: 'contact-name', tag: 'h2' }, 'Omar / عمر'), createMockNode({ class: 'contact-email' }, 'omar@example.com')]
    );
    // Node 2: Duplicate name without explicit key or email
    const nodeC1 = createMockNode(
      { class: 'contact-card' },
      '',
      [createMockNode({ class: 'contact-name', tag: 'h2' }, 'Guest / ضيف')]
    );
    // Node 3: Another duplicate name without explicit key or email
    const nodeC2 = createMockNode(
      { class: 'contact-card' },
      '',
      [createMockNode({ class: 'contact-name', tag: 'h2' }, 'Guest / ضيف')]
    );
    // Node 4: Anonymous target (no name, no email, no id)
    const nodeAnon = createMockNode(
      { class: 'contact-card' },
      '',
      []
    );

    const allNodes = [nodeA, nodeB, nodeC1, nodeC2, nodeAnon];

    const location = { pathname: '/contacts', search: '', origin: 'http://127.0.0.1:4318', replace: () => {} };
    const getComputedStyle = () => ({ display: 'block', visibility: 'visible', getPropertyValue: () => '' });
    const context = {
      location,
      innerWidth: 1024,
      innerHeight: 768,
      getComputedStyle,
      window: {
        parent,
        name: 'rtl-preview:test',
        addEventListener: (type: string, fn: MessageListener) => { if (type === 'message') messageListener = fn; },
        location,
        innerWidth: 1024,
        innerHeight: 768,
        getComputedStyle,
        crypto: { subtle: { digest: async () => new Uint8Array([1, 2, 3]).buffer } },
      },
      document: {
        documentElement: { dir: 'rtl' },
        title: 'Contacts Test',
        querySelector: (sel: string) => sel === '#root > *' ? {} : null,
        querySelectorAll: (sel: string) => sel === '.contact-card' ? allNodes : [],
        addEventListener: () => {},
        createElement: () => ({ setAttribute: () => {}, append: () => {}, replaceChildren: () => {}, style: {}, dataset: {} }),
        body: { append: () => {} },
      },
      localStorage: { getItem: () => null, setItem: () => {} },
      MutationObserver: class { observe() {} },
    };

    const finding = { id: 'FINDING-1', path: 'src/contacts.css' };
    const mapping = {
      kind: 'component',
      selector: '.contact-card',
      routes: [{ id: 'contacts-route', path: '/contacts', application: 'invoicing' }],
      evidence: [],
    };
    const identity = { role: 'original', sessionId: 'original-session', projectRoot: '/test', application: 'invoicing' };

    runInNewContext(
      contextualBridgeSource + ';installContextPreview(' + JSON.stringify({
        identity,
        dashboardOrigin: 'http://127.0.0.1:4320',
        sourceHashes: { [finding.path]: 'hash123' },
        bindings: [{ finding, mapping }],
      }) + ');',
      context
    );

    await messageListener({
      origin: 'http://127.0.0.1:4320',
      source: parent,
      data: {
        type: 'rtl-context-probe',
        version: 2,
        nonce: 'nonce1',
        role: 'original',
        application: 'invoicing',
        runtimeSessionId: 'original-session',
        sessionId: 'before-only',
        projectRoot: '/test',
        sourcePath: finding.path,
        sourceSha256: 'hash123',
        findingId: finding.id,
        routeId: 'contacts-route',
        instance: 0,
      },
    });

    expect(messages.length).toBe(1);
    const statusMsg = messages[0];
    expect(statusMsg.type).toBe('rtl-context-status');
    const targets = statusMsg.targets;
    expect(targets.length).toBe(5);

    // Target 0: user-nadia (explicit id) -> guaranteed
    expect(targets[0].key).toBe('user-nadia');
    expect(targets[0].keyGuaranteed).toBe(true);
    expect(targets[0].ambiguous).toBe(false);

    // Target 1: user-omar (explicit id) -> guaranteed
    expect(targets[1].key).toBe('user-omar');
    expect(targets[1].keyGuaranteed).toBe(true);
    expect(targets[1].ambiguous).toBe(false);

    // Targets 2 & 3: duplicate name 'Guest / ضيف' -> ambiguous, NOT guaranteed
    expect(targets[2].key).toBe('Guest / ضيف');
    expect(targets[2].keyGuaranteed).toBe(false);
    expect(targets[2].ambiguous).toBe(true);
    expect(targets[2].label).toContain('(#3)');

    expect(targets[3].key).toBe('Guest / ضيف');
    expect(targets[3].keyGuaranteed).toBe(false);
    expect(targets[3].ambiguous).toBe(true);
    expect(targets[3].label).toContain('(#4)');

    // Target 4: anonymous -> no key, NOT guaranteed
    expect(targets[4].key).toBeNull();
    expect(targets[4].keyGuaranteed).toBe(false);
    expect(targets[4].ambiguous).toBe(false);
  });

  it('reconcileContextTargets restores by verified targetKey across reordering and invalidates ambiguous / anonymous selections', () => {
    // Evaluate contextualPreviewClientSource in a sandbox to test reconcileContextTargets
    const storage: Record<string, string> = {};
    const sessionStorageMock = {
      getItem: (k: string) => storage[k] ?? null,
      setItem: (k: string, v: string) => { storage[k] = v; },
      removeItem: (k: string) => { delete storage[k]; },
    };

    const ctx = {
      window: {
        addEventListener: () => {},
        dispatchEvent: () => {},
      },
      document: {
        createElement: () => ({ setAttribute: () => {}, append: () => {} }),
      },
      sessionStorage: sessionStorageMock,
      Option: class Option {
        constructor(public label: string, public value: string) {}
      },
      el: (t: string, text: string = '', cls: string = '') => ({
        tagName: t,
        className: cls,
        textContent: text,
        append: () => {},
        replaceChildren: () => {},
      }),
      contextProbe: () => {},
      d: { inputDigest: 'in', policyDigest: 'pol' },
      originalOrigins: new Set(),
    };

    // Extract function using vm
    const code = `
      ${contextualPreviewClientSource}
      this.reconcile = reconcileContextTargets;
      this.targetKeyFn = targetSelectionKey;
    `;
    runInNewContext(code, ctx);

    const record = {
      projectRoot: '/test',
      workflowId: 'wf-1',
      finding: { id: 'f-1', path: 'src/test.css' },
      role: 'original',
      routeId: 'route-1',
      historical: false,
    };
    const makeItem = () => ({
      role: 'original',
      instance: 0,
      targetRestoreFailed: false,
      targetSignature: null,
      state: { dataset: {} },
      instanceSelect: {
        value: '0',
        disabled: false,
        options: [] as {label:string;value:string}[],
        replaceChildren(...opts: {label:string;value:string}[]) { this.options = opts; },
      },
    });

    const exported=ctx as typeof ctx & {targetKeyFn:(record:unknown,item:unknown)=>string;reconcile:(item:ReturnType<typeof makeItem>,record:unknown,report:{targets:Target[]})=>void};
    const key = exported.targetKeyFn(record, { role: 'original' });

    // User selects Omar (index 1, key 'user-omar')
    storage[key] = JSON.stringify({ index: 1, targetKey: 'user-omar', label: 'Omar' });

    // Reorder: Omar is now at index 0, Nadia is at index 1!
    const targetsReordered = [
      { index: 0, key: 'user-omar', keyGuaranteed: true, ambiguous: false, label: 'Omar' },
      { index: 1, key: 'user-nadia', keyGuaranteed: true, ambiguous: false, label: 'Nadia' },
    ];

    const item = makeItem();
    exported.reconcile(item, record, { targets: targetsReordered });

    // Verified: selected must be 0 (Omar's new index), NOT index 1 (which would be Nadia)!
    expect(item.instance).toBe(0);
    expect(item.instanceSelect.value).toBe('0');

    // Case 2: Insertion of a new target at index 0, pushing Omar to index 2
    const targetsInserted = [
      { index: 0, key: 'user-new', keyGuaranteed: true, ambiguous: false, label: 'New User' },
      { index: 1, key: 'user-nadia', keyGuaranteed: true, ambiguous: false, label: 'Nadia' },
      { index: 2, key: 'user-omar', keyGuaranteed: true, ambiguous: false, label: 'Omar' },
    ];
    storage[key] = JSON.stringify({ index: 0, targetKey: 'user-omar', label: 'Omar' });
    const item2 = makeItem();
    exported.reconcile(item2, record, { targets: targetsInserted });
    expect(item2.instance).toBe(2);

    // Case 3: Removal of the saved target
    const targetsRemoved = [
      { index: 0, key: 'user-nadia', keyGuaranteed: true, ambiguous: false, label: 'Nadia' },
    ];
    storage[key] = JSON.stringify({ index: 2, targetKey: 'user-omar', label: 'Omar' });
    const item3 = makeItem();
    exported.reconcile(item3, record, { targets: targetsRemoved });
    // Invalidate saved selection and require an explicit fresh choice.
    expect(item3.instance).toBe(-2);
    expect(item3.targetRestoreFailed).toBe(true);
    expect(item3.instanceSelect.value).toBe('');
    exported.reconcile(item3,record,{targets:targetsRemoved});
    expect(item3.instanceSelect.value).toBe(''); // polling cannot silently select a replacement
    expect(JSON.parse(storage[key])).toEqual({restoreRequired:true});

    // Case 4: Ambiguous saved target (e.g. duplicate key or anonymous)
    const targetsAmbiguous = [
      { index: 0, key: 'duplicate', keyGuaranteed: false, ambiguous: true, label: 'Item 1' },
      { index: 1, key: 'duplicate', keyGuaranteed: false, ambiguous: true, label: 'Item 2' },
    ];
    storage[key] = JSON.stringify({ index: 1, targetKey: 'duplicate', label: 'Item 2' });
    const item4 = makeItem();
    exported.reconcile(item4, record, { targets: targetsAmbiguous });
    // Ambiguous target key cannot guarantee identity -> show an unselected placeholder.
    expect(item4.instance).toBe(-2);
    expect(item4.targetRestoreFailed).toBe(true);
    expect(item4.instanceSelect.value).toBe('');
    expect(JSON.parse(storage[key])).toEqual({restoreRequired:true});

    // Case 5: Anonymous target with no key
    const targetsAnonymous = [
      { index: 0, key: null, keyGuaranteed: false, ambiguous: false, label: 'Target 1' },
      { index: 1, key: null, keyGuaranteed: false, ambiguous: false, label: 'Target 2' },
    ];
    storage[key] = JSON.stringify({ index: 1, label: 'Target 2' }); // attempted save by label or index
    const item5 = makeItem();
    exported.reconcile(item5, record, { targets: targetsAnonymous });
    // Invalidate unsafe saved target and require a fresh selection.
    expect(item5.instance).toBe(-2);
    expect(item5.targetRestoreFailed).toBe(true);
    expect(item5.instanceSelect.value).toBe('');
    expect(JSON.parse(storage[key])).toEqual({restoreRequired:true});
  });
});
