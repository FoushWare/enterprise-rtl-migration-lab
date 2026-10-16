'use strict';
(() => {
  const pairs = JSON.parse(document.querySelector('#comparison-data').textContent);
  const taxonomy = JSON.parse(document.querySelector('#gallery-taxonomy').textContent);
  const dictionary = JSON.parse(document.querySelector('#gallery-translations').textContent);
  const bar = document.querySelector('#global-issue-filters'), grid = document.querySelector('#comparison-grid');
  const dialog = document.querySelector('#comparison-dialog');
  let limit = 8, matches = [], returnTo;
  const en = () => document.documentElement.lang === 'en';
  const t = (ar, english) => en() ? english : ar;
  const translated = value => en() ? dictionary[value] || value : value;
  const make = (tag, text, className) => { const node = document.createElement(tag); if (text) node.textContent = text; if (className) node.className = className; return node; };
  function caption(pair) {
    const card = [...document.querySelectorAll('.screen-card')].find(card => card.querySelector('.pic').dataset.src === pair.ar);
    return translated(card?.dataset.titleAr || pair.state) + ' · ' + t('المرحلة', 'Stage') + ' ' + pair.stage + ' · ' + pair.width + ' × ' + pair.height;
  }
  const zoomPanels = new Map();
  function zoomTo(panel, value) {
    panel.zoom = Math.max(1, Math.min(8, value));
    const image = panel.image;
    if (image.naturalWidth) {
      const fit = Math.min(image.naturalWidth, panel.viewport.clientWidth - 16, (panel.viewport.clientHeight - 16) * image.naturalWidth / image.naturalHeight);
      image.style.width = Math.max(1, fit * panel.zoom) + 'px';
    }
    panel.output.textContent = Math.round(panel.zoom * 100) + '%';
    panel.minus.disabled = panel.zoom <= 1; panel.plus.disabled = panel.zoom >= 8;
    if (panel.zoom === 1) { panel.viewport.scrollTop = 0; panel.viewport.scrollLeft = 0; }
  }
  function zoomLabels() {
    for (const [lang, panel] of zoomPanels) {
      const name = lang === 'ar' ? t('الصورة العربية', 'Arabic image') : t('الصورة الإنجليزية', 'English image');
      panel.viewport.setAttribute('aria-label', name + ' — ' + t('حرّك الصورة المكبّرة بالتمرير', 'Scroll to explore the enlarged image'));
      panel.plus.setAttribute('aria-label', t('تكبير', 'Zoom in') + ' — ' + name);
      panel.minus.setAttribute('aria-label', t('تصغير', 'Zoom out') + ' — ' + name);
      panel.reset.textContent = t('عرض مناسب', 'Fit image');
      panel.reset.setAttribute('aria-label', t('عرض مناسب', 'Fit image') + ' — ' + name);
    }
  }
  for (const lang of ['ar', 'en']) {
    const image = document.querySelector('#comparison-' + lang), figure = image.parentElement;
    const toolbar = make('div', null, 'comparison-zoom-tools');
    const minus = make('button', '−'), plus = make('button', '+'), reset = make('button'), output = make('output', '100%');
    for (const [action, button] of [['out', minus], ['in', plus], ['fit', reset]]) { button.type = 'button'; button.dataset.zoom = action; button.dataset.image = lang; }
    toolbar.append(minus, output, plus, reset);
    const viewport = make('div', null, 'comparison-zoom-viewport'); viewport.tabIndex = 0; viewport.dir = 'ltr';
    figure.append(toolbar, viewport); viewport.append(image); image.draggable = false;
    const panel = {image, viewport, minus, plus, reset, output, zoom: 1}; zoomPanels.set(lang, panel);
    plus.addEventListener('click', () => zoomTo(panel, panel.zoom * 1.5));
    minus.addEventListener('click', () => zoomTo(panel, panel.zoom / 1.5));
    reset.addEventListener('click', () => zoomTo(panel, 1));
    image.addEventListener('load', () => zoomTo(panel, 1));
    image.addEventListener('click', () => zoomTo(panel, panel.zoom >= 8 ? 1 : panel.zoom * 1.5));
    viewport.addEventListener('wheel', event => { if (event.ctrlKey || event.metaKey) { event.preventDefault(); zoomTo(panel, panel.zoom * (event.deltaY < 0 ? 1.15 : 1 / 1.15)); } }, {passive: false});
    viewport.addEventListener('keydown', event => { if (['+', '=', '-', '0'].includes(event.key)) { event.preventDefault(); zoomTo(panel, event.key === '0' ? 1 : panel.zoom * (event.key === '-' ? 1 / 1.5 : 1.5)); } });
  }
  zoomLabels();
  addEventListener('resize', () => { if (dialog.open) for (const panel of zoomPanels.values()) zoomTo(panel, panel.zoom); });
  function open(pair, button) {
    returnTo = button;
    document.querySelector('#comparison-dialog-caption').textContent = caption(pair);
    for (const lang of ['ar', 'en']) {
      const img = document.querySelector('#comparison-' + lang); img.src = pair[lang]; img.alt = caption(pair) + ' — ' + (lang === 'ar' ? 'Arabic' : 'English');
    }
    dialog.showModal(); for (const panel of zoomPanels.values()) zoomTo(panel, 1); document.querySelector('#comparison-close').focus();
  }
  function close() { dialog.close(); returnTo?.focus({preventScroll: true}); }
  document.querySelector('#comparison-close').addEventListener('click', close);
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  function render(reset = false) {
    if (reset) limit = 8;
    const value = key => bar.querySelector(`[data-filter="${key}"]`).value;
    const issue = value('issue'), category = value('category'), status = value('status');
    const search = bar.querySelector('input[type="search"]').value.trim().toLowerCase();
    matches = issue ? pairs.filter(pair => pair.annotations.some(note => note.issueId === issue
      && (status ? note.status === status : ['before-fix', 'partial'].includes(note.status))
      && (!category || taxonomy.issues.find(item => item.id === note.issueId).categories.includes(category)))
      && (!search || [caption(pair), dictionary[caption(pair)], pair.state, pair.app, pair.route, pair.commit].filter(Boolean).join(' ').toLowerCase().includes(search))) : [];
    grid.replaceChildren();
    const count = document.querySelector('#comparison-count');
    const issueInfo = taxonomy.issues.find(item => item.id === issue);
    count.textContent = !issue ? t('اختار واحدة من المشاكل التسعة لعرض المقارنات هنا.', 'Choose one of the nine issues to see comparisons here.')
      : matches.length ? translated(issueInfo.shortLabelAr) + ' · ' + t(`المعروض ${Math.min(limit, matches.length)} من ${matches.length} مقارنة`, `Showing ${Math.min(limit, matches.length)} of ${matches.length} comparisons`)
      : t('مفيش أزواج مطابقة للاختيارات دي. جرّب تغيير الفلاتر.', 'No exact comparison pairs match these selections. Try changing the filters.');
    for (const pair of matches.slice(0, limit)) {
      const article = make('article', null, 'comparison-card'); article.dataset.ar = pair.ar; article.dataset.en = pair.en;
      article.append(make('h4', caption(pair)));
      const note = pair.annotations.find(note => note.issueId === issue);
      article.append(make('p', translated(note.whereAr), 'comparison-location'));
      const statusInfo = taxonomy.statuses.find(item => item.id === note.status);
      article.append(make('p', translated(statusInfo.label), 'comparison-status'));
      const images = make('div', null, 'comparison-images');
      for (const lang of ['ar', 'en']) {
        const figure = make('figure'); figure.append(make('figcaption', lang === 'ar' ? t('العربية — موضع المشكلة', 'Arabic — issue area') : t('الإنجليزية — للمقارنة', 'English — reference')));
        const button = make('button', null, 'comparison-preview'); button.type = 'button'; button.setAttribute('aria-label', t('افتح المقارنة بالحجم الكامل', 'Open full-size comparison'));
        const img = make('img'); img.src = pair[lang]; img.loading = 'lazy'; img.alt = caption(pair) + ' — ' + (lang === 'ar' ? 'Arabic' : 'English'); button.append(img); button.addEventListener('click', () => open(pair, button)); figure.append(button); images.append(figure);
      }
      article.append(images);
      const source = make('a', t('عرض الكوميت', 'View commit') + ' ' + pair.commit.slice(0, 8)); source.href = 'https://github.com/FoushWare/enterprise-rtl-migration-lab/commit/' + pair.commit; source.target = '_blank'; source.rel = 'noopener'; article.append(source); grid.append(article);
    }
    document.querySelector('#comparison-more').hidden = matches.length <= limit;
    document.querySelector('#global-count').hidden = true;
  }
  document.addEventListener('gallery:filters-change', () => render(true));
  document.querySelector('#comparison-more').addEventListener('click', () => { limit += 8; render(); });
  new MutationObserver(() => { render(); zoomLabels(); }).observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
  render();
})();
