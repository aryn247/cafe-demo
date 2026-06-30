import './style.css';

// 1. Menu Datasets
const DRINKS = [
  {
    id: 'espresso',
    category: 'drinks',
    name: 'Classic Espresso',
    badge: 'Rich & Intense',
    description: 'A concentrated shot of pure arabica coffee, offering a robust aroma and caramel-toned crema.',
    price: 3.50,
    gradient: 'linear-gradient(to top, #1c0e07 0%, #3a2215 100%)',
    foamColor: 'rgba(217, 125, 56, 0.4)', // Amber crema
    special: false
  },
  {
    id: 'cappuccino',
    category: 'drinks',
    name: 'Velvety Cappuccino',
    badge: 'House Favorite',
    description: 'Equal parts rich espresso, steamed milk, and a thick, cloud-like layer of velvety milk foam.',
    price: 4.75,
    gradient: 'linear-gradient(to top, #29180e 0%, #5c3c24 70%, #ece0d1 100%)',
    foamColor: '#fcf8f2', // Rich white foam
    special: true
  },
  {
    id: 'matcha',
    category: 'drinks',
    name: 'Iced Matcha Latte',
    badge: 'Artisanal Green',
    description: 'Vibrant Japanese ceremonial matcha whisked with ice-cold milk, creating creamy, earthy layers.',
    price: 5.25,
    gradient: 'linear-gradient(to top, #2d6a4f 0%, #74c69d 60%, #e8f5e9 100%)',
    foamColor: '#d8f3dc', // Green froth
    special: false
  },
  {
    id: 'caramel',
    category: 'drinks',
    name: 'Caramel Macchiato',
    badge: 'Sweet & Creamy',
    description: 'Freshly steamed milk stained with espresso, sweet vanilla syrup, and a crosshatch caramel drizzle.',
    price: 5.50,
    gradient: 'linear-gradient(to top, #36220f 0%, #8a5a36 60%, #ffd166 100%)',
    foamColor: '#ffd166', // Caramel syrup foam
    special: false
  }
];

const BAKEHOUSE = [
  {
    id: 'croissant',
    category: 'bakehouse',
    name: 'Butter Croissant',
    badge: 'Baked Daily',
    description: 'Flaky, golden-brown puff pastry baked fresh each morning with premium organic butter.',
    price: 3.25,
    emoji: '🥐',
    special: false
  },
  {
    id: 'muffin',
    category: 'bakehouse',
    name: 'Chocolate Muffin',
    badge: 'Decadent Cup',
    description: 'Double chocolate muffin filled with molten fudge chunks and topped with cocoa dusting.',
    price: 3.75,
    emoji: '🧁',
    special: false
  },
  {
    id: 'cheesecake',
    category: 'bakehouse',
    name: 'Matcha Cheesecake',
    badge: 'House Specialty',
    description: 'Creamy New York style cheesecake infused with Uji matcha on a graham cracker base.',
    price: 5.50,
    emoji: '🍰',
    special: true
  },
  {
    id: 'toast',
    category: 'bakehouse',
    name: 'Avocado Toast',
    badge: 'Barista Choice',
    description: 'Artisanal sourdough toast layered with seasoned mashed avocado, cherry tomatoes, and microgreens.',
    price: 6.25,
    emoji: '🥑',
    special: false
  }
];

// Combine all items for easy lookup
const ALL_ITEMS = [...DRINKS, ...BAKEHOUSE];

// 2. Application State
const state = {
  cart: [], // items: { id, name, price, qty }
  isBrewing: false,
  activeCategory: 'drinks' // 'drinks' or 'bakehouse'
};

