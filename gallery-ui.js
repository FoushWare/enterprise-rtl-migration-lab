'use strict';
(() => {
  const taxonomy = JSON.parse(document.querySelector('#gallery-taxonomy').textContent);
  const issueById = Object.fromEntries(taxonomy.issues.map(issue => [issue.id, issue]));
  const statusById = Object.fromEntries(taxonomy.statuses.map(status => [status.id, status]));
  const globalBar = document.querySelector('#global-issue-filters');
  const number = value => new Intl.NumberFormat('ar-EG').format(value);
  const pageSize = 12;
  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const chapters = [...document.querySelectorAll('article.stage')].map(element => ({
    element, bar: element.querySelector('.filters'), limit: pageSize,
    cards: [...element.querySelectorAll('.gallery > figure')].map(element => ({
      element, annotations: JSON.parse(element.dataset.annotations),
      search: element.dataset.search, image: element.querySelector('button.pic').dataset.src,
    })), matches: [],
  }));
  const chapterById = new Map(chapters.map(chapter => [chapter.element.id, chapter]));
  const dots = [...document.querySelectorAll('#stage-rail .stage-dot')];
  const params = new URLSearchParams(location.search);
  for (const select of globalBar.querySelectorAll('select')) {
    const value = params.get(select.dataset.filter);
    if ([...select.options].some(option => option.value === value)) select.value = value;
  }
  function filters(bar) {
    return {
      values: [...bar.querySelectorAll('select')].map(select => ({key: select.dataset.filter, value: select.value})).filter(item => item.value),
      query: (bar.querySelector('input[type="search"]')?.value || '').trim().toLowerCase(),
    };
  }
  function annotationMatches(annotation, constraints) {
    return constraints.every(constraint => constraint.key === 'issue' ? annotation.issueId === constraint.value : constraint.key === 'status' ? annotation.status === constraint.value : annotation.categories.includes(constraint.value));
  }
  function updateChips(card) {
    const expanded = card.element.querySelector('.card-more').open;
    let shown = 0;
    for (const chip of card.element.querySelectorAll('[data-chip-issue]')) {
      const relevant = card.matchingAnnotations.some(annotation => annotation.issueId === chip.dataset.chipIssue && annotation.status === chip.dataset.chipStatus);
      chip.hidden = !relevant || (!expanded && shown >= 2);
      if (relevant) shown++;
    }
    let hint = card.element.querySelector('.more-issue-hint');
    if (!hint) {
      hint = document.createElement('p'); hint.className = 'more-issue-hint';
      card.element.querySelector('.issue-chips')?.after(hint);
    }
    if (hint.isConnected) {
      hint.hidden = expanded || shown <= 2;
      hint.textContent = 'باقي الموضوعات موجودة جوه «اعرف أكتر».';
    }
  }
  function renderPage(chapter, animate = false) {
    const previouslyVisible = new Set(chapter.cards.filter(card => !card.element.hidden));
    const visible = new Set(chapter.matches.slice(0, chapter.limit));
    chapter.cards.forEach(card => {
      card.element.hidden = !visible.has(card);
      card.element.dataset.filterMatch = chapter.matches.includes(card) ? 'true' : 'false';
      card.element.classList.toggle('just-revealed', animate && visible.has(card) && !previouslyVisible.has(card));
    });
    const shown = visible.size, total = chapter.matches.length, remaining = Math.max(0, total - shown);
    chapter.element.querySelector('.stage-result-count').textContent = number(total) + ' صورة مطابقة';
    const count = 'المعروض ' + number(shown) + ' من ' + number(total) + ' صورة';
    chapter.bar.querySelector('output').textContent = count;
    chapter.element.querySelector('.page-count').textContent = count;
    const more = chapter.element.querySelector('.show-more');
    more.hidden = remaining === 0;
    more.textContent = 'اعرض ' + number(Math.min(pageSize, remaining)) + ' صورة كمان (' + number(remaining) + ' باقيين)';
    chapter.element.querySelector('.show-all').hidden = remaining === 0;
    chapter.element.querySelector('.show-less').hidden = chapter.limit <= pageSize || total <= pageSize;
  }
  function updateGlobalCount() {
    const total = chapters.reduce((sum, chapter) => sum + chapter.matches.length, 0);
    const shown = chapters.reduce((sum, chapter) => sum + Math.min(chapter.limit, chapter.matches.length), 0);
    document.querySelector('#global-count').textContent = number(total) + ' صورة مطابقة · المعروض دلوقتي ' + number(shown) + ' · ده عدد صور، مش عدد عيوب';
    document.querySelector('#no-matches').hidden = total > 0;
  }
  function updateUrl() {
    const url = new URL(location.href);
    for (const select of globalBar.querySelectorAll('select')) {
      if (select.value) url.searchParams.set(select.dataset.filter, select.value);
      else url.searchParams.delete(select.dataset.filter);
    }
    try { history.replaceState(null, '', url); } catch { /* File URLs remain usable without history access. */ }
  }
  function applyAll() {
    const global = filters(globalBar);
    for (const chapter of chapters) {
      const local = filters(chapter.bar);
      const semantic = [...global.values, ...local.values].filter(item => ['category', 'issue', 'status'].includes(item.key));
      chapter.limit = pageSize;
      chapter.matches = chapter.cards.filter(card => {
        card.matchingAnnotations = card.annotations.filter(annotation => annotationMatches(annotation, semantic));
        const match = card.matchingAnnotations.length > 0
          && local.values.filter(item => !['category', 'issue', 'status'].includes(item.key)).every(item => card.element.dataset[item.key] === item.value)
          && [global.query, local.query].every(query => !query || card.search.includes(query));
        for (const note of card.element.querySelectorAll('.issue-item')) {
          note.hidden = semantic.length > 0 && !card.matchingAnnotations.some(annotation => annotation.issueId === note.dataset.noteIssue && annotation.status === note.dataset.noteStatus);
        }
        const associated = card.matchingAnnotations.filter(annotation => annotation.issueId);
        card.element.querySelector('.matching-issues-count').textContent = associated.length ? '(' + number(associated.length) + ')' : '';
        const statuses = [...new Set(card.matchingAnnotations.map(annotation => annotation.status))];
        card.element.querySelector('.shot-evidence-status').textContent = statuses.length === 1 ? statusById[statuses[0]].label : 'الصورة مرتبطة بأكثر من حالة';
        updateChips(card);
        return match;
      });
      chapter.element.hidden = chapter.matches.length === 0;
      renderPage(chapter);
    }
    for (const dot of dots) {
      const unavailable = chapterById.get(dot.dataset.jumpStage).matches.length === 0;
      dot.setAttribute('aria-disabled', String(unavailable));
      dot.classList.toggle('unavailable', unavailable);
    }
    const selectedIssue = globalBar.querySelector('[data-filter="issue"]').value;
    document.querySelectorAll('[data-issue-pick]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.issuePick === selectedIssue)));
    updateGlobalCount(); updateUrl(); updateReadingPosition();
  }
  function clearBar(bar) { bar.querySelectorAll('select,input').forEach(control => { control.value = ''; }); }
  function clearAll() { clearBar(globalBar); chapters.forEach(chapter => clearBar(chapter.bar)); }
  document.querySelector('#reset-all').addEventListener('click', () => { clearAll(); applyAll(); });
  for (const bar of [globalBar, ...chapters.map(chapter => chapter.bar)]) {
    let searchTimer;
    bar.addEventListener('input', event => {
      clearTimeout(searchTimer);
      if (event.target.type === 'search') searchTimer = setTimeout(applyAll, 150); else applyAll();
    });
    bar.addEventListener('change', () => { clearTimeout(searchTimer); applyAll(); });
  }
  document.querySelectorAll('[data-issue-pick]').forEach(button => button.addEventListener('click', () => {
    clearAll(); globalBar.querySelector('[data-filter="issue"]').value = button.dataset.issuePick; applyAll();
    const firstMatch = chapters.find(chapter => chapter.matches.length > 0);
    if (firstMatch) {
      const destination = firstMatch.element.querySelector('.stage-gallery-heading');
      destination.tabIndex = -1;
      destination.focus({preventScroll: true});
      destination.scrollIntoView({behavior: reducedMotion() ? 'instant' : 'smooth', block: 'start'});
      const url = new URL(location.href); url.hash = firstMatch.element.id;
      try { history.replaceState(null, '', url); } catch { /* Offline gallery remains usable. */ }
    }
  }));
  document.querySelectorAll('.issue-key article').forEach(card => {
    card.addEventListener('click', event => {
      if (!event.target.closest('button,a,summary')) card.querySelector('[data-issue-pick]')?.click();
    });
  });
  for (const chapter of chapters) {
    chapter.element.querySelector('.reset-local').addEventListener('click', () => { clearBar(chapter.bar); applyAll(); });
    chapter.element.querySelector('.show-more').addEventListener('click', () => {
      const nextCard = chapter.matches[chapter.limit]; chapter.limit += pageSize; renderPage(chapter, true); updateGlobalCount();
      nextCard?.element.scrollIntoView({behavior: reducedMotion() ? 'instant' : 'smooth', block: 'start'});
    });
    chapter.element.querySelector('.show-all').addEventListener('click', () => {
      chapter.limit = chapter.matches.length; renderPage(chapter); updateGlobalCount();
    });
    chapter.element.querySelector('.show-less').addEventListener('click', () => {
      chapter.limit = pageSize; renderPage(chapter); updateGlobalCount(); jumpTo(chapter.element.id, false);
    });
    for (const card of chapter.cards) card.element.querySelector('.card-more').addEventListener('toggle', () => updateChips(card));
    for (const button of chapter.element.querySelectorAll('[data-neighbor]')) button.addEventListener('click', () => {
      const enabled = chapters.filter(candidate => !candidate.element.hidden), index = enabled.indexOf(chapter);
      const next = enabled[index + (button.dataset.neighbor === 'next' ? 1 : -1)]; if (next) jumpTo(next.element.id);
    });
  }
  function jumpTo(id, updateHash = true) {
    const chapter = chapterById.get(id); if (!chapter || chapter.element.hidden) return;
    chapter.element.scrollIntoView({behavior: reducedMotion() ? 'instant' : 'smooth', block: 'start'});
    if (updateHash) { const url = new URL(location.href); url.hash = id; try { history.replaceState(null, '', url); } catch {} }
  }
  document.querySelectorAll('[data-jump-stage]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault(); jumpTo(link.dataset.jumpStage);
  }));
  const railCurrent = document.querySelector('#rail-current'), preview = document.querySelector('#rail-preview');
  let activeId = '', scheduled = false;
  function updateReadingPosition() {
    scheduled = false;
    const available = chapters.filter(chapter => !chapter.element.hidden);
    let active = available.find(chapter => { const rect = chapter.element.getBoundingClientRect(); return rect.top <= innerHeight * 0.38 && rect.bottom > innerHeight * 0.38; });
    if (!active) active = available.find(chapter => chapter.element.getBoundingClientRect().top >= 0) || available.at(-1);
    activeId = active?.element.id || '';
    for (const dot of dots) {
      const selected = dot.dataset.jumpStage === activeId;
      if (selected) dot.setAttribute('aria-current', 'step'); else dot.removeAttribute('aria-current');
      dot.tabIndex = selected ? 0 : -1;
    }
    railCurrent.textContent = active ? active.element.dataset.stageNumber + ' · ' + active.element.dataset.stageName : 'مفيش مراحل مطابقة';
    if (!preview.dataset.previewing) preview.textContent = active ? 'المرحلة ' + active.element.dataset.stageNumber + ' من 12' : 'غيّر الفلاتر لعرض المراحل';
    const distance = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const progress = Math.min(1, Math.max(0, scrollY / distance));
    document.querySelector('#reading-progress').style.transform = 'scaleX(' + progress + ')';
    document.querySelector('#back-top').hidden = scrollY < 600;
    const enabled = chapters.filter(chapter => !chapter.element.hidden);
    enabled.forEach((chapter, index) => {
      for (const button of chapter.element.querySelectorAll('[data-neighbor]')) {
        const next = enabled[index + (button.dataset.neighbor === 'next' ? 1 : -1)]; button.disabled = !next;
        if (next) button.setAttribute('aria-label', (button.dataset.neighbor === 'next' ? 'المرحلة التالية: ' : 'المرحلة السابقة: ') + next.element.dataset.stageName);
      }
    });
  }
  for (const dot of dots) {
    function describe() {
      preview.dataset.previewing = 'true';
      const chapter = chapterById.get(dot.dataset.jumpStage);
      preview.textContent = chapter.element.hidden ? 'مفيش صور مطابقة في المرحلة دي' : 'هتروح للمرحلة ' + chapter.element.dataset.stageNumber + ': ' + chapter.element.dataset.stageName;
    }
    function restore() { delete preview.dataset.previewing; updateReadingPosition(); }
    dot.addEventListener('mouseenter', describe); dot.addEventListener('focus', describe);
    dot.addEventListener('mouseleave', restore); dot.addEventListener('blur', restore);
    dot.addEventListener('keydown', event => {
      const keys = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End']; if (!keys.includes(event.key)) return;
      event.preventDefault(); const enabled = dots.filter(item => item.getAttribute('aria-disabled') !== 'true'); const index = enabled.indexOf(dot);
      const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? enabled.length - 1 : (index + (['ArrowDown', 'ArrowLeft'].includes(event.key) ? 1 : -1) + enabled.length) % enabled.length;
      enabled[nextIndex]?.focus();
    });
  }
  function schedulePosition() { if (!scheduled) { scheduled = true; requestAnimationFrame(updateReadingPosition); } }
  addEventListener('scroll', schedulePosition, {passive: true}); addEventListener('resize', schedulePosition);
  document.querySelector('#back-top').addEventListener('click', event => { event.preventDefault(); document.querySelector('#top').scrollIntoView({behavior: reducedMotion() ? 'instant' : 'smooth'}); });
  // Image viewer: all matching screenshots in the stage remain available, including later thumbnail pages.
  const box = document.querySelector('#lightbox'), big = document.querySelector('#big'), info = document.querySelector('#lightbox-info');
  let viewerCards = [], viewerIndex = 0, zoom = 1, returnTarget = null, previousOverflow = '';
  const inertBefore = new Map();
  function showImage(index) {
    viewerIndex = (index + viewerCards.length) % viewerCards.length; const card = viewerCards[viewerIndex];
    zoom = 1; big.src = card.image; big.alt = card.element.dataset.titleAr; big.classList.add('fit'); big.style.width = ''; big.style.height = '';
    document.querySelector('#zoom').textContent = 'تكبير 1×';
    document.querySelector('#count').textContent = 'صورة ' + number(viewerIndex + 1) + ' من ' + number(viewerCards.length) + ' في المرحلة دي';
    document.querySelector('#original').href = card.image;
    info.replaceChildren(); const title = document.createElement('h3'); title.textContent = card.element.dataset.titleAr; info.append(title);
    const tags = card.element.querySelector('.shot-tags').cloneNode(true); info.append(tags);
    const status = document.createElement('p'); status.textContent = card.element.querySelector('.shot-evidence-status').textContent; info.append(status);
    const notes = card.element.querySelector('.issue-annotations').cloneNode(true); info.append(notes);
    const hint = document.createElement('p'); hint.className = 'viewer-hint'; hint.textContent = 'Esc للإغلاق · ← للصورة التالية · → للصورة السابقة'; info.append(hint);
    document.querySelector('#next').disabled = viewerCards.length < 2; document.querySelector('#prev').disabled = viewerCards.length < 2;
  }
  function openImage(chapter, card, target) {
    viewerCards = chapter.matches; returnTarget = target; viewerIndex = viewerCards.indexOf(card); if (viewerIndex < 0) return;
    previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    for (const child of document.body.children) if (child !== box && child.tagName !== 'SCRIPT') { inertBefore.set(child, child.inert); child.inert = true; }
    box.hidden = false; box.classList.add('open'); showImage(viewerIndex); document.querySelector('#close').focus();
  }
  function closeImage() {
    box.hidden = true; box.classList.remove('open'); big.removeAttribute('src'); document.body.style.overflow = previousOverflow;
    inertBefore.forEach((value, element) => { element.inert = value; }); inertBefore.clear();
    if (returnTarget?.isConnected && !returnTarget.closest('[hidden]')) returnTarget.focus();
  }
  for (const chapter of chapters) for (const card of chapter.cards) card.element.querySelector('button.pic').addEventListener('click', event => openImage(chapter, card, event.currentTarget));
  document.querySelector('#close').addEventListener('click', closeImage);
  document.querySelector('#next').addEventListener('click', () => showImage(viewerIndex + 1));
  document.querySelector('#prev').addEventListener('click', () => showImage(viewerIndex - 1));
  document.querySelector('#zoom').addEventListener('click', () => {
    zoom = zoom === 1 ? 1.5 : zoom === 1.5 ? 2.5 : 1; big.classList.toggle('fit', zoom === 1); big.style.width = zoom === 1 ? '' : zoom * 100 + '%'; big.style.height = zoom === 1 ? '' : 'auto';
    document.querySelector('#zoom').textContent = 'تكبير ' + zoom + '×';
  });
  document.addEventListener('keydown', event => {
    if (box.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); closeImage(); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); showImage(viewerIndex + 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showImage(viewerIndex - 1); }
    if (event.key === 'Tab') {
      const controls = [...box.querySelectorAll('button,a[href],summary,[tabindex]')].filter(element => !element.disabled && element.offsetParent !== null);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  applyAll();
  if (location.hash.startsWith('#stage-')) {
    const chapter = chapterById.get(location.hash.slice(1)); if (chapter && !chapter.element.hidden) chapter.element.scrollIntoView({behavior: 'instant', block: 'start'});
  }
})();
