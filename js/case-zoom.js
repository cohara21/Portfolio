/*
 * Case-study image zoom.
 *
 * Several case-study images are documents, not screenshots — the service
 * blueprint is 2000px wide and the card sort is 2000x480, both shown in an
 * 800px column. At that size they read as texture rather than evidence.
 * Clicking one opens it full-screen at its own resolution.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var images = [].slice.call(document.querySelectorAll('.case-image'));
    if (!images.length) return;

    var overlay = null;
    var overlayImg = null;
    var caption = null;
    var lastFocused = null;

    function build() {
      overlay = document.createElement('div');
      overlay.className = 'case-zoom';
      overlay.setAttribute('aria-hidden', 'true');

      var frame = document.createElement('div');
      frame.className = 'case-zoom-frame';
      frame.setAttribute('role', 'dialog');
      frame.setAttribute('aria-modal', 'true');
      frame.setAttribute('aria-label', 'Image viewer');

      overlayImg = document.createElement('img');
      overlayImg.className = 'case-zoom-img';
      overlayImg.alt = '';

      caption = document.createElement('p');
      caption.className = 'case-zoom-caption';

      var close = document.createElement('button');
      close.className = 'case-zoom-close';
      close.type = 'button';
      close.setAttribute('aria-label', 'Close image viewer');
      close.innerHTML =
        '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">' +
        '<path d="M6 6l12 12M6 18L18 6" stroke="currentColor" stroke-width="2" ' +
        'stroke-linecap="round" fill="none"/></svg>';
      close.addEventListener('click', hide);

      frame.appendChild(overlayImg);
      frame.appendChild(caption);
      overlay.appendChild(close);
      overlay.appendChild(frame);
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay || e.target === frame) hide();
      });
      document.body.appendChild(overlay);
    }

    function show(img) {
      if (!overlay) build();
      lastFocused = document.activeElement;
      overlayImg.src = img.currentSrc || img.src;
      overlayImg.alt = img.alt || '';

      // Reuse the caption already sitting under the image, when there is one.
      // Captions are the `p.muted` directly after a `.case-media` block; a plain
      // `<p>` there is body copy, not a caption, so it must not be picked up.
      var sibling = img.parentElement && img.parentElement.nextElementSibling;
      var isCaption = sibling && sibling.tagName === 'P' &&
        (sibling.classList.contains('muted') || sibling.classList.contains('case-caption'));
      var text = isCaption ? sibling.textContent : img.alt;
      caption.textContent = text || '';
      caption.hidden = !text;

      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      overlay.querySelector('.case-zoom-close').focus();
    }

    function hide() {
      if (!overlay) return;
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay && overlay.classList.contains('is-open')) hide();
    });

    images.forEach(function (img) {
      // The image becomes the control, so it needs to look and behave like one.
      img.classList.add('is-zoomable');
      img.setAttribute('role', 'button');
      img.setAttribute('tabindex', '0');
      img.title = 'Click to view full size';
      img.addEventListener('click', function () { show(img); });
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(img); }
      });
    });
  });
})();
