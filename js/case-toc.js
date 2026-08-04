/**
 * Case study section rail.
 * Builds a table of contents from the page's .case-phase sections and
 * highlights the one currently in view. No-ops on pages without sections
 * or when the viewport is too narrow for the rail to be shown.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var nav = document.querySelector('.case-toc');
    if (!nav) return;

    var sections = [].slice.call(document.querySelectorAll('.case-phase[id]'));
    if (sections.length < 3) { nav.remove(); return; }

    var list = document.createElement('ol');
    var links = {};

    sections.forEach(function (sec) {
      var label = sec.querySelector('.case-phase-label');
      if (!label) return;
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + sec.id;
      a.textContent = label.textContent.trim();
      li.appendChild(a);
      list.appendChild(li);
      links[sec.id] = a;
    });

    nav.appendChild(list);

    if (typeof IntersectionObserver === 'undefined') return;

    var current = null;
    function setCurrent(id) {
      if (id === current) return;
      if (current && links[current]) links[current].classList.remove('is-current');
      if (links[id]) links[id].classList.add('is-current');
      current = id;
    }

    // Track which sections are on screen; the topmost visible one wins.
    var visible = new Set();
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      });
      var topmost = sections.filter(function (s) { return visible.has(s.id); })[0];
      if (topmost) setCurrent(topmost.id);
    }, { rootMargin: '-90px 0px -55% 0px' });

    sections.forEach(function (s) { observer.observe(s); });
  });
})();
