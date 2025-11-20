const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1585386959984-a4155223f3f8?auto=format&fit=crop&w=600&q=80';
const DEFAULT_PRODUCT_IMAGE_SMALL = 'https://images.unsplash.com/photo-1585386959984-a4155223f3f8?auto=format&fit=crop&w=300&q=80';

let products = [
  { id: 1, name: 'Coco Mademoiselle', brand: 'Inspiration', category: 'femme', price: 89.9, image: DEFAULT_PRODUCT_IMAGE },
  { id: 2, name: 'La Vie est Belle', brand: 'Inspiration', category: 'femme', price: 84.5, image: DEFAULT_PRODUCT_IMAGE },
  { id: 3, name: 'Evidence', brand: 'Inspiration', category: 'femme', price: 59.9, image: DEFAULT_PRODUCT_IMAGE },
  { id: 4, name: 'Good Girl', brand: 'Inspiration', category: 'femme', price: 82.0, image: DEFAULT_PRODUCT_IMAGE },
  { id: 5, name: 'Hypnotique Poison', brand: 'Inspiration', category: 'femme', price: 79.0, image: DEFAULT_PRODUCT_IMAGE },
  { id: 6, name: 'Scandal', brand: 'Inspiration', category: 'femme', price: 78.0, image: DEFAULT_PRODUCT_IMAGE },
  { id: 7, name: 'Libre', brand: 'Inspiration', category: 'femme', price: 86.0, image: DEFAULT_PRODUCT_IMAGE },
  { id: 8, name: 'Burberry Her', brand: 'Inspiration', category: 'femme', price: 75.0, image: DEFAULT_PRODUCT_IMAGE },
  { id: 9, name: `L'Impératrice`, brand: 'Inspiration', category: 'femme', price: 69.0, image: DEFAULT_PRODUCT_IMAGE },
  { id: 10, name: 'Light Blue', brand: 'Inspiration', category: 'femme', price: 72.0, image: DEFAULT_PRODUCT_IMAGE },
  { id: 11, name: 'Escada Taj', brand: 'Inspiration', category: 'femme', price: 65.0, image: DEFAULT_PRODUCT_IMAGE },
  { id: 12, name: 'Kayali Coco Vanilla 28', brand: 'Inspiration', category: 'femme', price: 88.0, image: DEFAULT_PRODUCT_IMAGE },
  { id: 13, name: 'Sauvage', brand: 'Inspiration', category: 'homme', price: 92.0, image: DEFAULT_PRODUCT_IMAGE },
  { id: 14, name: 'Bleu de Chanel', brand: 'Inspiration', category: 'homme', price: 95.0, image: DEFAULT_PRODUCT_IMAGE },
  { id: 15, name: 'Aventus Creed', brand: 'Inspiration', category: 'homme', price: 120.0, image: DEFAULT_PRODUCT_IMAGE },
  { id: 16, name: 'Invictus', brand: 'Inspiration', category: 'homme', price: 79.0, image: DEFAULT_PRODUCT_IMAGE },
  { id: 17, name: `Acqua di Giò`, brand: 'Inspiration', category: 'homme', price: 80.0, image: DEFAULT_PRODUCT_IMAGE },
  { id: 18, name: 'Eros Versace', brand: 'Inspiration', category: 'homme', price: 85.0, image: DEFAULT_PRODUCT_IMAGE },
  { id: 19, name: 'Stronger With You', brand: 'Inspiration', category: 'homme', price: 83.0, image: DEFAULT_PRODUCT_IMAGE },
  { id: 20, name: 'Ultra Male', brand: 'Inspiration', category: 'homme', price: 82.0, image: DEFAULT_PRODUCT_IMAGE },
  { id: 21, name: 'Lacoste Noir', brand: 'Inspiration', category: 'homme', price: 70.0, image: DEFAULT_PRODUCT_IMAGE },
  { id: 22, name: 'Imagination', brand: 'Inspiration', category: 'homme', price: 115.0, image: DEFAULT_PRODUCT_IMAGE },
  { id: 23, name: `Black XS L'Excès`, brand: 'Inspiration', category: 'homme', price: 76.0, image: DEFAULT_PRODUCT_IMAGE },
  { id: 24, name: 'Azzaro Wanted', brand: 'Inspiration', category: 'homme', price: 78.0, image: DEFAULT_PRODUCT_IMAGE },
];

