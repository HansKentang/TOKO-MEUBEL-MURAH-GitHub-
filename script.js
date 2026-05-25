// ========== DARK MODE ==========
function initTheme() {
  const saved = localStorage.getItem('meubelTheme');
  if (saved === 'dark') { document.documentElement.setAttribute('data-theme', 'dark'); }
  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    const icon = toggle.querySelector('i');
    if (document.documentElement.getAttribute('data-theme') === 'dark') {
      icon.className = 'fas fa-sun';
    }
    toggle.addEventListener('click', function() {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('meubelTheme', 'light');
        icon.className = 'fas fa-moon';
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('meubelTheme', 'dark');
        icon.className = 'fas fa-sun';
      }
    });
  }
}

// ========== SHARE PRODUCT ==========
function shareProduct(id, name) {
  const url = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '') + '/koleksi.html?kategori=' + id;
  const waText = 'Halo, saya tertarik dengan ' + name + ' — ' + url;
  if (navigator.share) {
    navigator.share({ title: name, text: name, url: url }).catch(function(){});
  } else {
    var textarea = document.createElement('textarea');
    textarea.value = waText;
    document.body.appendChild(textarea);
    textarea.select();
    try { document.execCommand('copy'); showToast('Link produk disalin!', 'success'); } catch(e) {}
    document.body.removeChild(textarea);
  }
  window.open('https://wa.me/6281325373999?text=' + encodeURIComponent(waText), '_blank');
}

// ========== ORDER HISTORY ==========
function getOrderHistory() {
  return JSON.parse(localStorage.getItem('meubelOrders')) || [];
}

function saveOrder(items, total) {
  const orders = getOrderHistory();
  orders.push({
    date: new Date().toISOString(),
    items: items,
    total: total
  });
  localStorage.setItem('meubelOrders', JSON.stringify(orders));
}

function renderOrderHistory(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const orders = getOrderHistory();
  if (!orders.length) {
    container.innerHTML = '<div class="order-history-wrap"><h3><i class="fas fa-history"></i> Riwayat Pesanan</h3><div class="order-empty">Belum ada riwayat pesanan</div></div>';
    return;
  }
  var html = '<div class="order-history-wrap"><h3><i class="fas fa-history"></i> Riwayat Pesanan <span class="order-count" style="font-size:12px;color:#888;font-weight:400">(' + orders.length + ')</span></h3>';
  orders.slice().reverse().forEach(function(o) {
    var d = new Date(o.date);
    var dateStr = d.toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
    html += '<div class="order-item"><div><div class="oi-date">' + dateStr + '</div><div class="oi-name">' + o.items.map(function(i) { return i.name + ' x' + i.qty; }).join(', ') + '</div></div><div class="oi-total">' + formatPrice(o.total) + '</div></div>';
  });
  html += '<button class="btn-clear" onclick="clearOrderHistory()"><i class="fas fa-trash"></i> Hapus semua riwayat</button></div>';
  container.innerHTML = html;
}

function clearOrderHistory() {
  if (confirm('Hapus semua riwayat pesanan?')) {
    localStorage.removeItem('meubelOrders');
    renderOrderHistory('orderHistoryContainer');
    showToast('Riwayat dihapus', 'error');
  }
}

