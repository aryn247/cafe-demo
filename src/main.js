import './style.css';
import { api } from './services/api.js';

// 1. App Menu States (Loaded dynamically from database)
let ALL_ITEMS = [];
let COFFEE = [];
let TEAS = [];
let FOOD = [];

// 2. Application State
const state = {
  cart: [], // items: { id, name, price, qty }
  isBrewing: false,
  activeCategory: 'coffee', // 'coffee', 'teas', or 'food'
  
  // Security & Authentication session states
  isLoggedIn: false,
  user: null,
  geolocationVerified: false,
  diningOption: 'dinein', // 'dinein' or 'takeaway'
  orderAttempts: 0, // simulated rate-limiting
  currentCraftingItem: null, // keep track of current prepared item for cross-sell
  
  // Admin Portal State
  isAdminLoggedIn: false,
  adminActiveTab: 'orders'
};

// 3. DOM Cache
const dom = {
  welcomeScreen: document.getElementById('welcome-screen'),
  welcomeEnterBtnMain: document.getElementById('welcome-enter-btn-main'),
  welcomeVisitStoreBtn: document.getElementById('welcome-visit-store-btn'),
  navWelcomeTrigger: document.getElementById('nav-welcome-trigger'),
  mobileWelcomeTrigger: document.getElementById('mobile-welcome-trigger'),

  // Accordion inside Magazine Welcome Overlay
  accordionItems: document.querySelectorAll('.accordion-item'),

  menuGrid: document.getElementById('menu-grid'),
  menuTabs: document.getElementById('menu-tabs'),
  
  cartToggleBtn: document.getElementById('cart-toggle-btn'),
  cartCloseBtn: document.getElementById('cart-close-btn'),
  cartDrawer: document.getElementById('cart-drawer'),
  cartBackdrop: document.getElementById('cart-backdrop'),
  cartItems: document.getElementById('cart-items'),
  cartBadge: document.getElementById('cart-badge'),
  cartSubtotal: document.getElementById('cart-subtotal'),
  checkoutBtn: document.getElementById('checkout-btn'),
  
  // Header Actions & CTA Buttons
  accountTriggerBtn: document.getElementById('account-trigger-btn'),
  accountBtnText: document.getElementById('account-btn-text'),
  
  // Mobile Navigation Cache
  mobileMenuToggle: document.getElementById('mobile-menu-toggle'),
  mobileMenuClose: document.getElementById('mobile-menu-close'),
  mobileNavDrawer: document.getElementById('mobile-nav-drawer'),
  mobileNavBackdrop: document.getElementById('mobile-nav-backdrop'),
  mobileNavLinks: document.querySelectorAll('.mobile-nav-link'),
  mobileAccountTrigger: document.getElementById('mobile-account-trigger'),
  mobileAccountText: document.getElementById('mobile-account-text'),
  
  // Swipe indicators
  menuSwipeIndicator: document.getElementById('menu-swipe-indicator'),
  reviewsSwipeIndicator: document.getElementById('reviews-swipe-indicator'),
  reviewsGrid: document.getElementById('reviews-grid'),
  infoSwipeIndicator: document.getElementById('info-swipe-indicator'),
  infoGrid: document.querySelector('.info-grid'),
  
  // Cross-sell modal
  crossSellModal: document.getElementById('cross-sell-modal'),
  crossSellTitle: document.getElementById('cross-sell-title'),
  crossSellDesc: document.getElementById('cross-sell-desc'),
  crossSellYesBtn: document.getElementById('cross-sell-yes-btn'),
  crossSellNoBtn: document.getElementById('cross-sell-no-btn'),

  // Auth modal
  authModal: document.getElementById('auth-modal'),
  authCloseBtn: document.getElementById('auth-close-btn'),
  authPhoneStep: document.getElementById('auth-phone-step'),
  authOtpStep: document.getElementById('auth-otp-step'),
  authPhoneInput: document.getElementById('auth-phone'),
  authSendOtpBtn: document.getElementById('auth-send-otp-btn'),
  authVerifyOtpBtn: document.getElementById('auth-verify-otp-btn'),
  authBackBtn: document.getElementById('auth-back-btn'),
  otpDigits: document.querySelectorAll('.otp-digit'),

  // Checkout details modal
  checkoutDetailsModal: document.getElementById('checkout-details-modal'),
  checkoutDetailsForm: document.getElementById('checkout-details-form'),
  diningDineInBtn: document.getElementById('dining-dinein'),
  diningTakeawayBtn: document.getElementById('dining-takeaway'),
  tableNumberGroup: document.getElementById('table-number-group'),
  tableNumberInput: document.getElementById('table-number'),
  verifyLocationBtn: document.getElementById('verify-location-btn'),
  locationStatus: document.getElementById('location-status'),
  turnstileCheckbox: document.getElementById('turnstile-checkbox'),
  confirmOrderBtn: document.getElementById('confirm-order-btn'),
  cancelCheckoutBtn: document.getElementById('cancel-checkout-btn'),

  // Machine / Prep Station
  machine: document.getElementById('espresso-machine'),
  portafilter: document.getElementById('portafilter-nozzle'),
  machineStatus: document.getElementById('machine-status'),
  statusLight: document.getElementById('status-light'),
  gaugeNeedle: document.getElementById('gauge-needle'),
  coffeeStream: document.getElementById('coffee-stream'),
  cupLanding: document.getElementById('cup-landing-spot'),
  steamContainer: document.getElementById('steam-container'),

  // Checkout success modal
  checkoutModal: document.getElementById('checkout-modal'),
  orderReceipt: document.getElementById('order-receipt'),
  closeModalBtn: document.getElementById('close-modal-btn'),
  navLinks: document.querySelectorAll('.nav-link'),
  
  // Footer Newsletter
  newsletterForm: document.getElementById('newsletter-form'),
  newsletterFeedback: document.getElementById('newsletter-feedback'),

  // --- ADMIN PORTAL CACHE ---
  adminPortal: document.getElementById('admin-portal'),
  navAdminTrigger: document.getElementById('nav-admin-trigger'),
  mobileAdminTrigger: document.getElementById('mobile-admin-trigger'),
  adminLoginCloseBtn: document.getElementById('admin-login-close-btn'),
  adminDashCloseBtn: document.getElementById('admin-dash-close-btn'),
  adminLogoutBtn: document.getElementById('admin-logout-btn'),
  adminPinHidden: document.getElementById('admin-pin-hidden'),
  adminLoginError: document.getElementById('admin-login-error'),
  adminDashboardPanel: document.getElementById('admin-dashboard-panel'),
  adminLoginScreen: document.getElementById('admin-login-screen'),

  // Admin Dashboard views
  adminOrdersFeed: document.getElementById('admin-orders-feed'),
  adminInventoryList: document.getElementById('admin-inventory-list'),
  adminReservationsList: document.getElementById('admin-reservations-list'),
  adminAddItemTrigger: document.getElementById('admin-add-item-trigger'),
  adminAddItemModal: document.getElementById('admin-add-item-modal'),
  adminAddItemForm: document.getElementById('admin-add-item-form'),
  adminAddItemCancel: document.getElementById('admin-add-item-cancel'),
  newItemCategory: document.getElementById('new-item-category'),
  newItemDrinkVisuals: document.getElementById('new-item-drink-visuals'),
  newItemFoodVisuals: document.getElementById('new-item-food-visuals')
};

