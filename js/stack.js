/**
 * Stack — hover to fan out (left to right).
 * Hover a fanned card to focus it. When fanned, only 6 visible cards show.
 * Autoplay: one card every 2.5 s, using a single recursive setTimeout (no setInterval).
 */
(function () {
  'use strict';

  var STACK_IMAGES = [
    'images/about/stadium1.webp',
    'images/about/stadium2.webp',
    'images/about/stadium3.webp',
    'images/about/stadium4.webp',
    'images/about/stadium5.webp',
    'images/about/stadium6.webp',
    'images/about/stadium7.webp',
    'images/about/stadium8.webp',
    'images/about/stadium9.webp',
    'images/about/stadium10.webp',
    'images/about/stadium11.webp',
    'images/about/stadium12.webp'
  ];

  var AUTOPLAY_DELAY   = 2500;   // ms between advances
  var FADE_MS          = 220;    // fade-out duration
  var ROTATION_DEG     = 4;
  var SCALE_STEP       = 0.06;
  var VISIBLE_STACK_SIZE = 6;
  var CRITICAL_IMAGE_COUNT = 3;   // images that must load before the stack renders
  var FAN_STEP_X       = 52;
  var FAN_TILT_DEG     = 24;
  var FAN_ORIGIN_X     = '50%';
  var FAN_ORIGIN_Y     = '100%';

  function initStack(container) {
    if (!container || !STACK_IMAGES.length) return;

    var length = STACK_IMAGES.length;
    container.classList.add('stack-container');
    container.innerHTML = '';

    /* ---- create card elements ---- */
    var cards = [];
    for (var j = 0; j < length; j++) {
      var card = document.createElement('div');
      card.className = 'stack-card';
      card.setAttribute('data-image-index', j);
      var img = document.createElement('img');
      img.src = STACK_IMAGES[j];
      img.alt = 'Stadium photo ' + (j + 1);
      img.loading = 'eager';
      img.decoding = 'async';
      // Cards deeper in the stack aren't read until the rotation reaches them,
      // so they shouldn't compete with above-the-fold work for bandwidth.
      img.fetchPriority = j < CRITICAL_IMAGE_COUNT ? 'high' : 'low';
      card.appendChild(img);
      container.appendChild(card);
      cards.push(card);
    }

    /* ---- state ---- */
    var currentIndex = 0;
    var fanActive    = false;
    var fanHoverIdx  = null;
    var visibleOrder = null;
    var animating    = false;   // true while a fade transition is running
    var autoTimer    = null;    // the ONE pending setTimeout id

    /* ---- helpers ---- */
    function getStackOrder() {
      var order = [];
      for (var k = 0; k < length; k++) order.push((currentIndex + 1 + k) % length);
      return order;
    }

    function baseTransform(pos) {
      var s = 1 + pos * SCALE_STEP - VISIBLE_STACK_SIZE * SCALE_STEP;
      var r = (VISIBLE_STACK_SIZE - 1 - pos) * ROTATION_DEG;
      return 'rotate(' + r + 'deg) scale(' + s + ')';
    }

    function fanTransform(idx, focused) {
      var spread = (VISIBLE_STACK_SIZE - 1) * FAN_STEP_X;
      var x = (VISIBLE_STACK_SIZE - 1 - idx) * FAN_STEP_X - spread;
      var t = idx / (VISIBLE_STACK_SIZE - 1);
      var deg = -FAN_TILT_DEG * Math.sin((t - 0.5) * Math.PI);
      var sc = focused ? 1.05 : 0.95;
      return 'translateX(' + x + 'px) rotate(' + deg + 'deg) scale(' + sc + ')';
    }

    function updateTransforms() {
      var children = container.children;
      for (var i = 0; i < children.length; i++) {
        var c = children[i];
        var pos = Math.min(i, VISIBLE_STACK_SIZE - 1);
        var bt = baseTransform(pos);

        if (fanActive) {
          if (i < length - VISIBLE_STACK_SIZE) {
            c.style.visibility = 'hidden';
            c.style.pointerEvents = 'none';
            c.style.transform = bt;
            c.style.transformOrigin = FAN_ORIGIN_X + ' ' + FAN_ORIGIN_Y;
            c.classList.remove('stack-card--fanned', 'stack-card--focused');
          } else {
            var imgIdx = parseInt(c.getAttribute('data-image-index'), 10);
            var fi = visibleOrder ? visibleOrder.indexOf(imgIdx) : i - (length - VISIBLE_STACK_SIZE);
            if (fi < 0) fi = i - (length - VISIBLE_STACK_SIZE);
            var focused = fanHoverIdx === fi;
            c.style.visibility = '';
            c.style.pointerEvents = '';
            c.style.transformOrigin = FAN_ORIGIN_X + ' ' + FAN_ORIGIN_Y;
            c.style.transform = fanTransform(fi, focused);
            c.style.zIndex = focused ? 100 : (length - VISIBLE_STACK_SIZE + fi);
            c.classList.add('stack-card--fanned');
            if (focused) c.classList.add('stack-card--focused');
            else c.classList.remove('stack-card--focused');
          }
        } else {
          c.style.visibility = '';
          c.style.pointerEvents = '';
          c.style.zIndex = i;
          c.style.transformOrigin = FAN_ORIGIN_X + ' ' + FAN_ORIGIN_Y;
          c.style.transform = bt;
          c.classList.remove('stack-card--fanned', 'stack-card--focused');
        }
      }
    }

    function applyOrder() {
      var order = getStackOrder();
      for (var i = 0; i < order.length; i++) container.appendChild(cards[order[i]]);
      visibleOrder = order.slice(-VISIBLE_STACK_SIZE);
      updateTransforms();
    }

    /* ---- suppress transform transitions on all cards ---- */
    function setNoMotion(on) {
      for (var i = 0; i < cards.length; i++) {
        if (on) cards[i].classList.add('stack-card--no-motion');
        else    cards[i].classList.remove('stack-card--no-motion');
      }
    }

    /* ---- advance one card: reorder instantly, then fade NEW card in ---- */
    function advanceWithFade(done) {
      if (animating) return;          // guard: only one transition at a time
      if (length <= 1) { if (done) done(); return; }

      animating = true;

      // 1. Suppress transform transitions so the DOM reorder is invisible
      setNoMotion(true);

      // 2. Advance index and reorder DOM (instant — no visual change yet)
      currentIndex = (currentIndex + 1) % length;
      applyOrder();

      // 3. New top card: start invisible, then crossfade in over the old one
      var newTop = container.lastElementChild;
      if (newTop) {
        newTop.classList.add('stack-card--fade-in');   // opacity: 0
        newTop.offsetHeight;                           // force browser to register opacity 0
        newTop.classList.remove('stack-card--fade-in');// CSS transition: 0 → 1 over 220ms
      }

      // 4. Wait for fade-in to finish, then clean up
      setTimeout(function () {
        requestAnimationFrame(function () {
          setNoMotion(false);
          animating = false;
          if (done) done();
        });
      }, FADE_MS);
    }

    /* ---- autoplay: single recursive setTimeout ---- */
    function stopAutoplay() {
      if (autoTimer !== null) { clearTimeout(autoTimer); autoTimer = null; }
    }

    function startAutoplay() {
      stopAutoplay();
      autoTimer = setTimeout(function tick() {
        autoTimer = null;                            // consumed
        advanceWithFade(function () {
          // schedule next ONLY after fade is done
          autoTimer = setTimeout(tick, AUTOPLAY_DELAY);
        });
      }, AUTOPLAY_DELAY);
    }

    /* ---- events ---- */
    container.addEventListener('mouseenter', function () {
      if (animating) return;           // ignore spurious events during DOM reorder
      stopAutoplay();
      fanActive = true;
      fanHoverIdx = null;
      visibleOrder = getStackOrder().slice(-VISIBLE_STACK_SIZE);
      container.classList.add('stack-container--fanned');
      updateTransforms();
    });

    container.addEventListener('mouseleave', function () {
      if (animating) return;           // ignore spurious events during DOM reorder
      fanActive = false;
      fanHoverIdx = null;
      container.classList.remove('stack-container--fanned');
      updateTransforms();
      if (length > 1) startAutoplay();
    });

    container.addEventListener('mouseover', function (e) {
      if (!fanActive) return;
      var c = e.target.closest('.stack-card');
      if (!c || !c.classList.contains('stack-card--fanned')) return;
      var idx = parseInt(c.getAttribute('data-image-index'), 10);
      if (isNaN(idx) || !visibleOrder) return;
      var fi = visibleOrder.indexOf(idx);
      if (fi >= 0) { fanHoverIdx = fi; updateTransforms(); }
    });

    container.addEventListener('mouseout', function (e) {
      if (!fanActive) return;
      var rel = e.relatedTarget;
      if (rel && container.contains(rel) && rel.closest('.stack-card--fanned')) return;
      fanHoverIdx = null;
      updateTransforms();
    });

    container.addEventListener('click', function (e) {
      var c = e.target.closest('.stack-card');
      if (!c) return;

      if (fanActive) {
        var idx = parseInt(c.getAttribute('data-image-index'), 10);
        if (!isNaN(idx)) {
          currentIndex = idx;
          fanActive = false;
          fanHoverIdx = null;
          visibleOrder = null;
          container.classList.remove('stack-container--fanned');
          applyOrder();
        }
      } else {
        // Manual click: stop autoplay, advance, then restart autoplay
        stopAutoplay();
        advanceWithFade(function () { if (length > 1) startAutoplay(); });
      }
    });

    /* ---- pause autoplay when section scrolls out of view ---- */
    var section = container.closest('.about-stadium-section');
    if (section && typeof IntersectionObserver !== 'undefined') {
      var viewObserver = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) {
          stopAutoplay();
        } else if (!fanActive && length > 1) {
          startAutoplay();
        }
      }, { threshold: 0.08, rootMargin: '40px 0px' });
      viewObserver.observe(section);
    }

    /* ---- init ---- */
    container.classList.add('stack-container--ready');
    applyOrder();
    if (length > 1) startAutoplay();
  }

  function loadImage(src) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = img.onerror = function () { resolve(); };
      img.src = src;
    });
  }

  // Only the top few cards are legible in the stacked state, so waiting on the
  // whole set before rendering anything costs seconds for no visible benefit.
  // Block on these, then let the rest stream in behind the rendered stack.
  function preloadCriticalImages(urls) {
    return Promise.all(urls.slice(0, CRITICAL_IMAGE_COUNT).map(loadImage));
  }

  document.addEventListener('DOMContentLoaded', function () {
    var container = document.getElementById('about-stack');
    if (!container || container.dataset.stackInit === 'true') return;

    var section = container.closest('.about-stadium-section') || container;

    function boot() {
      if (container.dataset.stackInit === 'true') return;
      container.dataset.stackInit = 'true';
      preloadCriticalImages(STACK_IMAGES).then(function () {
        initStack(container);
      });
    }

    if (typeof IntersectionObserver === 'undefined') {
      boot();
      return;
    }

    var bootObserver = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      bootObserver.disconnect();
      boot();
    }, { threshold: 0.12, rootMargin: '120px 0px' });

    bootObserver.observe(section);
  });
})();