// 3. DOM Cache
const dom = {
  welcomeScreen: document.getElementById('welcome-screen'),
  enterCafeBtn: document.getElementById('enter-cafe-btn'),
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
  
  // Mobile Navigation Cache
  mobileMenuToggle: document.getElementById('mobile-menu-toggle'),
  mobileMenuClose: document.getElementById('mobile-menu-close'),
  mobileNavDrawer: document.getElementById('mobile-nav-drawer'),
  mobileNavBackdrop: document.getElementById('mobile-nav-backdrop'),
  mobileNavLinks: document.querySelectorAll('.mobile-nav-link'),
  
  // Swipe indicators
  menuSwipeIndicator: document.getElementById('menu-swipe-indicator'),
  reviewsSwipeIndicator: document.getElementById('reviews-swipe-indicator'),
  reviewsGrid: document.getElementById('reviews-grid'),
  infoSwipeIndicator: document.getElementById('info-swipe-indicator'),
  infoGrid: document.querySelector('.info-grid'),
  
  // Machine / Prep Station
  machine: document.getElementById('espresso-machine'),
  portafilter: document.getElementById('portafilter-nozzle'),
  machineStatus: document.getElementById('machine-status'),
  statusLight: document.getElementById('status-light'),
  gaugeNeedle: document.getElementById('gauge-needle'),
  coffeeStream: document.getElementById('coffee-stream'),
  cupLanding: document.getElementById('cup-landing-spot'),
  steamContainer: document.getElementById('steam-container'),

  // Checkout modal
  checkoutModal: document.getElementById('checkout-modal'),
  orderReceipt: document.getElementById('order-receipt'),
  closeModalBtn: document.getElementById('close-modal-btn'),
  navLinks: document.querySelectorAll('.nav-link'),
  
  // Footer Newsletter
  newsletterForm: document.getElementById('newsletter-form'),
  newsletterFeedback: document.getElementById('newsletter-feedback')
};

// 4. Initializer
function init() {
  renderMenu();
  setupEventListeners();
  updateCartUI();
  setupScrollHighlight();
  setupSwipeIndicators();
  
  // Set machine to Ready initially
  dom.statusLight.classList.add('ready');
}

// 5. Setup Listeners
function setupEventListeners() {
  // Welcome Overlay click
  dom.enterCafeBtn.addEventListener('click', handleEnterCafe);

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

  // Modal Actions
  dom.checkoutBtn.addEventListener('click', handleCheckout);
  dom.closeModalBtn.addEventListener('click', closeModal);

  // Menu Category Tabs
  dom.menuTabs.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (state.isBrewing) return; // lock changes during active animations
      dom.menuTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeCategory = btn.getAttribute('data-tab');
      renderMenu();
      setupSwipeIndicators(); // Reset scroll listeners for swipe indicators
    });
  });

  // Navigation Click Handler (Smooth Scroll - Desktop)
  dom.navLinks.forEach(link => {
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

  // Navigation Click Handler (Smooth Scroll - Mobile Drawer)
  dom.mobileNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      // Close mobile drawer
      toggleMobileMenu(false);

      if (targetElement) {
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        // Slight timeout to allow mobile keyboard/menu layouts to adjust
        setTimeout(() => {
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }, 150);
      }
    });
  });

  // Newsletter Submit Listener
  if (dom.newsletterForm) {
    dom.newsletterForm.addEventListener('submit', handleNewsletterSubmit);
  }
}