// 4. Initializer
async function init() {
  await loadMenuData();
  setupEventListeners();
  updateCartUI();
  setupScrollHighlight();
  setupSwipeIndicators();
  
  // Set machine to Ready initially
  dom.statusLight.classList.add('ready');
}

// 5. Load data from backend
async function loadMenuData() {
  try {
    const items = await api.getMenu();
    ALL_ITEMS = items;
    COFFEE = items.filter(i => i.category === 'coffee');
    TEAS = items.filter(i => i.category === 'teas');
    FOOD = items.filter(i => i.category === 'food');
    renderMenu();
  } catch (error) {
    console.error('Failed to load menu details from server database:', error);
  }
}

// 6. Setup Listeners
function setupEventListeners() {
  // Welcome Overlay click
  const closeWelcome = () => {
    dom.welcomeScreen.classList.add('fade-out');
  };
  dom.welcomeEnterBtnMain.addEventListener('click', closeWelcome);
  dom.welcomeVisitStoreBtn.addEventListener('click', closeWelcome);

  // Re-open Welcome page from Navigation links
  dom.navWelcomeTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    dom.welcomeScreen.classList.remove('fade-out');
  });
  if (dom.mobileWelcomeTrigger) {
    dom.mobileWelcomeTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      toggleMobileMenu(false);
      dom.welcomeScreen.classList.remove('fade-out');
    });
  }

  // Interactive Editorial Accordion inside Welcome Screen
  dom.accordionItems.forEach(item => {
    item.addEventListener('click', () => {
      if (item.classList.contains('active')) return;
      dom.accordionItems.forEach(card => card.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // Drawer Toggles
  dom.cartToggleBtn.addEventListener('click', () => toggleCart(true));
  dom.cartCloseBtn.addEventListener('click', () => toggleCart(false));
  dom.cartBackdrop.addEventListener('click', () => toggleCart(false));

  // Mobile Drawer Toggle Listeners
  if (dom.mobileMenuToggle) {
    dom.mobileMenuToggle.addEventListener('click', () => toggleMobileMenu(true));
  }
  if (dom.mobileMenuClose) {
    dom.mobileMenuClose.addEventListener('click', () => toggleMobileMenu(false));
  }
  if (dom.mobileNavBackdrop) {
    dom.mobileNavBackdrop.addEventListener('click', () => toggleMobileMenu(false));
  }

  // Modal Actions (Success Dialog)
  dom.closeModalBtn.addEventListener('click', closeModal);

  // Cross-sell Actions
  dom.crossSellYesBtn.addEventListener('click', handleCrossSellYes);
  dom.crossSellNoBtn.addEventListener('click', handleCrossSellNo);

  // Authentication Wall Listeners
  dom.authSendOtpBtn.addEventListener('click', handleSendOtp);
  dom.authVerifyOtpBtn.addEventListener('click', handleVerifyOtp);
  dom.authBackBtn.addEventListener('click', handleAuthBack);
  setupOtpAutofocus();

  // Close Authentication Wall trigger
  if (dom.authCloseBtn) {
    dom.authCloseBtn.addEventListener('click', () => {
      dom.authModal.classList.remove('open');
    });
  }

  // Create Account Header bindings
  dom.accountTriggerBtn.addEventListener('click', handleAccountClick);
  if (dom.mobileAccountTrigger) {
    dom.mobileAccountTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      toggleMobileMenu(false);
      handleAccountClick();
    });
  }

  // Checkout Details Listeners
  dom.checkoutBtn.addEventListener('click', handleCheckoutTrigger);
  dom.diningDineInBtn.addEventListener('click', () => toggleDiningOption('dinein'));
  dom.diningTakeawayBtn.addEventListener('click', () => toggleDiningOption('takeaway'));
  dom.verifyLocationBtn.addEventListener('click', handleLocationVerify);
  dom.turnstileCheckbox.addEventListener('change', checkCheckoutFormValidity);
  dom.tableNumberInput.addEventListener('input', checkCheckoutFormValidity);
  dom.cancelCheckoutBtn.addEventListener('click', () => {
    dom.checkoutDetailsModal.classList.remove('open');
  });
  dom.checkoutDetailsForm.addEventListener('submit', handleFinalOrderSubmission);

  // Menu Category Tabs
  dom.menuTabs.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.isBrewing) return; // lock changes during active animations
      dom.menuTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeCategory = btn.getAttribute('data-tab');
      renderMenu();
      setupSwipeIndicators();
    });
  });

  // Category Selector Link Triggers
  document.querySelectorAll('.category-trigger, .mobile-category-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      if (state.isBrewing) return;

      const cat = trigger.getAttribute('data-category');
      
      dom.menuTabs.querySelectorAll('.tab-btn').forEach(btn => {
        if (btn.getAttribute('data-tab') === cat) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      
      state.activeCategory = cat;
      renderMenu();
      setupSwipeIndicators();
      
      toggleMobileMenu(false);
      
      const menuSec = document.getElementById('menu');
      if (menuSec) {
        const headerOffset = 90;
        const elementPosition = menuSec.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    });
  });

  // Navigation Click Handler (Desktop)
  dom.navLinks.forEach(link => {
    if (link.classList.contains('category-trigger') || link.id === 'nav-welcome-trigger' || link.id === 'nav-admin-trigger') return;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      dom.navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      if (targetElement) {
        const headerOffset = 90;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Navigation Click Handler (Mobile Drawer)
  dom.mobileNavLinks.forEach(link => {
    if (link.classList.contains('mobile-category-trigger') || link.id === 'mobile-welcome-trigger' || link.id === 'mobile-admin-trigger') return;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      toggleMobileMenu(false);

      if (targetElement) {
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        setTimeout(() => {
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }, 150);
      }
    });
  });

  // Newsletter Submit
  if (dom.newsletterForm) {
    dom.newsletterForm.addEventListener('submit', handleNewsletterSubmit);
  }

  // --- ADMIN PORTAL EVENT LISTENERS ---
  const openAdminPortal = (e) => {
    e.preventDefault();
    toggleMobileMenu(false);
    dom.adminPortal.classList.add('open');
    if (!state.isAdminLoggedIn) {
      resetAdminPin();
    } else {
      openAdminDashboard();
    }
  };
  dom.navAdminTrigger.addEventListener('click', openAdminPortal);
  dom.mobileAdminTrigger.addEventListener('click', openAdminPortal);

  const closeAdminPortal = () => {
    dom.adminPortal.classList.remove('open');
  };
  dom.adminLoginCloseBtn.addEventListener('click', closeAdminPortal);
  dom.adminDashCloseBtn.addEventListener('click', closeAdminPortal);

  dom.adminLogoutBtn.addEventListener('click', () => {
    state.isAdminLoggedIn = false;
    resetAdminPin();
  });

  // Pin Typing & Hidden Input Handlers
  dom.adminPinHidden.addEventListener('input', () => {
    let code = dom.adminPinHidden.value;
    updatePinDots(code);
    
    if (code.length === 4) {
      validateAdminPin(code);
    }
  });

  // Virtual Pin pad click listeners
  document.querySelectorAll('.pin-btn:not(.clear):not(.backspace)').forEach(btn => {
    btn.addEventListener('click', () => {
      if (dom.adminPinHidden.value.length < 4) {
        dom.adminPinHidden.value += btn.getAttribute('data-val');
        dom.adminPinHidden.dispatchEvent(new Event('input'));
      }
    });
  });

  document.getElementById('pin-clear').addEventListener('click', () => {
    dom.adminPinHidden.value = '';
    dom.adminPinHidden.dispatchEvent(new Event('input'));
  });

  document.getElementById('pin-backspace').addEventListener('click', () => {
    if (dom.adminPinHidden.value.length > 0) {
      dom.adminPinHidden.value = dom.adminPinHidden.value.slice(0, -1);
      dom.adminPinHidden.dispatchEvent(new Event('input'));
    }
  });

  // Focus hidden input on login card click
  dom.adminLoginScreen.addEventListener('click', () => {
    dom.adminPinHidden.focus();
  });

  // Admin Dashboard Tabs
  document.querySelectorAll('.dash-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.dash-nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const targetTab = btn.getAttribute('data-tab');
      state.adminActiveTab = targetTab;
      
      document.querySelectorAll('.dash-tab-pane').forEach(p => p.classList.remove('active'));
      document.getElementById(`tab-pane-${targetTab}`).classList.add('active');
      
      refreshAdminData();
    });
  });

  // Add Menu Item form category change
  dom.newItemCategory.addEventListener('change', () => {
    const val = dom.newItemCategory.value;
    if (val === 'food') {
      dom.newItemDrinkVisuals.style.display = 'none';
      dom.newItemFoodVisuals.style.display = 'block';
    } else {
      dom.newItemDrinkVisuals.style.display = 'flex';
      dom.newItemFoodVisuals.style.display = 'none';
    }
  });

  // Trigger Add Modal
  dom.adminAddItemTrigger.addEventListener('click', () => {
    dom.adminAddItemForm.reset();
    dom.newItemCategory.dispatchEvent(new Event('change'));
    dom.adminAddItemModal.classList.add('open');
  });

  dom.adminAddItemCancel.addEventListener('click', () => {
    dom.adminAddItemModal.classList.remove('open');
  });

  dom.adminAddItemForm.addEventListener('submit', handleAdminAddItemSubmit);
}

