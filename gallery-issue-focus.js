'use strict';
(() => {
  const isEn = () => document.documentElement.lang === 'en';
  const text = (ar, en) => isEn() ? en : ar;
  const reviewed = new Set(['61491d7f6dd359033c4a9e80b556d3b3e2446305', '0de6d609cbfb9aae662d1cb7c9589c38592bb21b', '9c2df15f1df50ea101150b48f6d31249678a9b0f', '05138f1c5f68db92bcd94afe11e63fd83322f8cb']);
  // Broad inspection areas reviewed against the historical 1440px desktop layouts.
  // They are not measured defect boxes. Unreviewed layouts retain full context.
  function region(pair, issue, lang, width, height) {
    if (!reviewed.has(pair.commit) || pair.width !== 1440 || pair.media === 'print' || pair.ar.includes('print') || pair.en.includes('print')) return null;
    const state = pair.state;
    if (issue === 'RTL-01') return {x: 0, y: 100, w: 330, h: 410};
    if (issue === 'RTL-09') return {x: 15, y: 18, w: 210, h: 80};
    if (issue === 'RTL-02' && state === 'overview' && pair.app === 'invoicing') return {x: lang === 'ar' ? 690 : 290, y: 525, w: 690, h: 265};
    if (issue === 'RTL-03' && state === 'overview' && pair.app === 'invoicing') return {x: lang === 'ar' ? 1125 : 265, y: 275, w: 285, h: 155};
    if (issue === 'RTL-04') {
      if (['create', 'create-focused', 'create-validation', 'customer-menu', 'currency-menu'].includes(state)) return {x: 285, y: 325, w: 1110, h: 175};
      if (state === 'orders') return {x: 285, y: 410, w: 1110, h: 95};
    }
    if (issue === 'RTL-05' && state === 'customer-dialog') return {x: 410, y: 390, w: 620, h: 105};
    if (issue === 'RTL-06') {
      if (state === 'overview') return {x: 280, y: 950, w: 1120, h: 205};
      if (state === 'orders') return {x: 280, y: 495, w: 1120, h: 190};
    }
    if (issue === 'RTL-07') {
      if (state === 'overview') return {x: 280, y: 875, w: 1120, h: 95};
      if (state === 'orders') return {x: 18, y: 660, w: 205, h: 110};
    }
    if (issue === 'RTL-08' && state === 'customer-dialog') return {x: 410, y: 390, w: 620, h: 225};
    return null;
  }
  document.addEventListener('gallery:render-issue-focus', event => {
    const {pair, issue, node} = event.detail;
    const section = document.createElement('section'); section.className = 'issue-focus-previews';
    const heading = document.createElement('h6'); heading.textContent = text('شوف الجزء المقصود', 'Inspect the relevant area'); section.append(heading);
    const row = document.createElement('div'); row.className = 'issue-focus-pair'; section.append(row);
    for (const lang of ['ar', 'en']) {
      const figure = document.createElement('figure'), caption = document.createElement('figcaption');
      caption.textContent = lang === 'ar' ? text('العربية', 'Arabic') : text('الإنجليزية', 'English');
      const button = document.createElement('button'); button.type = 'button'; button.className = 'issue-focus-button'; button.dataset.focusLanguage = lang; button.dataset.focusIssue = issue;
      button.setAttribute('aria-label', text('افحص التفصيلة في الصورة الكبيرة', 'Inspect this detail in the large image') + ' — ' + issue + ' — ' + caption.textContent);
      const crop = document.createElement('span'); crop.className = 'issue-focus-crop';
      const image = document.createElement('img'); image.src = pair[lang]; image.loading = 'lazy'; image.alt = issue + ' — ' + caption.textContent;
      let selection = null;
      function layout() {
        const candidate = region(pair, issue, lang, image.naturalWidth, image.naturalHeight);
        selection = candidate && candidate.x >= 0 && candidate.y >= 0 && candidate.x + candidate.w <= image.naturalWidth && candidate.y + candidate.h <= image.naturalHeight ? candidate : null;
        const rect = selection || {x: 0, y: 0, w: image.naturalWidth, h: image.naturalHeight};
        if (!rect.w || !rect.h) return;
        button.dataset.focusMode = selection ? 'inspection-area' : 'full-context';
        crop.style.width = 'min(100%, ' + (170 * rect.w / rect.h) + 'px)'; crop.style.aspectRatio = rect.w + ' / ' + rect.h;
        image.style.width = (image.naturalWidth / rect.w * 100) + '%'; image.style.left = (-rect.x / rect.w * 100) + '%'; image.style.top = (-rect.y / rect.h * 100) + '%';
        caption.textContent = (lang === 'ar' ? text('العربية', 'Arabic') : text('الإنجليزية', 'English')) + ' · ' + (selection ? text('منطقة الفحص', 'Inspection area') : text('لقطة أوسع', 'Full context'));
      }
      image.addEventListener('load', layout); crop.append(image); button.append(crop); figure.append(caption, button); row.append(figure);
      button.addEventListener('click', () => document.dispatchEvent(new CustomEvent('gallery:focus-region', {detail: {lang, rect: selection}})));
      if (image.complete && image.naturalWidth) layout();
    }
    const hint = document.createElement('p'); hint.className = 'issue-focus-hint'; hint.textContent = text('اضغط على المصغّرة لتفحصها فوق. القصّ إرشادي، والصورة الأصلية محفوظة؛ لو المنطقة مش موثّقة بنعرض اللقطة الأوسع.', 'Select a thumbnail to inspect it above. Crops are inspection guides; originals are preserved. Unreviewed areas show full context.'); section.append(hint);
    const technical = node.querySelector('.technical-more'); if (technical) node.insertBefore(section, technical); else node.append(section);
  });
})();
