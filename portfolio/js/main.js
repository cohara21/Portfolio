// main.js — interactions for portfolio
// Features: hamburger toggle, smooth scroll helpers, header scroll change, fade-in on scroll, back-to-top

document.addEventListener('DOMContentLoaded', function(){
  // Set year in footer
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const primaryNav = document.getElementById('primary-nav');
  navToggle && navToggle.addEventListener('click', function(){
    const visible = primaryNav.getAttribute('data-visible') === 'true';
    primaryNav.setAttribute('data-visible', String(!visible));
    navToggle.setAttribute('aria-expanded', String(!visible));
    // toggle visual open class for hamburger morph
    navToggle.classList.toggle('open', !visible);
  });

  // Close mobile menu when a nav link is clicked
  document.querySelectorAll('.primary-nav a').forEach(link => {
    link.addEventListener('click', () => {
      if(primaryNav.getAttribute('data-visible') === 'true'){
        primaryNav.setAttribute('data-visible', 'false');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.classList.remove('open');
      }
    });
  });

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

  // About page: hide hero scroll hint when user scrolls down
  const heroScrollHint = document.querySelector('.hero-scroll-hint');
  if(heroScrollHint){
    function hideScrollHint(){
      heroScrollHint.classList.toggle('is-hidden', window.scrollY > 60);
    }
    hideScrollHint();
    window.addEventListener('scroll', hideScrollHint, {passive:true});
  }

  // Smooth scroll for internal links (including back-to-top)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e){
      const href = this.getAttribute('href');
      if(href.length > 1){
        const target = document.querySelector(href);
        if(target){
          e.preventDefault();
          target.scrollIntoView({behavior:'smooth', block:'start'});
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
      } else {
        entry.target.classList.remove('visible');
      }
    });
  }, appearOptions);
  faders.forEach(f => appearOnScroll.observe(f));

  // Back to top link handling (if present)
  const backToTop = document.querySelector('.back-to-top');
  if(backToTop){
    backToTop.addEventListener('click', function(e){
      e.preventDefault();
      window.scrollTo({top:0,behavior:'smooth'});
    });
  }

  // Close mobile nav with Escape key
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && primaryNav.getAttribute('data-visible') === 'true'){
      primaryNav.setAttribute('data-visible', 'false');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.classList.remove('open');
      navToggle.focus();
    }
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

  // Work page filtering
  const filterBar = document.querySelector('.filters');
  if(filterBar){
    const buttons = filterBar.querySelectorAll('.filter-btn');
    const projects = document.querySelectorAll('[data-tags]');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        projects.forEach(p => {
          const tags = p.getAttribute('data-tags').split(',');
          if(filter === 'all') p.style.display = '';
          else if(tags.includes(filter)) p.style.display = '';
          else p.style.display = 'none';
        });
      });
    });
  }

  // Projects carousel pause-on-hover/focus
  const carousels = document.querySelectorAll('.projects-carousel');
  // compute scroll width (half of the duplicated track) so animation moves exactly one full set
  function setCarouselMetrics(){
    carousels.forEach(car => {
      const track = car.querySelector('.carousel-track');
      if(!track) return;
      // total width of track (contains duplicated items). We want half of it (the original set).
      const total = track.scrollWidth;
      const scrollWidth = total / 2;
      track.style.setProperty('--scrollWidth', scrollWidth + 'px');
    });
  }
  setCarouselMetrics();
  // Recompute once everything is laid out (fonts/images) so the loop distance is exact.
  window.addEventListener('load', setCarouselMetrics, { once: true });
  setTimeout(setCarouselMetrics, 300);
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setCarouselMetrics, 150);
  });
  carousels.forEach(car => {
    const track = car.querySelector('.carousel-track');
    if(!track) return;
    car.addEventListener('mouseenter', () => track.classList.add('paused'));
    car.addEventListener('mouseleave', () => track.classList.remove('paused'));
    car.addEventListener('focusin', () => track.classList.add('paused'));
    car.addEventListener('focusout', () => track.classList.remove('paused'));
  });

  // Note: carousel motion is handled by CSS animation; JS only sets --scrollWidth.

  // Make project cards clickable anywhere inside the card
  function makeCardsClickable(){
    const cards = document.querySelectorAll('.project-card, .project-card-large');
    cards.forEach(card => {
      if(card.dataset.clickable === 'true') return; // already processed
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

  // Basic form validation placeholder (non-functional form may exist on contact page)
  const contactForm = document.querySelector('form.contact-form');
  if(contactForm){
    contactForm.addEventListener('submit', function(e){
      const name = contactForm.querySelector('[name="name"]');
      const email = contactForm.querySelector('[name="email"]');
      const message = contactForm.querySelector('[name="message"]');
      let ok = true;
      if(!name.value.trim()){ok=false;name.focus();alert('Please enter your name.');}
      else if(!email.value.trim()){ok=false;email.focus();alert('Please enter your email.');}
      else if(!message.value.trim()){ok=false;message.focus();alert('Please enter a message.');}
      if(!ok) e.preventDefault();
    });
  }

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
      altPrefix = 'Photography';
      for(let i = 1; i <= 18; i++) imageFiles.push(`images/photography/MTEN${i}.webp`);
      for(let i = 1; i <= 19; i++) imageFiles.push(`images/photography/BSUBall${i}.webp`);
      for(let i = 1; i <= 8; i++) imageFiles.push(`images/photography/WSOC${i}.webp`);
    } else {
      // Graphic Design images: SCAD, Boise, sbe, random (all .webp)
      altPrefix = 'Graphic Design';
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
    
    const items = imageFiles.map((src, idx) => ({
      src,
      alt: `${altPrefix} ${idx + 1}`
    }));

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
      img.onerror = () => { btn.classList.add('loaded'); };
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
      btn.setAttribute('data-src', src); // Store source in data attribute
      btn.setAttribute('aria-label', `Open image ${i + 1}`);
      
      // Load top 2 rows immediately, others will be lazy loaded
      if(i < topTwoRows){
        loadImageIntoButton(btn, src);
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
        entries.forEach(entry => {
          if(entry.isIntersecting){
            entry.target.classList.add('visible');
          } else {
            entry.target.classList.remove('visible');
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

    function render(){
      // replace only the image inside mediaWrap to preserve controls
      const img = document.createElement('img');
      img.className = 'gallery-large';
      img.src = items[current].src;
      img.alt = items[current].alt;
      img.loading = 'lazy';
      // remove existing image if present
      const existing = mediaWrap.querySelector('img.gallery-large');
      if(existing) existing.remove();
      // insert as first child so controls (absolutely positioned) sit on top
      mediaWrap.insertBefore(img, mediaWrap.firstChild);
      if(counter) counter.textContent = `${current+1} / ${items.length}`;
    }

    function openModal(index){
      current = index;
      lastActive = document.activeElement;
      modal.setAttribute('aria-hidden','false');
      modal.classList.add('open');
      document.body.classList.add('modal-open');
      render();
      // focus close button for keyboard users
      closeBtn.focus();
    }

    function closeModal(){
      modal.setAttribute('aria-hidden','true');
      modal.classList.remove('open');
      document.body.classList.remove('modal-open');
      // Only remove the image, not the entire media-wrap container
      const existing = mediaWrap.querySelector('img.gallery-large');
      if(existing) existing.remove();
      if(lastActive && typeof lastActive.focus === 'function') lastActive.focus();
    }

    // add pressed visual feedback then perform actions
    prevBtn.addEventListener('click', (e)=>{ 
      prevBtn.classList.add('pressed');
      // navigate immediately, but remove pressed + blur after short delay so the pressed look is brief
      current = (current-1 + items.length) % items.length; render(); 
      setTimeout(()=>{ prevBtn.classList.remove('pressed'); try{ prevBtn.blur(); }catch(_){} }, 160);
    });
    nextBtn.addEventListener('click', (e)=>{ 
      nextBtn.classList.add('pressed');
      current = (current+1) % items.length; render(); 
      setTimeout(()=>{ nextBtn.classList.remove('pressed'); try{ nextBtn.blur(); }catch(_){} }, 160);
    });
    closeBtn.addEventListener('click', (e)=>{ 
      closeBtn.classList.add('pressed');
      setTimeout(()=>{ closeBtn.classList.remove('pressed'); try{ closeBtn.blur(); }catch(_){}; closeModal(); }, 160);
    });
    overlay.addEventListener('click', closeModal);

    // keyboard navigation for modal
    document.addEventListener('keydown', (e) => {
      if(!modal.classList.contains('open')) return;
      if(e.key === 'Escape') closeModal();
      else if(e.key === 'ArrowLeft'){ current = (current-1 + items.length) % items.length; render(); }
      else if(e.key === 'ArrowRight'){ current = (current+1) % items.length; render(); }
    });

  })();

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

    // Make gallery focusable for keyboard navigation
    gallery.setAttribute('tabindex', '0');
    
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
    updateCarousel();
  })();
});
