// main.js — interactions for portfolio
// Features: menu, smooth scroll, header state, fade-in on scroll, back-to-top, carousels, gallery lightbox

// Publish the scrollbar width so full-bleed sections can break out without
// overflowing. 100vw counts the scrollbar; the content box does not, so a
// vw-based breakout is wider than the page by exactly this much. Set before
// first paint rather than on DOMContentLoaded so the hero never renders wrong.
(function () {
  function setScrollbarWidth() {
    var w = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--sbw', (w > 0 ? w : 0) + 'px');
  }
  setScrollbarWidth();
  window.addEventListener('resize', setScrollbarWidth, { passive: true });
})();

document.addEventListener('DOMContentLoaded', function(){
  // Set year in footer
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollBehavior = reduceMotion ? 'auto' : 'smooth';

  // Mobile nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const primaryNav = document.getElementById('primary-nav');
  const menuLinks = primaryNav ? Array.from(primaryNav.querySelectorAll('a')) : [];
  const menuOpen = () => primaryNav && primaryNav.getAttribute('data-visible') === 'true';

  function setMenu(open, returnFocus, fromKeyboard){
    if(!primaryNav || !navToggle) return;
    primaryNav.setAttribute('data-visible', String(open));
    navToggle.setAttribute('aria-expanded', String(open));
    // toggle visual open class for hamburger morph
    navToggle.classList.toggle('open', open);
    // The menu comes before the toggle in the source (the desktop header needs
    // that order), so Tab after opening would skip it. Move focus in instead.
    // Only for keyboard users; a tap shouldn't paint a focus ring on Home.
    if(open && fromKeyboard && menuLinks[0]) menuLinks[0].focus();
    if(!open && returnFocus) navToggle.focus();
  }

  // detail is 0 when the button was activated with Enter or Space
  navToggle && navToggle.addEventListener('click', (e) => setMenu(!menuOpen(), false, e.detail === 0));

  // Close mobile menu when a nav link is clicked
  menuLinks.forEach(link => link.addEventListener('click', () => { if(menuOpen()) setMenu(false, false); }));

  // While open, Tab cycles through the menu links and the toggle only
  document.addEventListener('keydown', (e) => {
    if(e.key !== 'Tab' || !menuOpen()) return;
    const cycle = [...menuLinks, navToggle];
    const i = cycle.indexOf(document.activeElement);
    if(i === -1) return;
    const next = e.shiftKey ? (i - 1 + cycle.length) % cycle.length : (i + 1) % cycle.length;
    e.preventDefault();
    cycle[next].focus();
  });

  // Tapping anywhere outside the open menu closes it. That tap only dismisses:
  // it must not also open the project card that happened to be underneath.
  document.addEventListener('pointerdown', (e) => {
    if(!menuOpen() || primaryNav.contains(e.target) || navToggle.contains(e.target)) return;
    setMenu(false, false);
    const swallow = (ev) => { ev.preventDefault(); ev.stopPropagation(); };
    document.addEventListener('click', swallow, {capture:true, once:true});
    // If no click follows (a scroll or drag), drop the listener
    setTimeout(() => document.removeEventListener('click', swallow, {capture:true}), 600);
  });

  // Crossing into the desktop layout resets the menu so it can't reappear open later
  const desktopQuery = window.matchMedia('(min-width: 769px)');
  const resetMenu = () => { if(desktopQuery.matches && menuOpen()) setMenu(false, false); };
  desktopQuery.addEventListener ? desktopQuery.addEventListener('change', resetMenu) : desktopQuery.addListener(resetMenu);

  // Header background change on scroll
  const header = document.getElementById('site-header');
  function onScroll(){
    if(window.scrollY > 20){
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});

  // Dark hero (FINRA): flag the header while it overlaps the hero so the
  // pills and hamburger switch to light-on-dark.
  const darkHero = document.querySelector('.case-study-finra .case-hero-full, .case-study-contio .case-hero-full');
  if(darkHero && header && 'IntersectionObserver' in window){
    const headerH = () => header.getBoundingClientRect().height || 64;
    let heroObserver;
    const watchHero = () => {
      if(heroObserver) heroObserver.disconnect();
      heroObserver = new IntersectionObserver(([entry]) => {
        header.classList.toggle('on-dark', entry.isIntersecting);
      }, {rootMargin: `0px 0px -${Math.round(window.innerHeight - headerH())}px 0px`});
      heroObserver.observe(darkHero);
    };
    watchHero();
    window.addEventListener('resize', () => { clearTimeout(watchHero.t); watchHero.t = setTimeout(watchHero, 150); });
  }

  // Smooth scroll for internal links (skip link, table of contents). Focus
  // moves with the scroll, or the next Tab starts from where the reader was.
  document.querySelectorAll('a[href^="#"]:not(.back-to-top)').forEach(anchor => {
    anchor.addEventListener('click', function(e){
      const href = this.getAttribute('href');
      if(href.length > 1){
        const target = document.querySelector(href);
        if(target){
          e.preventDefault();
          target.scrollIntoView({behavior:scrollBehavior, block:'start'});
          if(!target.hasAttribute('tabindex') && !target.matches('a, button, input, textarea, select')) target.setAttribute('tabindex', '-1');
          target.focus({preventScroll:true});
          if(history.replaceState) history.replaceState(null, '', href);
        }
      }
    });
  });

  // Fade-in elements using IntersectionObserver
  const faders = document.querySelectorAll('.fade-in');
  const appearOptions = {threshold: 0.12, rootMargin: '0px 0px -20px 0px'};
  const appearOnScroll = new IntersectionObserver(function(entries, observer){
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, appearOptions);
  faders.forEach(f => appearOnScroll.observe(f));

  // Shared helper for the two overlays: make everything behind the dialog
  // inert so Tab can't wander onto the page underneath it.
  window.setBackgroundInert = function(dialogRoot, on){
    Array.from(document.body.children).forEach(el => {
      if(el === dialogRoot || el.contains(dialogRoot) || el.tagName === 'SCRIPT') return;
      if(on) el.setAttribute('inert', ''); else el.removeAttribute('inert');
    });
  };

  // Back to top: scroll up and put focus back at the start of the page
  const backToTop = document.querySelector('.back-to-top');
  if(backToTop){
    backToTop.addEventListener('click', function(e){
      e.preventDefault();
      window.scrollTo({top:0,behavior:scrollBehavior});
      const logo = document.querySelector('.logo-mark');
      if(logo) logo.focus({preventScroll:true});
    });
  }

  // Close mobile nav with Escape key
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && menuOpen()) setMenu(false, true);
  });

  // Highlight active nav link based on pathname
  const links = document.querySelectorAll('.primary-nav a');
  links.forEach(a => {
    try{
      const href = new URL(a.href).pathname.split('/').pop();
      const current = window.location.pathname.split('/').pop() || 'index.html';
      if(href === current) a.classList.add('active');
    }catch(err){/* ignore */}
  });

  // Make project cards clickable anywhere inside the card
  function makeCardsClickable(){
    const cards = document.querySelectorAll('.project-card, .project-card-large');
    cards.forEach(card => {
      if(card.dataset.clickable === 'true') return; // already processed
      // Cards that contain a real stretched link are already fully clickable and
      // keyboard-reachable. Adding role="link" and tabindex here would give them a
      // second, redundant tab stop, so leave those alone entirely.
      if(card.querySelector('a.card-link')) return;
      const link = card.querySelector('a[href]');
      const dataLink = card.getAttribute('data-link');
      const targetHref = link ? link.href : (dataLink || null);
      if(!targetHref) return;
      // mark as interactive for styles
      card.classList.add('clickable');
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'link');
      // click handler
      card.addEventListener('click', (e) => {
        // if click originated on an interactive element (anchor, button, input), let default
        if(e.target.closest('a, button, input, textarea')) return;
        window.location.href = targetHref;
      });
      // keyboard handler: Enter or Space
      card.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' || e.key === ' '){
          e.preventDefault();
          window.location.href = targetHref;
        }
      });
      card.dataset.clickable = 'true';
    });
  }
  makeCardsClickable();

  // Photography gallery: generate placeholders and wire lightbox/modal behavior
  (function(){
    const grid = document.getElementById('gallery-grid');
    if(!grid) return;
    
    // Check if we're on photography page (graphic design page doesn't have photography-page class)
    const isPhotographyPage = document.body.classList.contains('photography-page') && !document.body.classList.contains('graphic-design-page');
    
    let imageFiles = [];
    let altPrefix = '';
    
    if(isPhotographyPage){
      // Photography images: MTEN first, BSUBall second, WSOC last (all .webp)
      altPrefix = 'Sports photograph';
      for(let i = 1; i <= 18; i++) imageFiles.push(`images/photography/MTEN${i}.webp`);
      for(let i = 1; i <= 19; i++) imageFiles.push(`images/photography/BSUBall${i}.webp`);
      for(let i = 1; i <= 8; i++) imageFiles.push(`images/photography/WSOC${i}.webp`);
    } else {
      // Graphic Design images: SCAD, Boise, sbe, random (all .webp)
      altPrefix = 'Sports graphic';
      imageFiles = [
        'images/Graphic Design Showcase/SCAD14.webp',
        'images/Graphic Design Showcase/SCAD15.webp',
        'images/Graphic Design Showcase/SCAD16.webp',
        'images/Graphic Design Showcase/SCAD17.webp',
        'images/Graphic Design Showcase/SCAD18.webp',
        'images/Graphic Design Showcase/SCAD19.webp',
        'images/Graphic Design Showcase/SCAD20.webp',
        'images/Graphic Design Showcase/SCAD21.webp',
        'images/Graphic Design Showcase/SCAD22.webp',
        'images/Graphic Design Showcase/SCAD23.webp',
        'images/Graphic Design Showcase/SCAD24.webp',
        'images/Graphic Design Showcase/SCAD25.webp',
        'images/Graphic Design Showcase/SCAD26.webp',
        'images/Graphic Design Showcase/SCAD29.webp',
        'images/Graphic Design Showcase/SCAD30.webp',
        'images/Graphic Design Showcase/SCAD31.webp',
        'images/Graphic Design Showcase/Boise1.webp',
        'images/Graphic Design Showcase/Boise2.webp',
        'images/Graphic Design Showcase/Boise3.webp',
        'images/Graphic Design Showcase/Boise4.webp',
        'images/Graphic Design Showcase/Boise5.webp',
        'images/Graphic Design Showcase/Boise6.webp',
        'images/Graphic Design Showcase/Boise7.webp',
        'images/Graphic Design Showcase/Boise8.webp',
        'images/Graphic Design Showcase/Boise9.webp',
        'images/Graphic Design Showcase/Boise10.webp',
        'images/Graphic Design Showcase/Boise11.webp',
        'images/Graphic Design Showcase/sbe1.webp',
        'images/Graphic Design Showcase/sbe2.webp',
        'images/Graphic Design Showcase/sbe3.webp',
        'images/Graphic Design Showcase/sbe4.webp',
        'images/Graphic Design Showcase/random1.webp',
        'images/Graphic Design Showcase/random2.webp'
      ];
    }
    
    // Modal keeps the full-resolution originals; the grid uses 640px thumbs.
    // Thumbs render in a ~316px column, so the originals (up to 4640x5800)
    // were roughly 90x more pixels than the grid could ever show.
    // TODO(Carson): real descriptions per image. Until then the alt text says
    // what kind of image it is and where it sits in the set, not "Photography 12".
    const items = imageFiles.map((src, idx) => ({
      src,
      alt: `${altPrefix} ${idx + 1} of ${imageFiles.length}`
    }));

    const thumbFor = (src) => src.replace(/\/([^/]+)$/, '/thumbs/$1');

    // Determine number of columns based on screen width
    const getColumns = () => {
      if(window.innerWidth <= 480) return 1;
      if(window.innerWidth <= 820) return 2;
      if(window.innerWidth <= 1100) return 3;
      return 4;
    };
    
    const columns = getColumns();
    const topTwoRows = columns * 2;
    
    function loadImageIntoButton(btn, src) {
      const img = new Image();
      img.onload = () => {
        btn.style.backgroundImage = `url('${src}')`;
        btn.classList.add('loaded');
      };
      img.onerror = () => { btn.classList.add('loaded', 'is-broken'); };
      img.src = src;
    }
    
    imageFiles.forEach((src, i) => {
      const item = document.createElement('div');
      // Make top 2 rows visible immediately (no fade-in class)
      if(i < topTwoRows){
        item.className = 'gallery-item';
      } else {
        item.className = 'gallery-item fade-in';
      }
      const btn = document.createElement('button');
      btn.className = 'gallery-thumb';
      btn.setAttribute('data-index', i);
      btn.setAttribute('data-src', thumbFor(src)); // grid uses the thumb; modal uses the original
      btn.setAttribute('aria-label', `Open ${items[i].alt.toLowerCase()}`);

      // Load top 2 rows immediately, others will be lazy loaded
      if(i < topTwoRows){
        loadImageIntoButton(btn, thumbFor(src));
      }
      
      // keyboard accessible
      // clicking opens the full modal (no hover-preview)
      btn.addEventListener('click', (e) => { e.preventDefault(); openModal(i); });
      item.appendChild(btn);
      grid.appendChild(item);
    });
    
    // Lazy load images using IntersectionObserver
    const lazyImageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          const btn = entry.target;
          const src = btn.getAttribute('data-src');
          if(src && !btn.classList.contains('loaded')){
            loadImageIntoButton(btn, src);
            observer.unobserve(btn);
          }
        }
      });
    }, {
      rootMargin: '50px' // Start loading 50px before image enters viewport
    });
    
    // Observe all buttons that haven't been loaded yet
    setTimeout(() => {
      const lazyButtons = grid.querySelectorAll('.gallery-thumb:not(.loaded)');
      lazyButtons.forEach(btn => lazyImageObserver.observe(btn));
    }, 100);
    
    // Re-observe gallery items for fade-in effect after they're created
    setTimeout(() => {
      const galleryItems = grid.querySelectorAll('.gallery-item.fade-in');
      
      const appearOptions = {threshold: 0.12, rootMargin: '0px 0px -20px 0px'};
      const appearOnScroll = new IntersectionObserver(function(entries, observer){
        // Reveal once. Removing .visible on exit made every image fade out
        // again when scrolled away, and fast scrolling showed blank cells.
        entries.forEach(entry => {
          if(entry.isIntersecting){
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, appearOptions);
      
      // Only observe items with fade-in class (not top 2 rows)
      galleryItems.forEach(item => appearOnScroll.observe(item));
    }, 100);

    // Modal wiring
  const modal = document.getElementById('gallery-modal');
  const media = document.getElementById('gallery-media');
  const mediaWrap = document.getElementById('media-wrap');
  const closeBtn = modal.querySelector('.gallery-close');
  const prevBtn = modal.querySelector('.gallery-prev');
  const nextBtn = modal.querySelector('.gallery-next');
  const counter = document.getElementById('gallery-counter');
    const overlay = modal.querySelector('.gallery-overlay');
    let current = 0;
    let lastActive = null;

    function preload(i){ const im = new Image(); im.src = items[(i + items.length) % items.length].src; }

    function render(){
      // replace only the image inside mediaWrap to preserve controls
      const img = document.createElement('img');
      img.className = 'gallery-large';
      img.alt = items[current].alt;
      // The grid thumbnail is already cached: show it behind the full image
      // so the frame is never an empty box while the original downloads.
      img.style.backgroundImage = `url('${thumbFor(items[current].src)}')`;
      img.addEventListener('load', () => { img.style.backgroundImage = ''; }, {once:true});
      img.src = items[current].src;
      // remove existing image if present
      const existing = mediaWrap.querySelector('img.gallery-large');
      if(existing) existing.remove();
      // insert as first child so controls (absolutely positioned) sit on top
      mediaWrap.insertBefore(img, mediaWrap.firstChild);
      if(counter) counter.textContent = `${current+1} / ${items.length}`;
      preload(current + 1); preload(current - 1);
    }

    const go = (step) => { current = (current + step + items.length) % items.length; render(); };

    function openModal(index){
      current = index;
      lastActive = document.activeElement;
      modal.setAttribute('aria-hidden','false');
      modal.classList.add('open');
      document.body.classList.add('modal-open');
      if(window.setBackgroundInert) window.setBackgroundInert(modal, true);
      render();
      // focus close button for keyboard users
      closeBtn.focus();
    }

    function closeModal(){
      modal.setAttribute('aria-hidden','true');
      modal.classList.remove('open');
      document.body.classList.remove('modal-open');
      if(window.setBackgroundInert) window.setBackgroundInert(modal, false);
      // Only remove the image, not the entire media-wrap container
      const existing = mediaWrap.querySelector('img.gallery-large');
      if(existing) existing.remove();
      // Return to the thumbnail of the image being viewed, not the one first opened
      const thumb = grid.querySelector(`.gallery-thumb[data-index="${current}"]`) || lastActive;
      if(thumb && typeof thumb.focus === 'function') thumb.focus();
    }

    // Focus stays on the arrow that was pressed, so Enter can be pressed again
    prevBtn.addEventListener('click', () => go(-1));
    nextBtn.addEventListener('click', () => go(1));
    closeBtn.addEventListener('click', closeModal);

    // Swipe left/right on the image to move through the set
    let touchX = null, touchY = null;
    mediaWrap.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; touchY = e.touches[0].clientY; }, {passive:true});
    mediaWrap.addEventListener('touchend', (e) => {
      if(touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX, dy = e.changedTouches[0].clientY - touchY;
      if(Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
      touchX = touchY = null;
    }, {passive:true});
    // Allow clicking the blurred background to close (but not the image or controls)
    modal.addEventListener('click', (e) => {
      // If click is inside the image frame or on controls, do nothing
      if(e.target.closest('.media-wrap, .gallery-controls, .gallery-close')) return;
      closeModal();
    });

    // keyboard navigation for modal
    document.addEventListener('keydown', (e) => {
      if(!modal.classList.contains('open')) return;
      if(e.key === 'Escape') closeModal();
      else if(e.key === 'ArrowLeft') go(-1);
      else if(e.key === 'ArrowRight') go(1);
    });

  })();

  // Swipe support for the case-study carousels
  function addSwipe(el, onPrev, onNext){
    let x = null, y = null;
    el.addEventListener('touchstart', (e) => { x = e.touches[0].clientX; y = e.touches[0].clientY; }, {passive:true});
    el.addEventListener('touchend', (e) => {
      if(x === null) return;
      const dx = e.changedTouches[0].clientX - x, dy = e.changedTouches[0].clientY - y;
      if(Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? onNext : onPrev)();
      x = y = null;
    }, {passive:true});
  }

  // Big Bus Design Gallery
  (function(){
    const gallery = document.querySelector('.design-gallery');
    if(!gallery) return;
    
    const slides = gallery.querySelectorAll('.gallery-slide');
    const prevBtn = gallery.querySelector('.gallery-prev-btn');
    const nextBtn = gallery.querySelector('.gallery-next-btn');
    const counter = document.querySelector('.gallery-counter');
    if(!prevBtn || !nextBtn) return;
    
    let currentIndex = 0;

    function updateGallery(){
      slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentIndex);
      });
      if(counter) counter.textContent = `${currentIndex + 1} / ${slides.length}`;
    }

    function nextSlide(e){
      if(e) e.preventDefault();
      currentIndex = (currentIndex + 1) % slides.length;
      updateGallery();
    }

    function prevSlide(e){
      if(e) e.preventDefault();
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      updateGallery();
    }

    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);

    // Keyboard navigation when gallery is focused
    gallery.addEventListener('keydown', (e) => {
      if(e.key === 'ArrowLeft'){ prevSlide(e); }
      else if(e.key === 'ArrowRight'){ nextSlide(e); }
    });

    // Make gallery focusable for keyboard navigation, and name it
    gallery.setAttribute('tabindex', '0');
    gallery.setAttribute('role', 'region');
    gallery.setAttribute('aria-roledescription', 'carousel');
    if(!gallery.hasAttribute('aria-label')) gallery.setAttribute('aria-label', 'Big Bus app screens. Use the arrow keys to move between screens.');
    if(counter) counter.setAttribute('aria-live', 'polite');
    addSwipe(gallery, prevSlide, nextSlide);
    
    // Initialize
    updateGallery();
  })();

  // Mose prototype carousel (6 prototype images)
  (function(){
    const carousel = document.querySelector('.mose-prototype-carousel');
    if(!carousel) return;
    const slides = carousel.querySelectorAll('.gallery-slide');
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    const counter = carousel.querySelector('.gallery-counter');
    const prototypeNames = ['Home', 'Assistant', 'Calendar', 'Camera', 'Profile', 'Stories'];
    if(!prevBtn || !nextBtn) return;
    let currentIndex = 0;

    function updateCarousel(){
      slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentIndex);
      });
      if(counter) counter.textContent = prototypeNames[currentIndex] || '';
    }

    prevBtn.addEventListener('click', (e)=>{
      e.preventDefault();
      currentIndex = (currentIndex - 1 + slides.length) % slides.length;
      updateCarousel();
    });
    nextBtn.addEventListener('click', (e)=>{
      e.preventDefault();
      currentIndex = (currentIndex + 1) % slides.length;
      updateCarousel();
    });

    carousel.addEventListener('keydown', (e)=>{
      if(e.key === 'ArrowLeft'){ e.preventDefault(); currentIndex = (currentIndex - 1 + slides.length) % slides.length; updateCarousel(); }
      else if(e.key === 'ArrowRight'){ e.preventDefault(); currentIndex = (currentIndex + 1) % slides.length; updateCarousel(); }
    });
    carousel.setAttribute('tabindex', '0');
    carousel.setAttribute('role', 'region');
    carousel.setAttribute('aria-roledescription', 'carousel');
    if(!carousel.hasAttribute('aria-label')) carousel.setAttribute('aria-label', 'Mose prototype screens. Use the arrow keys to move between screens.');
    if(counter) counter.setAttribute('aria-live', 'polite');
    addSwipe(carousel,
      () => { currentIndex = (currentIndex - 1 + slides.length) % slides.length; updateCarousel(); },
      () => { currentIndex = (currentIndex + 1) % slides.length; updateCarousel(); });
    updateCarousel();
  })();
});
