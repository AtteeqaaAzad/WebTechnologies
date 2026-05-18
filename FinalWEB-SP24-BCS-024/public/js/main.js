/* ============================================
   VANILLA JS — Navigation & Menu
   ============================================ */
document.addEventListener('DOMContentLoaded', function () {

    const menuBtn = document.getElementById('menuBtn');
    const navMenu = document.getElementById('navMenu');
    const searchIcon = document.getElementById('searchIcon');
    const searchBar = document.getElementById('searchBar');
    const closeSearch = document.getElementById('closeSearch');
    const dropdowns = document.querySelectorAll('.dropdown');
    const navLinks = document.querySelectorAll('.nav-menu a');
    const tabs = document.querySelectorAll('.tab');

    if (menuBtn) {
        menuBtn.addEventListener('click', function () {
            navMenu.classList.toggle('active');
            menuBtn.innerHTML = navMenu.classList.contains('active') ? '✕' : '☰';
        });
    }

    if (searchIcon) {
        searchIcon.addEventListener('click', function () {
            searchBar.classList.add('active');
        });
    }
    if (closeSearch) {
        closeSearch.addEventListener('click', function () {
            searchBar.classList.remove('active');
        });
    }

    dropdowns.forEach(function (dropdown) {
        const dropdownLink = dropdown.querySelector('a');
        if (!dropdownLink) return;
        dropdownLink.addEventListener('click', function (e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                dropdown.classList.toggle('active');
            }
        });
    });

    navLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            const isDropdownToggle = link.parentElement.classList.contains('dropdown');
            if (window.innerWidth <= 768 && !isDropdownToggle) {
                navMenu.classList.remove('active');
                if (menuBtn) menuBtn.innerHTML = '☰';
            }
        });
    });

    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) {
            if (navMenu) navMenu.classList.remove('active');
            if (menuBtn) menuBtn.innerHTML = '☰';
            dropdowns.forEach(function (d) { d.classList.remove('active'); });
        }
    });

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    /* ── Initialize cart on every page ── */
    Cart.init();
});


/* ============================================
   CART SYSTEM — localStorage based
   Works across all pages without a backend
   ============================================ */