const productsGrid = document.getElementById('productsGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const noResults = document.getElementById('noResults');

const cartButton = document.getElementById('cartButton');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');
const checkoutButton = document.getElementById('checkoutButton');

const adminPanel = document.getElementById('adminPanel');
const adminClose = document.getElementById('adminClose');
const adminList = document.getElementById('adminList');
const adminForm = document.getElementById('adminForm');
const adminFormTitle = document.getElementById('adminFormTitle');
const adminIdInput = document.getElementById('adminId');
const adminNameInput = document.getElementById('adminName');
const adminCategoryInput = document.getElementById('adminCategory');
const adminPriceInput = document.getElementById('adminPrice');
const adminResetBtn = document.getElementById('adminReset');
const adminImageInput = document.getElementById('adminImage');

const yearSpan = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

let cart = [];

function loadProductsFromStorage() {
  try {
    const raw = window.localStorage.getItem('zaine_products');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) {
      products = parsed;
    }
  } catch (e) {
    console.warn('Impossible de charger les produits depuis le stockage local', e);
  }
}

function saveProductsToStorage() {
  try {
    window.localStorage.setItem('zaine_products', JSON.stringify(products));
  } catch (e) {
    console.warn('Impossible de sauvegarder les produits dans le stockage local', e);
  }
}

function formatPrice(value) {
  return value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' DH';
}

function renderProducts(list) {
  productsGrid.innerHTML = '';

  if (!list.length) {
    noResults.classList.remove('hidden');
    return;
  }

  noResults.classList.add('hidden');

  list.forEach((p) => {
    const card = document.createElement('article');
    card.className =
      'group rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 via-primary-900/40 to-primary-950/80 p-4 flex flex-col hover:-translate-y-1 hover:border-accent/60 transition shadow-[0_15px_40px_rgba(0,0,0,0.55)]';

    card.innerHTML = `
      <div class="relative mb-4">
        <div class="aspect-[3/4] rounded-2xl bg-primary-950 overflow-hidden">
          <img
            src="${p.image || DEFAULT_PRODUCT_IMAGE}"
            alt="Parfum ${p.name}"
            class="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          <div class="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-primary-950/70"></div>
          <div class="absolute -bottom-6 right-4 w-16 h-16 bg-accent/40 blur-2xl"></div>
        </div>
        <span class="absolute left-3 top-3 inline-flex items-center rounded-full bg-black/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-100">
          ${p.category === 'femme' ? 'Femme' : p.category === 'homme' ? 'Homme' : 'Mixte'}
        </span>
      </div>
      <h4 class="text-sm font-semibold mb-1 line-clamp-2">${p.name}</h4>
      <p class="text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-3">${p.brand}</p>
      <div class="mt-auto flex items-center justify-between gap-3">
        <span class="text-sm font-semibold">${formatPrice(p.price)}</span>
        <button
          data-id="${p.id}"
          class="add-to-cart inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-slate-100 hover:bg-accent hover:text-primary-900 hover:border-accent transition"
        >
          <i class="fa-solid fa-plus text-[10px]"></i>
          Ajouter
        </button>
      </div>
    `;

    productsGrid.appendChild(card);
  });

  document.querySelectorAll('.add-to-cart').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.getAttribute('data-id'));
      addToCart(id);
    });
  });
}

function applyFilters() {
  const term = (searchInput.value || '').toLowerCase().trim();
  const cat = categoryFilter.value;

  const filtered = products.filter((p) => {
    const matchesSearch = !term || p.name.toLowerCase().includes(term);
    const matchesCat = cat === 'all' || p.category === cat;
    return matchesSearch && matchesCat;
  });

  renderProducts(filtered);
}

searchInput.addEventListener('input', applyFilters);
categoryFilter.addEventListener('change', applyFilters);

function addToCart(id) {
  const existing = cart.find((item) => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    cart.push({ ...product, qty: 1 });
  }
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  renderCart();
}

function updateQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
  } else {
    renderCart();
  }
}

function renderCart() {
  cartItems.innerHTML = '';

  if (!cart.length) {
    cartItems.innerHTML = '<p class="text-sm text-slate-400">Votre panier est vide.</p>';
    cartTotal.textContent = formatPrice(0);
    cartCount.textContent = '0';
    return;
  }

  let total = 0;

  cart.forEach((item) => {
    total += item.price * item.qty;

    const row = document.createElement('div');
    row.className = 'flex items-center gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0';

    row.innerHTML = `
      <div class="w-10 h-14 rounded-xl bg-primary-900/80 border border-white/10 overflow-hidden">
        <img
          src="${item.image || DEFAULT_PRODUCT_IMAGE_SMALL}"
          alt="Parfum ${item.name}"
          class="h-full w-full object-cover object-center"
        />
      </div>
      <div class="flex-1">
        <p class="text-xs font-medium mb-0.5">${item.name}</p>
        <p class="text-[11px] text-slate-400 mb-1">${item.category === 'femme' ? 'Féminin' : item.category === 'homme' ? 'Masculin' : 'Mixte'}</p>
        <div class="flex items-center gap-3">
          <span class="text-xs font-semibold">${formatPrice(item.price)}</span>
          <div class="inline-flex items-center rounded-full bg-primary-900 border border-white/10 text-[11px]">
            <button data-id="${item.id}" data-delta="-1" class="px-2 py-1 text-slate-300 hover:text-white">-</button>
            <span class="px-2">${item.qty}</span>
            <button data-id="${item.id}" data-delta="1" class="px-2 py-1 text-slate-300 hover:text-white">+</button>
          </div>
        </div>
      </div>
      <button data-id="${item.id}" class="remove-item text-slate-400 hover:text-red-400 text-sm">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;

    cartItems.appendChild(row);
  });

  cartTotal.textContent = formatPrice(total);
  cartCount.textContent = String(cart.reduce((acc, i) => acc + i.qty, 0));

  cartItems.querySelectorAll('.remove-item').forEach((btn) => {
    const id = Number(btn.getAttribute('data-id'));
    btn.addEventListener('click', () => removeFromCart(id));
  });

  cartItems.querySelectorAll('button[data-delta]').forEach((btn) => {
    const id = Number(btn.getAttribute('data-id'));
    const delta = Number(btn.getAttribute('data-delta'));
    btn.addEventListener('click', () => updateQty(id, delta));
  });
}

function openCart() {
  cartModal.classList.remove('pointer-events-none');
  cartModal.classList.remove('opacity-0');
}

function closeCartModal() {
  cartModal.classList.add('opacity-0');
  cartModal.classList.add('pointer-events-none');
}

cartButton.addEventListener('click', () => {
  openCart();
});

closeCart.addEventListener('click', () => {
  closeCartModal();
});

cartModal.addEventListener('click', (e) => {
  if (e.target === cartModal) {
    closeCartModal();
  }
});

if (checkoutButton) {
  checkoutButton.addEventListener('click', () => {
    if (!cart.length) {
      return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    const lines = [];
    lines.push('Nouvelle commande ZAINE PARFUM');
    lines.push('');
    lines.push('Articles :');
    cart.forEach((item) => {
      lines.push(`- ${item.name} x${item.qty} (${formatPrice(item.price)} /u)`);
    });
    lines.push('');
    lines.push(`Total : ${formatPrice(total)}`);
    lines.push('');
    lines.push("Merci de confirmer ma commande.");

    const message = lines.join('\n');
    const phone = '212684892211';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  });
}

let keyBuffer = '';
const secretCode = '123456';

function openAdmin() {
  if (!adminPanel) return;
  adminPanel.classList.remove('pointer-events-none');
  adminPanel.classList.remove('opacity-0');
  renderAdminList();
}

function closeAdmin() {
  if (!adminPanel) return;
  adminPanel.classList.add('opacity-0');
  adminPanel.classList.add('pointer-events-none');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeAdmin();
    return;
  }

  if (!/^[0-9]$/.test(e.key)) {
    return;
  }

  keyBuffer += e.key;
  if (keyBuffer.length > secretCode.length) {
    keyBuffer = keyBuffer.slice(-secretCode.length);
  }

  if (keyBuffer === secretCode) {
    openAdmin();
    keyBuffer = '';
  }
});

if (adminClose) {
  adminClose.addEventListener('click', () => {
    closeAdmin();
  });
}

if (adminPanel) {
  adminPanel.addEventListener('click', (e) => {
    if (e.target === adminPanel) {
      closeAdmin();
    }
  });
}

function resetAdminForm() {
  if (!adminFormTitle) return;
  adminIdInput.value = '';
  adminNameInput.value = '';
  adminCategoryInput.value = 'femme';
  adminPriceInput.value = '';
  if (adminImageInput) {
    adminImageInput.value = '';
  }
  adminFormTitle.textContent = 'Ajouter un parfum';
}

if (adminResetBtn) {
  adminResetBtn.addEventListener('click', () => {
    resetAdminForm();
  });
}

function renderAdminList() {
  if (!adminList) return;
  adminList.innerHTML = '';

  products.forEach((p) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-primary-900/50';
    tr.innerHTML = `
      <td class="px-4 py-2 align-middle text-slate-400">${p.id}</td>
      <td class="px-2 py-2 align-middle">${p.name}</td>
      <td class="px-2 py-2 align-middle text-slate-300 text-[11px]">${p.category}</td>
      <td class="px-4 py-2 align-middle text-right">${formatPrice(p.price)}</td>
      <td class="px-4 py-2 align-middle text-right space-x-2">
        <button data-id="${p.id}" class="admin-edit text-[11px] text-accent hover:text-white">Éditer</button>
        <button data-id="${p.id}" class="admin-delete text-[11px] text-red-400 hover:text-red-300">Supprimer</button>
      </td>
    `;
    adminList.appendChild(tr);
  });

  adminList.querySelectorAll('.admin-edit').forEach((btn) => {
    const id = Number(btn.getAttribute('data-id'));
    btn.addEventListener('click', () => {
      const p = products.find((x) => x.id === id);
      if (!p) return;
      adminIdInput.value = String(p.id);
      adminNameInput.value = p.name;
      adminCategoryInput.value = p.category;
      adminPriceInput.value = String(p.price);
      if (adminFormTitle) {
        adminFormTitle.textContent = 'Modifier un parfum';
      }
    });
  });

  adminList.querySelectorAll('.admin-delete').forEach((btn) => {
    const id = Number(btn.getAttribute('data-id'));
    btn.addEventListener('click', () => {
      const index = products.findIndex((x) => x.id === id);
      if (index !== -1) {
        products.splice(index, 1);
        renderAdminList();
        applyFilters();
      }
    });
  });
}

function saveProduct({ id, name, category, price, image }) {
  const existingId = id || null;
  if (existingId) {
    const existing = products.find((p) => p.id === existingId);
    if (existing) {
      existing.name = name;
      existing.category = category;
      existing.price = price;
      existing.image = image;
    }
  } else {
    const nextId = products.length ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    products.push({ id: nextId, name, brand: 'Inspiration', category, price, image });
  }

  saveProductsToStorage();
  resetAdminForm();
  renderAdminList();
  applyFilters();
}

if (adminForm) {
  adminForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = adminNameInput.value.trim();
    const category = adminCategoryInput.value;
    const price = parseFloat(adminPriceInput.value);
    if (!name || !category || Number.isNaN(price)) {
      return;
    }

    const existingId = adminIdInput.value ? Number(adminIdInput.value) : null;
    const existing = existingId ? products.find((p) => p.id === existingId) : null;
    const file = adminImageInput && adminImageInput.files && adminImageInput.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageData = reader.result || DEFAULT_PRODUCT_IMAGE;
        saveProduct({
          id: existingId,
          name,
          category,
          price,
          image: imageData,
        });
      };
      reader.readAsDataURL(file);
    } else {
      const image = existing && existing.image ? existing.image : DEFAULT_PRODUCT_IMAGE;
      saveProduct({
        id: existingId,
        name,
        category,
        price,
        image,
      });
    }
  });
}

renderProducts(products);
