/* Local study-only annotation helper. It never changes application styles or state. */
(() => {
  if (!['localhost', '127.0.0.1'].includes(location.hostname) || !['4200', '4201'].includes(location.port)) return;
  window.__rtlDemo?.destroy();
  const issues = {
    1: ['aside', 'RTL-01 Sidebar stays on the left'],
    2: ['.chart-wrap', 'RTL-02 Month order versus chart'],
    3: ['.kpi:has(.kpi-icon)', 'RTL-03 Icon / Arabic label overlap'],
    4: ['.MuiFormControl-root', 'RTL-04 LTR field geometry'],
    5: ['.MuiDialogTitle-root', 'RTL-05 Close button / title overlap'],
    6: ['thead', 'RTL-06 Headings aligned left'],
    7: ['.app-link', 'RTL-07 Navigation arrow points right'],
    8: ['[role="dialog"] .hint', 'RTL-08 Address number changes visual position'],
    9: ['.brand', 'RTL-09 Logo composition reversed'],
  };
  const host = document.createElement('div');
  host.id = 'rtl-study-annotation';
  host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none!important;';
  const shadow = host.attachShadow({mode:'open'});
  shadow.innerHTML = '<style>:host,*{pointer-events:none!important;box-sizing:border-box}.box{position:fixed;border:3px solid #e11d48;border-radius:4px}.label{position:absolute;left:0;top:0;max-width:330px;background:#9f1239;color:white;font:600 15px/1.4 system-ui;padding:4px 8px;direction:ltr;transform:translateY(-100%);white-space:normal}</style>';
  document.documentElement.append(host);
  let active = 0, frame = 0;
  // Read the real live bounds so scrolling, dialogs and responsive layouts stay aligned.
  function draw() {
    shadow.querySelectorAll('.box').forEach(e => e.remove());
    const issue = issues[active];
    if (issue) {
      const targets = [...document.querySelectorAll(issue[0])].filter(e => e.getClientRects().length);
      targets.forEach(e => {
        const r = e.getBoundingClientRect();
        if (r.bottom <= 0 || r.top >= innerHeight || r.width === 0) return;
        const box = document.createElement('div'); box.className = 'box';
        box.style.cssText = `left:${Math.max(0,r.left-3)}px;top:${Math.max(0,r.top-3)}px;width:${r.width+6}px;height:${Math.min(r.height+6,innerHeight)}px`;
        const label = document.createElement('div'); label.className = 'label'; label.textContent = issue[1];
        if (r.top < 35) label.style.transform = 'none';
        box.append(label); shadow.append(box);
      });
    }
    if (active) frame = requestAnimationFrame(draw);
  }
  function show(id) { cancelAnimationFrame(frame); active = document.documentElement.dir === 'rtl' && issues[id] ? Number(id) : 0; draw(); }
  function key(event) {
    if (event.key === 'Escape') show(0);
    if (!event.altKey || !event.shiftKey || event.ctrlKey || event.metaKey) return;
    if (/^Digit[0-9]$/.test(event.code)) show(Number(event.code.slice(-1)));
    if (event.code === 'KeyX') destroy();
  }
  function destroy() { cancelAnimationFrame(frame); document.removeEventListener('keydown',key); host.remove(); delete window.__rtlDemo; }
  document.addEventListener('keydown',key);
  window.__rtlDemo = {show, hide:()=>show(0), destroy};
})();
