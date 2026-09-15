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

const commentsPanel = document.querySelector('[data-comments]');
const commentsEndpoint = 'https://basfrphvvjfhbozxaeyw.supabase.co/functions/v1/article-comments';

function formatCommentDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

if (commentsPanel) {
  const slug = commentsPanel.dataset.articleSlug;
  const form = commentsPanel.querySelector('[data-comment-form]');
  const submitButton = commentsPanel.querySelector('[data-comment-submit]');
  const status = commentsPanel.querySelector('[data-comment-status]');
  const list = commentsPanel.querySelector('[data-comments-list]');

  const requestComments = async (body) => {
    const response = await fetch(commentsEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Não foi possível concluir agora.');
    return data;
  };

  const renderComments = (comments) => {
    list.replaceChildren();

    if (!comments.length) {
      const empty = document.createElement('p');
      empty.textContent = 'Ainda não há comentários. Seja a primeira pessoa a compartilhar sua leitura.';
      list.append(empty);
      return;
    }

    comments.forEach((comment) => {
      const entry = document.createElement('article');
      const author = document.createElement('h3');
      const time = document.createElement('time');
      const text = document.createElement('p');

      entry.className = 'comment-entry';
      author.textContent = comment.author_name;
      time.dateTime = comment.created_at;
      time.textContent = formatCommentDate(comment.created_at);
      text.textContent = comment.comment_text;

      entry.append(author, time, text);
      list.append(entry);
    });
  };

  const loadComments = async () => {
    try {
      const data = await requestComments({ action: 'list', slug });
      renderComments(data.comments || []);
    } catch {
      list.replaceChildren();
      const error = document.createElement('p');
      error.textContent = 'Não foi possível carregar os comentários agora.';
      list.append(error);
    }
  };

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const data = new FormData(form);
    const id = visitorId();
    if (!id || !slug) {
      status.textContent = 'Não foi possível preparar seu comentário agora.';
      return;
    }

    submitButton.disabled = true;
    status.textContent = 'Enviando comentário…';

    try {
      await requestComments({
        action: 'submit',
        slug,
        visitorId: id,
        name: String(data.get('name') || ''),
        comment: String(data.get('comment') || ''),
        website: String(data.get('website') || ''),
      });
      form.reset();
      status.textContent = 'Obrigada! Seu comentário foi recebido e será publicado após aprovação.';
    } catch (error) {
      status.textContent = error instanceof Error ? error.message : 'Não foi possível enviar agora.';
    } finally {
      submitButton.disabled = false;
    }
  });

  loadComments();
}
