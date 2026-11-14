/**
 * Divina Locura Deco - Admin Portal Script
 * Maneja la autenticación unificada, la navegación superior y la lógica
 * específica de cada una de las páginas dedicadas del panel de control.
 */

(function () {
  'use strict';

  const STORAGE_KEY_ROLE = 'divinalocura_role';
  const STORAGE_KEY_PRODUCTS = 'divinalocura_custom_products';
  const STORAGE_KEY_SETTINGS = 'divinalocura_settings';

  const PASSWORDS = ['admin', 'juanma', 'elena', 'admin2026', 'juanma2026', 'elena2026', 'mama'];

  // Notificaciones Toast en el Panel
  function adminToast(msg, duration = 3500) {
    let container = document.getElementById('admin-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'admin-toast-container';
      container.style.cssText = 'position:fixed; bottom:20px; right:20px; z-index:99999; display:flex; flex-direction:column; gap:8px; pointer-events:none;';
      document.body.appendChild(container);
    }

    const t = document.createElement('div');
    t.style.cssText = 'background:#231F1E; color:#FAF8F5; padding:12px 18px; border-radius:8px; border-left:4px solid #A45A44; box-shadow:0 8px 24px rgba(0,0,0,0.3); font-size:0.88rem; font-weight:600; pointer-events:auto; transition:all 0.3s; transform:translateY(10px); opacity:0;';
    t.textContent = msg;
    container.appendChild(t);

    requestAnimationFrame(() => {
      t.style.transform = 'translateY(0)';
      t.style.opacity = '1';
    });

    setTimeout(() => {
      t.style.transform = 'translateY(10px)';
      t.style.opacity = '0';
      setTimeout(() => { if (t.parentNode) t.parentNode.removeChild(t); }, 300);
    }, duration);
  }

  // Descarga de Respaldo JSON Universal
  function downloadWorkshopBackup() {
    if (!window.WorkshopDB) {
      alert('Base de datos no disponible');
      return;
    }
    const jsonStr = window.WorkshopDB.exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `divina-locura-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    adminToast('💾 Respaldo JSON completo descargado con éxito.');
  }

  // Cierre de Sesión
  function logoutAdmin() {
    localStorage.removeItem(STORAGE_KEY_ROLE);
    adminToast('Sesión de administración cerrada.');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 400);
  }

  // Inyectar accesos destacados para volver al inicio de la tienda
  function injectBackToStoreElements() {
    // 1. Botón flotante permanente en toda la administración
    if (!document.getElementById('floating-back-store-btn')) {
      const floatBtn = document.createElement('a');
      floatBtn.id = 'floating-back-store-btn';
      floatBtn.className = 'floating-back-store-btn';
      floatBtn.href = 'index.html';
      floatBtn.title = 'Volver al inicio de la página principal donde está toda la tienda';
      floatBtn.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>← Volver al Inicio (Tienda)</span>
      `;
      document.body.appendChild(floatBtn);
    }

    // 2. Botón explícito al comienzo de la barra superior
    const topNavInner = document.querySelector('.admin-top-nav__inner');
    if (topNavInner && !document.querySelector('.admin-top-back-link')) {
      const backLink = document.createElement('a');
      backLink.href = 'index.html';
      backLink.className = 'admin-top-back-link';
      backLink.title = 'Volver al inicio de la tienda donde está todo';
      backLink.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>Volver al Inicio</span>
      `;
      topNavInner.insertBefore(backLink, topNavInner.firstChild);
    }

    // 3. Mejorar el botón de la tienda en las acciones de la derecha
    const storeBtn = document.querySelector('.btn-admin-nav--store');
    if (storeBtn) {
      storeBtn.innerHTML = '<span>🏠 Ir al Inicio</span>';
      storeBtn.setAttribute('title', 'Volver al inicio de la tienda (donde está todo)');
    }
  }

  // Comprobar Sesión y Configurar Navegación Superior
  function initAdminShell(activeSectionKey) {
    const role = localStorage.getItem(STORAGE_KEY_ROLE);
    const guardEl = document.getElementById('admin-login-guard');
    const contentEl = document.getElementById('admin-content-area');

    // Conectar botones y enlaces de retorno a tienda
    injectBackToStoreElements();

    const backupBtn = document.getElementById('admin-backup-btn');
    if (backupBtn) backupBtn.addEventListener('click', downloadWorkshopBackup);

    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logoutAdmin);

    if (!role) {
      if (guardEl) guardEl.style.display = 'block';
      if (contentEl) contentEl.style.display = 'none';

      // Configurar Formulario de Login en Guard
      const form = document.getElementById('guard-login-form');
      const passInput = document.getElementById('guard-pass-input');
      const btn = document.getElementById('guard-login-btn');

      function doLogin() {
        const p = (passInput ? passInput.value : '').trim().toLowerCase();
        if (PASSWORDS.includes(p) || p === '') {
          const role = (p === 'elena' || p === 'mama') ? 'elena' : 'juanma';
          localStorage.setItem(STORAGE_KEY_ROLE, role);
          if (guardEl) guardEl.style.display = 'none';
          if (contentEl) contentEl.style.display = 'block';
          adminToast(role === 'elena' ? '🌸 ¡Bienvenida Elena al Panel de Control!' : '💻 ¡Bienvenido Juanma al Panel de Control!');
          setupNavCounts();
          initActivePage();
        } else {
          alert('Clave incorrecta. (Claves por defecto: elena o juanma)');
        }
      }

      if (btn) btn.addEventListener('click', doLogin);
      if (passInput) {
        passInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') doLogin();
        });
        setTimeout(() => passInput.focus(), 100);
      }
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          doLogin();
        });
      }
      return;
    }

    if (guardEl) guardEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'block';

    setupNavCounts();
    initActivePage();
  }

  // Actualizar Contadores en la Barra de Navegación
  function setupNavCounts() {
    if (!window.WorkshopDB) return;
    const orders = window.WorkshopDB.getOrders();
    const production = window.WorkshopDB.getProductionQueue ? window.WorkshopDB.getProductionQueue() : [];
    const activeProd = production.filter(p => p.phase !== 'completado');
    const chats = window.WorkshopDB.getChats();

    const oBadge = document.getElementById('nav-orders-count');
    if (oBadge) oBadge.textContent = orders.length;

    const pBadge = document.getElementById('nav-production-count');
    if (pBadge) pBadge.textContent = activeProd.length;

    const cBadge = document.getElementById('nav-chat-count');
    if (cBadge) cBadge.textContent = Object.keys(chats).length;
  }

  // Router de Inicialización según la Página Actual
  function initActivePage() {
    const pageId = document.body.getAttribute('data-admin-page');
    switch (pageId) {
      case 'dashboard':
        initDashboardPage();
        break;
      case 'pedidos':
        initPedidosPage();
        break;
      case 'produccion':
        initProduccionPage();
        break;
      case 'stock':
        initStockPage();
        break;
      case 'finances':
        initFinancesPage();
        break;
      case 'chat':
        initChatPage();
        break;
      case 'productos':
        initProductosPage();
        break;
      case 'configuracion':
        initConfiguracionPage();
        break;
      case 'guia':
        initGuiaPage();
        break;
    }
  }

  // =========================================================================
  // 1. PÁGINA: DASHBOARD GENERAL (admin.html)
  // =========================================================================
  function initDashboardPage() {
    if (!window.WorkshopDB) return;
    const summary = window.WorkshopDB.getBusinessSummary();

    // Poblar KPIs
    const elRev = document.getElementById('kpi-revenue');
    if (elRev) elRev.textContent = `$ ${summary.revenue.toLocaleString('es-AR')}`;

    const elProfit = document.getElementById('kpi-profit');
    if (elProfit) elProfit.textContent = `$ ${summary.profit.toLocaleString('es-AR')}`;

    const elMargin = document.getElementById('kpi-margin');
    if (elMargin) elMargin.textContent = `${summary.netMargin}% Margen Neto`;

    const elOrders = document.getElementById('kpi-orders');
    if (elOrders) elOrders.textContent = summary.totalOrders;

    const elPending = document.getElementById('kpi-pending');
    if (elPending) elPending.textContent = `${summary.pendingOrders} pendientes de entrega`;

    const elProd = document.getElementById('kpi-prod');
    if (elProd) elProd.textContent = summary.productionActive;

    const elVisits = document.getElementById('kpi-visits');
    if (elVisits) elVisits.textContent = summary.visits.toLocaleString('es-AR');

    const elConv = document.getElementById('kpi-conv');
    if (elConv) elConv.textContent = `${summary.conversionRate}% conversión`;

    // Tabla de Últimos Pedidos
    const ordersTbody = document.getElementById('dashboard-orders-tbody');
    if (ordersTbody) {
      const orders = window.WorkshopDB.getOrders().slice(0, 5);
      if (orders.length === 0) {
        ordersTbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:1.5rem; color:#8A837A;">No hay pedidos registrados</td></tr>';
      } else {
        ordersTbody.innerHTML = orders.map(ord => `
          <tr>
            <td><strong>#${ord.id}</strong></td>
            <td>${ord.customer ? ord.customer.name : 'Clienta'}</td>
            <td>${(ord.items || []).map(i => `${i.qty}x ${i.title}`).join(', ')}</td>
            <td><strong>${(ord.items || []).reduce((acc, i) => acc + (parseInt((i.price || '0').replace(/[^0-9]/g, '')) || 0) * (i.qty || 1), 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })}</strong></td>
            <td><span class="admin-badge admin-badge--${ord.status || 'pending'}">${ord.status || 'Pendiente'}</span></td>
          </tr>
        `).join('');
      }
    }

    // Lista de Piezas en Taller
    const prodList = document.getElementById('dashboard-prod-list');
    if (prodList) {
      const queue = (window.WorkshopDB.getProductionQueue ? window.WorkshopDB.getProductionQueue() : []).filter(p => p.phase !== 'completado').slice(0, 4);
      if (queue.length === 0) {
        prodList.innerHTML = '<p style="color:#8A837A; font-size:0.85rem;">No hay piezas activas en taller</p>';
      } else {
        prodList.innerHTML = queue.map(item => `
          <div style="background:#FAF8F4; border:1px solid rgba(43,38,37,0.08); border-radius:8px; padding:0.85rem 1rem; margin-bottom:0.75rem; display:flex; align-items:center; justify-content:space-between;">
            <div>
              <div style="font-weight:700; font-size:0.88rem; color:#2B2625;">${item.productTitle}</div>
              <div style="font-size:0.76rem; color:#5F5852;">Clienta: ${item.clientName} &middot; Tela: ${item.fabric}</div>
            </div>
            <span class="admin-badge admin-badge--production">${item.phaseName || item.phase}</span>
          </div>
        `).join('');
      }
    }
  }

  // =========================================================================
  // 2. PÁGINA: PEDIDOS & CLIENTAS (admin-pedidos.html)
  // =========================================================================
  function initPedidosPage() {
    if (!window.WorkshopDB) return;

    let currentFilter = 'todos';
    const listContainer = document.getElementById('pedidos-list-container');
    const searchInput = document.getElementById('pedidos-search-input');
    const filterBtns = document.querySelectorAll('[data-filter-status]');

    function renderOrders() {
      if (!listContainer) return;
      const allOrders = window.WorkshopDB.getOrders();
      const term = (searchInput ? searchInput.value : '').toLowerCase().trim();

      const filtered = allOrders.filter(ord => {
        const matchesStatus = currentFilter === 'todos' || ord.status === currentFilter;
        const matchesTerm = !term ||
          (ord.id || '').toLowerCase().includes(term) ||
          (ord.customer && ord.customer.name && ord.customer.name.toLowerCase().includes(term)) ||
          (ord.customer && ord.customer.phone && ord.customer.phone.toLowerCase().includes(term));
        return matchesStatus && matchesTerm;
      });

      if (filtered.length === 0) {
        listContainer.innerHTML = `
          <div class="admin-card" style="text-align:center; padding:3rem 1.5rem;">
            <p style="font-size:1.1rem; color:#5F5852; margin:0 0 0.5rem 0;">No se encontraron pedidos con estos criterios.</p>
            <p style="font-size:0.85rem; color:#8A837A; margin:0;">Probá cambiando el filtro o término de búsqueda.</p>
          </div>
        `;
        return;
      }

      listContainer.innerHTML = filtered.map(ord => {
        const total = (ord.items || []).reduce((acc, i) => {
          const num = parseInt((i.price || '0').replace(/[^0-9]/g, '')) || 0;
          return acc + num * (i.qty || 1);
        }, 0);

        return `
          <div class="admin-card" data-order-id="${ord.id}" style="margin-bottom:1.25rem;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.75rem; margin-bottom:1rem; border-bottom:1px solid rgba(43,38,37,0.08); padding-bottom:0.85rem;">
              <div>
                <span class="admin-page-kicker">Pedido #${ord.id}</span>
                <h4 style="margin:0 0 0.25rem 0; font-size:1.15rem; color:#2B2625;">${ord.customer ? ord.customer.name : 'Clienta'}</h4>
                <div style="font-size:0.8rem; color:#5F5852;">
                  📅 Fecha: ${ord.date || 'Reciente'} ${ord.time ? `a las ${ord.time}` : ''} &middot;
                  📍 ${ord.customer ? ord.customer.address : 'A convenir'} &middot;
                  📞 <a href="tel:${ord.customer ? ord.customer.phone : ''}" style="color:#A45A44; text-decoration:none; font-weight:600;">${ord.customer ? ord.customer.phone : ''}</a>
                </div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:1.3rem; font-weight:700; color:#2B2625; font-family:var(--font-serif);">$ ${total.toLocaleString('es-AR')}</div>
                <div style="font-size:0.75rem; color:#658572; font-weight:600;">${ord.items ? ord.items.length : 0} artículos</div>
              </div>
            </div>

            <!-- Ítems del Pedido -->
            <div style="background:#FAF8F4; border-radius:8px; padding:0.85rem 1rem; margin-bottom:1rem; border:1px solid rgba(43,38,37,0.06);">
              ${(ord.items || []).map(i => `
                <div style="display:flex; justify-content:space-between; font-size:0.86rem; padding:0.35rem 0; border-bottom:1px dashed rgba(43,38,37,0.08);">
                  <span><strong>${i.qty}x</strong> ${i.title} ${i.note ? `<span style="color:#8A837A;">(${i.note})</span>` : ''}</span>
                  <span style="font-weight:600;">${i.price}</span>
                </div>
              `).join('')}
            </div>

            <!-- Controles de Taller -->
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr auto; gap:0.85rem; align-items:flex-end;">
              <div>
                <label class="admin-label">Estado del Pedido</label>
                <select class="admin-select ctrl-order-status">
                  <option value="pendiente" ${ord.status === 'pendiente' ? 'selected' : ''}>⏳ Pendiente de Confirmación</option>
                  <option value="en-confeccion" ${ord.status === 'en-confeccion' ? 'selected' : ''}>✂️ En Confección de Taller</option>
                  <option value="listo" ${ord.status === 'listo' ? 'selected' : ''}>🌸 Listo para Entrega</option>
                  <option value="entregado" ${ord.status === 'entregado' ? 'selected' : ''}>✅ Entregado / Enviado</option>
                </select>
              </div>

              <div>
                <label class="admin-label">Fecha Estimada de Entrega</label>
                <input type="text" class="admin-input ctrl-order-date" placeholder="Ej: 18 de Noviembre" value="${ord.estimatedDelivery || ''}" />
              </div>

              <div>
                <label class="admin-label">Notas de Taller de Elena</label>
                <input type="text" class="admin-input ctrl-order-note" placeholder="Detalle de tela, cintas o empaque..." value="${ord.workshopNote || ''}" />
              </div>

              <div style="display:flex; gap:0.5rem;">
                <button type="button" class="btn-admin-cta btn-save-order" title="Guardar Cambios">
                  <span>Guardar</span>
                </button>
                <a href="admin-chat.html?phone=${encodeURIComponent(ord.customer ? ord.customer.phone : '')}" class="btn-admin-outline" title="Chatear con Clienta">
                  <span>💬 Chat</span>
                </a>
                <button type="button" class="btn-admin-outline btn-delete-order" style="color:#DC2626; border-color:rgba(220,38,38,0.3);" title="Archivar Pedido">
                  <span>🗑️</span>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Wire save handlers
      listContainer.querySelectorAll('.btn-save-order').forEach(btn => {
        btn.addEventListener('click', () => {
          const card = btn.closest('[data-order-id]');
          const orderId = card.getAttribute('data-order-id');
          const newStatus = card.querySelector('.ctrl-order-status').value;
          const newDate = card.querySelector('.ctrl-order-date').value.trim();
          const newNote = card.querySelector('.ctrl-order-note').value.trim();

          window.WorkshopDB.updateOrder(orderId, {
            status: newStatus,
            estimatedDelivery: newDate,
            workshopNote: newNote
          });

          adminToast(`✅ Pedido #${orderId} actualizado con éxito.`);
          setupNavCounts();
          renderOrders();
        });
      });

      // Wire delete handlers
      listContainer.querySelectorAll('.btn-delete-order').forEach(btn => {
        btn.addEventListener('click', () => {
          const card = btn.closest('[data-order-id]');
          const orderId = card.getAttribute('data-order-id');
          if (confirm(`¿Querés archivar el pedido #${orderId}?`)) {
            window.WorkshopDB.deleteOrder(orderId);
            adminToast(`Pedido #${orderId} archivado.`);
            setupNavCounts();
            renderOrders();
          }
        });
      });
    }

    if (searchInput) searchInput.addEventListener('input', renderOrders);

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        currentFilter = btn.getAttribute('data-filter-status');
        renderOrders();
      });
    });

    renderOrders();

    // Directorio de Clientas
    const clientsTbody = document.getElementById('clients-table-tbody');
    if (clientsTbody) {
      const clients = window.WorkshopDB.getClients();
      clientsTbody.innerHTML = clients.map(cli => `
        <tr>
          <td><strong>${cli.name}</strong></td>
          <td>📞 ${cli.phone}</td>
          <td>✉️ ${cli.email || '-'}</td>
          <td>📍 ${cli.address || '-'}</td>
          <td><span class="admin-badge admin-badge--ready">${cli.totalOrders || 0} pedidos</span></td>
          <td>
            <a href="admin-chat.html?phone=${encodeURIComponent(cli.phone)}" class="btn-admin-nav" style="color:#2B2625;">
              💬 Abrir Chat
            </a>
          </td>
        </tr>
      `).join('');
    }
  }

  // =========================================================================
  // 3. PÁGINA: PRODUCCIÓN TEXTIL (admin-produccion.html)
  // =========================================================================
  function initProduccionPage() {
    if (!window.WorkshopDB) return;

    const PHASES = [
      { id: 'corte', title: '1. Corte de Telas', icon: '✂️' },
      { id: 'costura', title: '2. Costura & Ensamblado', icon: '🪡' },
      { id: 'bordado', title: '3. Bordado & Terminación', icon: '🧵' },
      { id: 'calidad', title: '4. Control de Calidad', icon: '🔍' },
      { id: 'empaque', title: '5. Empaque & Envío', icon: '📦' }
    ];

    function renderPipeline() {
      const queue = window.WorkshopDB.getProductionQueue ? window.WorkshopDB.getProductionQueue() : [];

      PHASES.forEach(phase => {
        const colList = document.getElementById(`kanban-list-${phase.id}`);
        const colCount = document.getElementById(`kanban-count-${phase.id}`);
        if (!colList) return;

        const items = queue.filter(item => item.phase === phase.id);
        if (colCount) colCount.textContent = items.length;

        if (items.length === 0) {
          colList.innerHTML = '<p style="color:#8A837A; font-size:0.78rem; text-align:center; padding:1.5rem 0;">Sin piezas en esta fase</p>';
        } else {
          colList.innerHTML = items.map(item => `
            <div class="admin-kanban-card" data-prod-id="${item.id}">
              <div style="font-size:0.72rem; color:#A45A44; font-weight:700; text-transform:uppercase;">#${item.id}</div>
              <h5 class="admin-kanban-card__title">${item.productTitle}</h5>
              <div class="admin-kanban-card__meta">
                Clienta: <strong>${item.clientName}</strong><br>
                Tela: <strong>${item.fabric}</strong><br>
                Prioridad: <span style="font-weight:700; color:${item.priority === 'urgente' ? '#DC2626' : '#658572'}">${item.priority || 'Normal'}</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; gap:0.5rem; margin-top:0.75rem;">
                <select class="admin-select ctrl-phase-select" style="padding:0.35rem 0.5rem; font-size:0.76rem;">
                  ${PHASES.map(p => `
                    <option value="${p.id}" ${p.id === item.phase ? 'selected' : ''}>${p.icon} ${p.title}</option>
                  `).join('')}
                  <option value="completado">✅ Confección Completada</option>
                </select>
                <button type="button" class="btn-admin-outline btn-del-prod" style="padding:0.35rem 0.6rem; color:#DC2626;" title="Eliminar pieza">✕</button>
              </div>
            </div>
          `).join('');
        }
      });

      // Bind phase changers
      document.querySelectorAll('.ctrl-phase-select').forEach(sel => {
        sel.addEventListener('change', () => {
          const card = sel.closest('[data-prod-id]');
          const prodId = card.getAttribute('data-prod-id');
          const newPhase = sel.value;
          window.WorkshopDB.updateProductionPhase(prodId, newPhase);
          adminToast(`Pieza #${prodId} movida a fase: ${newPhase}`);
          setupNavCounts();
          renderPipeline();
        });
      });

      // Bind delete handlers
      document.querySelectorAll('.btn-del-prod').forEach(btn => {
        btn.addEventListener('click', () => {
          const card = btn.closest('[data-prod-id]');
          const prodId = card.getAttribute('data-prod-id');
          if (confirm(`¿Eliminar la pieza #${prodId} de la línea de producción?`)) {
            window.WorkshopDB.deleteProductionItem(prodId);
            adminToast(`Pieza #${prodId} eliminada.`);
            setupNavCounts();
            renderPipeline();
          }
        });
      });
    }

    renderPipeline();

    // Formulario para Agregar Nueva Pieza
    const form = document.getElementById('form-add-production');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const client = document.getElementById('prod-input-client').value.trim();
        const product = document.getElementById('prod-input-product').value.trim();
        const fabric = document.getElementById('prod-input-fabric').value.trim();
        const priority = document.getElementById('prod-input-priority').value;

        if (!client || !product) {
          alert('Por favor ingresá la clienta y el nombre de la pieza.');
          return;
        }

        window.WorkshopDB.addProductionItem({
          clientName: client,
          productTitle: product,
          fabric: fabric || 'Satén / Lino',
          priority: priority,
          phase: 'corte'
        });

        form.reset();
        adminToast('✨ Nueva pieza ingresada a Corte de Telas con éxito.');
        setupNavCounts();
        renderPipeline();
      });
    }
  }

  // =========================================================================
  // 4. PÁGINA: STOCK & TELAS (admin-stock.html)
  // =========================================================================
  function initStockPage() {
    if (!window.WorkshopDB) return;

    function renderStock() {
      const materials = window.WorkshopDB.getMaterials();
      const tbody = document.getElementById('materials-table-tbody');
      if (tbody) {
        tbody.innerHTML = materials.map(m => {
          let badgeClass = 'admin-badge--ready';
          let statusLabel = 'Óptimo';
          if (m.currentStock <= m.minStock) {
            badgeClass = 'admin-badge--alert';
            statusLabel = 'Reponer Urgente';
          } else if (m.currentStock <= m.minStock * 1.5) {
            badgeClass = 'admin-badge--pending';
            statusLabel = 'Medio';
          }

          return `
            <tr data-mat-id="${m.id}">
              <td>
                <div style="display:flex; align-items:center; gap:0.6rem;">
                  <span style="display:inline-block; width:16px; height:16px; border-radius:50%; background:${m.color || '#C87D69'}; border:1px solid rgba(0,0,0,0.15);"></span>
                  <strong>${m.name}</strong>
                </div>
              </td>
              <td>${m.type || 'Tela Noble'}</td>
              <td><strong>${m.currentStock} ${m.unit || 'm'}</strong></td>
              <td>${m.minStock} ${m.unit || 'm'}</td>
              <td>$ ${(m.costPerUnit || 0).toLocaleString('es-AR')}</td>
              <td><span class="admin-badge ${badgeClass}">${statusLabel}</span></td>
              <td>
                <div style="display:flex; gap:0.4rem;">
                  <button type="button" class="btn-admin-outline btn-stock-adjust" data-delta="5" title="Sumar 5m">+5m</button>
                  <button type="button" class="btn-admin-outline btn-stock-adjust" data-delta="-2" title="Restar 2m">-2m</button>
                  <button type="button" class="btn-admin-outline btn-mat-del" style="color:#DC2626;" title="Eliminar">🗑️</button>
                </div>
              </td>
            </tr>
          `;
        }).join('');

        // Wire adjust
        tbody.querySelectorAll('.btn-stock-adjust').forEach(btn => {
          btn.addEventListener('click', () => {
            const row = btn.closest('[data-mat-id]');
            const matId = row.getAttribute('data-mat-id');
            const delta = parseFloat(btn.getAttribute('data-delta'));
            const mat = materials.find(m => m.id === matId);
            if (mat) {
              const newQty = Math.max(0, mat.currentStock + delta);
              window.WorkshopDB.updateMaterialStock(matId, newQty);
              adminToast(`Stock de "${mat.name}" actualizado a ${newQty} ${mat.unit || 'm'}`);
              renderStock();
            }
          });
        });

        // Wire delete
        tbody.querySelectorAll('.btn-mat-del').forEach(btn => {
          btn.addEventListener('click', () => {
            const row = btn.closest('[data-mat-id]');
            const matId = row.getAttribute('data-mat-id');
            if (confirm('¿Eliminar este material de la base de datos?')) {
              window.WorkshopDB.deleteMaterial(matId);
              adminToast('Material eliminado.');
              renderStock();
            }
          });
        });
      }
    }

    renderStock();

    // Formulario de Nuevo Material
    const form = document.getElementById('form-add-material');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('mat-name').value.trim();
        const type = document.getElementById('mat-type').value.trim();
        const stock = parseFloat(document.getElementById('mat-stock').value) || 0;
        const min = parseFloat(document.getElementById('mat-min').value) || 5;
        const cost = parseFloat(document.getElementById('mat-cost').value) || 0;
        const color = document.getElementById('mat-color').value;

        if (!name) return;

        window.WorkshopDB.addMaterial({
          name: name,
          type: type || 'Tela Noble',
          currentStock: stock,
          minStock: min,
          costPerUnit: cost,
          unit: 'm',
          color: color
        });

        form.reset();
        adminToast(`✨ Rollo de tela "${name}" ingresado.`);
        renderStock();
      });
    }
  }

  // =========================================================================
  // 5. PÁGINA: GANANCIAS & FINANZAS (admin-finances.html)
  // =========================================================================
  // =========================================================================
  // 5. PÁGINA: GANANCIAS & FINANZAS (admin-finances.html)
  // =========================================================================
  function initFinancesPage() {
    if (!window.WorkshopDB) return;

    let selectedPeriod = 'all';

    function getPeriodFilterKey() {
      const now = new Date();
      if (selectedPeriod === 'current-month') {
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}`;
      }
      if (selectedPeriod === 'prev-month') {
        const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const y = prev.getFullYear();
        const m = String(prev.getMonth() + 1).padStart(2, '0');
        return `${y}-${m}`;
      }
      return 'all';
    }

    function renderFinances() {
      const periodKey = getPeriodFilterKey();
      const summary = window.WorkshopDB.getFinancialSummary(periodKey);
      const budget = window.WorkshopDB.getBudget();

      // 1. KPIs Principales
      const elRev = document.getElementById('fin-revenue');
      if (elRev) elRev.textContent = `$ ${(summary.totalRevenue || 0).toLocaleString('es-AR')}`;

      const elOrdersMeta = document.getElementById('fin-orders-meta');
      if (elOrdersMeta) elOrdersMeta.textContent = `${summary.totalOrdersCount || 0} pedidos facturados`;

      const elExp = document.getElementById('fin-expenses');
      if (elExp) elExp.textContent = `$ ${(summary.totalExpenses || 0).toLocaleString('es-AR')}`;

      const elExpMeta = document.getElementById('fin-expenses-meta');
      if (elExpMeta) elExpMeta.textContent = `${summary.totalExpensesCount || 0} compras registradas`;

      const elNet = document.getElementById('fin-profit');
      if (elNet) elNet.textContent = `$ ${(summary.netProfit || 0).toLocaleString('es-AR')}`;

      const elProfitMeta = document.getElementById('fin-profit-meta');
      if (elProfitMeta) elProfitMeta.textContent = `${summary.profitMargin || 0}% de margen neto en mano`;

      const elMargin = document.getElementById('fin-margin');
      if (elMargin) elMargin.textContent = `${summary.profitMargin || 0}%`;

      const elFabricInvest = document.getElementById('fin-fabric-invest');
      if (elFabricInvest) elFabricInvest.textContent = `$ ${(summary.fabricStockValue || 0).toLocaleString('es-AR')}`;

      const elAvgTicket = document.getElementById('fin-avg-ticket');
      if (elAvgTicket) elAvgTicket.textContent = `$ ${(summary.avgTicket || 0).toLocaleString('es-AR')}`;

      // 2. Flujo de Cobros & Señas (Cashflow)
      const elPaidTotal = document.getElementById('fin-paid-total');
      if (elPaidTotal) elPaidTotal.textContent = `$ ${(summary.paidTotal || 0).toLocaleString('es-AR')}`;

      const elPaidCount = document.getElementById('fin-paid-count');
      if (elPaidCount) elPaidCount.textContent = `${summary.paidOrdersCount || 0} pedidos completamente cancelados`;

      const elDepositTotal = document.getElementById('fin-deposit-total');
      if (elDepositTotal) elDepositTotal.textContent = `$ ${(summary.depositTotal || 0).toLocaleString('es-AR')}`;

      const elPendingBalance = document.getElementById('fin-pending-balance');
      if (elPendingBalance) elPendingBalance.textContent = `$ ${(summary.pendingBalance || 0).toLocaleString('es-AR')}`;

      const elPendingCount = document.getElementById('fin-pending-count');
      if (elPendingCount) elPendingCount.textContent = `${summary.pendingOrdersCount || 0} pedidos con saldo a cobrar en entrega`;

      // 3. Presupuesto Mensual & Diagnóstico
      const elBudget = document.getElementById('fin-budget-text');
      if (elBudget) elBudget.textContent = `$ ${(summary.totalExpenses || 0).toLocaleString('es-AR')} gastados de $ ${budget.toLocaleString('es-AR')} presupuestados`;

      const pct = budget > 0 ? Math.min(150, Math.round(((summary.totalExpenses || 0) / budget) * 100)) : 0;
      const elBudgetPct = document.getElementById('fin-budget-pct');
      if (elBudgetPct) elBudgetPct.textContent = `${pct}%`;

      const remaining = Math.max(0, budget - (summary.totalExpenses || 0));
      const elBudgetRemaining = document.getElementById('fin-budget-remaining');
      if (elBudgetRemaining) elBudgetRemaining.textContent = `$ ${remaining.toLocaleString('es-AR')}`;

      const bar = document.getElementById('fin-budget-bar');
      if (bar) {
        bar.style.width = `${Math.min(100, pct)}%`;
        bar.style.backgroundColor = pct > 100 ? '#DC2626' : (pct >= 80 ? '#D97706' : '#4A5548');
      }

      const elBudgetBadge = document.getElementById('fin-budget-badge');
      if (elBudgetBadge) {
        if (pct > 100) {
          elBudgetBadge.className = 'admin-badge admin-badge--alert';
          elBudgetBadge.textContent = '🚨 Límite Superado';
        } else if (pct >= 80) {
          elBudgetBadge.className = 'admin-badge admin-badge--pending';
          elBudgetBadge.textContent = '⚠️ Cerca del Tope';
        } else {
          elBudgetBadge.className = 'admin-badge admin-badge--delivered';
          elBudgetBadge.textContent = '🌿 Presupuesto Saludable';
        }
      }

      // 4. Distribución de Gastos por Rubro
      const distContainer = document.getElementById('fin-dist-container');
      if (distContainer) {
        const catMap = summary.expensesByCategory || {};
        const catKeys = Object.keys(catMap);
        const totalExp = summary.totalExpenses || 1;
        distContainer.innerHTML = catKeys.map(cat => {
          const amt = catMap[cat] || 0;
          const p = Math.round((amt / totalExp) * 100);
          return `
            <div style="margin-bottom:0.75rem;">
              <div style="display:flex; justify-content:space-between; font-size:0.82rem; margin-bottom:0.25rem;">
                <span><strong>${cat}</strong></span>
                <span>$ ${amt.toLocaleString('es-AR')} (${p}%)</span>
              </div>
              <div style="height:7px; background:#ECE4DA; border-radius:999px; overflow:hidden;">
                <div style="width:${p}%; height:100%; background:#A45A44; border-radius:999px;"></div>
              </div>
            </div>
          `;
        }).join('');
      }

      // 5. Rentabilidad por Creación Textil
      const starTbody = document.getElementById('fin-star-products-tbody');
      if (starTbody) {
        const starItems = summary.starProductsProfit || [];
        starTbody.innerHTML = starItems.map(item => {
          const profit = item.price - item.cost;
          return `
            <tr>
              <td><strong>${item.name}</strong></td>
              <td><span style="font-size:0.78rem; color:#6A635B;">${item.category}</span></td>
              <td style="color:#DC2626;">$ ${item.cost.toLocaleString('es-AR')}</td>
              <td><strong>$ ${item.price.toLocaleString('es-AR')}</strong></td>
              <td style="color:#2E7D32; font-weight:700;">+ $ ${profit.toLocaleString('es-AR')}</td>
              <td><strong>${item.margin}%</strong></td>
              <td><span class="fin-profit-badge">${item.badge}</span></td>
            </tr>
          `;
        }).join('');
      }

      // 6. Tabla de Gastos con Búsqueda
      renderExpensesTable();
    }

    function renderExpensesTable() {
      const expensesTbody = document.getElementById('expenses-table-tbody');
      if (!expensesTbody) return;

      const allExpenses = window.WorkshopDB.getExpenses();
      const searchVal = (document.getElementById('exp-search-input') ? document.getElementById('exp-search-input').value : '').toLowerCase().trim();

      const normalize = str => (str || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const sVal = normalize(searchVal);

      const filtered = allExpenses.filter(exp => {
        if (!sVal) return true;
        const text = normalize(exp.description || exp.concept);
        const cat = normalize(exp.category);
        const d = normalize(exp.date);
        return text.includes(sVal) || cat.includes(sVal) || d.includes(sVal);
      });

      const countLabel = document.getElementById('exp-count-label');
      if (countLabel) {
        countLabel.textContent = `Mostrando ${filtered.length} de ${allExpenses.length} compras`;
      }

      if (filtered.length === 0) {
        expensesTbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:1.5rem; color:#8A837A;">No se encontraron movimientos con ese criterio.</td></tr>';
        return;
      }

      expensesTbody.innerHTML = filtered.map(exp => `
        <tr data-exp-id="${exp.id}">
          <td style="color:#6A635B; font-size:0.84rem;">${exp.date}</td>
          <td><strong>${exp.description || exp.concept || 'Gasto de taller'}</strong></td>
          <td><span class="admin-badge admin-badge--production">${exp.category}</span></td>
          <td><strong style="color:#DC2626;">$ ${(exp.amount || 0).toLocaleString('es-AR')}</strong></td>
          <td>
            <button type="button" class="btn-admin-outline btn-del-exp" style="color:#DC2626; padding:0.3rem 0.65rem;" title="Eliminar este gasto">✕</button>
          </td>
        </tr>
      `).join('');

      expensesTbody.querySelectorAll('.btn-del-exp').forEach(btn => {
        btn.addEventListener('click', () => {
          const expId = btn.closest('[data-exp-id]').getAttribute('data-exp-id');
          if (confirm('¿Eliminar este registro de gasto?')) {
            window.WorkshopDB.deleteExpense(expId);
            adminToast('Gasto eliminado.');
            renderFinances();
          }
        });
      });
    }

    // Configurar Selector de Períodos
    const periodButtons = document.querySelectorAll('#fin-period-selector .fin-period-btn');
    periodButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        periodButtons.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        selectedPeriod = btn.getAttribute('data-period');
        renderFinances();
      });
    });

    // Buscador en Vivo
    const searchInput = document.getElementById('exp-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', renderExpensesTable);
    }

    // Formulario de Gasto
    const formExp = document.getElementById('form-add-expense');
    if (formExp) {
      formExp.addEventListener('submit', (e) => {
        e.preventDefault();
        const desc = document.getElementById('exp-desc').value.trim();
        const amount = parseFloat(document.getElementById('exp-amount').value) || 0;
        const category = document.getElementById('exp-category').value;

        if (!desc || amount <= 0) return;

        window.WorkshopDB.addExpense({
          description: desc,
          amount: amount,
          category: category
        });

        formExp.reset();
        adminToast(`💸 Gasto de $ ${amount.toLocaleString('es-AR')} registrado.`);
        renderFinances();
      });
    }

    // Editar Presupuesto
    const btnSetBudget = document.getElementById('btn-set-budget');
    if (btnSetBudget) {
      btnSetBudget.addEventListener('click', () => {
        const cur = window.WorkshopDB.getBudget();
        const newVal = prompt('Ingresá el nuevo presupuesto mensual de taller ($ ARS):', cur);
        if (newVal !== null && !isNaN(parseFloat(newVal))) {
          window.WorkshopDB.setBudget(parseFloat(newVal));
          adminToast('Presupuesto actualizado.');
          renderFinances();
        }
      });
    }

    renderFinances();
  }

  // =========================================================================
  // 6. PÁGINA: CHAT CON CLIENTAS (admin-chat.html)
  // =========================================================================
  function initChatPage() {
    if (!window.WorkshopDB) return;

    let activePhone = null;
    const urlParams = new URLSearchParams(window.location.search);
    const phoneFromUrl = urlParams.get('phone');

    const contactsList = document.getElementById('chat-contacts-list');
    const messagesContainer = document.getElementById('chat-messages-container');
    const chatInput = document.getElementById('chat-input-text');
    const sendBtn = document.getElementById('chat-send-btn');
    const clientNameHeader = document.getElementById('chat-client-name-header');

    function renderContacts() {
      if (!contactsList) return;
      const allChats = window.WorkshopDB.getChats();
      const clients = window.WorkshopDB.getClients();
      const phones = Object.keys(allChats);

      if (phones.length === 0) {
        contactsList.innerHTML = '<p style="color:#8A837A; font-size:0.85rem; padding:1.5rem; text-align:center;">No hay conversaciones activas</p>';
        return;
      }

      contactsList.innerHTML = phones.map(p => {
        const cli = clients.find(c => c.phone === p) || { name: 'Clienta' };
        const msgs = allChats[p] || [];
        const lastMsg = msgs[msgs.length - 1] || { text: 'Sin mensajes', time: '' };
        const isActive = p === activePhone;

        return `
          <div class="admin-chat-contact ${isActive ? 'is-active' : ''}" data-phone="${p}">
            <div style="font-weight:700; font-size:0.9rem; color:#2B2625; margin-bottom:0.2rem;">${cli.name}</div>
            <div style="font-size:0.78rem; color:#8A837A; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${lastMsg.text}</div>
            <div style="font-size:0.7rem; color:#A45A44; margin-top:0.25rem;">${p} &middot; ${lastMsg.time || ''}</div>
          </div>
        `;
      }).join('');

      contactsList.querySelectorAll('.admin-chat-contact').forEach(el => {
        el.addEventListener('click', () => {
          activePhone = el.getAttribute('data-phone');
          renderContacts();
          renderActiveChat();
        });
      });
    }

    function renderActiveChat() {
      if (!messagesContainer) return;
      if (!activePhone) {
        messagesContainer.innerHTML = '<p style="color:#8A837A; text-align:center; padding:3rem;">Seleccioná una clienta de la lista para ver el chat</p>';
        if (clientNameHeader) clientNameHeader.textContent = 'Seleccioná una conversación';
        return;
      }

      const clients = window.WorkshopDB.getClients();
      const cli = clients.find(c => c.phone === activePhone) || { name: 'Clienta' };
      if (clientNameHeader) clientNameHeader.textContent = `Chat con ${cli.name} (${activePhone})`;

      const messages = window.WorkshopDB.getChatForPhone(activePhone);
      messagesContainer.innerHTML = messages.map(m => `
        <div class="admin-chat-bubble ${m.sender === 'client' ? 'admin-chat-bubble--client' : 'admin-chat-bubble--workshop'}">
          <div>${m.text}</div>
          <div style="font-size:0.68rem; opacity:0.8; margin-top:0.3rem; text-align:right;">${m.time || ''}</div>
        </div>
      `).join('');

      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function sendMessage() {
      if (!activePhone || !chatInput) return;
      const text = chatInput.value.trim();
      if (!text) return;

      window.WorkshopDB.addMessageToChat(activePhone, {
        sender: 'workshop',
        text: text
      });

      chatInput.value = '';
      adminToast('Mensaje enviado a la clienta.');
      setupNavCounts();
      renderContacts();
      renderActiveChat();
    }

    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    if (chatInput) {
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendMessage();
      });
    }

    // Respuestas rápidas
    document.querySelectorAll('.btn-quick-reply').forEach(btn => {
      btn.addEventListener('click', () => {
        if (chatInput) {
          chatInput.value = btn.textContent.trim();
          chatInput.focus();
        }
      });
    });

    if (phoneFromUrl) {
      activePhone = phoneFromUrl;
    } else {
      const allChats = window.WorkshopDB.getChats();
      const firstPhone = Object.keys(allChats)[0];
      if (firstPhone) activePhone = firstPhone;
    }

    renderContacts();
    renderActiveChat();
  }

  // =========================================================================
  // 7. PÁGINA: CATÁLOGO & CREACIONES (admin-productos.html)
  // =========================================================================
  function initProductosPage() {
    let products = [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (saved) products = JSON.parse(saved);
      else if (typeof INITIAL_PRODUCTS !== 'undefined') products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    } catch (e) {
      console.warn(e);
    }

    function saveProducts() {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    }

    const tbody = document.getElementById('products-table-tbody');
    const modal = document.getElementById('product-edit-modal');
    const form = document.getElementById('product-edit-form');
    const btnNew = document.getElementById('btn-new-product-page');
    const btnCancel = document.getElementById('edit-cancel-btn');

    function renderProductsTable() {
      if (!tbody) return;
      tbody.innerHTML = products.map(p => {
        const firstImg = (p.images && p.images[0]) ? p.images[0].src : 'assets/images/hero-textile.jpg';
        return `
          <tr data-prod-id="${p.id}">
            <td style="width:70px;">
              <img src="${firstImg}" alt="${p.title}" style="width:54px; height:54px; object-fit:cover; border-radius:6px; border:1px solid rgba(43,38,37,0.1);" />
            </td>
            <td>
              <strong>${p.title}</strong><br>
              <span style="font-size:0.76rem; color:#8A837A;">ID: ${p.id} &middot; ${p.texture || 'Confección artesanal'}</span>
            </td>
            <td><span class="admin-badge admin-badge--ready">${p.category}</span></td>
            <td><strong>${p.price}</strong></td>
            <td><span class="admin-badge admin-badge--production">${p.tag || 'Taller'}</span></td>
            <td>
              <div style="display:flex; gap:0.5rem;">
                <button type="button" class="btn-admin-cta btn-edit-prod" style="padding:0.4rem 0.8rem; font-size:0.78rem;">✏️ Editar</button>
                <button type="button" class="btn-admin-outline btn-del-prod" style="padding:0.4rem 0.6rem; color:#DC2626;" title="Eliminar">🗑️</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      // Wire edit
      tbody.querySelectorAll('.btn-edit-prod').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.closest('[data-prod-id]').getAttribute('data-prod-id');
          openEditor(id);
        });
      });

      // Wire delete
      tbody.querySelectorAll('.btn-del-prod').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.closest('[data-prod-id]').getAttribute('data-prod-id');
          if (confirm(`¿Eliminar la pieza "${id}" del catálogo?`)) {
            products = products.filter(p => p.id !== id);
            saveProducts();
            adminToast('Producto eliminado.');
            renderProductsTable();
          }
        });
      });
    }

    function openEditor(id = null) {
      if (!modal) return;
      modal.classList.add('is-open');

      if (id) {
        const prod = products.find(p => p.id === id);
        if (!prod) return;
        document.getElementById('edit-product-id').value = prod.id;
        document.getElementById('edit-title').value = prod.title || '';
        document.getElementById('edit-category').value = prod.category || 'cuidado-personal';
        document.getElementById('edit-price').value = prod.price || '';
        document.getElementById('edit-texture').value = prod.texture || '';
        document.getElementById('edit-tag').value = prod.tag || '';
        document.getElementById('edit-desc').value = prod.desc || '';
      } else {
        document.getElementById('edit-product-id').value = '';
        document.getElementById('edit-title').value = '';
        document.getElementById('edit-category').value = 'cuidado-personal';
        document.getElementById('edit-price').value = '$ 12.500 ARS';
        document.getElementById('edit-texture').value = 'Confección a mano con telas nobles';
        document.getElementById('edit-tag').value = 'Novedad de Taller';
        document.getElementById('edit-desc').value = '';
      }
    }

    if (btnNew) btnNew.addEventListener('click', () => openEditor(null));
    if (btnCancel) btnCancel.addEventListener('click', () => modal.classList.remove('is-open'));

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-product-id').value;
        const title = document.getElementById('edit-title').value.trim();
        const cat = document.getElementById('edit-category').value;
        const price = document.getElementById('edit-price').value.trim();
        const texture = document.getElementById('edit-texture').value.trim();
        const tag = document.getElementById('edit-tag').value.trim();
        const desc = document.getElementById('edit-desc').value.trim();

        if (!title) return;

        if (id) {
          const idx = products.findIndex(p => p.id === id);
          if (idx >= 0) {
            products[idx] = {
              ...products[idx],
              title, category: cat, price, texture, tag, desc
            };
          }
        } else {
          const newId = 'p' + (Date.now() % 10000);
          products.unshift({
            id: newId,
            title, category: cat, price, texture, tag, desc,
            images: [{ label: 'Foto Principal', src: 'assets/images/hero-textile.jpg' }]
          });
        }

        saveProducts();
        modal.classList.remove('is-open');
        adminToast('✨ Catálogo actualizado con éxito.');
        renderProductsTable();
      });
    }

    renderProductsTable();
  }

  // =========================================================================
  // 8. PÁGINA: CONFIGURACIÓN GENERAL (admin-configuracion.html)
  // =========================================================================
  function initConfiguracionPage() {
    let settings = {};
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) settings = JSON.parse(saved);
    } catch (e) {}

    const form = document.getElementById('form-admin-settings');
    if (form) {
      // Poblar campos
      document.getElementById('cfg-announcement').value = settings.announcement || '';
      document.getElementById('cfg-hero-eyebrow').value = settings.hero_eyebrow || '';
      document.getElementById('cfg-hero-title').value = settings.hero_title || '';
      document.getElementById('cfg-hero-tagline').value = settings.hero_tagline || '';
      document.getElementById('cfg-hero-cta').value = settings.hero_cta || '';
      document.getElementById('cfg-whatsapp').value = settings.whatsapp_phone || '';
      document.getElementById('cfg-instagram').value = settings.instagram_user || '';
      document.getElementById('cfg-github-token').value = settings.gh_token || '';

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const updated = {
          ...settings,
          announcement: document.getElementById('cfg-announcement').value.trim(),
          hero_eyebrow: document.getElementById('cfg-hero-eyebrow').value.trim(),
          hero_title: document.getElementById('cfg-hero-title').value.trim(),
          hero_tagline: document.getElementById('cfg-hero-tagline').value.trim(),
          hero_cta: document.getElementById('cfg-hero-cta').value.trim(),
          whatsapp_phone: document.getElementById('cfg-whatsapp').value.trim(),
          instagram_user: document.getElementById('cfg-instagram').value.trim(),
          gh_token: document.getElementById('cfg-github-token').value.trim()
        };

        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
        adminToast('⚙️ Ajustes guardados. Se verán reflejados de inmediato en la tienda pública.');
      });
    }

    // Importación de Respaldo JSON
    const restoreInput = document.getElementById('restore-file-input');
    if (restoreInput) {
      restoreInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (evt) {
          const res = window.WorkshopDB.importBackupJson(evt.target.result);
          if (res.success) {
            adminToast('🎉 Respaldo restaurado con éxito. Actualizando vista...');
            setTimeout(() => window.location.reload(), 800);
          } else {
            alert('Error importando el archivo: ' + res.error);
          }
        };
        reader.readAsText(file);
      });
    }
  }

  // =========================================================================
  // 9. PÁGINA: GUÍA & TUTORIAL DE TALLER (admin-guia.html)
  // =========================================================================
  function initGuiaPage() {
    const tabs = document.querySelectorAll('.guide-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('is-active'));
        tab.classList.add('is-active');

        const target = tab.getAttribute('data-guide-target');
        document.querySelectorAll('.guide-step-card').forEach(card => {
          card.style.display = card.id === target ? 'block' : 'none';
        });
      });
    });
  }

  // Exponer API y ejecutar al cargar
  window.DivinaLocuraAdmin = {
    init: initAdminShell,
    toast: adminToast,
    downloadBackup: downloadWorkshopBackup,
    logout: logoutAdmin
  };

  document.addEventListener('DOMContentLoaded', () => {
    initAdminShell();
  });
})();
