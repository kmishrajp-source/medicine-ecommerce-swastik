const app = {
    state: {
        currentView: 'home',
        cart: [],
        products: MEDICINES
    },

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.renderCart();
        console.log("MediCare App Initialized");
    },

    cacheDOM() {
        this.dom = {
            app: document.getElementById('app'),
            cartBtn: document.querySelector('.cart-btn'),
            cartSidebar: document.getElementById('cart-sidebar'),
            cartBackdrop: document.getElementById('cart-backdrop'),
            closeCart: document.querySelector('.close-cart'),
            cartItems: document.getElementById('cart-items'),
            cartCount: document.getElementById('cart-count'),
            cartTotal: document.getElementById('cart-total')
        };
    },

    bindEvents() {
        // Navigation (Mock)
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = e.target.getAttribute('href');
                // Only intercept internal links
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const view = href.replace('#', '');
                    this.navigateTo(view);

                    // Update active state
                    document.querySelectorAll('nav a').forEach(l => l.classList.remove('active'));
                    e.target.classList.add('active');
                }
            });
        });

        // Search Input
        const searchInput = document.querySelector('.search-bar input');
        searchInput.addEventListener('input', (e) => {
            if (this.state.currentView !== 'shop') this.navigateTo('shop');
            this.filterProducts(e.target.value, this.state.activeCategory);
        });

        // Cart Toggling
        this.dom.cartBtn.addEventListener('click', () => this.toggleCart(true));
        this.dom.closeCart.addEventListener('click', () => this.toggleCart(false));
        this.dom.cartBackdrop.addEventListener('click', () => this.toggleCart(false));

        // Checkout Button
        document.querySelector('.cart-footer .btn-primary').addEventListener('click', () => {
            this.toggleCart(false);
            this.navigateTo('checkout');
        });
    },

    navigateTo(view) {
        this.state.currentView = view;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        console.log(`Navigating to ${view}`);

        const views = {
            'home': () => this.renderHome(),
            'shop': () => this.renderShop(),
            'checkout': () => this.renderCheckout(),
            'admin-login': () => this.renderAdminLogin(),
            'admin-dashboard': () => this.renderAdminDashboard()
        };

        if (views[view]) {
            views[view]();
        }
    },

    // --- Data Rendering ---

    renderHome() {
        // Setup via static HTML usually, but we ensure it's visible
        this.dom.app.innerHTML = `
            <section id="home-view">
                <div class="hero-section">
                    <div class="hero-content">
                        <h1>Your Health, <br> Delivered.</h1>
                        <p>Order medicines, upload prescriptions, and get fast home delivery.</p>
                        <button class="btn btn-primary" onclick="app.navigateTo('shop')">Shop Now</button>
                    </div>
                    <div class="hero-image">
                        <div class="floating-card">
                            <i class="fa-solid fa-truck-fast"></i>
                            <span>Fast Delivery</span>
                        </div>
                        <div class="floating-card delay-1">
                            <i class="fa-solid fa-shield-halved"></i>
                            <span>Secure</span>
                        </div>
                    </div>
                </div>
            </section>
        `;
    },

    renderShop(products = this.state.products) {
        const productCards = products.map(p => this.createProductCard(p)).join('');

        // Render Categories if not already rendered or if re-rendering full shop
        let categoryBtns = CATEGORIES.map(cat =>
            `<button class="btn category-btn ${this.state.activeCategory === cat ? 'active' : ''}" 
                     onclick="app.selectCategory('${cat}')"
                     style="background:${this.state.activeCategory === cat || (cat === 'All' && !this.state.activeCategory) ? 'var(--primary)' : 'white'}; 
                            color:${this.state.activeCategory === cat || (cat === 'All' && !this.state.activeCategory) ? 'white' : 'var(--text-dark)'}; 
                            border:1px solid #eee; min-width: auto;">
                ${cat}
            </button>`
        ).join('');

        this.dom.app.innerHTML = `
            <section class="container" style="padding-top: 40px;">
                <h2 style="margin-bottom: 24px; font-size: 2rem;">Shop Medicines</h2>
                
                <div class="category-scroll" style="display: flex; gap: 10px; margin-bottom: 30px; overflow-x: auto; padding-bottom: 10px;">
                    ${categoryBtns}
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 30px;">
                    ${productCards.length ? productCards : '<p>No medicines found.</p>'}
                </div>
            </section>
        `;
    },

    selectCategory(cat) {
        this.state.activeCategory = cat;
        const searchInput = document.querySelector('.search-bar input');
        const searchVal = searchInput ? searchInput.value : '';
        this.filterProducts(searchVal, cat);
    },

    filterProducts(search, category) {
        let filtered = this.state.products;

        if (category && category !== 'All') {
            filtered = filtered.filter(p => p.category === category);
        }

        if (search) {
            const lower = search.toLowerCase();
            filtered = filtered.filter(p => p.name.toLowerCase().includes(lower) || p.category.toLowerCase().includes(lower));
        }

        this.renderShop(filtered);
    },

    createProductCard(product) {
        return `
            <div class="product-card" style="background: white; border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-sm); transition: transform 0.3s; display: flex; flex-direction: column;">
                <div style="height: 200px; background: url('${product.image}') center/cover; position: relative;">
                    ${product.requiresPrescription ? '<span style="position: absolute; top: 10px; left: 10px; background: #FF9F43; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600;">Rx Required</span>' : ''}
                </div>
                <div style="padding: 20px; flex:1; display: flex; flex-direction: column;">
                    <div style="color: var(--text-light); font-size: 0.9rem; margin-bottom: 4px;">${product.category}</div>
                    <h3 style="margin-bottom: 8px; font-size: 1.2rem; flex:1;">${product.name}</h3>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px;">
                        <span style="font-size: 1.3rem; font-weight: 700; color: var(--primary);">$${product.price.toFixed(2)}</span>
                        <button class="btn-icon-small" onclick="app.addToCart(${product.id})" style="width: 36px; height: 36px; border-radius: 50%; background: var(--secondary); color: var(--primary); display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // --- Checkout & Notifications ---

    renderCheckout() {
        if (this.state.cart.length === 0) {
            this.showToast('Your cart is empty!', 'error');
            this.navigateTo('shop');
            return;
        }

        const total = this.state.cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const hasRxItems = this.state.cart.some(item => item.requiresPrescription);

        this.dom.app.innerHTML = `
            <section class="container" style="padding-top: 40px; max-width: 800px;">
                <h2 style="margin-bottom: 24px;">Checkout</h2>
                
                <div style="background: white; padding: 30px; border-radius: 16px; box-shadow: var(--shadow-sm);">
                    <form onsubmit="app.handleOrderSubmit(event)">
                        <h3 style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Shipping Details</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <input type="text" placeholder="Full Name" required style="padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
                            <input type="tel" placeholder="Phone Number" required style="padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
                        </div>
                        <input type="text" placeholder="Address" required style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 20px;">
                        
                        ${hasRxItems ? `
                        <div style="background: #FFF3E0; padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #FFE0B2;">
                            <h4 style="color: #F57C00; margin-bottom: 10px;"><i class="fa-solid fa-file-medical"></i> Prescription Required</h4>
                            <p style="font-size: 0.9rem; margin-bottom: 10px;">Some items in your cart require a doctor's prescription.</p>
                            <input type="file" required style="background: white; padding: 10px; border-radius: 8px; width: 100%;">
                        </div>
                        ` : ''}

                        <h3 style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 30px;">Payment</h3>
                        <div style="margin-bottom: 20px;">
                            <label style="display: flex; align-items: center; gap: 10px; padding: 10px; border: 1px solid var(--primary); border-radius: 8px; background: var(--secondary);">
                                <input type="radio" checked> Credit/Debit Card
                            </label>
                        </div>
                        
                        <div class="order-summary" style="background: var(--bg-light); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                            <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 1.2rem;">
                                <span>Total to Pay</span>
                                <span>$${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button type="submit" class="btn btn-primary full-width">Place Order</button>
                    </form>
                </div>
            </section>
        `;
    },

    handleOrderSubmit(e) {
        e.preventDefault();
        // Simulate API call
        const btn = e.target.querySelector('button[type="submit"]');
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
        btn.disabled = true;

        setTimeout(() => {
            // Save Order logic here would go to localStorage
            const newOrder = {
                id: '#' + Math.floor(Math.random() * 10000),
                total: this.state.cart.reduce((acc, item) => acc + (item.price * item.quantity), 0),
                items: [...this.state.cart], // Clone
                status: 'Processing',
                date: new Date().toLocaleDateString()
            };

            // Persist order (Mock)
            const orders = JSON.parse(localStorage.getItem('orders') || '[]');
            orders.unshift(newOrder);
            localStorage.setItem('orders', JSON.stringify(orders));

            this.state.cart = [];
            this.renderCart();
            this.showToast('Order placed successfully!', 'success');
            this.navigateTo('home');
        }, 2000);
    },

    showToast(message, type = 'info') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
            // Add base styles for the container
            container.style.position = 'fixed';
            container.style.bottom = '20px';
            container.style.right = '20px';
            container.style.zIndex = '2000';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.alignItems = 'flex-end'; // Align toasts to the right
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            margin-top: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            animation: slideIn 0.3s ease-out;
            display: flex; align-items: center; gap: 10px;
            max-width: 300px;
            word-wrap: break-word;
        `;
        const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'info-circle';
        toast.innerHTML = `<i class="fa-solid fa-${icon}"></i> ${message}`;

        container.appendChild(toast);

        // Define keyframes for animations if not already defined
        if (!document.getElementById('toast-keyframes')) {
            const style = document.createElement('style');
            style.id = 'toast-keyframes';
            style.innerHTML = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // --- Admin Views ---

    renderAdminLogin() {
        this.dom.app.innerHTML = `
            <div style="max-width: 400px; margin: 80px auto; padding: 40px; background: white; border-radius: 16px; box-shadow: var(--shadow-md); text-align: center;">
                <h2 style="margin-bottom: 20px; color: var(--primary);">Admin Access</h2>
                <form onsubmit="app.handleAdminLogin(event)">
                    <input type="password" id="admin-pass" placeholder="Enter Password (admin)" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 20px;">
                    <button type="submit" class="btn btn-primary full-width">Login</button>
                </form>
            </div>
        `;
    },

    handleAdminLogin(e) {
        e.preventDefault();
        const pass = document.getElementById('admin-pass').value;
        if (pass === 'admin') {
            this.showToast('Login successful', 'success');
            this.navigateTo('admin-dashboard');
        } else {
            this.showToast('Invalid password', 'error');
        }
    },

    renderAdminDashboard() {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');

        const ordersHtml = orders.length ? orders.map(o => `
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 16px;">${o.id}</td>
                <td style="padding: 16px;">${o.date}</td>
                <td style="padding: 16px;">$${o.total.toFixed(2)}</td>
                <td style="padding: 16px;">
                    <span class="status-badge status-${o.status.toLowerCase()}" style="padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; 
                        background: ${o.status === 'Processing' ? '#FEF3C7' : o.status === 'Delivered' ? '#D1FAE5' : '#E0F2F1'}; 
                        color: ${o.status === 'Processing' ? '#D97706' : o.status === 'Delivered' ? '#059669' : '#0D8ABC'};">
                        ${o.status}
                    </span>
                </td>
                <td style="padding: 16px;">
                    ${o.status !== 'Delivered' ? `<button onclick="app.updateOrderStatus('${o.id}', 'Delivered')" style="color: var(--primary); font-size: 0.9rem;">Mark Delivered</button>` : '<i class="fa-solid fa-check" style="color: green;"></i>'}
                </td>
            </tr>
        `).join('') : '<tr><td colspan="5" style="padding: 20px; text-align: center;">No orders yet.</td></tr>';

        this.dom.app.innerHTML = `
            <section class="container" style="padding-top: 40px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                    <h2 style="font-size: 2rem;">Admin Dashboard</h2>
                    <button class="btn" onclick="app.navigateTo('home')" style="border: 1px solid #ddd;">Logout</button>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px;">
                    <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: var(--shadow-sm);">
                        <h4 style="color: var(--text-light); margin-bottom: 10px;">Total Orders</h4>
                        <div style="font-size: 2rem; font-weight: 700;">${orders.length}</div>
                    </div>
                    <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: var(--shadow-sm);">
                        <h4 style="color: var(--text-light); margin-bottom: 10px;">Pending Delivery</h4>
                        <div style="font-size: 2rem; font-weight: 700; color: #F59E0B;">${orders.filter(o => o.status !== 'Delivered').length}</div>
                    </div>
                    <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: var(--shadow-sm);">
                        <h4 style="color: var(--text-light); margin-bottom: 10px;">Low Stock Items</h4>
                        <div style="font-size: 2rem; font-weight: 700; color: #EF4444;">0</div>
                    </div>
                </div>

                <div style="background: white; border-radius: 16px; box-shadow: var(--shadow-sm); overflow: hidden;">
                    <div style="padding: 20px; border-bottom: 1px solid #eee; font-weight: 700;">Recent Orders</div>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="background: var(--bg-light); text-align: left;">
                            <tr>
                                <th style="padding: 16px;">Order ID</th>
                                <th style="padding: 16px;">Date</th>
                                <th style="padding: 16px;">Total</th>
                                <th style="padding: 16px;">Status</th>
                                <th style="padding: 16px;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${ordersHtml}
                        </tbody>
                    </table>
                </div>
            </section>
        `;
    },

    updateOrderStatus(orderId, status) {
        let orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const order = orders.find(o => o.id === orderId);
        if (order) {
            order.status = status;
            localStorage.setItem('orders', JSON.stringify(orders));
            this.showToast(`Order ${orderId} updated to ${status}`, 'success');
            this.renderAdminDashboard(); // Refresh
        }
    },

    addToCart(id) {
        const product = this.state.products.find(p => p.id === id);
        const existingItem = this.state.cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.state.cart.push({ ...product, quantity: 1 });
        }

        this.renderCart();
        this.toggleCart(true); // Open cart to show user
    },

    removeFromCart(id) {
        this.state.cart = this.state.cart.filter(item => item.id !== id);
        this.renderCart();
    },

    toggleCart(isOpen) {
        if (isOpen) {
            document.body.classList.add('cart-open');
        } else {
            document.body.classList.remove('cart-open');
        }
    },

    renderCart() {
        // Update Count
        const count = this.state.cart.reduce((acc, item) => acc + item.quantity, 0);
        this.dom.cartCount.textContent = count;

        // Update Total
        const total = this.state.cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        this.dom.cartTotal.textContent = `$${total.toFixed(2)}`;

        // Render Items
        if (this.state.cart.length === 0) {
            this.dom.cartItems.innerHTML = `<div style="text-align: center; color: var(--text-light); margin-top: 40px;">Your cart is empty.</div>`;
            return;
        }

        this.dom.cartItems.innerHTML = this.state.cart.map(item => `
            <div class="cart-item" style="display: flex; gap: 16px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px dashed #eee;">
                <img src="${item.image}" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover;">
                <div style="flex: 1;">
                    <h4 style="font-size: 1rem; margin-bottom: 4px;">${item.name}</h4>
                    <div style="color: var(--text-light); font-size: 0.9rem;">$${item.price.toFixed(2)} x ${item.quantity}</div>
                </div>
                <button onclick="app.removeFromCart(${item.id})" style="color: var(--accent); background: none;"><i class="fa-solid fa-trash"></i></button>
            </div>
        `).join('');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
