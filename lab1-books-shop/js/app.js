const bookList = document.querySelector("#book-list");
const cartCount = document.querySelector("#cart-count");
const cartStatus = document.querySelector("#cart-status");
const cartItems = document.querySelector("#cart-items");
const cartTotal = document.querySelector("#cart-total");
const cartFeedback = document.querySelector("#cart-feedback");
const checkoutOpen = document.querySelector("#checkout-open");
const orderForm = document.querySelector("#order-form");
const formFeedback = document.querySelector("#form-feedback");
const cart = new Map();
const storageKey = "leaf-bookstore-cart";

const priceFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0
});

function announce(message) {
  cartFeedback.textContent = message;
}

function persistCart() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(Array.from(cart.entries())));
  } catch {
    announce("Корзина обновлена, но браузер не смог сохранить её на этом устройстве.");
  }
}

function restoreCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    if (!Array.isArray(savedCart)) return;
    for (const entry of savedCart) {
      if (!Array.isArray(entry) || entry.length !== 2) continue;
      const [id, quantity] = entry;
      if (window.books.some((book) => book.id === id) && Number.isSafeInteger(quantity) && quantity > 0) {
        cart.set(id, quantity);
      }
    }
  } catch {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Storage may be unavailable; keep the catalog usable without persistence.
    }
  }
}

function renderCart() {
  const count = Array.from(cart.values()).reduce((total, quantity) => total + quantity, 0);
  const total = window.books.reduce((sum, book) => sum + book.price * (cart.get(book.id) ?? 0), 0);
  cartCount.textContent = String(count);
  cartItems.replaceChildren();
  cartTotal.textContent = priceFormatter.format(total);
  cartStatus.hidden = count > 0;
  cartItems.hidden = count === 0;
  cartTotal.closest(".cart-summary").hidden = count === 0;
  checkoutOpen.disabled = count === 0;
  if (count === 0) {
    orderForm.hidden = true;
    orderForm.reset();
    formFeedback.textContent = "";
  }

  if (count === 0) {
    cartStatus.textContent = "Корзина пуста. Добавьте книги из каталога, чтобы собрать заказ.";
    return;
  }

  for (const book of window.books) {
    const quantity = cart.get(book.id);
    if (!quantity) continue;
    const item = document.createElement("li");
    item.className = "cart-item";
    const description = document.createElement("div");
    description.className = "cart-item-description";
    const title = document.createElement("h3");
    title.textContent = book.title;
    const unitPrice = document.createElement("p");
    unitPrice.textContent = `${priceFormatter.format(book.price)} за книгу`;
    description.append(title, unitPrice);

    const controls = document.createElement("div");
    controls.className = "cart-item-controls";
    const decrease = document.createElement("button");
    decrease.type = "button";
    decrease.textContent = "−";
    decrease.setAttribute("aria-label", `Уменьшить количество книги «${book.title}»`);
    decrease.disabled = quantity <= 1;
    decrease.addEventListener("click", () => changeQuantity(book.id, quantity - 1));
    const amount = document.createElement("span");
    amount.className = "cart-quantity";
    amount.textContent = String(quantity);
    amount.setAttribute("aria-label", `Количество: ${quantity}`);
    const increase = document.createElement("button");
    increase.type = "button";
    increase.textContent = "+";
    increase.setAttribute("aria-label", `Увеличить количество книги «${book.title}»`);
    increase.addEventListener("click", () => changeQuantity(book.id, quantity + 1));
    controls.append(decrease, amount, increase);

    const lineTotal = document.createElement("strong");
    lineTotal.className = "cart-line-total";
    lineTotal.textContent = priceFormatter.format(book.price * quantity);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove-button";
    remove.textContent = "Удалить";
    remove.setAttribute("aria-label", `Удалить книгу «${book.title}» из корзины`);
    remove.addEventListener("click", () => {
      cart.delete(book.id);
      persistCart();
      renderCart();
      announce(`Книга «${book.title}» удалена из корзины.`);
    });
    item.append(description, controls, lineTotal, remove);
    cartItems.append(item);
  }
}

checkoutOpen.addEventListener("click", () => {
  if (cart.size === 0) return;
  orderForm.hidden = false;
  formFeedback.textContent = "";
  orderForm.querySelector("input").focus();
});

orderForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formFeedback.textContent = "";
  const fields = Array.from(orderForm.elements).filter((element) => element instanceof HTMLInputElement);
  for (const field of fields) {
    field.value = field.value.trim();
    if (!field.checkValidity()) {
      field.reportValidity();
      formFeedback.textContent = "Проверьте заполнение всех полей.";
      field.focus();
      return;
    }
  }
  const phone = orderForm.elements.namedItem("phone");
  const digits = phone.value.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) {
    phone.setCustomValidity("Введите номер телефона с 10–15 цифрами.");
    phone.reportValidity();
    phone.focus();
    formFeedback.textContent = "Введите корректный контактный телефон.";
    phone.setCustomValidity("");
    return;
  }
  announce("Заказ создан!");
  orderForm.reset();
  orderForm.hidden = true;
  cart.clear();
  persistCart();
  renderCart();
  announce("Заказ создан!");
});

function changeQuantity(id, quantity) {
  const book = window.books.find((item) => item.id === id);
  if (!book) return;
  cart.set(id, quantity);
  persistCart();
  renderCart();
  announce(`Количество книги «${book.title}» изменено: ${quantity}.`);
}

restoreCart();
renderCart();

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
    const quantity = (cart.get(book.id) ?? 0) + 1;
    cart.set(book.id, quantity);
    persistCart();
    renderCart();
    announce(`Книга «${book.title}» добавлена. В корзине ${quantity} ${quantity === 1 ? "экземпляр" : "экземпляра"}.`);
  });
  footer.append(price, button);
  details.append(genre, title, author, footer);
  article.append(image, details);
  bookList.append(article);
}
