// ZAINE PARFUM - Main Site JavaScript with Firebase Realtime Database
import { database } from './firebase-config.js';
import { ref, push, set, onValue } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1585386959984-a4155223f3f8?auto=format&fit=crop&w=600&q=80';
const DEFAULT_PRODUCT_IMAGE_SMALL = 'https://images.unsplash.com/photo-1585386959984-a4155223f3f8?auto=format&fit=crop&w=300&q=80';

// Villes du Maroc
const MOROCCAN_CITIES = [
  'Casablanca', 'Rabat', 'Fès', 'Marrakech', 'Tanger', 'Agadir', 'Meknès', 'Oujda',
  'Kénitra', 'Tétouan', 'Safi', 'Temara', 'Mohammédia', 'El Jadida', 'Khouribga',
  'Béni Mellal', 'Nador', 'Taza', 'Settat', 'Berrechid', 'Khemisset', 'Inezgane',
  'Ksar El Kebir', 'Larache', 'Guelmim', 'Berkane', 'Taourirt', 'Bouskoura',
  'Fquih Ben Salah', 'Dcheira El Jihadia', 'Oued Zem', 'El Kelaa des Sraghna',
  'Sidi Slimane', 'Errachidia', 'Guercif', 'Oulad Teïma', 'Ben Guerir', 'Tifelt',
  'Lqliaa', 'Taroudant', 'Sefrou', 'Essaouira', 'Fnideq', 'Sidi Kacem', 'Tiznit'
].sort();

let products = {};
let cart = [];
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

// Set current year
const yearSpan = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

