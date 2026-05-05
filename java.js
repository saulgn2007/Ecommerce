
    const CATALOG = [
      { id:1,  title:"Cien años de soledad", author:"G. García Márquez",  category:"Novela",          price:14.95, color:"#4A3F6B" },
      { id:2,  title:"El nombre del viento",  author:"Patrick Rothfuss",   category:"Fantasía",        price:17.50, color:"#2E6B5E" },
      { id:3,  title:"Sapiens",               author:"Yuval Noah Harari",  category:"Ensayo",          price:19.90, color:"#B85C38" },
      { id:4,  title:"La sombra del viento",  author:"Carlos Ruiz Zafón",  category:"Misterio",        price:13.95, color:"#2B4A7B" },
      { id:5,  title:"Dune",                  author:"Frank Herbert",       category:"Ciencia ficción", price:16.00, color:"#8C5A1E" },
      { id:6,  title:"Crimen y castigo",      author:"F. Dostoyevski",      category:"Clásico",         price:9.95,  color:"#3A3A3A" },
      { id:7,  title:"Atomic Habits",         author:"James Clear",         category:"Ensayo",          price:18.50, color:"#2E5A8C" },
      { id:8,  title:"El hobbit",             author:"J.R.R. Tolkien",      category:"Fantasía",        price:12.00, color:"#4E7A3A" },
      { id:9,  title:"Norwegian Wood",        author:"Haruki Murakami",     category:"Novela",          price:13.50, color:"#9C3B4A" },
      { id:10, title:"El código Da Vinci",    author:"Dan Brown",           category:"Misterio",        price:11.95, color:"#6A4A2E" },
      { id:11, title:"Cosmos",                author:"Carl Sagan",          category:"Ciencia ficción", price:21.00, color:"#1E3A5F" },
      { id:12, title:"Don Quijote",           author:"M. de Cervantes",     category:"Clásico",         price:8.90,  color:"#5A3E28" },
    ];


    let currentCategory = "Todos";
    let currentSort     = "default";
    let cart            = [];
    let session         = null;

    function loadSession() {
      try {
        const stored = sessionStorage.getItem("folio_session");
        if (stored) session = JSON.parse(stored);
      } catch(e) {}
      updateSessionUI();
    }

    function saveSession(name, email) {
      session = { name, email, loginTime: new Date().toLocaleString("es-ES") };
      sessionStorage.setItem("folio_session", JSON.stringify(session));
      updateSessionUI();
    }

    function logout() {
      session = null;
      sessionStorage.removeItem("folio_session");
      updateSessionUI();
      showToast("Has cerrado sesión");
    }

    function updateSessionUI() {
      const avatar  = document.getElementById("userAvatar");
      const nameEl  = document.getElementById("userName");
      const infoEl  = document.getElementById("sessionInfo");

      if (session) {
        const initials = session.name.trim().split(/\s+/).map(w => w[0]).join("").toUpperCase().slice(0,2);
        avatar.textContent = initials;
        nameEl.textContent = session.name.split(" ")[0];
        infoEl.innerHTML = `
          <strong>${session.name}</strong><br>
          ${session.email}<br>
          Sesión: ${session.loginTime}
          <div class="logout-btn" id="logoutBtn">Cerrar sesión</div>
        `;
        document.getElementById("logoutBtn").addEventListener("click", logout);
      } else {
        avatar.textContent = "?";
        nameEl.textContent = "Iniciar sesión";
        infoEl.textContent = "No has iniciado sesión.";
      }
    }

    function addToCart(productId) {
      const existing = cart.find(item => item.id === productId);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ id: productId, qty: 1 });
      }
      renderCart();
      updateCartBadge();
      renderProducts();
      const product = CATALOG.find(p => p.id === productId);
      showToast(`"${product.title}" añadido al carrito`);
    }

    function removeFromCart(productId) {
      cart = cart.filter(item => item.id !== productId);
      renderCart();
      updateCartBadge();
      renderProducts();
    }

    function changeQty(productId, delta) {
      const item = cart.find(i => i.id === productId);
      if (!item) return;
      item.qty += delta;
      if (item.qty <= 0) {
        removeFromCart(productId);
      } else {
        renderCart();
      }
    }

    function updateCartBadge() {
      const count = cart.reduce((sum, i) => sum + i.qty, 0);
      const badge = document.getElementById("cartCount");
      badge.textContent = count;
      badge.classList.toggle("hidden", count === 0);
    }


    function calcSubtotal() {
      return cart.reduce((sum, item) => {
        const product = CATALOG.find(p => p.id === item.id);
        return sum + (product ? product.price * item.qty : 0);
      }, 0);
    }

    function calcShipping(subtotal) {
      if (subtotal === 0) return 0;
      return subtotal >= 25 ? 0 : 3.90;
    }

    function calcTotal() {
      const subtotal = calcSubtotal();
      return subtotal + calcShipping(subtotal);
    }

    function renderCart() {
      const container  = document.getElementById("cartItems");
      const totalsEl   = document.getElementById("cartTotals");
      const checkoutBtn = document.getElementById("checkoutBtn");

      if (cart.length === 0) {
        container.innerHTML = '<p class="cart-empty">Tu carrito está vacío.</p>';
        totalsEl.innerHTML  = "";
        checkoutBtn.disabled = true;
        return;
      }

      container.innerHTML = cart.map(item => {
        const p = CATALOG.find(pr => pr.id === item.id);
        if (!p) return "";
        return `
          <div class="cart-item">
            <div class="cart-item-cover" style="background:${p.color}">
              <span style="font-size:7px;color:#fff;font-family:serif;font-weight:700;text-align:center;line-height:1.2;padding:2px;display:block">${p.title}</span>
            </div>
            <div class="cart-item-info">
              <div class="cart-item-title">${p.title}</div>
              <div class="cart-item-author">${p.author}</div>
              <div class="cart-item-price">${(p.price * item.qty).toFixed(2)} €</div>
              <div class="cart-item-qty">
                <button class="qty-btn" onclick="changeQty(${p.id}, -1)">−</button>
                <span class="qty-num">${item.qty}</span>
                <button class="qty-btn" onclick="changeQty(${p.id}, 1)">+</button>
              </div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${p.id})">✕</button>
          </div>
        `;
      }).join("");

      const subtotal = calcSubtotal();
      const shipping = calcShipping(subtotal);
      const total    = calcTotal();
      const shipText = shipping === 0
        ? '<span style="color:#3A6E45;font-weight:500">Gratis ✓</span>'
        : `${shipping.toFixed(2)} €`;

      totalsEl.innerHTML = `
        <div class="cart-total-row"><span>Subtotal</span><span>${subtotal.toFixed(2)} €</span></div>
        <div class="cart-total-row"><span>Envío</span><span>${shipText}</span></div>
        ${shipping > 0 ? `<div style="font-size:11px;color:var(--color-text-muted);margin-bottom:4px">Envío gratis a partir de 25 €</div>` : ""}
        <div class="cart-total-row grand"><span>Total</span><span class="total-val">${total.toFixed(2)} €</span></div>
      `;

      checkoutBtn.disabled = false;
    }

    function filterByCategory(category) {
      currentCategory = category;
      document.getElementById("sectionTitle").textContent =
        category === "Todos" ? "Todos los libros" : category;
      renderCategoryList();
      renderProducts();
    }

    function sortProducts(products, order) {
      const arr = [...products];
      switch (order) {
        case "asc":   return arr.sort((a, b) => a.price - b.price);
        case "desc":  return arr.sort((a, b) => b.price - a.price);
        case "title": return arr.sort((a, b) => a.title.localeCompare(b.title, "es"));
        default:      return arr;
      }
    }

    function getFilteredProducts() {
      const filtered = currentCategory === "Todos"
        ? [...CATALOG]
        : CATALOG.filter(p => p.category === currentCategory);
      return sortProducts(filtered, currentSort);
    }

   
    function renderProducts() {
      const grid     = document.getElementById("productsGrid");
      const countEl  = document.getElementById("productsCount");
      const products = getFilteredProducts();

      countEl.textContent = `${products.length} libro${products.length !== 1 ? "s" : ""}`;

      if (products.length === 0) {
        grid.innerHTML = '<p class="no-results">No se encontraron libros en esta categoría.</p>';
        return;
      }

      grid.innerHTML = products.map(p => {
        const inCart = cart.some(i => i.id === p.id);
        return `
          <article class="product-card">
            <div class="product-cover" style="background:${p.color}">
              <div class="cover-inner">
                <div class="cover-label">${p.title}</div>
                <div class="cover-author">${p.author}</div>
              </div>
            </div>
            <div class="product-body">
              <span class="product-cat">${p.category}</span>
              <div class="product-title">${p.title}</div>
              <div class="product-author">${p.author}</div>
              <div class="product-footer">
                <span class="product-price">${p.price.toFixed(2)} €</span>
                <button class="add-cart-btn ${inCart ? "added" : ""}" onclick="addToCart(${p.id})">
                  ${inCart ? "✓ Añadido" : "+ Añadir"}
                </button>
              </div>
            </div>
          </article>
        `;
      }).join("");
    }


    function renderCategoryList() {
      const categories = ["Todos", ...new Set(CATALOG.map(p => p.category))];
      document.getElementById("catList").innerHTML = categories.map(cat => {
        const count = cat === "Todos"
          ? CATALOG.length
          : CATALOG.filter(p => p.category === cat).length;
        return `
          <li>
            <button class="cat-btn ${cat === currentCategory ? "active" : ""}"
              onclick="filterByCategory('${cat}')">
              ${cat}
              <span class="cat-count">${count}</span>
            </button>
          </li>
        `;
      }).join("");
    }


    let toastTimer;
    function showToast(msg) {
      const t = document.getElementById("toast");
      t.textContent = msg;
      t.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
    }

 
    document.getElementById("cartBtn").addEventListener("click", () => {
      document.getElementById("cartPanel").classList.add("open");
      document.getElementById("cartOverlay").classList.add("open");
    });
    const closeCartFn = () => {
      document.getElementById("cartPanel").classList.remove("open");
      document.getElementById("cartOverlay").classList.remove("open");
    };
    document.getElementById("closeCart").addEventListener("click", closeCartFn);
    document.getElementById("cartOverlay").addEventListener("click", closeCartFn);

    document.getElementById("checkoutBtn").addEventListener("click", () => {
      if (!session) {
        showToast("Inicia sesión para finalizar tu compra");
        document.getElementById("loginModal").classList.add("open");
        return;
      }
      showToast(`¡Pedido confirmado para ${session.name.split(" ")[0]}! 🎉`);
      cart = [];
      renderCart();
      updateCartBadge();
      renderProducts();
      closeCartFn();
    });

    document.getElementById("sessionBtn").addEventListener("click", () => {
      if (!session) document.getElementById("loginModal").classList.add("open");
    });

    document.getElementById("closeModal").addEventListener("click", () => {
      document.getElementById("loginModal").classList.remove("open");
    });

    document.getElementById("loginBtn").addEventListener("click", () => {
      const name  = document.getElementById("inputName").value.trim();
      const email = document.getElementById("inputEmail").value.trim();
      if (!name || !email) { showToast("Rellena todos los campos"); return; }
      if (!email.includes("@")) { showToast("Email no válido"); return; }
      saveSession(name, email);
      document.getElementById("loginModal").classList.remove("open");
      showToast(`¡Bienvenido/a, ${name.split(" ")[0]}!`);
    });

    document.getElementById("sortSelect").addEventListener("change", e => {
      currentSort = e.target.value;
      renderProducts();
    });

   
    loadSession();
    renderCategoryList();
    renderProducts();