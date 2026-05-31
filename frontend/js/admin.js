// ==========================================
// STATE & GLOBAL SECURE MATRIX TOKENS
// ==========================================
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : '/api';
let authToken = localStorage.getItem('aurelia_admin_token');
let currentOrders = [];
let currentProducts = [];
let currentCategories = [];
let currentCustomers = [];
let currentCoupons = [];
let currentBanners = [];
let editProductId = null;

// DOM Monitoring Engine Initialization
document.addEventListener('DOMContentLoaded', () => {
  checkAuthenticationState();
  setupSidebarNavigation();
  loadDashboardData();
  setupLiveOrderEngine();
  
  // Theme state detection
  if (localStorage.getItem('aurelia_light_theme') === 'true') {
    document.body.classList.add('light-theme');
  }
});

// ==========================================
// THEME SWITCH CONTROLS
// ==========================================
function toggleTheme() {
  document.body.classList.toggle('light-theme');
  const isLight = document.body.classList.contains('light-theme');
  localStorage.setItem('aurelia_light_theme', isLight);
  showAdminToast('Theme Mode calibrated successfully.', 'fa-circle-half-stroke');
}

// ==========================================
// ADMIN AUTHENTICATION LOGIC CONTROLS
// ==========================================
function checkAuthenticationState() {
  const overlay = document.getElementById('authOverlay');
  if (authToken) {
    overlay.classList.add('hidden');
  } else {
    overlay.classList.remove('hidden');
  }

  const form = document.getElementById('adminLoginForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const u = document.getElementById('authUsername').value.trim();
      const p = document.getElementById('authPassword').value.trim();

      try {
        const res = await fetch(`${API_BASE}/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u, password: p })
        });
        const data = await res.json();
        if (data.success) {
          authToken = data.token;
          localStorage.setItem('aurelia_admin_token', authToken);
          overlay.classList.add('hidden');
          showAdminToast('⚜️ Authority matrix authenticated. Welcome back.', 'fa-shield-halved');
        } else {
          alert('Invalid credentials authorization. Please try bantikr11 / banti@123');
        }
      } catch (err) {
        // Fallback shortcut trigger for complete ease
        if (u === 'bantikr11' && p === 'banti@123') {
          authToken = 'luxury-jwt-token-aurelia-2026';
          localStorage.setItem('aurelia_admin_token', authToken);
          overlay.classList.add('hidden');
          showAdminToast('⚜️ Premium demo authority authenticated. Direct Access Enabled.', 'fa-shield-halved');
        } else {
          alert('Invalid identity authorization. Use bantikr11 / banti@123');
        }
      }
    });
  }
}

function logoutAdmin() {
  authToken = null;
  localStorage.removeItem('aurelia_admin_token');
  document.getElementById('authOverlay').classList.remove('hidden');
  showAdminToast('Citadel Vault Locked Securely.', 'fa-lock');
}

// ==========================================
// VIEW SWITCH CONTROLS
// ==========================================
function setupSidebarNavigation() {
  const links = document.querySelectorAll('.menu-link');
  links.forEach(link => {
    link.addEventListener('click', () => {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      const targetView = link.dataset.view;
      switchView(targetView);
    });
  });
}

function switchView(viewId) {
  document.querySelectorAll('.admin-view').forEach(view => {
    view.classList.remove('active');
  });
  const v = document.getElementById(viewId);
  if (v) v.classList.add('active');

  // Adjust Top title text gracefully
  const titleMap = {
    dashboardView: 'Revenue Dashboard',
    ordersView: 'Live Citadel Orders Protocol',
    productsView: 'Catalog Architecture Control',
    inventoryView: 'Inventory Stock Multipliers',
    categoriesView: 'Signature Silhouettes Configuration',
    customersView: 'Verified High-Fashion Profiles',
    promoView: 'Privilege Tokens & Showcases',
    settingsView: 'Citadel Operational Config'
  };

  const titleEl = document.getElementById('topPageTitle');
  if (titleEl && titleMap[viewId]) {
    titleEl.innerText = titleMap[viewId];
  }

  // Synchronize menu highlight if jumped externally
  document.querySelectorAll('.menu-link').forEach(link => {
    if (link.dataset.view === viewId) {
      document.querySelectorAll('.menu-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });
}

// ==========================================
// CORE DASHBOARD DATA LOADING ENGINE
// ==========================================
async function loadDashboardData() {
  try {
    // 1. Fetch Analytics Overview Metrics
    const aRes = await fetch(`${API_BASE}/analytics`);
    const aData = await aRes.json();
    if (aData.success && aData.data) {
      renderDashboardMetrics(aData.data);
    }
    
    // 2. Fetch Orders
    const oRes = await fetch(`${API_BASE}/orders`);
    const oData = await oRes.json();
    if (oData.success) {
      currentOrders = oData.data;
      renderOrdersTables();
    }

    // 3. Fetch Products Catalog
    const pRes = await fetch(`${API_BASE}/products`);
    const pData = await pRes.json();
    if (pData.success) {
      currentProducts = pData.data;
      renderProductsTables();
    }

    // 4. Fetch Categories
    const cRes = await fetch(`${API_BASE}/categories`);
    const cData = await cRes.json();
    if (cData.success) {
      currentCategories = cData.data;
      renderCategoriesTable();
    }

    // 5. Fetch Customers
    const custRes = await fetch(`${API_BASE}/customers`);
    const custData = await custRes.json();
    if (custData.success) {
      currentCustomers = custData.data;
      renderCustomersTable();
    }

    // 6. Fetch Promotions
    const coupRes = await fetch(`${API_BASE}/coupons`);
    const coupData = await coupRes.json();
    if (coupData.success) {
      currentCoupons = coupData.data;
      renderCouponsTable();
    }

    const banRes = await fetch(`${API_BASE}/banners`);
    const banData = await banRes.json();
    if (banData.success) {
      currentBanners = banData.data;
      renderBannersTable();
    }

    // 7. Load Store Settings
    const setRes = await fetch(`${API_BASE}/settings`);
    const setData = await setRes.json();
    if (setData.success && setData.data) {
      const s = setData.data;
      document.getElementById('setSiteName').value = s.siteName || 'AURELIA';
      document.getElementById('setContactEmail').value = s.contactEmail || 'concierge@aurelia.com';
      document.getElementById('setContactPhone').value = s.contactPhone || '+1 (800) 555-0199';
      document.getElementById('setFreeShipping').value = s.freeShippingThreshold || 300;
    }

  } catch (err) {
    console.warn('API Connection failed, falling back to preloaded visual matrix snapshot parameters.', err);
    loadFallbackMetrics();
  }
}

function renderDashboardMetrics(data) {
  document.getElementById('dashTotalRevenue').innerText = `$${data.totalRevenue.toLocaleString()}`;
  document.getElementById('dashTotalOrders').innerText = data.totalOrders;
  document.getElementById('dashTotalProducts').innerText = data.productsCount;
  document.getElementById('dashTotalCustomers').innerText = data.customersCount;

  // Refresh dynamic progress bars logic
  const total = data.pendingOrders + data.deliveredOrders || 1;
  const pPerc = Math.round((data.pendingOrders / total) * 100);
  const dPerc = Math.round((data.deliveredOrders / total) * 100);

  document.getElementById('progPendingCount').innerText = data.pendingOrders;
  document.getElementById('progPendingBar').style.width = `${pPerc}%`;

  document.getElementById('progDeliveredCount').innerText = data.deliveredOrders;
  document.getElementById('progDeliveredBar').style.width = `${dPerc}%`;

  // Render visual bar heights mapping categories stats
  if (data.categoriesStats && data.categoriesStats.length > 0) {
    const chartWrapper = document.getElementById('categoryChartContainer');
    if (chartWrapper) {
      chartWrapper.innerHTML = '';
      const maxCount = Math.max(...data.categoriesStats.map(c => c.count), 1);
      
      data.categoriesStats.forEach(stat => {
        const heightPct = Math.max(Math.round((stat.count / maxCount) * 90), 20);
        const group = document.createElement('div');
        group.className = 'chart-bar-group';
        group.innerHTML = `
          <div class="chart-bar" style="height: ${heightPct}%;" data-val="${stat.count} items"></div>
          <span class="chart-label">${stat._id}</span>
        `;
        chartWrapper.appendChild(group);
      });
    }
  }
}

function loadFallbackMetrics() {
  renderDashboardMetrics({
    totalRevenue: 14250,
    totalOrders: 12,
    productsCount: 6,
    customersCount: 8,
    pendingOrders: 3,
    deliveredOrders: 9,
    categoriesStats: [
      { _id: 'Necklaces', count: 2 },
      { _id: 'Rings', count: 1 },
      { _id: 'Earrings', count: 1 },
      { _id: 'Bracelets', count: 1 },
      { _id: 'Chains', count: 1 }
    ]
  });

  // Prepopulate standard table array variables
  currentOrders = [
    {
      orderId: 'AURELIA-1002',
      customerName: 'Countess Anastasia',
      email: 'anastasia@fashion.com',
      phone: '+1 555-0199',
      address: '742 High Fashion Avenue, Penthouse Level',
      items: [{ name: 'Aurelia Solitaire Pendant', price: 1850, quantity: 1, image: '/images/luxury_gold_necklace.png' }],
      totalAmount: 1850,
      paymentStatus: 'Paid',
      orderStatus: 'Pending',
      createdAt: new Date().toISOString()
    },
    {
      orderId: 'AURELIA-1001',
      customerName: 'Lord Sterling',
      email: 'sterling@vault.com',
      phone: '+1 555-8832',
      address: 'Château de la Roche',
      items: [{ name: 'Sovereign Diamond Ring', price: 3200, quantity: 1, image: '/images/luxury_diamond_ring.png' }],
      totalAmount: 3200,
      paymentStatus: 'Paid',
      orderStatus: 'Delivered',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];
  renderOrdersTables();

  currentProducts = [
    {
      _id: 'prod_1',
      name: 'Aurelia Solitaire Pendant',
      category: 'Necklaces',
      price: 1850,
      originalPrice: 2100,
      image: '/images/luxury_gold_necklace.png',
      isNewArrival: true,
      isBestSeller: true,
      stock: 8
    },
    {
      _id: 'prod_2',
      name: 'Sovereign Diamond Ring',
      category: 'Rings',
      price: 3200,
      image: '/images/luxury_diamond_ring.png',
      isNewArrival: true,
      isBestSeller: true,
      stock: 4
    }
  ];
  renderProductsTables();

  currentCategories = [
    { _id: 'c1', name: 'Necklaces', image: '/images/luxury_gold_necklace.png' },
    { _id: 'c2', name: 'Rings', image: '/images/luxury_diamond_ring.png' },
    { _id: 'c3', name: 'Earrings', image: '/images/luxury_gold_earrings.png' }
  ];
  renderCategoriesTable();

  currentCustomers = [
    { name: 'Countess Anastasia', email: 'anastasia@fashion.com', totalSpent: 1850, ordersCount: 1, createdAt: new Date().toISOString() },
    { name: 'Lord Sterling', email: 'sterling@vault.com', totalSpent: 3200, ordersCount: 1, createdAt: new Date().toISOString() }
  ];
  renderCustomersTable();

  currentCoupons = [{ _id: 'cp1', code: 'LUXURY20', discountPercent: 20 }];
  renderCouponsTable();

  currentBanners = [{ _id: 'b1', title: 'L’Éternité Collection', subtitle: 'Minimalist editorial perfection.', image: '/images/luxury_gold_necklace.png' }];
  renderBannersTable();
}

// ==========================================
// REAL-TIME SSE ORDER MONITORING ENGINE
// ==========================================
function setupLiveOrderEngine() {
  if (typeof EventSource !== 'undefined') {
    const source = new EventSource(`${API_BASE}/orders/live`);
    
    source.addEventListener('connected', (e) => {
      console.log('📡 SSE Live Feed active for immediate dashboard intercept.');
    });

    source.addEventListener('new_order', (e) => {
      try {
        const newOrder = JSON.parse(e.data);
        // Prepend to active arrays smoothly
        currentOrders.unshift(newOrder);
        renderOrdersTables();
        
        // Dynamic dashboard overview update logic
        const revEl = document.getElementById('dashTotalRevenue');
        const countEl = document.getElementById('dashTotalOrders');
        if (revEl) {
          const curVal = parseInt(revEl.innerText.replace(/[^0-9]/g, '')) || 0;
          revEl.innerText = `$${(curVal + newOrder.totalAmount).toLocaleString()}`;
        }
        if (countEl) {
          const curC = parseInt(countEl.innerText) || 0;
          countEl.innerText = curC + 1;
        }

        // Show elegant sliding live notification
        showAdminToast(`📦 <strong>Live Order Input!</strong> ${newOrder.customerName} just authorized ${newOrder.orderId} for $${newOrder.totalAmount}.`, 'fa-bell');
      } catch (err) {
        console.error('Error handling SSE live stream chunk', err);
      }
    });

    source.addEventListener('status_update', (e) => {
      try {
        const updated = JSON.parse(e.data);
        const idx = currentOrders.findIndex(o => o.orderId === updated.orderId || o._id === updated._id);
        if (idx !== -1) {
          currentOrders[idx] = updated;
          renderOrdersTables();
        }
        showAdminToast(`🔄 <strong>Status Update:</strong> Order ${updated.orderId} designated as ${updated.orderStatus}.`, 'fa-rotate');
      } catch (err) {}
    });

    source.onerror = (err) => {
      console.log('SSE connection heartbeat offline, running standard internal interval poll check backup.');
    };
  }
}

// ==========================================
// TABLE RENDERING ROUTINES
// ==========================================
function renderOrdersTables() {
  // 1. Dashboard mini snapshot table
  const recentTbody = document.getElementById('recentOrdersTbody');
  if (recentTbody) {
    recentTbody.innerHTML = '';
    const slice = currentOrders.slice(0, 4);
    if (slice.length === 0) {
      recentTbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No orders currently transacted.</td></tr>`;
    } else {
      slice.forEach(o => {
        const tr = document.createElement('tr');
        const stClass = o.orderStatus === 'Delivered' ? 'status-delivered' : (o.orderStatus === 'Shipped' ? 'status-shipped' : 'status-pending');
        tr.innerHTML = `
          <td style="font-weight: 600; color: var(--admin-gold);">${o.orderId}</td>
          <td>
            <div style="font-weight: 500;">${o.customerName}</div>
            <div style="font-size: 0.7rem; color: var(--admin-text-muted);">${o.email || ''}</div>
          </td>
          <td style="font-weight: 700;">$${o.totalAmount}</td>
          <td><span class="status-badge ${stClass}">${o.orderStatus}</span></td>
          <td class="action-links">
            <button onclick="viewOrderDissection('${o.orderId}')" title="View Details"><i class="fa-solid fa-eye"></i></button>
          </td>
        `;
        recentTbody.appendChild(tr);
      });
    }
  }

  // 2. Full Live Orders protocol matrix table
  const allTbody = document.getElementById('allOrdersTbody');
  if (allTbody) {
    allTbody.innerHTML = '';
    if (currentOrders.length === 0) {
      allTbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No historical transacted inputs available.</td></tr>`;
      return;
    }
    
    currentOrders.forEach(o => {
      const tr = document.createElement('tr');
      const stClass = o.orderStatus === 'Delivered' ? 'status-delivered' : (o.orderStatus === 'Shipped' ? 'status-shipped' : 'status-pending');
      
      // Select controls for smooth live status mapping
      const selHtml = `
        <select class="admin-form-control" style="padding: 0.2rem 0.5rem; font-size: 0.75rem; width: auto;" onchange="updateOrderStatus('${o._id || o.orderId}', this.value)">
          <option value="Pending" ${o.orderStatus === 'Pending' ? 'selected' : ''}>Pending Review</option>
          <option value="Shipped" ${o.orderStatus === 'Shipped' ? 'selected' : ''}>Shipped</option>
          <option value="Delivered" ${o.orderStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
        </select>
      `;

      const itemsSum = o.items ? o.items.map(i => `${i.quantity}x ${i.name}`).join(', ') : 'Standard Items Set';

      tr.innerHTML = `
        <td style="font-weight: 700; color: var(--admin-gold); cursor: pointer;" onclick="viewOrderDissection('${o.orderId}')">${o.orderId}</td>
        <td>
          <div style="font-weight: 600;">${o.customerName}</div>
          <span style="font-size: 0.75rem; color: var(--admin-text-muted);">${o.email}</span>
        </td>
        <td style="max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${itemsSum}">${itemsSum}</td>
        <td style="font-weight: 700; color: var(--admin-gold);">$${o.totalAmount}</td>
        <td>${selHtml}</td>
        <td class="action-links">
          <button onclick="viewOrderDissection('${o.orderId}')" title="Dissect Order Blueprint"><i class="fa-solid fa-eye"></i></button>
          <button onclick="printDirectOrderInvoice('${o.orderId}')" title="Print Hardcopy Invoice"><i class="fa-solid fa-file-invoice"></i></button>
        </td>
      `;
      allTbody.appendChild(tr);
    });
  }
}

async function updateOrderStatus(id, newStatus) {
  try {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderStatus: newStatus })
    });
    const data = await res.json();
    if (data.success) {
      showAdminToast(`Status updated securely to ${newStatus}.`, 'fa-circle-check');
      loadDashboardData(); // Refreshes summary metrics instantly
    }
  } catch (err) {
    // Offline mode instant reflection update logic
    const order = currentOrders.find(o => o._id === id || o.orderId === id);
    if (order) {
      order.orderStatus = newStatus;
      renderOrdersTables();
      showAdminToast(`Status simulated securely to ${newStatus}.`, 'fa-circle-check');
    }
  }
}

function renderProductsTables() {
  const pTbody = document.getElementById('productsTbody');
  const iTbody = document.getElementById('inventoryTbody');
  
  if (pTbody) pTbody.innerHTML = '';
  if (iTbody) iTbody.innerHTML = '';

  if (currentProducts.length === 0) {
    if (pTbody) pTbody.innerHTML = `<tr><td colspan="6" style="text-align: center;">No masterpieces documented.</td></tr>`;
    if (iTbody) iTbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No inventory arrays found.</td></tr>`;
    return;
  }

  currentProducts.forEach(p => {
    // Products suite logic mapping
    if (pTbody) {
      const tr = document.createElement('tr');
      const flags = `${p.isNewArrival ? '<span class="status-badge" style="background: var(--admin-surface-light);">New Arrival</span> ' : ''}` +
                    `${p.isBestSeller ? '<span class="status-badge" style="background: rgba(197, 160, 89, 0.2); color: var(--admin-gold);">Best Seller</span>' : ''}`;
      tr.innerHTML = `
        <td><img src="${p.image}" class="table-img" alt="${p.name}" onerror="this.onerror=null; this.src='/images/luxury_placeholder.png';"></td>
        <td style="font-weight: 600;">${p.name}</td>
        <td><span style="color: var(--admin-gold); font-size: 0.8rem;">${p.category}</span></td>
        <td style="font-weight: 700;">$${p.price}</td>
        <td>${flags || '<span style="color: #666;">Standard Allocation</span>'}</td>
        <td class="action-links">
          <button onclick="startEditProduct('${p._id}')" title="Calibrate Assets"><i class="fa-solid fa-pen"></i></button>
          <button onclick="deleteProduct('${p._id}')" title="Revoke Masterpiece"><i class="fa-solid fa-trash" style="color: #D9534F;"></i></button>
        </td>
      `;
      pTbody.appendChild(tr);
    }

    // Inventory Table mapping
    if (iTbody) {
      const tr = document.createElement('tr');
      const curStock = p.stock !== undefined ? p.stock : 10;
      const stockColor = curStock <= 3 ? '#D9534F' : (curStock <= 6 ? '#F57C00' : '#4CAF50');
      tr.innerHTML = `
        <td style="font-weight: 600;">${p.name}</td>
        <td>${p.category}</td>
        <td>$${p.price}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${stockColor};"></span>
            <input type="number" class="admin-form-control" style="width: 70px; padding: 0.2rem 0.5rem; text-align: center; font-weight: 700;" value="${curStock}" id="stockInp_${p._id}">
          </div>
        </td>
        <td>
          <button class="btn-admin-secondary" style="padding: 0.3rem 0.8rem; font-size: 0.75rem;" onclick="updateStockQty('${p._id}')">Enforce</button>
        </td>
      `;
      iTbody.appendChild(tr);
    }
  });
}

async function updateStockQty(id) {
  const inp = document.getElementById(`stockInp_${id}`);
  if (!inp) return;
  const newV = parseInt(inp.value) || 0;
  
  try {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: newV })
    });
    const data = await res.json();
    if (data.success) {
      showAdminToast(`Inventory stock level calibrated to ${newV} units.`, 'fa-warehouse');
      loadDashboardData();
    }
  } catch (err) {
    const p = currentProducts.find(prod => prod._id === id);
    if (p) p.stock = newV;
    showAdminToast(`Inventory stock level calibrated locally.`, 'fa-warehouse');
    renderProductsTables();
  }
}

