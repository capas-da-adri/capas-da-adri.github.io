const navToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

navToggle?.addEventListener('click', () => {
  const opened = nav?.classList.toggle('is-open') ?? false;
  navToggle.setAttribute('aria-expanded', String(opened));
  navToggle.setAttribute('aria-label', opened ? 'Fechar menu' : 'Abrir menu');
});

document.querySelectorAll('.main-nav a').forEach((link) => link.addEventListener('click', () => {
  nav?.classList.remove('is-open');
  navToggle?.setAttribute('aria-expanded', 'false');
}));

const metricsPanel = document.querySelector('[data-article-slug]');
const metricsEndpoint = 'https://basfrphvvjfhbozxaeyw.supabase.co/functions/v1/article-metrics';

function visitorId() {
  const storageKey = 'capas-da-adri:visitor-id';
  let id = localStorage.getItem(storageKey);

  if (!id && window.crypto?.randomUUID) {
    id = window.crypto.randomUUID();
    localStorage.setItem(storageKey, id);
  }

  return id;
}

function formatViews(value) {
  return `${Number(value).toLocaleString('pt-BR')} visualizaç${Number(value) === 1 ? 'ão' : 'ões'}`;
}

function formatLikes(value) {
  return `${Number(value).toLocaleString('pt-BR')} ${Number(value) === 1 ? 'curtida' : 'curtidas'}`;
}

if (metricsPanel) {
  const slug = metricsPanel.dataset.articleSlug;
  const views = metricsPanel.querySelector('[data-views]');
  const likes = metricsPanel.querySelector('[data-likes]');
  const likeButton = metricsPanel.querySelector('[data-like]');
  const likeIcon = metricsPanel.querySelector('[data-like-icon]');
  const status = metricsPanel.querySelector('[data-metric-status]');
  const id = visitorId();

  const updatePanel = (metrics) => {
    views.textContent = formatViews(metrics.views);
    likes.textContent = formatLikes(metrics.likes);
    likeButton.setAttribute('aria-pressed', String(metrics.liked));
    likeIcon.textContent = metrics.liked ? '♥' : '♡';
    likeButton.classList.toggle('is-liked', metrics.liked);
  };

  const requestMetric = async (action) => {
    if (!id || !slug) throw new Error('Identificador indisponível');

    const response = await fetch(metricsEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, slug, visitorId: id }),
    });

    if (!response.ok) throw new Error('Métricas indisponíveis');
    return response.json();
  };

  const startMetrics = async () => {
    try {
      await requestMetric('read');
      const metrics = await requestMetric('view');
      updatePanel(metrics);
      likeButton.disabled = false;
    } catch {
      views.textContent = 'Visualizações indisponíveis';
      likes.textContent = 'Curtidas indisponíveis';
      status.textContent = 'Não foi possível carregar as métricas agora.';
    }
  };

  likeButton?.addEventListener('click', async () => {
    likeButton.disabled = true;
    try {
      const metrics = await requestMetric('like');
      updatePanel(metrics);
      status.textContent = metrics.liked ? 'Você curtiu este artigo.' : 'Você retirou a curtida deste artigo.';
    } catch {
      status.textContent = 'Não foi possível registrar a curtida agora.';
    } finally {
      likeButton.disabled = false;
    }
  });

  startMetrics();
}
