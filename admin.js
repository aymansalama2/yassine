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