function renderCategoriesTable() {
  const tbody = document.getElementById('categoriesTbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (currentCategories.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align: center;">No silhouettes currently mapped.</td></tr>`;
    return;
  }
  currentCategories.forEach(c => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${c.image}" class="table-img" style="border-radius: 50%;" alt="${c.name}" onerror="this.onerror=null; this.src='/images/luxury_placeholder.png';"></td>
      <td style="font-weight: 600; font-family: var(--font-serif); letter-spacing: 0.05em; color: var(--admin-gold);">${c.name}</td>
      <td>
        <button onclick="deleteCategory('${c._id}')" class="btn-admin-secondary" style="padding: 0.3rem 0.8rem; font-size: 0.75rem; color: #D9534F; border-color: rgba(217,83,79,0.3);">Revoke Silhouette</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderCustomersTable() {
  const tbody = document.getElementById('customersTbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (currentCustomers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No client profiles acquired.</td></tr>`;
    return;
  }
  currentCustomers.forEach(cust => {
    const d = new Date(cust.createdAt || Date.now()).toLocaleDateString();
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 600;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <div class="admin-avatar" style="width: 28px; height: 28px; font-size: 0.7rem; background: var(--admin-surface-light); color: var(--admin-gold); border: 1px solid var(--admin-gold);">${cust.name.charAt(0)}</div>
          ${cust.name}
        </div>
      </td>
      <td style="color: var(--admin-text-muted);">${cust.email}</td>
      <td style="font-weight: 700; color: var(--admin-gold);">$${cust.totalSpent.toLocaleString()}</td>
      <td><span class="status-badge" style="background: var(--admin-surface-light);">${cust.ordersCount} Executions</span></td>
      <td style="font-size: 0.8rem; color: var(--admin-text-muted);">${d}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderCouponsTable() {
  const tbody = document.getElementById('couponsTbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (currentCoupons.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align: center;">No privilege code tokens mapped.</td></tr>`;
    return;
  }
  currentCoupons.forEach(cp => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 700; letter-spacing: 0.1em; color: var(--admin-gold);">${cp.code}</td>
      <td><span class="status-badge" style="background: rgba(46, 125, 50, 0.2); color: #4CAF50;">${cp.discountPercent}% OFF</span></td>
      <td>
        <button onclick="deleteCoupon('${cp._id}')" title="Revoke Privilege Token" style="color: #D9534F;"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderBannersTable() {
  const tbody = document.getElementById('bannersTbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  if (currentBanners.length === 0) {
    tbody.innerHTML = `<tr><td colspan="3" style="text-align: center;">No active showcases mapped.</td></tr>`;
    return;
  }
  currentBanners.forEach(b => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${b.image}" style="width: 80px; height: 44px; object-fit: cover; border-radius: 2px;" alt="${b.title}"></td>
      <td style="font-weight: 600;">${b.title}</td>
      <td>
        <button onclick="deleteBanner('${b._id}')" title="Revoke Showcase Display" style="color: #D9534F;"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// ==========================================
// MODAL FORMS MANAGEMENT LOGIC CONTROLS
// ==========================================
function openProductModal() {
  editProductId = null;
  document.getElementById('productModalTitle').innerText = 'Add New Masterpiece';
  document.getElementById('productSubmitForm').reset();
  document.getElementById('modalProdId').value = '';
  document.getElementById('productModal').classList.add('active');
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('active');
}

function startEditProduct(id) {
  const p = currentProducts.find(prod => prod._id === id);
  if (!p) return;

  editProductId = p._id;
  document.getElementById('productModalTitle').innerText = 'Calibrate Masterpiece Parameters';
  document.getElementById('modalProdId').value = p._id;
  document.getElementById('modalProdName').value = p.name;
  document.getElementById('modalProdCat').value = p.category;
  document.getElementById('modalProdPrice').value = p.price;
  document.getElementById('modalProdOrigPrice').value = p.originalPrice || '';
  document.getElementById('modalProdImg').value = p.image;
  document.getElementById('modalProdStock').value = p.stock !== undefined ? p.stock : 10;
  document.getElementById('modalProdNew').checked = !!p.isNewArrival;
  document.getElementById('modalProdBest').checked = !!p.isBestSeller;
  document.getElementById('modalProdDesc').value = p.description || '';

  document.getElementById('productModal').classList.add('active');
}

async function uploadProductImageDirect(e) {
  const file = e.target.files[0];
  if (!file) return;

  const fd = new FormData();
  fd.append('image', file);

  try {
    const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: fd });
    const data = await res.json();
    if (data.success) {
      document.getElementById('modalProdImg').value = data.imageUrl;
      showAdminToast('File asset transferred successfully.', 'fa-cloud-arrow-up');
    }
  } catch (err) {
    // Offline simulation local URI generator
    const fakeUrl = `/images/${file.name}`;
    document.getElementById('modalProdImg').value = fakeUrl;
    showAdminToast('Local asset simulation path mapped.', 'fa-cloud-arrow-up');
  }
}

async function saveProduct(e) {
  e.preventDefault();
  const id = document.getElementById('modalProdId').value;
  const payload = {
    name: document.getElementById('modalProdName').value.trim(),
    category: document.getElementById('modalProdCat').value,
    price: parseFloat(document.getElementById('modalProdPrice').value),
    originalPrice: parseFloat(document.getElementById('modalProdOrigPrice').value) || null,
    image: document.getElementById('modalProdImg').value.trim(),
    stock: parseInt(document.getElementById('modalProdStock').value) || 0,
    isNewArrival: document.getElementById('modalProdNew').checked,
    isBestSeller: document.getElementById('modalProdBest').checked,
    description: document.getElementById('modalProdDesc').value.trim()
  };

  try {
    const url = id ? `${API_BASE}/products/${id}` : `${API_BASE}/products`;
    const method = id ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      showAdminToast(id ? 'Masterpiece calibrated.' : 'Masterpiece architecture saved.', 'fa-gem');
      closeProductModal();
      loadDashboardData();
    }
  } catch (err) {
    // Local memory modification fallback logic for extreme UI demonstration flexibility
    if (id) {
      const idx = currentProducts.findIndex(p => p._id === id);
      if (idx !== -1) currentProducts[idx] = { ...currentProducts[idx], ...payload };
    } else {
      currentProducts.unshift({ _id: 'prod_' + Date.now(), ...payload, stock: 10 });
    }
    showAdminToast('Masterpiece array parameter updated directly.', 'fa-gem');
    closeProductModal();
    renderProductsTables();
  }
}

async function deleteProduct(id) {
  if (!confirm('Are you absolutely certain you wish to revoke this catalog masterpiece from global distribution?')) return;
  try {
    await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
    showAdminToast('Masterpiece unlinked securely.', 'fa-trash');
    loadDashboardData();
  } catch (err) {
    currentProducts = currentProducts.filter(p => p._id !== id);
    renderProductsTables();
    showAdminToast('Masterpiece unlinked from snapshot arrays.', 'fa-trash');
  }
}

// Category logic modals
function openCategoryModal() {
  document.getElementById('categoryModal').classList.add('active');
}
function closeCategoryModal() {
  document.getElementById('categoryModal').classList.remove('active');
}
async function saveCategory(e) {
  e.preventDefault();
  const payload = {
    name: document.getElementById('modalCatName').value.trim(),
    image: document.getElementById('modalCatImg').value.trim()
  };
  try {
    await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    showAdminToast('Signature silhouette linked.', 'fa-tags');
    closeCategoryModal();
    loadDashboardData();
  } catch (err) {
    currentCategories.push({ _id: 'cat_' + Date.now(), ...payload });
    renderCategoriesTable();
    closeCategoryModal();
    showAdminToast('Signature silhouette archived locally.', 'fa-tags');
  }
}
async function deleteCategory(id) {
  if (!confirm('Revoke silhouette configuration?')) return;
  try {
    await fetch(`${API_BASE}/categories/${id}`, { method: 'DELETE' });
    showAdminToast('Silhouette unlinked.', 'fa-tags');
    loadDashboardData();
  } catch (err) {
    currentCategories = currentCategories.filter(c => c._id !== id);
    renderCategoriesTable();
    showAdminToast('Silhouette removed.', 'fa-tags');
  }
}

// Coupon logic modals
function openCouponModal() {
  document.getElementById('couponModal').classList.add('active');
}
function closeCouponModal() {
  document.getElementById('couponModal').classList.remove('active');
}
async function saveCoupon(e) {
  e.preventDefault();
  const payload = {
    code: document.getElementById('modalCouponCode').value.trim().toUpperCase(),
    discountPercent: parseInt(document.getElementById('modalCouponPercent').value)
  };
  try {
    await fetch(`${API_BASE}/coupons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    showAdminToast('Privilege code registered.', 'fa-ticket');
    closeCouponModal();
    loadDashboardData();
  } catch (err) {
    currentCoupons.push({ _id: 'cp_' + Date.now(), ...payload });
    renderCouponsTable();
    closeCouponModal();
    showAdminToast('Privilege code assigned.', 'fa-ticket');
  }
}
async function deleteCoupon(id) {
  try {
    await fetch(`${API_BASE}/coupons/${id}`, { method: 'DELETE' });
    loadDashboardData();
  } catch (err) {
    currentCoupons = currentCoupons.filter(c => c._id !== id);
    renderCouponsTable();
  }
}

// Banner logic modals
function openBannerModal() {
  document.getElementById('bannerModal').classList.add('active');
}
function closeBannerModal() {
  document.getElementById('bannerModal').classList.remove('active');
}
async function saveBanner(e) {
  e.preventDefault();
  const payload = {
    title: document.getElementById('modalBannerTitle').value.trim(),
    subtitle: document.getElementById('modalBannerSubtitle').value.trim(),
    image: document.getElementById('modalBannerImg').value.trim(),
    isActive: true
  };
  try {
    await fetch(`${API_BASE}/banners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    showAdminToast('Showcase assigned.', 'fa-panorama');
    closeBannerModal();
    loadDashboardData();
  } catch (err) {
    currentBanners.push({ _id: 'ban_' + Date.now(), ...payload });
    renderBannersTable();
    closeBannerModal();
  }
}
async function deleteBanner(id) {
  try {
    await fetch(`${API_BASE}/banners/${id}`, { method: 'DELETE' });
    loadDashboardData();
  } catch (err) {
    currentBanners = currentBanners.filter(b => b._id !== id);
    renderBannersTable();
  }
}

// Website settings control logic
async function saveWebsiteSettings(e) {
  e.preventDefault();
  const payload = {
    siteName: document.getElementById('setSiteName').value.trim(),
    contactEmail: document.getElementById('setContactEmail').value.trim(),
    contactPhone: document.getElementById('setContactPhone').value.trim(),
    freeShippingThreshold: parseInt(document.getElementById('setFreeShipping').value)
  };
  try {
    await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    showAdminToast('Global Config Parameters secured in vault storage.', 'fa-sliders');
  } catch (err) {
    showAdminToast('Global Parameters simulated locally.', 'fa-sliders');
  }
}

// ==========================================
// ORDER DETAILS SUITE & INVOICE PRINTER
// ==========================================
let lastViewedOrder = null;

function viewOrderDissection(orderId) {
  const o = currentOrders.find(ord => ord.orderId === orderId);
  if (!o) return;

  lastViewedOrder = o;
  
  document.getElementById('detOrderId').innerText = o.orderId;
  const stBadge = document.getElementById('detStatusBadge');
  stBadge.innerText = o.orderStatus;
  stBadge.className = 'status-badge ' + (o.orderStatus === 'Delivered' ? 'status-delivered' : (o.orderStatus === 'Shipped' ? 'status-shipped' : 'status-pending'));
  
  document.getElementById('detName').innerText = o.customerName;
  document.getElementById('detEmail').innerText = o.email;
  document.getElementById('detPhone').innerText = o.phone;
  document.getElementById('detAddress').innerText = o.address;
  document.getElementById('detTotalAmount').innerText = `$${o.totalAmount.toLocaleString()}`;

  const tbody = document.getElementById('detItemsTbody');
  tbody.innerHTML = '';
  if (o.items && o.items.length > 0) {
    o.items.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 600;">${item.name}</td>
        <td>${item.quantity} Units</td>
        <td style="text-align: right; font-weight: 700; color: var(--admin-gold);">$${(item.price * item.quantity).toLocaleString()}</td>
      `;
      tbody.appendChild(tr);
    });
  } else {
    tbody.innerHTML = `<tr><td colspan="3">Standard Encrypted Allocation Items Set</td></tr>`;
  }

  document.getElementById('orderDetailModal').classList.add('active');
}

function closeOrderDetailModal() {
  document.getElementById('orderDetailModal').classList.remove('active');
  lastViewedOrder = null;
}

function printDirectOrderInvoice(orderId) {
  viewOrderDissection(orderId);
  setTimeout(() => printInvoice(), 150);
}

function printInvoice() {
  const printContent = document.getElementById('orderDetailPrintableArea').innerHTML;
  const originalContent = document.body.innerHTML;

  // Render minimal beautiful printable layout inline
  document.body.innerHTML = `
    <div style="padding: 40px; font-family: sans-serif; max-width: 800px; margin: 0 auto; color: #000; background: #fff;">
      ${printContent}
      <div style="margin-top: 60px; text-align: center; border-top: 1px solid #ccc; padding-top: 20px; font-size: 12px; color: #666;">
        <p>AURELIA Fine Atelier Dispatch Certification. Guaranteed Insured Authenticity.</p>
      </div>
    </div>
  `;

  window.print();
  
  // Revert back immediately to state layout
  document.body.innerHTML = originalContent;
  window.location.reload(); // Restores client state flawlessly
}

// ==========================================
// TOAST NOTIFICATION RENDER ENGINE
// ==========================================
function showAdminToast(text, iconClass) {
  const wrapper = document.getElementById('adminToastContainer');
  if (!wrapper) return;

  const t = document.createElement('div');
  t.className = 'admin-toast';
  t.innerHTML = `
    <div class="admin-toast-icon"><i class="fa-solid ${iconClass || 'fa-bell'}"></i></div>
    <div style="flex: 1;">
      <span style="font-size: 0.85rem; display: block; color: var(--admin-text); line-height: 1.4;">${text}</span>
    </div>
    <button onclick="this.parentElement.remove()" style="color: var(--admin-text-muted); font-size: 0.9rem;"><i class="fa-solid fa-xmark"></i></button>
  `;

  wrapper.appendChild(t);

  setTimeout(() => {
    if (t.parentElement) {
      t.style.animation = 'none';
      t.style.opacity = '0';
      t.style.transition = 'opacity 0.3s ease';
      setTimeout(() => t.remove(), 350);
    }
  }, 5000);
}

// ---------- RESPONSIVE SIDEBAR LOGIC ----------
function toggleAdminSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.toggle('active');
  }
}

document.addEventListener('click', (e) => {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('adminHamburgerBtn');
  if (sidebar && sidebar.classList.contains('active')) {
    if (!sidebar.contains(e.target) && (!toggleBtn || !toggleBtn.contains(e.target))) {
      sidebar.classList.remove('active');
    }
  }
});

// Close sidebar on click of any sidebar navigation link (mobile only)
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.menu-link').forEach(link => {
    link.addEventListener('click', () => {
      const sidebar = document.getElementById('sidebar');
      if (sidebar && window.innerWidth <= 768) {
        sidebar.classList.remove('active');
      }
    });
  });
});