// 6. Enter Cafe Welcome Screen Transition
function handleEnterCafe() {
  dom.welcomeScreen.classList.add('fade-out');
  setTimeout(() => {
    dom.welcomeScreen.style.display = 'none';
  }, 900);
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
  const currentItems = state.activeCategory === 'drinks' ? DRINKS : BAKEHOUSE;

  dom.menuGrid.innerHTML = currentItems.map(item => {
    const isDrink = item.category === 'drinks';
    
    const visualHtml = isDrink 
      ? `
        <div class="static-cup-icon">
          <div class="static-liquid" style="--drink-grad: ${item.gradient}"></div>
          <div class="static-foam" style="background: ${item.foamColor}"></div>
        </div>
      `
      : `<div class="static-food-icon">${item.emoji}</div>`;

    return `
      <div class="glass-card menu-card" id="card-${item.id}">
        <div class="drink-header">
          <span class="drink-badge ${item.special ? 'special' : ''}">${item.badge}</span>
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
          <button class="brew-btn" id="btn-craft-${item.id}" data-id="${item.id}">
            ${isDrink ? 'Brew This' : 'Plate This'}
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Add click events to buttons
  dom.menuGrid.querySelectorAll('.brew-btn').forEach(button => {
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
    
    // Remove particle when animation ends
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

// 11. Consolidated Preparation Sequence (Drinks & Foods)
function triggerCraftSequence(itemId) {
  if (state.isBrewing) return;
  state.isBrewing = true;
  
  const item = ALL_ITEMS.find(i => i.id === itemId);
  const isDrink = item.category === 'drinks';
  
  // Disable all action buttons
  document.querySelectorAll('.brew-btn').forEach(btn => btn.disabled = true);
  dom.menuTabs.querySelectorAll('.tab-btn').forEach(btn => btn.disabled = true);
  
  dom.statusLight.className = 'status-light brewing';
  dom.cupLanding.innerHTML = '';
  
  // Focus view on prep station
  document.getElementById('brewing').scrollIntoView({ behavior: 'smooth', block: 'center' });

  if (isDrink) {
    // --- DRINK BREWING SEQUENCE ---
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

    // 1. Wait for Cup Drop and Spin (900ms)
    setTimeout(() => {
      dom.machineStatus.innerText = `Brewing ${item.name}...`;
      dom.gaugeNeedle.style.transform = 'rotate(85deg)';
      dom.coffeeStream.classList.add('stream-flowing');
      startSteam();

      // Start filling
      setTimeout(() => {
        liquid.style.height = '82%';
      }, 100);

      // 2. Complete Brewing (after 2.5s)
      setTimeout(() => {
        liquid.classList.add('filled');
        dom.coffeeStream.classList.remove('stream-flowing');
        stopSteam();
        dom.gaugeNeedle.style.transform = 'rotate(-90deg)';
        dom.statusLight.className = 'status-light ready';
        dom.machineStatus.innerText = `${item.name} completed! Transferring to cart...`;

        // 3. Parabolic Throw to Cart (after 500ms stabilization)
        setTimeout(() => {
          animateFlyToCart(cup, item);
        }, 500);

      }, 2600);

    }, 900);

  } else {
    // --- FOOD PLATING SEQUENCE ---
    dom.machineStatus.innerText = `Preparing serving tray for ${item.name}...`;
    
    // Hide portafilter nozzle visually to accommodate plates
    dom.portafilter.classList.add('hide-nozzle');

    const plate = document.createElement('div');
    plate.className = 'serving-plate plate-dropping';
    plate.id = `plating-tray-${item.id}`;

    const food = document.createElement('div');
    food.className = 'plated-food';
    food.innerText = item.emoji;
    plate.appendChild(food);
    dom.cupLanding.appendChild(plate);

    // 1. Wait for Plate Drop and Spin (900ms)
    setTimeout(() => {
      dom.machineStatus.innerText = `Warming & plating ${item.name}...`;
      dom.gaugeNeedle.style.transform = 'rotate(40deg)'; // Minor warmth pressure
      
      // Warm croissant/toast with steam puff
      if (item.id === 'croissant' || item.id === 'toast') {
        startSteam();
        setTimeout(stopSteam, 1200);
      }

      // Plate reveal (lift dome and pop food)
      setTimeout(() => {
        plate.classList.add('plated');
        food.classList.add('revealed');
      }, 300);

      // 2. Complete Plating (after 2.0s total)
      setTimeout(() => {
        dom.gaugeNeedle.style.transform = 'rotate(-90deg)';
        dom.statusLight.className = 'status-light ready';
        dom.machineStatus.innerText = `${item.name} plated! Serving...`;

        // 3. Parabolic Throw to Cart (after 500ms)
        setTimeout(() => {
          animateFlyToCart(plate, item);
        }, 500);

      }, 2000);

    }, 900);
  }
}

// 11. Helper: Parabolic flight calculation
function animateFlyToCart(element, item) {
  const rect = element.getBoundingClientRect();
  const cartBtnRect = dom.cartToggleBtn.getBoundingClientRect();
  
  const dx = cartBtnRect.left - rect.left + 25;
  const dy = cartBtnRect.top - rect.top + 10;
  
  element.style.setProperty('--dx', `${dx}px`);
  element.style.setProperty('--dy', `${dy}px`);
  
  element.className = item.category === 'drinks' 
    ? 'coffee-cup cup-flying' 
    : 'serving-plate plate-flying';
  
  // Finish Animation
  setTimeout(() => {
    element.remove();
    dom.cupLanding.innerHTML = '';
    
    // Add to cart state
    addToCart(item);
    
    // Bounce cart button
    dom.cartToggleBtn.classList.add('pop');
    setTimeout(() => dom.cartToggleBtn.classList.remove('pop'), 300);
    
    // Open drawer
    toggleCart(true);

    // Reset machine locks and portafilter UI
    state.isBrewing = false;
    dom.portafilter.classList.remove('hide-nozzle');
    
    document.querySelectorAll('.brew-btn').forEach(btn => btn.disabled = false);
    dom.menuTabs.querySelectorAll('.tab-btn').forEach(btn => btn.disabled = false);
    dom.machineStatus.innerText = 'Select an item from the menu to start crafting';
  }, 800);
}

// 12. Cart Operations
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

// 13. Update Cart Drawer View
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

    // Subtotal math
    const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    dom.cartSubtotal.innerText = `$${subtotal.toFixed(2)}`;
  }
}

// 14. Checkout Modal
function handleCheckout() {
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  
  let receiptHtml = state.cart.map(item => `
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
  
  toggleCart(false);
  dom.checkoutModal.classList.add('open');
}

function closeModal() {
  dom.checkoutModal.classList.remove('open');
  state.cart = [];
  updateCartUI();
}

// 15. Newsletter Subscription Handling
function handleNewsletterSubmit(e) {
  e.preventDefault();
  const emailInput = document.getElementById('newsletter-email');
  
  if (dom.newsletterFeedback && emailInput) {
    dom.newsletterFeedback.innerText = 'Thanks for subscribing! Check your inbox soon.';
    dom.newsletterFeedback.className = 'newsletter-feedback success';
    dom.newsletterForm.reset();
    
    // Clear feedback message after 4 seconds
    setTimeout(() => {
      dom.newsletterFeedback.innerText = '';
      dom.newsletterFeedback.className = 'newsletter-feedback';
    }, 4000);
  }
}

// 16. Scroll Observer for Active Link Highlights
function setupScrollHighlight() {
  const sections = ['menu', 'brewing', 'about', 'hours-location'];
  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -60% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        
        // Highlight Desktop Link
        dom.navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });

        // Highlight Mobile Link
        dom.mobileNavLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
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

// 17. Scroll-based fade out logic for swipe indicators
function setupSwipeIndicators() {
  // Menu Grid Horizontal Swipe Listener
  if (dom.menuGrid && dom.menuSwipeIndicator) {
    dom.menuSwipeIndicator.classList.remove('hidden');
    
    const dismissMenuSwipe = () => {
      if (dom.menuGrid.scrollLeft > 25) {
        dom.menuSwipeIndicator.classList.add('hidden');
        dom.menuGrid.removeEventListener('scroll', dismissMenuSwipe);
      }
    };
    
    // Reset scroll left to 0 in case it was swiped on a different category
    dom.menuGrid.scrollLeft = 0;
    dom.menuGrid.addEventListener('scroll', dismissMenuSwipe);
  }

  // Reviews Grid Horizontal Swipe Listener
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

  // Info Grid Horizontal Swipe Listener
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

// Start application
window.addEventListener('DOMContentLoaded', init);
