// Admin Panel JavaScript avec Firebase Realtime Database
import { auth, database } from './firebase-config.js';
import { signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
    ref,
    push,
    set,
    update,
    remove,
    onValue,
    query,
    orderByChild
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Elements
const userEmail = document.getElementById('userEmail');
const logoutButton = document.getElementById('logoutButton');
const productsList = document.getElementById('productsList');
const loadingProducts = document.getElementById('loadingProducts');
const searchInput = document.getElementById('searchInput');
const productForm = document.getElementById('productForm');
const formTitle = document.getElementById('formTitle');
const productIdInput = document.getElementById('productId');
const productNameInput = document.getElementById('productName');
const productCategoryInput = document.getElementById('productCategory');
const productPriceInput = document.getElementById('productPrice');
const productImageInput = document.getElementById('productImage');
const submitBtn = document.getElementById('submitBtn');
const submitText = document.getElementById('submitText');
const submitIcon = document.getElementById('submitIcon');
const submitSpinner = document.getElementById('submitSpinner');
const resetFormBtn = document.getElementById('resetFormBtn');
const cancelBtn = document.getElementById('cancelBtn');

let products = {};
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1585386959984-a4155223f3f8?auto=format&fit=crop&w=600&q=80';

// Protection: vérifier l'authentification
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'login.html';
    } else {
        userEmail.textContent = user.email;
        loadProducts();
    }
});

// Logout
logoutButton.addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Erreur de déconnexion');
    }
});

// Load products with real-time listener
function loadProducts() {
    const productsRef = ref(database, 'products');

    // Real-time listener
    onValue(productsRef, (snapshot) => {
        products = {};
        const data = snapshot.val();

        if (data) {
            products = data;
        }

        renderProducts(Object.entries(products));
        loadingProducts.style.display = 'none';
    }, (error) => {
        console.error('Error loading products:', error);
        loadingProducts.innerHTML = '<p class="text-sm text-red-400">Erreur de chargement des produits</p>';
    });
}

// Format price
function formatPrice(value) {
    return value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' DH';
}

// Render products
function renderProducts(list) {
    productsList.innerHTML = '';

    if (!list.length) {
        productsList.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-sm text-slate-400">Aucun pack</td></tr>';
        return;
    }

    list.forEach(([id, product], index) => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-primary-900/50 stagger-item show';
        tr.style.animationDelay = `${index * 0.05}s`;

        tr.innerHTML = `
      <td class="px-3 py-2 align-middle">
        <div class="w-9 h-9 rounded-md bg-primary-900/80 border border-white/10 overflow-hidden">
          <img src="${product.image || DEFAULT_IMAGE}" alt="${product.name}" class="w-full h-full object-cover" onerror="this.src='${DEFAULT_IMAGE}'" />
        </div>
      </td>
      <td class="px-2 py-2 align-middle">${product.name}</td>
      <td class="px-2 py-2 align-middle text-slate-300 text-xs">${product.category}</td>
      <td class="px-3 py-2 align-middle text-right">${formatPrice(product.price)}</td>
      <td class="px-3 py-2 align-middle text-right space-x-2">
        <button data-id="${id}" class="edit-btn text-xs text-accent hover:text-white transition">Éditer</button>
        <button data-id="${id}" class="delete-btn text-xs text-red-400 hover:text-red-300 transition">Supprimer</button>
      </td>
    `;

        productsList.appendChild(tr);
    });

    // Add event listeners
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editProduct(btn.dataset.id));
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
    });
}

// Search
searchInput.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase().trim();
    const filtered = term
        ? Object.entries(products).filter(([id, p]) => p.name.toLowerCase().includes(term))
        : Object.entries(products);
    renderProducts(filtered);
});

// Edit product
function editProduct(id) {
    const product = products[id];
    if (!product) return;

    productIdInput.value = id;
    productNameInput.value = product.name;
    productCategoryInput.value = product.category;
    productPriceInput.value = product.price;
    formTitle.textContent = 'Modifier un pack';

    document.querySelector('.lg\\:grid-cols-\\[1\\.2fr\\,0\\.8fr\\]').scrollIntoView({ behavior: 'smooth' });
}

// Delete product
async function deleteProduct(id) {
    const product = products[id];
    if (!product) return;

    if (!confirm(`Supprimer "${product.name}" ?`)) return;

    try {
        const productRef = ref(database, `products/${id}`);
        await remove(productRef);
    } catch (error) {
        console.error('Delete error:', error);
        alert('Erreur lors de la suppression');
    }
}

// Reset form
function resetForm() {
    productForm.reset();
    productIdInput.value = '';
    formTitle.textContent = 'Ajouter un pack';
}

resetFormBtn.addEventListener('click', resetForm);
cancelBtn.addEventListener('click', resetForm);