// 7. Toggle Cart Drawer
function toggleCart(isOpen) {
  if (isOpen) {
    dom.cartDrawer.classList.add('open');
    dom.cartBackdrop.classList.add('active');
  } else {
    dom.cartDrawer.classList.remove('open');
    dom.cartBackdrop.classList.remove('active');
  }
}

// 8. Toggle Mobile Navigation Drawer
function toggleMobileMenu(isOpen) {
  if (isOpen) {
    dom.mobileNavDrawer.classList.add('open');
    dom.mobileNavBackdrop.classList.add('active');
  } else {
    dom.mobileNavDrawer.classList.remove('open');
    dom.mobileNavBackdrop.classList.remove('active');
  }
}

// 9. Render Menu Cards Dynamically
function renderMenu() {
  let currentItems = [];
  if (state.activeCategory === 'coffee') {
    currentItems = COFFEE;
  } else if (state.activeCategory === 'teas') {
    currentItems = TEAS;
  } else {
    currentItems = FOOD;
  }

  const isFood = state.activeCategory === 'food';

  dom.menuGrid.innerHTML = currentItems.map(item => {
    const visualHtml = !isFood
      ? `
        <div class="static-cup-icon">
          <div class="static-liquid" style="--drink-grad: ${item.gradient}"></div>
          <div class="static-foam" style="background: ${item.foamColor}"></div>
        </div>
      `
      : `<div class="static-food-icon">${item.emoji}</div>`;

    // Check if the item is in stock
    const isOutOfStock = item.inStock === false;

    return `
      <div class="glass-card menu-card ${isOutOfStock ? 'out-of-stock-card' : ''}" id="card-${item.id}">
        <div class="drink-header">
          <span class="drink-badge ${item.special ? 'special' : ''} ${isOutOfStock ? 'sold-out' : ''}">
            ${isOutOfStock ? 'SOLD OUT' : item.badge}
          </span>
        </div>
        
        <div class="drink-visual">
          ${visualHtml}
        </div>

        <div class="drink-info">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
        </div>

        <div class="drink-footer">
          <span class="drink-price">$${item.price.toFixed(2)}</span>
          <button class="brew-btn" id="btn-craft-${item.id}" data-id="${item.id}" ${isOutOfStock ? 'disabled' : ''}>
            ${isOutOfStock ? 'Sold Out' : (!isFood ? 'Brew This' : 'Plate This')}
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Add click events to buttons
  dom.menuGrid.querySelectorAll('.brew-btn:not(:disabled)').forEach(button => {
    button.addEventListener('click', () => {
      const itemId = button.getAttribute('data-id');
      triggerCraftSequence(itemId);
    });
  });
}

// 10. Dynamic Steam Particles
let steamInterval = null;
function startSteam() {
  if (steamInterval) clearInterval(steamInterval);
  steamInterval = setInterval(() => {
    const particle = document.createElement('div');
    particle.className = 'steam-particle';
    particle.style.setProperty('--steam-left', `${35 + Math.random() * 30}%`);
    particle.style.setProperty('--steam-wobble', `${-20 + Math.random() * 40}px`);
    particle.style.setProperty('--steam-duration', `${1.2 + Math.random() * 1}s`);
    
    dom.steamContainer.appendChild(particle);
    
    setTimeout(() => {
      particle.remove();
    }, 2200);
  }, 150);
}

function stopSteam() {
  if (steamInterval) {
    clearInterval(steamInterval);
    steamInterval = null;
  }
}

// 11. Prep Station Animations
function triggerCraftSequence(itemId) {
  if (state.isBrewing) return;
  state.isBrewing = true;
  
  const item = ALL_ITEMS.find(i => i.id === itemId);
  state.currentCraftingItem = item;
  const isFood = item.category === 'food';
  
  document.querySelectorAll('.brew-btn').forEach(btn => btn.disabled = true);
  dom.menuTabs.querySelectorAll('.tab-btn').forEach(btn => btn.disabled = true);
  
  dom.statusLight.className = 'status-light brewing';
  dom.cupLanding.innerHTML = '';
  
  document.getElementById('brewing').scrollIntoView({ behavior: 'smooth', block: 'center' });

  if (!isFood) {
    dom.machineStatus.innerText = `Preparing cup for ${item.name}...`;

    const cup = document.createElement('div');
    cup.className = 'coffee-cup cup-dropping';
    cup.id = `brewing-cup-${item.id}`;
    
    const liquid = document.createElement('div');
    liquid.className = 'cup-liquid';
    liquid.style.setProperty('--drink-gradient', item.gradient);
    liquid.style.setProperty('--foam-color', item.foamColor);
    cup.appendChild(liquid);
    dom.cupLanding.appendChild(cup);

    setTimeout(() => {
      dom.machineStatus.innerText = `Brewing ${item.name}...`;
      dom.gaugeNeedle.style.transform = 'rotate(85deg)';
      dom.coffeeStream.classList.add('stream-flowing');
      startSteam();

      setTimeout(() => {
        liquid.style.height = '82%';
      }, 100);

      setTimeout(() => {
        liquid.classList.add('filled');
        dom.coffeeStream.classList.remove('stream-flowing');
        stopSteam();
        dom.gaugeNeedle.style.transform = 'rotate(-90deg)';
        dom.statusLight.className = 'status-light ready';
        dom.machineStatus.innerText = `${item.name} completed! Transferring to cart...`;

        setTimeout(() => {
          animateFlyToCart(cup, item);
        }, 500);

      }, 2600);

    }, 900);

  } else {
    dom.machineStatus.innerText = `Preparing serving tray for ${item.name}...`;
    dom.portafilter.classList.add('hide-nozzle');

    const plate = document.createElement('div');
    plate.className = 'serving-plate plate-dropping';
    plate.id = `plating-tray-${item.id}`;

    const food = document.createElement('div');
    food.className = 'plated-food';
    food.innerText = item.emoji;
    plate.appendChild(food);
    dom.cupLanding.appendChild(plate);

    setTimeout(() => {
      dom.machineStatus.innerText = `Warming & plating ${item.name}...`;
      dom.gaugeNeedle.style.transform = 'rotate(40deg)';
      
      if (item.id === 'croissant' || item.id === 'toast') {
        startSteam();
        setTimeout(stopSteam, 1200);
      }

      setTimeout(() => {
        plate.classList.add('plated');
        food.classList.add('revealed');
      }, 300);

      setTimeout(() => {
        dom.gaugeNeedle.style.transform = 'rotate(-90deg)';
        dom.statusLight.className = 'status-light ready';
        dom.machineStatus.innerText = `${item.name} plated! Serving...`;

        setTimeout(() => {
          animateFlyToCart(plate, item);
        }, 500);

      }, 2000);

    }, 900);
  }
}

// 12. Helper: Parabolic flight calculation
function animateFlyToCart(element, item) {
  const rect = element.getBoundingClientRect();
  const cartBtnRect = dom.cartToggleBtn.getBoundingClientRect();
  
  const dx = cartBtnRect.left - rect.left + 25;
  const dy = cartBtnRect.top - rect.top + 10;
  
  element.style.setProperty('--dx', `${dx}px`);
  element.style.setProperty('--dy', `${dy}px`);
  
  element.className = item.category !== 'food' 
    ? 'coffee-cup cup-flying' 
    : 'serving-plate plate-flying';
  
  setTimeout(() => {
    element.remove();
    dom.cupLanding.innerHTML = '';
    
    addToCart(item);
    
    dom.cartToggleBtn.classList.add('pop');
    setTimeout(() => dom.cartToggleBtn.classList.remove('pop'), 300);
    
    if (item.category === 'coffee' || item.category === 'teas') {
      dom.crossSellTitle.innerText = 'Pair it with a Bite?';
      dom.crossSellDesc.innerText = 'Your drink is prepared! Would you like to order anything else?';
      dom.crossSellYesBtn.innerText = 'Yes, show pastries';
    } else {
      dom.crossSellTitle.innerText = 'Pair it with a Brew?';
      dom.crossSellDesc.innerText = 'Your pastry is plated! Would you like to order anything else?';
      dom.crossSellYesBtn.innerText = 'Yes, show drinks';
    }

    dom.crossSellModal.classList.add('open');

    state.isBrewing = false;
    dom.portafilter.classList.remove('hide-nozzle');
    
    // Refresh buttons taking live stock status into account
    renderMenu();
    dom.menuTabs.querySelectorAll('.tab-btn').forEach(btn => btn.disabled = false);
    dom.machineStatus.innerText = 'Select an item from the menu to start crafting';
  }, 800);
}

// 13. Cart Operations
function addToCart(item) {
  const existingItem = state.cart.find(cartItem => cartItem.id === item.id);
  
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    state.cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      qty: 1
    });
  }
  
  updateCartUI();
}

function removeFromCart(itemId) {
  const itemIndex = state.cart.findIndex(item => item.id === itemId);
  if (itemIndex > -1) {
    const item = state.cart[itemIndex];
    if (item.qty > 1) {
      item.qty -= 1;
    } else {
      state.cart.splice(itemIndex, 1);
    }
  }
  updateCartUI();
}

// 14. Update Cart Drawer View
function updateCartUI() {
  const totalItems = state.cart.reduce((sum, item) => sum + item.qty, 0);
  dom.cartBadge.innerText = totalItems;
  dom.cartBadge.classList.add('pop');
  setTimeout(() => dom.cartBadge.classList.remove('pop'), 250);

  if (state.cart.length === 0) {
    dom.cartItems.innerHTML = `
      <div class="empty-cart-message">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>
        <p>Your order is empty</p>
        <p class="sub-text">Add coffee or pastry from the menu</p>
      </div>
    `;
    dom.checkoutBtn.disabled = true;
    dom.cartSubtotal.innerText = '$0.00';
  } else {
    dom.cartItems.innerHTML = state.cart.map(item => {
      return `
        <div class="cart-item">
          <div class="item-details">
            <h4>${item.name}</h4>
            <span class="item-price-calc">${item.qty} &times; $${item.price.toFixed(2)}</span>
          </div>
          <div class="qty-control">
            <button class="qty-btn dec-btn" data-id="${item.id}">&minus;</button>
            <span class="item-qty">${item.qty}</span>
            <button class="qty-btn inc-btn" data-id="${item.id}">&plus;</button>
          </div>
        </div>
      `;
    }).join('');

    dom.cartItems.querySelectorAll('.dec-btn').forEach(btn => {
      btn.addEventListener('click', () => removeFromCart(btn.getAttribute('data-id')));
    });

    dom.cartItems.querySelectorAll('.inc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = state.cart.find(i => i.id === btn.getAttribute('data-id'));
        if (item) addToCart(item);
      });
    });

    dom.checkoutBtn.disabled = false;

    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    dom.cartSubtotal.innerText = `$${subtotal.toFixed(2)}`;
  }
}

// 15. Cross-sell Handlers
function handleCrossSellYes() {
  dom.crossSellModal.classList.remove('open');
  
  const currentCategory = state.currentCraftingItem ? state.currentCraftingItem.category : 'coffee';
  const targetCategory = (currentCategory === 'coffee' || currentCategory === 'teas')
    ? 'food'
    : 'coffee';

  dom.menuTabs.querySelectorAll('.tab-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === targetCategory) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  state.activeCategory = targetCategory;
  renderMenu();
  setupSwipeIndicators();
  
  const menuSec = document.getElementById('menu');
  if (menuSec) {
    const headerOffset = 90;
    const elementPosition = menuSec.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  }
}

function handleCrossSellNo() {
  dom.crossSellModal.classList.remove('open');
  toggleCart(true);
}

// 16. Authentication & Account Management Handlers
function handleAccountClick() {
  if (state.isLoggedIn) {
    if (confirm('You are already logged in. Would you like to sign out?')) {
      state.isLoggedIn = false;
      state.user = null;
      dom.accountBtnText.innerText = 'Create Account';
      if (dom.mobileAccountText) dom.mobileAccountText.innerText = 'Create Account';
    }
  } else {
    dom.authPhoneStep.style.display = 'block';
    dom.authOtpStep.style.display = 'none';
    dom.authPhoneInput.value = '';
    dom.authModal.classList.add('open');
  }
}

function handleCheckoutTrigger() {
  toggleCart(false);
  
  if (!state.isLoggedIn) {
    dom.authPhoneStep.style.display = 'block';
    dom.authOtpStep.style.display = 'none';
    dom.authPhoneInput.value = '';
    dom.authModal.classList.add('open');
  } else {
    openCheckoutDetails();
  }
}

function handleSendOtp() {
  const phoneVal = dom.authPhoneInput.value;
  if (phoneVal.length !== 10 || isNaN(phoneVal)) {
    alert('Please enter a valid 10-digit mobile number.');
    return;
  }
  
  dom.authPhoneStep.style.display = 'none';
  dom.authOtpStep.style.display = 'block';
  
  dom.otpDigits.forEach(input => input.value = '');
  if (dom.otpDigits[0]) dom.otpDigits[0].focus();
}

function handleVerifyOtp() {
  let code = '';
  dom.otpDigits.forEach(input => code += input.value);
  
  if (code === '1234') {
    state.isLoggedIn = true;
    state.user = { phone: dom.authPhoneInput.value };
    
    dom.accountBtnText.innerText = 'Hi, Aryan';
    if (dom.mobileAccountText) dom.mobileAccountText.innerText = 'Hi, Aryan';

    dom.authModal.classList.remove('open');
    setTimeout(openCheckoutDetails, 300);
  } else {
    alert('Invalid OTP code. Please enter "1234" for the demo verification.');
    dom.otpDigits.forEach(input => input.value = '');
    if (dom.otpDigits[0]) dom.otpDigits[0].focus();
  }
}

function handleAuthBack() {
  dom.authPhoneStep.style.display = 'block';
  dom.authOtpStep.style.display = 'none';
}

function setupOtpAutofocus() {
  dom.otpDigits.forEach(input => {
    input.addEventListener('input', () => {
      const idx = parseInt(input.getAttribute('data-idx'));
      if (input.value.length === 1 && idx < 3) {
        const nextBox = document.querySelector(`.otp-digit[data-idx="${idx + 1}"]`);
        if (nextBox) nextBox.focus();
      }
    });

    input.addEventListener('keydown', (e) => {
      const idx = parseInt(input.getAttribute('data-idx'));
      if (e.key === 'Backspace' && input.value.length === 0 && idx > 0) {
        const prevBox = document.querySelector(`.otp-digit[data-idx="${idx - 1}"]`);
        if (prevBox) {
          prevBox.focus();
          prevBox.value = '';
        }
      }
    });
  });
}

// 17. Checkout Details Modals (Dining & Geolocation checks)
function openCheckoutDetails() {
  state.geolocationVerified = false;
  dom.turnstileCheckbox.checked = false;
  dom.confirmOrderBtn.disabled = true;
  
  dom.locationStatus.className = 'loc-badge status-pending';
  dom.locationStatus.innerText = 'Location not verified';
  
  toggleDiningOption('dinein');
  dom.tableNumberInput.value = '';

  dom.checkoutDetailsModal.classList.add('open');
}

function toggleDiningOption(option) {
  state.diningOption = option;
  
  if (option === 'dinein') {
    dom.diningDineInBtn.classList.add('active');
    dom.diningTakeawayBtn.classList.remove('active');
    dom.tableNumberGroup.style.display = 'flex';
    dom.tableNumberInput.required = true;
  } else {
    dom.diningDineInBtn.classList.remove('active');
    dom.diningTakeawayBtn.classList.add('active');
    dom.tableNumberGroup.style.display = 'none';
    dom.tableNumberInput.required = false;
  }
  checkCheckoutFormValidity();
}

function handleLocationVerify() {
  dom.locationStatus.className = 'loc-badge status-verifying';
  dom.locationStatus.innerText = 'Requesting GPS coords...';
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      () => {
        state.geolocationVerified = true;
        
        setTimeout(() => {
          dom.locationStatus.className = 'loc-badge status-success';
          dom.locationStatus.innerText = `Verified: Inside Cafe (Approx 8m distance)`;
          checkCheckoutFormValidity();
        }, 1200);
      },
      (error) => {
        state.geolocationVerified = false;
        dom.locationStatus.className = 'loc-badge status-error';
        
        if (error.code === error.PERMISSION_DENIED) {
          dom.locationStatus.innerText = 'Error: Location denied. Please enable coordinates.';
        } else {
          dom.locationStatus.innerText = 'Error: GPS signal weak. Try again.';
        }
        checkCheckoutFormValidity();
      }
    );
  } else {
    state.geolocationVerified = false;
    dom.locationStatus.className = 'loc-badge status-error';
    dom.locationStatus.innerText = 'Error: GPS not supported by browser.';
    checkCheckoutFormValidity();
  }
}

function checkCheckoutFormValidity() {
  const isTurnstileChecked = dom.turnstileCheckbox.checked;
  const isLocationVerified = state.geolocationVerified;
  let isTableValid = true;

  if (state.diningOption === 'dinein') {
    const tableVal = dom.tableNumberInput.value;
    isTableValid = tableVal !== '' && parseInt(tableVal) > 0;
  }

  if (isTurnstileChecked && isLocationVerified && isTableValid) {
    dom.confirmOrderBtn.disabled = false;
  } else {
    dom.confirmOrderBtn.disabled = true;
  }
}

// Place order to backend Express DB
async function handleFinalOrderSubmission(e) {
  e.preventDefault();
  
  state.orderAttempts += 1;
  if (state.orderAttempts > 3) {
    alert('Security Alert: Multiple order submissions detected. Your IP rate limit is locked. Please try again in 5 minutes.');
    return;
  }

  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  const orderPayload = {
    items: state.cart,
    subtotal: subtotal,
    diningOption: state.diningOption,
    tableNumber: state.diningOption === 'dinein' ? parseInt(dom.tableNumberInput.value) : null,
    phone: state.user ? state.user.phone : '9999999999',
    location: dom.locationStatus.innerText
  };

  try {
    // Send order to server
    await api.placeOrder(orderPayload);

    dom.checkoutDetailsModal.classList.remove('open');
    
    let receiptHtml = `
      <div style="margin-bottom: 0.8rem; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 0.6rem; font-size: 0.85rem; color: hsl(var(--color-primary-light));">
        <span>Mode: ${state.diningOption === 'dinein' ? `Dine-In (Table ${dom.tableNumberInput.value})` : 'Takeaway (Pick-Up)'}</span>
      </div>
    `;
    
    receiptHtml += state.cart.map(item => `
      <div class="receipt-item">
        <span>${item.qty}x ${item.name}</span>
        <span>$${(item.price * item.qty).toFixed(2)}</span>
      </div>
    `).join('');
    
    receiptHtml += `
      <div class="receipt-item">
        <span>Total Paid</span>
        <span>$${subtotal.toFixed(2)}</span>
      </div>
    `;

    dom.orderReceipt.innerHTML = receiptHtml;
    dom.checkoutModal.classList.add('open');
    
  } catch (error) {
    console.error('Failed to post order to server:', error);
    alert('Failed to transmit order to kitchen database. Please verify connection and try again.');
  }
}

function closeModal() {
  dom.checkoutModal.classList.remove('open');
  state.cart = [];
  updateCartUI();
  state.orderAttempts = 0;
}

// Newsletter Submit
function handleNewsletterSubmit(e) {
  e.preventDefault();
  const emailInput = document.getElementById('newsletter-email');
  
  if (dom.newsletterFeedback && emailInput) {
    dom.newsletterFeedback.innerText = 'Thanks for subscribing! Check your inbox soon.';
    dom.newsletterFeedback.className = 'newsletter-feedback success';
    dom.newsletterForm.reset();
    
    setTimeout(() => {
      dom.newsletterFeedback.innerText = '';
      dom.newsletterFeedback.className = 'newsletter-feedback';
    }, 4000);
  }
}

// Scroll Highlights
function setupScrollHighlight() {
  const sections = ['online-store', 'hours-location', 'reviews'];
  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -60% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        let id = entry.target.getAttribute('id');
        let highlightId = id;
        if (id === 'online-store') highlightId = 'menu';

        dom.navLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href === `#${highlightId}` || (highlightId === 'menu' && link.classList.contains('category-trigger'))) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });

        dom.mobileNavLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href === `#${highlightId}` || (highlightId === 'menu' && link.classList.contains('mobile-category-trigger'))) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(secId => {
    const el = document.getElementById(secId);
    if (el) observer.observe(el);
  });
}

// Swipe indicator helper
function setupSwipeIndicators() {
  if (dom.menuGrid && dom.menuSwipeIndicator) {
    dom.menuSwipeIndicator.classList.remove('hidden');
    const dismissMenuSwipe = () => {
      if (dom.menuGrid.scrollLeft > 25) {
        dom.menuSwipeIndicator.classList.add('hidden');
        dom.menuGrid.removeEventListener('scroll', dismissMenuSwipe);
      }
    };
    dom.menuGrid.scrollLeft = 0;
    dom.menuGrid.addEventListener('scroll', dismissMenuSwipe);
  }

  if (dom.reviewsGrid && dom.reviewsSwipeIndicator) {
    dom.reviewsSwipeIndicator.classList.remove('hidden');
    const dismissReviewsSwipe = () => {
      if (dom.reviewsGrid.scrollLeft > 25) {
        dom.reviewsSwipeIndicator.classList.add('hidden');
        dom.reviewsGrid.removeEventListener('scroll', dismissReviewsSwipe);
      }
    };
    dom.reviewsGrid.scrollLeft = 0;
    dom.reviewsGrid.addEventListener('scroll', dismissReviewsSwipe);
  }

  if (dom.infoGrid && dom.infoSwipeIndicator) {
    dom.infoSwipeIndicator.classList.remove('hidden');
    const dismissInfoSwipe = () => {
      if (dom.infoGrid.scrollLeft > 25) {
        dom.infoSwipeIndicator.classList.add('hidden');
        dom.infoGrid.removeEventListener('scroll', dismissInfoSwipe);
      }
    };
    dom.infoGrid.scrollLeft = 0;
    dom.infoGrid.addEventListener('scroll', dismissInfoSwipe);
  }
}

// --- ADMIN & STAFF PORTAL METHODS ---

function resetAdminPin() {
  dom.adminPinHidden.value = '';
  updatePinDots('');
  dom.adminLoginError.innerText = '';
  dom.adminLoginScreen.style.display = 'block';
  dom.adminDashboardPanel.classList.add('hidden-dashboard');
  dom.adminPinHidden.focus();
}

function updatePinDots(code) {
  const dots = dom.adminLoginScreen.querySelectorAll('.pin-dot');
  dots.forEach((dot, idx) => {
    if (idx < code.length) {
      dot.classList.add('filled');
    } else {
      dot.classList.remove('filled');
    }
  });
}

function validateAdminPin(code) {
  // Support either '1234' or '4321' as requested
  if (code === '1234' || code === '4321') {
    state.isAdminLoggedIn = true;
    openAdminDashboard();
  } else {
    dom.adminLoginError.innerText = 'Incorrect PIN. Try "1234" or "4321"';
    dom.adminPinHidden.value = '';
    updatePinDots('');
    dom.adminPinHidden.focus();
  }
}

function openAdminDashboard() {
  dom.adminLoginScreen.style.display = 'none';
  dom.adminDashboardPanel.classList.remove('hidden-dashboard');
  refreshAdminData();
}

async function refreshAdminData() {
  if (!state.isAdminLoggedIn) return;

  try {
    if (state.adminActiveTab === 'orders') {
      // 1. Load active Orders Feed
      const orders = await api.getOrders();
      // Render orders descending (newest first)
      const pendingOrders = orders.filter(o => o.status === 'pending').reverse();
      
      if (pendingOrders.length === 0) {
        dom.adminOrdersFeed.innerHTML = `
          <div class="empty-cart-message" style="grid-column: 1 / -1; height: 200px;">
            <p>Queue is empty</p>
            <p class="sub-text">Active orders from the shop will stream here</p>
          </div>
        `;
      } else {
        dom.adminOrdersFeed.innerHTML = pendingOrders.map(order => {
          const itemsHtml = order.items.map(item => `
            <div style="display: flex; justify-content: space-between; font-size: 0.9rem; border-bottom: 1px dashed rgba(255,255,255,0.05); padding: 0.3rem 0;">
              <span>${item.qty}x ${item.name}</span>
              <span style="color: hsl(var(--color-primary-light));">$${(item.price * item.qty).toFixed(2)}</span>
            </div>
          `).join('');

          const isDineIn = order.diningOption === 'dinein';

          return `
            <div class="glass-card order-feed-card">
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">
                <span style="font-weight: 700; color: white;">Order #${order.id.slice(-4)}</span>
                <span class="drink-badge ${isDineIn ? 'special' : ''}">
                  ${isDineIn ? `Table ${order.tableNumber}` : 'Takeaway'}
                </span>
              </div>
              
              <div style="margin-bottom: 1rem;">
                ${itemsHtml}
              </div>

              <div style="font-size: 0.82rem; color: hsl(var(--color-text-muted)); margin-bottom: 1rem;">
                <p>Phone: ${order.phone}</p>
                <p style="margin-top: 0.2rem; display: flex; align-items: center; gap: 0.3rem; color: #52b788;">
                  <span style="display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: #52b788;"></span>
                  ${order.location}
                </p>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.8rem; margin-top: auto;">
                <span style="font-size: 1.1rem; font-weight: 700; color: white;">$${order.subtotal.toFixed(2)}</span>
                <button class="brew-btn complete-order-btn" data-id="${order.id}">Complete</button>
              </div>
            </div>
          `;
        }).join('');

        // Bind Complete handlers
        dom.adminOrdersFeed.querySelectorAll('.complete-order-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
            const ordId = btn.getAttribute('data-id');
            btn.disabled = true;
            btn.innerText = 'Closing...';
            try {
              await api.updateOrderStatus(ordId, 'completed');
              refreshAdminData();
            } catch (err) {
              console.error(err);
              btn.disabled = false;
              btn.innerText = 'Complete';
            }
          });
        });
      }

    } else if (state.adminActiveTab === 'inventory') {
      // 2. Load stock inventory table
      const menu = await api.getMenu();
      dom.adminInventoryList.innerHTML = menu.map(item => {
        const isOutOfStock = item.inStock === false;
        
        return `
          <tr class="${isOutOfStock ? 'row-out-of-stock' : ''}">
            <td>
              <div style="display: flex; flex-direction: column;">
                <span style="font-weight: 600; color: white;">${item.name}</span>
                <span style="font-size: 0.78rem; color: hsl(var(--color-text-muted));">${item.badge}</span>
              </div>
            </td>
            <td style="text-transform: capitalize; color: hsl(var(--color-text-muted));">${item.category}</td>
            <td>
              <div style="display: flex; align-items: center; gap: 0.2rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 50px; padding: 0.15rem 0.6rem; width: 90px;">
                <span>$</span>
                <input type="number" class="inventory-price-input" data-id="${item.id}" value="${item.price.toFixed(2)}" step="0.05" min="0.10" style="background: transparent; border: none; color: white; width: 100%; font-family: 'Outfit'; outline: none; font-size: 0.9rem;" />
              </div>
            </td>
            <td>
              <button class="stock-toggle-btn ${isOutOfStock ? 'out-of-stock' : 'in-stock'}" data-id="${item.id}">
                ${isOutOfStock ? 'Sold Out' : 'In Stock'}
              </button>
            </td>
            <td>
              <button class="delete-menu-item-btn" data-id="${item.id}" style="background: none; border: none; color: #ef476f; cursor: pointer; padding: 0.4rem;" title="Delete Item">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            </td>
          </tr>
        `;
      }).join('');

      // Bind Price Input change listeners
      dom.adminInventoryList.querySelectorAll('.inventory-price-input').forEach(input => {
        input.addEventListener('change', async () => {
          const itemId = input.getAttribute('data-id');
          const newPrice = parseFloat(input.value);
          if (isNaN(newPrice) || newPrice <= 0) return;

          try {
            await api.updateMenuItem(itemId, { price: newPrice });
            await loadMenuData(); // refresh customer side state
          } catch (err) {
            console.error('Failed to update price:', err);
          }
        });
      });

      // Bind Stock Toggles
      dom.adminInventoryList.querySelectorAll('.stock-toggle-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const itemId = btn.getAttribute('data-id');
          const item = ALL_ITEMS.find(i => i.id === itemId);
          if (!item) return;

          const currentStockStatus = item.inStock !== false; // true if unset/true, false if false
          btn.disabled = true;
          
          try {
            await api.updateMenuItem(itemId, { inStock: !currentStockStatus });
            await loadMenuData(); // refresh customer side state
            refreshAdminData();
          } catch (err) {
            console.error(err);
            btn.disabled = false;
          }
        });
      });

      // Bind Delete Buttons
      dom.adminInventoryList.querySelectorAll('.delete-menu-item-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const itemId = btn.getAttribute('data-id');
          if (confirm('Are you sure you want to delete this menu item?')) {
            try {
              await api.deleteMenuItem(itemId);
              await loadMenuData();
              refreshAdminData();
            } catch (err) {
              console.error(err);
            }
          }
        });
      });

    } else if (state.adminActiveTab === 'reservations') {
      // 3. Load Bookings / Reservations
      const orders = await api.getOrders();
      // Render orders descending (newest first)
      const reservations = orders.reverse();

      if (reservations.length === 0) {
        dom.adminReservationsList.innerHTML = `
          <tr>
            <td colspan="4" style="text-align: center; color: hsl(var(--color-text-muted)); padding: 2rem;">
              No customer bookings logged yet
            </td>
          </tr>
        `;
      } else {
        dom.adminReservationsList.innerHTML = reservations.map(res => {
          const isDineIn = res.diningOption === 'dinein';
          const itemsString = res.items.map(i => `${i.qty}x ${i.name}`).join(', ');
          
          const t = new Date(res.timestamp);
          const formattedTime = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + t.toLocaleDateString();

          return `
            <tr>
              <td>
                <span style="font-size: 0.95rem; color: white;">${formattedTime}</span>
              </td>
              <td>
                <span style="font-family: monospace; font-size: 0.9rem; color: hsl(var(--color-primary-light));">${res.phone}</span>
              </td>
              <td>
                <span class="drink-badge ${isDineIn ? 'special' : ''}">
                  ${isDineIn ? 'Dine-In' : 'Takeaway'}
                </span>
              </td>
              <td>
                <div style="display: flex; flex-direction: column; font-size: 0.88rem;">
                  <span style="color: white; font-weight: 500;">
                    ${isDineIn ? `Reserved Table ${res.tableNumber}` : 'Pick-Up Order'}
                  </span>
                  <span style="color: hsl(var(--color-text-muted)); font-size: 0.8rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 250px;">
                    Items: ${itemsString}
                  </span>
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }
    }
  } catch (error) {
    console.error('Failed to refresh admin dashboard views:', error);
  }
}

async function handleAdminAddItemSubmit(e) {
  e.preventDefault();
  
  const name = document.getElementById('new-item-name').value;
  const category = dom.newItemCategory.value;
  const price = parseFloat(document.getElementById('new-item-price').value);
  const badge = document.getElementById('new-item-badge').value;
  const desc = document.getElementById('new-item-desc').value;

  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const payload = {
    id,
    category,
    name,
    badge,
    description: desc,
    price,
    inStock: true
  };

  // Assign design tokens based on category choice
  if (category === 'food') {
    payload.emoji = document.getElementById('new-item-emoji').value || '🍩';
  } else {
    const liquidColor = document.getElementById('new-item-color-liquid').value;
    const foamColor = document.getElementById('new-item-color-foam').value;
    payload.gradient = `linear-gradient(to top, #111111 0%, ${liquidColor} 70%, ${foamColor} 100%)`;
    payload.foamColor = foamColor;
  }

  try {
    await api.addMenuItem(payload);
    dom.adminAddItemModal.classList.remove('open');
    
    // Refresh states
    await loadMenuData();
    refreshAdminData();
  } catch (err) {
    console.error(err);
    alert('Failed to save menu item. Check network connection.');
  }
}

// Start application
window.addEventListener('DOMContentLoaded', init);
