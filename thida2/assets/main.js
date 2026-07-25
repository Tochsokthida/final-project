const CART_KEY = "emberCart";

const products = {
  "After Rain": {
    price: 28,
    notes: "Vetiver · Moss · Wet stone",
    size: "220 g · 45 hr",
    image: "./public/images/candle-amber.jpg",
  },
  "Silk Evening": {
    price: 32,
    notes: "Jasmine · Saffron · Sandalwood",
    size: "220 g · 45 hr",
    image: "./public/images/candle-sand.jpg",
  },
  "Tonlé Dusk": {
    price: 30,
    notes: "Tonka · Amber · Cedar",
    size: "220 g · 45 hr",
    image: "./public/images/candle-tonka.jpg",
  },
  "Pomelo Sun": {
    price: 26,
    notes: "Pomelo · Bergamot · White tea",
    size: "180 g · 38 hr",
    image: "./public/images/candle-hero.jpg",
  },
  "Fig Leaf": {
    price: 29,
    notes: "Green fig · Tea leaf · Cypress",
    size: "220 g · 45 hr",
    image: "./public/images/candle-amber.jpg",
  },
  "Rose Window": {
    price: 30,
    notes: "Damask rose · Lychee · Soft musk",
    size: "220 g · 45 hr",
    image: "./public/images/candle-tonka.jpg",
  },
};

function readCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_KEY) || "{}");
    return Object.fromEntries(
      Object.entries(stored).filter(
        ([name, quantity]) =>
          products[name] && Number.isInteger(quantity) && quantity > 0,
      ),
    );
  } catch {
    return {};
  }
}

function writeCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartIndicators(cart);
}

function cartCount(cart = readCart()) {
  return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
}

function cartSubtotal(cart = readCart()) {
  return Object.entries(cart).reduce(
    (total, [name, quantity]) => total + products[name].price * quantity,
    0,
  );
}

function money(value) {
  return `$${value.toFixed(2)}`;
}

function updateCartIndicators(cart = readCart()) {
  const count = cartCount(cart);
  document.querySelectorAll("[data-nav-cart-count]").forEach((badge) => {
    badge.textContent = count;
    badge.hidden = count === 0;
  });
  document.querySelectorAll("[data-bag-count]").forEach((label) => {
    label.textContent = `${count} ${count === 1 ? "item" : "items"}`;
  });
}

document.querySelectorAll(".newsletter-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = document.createElement("p");
    message.className = "newsletter__thanks";
    message.setAttribute("role", "status");
    message.textContent =
      "You’re on the list. A little warmth is coming your way.";
    form.replaceWith(message);
  });
});

const filterButtons = document.querySelectorAll("[data-filter]");
const shopItems = document.querySelectorAll("[data-mood]");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => {
      item.classList.toggle("active", item === button);
      item.setAttribute("aria-pressed", String(item === button));
    });
    shopItems.forEach((item) => {
      item.hidden = filter !== "All" && item.dataset.mood !== filter;
    });
  });
});

const toast = document.querySelector(".bag-toast");
const toastProduct = document.querySelector("[data-toast-product]");

document.querySelectorAll(".add-to-bag").forEach((button) => {
  button.addEventListener("click", () => {
    const name = button.dataset.product;
    if (!products[name]) return;
    const cart = readCart();
    cart[name] = (cart[name] || 0) + 1;
    writeCart(cart);
    if (toast && toastProduct) {
      toastProduct.textContent = name;
      toast.hidden = false;
    }
  });
});

document.querySelector("[data-dismiss-toast]")?.addEventListener("click", () => {
  if (toast) toast.hidden = true;
});

document.querySelector(".contact-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = String(form.get("name") || "");
  const email = String(form.get("email") || "");
  const subject = String(form.get("subject") || "A note for Ember");
  const message = String(form.get("message") || "");
  const body = encodeURIComponent(
    `From: ${name}\nReply to: ${email}\n\n${message}`,
  );
  window.location.href = `mailto:hello@emberphnompenh.com?subject=${encodeURIComponent(subject)}&body=${body}`;
  const status = document.querySelector(".contact-form-status");
  if (status) {
    status.hidden = false;
    status.focus();
  }
});