// Submit form
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = productIdInput.value;
    const name = productNameInput.value.trim();
    const category = productCategoryInput.value;
    const price = parseFloat(productPriceInput.value);
    const imageFile = productImageInput.files[0];

    if (!name || !category || isNaN(price)) {
        alert('Veuillez remplir tous les champs');
        return;
    }

    // Show loading
    submitBtn.disabled = true;
    submitText.textContent = 'Enregistrement...';
    submitIcon.classList.add('hidden');
    submitSpinner.classList.remove('hidden');

    try {
        let imageUrl = DEFAULT_IMAGE;

        // If editing and no new image, keep existing image
        if (id && !imageFile) {
            const existingProduct = products[id];
            if (existingProduct) imageUrl = existingProduct.image;
        }

        // If new image, convert to base64
        if (imageFile) {
            imageUrl = await fileToBase64(imageFile);
        }

        const productData = {
            name,
            brand: 'Inspiration',
            category,
            price,
            image: imageUrl,
            updatedAt: Date.now()
        };

        if (id) {
            // Update existing product
            const productRef = ref(database, `products/${id}`);
            await update(productRef, productData);
        } else {
            // Add new product
            const productsRef = ref(database, 'products');
            const newProductRef = push(productsRef);
            await set(newProductRef, {
                ...productData,
                createdAt: Date.now()
            });
        }

        // Reset form
        resetForm();

        // Show success message
        showToast('Pack enregistré avec succès', 'success');

    } catch (error) {
        console.error('Save error:', error);
        alert('Erreur lors de l\'enregistrement');
    } finally {
        // Reset button
        submitBtn.disabled = false;
        submitText.textContent = 'Enregistrer';
        submitIcon.classList.remove('hidden');
        submitSpinner.classList.add('hidden');
    }
});

// Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-6 right-6 px-6 py-3 rounded-xl text-sm text-white shadow-2xl z-50 animate-slide-up ${type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==================== ORDERS MANAGEMENT ====================

const ordersList = document.getElementById('ordersList');
const loadingOrders = document.getElementById('loadingOrders');
const noOrders = document.getElementById('noOrders');
const orderStatusFilter = document.getElementById('orderStatusFilter');

let orders = {};

// Load orders with real-time listener
function loadOrders() {
    const ordersRef = ref(database, 'orders');

    onValue(ordersRef, (snapshot) => {
        orders = {};
        const data = snapshot.val();

        if (data) {
            orders = data;
        }

        renderOrders(Object.entries(orders));
        loadingOrders.style.display = 'none';
    }, (error) => {
        console.error('Error loading orders:', error);
        loadingOrders.innerHTML = '<p class="text-sm text-red-400">Erreur de chargement des commandes</p>';
    });
}