// ========== UTILITY ==========
function formatPrice(num) {
  if (!num || num <= 0) return '';
  return 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

const shippingRates = {
  'banyumanik': { free: true, rate: 0, note: 'Gratis ongkir!' },
  'tembalang': { free: true, rate: 0, note: 'Gratis ongkir!' },
  'pedurungan': { free: true, rate: 0, note: 'Gratis ongkir!' },
  'gayamsari': { free: true, rate: 0, note: 'Gratis ongkir!' },
  'genuk': { free: true, rate: 0, note: 'Gratis ongkir!' },
  'semarang-timur': { free: false, rate: 25000, note: 'Ongkir Rp 25.000' },
  'semarang-barat': { free: false, rate: 30000, note: 'Ongkir Rp 30.000' },
  'semarang-utara': { free: false, rate: 30000, note: 'Ongkir Rp 30.000' },
  'semarang-selatan': { free: false, rate: 25000, note: 'Ongkir Rp 25.000' },
  'semarang-tengah': { free: false, rate: 20000, note: 'Ongkir Rp 20.000' },
  'mijen': { free: false, rate: 40000, note: 'Ongkir Rp 40.000' },
  'gunungpati': { free: false, rate: 35000, note: 'Ongkir Rp 35.000' },
  'ngaliyan': { free: false, rate: 35000, note: 'Ongkir Rp 35.000' },
  'tugu': { free: false, rate: 45000, note: 'Ongkir Rp 45.000' },
  'luar-kota': { free: false, rate: 0, note: 'Hubungi WA untuk info ongkir' }
};

function checkShipping() {
  const sel = document.getElementById('shipKecamatan');
  if (!sel || !sel.value) return;
  const val = sel.value;
  const data = shippingRates[val];
  const result = document.getElementById('shipResult');
  if (!result) return;
  if (data.free) {
    result.className = 'ship-result show free';
    result.innerHTML = '<div class="ship-amount">GRATIS</div><div class="ship-note"><i class="fas fa-check-circle"></i> ' + data.note + '</div>';
  } else if (data.rate > 0) {
    result.className = 'ship-result show paid';
    result.innerHTML = '<div class="ship-amount">' + formatPrice(data.rate) + '</div><div class="ship-note"><i class="fas fa-truck"></i> ' + data.note + '</div>';
  } else {
    result.className = 'ship-result show paid';
    result.innerHTML = '<div class="ship-note"><i class="fab fa-whatsapp"></i> ' + data.note + ' untuk info ongkir</div>';
  }
}

// ========== WISHLIST (localStorage) ==========
let wishlist = JSON.parse(localStorage.getItem('meubelWishlist')) || [];

function saveWishlist() {
  localStorage.setItem('meubelWishlist', JSON.stringify(wishlist));
  updateWishlistBadge();
}

function updateWishlistBadge() {
  document.querySelectorAll('.wishlist-badge').forEach(b => {
    b.textContent = wishlist.length;
    b.style.display = wishlist.length > 0 ? 'flex' : 'none';
  });
}

function toggleWishlist(btn, id) {
  const idx = wishlist.indexOf(id);
  if (idx > -1) {
    wishlist.splice(idx, 1);
    btn.classList.remove('active');
    btn.innerHTML = '<i class="far fa-heart"></i>';
    showToast('Dihapus dari wishlist', 'error');
  } else {
    wishlist.push(id);
    btn.classList.add('active');
    btn.innerHTML = '<i class="fas fa-heart"></i>';
    showToast('Ditambahkan ke wishlist', 'success');
  }
  saveWishlist();
}

function openWishlist() {
  if (typeof getProduct === 'undefined') {
    window.location.href = 'koleksi.html';
    return;
  }
  // Inject wishlist overlay styles if not present
  if (!document.getElementById('wlStyles')) {
    var s = document.createElement('style');
    s.id = 'wlStyles';
    s.textContent =
      '.wl-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;opacity:0;visibility:hidden;transition:all .3s}' +
      '.wl-overlay.open{opacity:1;visibility:visible}' +
      '.wl-sidebar{position:fixed;top:0;left:0;bottom:0;width:380px;max-width:90vw;background:#fff;transform:translateX(-100%);transition:transform .3s;display:flex;flex-direction:column}' +
      '.wl-overlay.open .wl-sidebar{transform:translateX(0)}' +
      '.wl-header{display:flex;justify-content:space-between;align-items:center;padding:20px 24px;border-bottom:1px solid #eee}' +
      '.wl-header h3{font-size:18px;font-weight:700;margin:0}' +
      '.wl-header button{width:32px;height:32px;border-radius:50%;border:none;background:#f5f5f5;font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#666}' +
      '.wl-body{flex:1;overflow-y:auto;padding:16px 24px}' +
      '.wl-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:#999;padding:40px 0}' +
      '.wl-empty i{font-size:48px;margin-bottom:12px}' +
      '.wl-item{display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f5f5f5}' +
      '.wl-item-name{font-size:14px;font-weight:600}' +
      '.wl-item .btn-sm{font-size:12px;padding:4px 12px}' +
      '@media(max-width:480px){.wl-sidebar{width:100vw;max-width:100vw}}' +
      '[data-theme="dark"] .wl-sidebar{background:#1a1a1a}' +
      '[data-theme="dark"] .wl-header{border-bottom-color:#333}' +
      '[data-theme="dark"] .wl-header button{background:#333;color:#aaa}' +
      '[data-theme="dark"] .wl-item{border-bottom-color:#222}' +
      '[data-theme="dark"] .wl-empty{color:#999}';
    document.head.appendChild(s);
  }

  let overlay = document.getElementById('wishlistOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'wl-overlay';
    overlay.id = 'wishlistOverlay';
    overlay.innerHTML =
      '<div class="wl-sidebar" id="wishlistSidebar">' +
        '<div class="wl-header"><h3>Wishlist</h3><button id="wishlistClose">&times;</button></div>' +
        '<div class="wl-body" id="wishlistBody"></div>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e) {
      if (e.target === this) closeWishlist();
    });
    document.getElementById('wishlistClose').addEventListener('click', closeWishlist);
  }
  renderWishlist();
  overlay.style.cssText = '';
  overlay.classList.add('open');
  document.getElementById('wishlistSidebar').style.transform = 'translateX(0)';
  document.body.style.overflow = 'hidden';
}