function renderCart() {
  const list = document.querySelector("[data-cart-items]");
  if (!list) return;

  const cart = readCart();
  const entries = Object.entries(cart);
  const emptyState = document.querySelector("[data-cart-empty]");
  const cartContent = document.querySelector("[data-cart-content]");

  if (entries.length === 0) {
    emptyState.hidden = false;
    cartContent.hidden = true;
    return;
  }

  emptyState.hidden = true;
  cartContent.hidden = false;
  list.innerHTML = entries
    .map(([name, quantity]) => {
      const product = products[name];
      return `
        <article class="cart-item" data-cart-item="${name}">
          <img class="cart-item__image" src="${product.image}" alt="${name} scented candle">
          <div class="cart-item__info">
            <p class="eyebrow">Ember Phnom Penh</p>
            <h2>${name}</h2>
            <p>${product.notes}</p>
            <span>${product.size}</span>
          </div>
          <div class="cart-item__controls">
            <strong>${money(product.price * quantity)}</strong>
            <div class="quantity-control" aria-label="Quantity for ${name}">
              <button type="button" data-cart-action="decrease" aria-label="Decrease ${name} quantity">−</button>
              <span aria-live="polite">${quantity}</span>
              <button type="button" data-cart-action="increase" aria-label="Increase ${name} quantity">+</button>
            </div>
            <button class="remove-item" type="button" data-cart-action="remove">Remove</button>
          </div>
        </article>`;
    })
    .join("");

  updateSummary(cart);
}

function updateSummary(cart = readCart()) {
  const subtotal = cartSubtotal(cart);
  const shipping = subtotal === 0 || subtotal >= 45 ? 0 : 4;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  document.querySelectorAll("[data-summary-subtotal]").forEach((node) => {
    node.textContent = money(subtotal);
  });
  document.querySelectorAll("[data-summary-shipping]").forEach((node) => {
    node.textContent = shipping === 0 ? "Complimentary" : money(shipping);
  });
  document.querySelectorAll("[data-summary-tax]").forEach((node) => {
    node.textContent = money(tax);
  });
  document.querySelectorAll("[data-summary-total]").forEach((node) => {
    node.textContent = money(total);
  });
}

document.querySelector("[data-cart-items]")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-cart-action]");
  const item = event.target.closest("[data-cart-item]");
  if (!button || !item) return;

  const name = item.dataset.cartItem;
  const cart = readCart();
  if (button.dataset.cartAction === "increase") cart[name] += 1;
  if (button.dataset.cartAction === "decrease") cart[name] -= 1;
  if (button.dataset.cartAction === "remove" || cart[name] <= 0) delete cart[name];
  writeCart(cart);
  renderCart();
});

function renderCheckout() {
  const list = document.querySelector("[data-checkout-items]");
  if (!list) return;
  const cart = readCart();
  const entries = Object.entries(cart);
  const checkoutForm = document.querySelector("[data-checkout-form]");
  const emptyState = document.querySelector("[data-checkout-empty]");

  if (entries.length === 0) {
    checkoutForm.hidden = true;
    emptyState.hidden = false;
    return;
  }

  list.innerHTML = entries
    .map(([name, quantity]) => {
      const product = products[name];
      return `
        <div class="checkout-item">
          <div class="checkout-item__image-wrap">
            <img src="${product.image}" alt="">
            <span>${quantity}</span>
          </div>
          <div><strong>${name}</strong><small>${product.notes}</small></div>
          <b>${money(product.price * quantity)}</b>
        </div>`;
    })
    .join("");
  updateSummary(cart);
}

document.querySelector("[data-auth-form]")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  window.location.href =
    form.dataset.authForm === "signup" ? "./login.html" : "./index.html";
});

document.querySelector("[data-card-number]")?.addEventListener("input", (event) => {
  const digits = event.target.value.replace(/\D/g, "").slice(0, 16);
  event.target.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
});

document.querySelector("[data-card-expiry]")?.addEventListener("input", (event) => {
  const digits = event.target.value.replace(/\D/g, "").slice(0, 4);
  event.target.value =
    digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits;
});

document.querySelector("[data-checkout-form]")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const cart = readCart();
  if (cartCount(cart) === 0) return;

  const orderNumber = `EMBER-${String(Date.now()).slice(-6)}`;
  localStorage.removeItem(CART_KEY);
  updateCartIndicators({});
  event.currentTarget.hidden = true;
  const confirmation = document.querySelector("[data-order-confirmation]");
  confirmation.hidden = false;
  confirmation.querySelector("[data-order-number]").textContent = orderNumber;
  confirmation.focus();
});

updateCartIndicators();
renderCart();
renderCheckout();