// Render orders
function renderOrders(list) {
    ordersList.innerHTML = '';

    // Apply status filter
    const statusFilter = orderStatusFilter.value;
    if (statusFilter !== 'all') {
        list = list.filter(([id, order]) => order.status === statusFilter);
    }

    // Sort by date (newest first)
    list.sort(([idA, orderA], [idB, orderB]) => (orderB.createdAt || 0) - (orderA.createdAt || 0));

    if (!list.length) {
        ordersList.innerHTML = '<tr><td colspan="8" class="text-center py-8 text-sm text-slate-400">Aucune commande</td></tr>';
        noOrders.classList.remove('hidden');
        return;
    }

    noOrders.classList.add('hidden');

    list.forEach(([id, order], index) => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-primary-900/50 stagger-item show';
        tr.style.animationDelay = `${index * 0.03}s`;

        const date = order.createdAt ? new Date(order.createdAt).toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : 'N/A';

        const items = order.items || [];
        const itemsSummary = items.length > 0
            ? items.map(item => `${item.name} (x${item.qty})`).join(', ')
            : 'N/A';

        const statusColors = {
            pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
            completed: 'bg-green-500/20 text-green-300 border-green-500/30',
            cancelled: 'bg-red-500/20 text-red-300 border-red-500/30'
        };

        const statusLabels = {
            pending: 'En attente',
            completed: 'Complétée',
            cancelled: 'Annulée'
        };

        const statusClass = statusColors[order.status] || statusColors.pending;
        const statusLabel = statusLabels[order.status] || 'En attente';

        tr.innerHTML = `
            <td class="px-3 py-2 align-middle text-xs text-slate-300">${date}</td>
            <td class="px-3 py-2 align-middle font-medium">${order.customerName || 'N/A'}</td>
            <td class="px-3 py-2 align-middle text-xs text-slate-300">${order.phone || 'N/A'}</td>
            <td class="px-3 py-2 align-middle text-xs text-slate-300">${order.city || 'N/A'}</td>
            <td class="px-3 py-2 align-middle text-xs text-slate-400 max-w-xs truncate" title="${itemsSummary}">${itemsSummary}</td>
            <td class="px-3 py-2 align-middle text-right font-semibold">${formatPrice(order.total || 0)}</td>
            <td class="px-3 py-2 align-middle text-center">
                <span class="inline-flex px-2 py-1 rounded-full text-xs border ${statusClass}">
                    ${statusLabel}
                </span>
            </td>
            <td class="px-3 py-2 align-middle text-right space-x-2">
                <button data-id="${id}" class="view-order-btn text-xs text-accent hover:text-white transition" title="Voir détails">
                    <i class="fa-solid fa-eye"></i>
                </button>
                <select data-id="${id}" class="status-select-btn text-xs bg-primary-900 border border-white/10 rounded px-2 py-1 text-blue-300 hover:border-blue-400 transition" title="Changer statut">
                    <option value="">Statut...</option>
                    <option value="pending">En attente</option>
                    <option value="completed">Complétée</option>
                    <option value="cancelled">Annulée</option>
                </select>
                <button data-id="${id}" class="delete-order-btn text-xs text-red-400 hover:text-red-300 transition" title="Supprimer">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;

        ordersList.appendChild(tr);
    });

    // Add event listeners
    document.querySelectorAll('.view-order-btn').forEach(btn => {
        btn.addEventListener('click', () => viewOrderDetails(btn.dataset.id));
    });

    document.querySelectorAll('.status-select-btn').forEach(select => {
        select.addEventListener('change', (e) => {
            const newStatus = e.target.value;
            if (newStatus) {
                updateOrderStatus(select.dataset.id, newStatus);
                e.target.value = ''; // Reset select
            }
        });
    });

    document.querySelectorAll('.delete-order-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteOrder(btn.dataset.id));
    });
}

// View order details
function viewOrderDetails(id) {
    const order = orders[id];
    if (!order) return;

    const items = order.items || [];
    const itemsHtml = items.map(item =>
        `<div class="flex justify-between py-1">
            <span>${item.name} x${item.qty}</span>
            <span>${formatPrice((item.price || 0) * item.qty)}</span>
        </div>`
    ).join('');

    const modalHtml = `
        <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" id="orderModal">
            <div class="bg-primary-950 border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-auto p-6">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-xl font-semibold">Détails de la commande</h3>
                    <button class="text-slate-400 hover:text-white text-2xl" onclick="document.getElementById('orderModal').remove()">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div class="space-y-4 text-sm">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-xs text-slate-400 mb-1">Client</p>
                            <p class="font-medium">${order.customerName || 'N/A'}</p>
                        </div>
                        <div>
                            <p class="text-xs text-slate-400 mb-1">Téléphone</p>
                            <p class="font-medium">${order.phone || 'N/A'}</p>
                        </div>
                        <div>
                            <p class="text-xs text-slate-400 mb-1">Ville</p>
                            <p class="font-medium">${order.city || 'N/A'}</p>
                        </div>
                        <div>
                            <p class="text-xs text-slate-400 mb-1">Date</p>
                            <p class="font-medium">${order.createdAt ? new Date(order.createdAt).toLocaleString('fr-FR') : 'N/A'}</p>
                        </div>
                    </div>

                    <div>
                        <p class="text-xs text-slate-400 mb-1">Adresse complète</p>
                        <p class="font-medium">${order.address || 'N/A'}</p>
                    </div>

                    <div class="border-t border-white/10 pt-4">
                        <p class="text-xs text-slate-400 mb-3">Articles commandés</p>
                        <div class="bg-primary-900/50 rounded-xl p-4 space-y-2">
                            ${itemsHtml}
                        </div>
                    </div>

                    <div class="border-t border-white/10 pt-4 flex justify-between items-center text-lg font-semibold">
                        <span>Total</span>
                        <span class="text-accent">${formatPrice(order.total || 0)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Update order status
function updateOrderStatus(id, newStatus) {
    const order = orders[id];
    if (!order) return;

    if (!confirm(`Changer le statut de la commande de "${order.customerName}" à "${newStatus}" ?`)) {
        return;
    }

    const orderRef = ref(database, `orders/${id}`);
    update(orderRef, { status: newStatus })
        .then(() => {
            showToast('Statut mis à jour avec succès', 'success');
        })
        .catch((error) => {
            console.error('Error updating status:', error);
            showToast('Erreur lors de la mise à jour', 'error');
        });
}

// Delete order
function deleteOrder(id) {
    const order = orders[id];
    if (!order) return;

    const confirmMsg = `⚠️ Supprimer définitivement la commande de "${order.customerName}" ?\n\nCette action est irréversible et supprimera toutes les données de la commande.`;

    if (!confirm(confirmMsg)) {
        return;
    }

    const orderRef = ref(database, `orders/${id}`);
    remove(orderRef)
        .then(() => {
            showToast('Commande supprimée', 'success');
        })
        .catch((error) => {
            console.error('Error deleting order:', error);
            showToast('Erreur lors de la suppression', 'error');
        });
}

// Filter orders by status
orderStatusFilter.addEventListener('change', () => {
    renderOrders(Object.entries(orders));
});

// Load orders when authenticated
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadOrders();
    }
});

