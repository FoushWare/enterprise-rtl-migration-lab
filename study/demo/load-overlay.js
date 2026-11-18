// Run only in the real local application's Console after reviewing rtl-overlay.js.
// If the browser presents a security warning, the user must handle it personally.
(() => {
  const script = document.createElement('script');
  script.src = '/@fs/Users/a.fouad/iCloud%20Drive%20(Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/study/demo/rtl-overlay.js';
  script.onload = () => console.info('Study overlay loaded; Alt+Shift+1–9 show, 0 hides, X removes.');
  script.onerror = () => console.error('Study overlay did not load. Check that this is the study Vite server.');
  document.head.append(script);
})();
