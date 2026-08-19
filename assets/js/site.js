(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      const open = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  const lightboxItems = Array.from(document.querySelectorAll('[data-lightbox]'));
  if (!lightboxItems.length) return;

  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Image viewer');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = [
    '<button class="lightbox-close" type="button" aria-label="Close image viewer">×</button>',
    '<button class="lightbox-nav lightbox-prev" type="button" aria-label="Previous image">←</button>',
    '<figure class="lightbox-figure">',
    '<img class="lightbox-image" alt="">',
    '<figcaption class="lightbox-caption"></figcaption>',
    '</figure>',
    '<button class="lightbox-nav lightbox-next" type="button" aria-label="Next image">→</button>'
  ].join('');
  document.body.appendChild(overlay);

  const image = overlay.querySelector('.lightbox-image');
  const caption = overlay.querySelector('.lightbox-caption');
  const close = overlay.querySelector('.lightbox-close');
  const previous = overlay.querySelector('.lightbox-prev');
  const next = overlay.querySelector('.lightbox-next');
  let activeIndex = 0;
  let lastFocus = null;

  function show(index) {
    activeIndex = (index + lightboxItems.length) % lightboxItems.length;
    const item = lightboxItems[activeIndex];
    const source = item.getAttribute('data-lightbox-src') || item.getAttribute('href') || '';
    image.src = source;
    image.alt = item.getAttribute('data-lightbox-alt') || 'Portfolio work sample';
    caption.textContent = item.getAttribute('data-lightbox-caption') || image.alt;
  }

  function open(index, trigger) {
    lastFocus = trigger;
    show(index);
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    close.focus();
  }

  function closeViewer() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    image.src = '';
    if (lastFocus) lastFocus.focus();
  }

  lightboxItems.forEach(function (item, index) {
    item.addEventListener('click', function (event) {
      event.preventDefault();
      open(index, item);
    });
  });

  close.addEventListener('click', closeViewer);
  previous.addEventListener('click', function () { show(activeIndex - 1); });
  next.addEventListener('click', function () { show(activeIndex + 1); });
  overlay.addEventListener('click', function (event) {
    if (event.target === overlay) closeViewer();
  });
  document.addEventListener('keydown', function (event) {
    if (!overlay.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeViewer();
    if (event.key === 'ArrowLeft') show(activeIndex - 1);
    if (event.key === 'ArrowRight') show(activeIndex + 1);
  });
})();
