'use strict';
(() => {
  const dictionary = JSON.parse(document.querySelector('#gallery-translations').textContent);
  dictionary['لغة المعرض، مش لغة الصور'] = 'Gallery language, not screenshot language';
  const textSources = new WeakMap(), attributeSources = new WeakMap(), cache = new Map();
  const arabic = /[\u0600-\u06ff]/;
  let language = 'ar';
  const digits = value => value.replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit))).replace(/٬/g, ',');
  function english(value) {
    const source = value.trim();
    if (dictionary[source]) return value.replace(source, dictionary[source]);
    if (cache.has(value)) return cache.get(value);
    let result = digits(source), match;
    if ((match = result.match(/^المعروض ([\d,]+) من ([\d,]+) صورة$/))) result = `Showing ${match[1]} of ${match[2]} images`;
    else if ((match = result.match(/^([\d,]+) صورة مطابقة · المعروض دلوقتي ([\d,]+) · ده عدد صور، مش عدد عيوب$/))) result = `${match[1]} matching images · ${match[2]} currently shown · Images, not defect counts`;
    else if ((match = result.match(/^([\d,]+) صورة مطابقة$/))) result = `${match[1]} matching images`;
    else if ((match = result.match(/^اعرض ([\d,]+) صورة كمان \(([\d,]+) باقيين\)$/))) result = `Show ${match[1]} more images (${match[2]} remaining)`;
    else if ((match = result.match(/^صورة ([\d,]+) من ([\d,]+) في المرحلة دي$/))) result = `Image ${match[1]} of ${match[2]} in this stage`;
    else if ((match = result.match(/^تكبير ([\d.]+)×$/))) result = `Zoom ${match[1]}×`;
    else if ((match = result.match(/^المرحلة ([\d,]+) من 12$/))) result = `Stage ${match[1]} of 12`;
    else if ((match = result.match(/^(هتروح للمرحلة|اذهب إلى المرحلة) ([\d,]+): (.+)$/))) result = `Go to stage ${match[2]}: ${english(match[3])}`;
    else if ((match = result.match(/^المرحلة (التالية|السابقة): (.+)$/))) result = `${match[1] === 'التالية' ? 'Next' : 'Previous'} stage: ${english(match[2])}`;
    else if ((match = result.match(/^([\d,]+) · (.+)$/))) result = `${match[1]} · ${english(match[2])}`;
    else if (result.startsWith('باقي الموضوعات')) result = 'More topics are available under “More about this image”.';
    else if (dictionary[result]) result = dictionary[result];
    const translated = value.replace(source, result); cache.set(value, translated); return translated;
  }
  function skip(element) {
    return element.closest('script,style,noscript,[data-gallery-language],[data-source-code]') !== null;
  }
  function text(node) {
    if (!node.parentElement || skip(node.parentElement)) return;
    const current = node.nodeValue, saved = textSources.get(node);
    if (saved && (current === saved.ar || current === saved.en)) {
      node.nodeValue = language === 'en' ? saved.en : saved.ar; return;
    }
    if (!arabic.test(current)) return;
    const pair = {ar: current, en: english(current)};
    textSources.set(node, pair); node.nodeValue = language === 'en' ? pair.en : pair.ar;
  }
  function attributes(element) {
    if (skip(element)) return;
    let saved = attributeSources.get(element);
    if (!saved) { saved = {}; attributeSources.set(element, saved); }
    for (const name of ['alt', 'aria-label', 'title', 'placeholder']) {
      if (!element.hasAttribute(name)) continue;
      const current = element.getAttribute(name), previous = saved[name];
      if (!previous || (current !== previous.ar && current !== previous.en)) {
        if (!arabic.test(current)) continue;
        saved[name] = {ar: current, en: english(current)};
      }
      const value = saved[name][language];
      if (value !== current) element.setAttribute(name, value);
    }
  }
  function visit(root) {
    if (root.nodeType === Node.TEXT_NODE) { text(root); return; }
    if (root.nodeType !== Node.ELEMENT_NODE || skip(root)) return;
    attributes(root);
    for (const child of root.childNodes) visit(child);
  }
  const observer = new MutationObserver(records => {
    observer.disconnect();
    for (const record of records) {
      if (record.type === 'characterData') text(record.target);
      else if (record.type === 'attributes') attributes(record.target);
      else for (const node of record.addedNodes) visit(node);
    }
    observe();
  });
  function observe() { observer.observe(document.documentElement, {subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['alt', 'aria-label', 'title', 'placeholder']}); }
  function select(next) {
    if (!['ar', 'en'].includes(next)) return;
    observer.disconnect(); language = next;
    document.documentElement.lang = next; document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
    visit(document.documentElement);
    for (const button of document.querySelectorAll('[data-gallery-language]')) button.setAttribute('aria-pressed', String(button.dataset.galleryLanguage === next));
    const url = new URL(location.href); url.searchParams.set('ui', next);
    try { history.replaceState(null, '', url); } catch { /* Offline file galleries remain usable. */ }
    try { localStorage.setItem('rtl-gallery-language', next); } catch { /* Storage is optional. */ }
    observe();
  }
  for (const button of document.querySelectorAll('[data-gallery-language]')) button.addEventListener('click', () => select(button.dataset.galleryLanguage));
  // Add English metadata to the search index without changing screenshot language filters.
  for (const card of document.querySelectorAll('.screen-card')) {
    const englishTitle = english(card.dataset.titleAr);
    card.dataset.search += ' ' + englishTitle.toLowerCase() + ' ' + card.querySelector('.capture-meta dd')?.textContent.toLowerCase();
  }
  let remembered; try { remembered = localStorage.getItem('rtl-gallery-language'); } catch {}
  select(new URLSearchParams(location.search).get('ui') || remembered || 'ar');
})();
