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
  function open(pair, button) {
    returnTo = button;
    document.querySelector('#comparison-dialog-caption').textContent = caption(pair);
    for (const lang of ['ar', 'en']) {
      const img = document.querySelector('#comparison-' + lang); img.src = pair[lang]; img.alt = caption(pair) + ' — ' + (lang === 'ar' ? 'Arabic' : 'English');
    }
    dialog.showModal(); document.querySelector('#comparison-close').focus();
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
  new MutationObserver(() => render()).observe(document.documentElement, {attributes: true, attributeFilter: ['lang']});
  render();
})();
