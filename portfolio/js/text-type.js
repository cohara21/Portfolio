/**
 * TextType — vanilla JS typing effect (same behavior as React version).
 * Usage: initTextType('.hero .text-type-target', { text: ['Phrase 1', 'Phrase 2'], ... });
 */
(function () {
  'use strict';

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

      if (isDeleting) {
        if (displayedText === '') {
          isDeleting = false;
          if (currentTextIndex === textArray.length - 1 && !loop) return;
          currentTextIndex = (currentTextIndex + 1) % textArray.length;
          timeoutId = setTimeout(run, pauseDuration);
          return;
        }
        displayedText = displayedText.slice(0, -1);
        contentSpan.textContent = displayedText;
        timeoutId = setTimeout(run, deletingSpeed);
        return;
      }

      if (currentCharIndex < currentText.length) {
        displayedText += currentText[currentCharIndex];
        currentCharIndex += 1;
        contentSpan.textContent = displayedText;
        timeoutId = setTimeout(run, typingSpeed);
        return;
      }

      if (textArray.length >= 1) {
        if (!loop && currentTextIndex === textArray.length - 1) {
          if (cursorSpan) cursorSpan.classList.add('text-type__cursor--hidden');
          // Wrap wave emoji in span for hover animation
          var hand = '\uD83D\uDC4B';
          if (contentSpan.textContent.indexOf(hand) !== -1) {
            contentSpan.innerHTML = contentSpan.textContent.replace(new RegExp(hand, 'g'), '<span class="wave-emoji">' + hand + '</span>');
          }
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
    if (target) {
      initTextType('.hero .text-type-target', {
        text: "Hi, I'm Carson \uD83C\uDFBE'Hara \uD83D\uDC4B\na Student Athlete at The Savannah College of Art and Design\nstudying UX Design",
        typingSpeed: 75,
        pauseDuration: 1500,
        deletingSpeed: 50,
        loop: false,
        showCursor: true,
        cursorCharacter: '_',
        cursorBlinkDuration: 0.5,
        initialDelay: 400
      });
    }
  });
})();
