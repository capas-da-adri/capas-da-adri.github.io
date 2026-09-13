const navToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

navToggle?.addEventListener('click', () => {
  const opened = nav.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(opened));
  navToggle.setAttribute('aria-label', opened ? 'Fechar menu' : 'Abrir menu');
});

document.querySelectorAll('.main-nav a').forEach((link) => link.addEventListener('click', () => {
  nav?.classList.remove('is-open');
  navToggle?.setAttribute('aria-expanded', 'false');
}));

const filters = document.querySelectorAll('.filter');
const cards = document.querySelectorAll('.work-card');
filters.forEach((filter) => filter.addEventListener('click', () => {
  filters.forEach((button) => button.classList.remove('is-active'));
  filter.classList.add('is-active');
  const chosen = filter.dataset.filter;
  cards.forEach((card) => card.classList.toggle('hidden', chosen !== 'todos' && card.dataset.category !== chosen));
}));

document.querySelectorAll('.service-toggle').forEach((toggle) => toggle.addEventListener('click', () => {
  const item = toggle.closest('.service-item');
  const opening = !item.classList.contains('is-open');
  document.querySelectorAll('.service-item').forEach((service) => {
    service.classList.remove('is-open');
    service.querySelector('.service-toggle').setAttribute('aria-expanded', 'false');
  });
  if (opening) {
    item.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
  }
}));

document.querySelectorAll('[data-service]').forEach((link) => link.addEventListener('click', () => {
  const select = document.querySelector('[name="servico"]');
  const lookup = { 'Capa autoral': 'Uma capa autoral', 'Premade': 'Uma capa premade', 'Diagramação': 'Diagramação editorial' };
  select.value = lookup[link.dataset.service] || '';
}));

const heroCarousel = document.querySelector('[data-hero-carousel]');
if (heroCarousel) {
  const heroSlides = [...heroCarousel.querySelectorAll('[data-hero-slide]')];
  const dotsContainer = heroCarousel.querySelector('[data-hero-dots]');
  const previousButton = heroCarousel.querySelector('[data-hero-prev]');
  const nextButton = heroCarousel.querySelector('[data-hero-next]');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const dots = heroSlides.map((slide, index) => {
    const dot = document.createElement('button');
    const label = slide.querySelector('figcaption').textContent;
    dot.type = 'button';
    dot.className = 'hero-carousel-dot';
    dot.setAttribute('aria-label', `Mostrar ${label}`);
    dot.setAttribute('aria-current', String(index === 0));
    dot.addEventListener('click', () => { showSlide(index); restartAutoplay(); });
    dotsContainer.append(dot);
    return dot;
  });
  let currentSlide = 0;
  let autoplay;

  function showSlide(index) {
    currentSlide = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach((slide, slideIndex) => {
      const active = slideIndex === currentSlide;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
      dots[slideIndex].setAttribute('aria-current', String(active));
    });
  }

  function stopAutoplay() {
    window.clearInterval(autoplay);
    autoplay = undefined;
  }

  function startAutoplay() {
    if (!prefersReducedMotion.matches && !document.hidden && !autoplay) {
      autoplay = window.setInterval(() => showSlide(currentSlide + 1), 6000);
    }
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  previousButton.addEventListener('click', () => { showSlide(currentSlide - 1); restartAutoplay(); });
  nextButton.addEventListener('click', () => { showSlide(currentSlide + 1); restartAutoplay(); });
  heroCarousel.addEventListener('pointerenter', stopAutoplay);
  heroCarousel.addEventListener('pointerleave', startAutoplay);
  heroCarousel.addEventListener('focusin', stopAutoplay);
  heroCarousel.addEventListener('focusout', (event) => {
    if (!heroCarousel.contains(event.relatedTarget)) startAutoplay();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoplay(); else startAutoplay();
  });
  prefersReducedMotion.addEventListener('change', () => {
    stopAutoplay();
    startAutoplay();
  });
  let touchStartX = 0;
  heroCarousel.addEventListener('touchstart', (event) => { touchStartX = event.changedTouches[0].screenX; }, { passive: true });
  heroCarousel.addEventListener('touchend', (event) => {
    const movement = event.changedTouches[0].screenX - touchStartX;
    if (Math.abs(movement) > 42) {
      showSlide(currentSlide + (movement < 0 ? 1 : -1));
      restartAutoplay();
    }
  }, { passive: true });
  startAutoplay();
}

const modal = document.querySelector('#workModal');
const modalArt = document.querySelector('#modalArt');
const modalTitle = document.querySelector('#modalTitle');
const modalType = document.querySelector('#modalType');
const modalDescription = document.querySelector('#modalDescription');

cards.forEach((card) => card.addEventListener('click', () => {
  const art = card.querySelector('.cover-scene, .cover-photo, .layout-photo').cloneNode(true);
  modalArt.replaceChildren(art);
  modalTitle.textContent = card.dataset.title;
  modalType.textContent = card.dataset.type;
  modalDescription.textContent = card.dataset.description;
  modal.showModal();
}));

document.querySelector('.modal-close').addEventListener('click', () => modal.close());
modal.addEventListener('click', (event) => { if (event.target === modal) modal.close(); });
modal.querySelector('a').addEventListener('click', () => modal.close());

const quoteForm = document.querySelector('#quoteForm');
const helper = document.querySelector('#formHelper');
quoteForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(quoteForm);
  const briefing = `Olá, Adri! Meu nome é ${form.get('nome')}.\n\nQuero solicitar orçamento para: ${form.get('servico')}.\nMeu contato: ${form.get('contato')}.\n\nSobre o livro:\n${form.get('livro') || 'Ainda vou contar os detalhes.'}`;
  const assunto = 'Pedido de orçamento — Capas da Adri';
  const mailbox = ['adrianevb', 'hotmail.com'].join('@');
  const email = `mailto:${mailbox}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(briefing)}`;
  try {
    await navigator.clipboard.writeText(briefing);
  } catch {}
  helper.textContent = 'Sucesso! Seu formulário foi enviado.';
  helper.hidden = false;
  window.location.href = email;
});
