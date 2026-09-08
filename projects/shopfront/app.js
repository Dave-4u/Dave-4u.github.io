(function () {
  "use strict";

  var STORAGE_KEY = "shopfront-cart-v1";
  var SHIPPING_FLAT = 2500;

  var PRODUCTS = [
    {
      id: "tee-01",
      name: "Everyday Cotton Tee",
      category: "Apparel",
      price: 8500,
      emoji: "👕",
      description: "Soft mid-weight cotton tee with a relaxed fit. Ideal for daily wear.",
      featured: true
    },
    {
      id: "hoodie-02",
      name: "City Fleece Hoodie",
      category: "Apparel",
      price: 24500,
      emoji: "🧥",
      description: "Brushed fleece hoodie with kangaroo pocket and adjustable drawcord.",
      featured: true
    },
    {
      id: "sneaker-03",
      name: "Stride Runner",
      category: "Footwear",
      price: 42000,
      emoji: "👟",
      description: "Lightweight trainers with cushioned midsole and breathable upper.",
      featured: true
    },
    {
      id: "cap-04",
      name: "Canvas Dad Cap",
      category: "Accessories",
      price: 6500,
      emoji: "🧢",
      description: "Washed canvas cap with adjustable strap and tonal embroidery.",
      featured: false
    },
    {
      id: "bag-05",
      name: "Weekend Tote",
      category: "Accessories",
      price: 18500,
      emoji: "👜",
      description: "Structured canvas tote with interior pocket and reinforced handles.",
      featured: true
    },
    {
      id: "watch-06",
      name: "Minimal Field Watch",
      category: "Accessories",
      price: 56000,
      emoji: "⌚",
      description: "Clean dial, leather strap, and water-resistant stainless case.",
      featured: false
    },
    {
      id: "buds-07",
      name: "Pulse Earbuds",
      category: "Gadgets",
      price: 38000,
      emoji: "🎧",
      description: "Wireless earbuds with noise isolation and a compact charging case.",
      featured: true
    },
    {
      id: "lamp-08",
      name: "Arc Desk Lamp",
      category: "Home",
      price: 22000,
      emoji: "💡",
      description: "Adjustable LED desk lamp with warm and cool light modes.",
      featured: false
    },
    {
      id: "mug-09",
      name: "Stoneware Mug",
      category: "Home",
      price: 4500,
      emoji: "☕",
      description: "Hand-glazed 350ml mug that keeps drinks warm longer.",
      featured: false
    },
    {
      id: "bottle-10",
      name: "Trail Bottle 750ml",
      category: "Home",
      price: 12000,
      emoji: "🧴",
      description: "Insulated stainless bottle that keeps liquids cold for hours.",
      featured: true
    },
    {
      id: "keyboard-11",
      name: "Compact Mech Keyboard",
      category: "Gadgets",
      price: 49500,
      emoji: "⌨️",
      description: "75% layout mechanical keyboard with hot-swap switches.",
      featured: false
    },
    {
      id: "jeans-12",
      name: "Straight Selvedge Denim",
      category: "Apparel",
      price: 32000,
      emoji: "👖",
      description: "Mid-rise straight jeans with durable selvedge denim construction.",
      featured: false
    }
  ];

  var state = {
    category: "All",
    query: "",
    sort: "featured",
    cart: loadCart(),
    activeProductId: null,
    view: "shop"
  };

  var els = {
    grid: document.getElementById("product-grid"),
    empty: document.getElementById("empty-catalog"),
    categories: document.getElementById("category-filters"),
    sort: document.getElementById("sort-select"),
    search: document.getElementById("search-input"),
    resultCount: document.getElementById("result-count"),
    cartToggle: document.getElementById("cart-toggle"),
    cartCount: document.getElementById("cart-count"),
    cartDrawer: document.getElementById("cart-drawer"),
    cartBackdrop: document.getElementById("cart-backdrop"),
    cartClose: document.getElementById("cart-close"),
    cartBody: document.getElementById("cart-body"),
    cartFooter: document.getElementById("cart-footer"),
    cartSubtotal: document.getElementById("cart-subtotal"),
    goCheckout: document.getElementById("go-checkout"),
    shopView: document.getElementById("shop-view"),
    checkoutView: document.getElementById("checkout-view"),
    successView: document.getElementById("success-view"),
    backToShop: document.getElementById("back-to-shop"),
    checkoutForm: document.getElementById("checkout-form"),
    checkoutLines: document.getElementById("checkout-lines"),
    checkoutSubtotal: document.getElementById("checkout-subtotal"),
    checkoutShipping: document.getElementById("checkout-shipping"),
    checkoutTotal: document.getElementById("checkout-total"),
    shopAgain: document.getElementById("shop-again"),
    orderId: document.getElementById("order-id"),
    modal: document.getElementById("product-modal"),
    modalBackdrop: document.getElementById("modal-backdrop"),
    modalClose: document.getElementById("modal-close"),
    modalContent: document.getElementById("modal-content"),
    hero: document.querySelector(".hero-banner")
  };

  function loadCart() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (err) {
      return {};
    }
  }

  function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart));
  }

  function formatNaira(amount) {
    return "₦" + Number(amount).toLocaleString("en-NG");
  }

  function cartEntries() {
    return Object.keys(state.cart)
      .map(function (id) {
        var product = PRODUCTS.find(function (p) { return p.id === id; });
        if (!product || state.cart[id] < 1) return null;
        return { product: product, qty: state.cart[id] };
      })
      .filter(Boolean);
  }

  function cartCount() {
    return cartEntries().reduce(function (sum, item) {
      return sum + item.qty;
    }, 0);
  }

  function cartSubtotal() {
    return cartEntries().reduce(function (sum, item) {
      return sum + item.product.price * item.qty;
    }, 0);
  }

  function categories() {
    var set = {};
    PRODUCTS.forEach(function (p) { set[p.category] = true; });
    return ["All"].concat(Object.keys(set).sort());
  }

  function filteredProducts() {
    var q = state.query.trim().toLowerCase();
    var list = PRODUCTS.filter(function (p) {
      var catOk = state.category === "All" || p.category === state.category;
      var qOk =
        !q ||
        p.name.toLowerCase().indexOf(q) !== -1 ||
        p.description.toLowerCase().indexOf(q) !== -1 ||
        p.category.toLowerCase().indexOf(q) !== -1;
      return catOk && qOk;
    });

    list = list.slice().sort(function (a, b) {
      if (state.sort === "price-asc") return a.price - b.price;
      if (state.sort === "price-desc") return b.price - a.price;
      if (state.sort === "name") return a.name.localeCompare(b.name);
      return Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name);
    });

    return list;
  }

  function renderCategories() {
    els.categories.innerHTML = categories()
      .map(function (cat) {
        var active = cat === state.category ? " active" : "";
        return '<button type="button" class="chip' + active + '" data-category="' + cat + '">' + cat + "</button>";
      })
      .join("");
  }

  function renderCatalog() {
    var list = filteredProducts();
    els.resultCount.textContent = list.length + " product" + (list.length === 1 ? "" : "s");
    els.empty.hidden = list.length > 0;
    els.grid.innerHTML = list
      .map(function (p) {
        return (
          '<article class="product-card" data-id="' + p.id + '">' +
            '<button type="button" class="product-media" data-open="' + p.id + '" aria-label="View ' + escapeHtml(p.name) + '">' +
              p.emoji +
            "</button>" +
            '<div class="product-body">' +
              '<p class="product-category">' + escapeHtml(p.category) + "</p>" +
              "<h3>" + escapeHtml(p.name) + "</h3>" +
              '<p class="product-desc">' + escapeHtml(p.description) + "</p>" +
              '<div class="product-footer">' +
                '<span class="price">' + formatNaira(p.price) + "</span>" +
                '<button type="button" class="btn btn-primary btn-sm" data-add="' + p.id + '">Add</button>' +
              "</div>" +
            "</div>" +
          "</article>"
        );
      })
      .join("");
  }

  function renderCartBadge() {
    var count = cartCount();
    els.cartCount.hidden = count === 0;
    els.cartCount.textContent = String(count);
  }

  function renderCart() {
    var items = cartEntries();
    renderCartBadge();
    els.cartSubtotal.textContent = formatNaira(cartSubtotal());
    els.goCheckout.disabled = items.length === 0;

    if (!items.length) {
      els.cartBody.innerHTML = '<p class="cart-empty">Your cart is empty. Add something you like.</p>';
      return;
    }

    els.cartBody.innerHTML = items
      .map(function (item) {
        var p = item.product;
        return (
          '<div class="cart-item" data-cart-id="' + p.id + '">' +
            '<div class="cart-thumb" aria-hidden="true">' + p.emoji + "</div>" +
            "<div>" +
              "<h3>" + escapeHtml(p.name) + "</h3>" +
              "<p>" + formatNaira(p.price) + "</p>" +
              '<div class="qty-controls">' +
                '<button type="button" data-qty-dec="' + p.id + '" aria-label="Decrease quantity">−</button>' +
                "<span>" + item.qty + "</span>" +
                '<button type="button" data-qty-inc="' + p.id + '" aria-label="Increase quantity">+</button>' +
              "</div>" +
            "</div>" +
            '<div class="cart-item-actions">' +
              "<strong>" + formatNaira(p.price * item.qty) + "</strong>" +
              '<button type="button" class="remove-btn" data-remove="' + p.id + '">Remove</button>' +
            "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  function renderCheckoutSummary() {
    var items = cartEntries();
    var subtotal = cartSubtotal();
    var shipping = items.length ? SHIPPING_FLAT : 0;
    els.checkoutLines.innerHTML = items
      .map(function (item) {
        return (
          "<li><span>" +
          escapeHtml(item.product.name) +
          " × " +
          item.qty +
          "</span><span>" +
          formatNaira(item.product.price * item.qty) +
          "</span></li>"
        );
      })
      .join("");
    els.checkoutSubtotal.textContent = formatNaira(subtotal);
    els.checkoutShipping.textContent = formatNaira(shipping);
    els.checkoutTotal.textContent = formatNaira(subtotal + shipping);
  }

  function openCart() {
    els.cartDrawer.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeCart() {
    els.cartDrawer.hidden = true;
    document.body.style.overflow = "";
  }

  function openModal(productId) {
    var product = PRODUCTS.find(function (p) { return p.id === productId; });
    if (!product) return;
    state.activeProductId = productId;
    els.modalContent.innerHTML =
      '<div class="modal-layout">' +
        '<div class="modal-media" aria-hidden="true">' + product.emoji + "</div>" +
        "<div>" +
          '<p class="modal-meta">' + escapeHtml(product.category) + "</p>" +
          '<h2 id="modal-title">' + escapeHtml(product.name) + "</h2>" +
          "<p>" + escapeHtml(product.description) + "</p>" +
          '<p class="modal-price">' + formatNaira(product.price) + "</p>" +
          '<button type="button" class="btn btn-primary" data-add="' + product.id + '">Add to cart</button>' +
        "</div>" +
      "</div>";
    els.modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    els.modal.hidden = true;
    state.activeProductId = null;
    if (els.cartDrawer.hidden) document.body.style.overflow = "";
  }

  function setView(view) {
    state.view = view;
    els.shopView.hidden = view !== "shop";
    els.hero.hidden = view !== "shop";
    els.checkoutView.hidden = view !== "checkout";
    els.successView.hidden = view !== "success";
    closeCart();
    closeModal();
    if (view === "checkout") renderCheckoutSummary();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addToCart(id, qty) {
    qty = qty || 1;
    state.cart[id] = (state.cart[id] || 0) + qty;
    saveCart();
    renderCart();
  }

  function setQty(id, qty) {
    if (qty <= 0) {
      delete state.cart[id];
    } else {
      state.cart[id] = qty;
    }
    saveCart();
    renderCart();
    if (state.view === "checkout") renderCheckoutSummary();
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function clearFieldErrors() {
    Array.prototype.forEach.call(document.querySelectorAll(".field-error"), function (el) {
      el.textContent = "";
    });
    Array.prototype.forEach.call(document.querySelectorAll(".field input"), function (el) {
      el.classList.remove("invalid");
    });
  }

  function showError(name, message) {
    var input = els.checkoutForm.elements[name];
    var err = document.querySelector('.field-error[data-for="' + name + '"]');
    if (input) input.classList.add("invalid");
    if (err) err.textContent = message;
  }

  function validateCheckout() {
    clearFieldErrors();
    var data = {
      fullName: els.checkoutForm.fullName.value.trim(),
      email: els.checkoutForm.email.value.trim(),
      phone: els.checkoutForm.phone.value.trim(),
      address: els.checkoutForm.address.value.trim(),
      city: els.checkoutForm.city.value.trim(),
      state: els.checkoutForm.state.value.trim(),
      zip: els.checkoutForm.zip.value.trim(),
      country: els.checkoutForm.country.value.trim(),
      cardName: els.checkoutForm.cardName.value.trim(),
      cardNumber: els.checkoutForm.cardNumber.value.replace(/\s+/g, ""),
      cardExpiry: els.checkoutForm.cardExpiry.value.trim(),
      cardCvc: els.checkoutForm.cardCvc.value.trim()
    };
    var ok = true;

    if (data.fullName.length < 2) { showError("fullName", "Enter your full name."); ok = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { showError("email", "Enter a valid email."); ok = false; }
    if (data.phone.replace(/\D/g, "").length < 8) { showError("phone", "Enter a valid phone number."); ok = false; }
    if (data.address.length < 5) { showError("address", "Enter a street address."); ok = false; }
    if (!data.city) { showError("city", "Required."); ok = false; }
    if (!data.state) { showError("state", "Required."); ok = false; }
    if (!data.zip) { showError("zip", "Required."); ok = false; }
    if (!data.country) { showError("country", "Required."); ok = false; }
    if (data.cardName.length < 2) { showError("cardName", "Enter the name on the card."); ok = false; }
    if (!/^\d{13,19}$/.test(data.cardNumber)) { showError("cardNumber", "Enter 13–19 digits."); ok = false; }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(data.cardExpiry)) { showError("cardExpiry", "Use MM/YY."); ok = false; }
    if (!/^\d{3,4}$/.test(data.cardCvc)) { showError("cardCvc", "Enter 3–4 digits."); ok = false; }
    if (!cartEntries().length) { ok = false; }

    return ok ? data : null;
  }

  function onClick(e) {
    var t = e.target.closest("[data-category], [data-add], [data-open], [data-qty-inc], [data-qty-dec], [data-remove], [data-view]");
    if (!t) return;

    if (t.hasAttribute("data-category")) {
      state.category = t.getAttribute("data-category");
      renderCategories();
      renderCatalog();
      return;
    }
    if (t.hasAttribute("data-add")) {
      addToCart(t.getAttribute("data-add"));
      openCart();
      return;
    }
    if (t.hasAttribute("data-open")) {
      openModal(t.getAttribute("data-open"));
      return;
    }
    if (t.hasAttribute("data-qty-inc")) {
      var idInc = t.getAttribute("data-qty-inc");
      setQty(idInc, (state.cart[idInc] || 0) + 1);
      return;
    }
    if (t.hasAttribute("data-qty-dec")) {
      var idDec = t.getAttribute("data-qty-dec");
      setQty(idDec, (state.cart[idDec] || 0) - 1);
      return;
    }
    if (t.hasAttribute("data-remove")) {
      setQty(t.getAttribute("data-remove"), 0);
      return;
    }
    if (t.getAttribute("data-view") === "shop") {
      setView("shop");
    }
  }

  els.categories.addEventListener("click", onClick);
  els.grid.addEventListener("click", onClick);
  els.cartBody.addEventListener("click", onClick);
  els.modalContent.addEventListener("click", onClick);
  document.querySelector(".logo").addEventListener("click", function (e) {
    e.preventDefault();
    setView("shop");
  });

  els.sort.addEventListener("change", function () {
    state.sort = els.sort.value;
    renderCatalog();
  });

  els.search.addEventListener("input", function () {
    state.query = els.search.value;
    renderCatalog();
  });

  els.cartToggle.addEventListener("click", openCart);
  els.cartClose.addEventListener("click", closeCart);
  els.cartBackdrop.addEventListener("click", closeCart);
  els.modalClose.addEventListener("click", closeModal);
  els.modalBackdrop.addEventListener("click", closeModal);

  els.goCheckout.addEventListener("click", function () {
    if (!cartEntries().length) return;
    setView("checkout");
  });

  els.backToShop.addEventListener("click", function () {
    setView("shop");
  });

  els.shopAgain.addEventListener("click", function () {
    setView("shop");
  });

  els.checkoutForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = validateCheckout();
    if (!data) return;
    var id = "SF-" + Date.now().toString(36).toUpperCase();
    els.orderId.textContent = "Order reference: " + id;
    state.cart = {};
    saveCart();
    renderCart();
    els.checkoutForm.reset();
    setView("success");
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeModal();
      closeCart();
    }
  });

  renderCategories();
  renderCatalog();
  renderCart();
})();
