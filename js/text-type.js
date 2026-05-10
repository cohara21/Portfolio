/**
 * TextType — vanilla JS typing effect (same behavior as React version).
 * Usage: initTextType('.hero .text-type-target', { text: ['Phrase 1', 'Phrase 2'], ... });
 */
(function () {
  'use strict';

  function decorateHeroIntro(text) {
    var decorated = text;
    var tennisBall = '\uD83C\uDFBE';
    var hand = '\uD83D\uDC4B';
    if (decorated.indexOf(tennisBall) !== -1) {
      decorated = decorated.replace(new RegExp(tennisBall, 'g'), '<span class="tennis-ball-emoji" tabindex="0">' + tennisBall + '</span>');
    }
    if (decorated.indexOf(hand) !== -1) {
      decorated = decorated.replace(new RegExp(hand, 'g'), '<span class="wave-emoji">' + hand + '</span>');
    }
    return decorated;
  }

  function initTextType(selector, options) {
    var el = document.querySelector(selector);
    if (!el) return;

    var opts = options || {};
    var text = opts.text;
    var textArray = Array.isArray(text) ? text : [text || 'Welcome'];
    var typingSpeed = opts.typingSpeed !== undefined ? opts.typingSpeed : 50;
    var initialDelay = opts.initialDelay !== undefined ? opts.initialDelay : 0;
    var pauseDuration = opts.pauseDuration !== undefined ? opts.pauseDuration : 2000;
    var deletingSpeed = opts.deletingSpeed !== undefined ? opts.deletingSpeed : 30;
    var loop = opts.loop !== false;
    var showCursor = opts.showCursor !== false;
    var cursorCharacter = opts.cursorCharacter !== undefined ? opts.cursorCharacter : '|';
    var cursorBlinkDuration = opts.cursorBlinkDuration !== undefined ? opts.cursorBlinkDuration : 0.5;
    var onComplete = typeof opts.onComplete === 'function' ? opts.onComplete : null;

    var displayedText = '';
    var currentCharIndex = 0;
    var isDeleting = false;
    var currentTextIndex = 0;
    var timeoutId = null;

    var contentSpan = document.createElement('span');
    contentSpan.className = 'text-type__content';
    contentSpan.setAttribute('aria-live', 'polite');

    var cursorSpan = document.createElement('span');
    cursorSpan.className = 'text-type__cursor';
    cursorSpan.textContent = cursorCharacter;
    if (!showCursor) cursorSpan.classList.add('text-type__cursor--hidden');

    el.classList.add('text-type');
    el.appendChild(contentSpan);
    if (showCursor) el.appendChild(cursorSpan);

    if (showCursor && cursorBlinkDuration) {
      cursorSpan.style.animation = 'text-type-blink ' + cursorBlinkDuration + 's ease-in-out infinite';
    }

    function run() {
      var currentText = textArray[currentTextIndex] || '';
      var segments = Array.from(currentText);

      if (isDeleting) {
        if (displayedText === '') {
          isDeleting = false;
          if (currentTextIndex === textArray.length - 1 && !loop) return;
          currentTextIndex = (currentTextIndex + 1) % textArray.length;
          timeoutId = setTimeout(run, pauseDuration);
          return;
        }
        displayedText = Array.from(displayedText).slice(0, -1).join('');
        contentSpan.textContent = displayedText;
        timeoutId = setTimeout(run, deletingSpeed);
        return;
      }

      if (currentCharIndex < segments.length) {
        displayedText += segments[currentCharIndex];
        currentCharIndex += 1;
        contentSpan.textContent = displayedText;
        timeoutId = setTimeout(run, typingSpeed);
        return;
      }

      if (textArray.length >= 1) {
        if (!loop && currentTextIndex === textArray.length - 1) {
          if (cursorSpan) cursorSpan.classList.add('text-type__cursor--hidden');
          // Add hero emoji interactions after typing completes.
          contentSpan.innerHTML = decorateHeroIntro(contentSpan.textContent);
          if (onComplete) onComplete();
          return;
        }
        timeoutId = setTimeout(function () {
          isDeleting = true;
          run();
        }, pauseDuration);
      }
    }

    if (initialDelay > 0) {
      timeoutId = setTimeout(run, initialDelay);
    } else {
      run();
    }

    return function cancel() {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }

  document.addEventListener('DOMContentLoaded', function () {
    var target = document.querySelector('.hero .text-type-target');
    if (!target) return;

    var subtitle = document.querySelector('.hero .hero-subtitle');

    if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) {
      target.classList.add('text-type');
      var contentSpan = document.createElement('span');
      contentSpan.className = 'text-type__content';
      contentSpan.setAttribute('aria-live', 'polite');
      contentSpan.innerHTML = '<span class="hero-typed__first-line">' + decorateHeroIntro("Hi, I'm Carson \uD83C\uDFBE'Hara \uD83D\uDC4B") + '</span>';
      target.appendChild(contentSpan);
      if (subtitle) subtitle.classList.add('is-visible');
      return;
    }

    initTextType('.hero .text-type-target', {
      text: "Hi, I'm Carson \uD83C\uDFBE'Hara \uD83D\uDC4B",
      typingSpeed: 75,
      pauseDuration: 1500,
      deletingSpeed: 50,
      loop: false,
      showCursor: true,
      cursorCharacter: '_',
      cursorBlinkDuration: 0.5,
      initialDelay: 400,
      onComplete: function () {
        if (!subtitle) return;
        // Ensure transition triggers reliably.
        requestAnimationFrame(function () {
          subtitle.classList.add('is-visible');
        });
      }
    });
  });
})();
