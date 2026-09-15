(() => {
  const buttons = Array.from(document.querySelectorAll("[data-library-filter]"));
  const cards = Array.from(document.querySelectorAll("[data-library-category]"));
  const sections = Array.from(document.querySelectorAll("[data-library-section]"));
  const status = document.getElementById("libraryFilterStatus");

  if (!buttons.length || !cards.length || !status) return;

  const categoryNames = {
    todos: "todos os livros",
    romance: "Romance",
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
      : `Mostrando ${count} ${noun} em ${categoryNames[category]}.`;
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => updateLibrary(button.dataset.libraryFilter));
  });
})();