function closeWishlist() {
  const o = document.getElementById('wishlistOverlay');
  if (o) {
    o.classList.remove('open');
    const s = document.getElementById('wishlistSidebar');
    if (s) s.style.transform = 'translateX(-100%)';
    document.body.style.overflow = '';
  }
}

function renderWishlist() {
  const body = document.getElementById('wishlistBody');
  if (!wishlist.length) {
    body.innerHTML = '<div class="wl-empty"><i class="far fa-heart"></i><p>Wishlist masih kosong</p></div>';
    return;
  }
  let html = '';
  wishlist.forEach(id => {
    var data = typeof getProduct !== 'undefined' ? getProduct(id) : null;
    var name = data ? data.name : id;
    html +=
      '<div class="wl-item">' +
        '<span class="wl-item-name">' + name + '</span>' +
        '<div>' +
          '<a href="koleksi.html" class="btn btn-sm btn-outline" style="margin-right:6px">Lihat</a>' +
          '<button class="btn btn-sm btn-outline" onclick="removeWishlistItem(\'' + id + '\')"><i class="fas fa-trash"></i></button>' +
        '</div>' +
      '</div>';
  });
  body.innerHTML = html;
}

function removeWishlistItem(id) {
  const idx = wishlist.indexOf(id);
  if (idx > -1) {
    wishlist.splice(idx, 1);
    saveWishlist();
    document.querySelectorAll('.wishlist-btn').forEach(function(btn) {
      var card = btn.closest('.product-card');
      if (card && card.dataset.productId === id) {
        btn.classList.remove('active');
        btn.innerHTML = '<i class="far fa-heart"></i>';
      }
    });
    renderWishlist();
    showToast('Dihapus dari wishlist', 'error');
  }
}

// ========== TOAST ==========
function showToast(message, type) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const el = document.createElement('div');
  el.className = 'toast toast-' + (type || 'success');
  el.innerHTML = '<i class="fas ' + (type === 'error' ? 'fa-times-circle' : 'fa-check-circle') + '"></i> ' + message;
  container.appendChild(el);
  requestAnimationFrame(function () { el.classList.add('show'); });
  setTimeout(function () {
    el.classList.remove('show');
    setTimeout(function () { el.remove(); }, 400);
  }, 2500);
}

// ========== NAVBAR SCROLL ==========
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ========== SCROLL REVEAL ==========
function initScrollReveal() {
  const selectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger';
  const els = document.querySelectorAll(selectors);
  if (!els.length) return;
  const obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function (el) { obs.observe(el); });
}

// ========== EVENT DELEGATION ==========
document.addEventListener('click', function(e) {
  var wlBtn = e.target.closest('.wishlist-btn');
  if (wlBtn) {
    var card = wlBtn.closest('.product-card');
    if (card && card.dataset.productId) {
      toggleWishlist(wlBtn, card.dataset.productId);
    }
    return;
  }
});

// ========== DOM READY ==========
document.addEventListener('DOMContentLoaded', function () {
  initTheme();


  renderOrderHistory('orderHistoryContainer');

  document.querySelectorAll('.wishlist-btn').forEach(function (btn) {
    var card = btn.closest('.product-card');
    if (!card) return;
    var id = card.dataset.productId;
    if (wishlist.indexOf(id) > -1) {
      btn.classList.add('active');
      btn.innerHTML = '<i class="fas fa-heart"></i>';
    }
  });
  updateWishlistBadge();

  document.querySelectorAll('.nav-icons').forEach(function(container) {
    container.querySelectorAll('button').forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (btn.querySelector('.wishlist-badge')) openWishlist();
      });
    });
  });

  var toggle = document.querySelector('.menu-toggle');
  var navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      navLinks.classList.toggle('open');
      var icon = toggle.querySelector('i');
      icon.className = navLinks.classList.contains('open') ? 'fas fa-times' : 'fas fa-bars';
    });
    document.addEventListener('click', function (e) {
      if (navLinks.classList.contains('open') && !navLinks.contains(e.target) && !toggle.contains(e.target)) {
        navLinks.classList.remove('open');
        toggle.querySelector('i').className = 'fas fa-bars';
      }
    });
  }

  document.querySelectorAll('.faq-question').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = this.parentElement;
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function (f) { f.classList.remove('open'); });
      if (!isOpen) item.classList.add('open');
    });
  });

  var contactForm = document.querySelector('.contact-form-card form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      showToast('Pesan Anda telah dikirim! Kami akan menghubungi Anda segera.', 'success');
      this.reset();
    });
  }

  var newsForm = document.querySelector('.newsletter form');
  if (newsForm) {
    newsForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = this.querySelector('input');
      if (input.value.trim()) {
        showToast('Terima kasih! Anda telah berlangganan newsletter kami.', 'success');
        input.value = '';
      }
    });
  }

  initNavbarScroll();
  initScrollReveal();
});
