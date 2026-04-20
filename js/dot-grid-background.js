// Faithful vanilla JS port of the React DotGrid component
// Replicates GSAP InertiaPlugin (momentum + deceleration) and elastic.out return
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    if (!document.body.classList.contains('about-page')) return;
    if (window.matchMedia && !window.matchMedia('(min-width: 769px)').matches) return;

    var container = document.getElementById('about-silk-bg');
    var hero = document.querySelector('.about-hero');
    if (!container || !hero) return;

    var dotSize = 5;
    var gap = 15;
    var baseColor = '#eeeeee';
    var activeColor = (function () {
      var val = getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim();
      return val && /^#([0-9A-Fa-f]{3}){1,2}$/.test(val) ? val : '#1E4FFF';
    })();
    var proximity = 120;
    var speedTrigger = 100;
    var maxSpeed = 5000;
    var shockRadius = 250;
    var shockStrength = 5;
    var resistance = 750;
    var returnDuration = 1.5;

    function hexToRgb(hex) {
      var m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
      if (!m) return { r: 0, g: 0, b: 0 };
      return {
        r: parseInt(m[1], 16),
        g: parseInt(m[2], 16),
        b: parseInt(m[3], 16)
      };
    }

    // elastic.out(amplitude=1, period=0.75) easing — matches GSAP's elastic.out(1, 0.75)
    function elasticOut(t) {
      if (t <= 0) return 0;
      if (t >= 1) return 1;
      var p = 0.75;
      var s = p / 4;
      return Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / p) + 1;
    }

    var baseRgb = hexToRgb(baseColor);
    var activeRgb = hexToRgb(activeColor);

    var canvas = document.createElement('canvas');
    canvas.className = 'dot-grid__canvas';
    canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var dots = [];

    var circlePath = (typeof Path2D !== 'undefined') ? new Path2D() : null;
    if (circlePath) circlePath.arc(0, 0, dotSize / 2, 0, Math.PI * 2);

    var proxSq = proximity * proximity;

    var pointer = {
      x: 0, y: 0,
      vx: 0, vy: 0,
      speed: 0,
      lastX: 0, lastY: 0,
      lastTime: 0
    };

    // Dot states: 0 = idle, 1 = inertia (decelerating), 2 = returning (elastic)
    var IDLE = 0, INERTIA = 1, RETURNING = 2;

    function buildGrid() {
      var rect = hero.getBoundingClientRect();
      var width = Math.max(1, Math.round(rect.width));
      var height = Math.max(1, Math.round(rect.height));
      var dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var cell = dotSize + gap;
      var cols = Math.floor((width + gap) / cell);
      var rows = Math.floor((height + gap) / cell);
      var gridW = cell * cols - gap;
      var gridH = cell * rows - gap;
      var startX = (width - gridW) / 2 + dotSize / 2;
      var startY = (height - gridH) / 2 + dotSize / 2;

      dots = [];
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
          dots.push({
            cx: startX + x * cell,
            cy: startY + y * cell,
            xOffset: 0,
            yOffset: 0,
            vx: 0,
            vy: 0,
            state: IDLE,
            returnStart: 0,
            returnFromX: 0,
            returnFromY: 0
          });
        }
      }
    }

    function applyInertia(dot, pushVx, pushVy) {
      if (dot.state !== IDLE) return;
      dot.vx = pushVx;
      dot.vy = pushVy;
      dot.state = INERTIA;
    }

    function onMove(e) {
      var now = performance.now();
      var pr = pointer;
      var dt = pr.lastTime ? now - pr.lastTime : 16;
      var dx = e.clientX - pr.lastX;
      var dy = e.clientY - pr.lastY;
      var vx = (dx / dt) * 1000;
      var vy = (dy / dt) * 1000;
      var speed = Math.hypot(vx, vy);
      if (speed > maxSpeed) {
        var scale = maxSpeed / speed;
        vx *= scale;
        vy *= scale;
        speed = maxSpeed;
      }
      pr.lastTime = now;
      pr.lastX = e.clientX;
      pr.lastY = e.clientY;
      pr.vx = vx;
      pr.vy = vy;
      pr.speed = speed;

      var rect = hero.getBoundingClientRect();
      pr.x = e.clientX - rect.left;
      pr.y = e.clientY - rect.top;

      if (speed > speedTrigger) {
        for (var i = 0; i < dots.length; i++) {
          var dot = dots[i];
          var dist = Math.hypot(dot.cx - pr.x, dot.cy - pr.y);
          if (dist < proximity && dot.state === IDLE) {
            var pushX = dot.cx - pr.x + vx * 0.005;
            var pushY = dot.cy - pr.y + vy * 0.005;
            applyInertia(dot, pushX, pushY);
          }
        }
      }
    }

    function onClick(e) {
      var rect = hero.getBoundingClientRect();
      var cx = e.clientX - rect.left;
      var cy = e.clientY - rect.top;
      if (cx < 0 || cy < 0 || cx > rect.width || cy > rect.height) return;

      for (var i = 0; i < dots.length; i++) {
        var dot = dots[i];
        var dist = Math.hypot(dot.cx - cx, dot.cy - cy);
        if (dist < shockRadius && dot.state === IDLE) {
          var falloff = Math.max(0, 1 - dist / shockRadius);
          var pushX = (dot.cx - cx) * shockStrength * falloff;
          var pushY = (dot.cy - cy) * shockStrength * falloff;
          applyInertia(dot, pushX, pushY);
        }
      }
    }

    var lastFrame = 0;
    var rafId = null;

    function render(timestamp) {
      var dt = lastFrame ? (timestamp - lastFrame) / 1000 : 0.016;
      if (dt > 0.1) dt = 0.016;
      lastFrame = timestamp;

      var width = canvas.clientWidth;
      var height = canvas.clientHeight;
      ctx.clearRect(0, 0, width, height);

      var px = pointer.x;
      var py = pointer.y;

      for (var i = 0; i < dots.length; i++) {
        var dot = dots[i];

        if (dot.state === INERTIA) {
          var speed = Math.hypot(dot.vx, dot.vy);
          if (speed > 0.5) {
            var decel = resistance * dt;
            var newSpeed = Math.max(0, speed - decel);
            var ratio = newSpeed / speed;
            dot.vx *= ratio;
            dot.vy *= ratio;
            dot.xOffset += dot.vx * dt;
            dot.yOffset += dot.vy * dt;
          }
          if (speed <= 0.5) {
            dot.state = RETURNING;
            dot.returnStart = timestamp;
            dot.returnFromX = dot.xOffset;
            dot.returnFromY = dot.yOffset;
            dot.vx = 0;
            dot.vy = 0;
          }
        } else if (dot.state === RETURNING) {
          var elapsed = (timestamp - dot.returnStart) / 1000;
          var t = Math.min(1, elapsed / returnDuration);
          var eased = elasticOut(t);
          dot.xOffset = dot.returnFromX * (1 - eased);
          dot.yOffset = dot.returnFromY * (1 - eased);
          if (t >= 1) {
            dot.xOffset = 0;
            dot.yOffset = 0;
            dot.state = IDLE;
          }
        }

        var ox = dot.cx + dot.xOffset;
        var oy = dot.cy + dot.yOffset;

        var ddx = dot.cx - px;
        var ddy = dot.cy - py;
        var dsq = ddx * ddx + ddy * ddy;

        var fill = baseColor;
        if (dsq <= proxSq) {
          var d = Math.sqrt(dsq);
          var blend = 1 - d / proximity;
          var r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * blend);
          var g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * blend);
          var b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * blend);
          fill = 'rgb(' + r + ',' + g + ',' + b + ')';
        }

        ctx.fillStyle = fill;
        if (circlePath) {
          ctx.save();
          ctx.translate(ox, oy);
          ctx.fill(circlePath);
          ctx.restore();
        } else {
          ctx.beginPath();
          ctx.arc(ox, oy, dotSize / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafId = requestAnimationFrame(render);
    }

    buildGrid();
    rafId = requestAnimationFrame(render);

    var lastMoveCall = 0;
    var THROTTLE_MS = 50;
    function throttledMove(e) {
      var now = performance.now();
      if (now - lastMoveCall < THROTTLE_MS) return;
      lastMoveCall = now;
      onMove(e);
    }

    // ResizeObserver for responsive grid rebuild (matching original)
    var ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(buildGrid);
      ro.observe(hero);
    } else {
      window.addEventListener('resize', buildGrid);
    }

    window.addEventListener('mousemove', throttledMove, { passive: true });
    window.addEventListener('click', onClick);

    window.addEventListener('pagehide', function cleanup() {
      if (rafId) cancelAnimationFrame(rafId);
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', buildGrid);
      window.removeEventListener('mousemove', throttledMove);
      window.removeEventListener('click', onClick);
    }, { once: true });
  });
})();