const Cart = {

    STORAGE_KEY: 'uniworth_cart',

    /* ─── Read cart from localStorage ─── */
    get() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
        } catch {
            return [];
        }
    },

    /* ─── Write cart to localStorage ─── */
    save(cart) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
        this.updateBadge();
    },

    /* ─── Add a product to cart ─── */
    add(id, name, price, image) {
        const cart = this.get();
        const existing = cart.find(item => item.id === id);

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ id, name, price, image, quantity: 1 });
        }

        this.save(cart);
        this.showToast(`✅ "${name}" added to cart!`);
    },

    /* ─── Remove one product from cart ─── */
    remove(id) {
        this.save(this.get().filter(item => item.id !== id));
        this.renderCartPage();
    },

    /* ─── Update quantity of a product ─── */
    updateQty(id, qty) {
        const cart = this.get();
        const item = cart.find(i => i.id === id);
        if (item) {
            item.quantity = Math.max(1, parseInt(qty) || 1);
            this.save(cart);
        }
        this.renderCartPage();
    },

    /* ─── Empty the entire cart ─── */
    clear() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.updateBadge();
        this.renderCartPage();
    },

    /* ─── Total number of items ─── */
    count() {
        return this.get().reduce((sum, item) => sum + item.quantity, 0);
    },

    /* ─── Total price (Rs.) ─── */
    total() {
        return this.get().reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },

    /* ─── Update cart badge number in navbar ─── */
    updateBadge() {
        const count = this.count();
        document.querySelectorAll('.cart-badge').forEach(badge => {
            badge.textContent = count;
        });
    },

    /* ─── Floating toast notification ─── */
    showToast(message) {
        const existing = document.getElementById('cart-toast');
        if (existing) existing.remove();

        // Inject keyframes once
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                @keyframes slideInUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to   { transform: translateY(0);    opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        const toast = document.createElement('div');
        toast.id = 'cart-toast';
        toast.textContent = message;
        Object.assign(toast.style, {
            position:   'fixed',
            bottom:     '30px',
            right:      '30px',
            background: '#1a1a1a',
            color:      'white',
            padding:    '14px 24px',
            borderRadius: '5px',
            fontSize:   '14px',
            fontFamily: 'Arial, sans-serif',
            zIndex:     '9999',
            boxShadow:  '0 5px 20px rgba(0,0,0,0.3)',
            animation:  'slideInUp 0.3s ease'
        });

        document.body.appendChild(toast);

        setTimeout(() => {
            Object.assign(toast.style, {
                transition: 'opacity 0.4s, transform 0.4s',
                opacity:    '0',
                transform:  'translateY(20px)'
            });
            setTimeout(() => toast.remove(), 400);
        }, 3000);
    },

    /* ─── Render full cart page (only runs on /cart) ─── */
    renderCartPage() {
        const itemsEl   = document.getElementById('cart-items-container');
        const summaryEl = document.getElementById('cart-summary-container');
        if (!itemsEl) return;

        const cart = this.get();

        /* Empty state */
        if (cart.length === 0) {
            itemsEl.innerHTML = `
                <div class="cart-empty">
                    <div class="cart-empty-icon">🛒</div>
                    <h2>Your cart is empty</h2>
                    <p>You haven't added anything yet.</p>
                    <a href="/products" class="btn-continue-shopping">Browse Products</a>
                </div>`;
            if (summaryEl) summaryEl.innerHTML = '';
            return;
        }

        /* Items list */
        itemsEl.innerHTML = `
            <div class="cart-items-list">
                <div class="cart-header-row">
                    <span>Product</span>
                    <span>Price</span>
                    <span>Quantity</span>
                    <span>Subtotal</span>
                    <span></span>
                </div>
                ${cart.map(item => `
                    <div class="cart-item-row" data-id="${item.id}">
                        <div class="cart-item-product">
                            <img src="${item.image}" alt="${item.name}">
                            <span>${item.name}</span>
                        </div>
                        <div class="cart-item-price">Rs. ${Number(item.price).toLocaleString()}</div>
                        <div class="cart-item-qty">
                            <button class="qty-btn" onclick="Cart.updateQty('${item.id}', ${item.quantity - 1})">−</button>
                            <input
                                type="number"
                                value="${item.quantity}"
                                min="1"
                                class="qty-input"
                                onchange="Cart.updateQty('${item.id}', this.value)"
                            >
                            <button class="qty-btn" onclick="Cart.updateQty('${item.id}', ${item.quantity + 1})">+</button>
                        </div>
                        <div class="cart-item-subtotal">
                            Rs. ${(Number(item.price) * item.quantity).toLocaleString()}
                        </div>
                        <button class="cart-item-remove" onclick="Cart.remove('${item.id}')" title="Remove">✕</button>
                    </div>
                `).join('')}
            </div>
            <div class="cart-actions-bar">
                <a href="/products" class="btn-continue-shopping">← Continue Shopping</a>
                <button class="btn-clear-cart" onclick="if(confirm('Clear entire cart?')) Cart.clear()">
                    🗑️ Clear Cart
                </button>
            </div>`;

        /* Order summary */
        if (summaryEl) {
            const subtotal   = this.total();
            const shipping   = subtotal >= 1500 ? 0 : 200;
            const grandTotal = subtotal + shipping;

            summaryEl.innerHTML = `
                <div class="cart-summary-card">
                    <h3>Order Summary</h3>
                    <div class="summary-row">
                        <span>Subtotal (${this.count()} items)</span>
                        <span>Rs. ${subtotal.toLocaleString()}</span>
                    </div>
                    <div class="summary-row">
                        <span>Shipping</span>
                        <span>${shipping === 0
                            ? '<span class="free-shipping">FREE</span>'
                            : 'Rs. ' + shipping}</span>
                    </div>
                    ${shipping > 0
                        ? `<p class="shipping-note">Add Rs. ${(1500 - subtotal).toLocaleString()} more for free shipping!</p>`
                        : `<p class="shipping-note free">🎉 You qualify for free shipping!</p>`}
                    <hr style="margin: 15px 0; border-color: #eee;">
                    <div class="summary-row total-row">
                        <span>Total</span>
                        <span>Rs. ${grandTotal.toLocaleString()}</span>
                    </div>
                    <a href="/checkout" class="btn-checkout">Proceed to Checkout →</a>
                </div>`;
        }
    },

    /* ─── Initialize on every page ─── */
    init() {
        this.updateBadge();

        /* Bind Add to Cart buttons */
        document.querySelectorAll('.add-cart-btn').forEach(btn => {
            if (btn.disabled) return;

            btn.addEventListener('click', function () {
                const card = btn.closest('.product-card-grid');
                if (!card) return;

                const name     = card.querySelector('.product-name')?.textContent?.trim() || 'Product';
                const priceRaw = card.querySelector('.product-price')?.textContent?.replace(/[^0-9]/g, '') || '0';
                const price    = parseInt(priceRaw);
                const image    = card.querySelector('img')?.src || '/asset/prod1.webp';
                const id       = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

                Cart.add(id, name, price, image);

                /* Button feedback */
                btn.textContent       = '✅ Added!';
                btn.style.background  = '#27ae60';
                btn.disabled          = true;
                setTimeout(() => {
                    btn.textContent      = 'Add to Cart';
                    btn.style.background = '';
                    btn.disabled         = false;
                }, 1500);
            });
        });

        /* Render cart page if we're on /cart */
        this.renderCartPage();
    }
};


/* ============================================
   jQuery — Slick Carousel ONLY
   ============================================ */
$(document).ready(function () {
    if ($('#productsCarousel').length === 0) return;

    var totalCards = $('#productsCarousel .product-card').length;
    $('#total-slides').text(totalCards);

    $('#productsCarousel').slick({
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        pauseOnHover: false,
        arrows: false,
        dots: false,
        speed: 500,
        responsive: [
            { breakpoint: 992, settings: { slidesToShow: 2 } },
            { breakpoint: 576, settings: { slidesToShow: 1 } }
        ]
    });

    $('#prevBtn').on('click', () => $('#productsCarousel').slick('slickPrev'));
    $('#nextBtn').on('click', () => $('#productsCarousel').slick('slickNext'));

    $('#productsCarousel').on('afterChange', function (e, slick, currentSlide) {
        $('#current-slide').text(currentSlide + 1);
    });

    $('#productsCarousel').on('mouseenter', '.product-card', function () {
        $('#productsCarousel').slick('slickPause');
    });
    $('#productsCarousel').on('mouseleave', '.product-card', function () {
        $('#productsCarousel').slick('slickPlay');
    });
});