// Load products from Realtime Database with real-time listener
function loadProducts() {
  const productsRef = ref(database, 'products');

  onValue(productsRef, (snapshot) => {
    products = {};
    const data = snapshot.val();

    if (data) {
      products = data;
    }

    applyFilters();
  }, (error) => {
    console.error('Error loading products:', error);
    productsGrid.innerHTML = '<p class="col-span-full text-center text-sm text-red-400">Erreur de chargement des produits</p>';
  });
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

  list.forEach(([id, p], index) => {
    const card = document.createElement('article');
    card.className =
      'group rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 via-primary-900/40 to-primary-950/80 p-4 flex flex-col hover:-translate-y-1 hover:border-accent/60 transition shadow-[0_15px_40px_rgba(0,0,0,0.55)] stagger-item show';
    card.style.animationDelay = `${index * 0.05}s`;

    card.innerHTML = `
      <div class="relative mb-4">
        <div class="aspect-[3/4] rounded-2xl bg-primary-950 overflow-hidden">
          <img
            src="${p.image || DEFAULT_PRODUCT_IMAGE}"
            alt="Pack ${p.name}"
            class="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            onerror="this.src='${DEFAULT_PRODUCT_IMAGE}'"
          />
          <div class="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-primary-950/70"></div>
          <div class="absolute -bottom-6 right-4 w-16 h-16 bg-accent/40 blur-2xl"></div>
        </div>
        <span class="absolute left-3 top-3 inline-flex items-center rounded-full bg-gradient-to-r from-accent/80 to-gold/80 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-primary-950 font-semibold">
          PACK 249 DH
        </span>
      </div>
      <h4 class="text-sm font-semibold mb-1 line-clamp-2">${p.name}</h4>
      <p class="text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-3">${p.brand || 'Pack Premium'}</p>
      <div class="mt-auto flex items-center justify-between gap-3">
        <span class="text-sm font-semibold">${formatPrice(p.price)}</span>
        <button
          data-id="${id}"
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
      const id = btn.getAttribute('data-id');
      addToCart(id);
    });
  });
}

function applyFilters() {
  const term = (searchInput.value || '').toLowerCase().trim();
  const cat = categoryFilter.value;

  const filtered = Object.entries(products).filter(([id, p]) => {
    const matchesSearch = !term || p.name.toLowerCase().includes(term);
    const matchesCat = cat === 'all' || cat === 'pack';
    return matchesSearch && matchesCat;
  });

  renderProducts(filtered);
}

searchInput?.addEventListener('input', applyFilters);
categoryFilter?.addEventListener('change', applyFilters);

function addToCart(id) {
  const existing = cart.find((item) => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    const product = products[id];
    if (!product) return;
    cart.push({ ...product, id, qty: 1 });
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
          onerror="this.src='${DEFAULT_PRODUCT_IMAGE_SMALL}'"
        />
      </div>
      <div class="flex-1">
        <p class="text-xs font-medium mb-0.5">${item.name}</p>
        <p class="text-[11px] text-slate-400 mb-1">Pack Premium - 249 DH</p>
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
    const id = btn.getAttribute('data-id');
    btn.addEventListener('click', () => removeFromCart(id));
  });

  cartItems.querySelectorAll('button[data-delta]').forEach((btn) => {
    const id = btn.getAttribute('data-id');
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

cartButton?.addEventListener('click', openCart);
closeCart?.addEventListener('click', closeCartModal);

cartModal?.addEventListener('click', (e) => {
  if (e.target === cartModal) {
    closeCartModal();
  }
});

if (checkoutButton) {
  checkoutButton.addEventListener('click', () => {
    if (!cart.length) return;
    closeCartModal(); // Close cart before opening checkout
    openCheckoutModal();
  });
}

// Checkout Modal
function openCheckoutModal() {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const modal = document.createElement('div');
  modal.id = 'checkoutModal';
  modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[80] animate-fade-in';

  modal.innerHTML = `
    <div class="bg-primary-950 border border-white/10 w-full max-w-md max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-scale-in">
      <div class="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <h4 class="text-sm font-semibold tracking-wide">Confirmer votre commande</h4>
        <button id="closeCheckout" class="text-slate-400 hover:text-white text-lg">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      
      <form id="checkoutForm" class="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-sm">
        <div class="space-y-2">
          <label for="customerName" class="block text-xs text-slate-300">
            <i class="fa-solid fa-user text-xs text-slate-500 mr-2"></i>
            Nom complet *
          </label>
          <input
            type="text"
            id="customerName"
            required
            placeholder="Ahmed Salama"
            class="w-full rounded-xl bg-primary-900 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/70 transition"
          />
        </div>

        <div class="space-y-2">
          <label for="customerPhone" class="block text-xs text-slate-300">
            <i class="fa-solid fa-phone text-xs text-slate-500 mr-2"></i>
            Numéro de téléphone *
          </label>
          <input
            type="tel"
            id="customerPhone"
            required
            placeholder="+212 6 12 34 56 78"
            pattern="^(\\+212|0)[5-7][0-9]{8}$"
            class="w-full rounded-xl bg-primary-900 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/70 transition"
          />
          <p class="text-[10px] text-slate-500">Format: +212 6 12 34 56 78 ou 06 12 34 56 78</p>
        </div>

        <div class="space-y-2">
          <label for="customerCity" class="block text-xs text-slate-300">
            <i class="fa-solid fa-location-dot text-xs text-slate-500 mr-2"></i>
            Ville *
          </label>
          <select
            id="customerCity"
            required
            class="w-full rounded-xl bg-primary-900 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/70 transition"
          >
            <option value="">Sélectionnez votre ville</option>
            ${MOROCCAN_CITIES.map(city => `<option value="${city}">${city}</option>`).join('')}
          </select>
        </div>

        <div class="space-y-2">
          <label for="customerAddress" class="block text-xs text-slate-300">
            <i class="fa-solid fa-map-marker-alt text-xs text-slate-500 mr-2"></i>
            Adresse complète *
          </label>
          <textarea
            id="customerAddress"
            required
            rows="3"
            placeholder="123 Rue Mohammed V, Quartier Maarif"
            class="w full rounded-xl bg-primary-900 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/70 transition resize-none"
          ></textarea>
        </div>

        <div class="bg-primary-900/50 border border-white/10 rounded-xl p-4 space-y-2">
          <p class="text-xs text-slate-400 mb-2">Résumé de la commande</p>
          ${cart.map(item => `
            <div class="flex justify-between text-xs">
              <span class="text-slate-300">${item.name} x${item.qty}</span>
              <span class="font-medium">${formatPrice(item.price * item.qty)}</span>
            </div>
          `).join('')}
          <div class="border-t border-white/10 pt-2 mt-2 flex justify-between font-semibold">
            <span>Total</span>
            <span class="text-accent">${formatPrice(total)}</span>
          </div>
        </div>

        <div id="checkoutError" class="hidden rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-xs text-red-300">
          <i class="fa-solid fa-circle-exclamation mr-2"></i>
          <span id="checkoutErrorText">Erreur</span>
        </div>
      </form>

      <div class="border-t border-white/10 px-6 py-4">
        <button
          type="button"
          id="submitCheckout"
          class="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent text-primary-900 px-6 py-3 text-sm font-medium tracking-wide hover:bg-white transition disabled:opacity-50"
        >
          <span id="submitCheckoutText">Valider la commande</span>
          <i id="submitCheckoutIcon" class="fa-solid fa-check"></i>
          <div id="submitCheckoutSpinner" class="hidden spinner"></div>
        </button>
        <p class="text-[10px] text-slate-500 text-center mt-2">Paiement à la livraison</p>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeCheckoutBtn = document.getElementById('closeCheckout');
  const submitCheckoutBtn = document.getElementById('submitCheckout');

  closeCheckoutBtn.addEventListener('click', () => {
    modal.remove();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });

  submitCheckoutBtn.addEventListener('click', async () => {
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const city = document.getElementById('customerCity').value;
    const address = document.getElementById('customerAddress').value.trim();

    if (!name || !phone || !city || !address) {
      showCheckoutError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Validate phone
    const phoneRegex = /^(\+212|0)[5-7][0-9]{8}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      showCheckoutError('Numéro de téléphone invalide');
      return;
    }

    // Show loading
    submitCheckoutBtn.disabled = true;
    document.getElementById('submitCheckoutText').textContent = 'Enregistrement...';
    document.getElementById('submitCheckoutIcon').classList.add('hidden');
    document.getElementById('submitCheckoutSpinner').classList.remove('hidden');

    try {
      // Save order to Realtime Database
      const ordersRef = ref(database, 'orders');
      const newOrderRef = push(ordersRef);

      await set(newOrderRef, {
        customerName: name,
        phone: phone,
        city: city,
        address: address,
        items: cart.map(item => ({
          productId: item.id,
          name: item.name,
          qty: item.qty,
          price: item.price
        })),
        total: total,
        status: 'pending',
        createdAt: Date.now()
      });


      // Prepare WhatsApp message
      const whatsappMessage = [
        '🛍️ *NOUVELLE COMMANDE - ZAINE PARFUM*',
        '',
        '👤 *Client:* ' + name,
        '📱 *Téléphone:* ' + phone,
        '📍 *Ville:* ' + city,
        '🏠 *Adresse:* ' + address,
        '',
        '📦 *Articles commandés:*',
        ...cart.map(item => `• ${item.name} x${item.qty} - ${formatPrice(item.price * item.qty)}`),
        '',
        '💰 *Total:* ' + formatPrice(total),
        '',
        '⏰ ' + new Date().toLocaleString('fr-FR')
      ].join('\n');

      // Open WhatsApp with order details (format international: +212 pour le Maroc)
      const whatsappPhone = '212663486572';
      const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, '_blank');

      // Show success and close
      showSuccessAndRedirect();

    } catch (error) {
      console.error('Order error:', error);
      showCheckoutError('Erreur lors de l\'enregistrement. Réessayez.');

      submitCheckoutBtn.disabled = false;
      document.getElementById('submitCheckoutText').textContent = 'Valider la commande';
      document.getElementById('submitCheckoutIcon').classList.remove('hidden');
      document.getElementById('submitCheckoutSpinner').classList.add('hidden');
    }
  });
}

function showCheckoutError(message) {
  const errorDiv = document.getElementById('checkoutError');
  document.getElementById('checkoutErrorText').textContent = message;
  errorDiv.classList.remove('hidden');
  errorDiv.classList.add('animate-shake');
  setTimeout(() => errorDiv.classList.remove('animate-shake'), 400);
}

function showSuccessAndRedirect() {
  const modal = document.getElementById('checkoutModal');
  modal.innerHTML = `
    <div class="flex items-center justify-center h-full p-8 animate-scale-in">
      <div class="text-center">
        <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
          <i class="fa-solid fa-check text-3xl text-green-500"></i>
        </div>
        <h3 class="text-xl font-semibold mb-2">Commande confirmée !</h3>
        <p class="text-sm text-slate-300 mb-4">Votre commande a été enregistrée avec succès.</p>
        <p class="text-xs text-slate-400">Vous serez contacté sous peu pour la livraison.</p>
      </div>
    </div>
  `;

  setTimeout(() => {
    modal.remove();
    cart = [];
    renderCart();
    closeCartModal();
  }, 3000);
}

// Initialize
loadProducts();

// ========== SLIDER FUNCTIONALITY ==========
const sliderItems = document.querySelectorAll('.slider-item');
const sliderDots = document.querySelectorAll('.slider-dot');
const prevSlideBtn = document.getElementById('prevSlide');
const nextSlideBtn = document.getElementById('nextSlide');

let currentSlide = 0;
let sliderInterval;

function showSlide(index) {
  // Hide all slides
  sliderItems.forEach(item => {
    item.style.opacity = '0';
  });
  
  // Update dots
  sliderDots.forEach((dot, i) => {
    if (i === index) {
      dot.classList.remove('bg-white/30');
      dot.classList.add('bg-accent');
    } else {
      dot.classList.remove('bg-accent');
      dot.classList.add('bg-white/30');
    }
  });
  
  // Show current slide
  sliderItems[index].style.opacity = '100';
  currentSlide = index;
}

function nextSlide() {
  const next = (currentSlide + 1) % sliderItems.length;
  showSlide(next);
}

function prevSlide() {
  const prev = (currentSlide - 1 + sliderItems.length) % sliderItems.length;
  showSlide(prev);
}

function startSlider() {
  sliderInterval = setInterval(nextSlide, 5000); // Change every 5 seconds
}

function resetSlider() {
  clearInterval(sliderInterval);
  startSlider();
}

// Event listeners for navigation
if (nextSlideBtn) {
  nextSlideBtn.addEventListener('click', () => {
    nextSlide();
    resetSlider();
  });
}

if (prevSlideBtn) {
  prevSlideBtn.addEventListener('click', () => {
    prevSlide();
    resetSlider();
  });
}

// Event listeners for dots
sliderDots.forEach((dot, index) => {
  dot.addEventListener('click', () => {
    showSlide(index);
    resetSlider();
  });
});

// Start the slider
if (sliderItems.length > 0) {
  startSlider();
}
