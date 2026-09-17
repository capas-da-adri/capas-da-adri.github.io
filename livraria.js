(() => {
  const seriesBooks = [{"id": "paixao-sem-limites", "title": "Paixão sem limites", "volume": "Vol. 1", "author": "Abbi Glines", "description": "Rush e Blaire dão início a uma história intensa que abre as portas para o universo de Rosemary Beach.", "url": "https://link.amazon/B0htUasQE", "image": "data:image/webp;base64,UklGRsqZAABXRUJQVlA4IL6ZAACwnwKdASheAgQCPrE4lEelJSsgICAgIIASJaQSl5IXJMKV1MKJAv+rN+T3gYv..."}, {"id": "tentacao-sem-limites", "title": "Tentação sem limites", "volume": "Vol. 2", "author": "Abbi Glines", "description": "A história de Rush e Blaire continua em meio a escolhas, segredos e novos desafios em Rosemary Beach.", "url": "https://link.amazon/B01pRsBJk", "image": "data:image/webp;base64,UklGRqB1AABXRUJQVlA4IJR1AACwpwKdASheAgQCPrE4lEelJSsgICAgIIASJaQSl5IXJMKV1MKJAv+rN+T3gYv..."}, {"id": "amor-sem-limites", "title": "Amor sem limites", "volume": "Vol. 3", "author": "Abbi Glines", "description": "O terceiro volume acompanha Rush e Blaire em mais uma etapa de sua trajetória, fechando este arco do casal.", "url": "https://link.amazon/B03pQ80a7", "image": "data:image/webp;base64,UklGRp5eAABXRUJQVlA4IJJeAACQnQKdASheAgQCPrE4lEelJSsgICAgIIASJaQSl5IXJMKV1MKJAv+rN+T3gYv..."}];

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const addSeriesSection = () => {
    if (document.getElementById("series-favoritas")) return;

    const main = document.querySelector(".library-page");
    if (!main) return;

    const section = document.createElement("section");
    section.className = "library-section library-section--dark";
    section.id = "series-favoritas";
    section.setAttribute("data-library-section", "");
    section.setAttribute("aria-labelledby", "series-title");

    const cards = seriesBooks.map((book) => `
      <article class="library-card library-card--dark" id="${escapeHtml(book.id)}" data-library-category="romance series">
        <div class="library-cover library-cover--image">
          <img src="${book.image}" alt="Capa de ${escapeHtml(book.title)}, de Abbi Glines" loading="lazy" />
        </div>
        <div class="library-card-copy">
          <p class="library-tag">Rosemary Beach · ${escapeHtml(book.volume)}</p>
          <h3>${escapeHtml(book.title)}</h3>
          <p class="library-author">${escapeHtml(book.author)}</p>
          <p>${escapeHtml(book.description)}</p>
          <a class="library-button" href="${escapeHtml(book.url)}" target="_blank" rel="noopener noreferrer">Ver na Amazon <span aria-hidden="true">↗</span></a>
        </div>
      </article>
    `).join("");

    section.innerHTML = `
      <div class="library-section-head">
        <div>
          <p class="eyebrow">Séries preferidas da Adri</p>
          <h2 id="series-title">Rosemary<br /><em>Beach.</em></h2>
        </div>
        <p>Uma das séries preferidas da Adri. Abbi Glines conecta personagens e histórias ao longo dos livros, criando um universo em que cada casal ganha seu espaço sem perder o vínculo com os demais.</p>
      </div>
      <div class="library-grid">${cards}</div>
    `;

    const note = main.querySelector(".library-note");
    if (note) note.before(section);
    else main.append(section);
  };

  const addSeriesFilter = () => {
    const filters = document.querySelector(".library-filters");
    if (!filters || filters.querySelector('[data-library-filter="series"]')) return;

    const button = document.createElement("button");
    button.type = "button";
    button.dataset.libraryFilter = "series";
    button.setAttribute("aria-pressed", "false");
    button.textContent = "Séries";

    const romance = filters.querySelector('[data-library-filter="romance"]');
    if (romance) romance.after(button);
    else filters.append(button);
  };

  const initLibrary = () => {
    addSeriesSection();
    addSeriesFilter();

    const buttons = Array.from(document.querySelectorAll("[data-library-filter]"));
    const cards = Array.from(document.querySelectorAll("[data-library-category]"));
    const sections = Array.from(document.querySelectorAll("[data-library-section]"));
    const status = document.getElementById("libraryFilterStatus");

    if (!buttons.length || !cards.length || !status) return;

    const categoryNames = {
      todos: "todos os livros",
      romance: "Romance",
      series: "Séries",
      infantil: "Infantil",
      infantojuvenil: "Infantojuvenil",
      "literatura-contos": "Literatura e contos",
      "estudos-concursos": "Estudos e concursos"
    };

    const updateLibrary = (category) => {
      let count = 0;

      cards.forEach((card) => {
        const categories = card.dataset.libraryCategory.split(" ");
        const visible = category === "todos" || categories.includes(category);
        card.hidden = !visible;
        if (visible) count += 1;
      });

      sections.forEach((section) => {
        section.hidden = !Array.from(section.querySelectorAll("[data-library-category]")).some((card) => !card.hidden);
      });

      buttons.forEach((button) => {
        const active = button.dataset.libraryFilter === category;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });

      const noun = count === 1 ? "livro" : "livros";
      status.textContent = category === "todos"
        ? `Mostrando todos os ${count} livros.`
        : `Mostrando ${count} ${noun} em ${categoryNames[category] || category}.`;
    };

    buttons.forEach((button) => {
      button.addEventListener("click", () => updateLibrary(button.dataset.libraryFilter));
    });

    updateLibrary("todos");
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLibrary, { once: true });
  } else {
    initLibrary();
  }
})();