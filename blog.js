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
