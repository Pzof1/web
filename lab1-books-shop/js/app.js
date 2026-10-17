const bookList = document.querySelector("#book-list");
const cartCount = document.querySelector("#cart-count");
const cartStatus = document.querySelector("#cart-status");
const cart = new Map();

const priceFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0
});

function updateCartCount() {
  const count = Array.from(cart.values()).reduce((total, quantity) => total + quantity, 0);
  cartCount.textContent = String(count);
  cartStatus.textContent = count === 0
    ? "Здесь появятся выбранные книги."
    : `В корзине ${count} ${count === 1 ? "книга" : count < 5 ? "книги" : "книг"}. Полное управление заказом появится на следующем этапе.`;
}

for (const book of window.books) {
  const article = document.createElement("article");
  article.className = "book-card";

  const image = document.createElement("img");
  image.className = `book-cover cover-${book.color}`;
  image.src = book.cover;
  image.alt = `Обложка книги «${book.title}»`;
  image.width = 360;
  image.height = 460;

  const details = document.createElement("div");
  details.className = "book-details";
  const genre = document.createElement("p");
  genre.className = "book-genre";
  genre.textContent = book.genre;
  const title = document.createElement("h3");
  title.textContent = book.title;
  const author = document.createElement("p");
  author.className = "book-author";
  author.textContent = book.author;
  const footer = document.createElement("div");
  footer.className = "book-footer";
  const price = document.createElement("span");
  price.className = "book-price";
  price.textContent = priceFormatter.format(book.price);
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Добавить";
  button.setAttribute("aria-label", `Добавить книгу «${book.title}» в корзину`);
  button.addEventListener("click", () => {
    cart.set(book.id, (cart.get(book.id) ?? 0) + 1);
    updateCartCount();
  });
  footer.append(price, button);
  details.append(genre, title, author, footer);
  article.append(image, details);
  bookList.append(article);
}
