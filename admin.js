/**
 * Divina Locura Deco - Admin Portal Script
 * Maneja la autenticación unificada, la navegación superior y la lógica
 * específica de cada una de las páginas dedicadas del panel de control.
 */

(function () {
  'use strict';

  const STORAGE_KEY_ROLE = 'divinalocura_role';
  const STORAGE_KEY_PRODUCTS = 'divinalocura_products';
  const STORAGE_KEY_SETTINGS = 'divinalocura_settings';

  const PASSWORDS = ['admin', 'juanma', 'elena', 'admin2026', 'juanma2026', 'elena2026', 'mama'];

  function esc(str) {
    if (window.WorkshopDB && typeof window.WorkshopDB.escapeHtml === 'function') {
      return window.WorkshopDB.escapeHtml(str);
    }
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

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
    localStorage.removeItem('divinalocura_admin_token');
    adminToast('Sesión de administración cerrada.');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 400);
  }

  // Inyectar accesos destacados para volver al inicio de la tienda + indicador de Google Sheets
  function injectBackToStoreElements() {
    if (document.head && !document.querySelector('meta[name="color-scheme"]')) {
      const metaScheme = document.createElement('meta');
      metaScheme.name = 'color-scheme';
      metaScheme.content = 'only light';
      document.head.appendChild(metaScheme);
    }

    // 1. Botón flotante discreto en toda la administración (abajo a la izquierda)
    if (!document.getElementById('floating-back-store-btn')) {
      const floatBtn = document.createElement('a');
      floatBtn.id = 'floating-back-store-btn';
      floatBtn.className = 'floating-back-store-btn';
      floatBtn.href = 'index.html';
      floatBtn.title = 'Volver al inicio de la página principal donde está toda la tienda';
      floatBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>Volver a la Tienda</span>
      `;
      document.body.appendChild(floatBtn);
    }

    // Eliminar cualquier enlace duplicado antiguo en el extremo izquierdo
    const oldBackLink = document.querySelector('.admin-top-back-link');
    if (oldBackLink && oldBackLink.parentNode) {
      oldBackLink.parentNode.removeChild(oldBackLink);
    }

    // 2. Separar el Panel de Control en su propia barra independiente debajo de la barra "Divina Locura Deco"
    const topNav = document.querySelector('.admin-top-nav');
    const brandWrap = document.querySelector('.admin-brand-wrap');
    const brandBadge = document.querySelector('.admin-brand-badge');
    const navLinks = document.querySelector('.admin-nav-links');

    if (brandWrap && !brandWrap.querySelector('.admin-brand-subtitle')) {
      const sub = document.createElement('span');
      sub.className = 'admin-brand-subtitle';
      sub.textContent = 'Taller Textil & Blanquería de Autor';
      brandWrap.appendChild(sub);
    }

    if (topNav && navLinks && !document.querySelector('.admin-control-subbar')) {
      const subbar = document.createElement('div');
      subbar.className = 'admin-control-subbar';
      const subbarInner = document.createElement('div');
      subbarInner.className = 'admin-control-subbar__inner';

      if (brandBadge) {
        brandBadge.className = 'admin-control-subbar__badge';
        subbarInner.appendChild(brandBadge);
      } else {
        const badgeEl = document.createElement('div');
        badgeEl.className = 'admin-control-subbar__badge';
        badgeEl.innerHTML = '<span class="admin-dot-pulse"></span><span>Panel de Control</span>';
        subbarInner.appendChild(badgeEl);
      }

      const divider = document.createElement('span');
      divider.className = 'admin-control-subbar__divider';
      divider.setAttribute('aria-hidden', 'true');
      subbarInner.appendChild(divider);

      subbarInner.appendChild(navLinks);
      subbar.appendChild(subbarInner);
      topNav.insertAdjacentElement('afterend', subbar);
    }

    // 3. Unificar el botón de retorno a la tienda en las acciones superiores derechas
    const storeBtn = document.querySelector('.btn-admin-nav--store');
    if (storeBtn) {
      storeBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <span>Volver a la Tienda</span>
      `;
      storeBtn.setAttribute('title', 'Volver al inicio de la tienda principal');
    }

    // 4. Indicador de conexión a Google Sheets en la cabecera
    const topActions = document.querySelector('.admin-top-actions');
    if (topActions && !document.getElementById('admin-cloud-pill')) {
      const cloudPill = document.createElement('a');
      cloudPill.id = 'admin-cloud-pill';
      cloudPill.href = 'admin-configuracion.html';
      cloudPill.className = 'btn-admin-nav admin-cloud-pill';
      topActions.insertBefore(cloudPill, topActions.firstChild);
    }
    refreshCloudPill();
  }

  function refreshCloudPill() {
    const pill = document.getElementById('admin-cloud-pill');
    if (!pill) return;
    const isCloud = window.WorkshopDB && window.WorkshopDB.isCloudConfigured && window.WorkshopDB.isCloudConfigured();
    if (isCloud) {
      pill.innerHTML = '<span class="cloud-dot cloud-dot--ok"></span><span>Google Sheets Activo</span>';
      pill.classList.add('is-connected');
      pill.title = 'Conectado en tiempo real con la planilla de Google de Elena';
    } else {
      pill.innerHTML = '<span class="cloud-dot"></span><span>Google Sheets</span>';
      pill.classList.remove('is-connected');
      pill.title = 'Hacé clic para vincular o revisar la planilla de Google Sheets';
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

      async function doLogin() {
        const p = (passInput ? passInput.value : '').trim();
        let targetRole = null;

        if (btn) {
          btn.disabled = true;
          btn.innerHTML = '<span>Verificando...</span>';
        }

        try {
          if (window.WorkshopDB && typeof window.WorkshopDB.loginAdminAsync === 'function') {
            const check = await window.WorkshopDB.loginAdminAsync(null, p);
            if (check && check.valid) {
              targetRole = check.role || 'juanma';
            }
          } else if (window.WorkshopDB && window.WorkshopDB.verifyAdminPassword) {
            const check = window.WorkshopDB.verifyAdminPassword(null, p);
            if (check.valid) {
              targetRole = check.role || 'juanma';
            }
          }
        } catch (err) {}

        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<span>Ingresar al Panel 💻</span>';
        }

        if (!targetRole) {
          const lower = p.toLowerCase();
          if (PASSWORDS.includes(lower)) {
            targetRole = (lower === 'elena' || lower === 'mama') ? 'elena' : 'juanma';
          }
        }

        if (targetRole) {
          localStorage.setItem(STORAGE_KEY_ROLE, targetRole);
          if (guardEl) guardEl.style.display = 'none';
          if (contentEl) contentEl.style.display = 'block';
          adminToast(targetRole === 'elena' ? '🌸 ¡Bienvenida Elena al Panel de Control!' : '💻 ¡Bienvenido Juanma al Panel de Control!');
          setupNavCounts();
          initActivePage();
          triggerBackgroundCloudPull();
        } else {
          alert('Clave incorrecta. Si la cambiaste, ingresá tu nueva clave.');
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
    triggerBackgroundCloudPull();
  }

  function triggerBackgroundCloudPull() {
    if (window.WorkshopDB && window.WorkshopDB.isCloudConfigured && window.WorkshopDB.isCloudConfigured()) {
      window.WorkshopDB.pullAllFromCloud().then(res => {
        if (res && res.ok) {
          refreshCloudPill();
          setupNavCounts();
          initActivePage();
        }
      }).catch(() => {});
    }
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
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:0.75rem; font-size:0.86rem; padding:0.45rem 0; border-bottom:1px dashed rgba(43,38,37,0.08);">
                  <div style="display:flex; align-items:flex-start; gap:0.75rem; flex:1;">
                    ${i.referenceImage ? `
                      <a href="${esc(i.referenceImage)}" target="_blank" title="Ver foto o boceto subido por la clienta en tamaño grande" style="flex-shrink:0; display:block;">
                        <img src="${esc(i.referenceImage)}" alt="Boceto clienta" style="width:52px; height:52px; object-fit:cover; border-radius:6px; border:2px solid #A45A44; box-shadow:0 2px 6px rgba(0,0,0,0.12);" />
                      </a>
                    ` : ''}
                    <div>
                      <span><strong>${i.qty}x</strong> ${esc(i.title)}</span>
                      ${i.note ? `<div style="color:#6E5A4F; font-size:0.79rem; margin-top:2px;">🪡 ${esc(i.note)}</div>` : ''}
                      ${i.referenceImage ? `<div style="margin-top:3px;"><span style="display:inline-block; background:#FDF3EE; color:#A45A44; border:1px solid rgba(164,90,68,0.3); border-radius:4px; padding:1px 6px; font-size:0.7rem; font-weight:700;">📸 Incluye Foto / Idea de Referencia para la Máquina</span></div>` : ''}
                    </div>
                  </div>
                  <span style="font-weight:600; white-space:nowrap;">${esc(i.price)}</span>
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

              <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                <button type="button" class="btn-admin-cta btn-save-order" title="Guardar Cambios">
                  <span>Guardar</span>
                </button>
                <button type="button" class="btn-admin-outline btn-order-receipt-pdf" title="Generar Recibo / Orden de Taller Imprimible y PDF">
                  <span>📄 Recibo PDF</span>
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

      // Wire PDF Receipt handlers
      listContainer.querySelectorAll('.btn-order-receipt-pdf').forEach(btn => {
        btn.addEventListener('click', () => {
          const card = btn.closest('[data-order-id]');
          const orderId = card.getAttribute('data-order-id');
          const ord = window.WorkshopDB.getOrders().find(o => o.id === orderId);
          if (ord) {
            openAdminOrderReceiptModal(ord);
          }
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

    function openAdminOrderReceiptModal(ord) {
      let modal = document.getElementById('admin-receipt-pdf-modal');
      if (!modal) {
        modal = document.createElement('div');
        modal.id = 'admin-receipt-pdf-modal';
        modal.className = 'admin-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        document.body.appendChild(modal);
      }

      const items = ord.items || [];
      const total = ord.totalAmount || items.reduce((acc, i) => {
        const num = parseInt(String(i.price || '0').replace(/[^0-9]/g, ''), 10) || 16500;
        return acc + num * (i.qty || 1);
      }, 0);
      const deposit = ord.depositAmount != null ? ord.depositAmount : Math.round(total * 0.5);
      const pending = ord.pendingBalance != null ? ord.pendingBalance : Math.max(0, total - deposit);

      modal.innerHTML = `
        <div class="admin-modal__card receipt-pdf-card" id="admin-printable-receipt">
          <div class="receipt-pdf-top-actions no-print">
            <span class="receipt-pdf-kicker">📄 ORDEN DE CONFECCIÓN & RECIBO DE TALLER</span>
            <div style="display:flex; gap:0.5rem;">
              <button type="button" class="btn-admin-cta" id="btn-admin-print-receipt" style="padding:0.45rem 0.95rem; font-size:0.78rem;">
                <span>🖨️ Imprimir / Guardar en PDF</span>
              </button>
              <button type="button" class="btn-admin-outline" id="btn-admin-close-receipt" style="padding:0.45rem 0.85rem; font-size:0.78rem;">
                <span>Cerrar ✕</span>
              </button>
            </div>
          </div>

          <div class="receipt-sheet-body">
            <div class="receipt-sheet-header">
              <div>
                <div class="receipt-brand-title">DIVINA LOCURA <span>DECO</span></div>
                <div class="receipt-brand-sub">Atelier Textil &amp; Blanquería de Autor por Elena · Buenos Aires</div>
              </div>
              <div style="text-align:right;">
                <div class="receipt-order-num">ORDEN #${esc(ord.id)}</div>
                <div class="receipt-order-date">Fecha: ${esc(ord.date || 'Reciente')} ${ord.time ? '· ' + esc(ord.time) : ''}</div>
              </div>
            </div>

            <div class="receipt-client-grid">
              <div>
                <span class="receipt-meta-label">CLIENTA</span>
                <strong>${esc(ord.customer ? ord.customer.name : 'Clienta')}</strong>
              </div>
              <div>
                <span class="receipt-meta-label">WHATSAPP / TELÉFONO</span>
                <strong>${esc(ord.customer ? ord.customer.phone : '-')}</strong>
              </div>
              <div>
                <span class="receipt-meta-label">LOCALIDAD / ENTREGA</span>
                <strong>${esc((ord.customer && ord.customer.address) ? ord.customer.address : 'A convenir')}</strong>
              </div>
              <div>
                <span class="receipt-meta-label">ENTREGA ESTIMADA</span>
                <strong>${esc(ord.estimatedDelivery || '5 a 7 días hábiles')}</strong>
              </div>
            </div>

            <table class="receipt-items-table">
              <thead>
                <tr>
                  <th>Cant.</th>
                  <th>Pieza Textil &amp; Detalle de Confección</th>
                  <th style="text-align:right;">Unitario</th>
                  <th style="text-align:right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(i => {
                  const uPrice = parseInt(String(i.price || '0').replace(/[^0-9]/g, ''), 10) || 16500;
                  const sub = uPrice * (i.qty || 1);
                  return `
                    <tr>
                      <td><strong>${i.qty || 1}x</strong></td>
                      <td>
                        <div style="display:flex; align-items:flex-start; gap:0.65rem;">
                          ${i.referenceImage ? `<img src="${esc(i.referenceImage)}" alt="Referencia clienta" style="width:44px; height:44px; object-fit:cover; border-radius:4px; border:1px solid #A45A44;" />` : ''}
                          <div>
                            <div style="font-weight:600; color:#2B2625;">${esc(i.title)}</div>
                            ${i.note ? `<div style="font-size:0.76rem; color:#8F4F3D; margin-top:2px;">🪡 ${esc(i.note)}</div>` : ''}
                          </div>
                        </div>
                      </td>
                      <td style="text-align:right;">$ ${uPrice.toLocaleString('es-AR')}</td>
                      <td style="text-align:right; font-weight:600;">$ ${sub.toLocaleString('es-AR')}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>

            <div class="receipt-totals-box">
              <div class="receipt-total-row receipt-total-row--main">
                <span>VALOR TOTAL DEL ENCARGO:</span>
                <strong>$ ${total.toLocaleString('es-AR')} ARS</strong>
              </div>
              <div class="receipt-total-row receipt-total-row--deposit">
                <span>⏳ Seña de Confección (50% Anticipo):</span>
                <strong>$ ${deposit.toLocaleString('es-AR')} ARS</strong>
              </div>
              <div class="receipt-total-row">
                <span>📦 Saldo a Cobrar contra Entrega (50%):</span>
                <strong>$ ${pending.toLocaleString('es-AR')} ARS</strong>
              </div>
            </div>

            ${ord.workshopNote ? `
              <div style="margin-top:0.85rem; padding:0.65rem 0.9rem; background:#FAF6F0; border-left:3px solid #A45A44; font-size:0.8rem; color:#4A433E;">
                <strong>🌸 Nota de Taller de Elena:</strong> ${esc(ord.workshopNote)}
              </div>
            ` : ''}

            <div class="receipt-footer-note">
              <div>
                <strong>Alias Mercado Pago / Transferencia:</strong> <code>DIVINA.LOCURA.DECO</code> · WhatsApp Taller: +54 9 11 3693-2471
              </div>
              <div style="margin-top:0.3rem; font-style:italic; color:#6E655F;">
                “Confeccionado a mano con fibras nobles prelavadas en el taller de Divina Locura Deco.”
              </div>
            </div>
          </div>
        </div>
      `;

      modal.classList.add('is-open');
      const closeBtn = document.getElementById('btn-admin-close-receipt');
      if (closeBtn) closeBtn.onclick = () => modal.classList.remove('is-open');
      const printBtn = document.getElementById('btn-admin-print-receipt');
      if (printBtn) printBtn.onclick = () => window.print();
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

    // Poblar selector de rollos reales del stock
    const datalist = document.getElementById('prod-fabric-datalist');
    if (datalist && window.WorkshopDB.getMaterials) {
      const mats = window.WorkshopDB.getMaterials();
      datalist.innerHTML = mats.map(m =>
        `<option value="${esc(m.name)}">Disponible: ${m.currentStock}${m.unit || 'm'}</option>`
      ).join('');
    }

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
            <div class="admin-kanban-card" data-prod-id="${esc(item.id)}">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:0.72rem; color:#A45A44; font-weight:700; text-transform:uppercase;">#${esc(item.id)}</span>
                ${item.metersUsed ? `<span style="font-size:0.7rem; background:#EFEAE4; color:#4A5548; padding:2px 6px; border-radius:4px; font-weight:600;">✂️ -${item.metersUsed}m</span>` : ''}
              </div>
              <h5 class="admin-kanban-card__title">${esc(item.productTitle)}</h5>
              <div class="admin-kanban-card__meta">
                Clienta: <strong>${esc(item.clientName)}</strong><br>
                Tela: <strong>${esc(item.fabric)}</strong><br>
                Prioridad: <span style="font-weight:700; color:${item.priority === 'urgente' ? '#DC2626' : '#658572'}">${esc(item.priority || 'Normal')}</span>
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
          if (newPhase === 'completado') {
            adminToast(`✅ Pieza #${prodId} terminada. Stock/Pedido actualizado automáticamente.`);
          } else {
            adminToast(`Pieza #${prodId} movida a fase: ${newPhase}`);
          }
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
        const metersEl = document.getElementById('prod-input-meters');
        const metersVal = metersEl && metersEl.value ? parseFloat(metersEl.value) : 0;
        const priority = document.getElementById('prod-input-priority').value;

        if (!client || !product) {
          alert('Por favor ingresá la clienta y el nombre de la pieza.');
          return;
        }

        const created = window.WorkshopDB.addProductionItem({
          clientName: client,
          productTitle: product,
          fabric: fabric || 'Satén / Lino',
          metersRequired: metersVal > 0 ? metersVal : undefined,
          priority: priority,
          phase: 'corte'
        });

        form.reset();
        if (created && created.metersUsed) {
          adminToast(`✂️ Pieza en Corte. Se descontaron ${created.metersUsed}m de "${created.fabric}" del stock.`);
        } else {
          adminToast('✨ Nueva pieza ingresada a Corte de Telas con éxito.');
        }
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

    // =========================================================================
    // MUESTRARIO PÚBLICO DE TELAS DE ELENA (ESPECIFICACIONES + ENCARGOS)
    // =========================================================================
    const sfGrid = document.getElementById('showcase-fabrics-admin-grid');
    const sfModal = document.getElementById('showcase-fabric-modal');
    const sfForm = document.getElementById('showcase-fabric-form');
    const btnNewSf = document.getElementById('btn-new-showcase-fabric');
    const btnCancelSf = document.getElementById('sf-cancel-btn');
    const sfFileInput = document.getElementById('sf-file-input');
    const sfImgInput = document.getElementById('sf-img');
    const sfUploadText = document.getElementById('sf-upload-text');

    function renderShowcaseFabricsAdmin() {
      if (!sfGrid || !window.WorkshopDB.getShowcaseFabrics) return;
      const list = window.WorkshopDB.getShowcaseFabrics();

      if (list.length === 0) {
        sfGrid.innerHTML = '<p style="color:#8A837A; font-size:0.85rem;">No hay telas cargadas en el muestrario público.</p>';
        return;
      }

      sfGrid.innerHTML = list.map(f => `
        <div class="admin-card" data-sf-id="${esc(f.id)}" style="margin-bottom:0; padding:1rem; background:#FDFBF9; border:1px solid rgba(43,38,37,0.1); display:flex; flex-direction:column; justify-content:space-between; gap:0.75rem;">
          <div>
            <div style="display:flex; gap:0.75rem; align-items:center; margin-bottom:0.65rem;">
              <img src="${esc(f.img || 'assets/images/hero-textile.jpg')}" alt="${esc(f.title)}" style="width:58px; height:58px; object-fit:cover; border-radius:8px; border:1px solid rgba(43,38,37,0.12);" />
              <div>
                <span style="font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#A45A44;">${esc(f.badge || 'Fibra Noble')}</span>
                <h4 style="margin:0.1rem 0; font-size:0.98rem; color:#2B2625;">${esc(f.title || f.tabLabel)}</h4>
                <span style="font-size:0.75rem; color:#6A625B;">Colores: <strong>${esc(f.availableColorsText || 'Crudo, Rosa Viejo, Salvia')}</strong></span>
              </div>
            </div>
            <p style="font-size:0.79rem; color:#4A433E; margin:0 0 0.5rem 0; line-height:1.45;">${esc(f.desc || '')}</p>
            <div style="font-size:0.74rem; color:#5F5852; background:#F6F1EA; padding:0.45rem 0.65rem; border-radius:6px;">
              <div>✨ <strong>Beneficio:</strong> ${esc(f.benefit || '-')}</div>
              <div>🧺 <strong>Cuidado:</strong> ${esc(f.care || '-')}</div>
              <div>🛋️ <strong>Encargos ideales:</strong> ${esc(f.ideal || '-')}</div>
            </div>
          </div>
          <div style="display:flex; justify-content:flex-end; gap:0.45rem; border-top:1px solid rgba(43,38,37,0.06); padding-top:0.6rem;">
            <button type="button" class="btn-admin-cta btn-sf-edit" style="padding:0.35rem 0.75rem; font-size:0.76rem;">✏️ Editar Ficha</button>
            <button type="button" class="btn-admin-outline btn-sf-del" style="padding:0.35rem 0.6rem; font-size:0.76rem; color:#DC2626;">🗑️</button>
          </div>
        </div>
      `).join('');

      sfGrid.querySelectorAll('.btn-sf-edit').forEach(btn => {
        btn.addEventListener('click', () => {
          const sfId = btn.closest('[data-sf-id]').getAttribute('data-sf-id');
          openSfModal(sfId);
        });
      });

      sfGrid.querySelectorAll('.btn-sf-del').forEach(btn => {
        btn.addEventListener('click', () => {
          const sfId = btn.closest('[data-sf-id]').getAttribute('data-sf-id');
          if (confirm('¿Quitar esta tela del Muestrario público de la página?')) {
            window.WorkshopDB.deleteShowcaseFabric(sfId);
            adminToast('Tela quitada del muestrario.');
            renderShowcaseFabricsAdmin();
          }
        });
      });
    }

    function openSfModal(sfId = null) {
      if (!sfModal) return;
      sfModal.classList.add('is-open');
      const list = window.WorkshopDB.getShowcaseFabrics ? window.WorkshopDB.getShowcaseFabrics() : [];
      const found = sfId ? list.find(x => x.id === sfId) : null;

      document.getElementById('sf-id').value = found ? found.id : '';
      document.getElementById('sf-tab-label').value = found ? (found.tabLabel || found.title || '') : '';
      document.getElementById('sf-badge').value = found ? (found.badge || '') : '100% Fibra Noble · Prelavado';
      document.getElementById('sf-title').value = found ? (found.title || '') : '';
      document.getElementById('sf-desc').value = found ? (found.desc || '') : '';
      document.getElementById('sf-benefit').value = found ? (found.benefit || '') : '';
      document.getElementById('sf-care').value = found ? (found.care || '') : '';
      document.getElementById('sf-ideal').value = found ? (found.ideal || '') : '';
      document.getElementById('sf-colors-text').value = found ? (found.availableColorsText || 'Crudo, Rosa Viejo, Verde Salvia, Terracota') : 'Crudo, Rosa Viejo, Verde Salvia, Terracota';
      document.getElementById('sf-img').value = found ? (found.img || 'assets/images/hero-textile.jpg') : 'assets/images/hero-textile.jpg';
      document.getElementById('sf-filter-term').value = found ? (found.filterTerm || '') : '';
    }

    if (btnNewSf) btnNewSf.addEventListener('click', () => openSfModal(null));
    if (btnCancelSf) btnCancelSf.addEventListener('click', () => sfModal.classList.remove('is-open'));

    if (sfFileInput) {
      sfFileInput.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        if (sfUploadText) sfUploadText.textContent = '⏳ Subiendo...';
        try {
          if (window.WorkshopDB && window.WorkshopDB.processAndUploadImage) {
            const up = await window.WorkshopDB.processAndUploadImage(file, file.name);
            if (up && up.url && sfImgInput) {
              sfImgInput.value = up.url;
              adminToast('📸 Foto de tela lista.');
            }
          }
        } catch (err) {
          alert('No se pudo procesar la foto de la tela.');
        } finally {
          if (sfUploadText) sfUploadText.textContent = '📁 Subir foto';
        }
      });
    }

    if (sfForm) {
      sfForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const idVal = document.getElementById('sf-id').value.trim() || ('tela-' + (Date.now() % 100000));
        const tabLabel = document.getElementById('sf-tab-label').value.trim();
        const title = document.getElementById('sf-title').value.trim() || tabLabel;
        if (!title) return;

        window.WorkshopDB.upsertShowcaseFabric({
          id: idVal,
          tabLabel: tabLabel || title,
          badge: document.getElementById('sf-badge').value.trim() || '100% Fibra Noble',
          title: title,
          desc: document.getElementById('sf-desc').value.trim(),
          benefit: document.getElementById('sf-benefit').value.trim(),
          care: document.getElementById('sf-care').value.trim(),
          ideal: document.getElementById('sf-ideal').value.trim(),
          availableColorsText: document.getElementById('sf-colors-text').value.trim(),
          img: document.getElementById('sf-img').value.trim() || 'assets/images/hero-textile.jpg',
          filterTerm: document.getElementById('sf-filter-term').value.trim() || tabLabel.split(' ')[0]
        });

        sfModal.classList.remove('is-open');
        adminToast(`✨ Tela "${title}" publicada en el Muestrario y en el Diseñador a Medida.`);
        renderShowcaseFabricsAdmin();
      });
    }

    renderShowcaseFabricsAdmin();
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

    // =====================================================================
    // CALCULADORA INTERACTIVA DE COSTOS DE CONFECCIÓN & PRECIO SUGERIDO
    // =====================================================================
    const calcProductSelect = document.getElementById('calc-product-select');
    const calcFabricSelect = document.getElementById('calc-fabric-select');
    const calcMetersInput = document.getElementById('calc-meters-input');
    const calcFabricCostInput = document.getElementById('calc-fabric-cost-input');
    const calcNotionsInput = document.getElementById('calc-notions-input');
    const calcLaborInput = document.getElementById('calc-labor-input');
    const calcMarginSelect = document.getElementById('calc-margin-select');
    const btnCalcApplyPrice = document.getElementById('btn-calc-apply-price');

    const PRESET_RECIPES = {
      'p1': { meters: 1.15, notions: 2400, labor: 4500 },
      'p2': { meters: 0.45, notions: 900, labor: 1800 },
      'p3': { meters: 0.90, notions: 2200, labor: 3600 },
      'p4': { meters: 0.65, notions: 2100, labor: 4800 },
      'p5': { meters: 0.30, notions: 1100, labor: 2200 },
      'p6': { meters: 0.40, notions: 1600, labor: 2500 },
      'p7': { meters: 0.95, notions: 2300, labor: 4600 },
      'p8': { meters: 0.50, notions: 1700, labor: 2900 }
    };

    if (calcProductSelect && window.WorkshopDB.getProducts) {
      const prods = window.WorkshopDB.getProducts();
      calcProductSelect.innerHTML = '<option value="">— Simular pieza libre —</option>' +
        prods.map(p => `<option value="${esc(p.id)}">${esc(p.title)} (${esc(p.price || 'Consultar')})</option>`).join('');
    }

    if (calcFabricSelect && window.WorkshopDB.getMaterials) {
      const mats = window.WorkshopDB.getMaterials();
      if (mats && mats.length > 0) {
        calcFabricSelect.innerHTML = mats.map(m =>
          `<option value="${m.costPerUnit || 6500}">${esc(m.name)} ($ ${(m.costPerUnit || 6500).toLocaleString('es-AR')}/${m.unit || 'm'})</option>`
        ).join('');
        if (calcFabricCostInput && mats[0]) {
          calcFabricCostInput.value = mats[0].costPerUnit || 6500;
        }
      }
    }

    let lastSuggestedRounded = 22200;

    function recalculateWorkshopCost() {
      const meters = Math.max(0.05, parseFloat(calcMetersInput ? calcMetersInput.value : 0.85) || 0.85);
      const costPerMeter = Math.max(0, parseFloat(calcFabricCostInput ? calcFabricCostInput.value : 6800) || 0);
      const notions = Math.max(0, parseFloat(calcNotionsInput ? calcNotionsInput.value : 1800) || 0);
      const labor = Math.max(0, parseFloat(calcLaborInput ? calcLaborInput.value : 3500) || 0);
      const markupFactor = parseFloat(calcMarginSelect ? calcMarginSelect.value : 1.0) || 1.0;

      const fabricSub = Math.round(meters * costPerMeter);
      const unitCost = Math.round(fabricSub + notions + labor);
      const rawSuggested = unitCost * (1 + markupFactor);
      // Redondear a múltiplos de $ 100 ARS para precio comercial prolijo
      const suggestedPrice = Math.ceil(rawSuggested / 100) * 100;
      lastSuggestedRounded = suggestedPrice;

      const deposit50 = Math.round(suggestedPrice * 0.5);
      // Ganancia limpia en bolsillo de Elena (incluye su mano de obra + margen neto sobre materiales)
      const netInPocket = Math.max(0, suggestedPrice - (fabricSub + notions));

      const lblMeters = document.getElementById('calc-out-meters-lbl');
      const outFabricSub = document.getElementById('calc-out-fabric-sub');
      const outUnitCost = document.getElementById('calc-out-unit-cost');
      const outSuggested = document.getElementById('calc-out-suggested-price');
      const outDeposit = document.getElementById('calc-out-deposit');
      const outNetProfit = document.getElementById('calc-out-net-profit');

      if (lblMeters) lblMeters.textContent = `${meters}m`;
      if (outFabricSub) outFabricSub.textContent = `$ ${fabricSub.toLocaleString('es-AR')}`;
      if (outUnitCost) outUnitCost.textContent = `$ ${unitCost.toLocaleString('es-AR')} ARS`;
      if (outSuggested) outSuggested.textContent = `$ ${suggestedPrice.toLocaleString('es-AR')} ARS`;
      if (outDeposit) outDeposit.textContent = `$ ${deposit50.toLocaleString('es-AR')}`;
      if (outNetProfit) outNetProfit.textContent = `+ $ ${netInPocket.toLocaleString('es-AR')} ARS`;
    }

    if (calcFabricSelect) {
      calcFabricSelect.addEventListener('change', () => {
        if (calcFabricCostInput) {
          calcFabricCostInput.value = calcFabricSelect.value;
        }
        recalculateWorkshopCost();
      });
    }

    if (calcProductSelect) {
      calcProductSelect.addEventListener('change', () => {
        const pid = calcProductSelect.value;
        if (pid && PRESET_RECIPES[pid]) {
          if (calcMetersInput) calcMetersInput.value = PRESET_RECIPES[pid].meters;
          if (calcNotionsInput) calcNotionsInput.value = PRESET_RECIPES[pid].notions;
          if (calcLaborInput) calcLaborInput.value = PRESET_RECIPES[pid].labor;
        }
        recalculateWorkshopCost();
      });
    }

    [calcMetersInput, calcFabricCostInput, calcNotionsInput, calcLaborInput, calcMarginSelect].forEach(el => {
      if (el) {
        el.addEventListener('input', recalculateWorkshopCost);
        el.addEventListener('change', recalculateWorkshopCost);
      }
    });

    if (btnCalcApplyPrice) {
      btnCalcApplyPrice.addEventListener('click', () => {
        const pid = calcProductSelect ? calcProductSelect.value : '';
        if (!pid) {
          adminToast('💡 Primero elegí una Creación del Catálogo en el paso 1 para aplicarle este precio.');
          if (calcProductSelect) calcProductSelect.focus();
          return;
        }
        const prods = window.WorkshopDB.getProducts ? window.WorkshopDB.getProducts() : [];
        const idx = prods.findIndex(p => p.id === pid);
        if (idx === -1) return;

        const formattedPrice = `$ ${lastSuggestedRounded.toLocaleString('es-AR')} ARS`;
        prods[idx].price = formattedPrice;
        if (window.WorkshopDB.saveProducts) {
          window.WorkshopDB.saveProducts(prods);
        } else {
          localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(prods));
        }

        adminToast(`✨ Precio de "${prods[idx].title}" actualizado a ${formattedPrice} en toda la tienda.`);
        renderFinances();
      });
    }

    recalculateWorkshopCost();
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
    if (window.WorkshopDB && typeof window.WorkshopDB.getProducts === 'function') {
      products = window.WorkshopDB.getProducts();
    } else {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
        if (saved) products = JSON.parse(saved);
        else if (typeof INITIAL_PRODUCTS !== 'undefined') products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
      } catch (e) {
        console.warn(e);
      }
    }

    function saveProducts() {
      if (window.WorkshopDB && typeof window.WorkshopDB.saveProducts === 'function') {
        window.WorkshopDB.saveProducts(products);
      } else {
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
      }
    }

    const tbody = document.getElementById('products-table-tbody');
    const modal = document.getElementById('product-edit-modal');
    const form = document.getElementById('product-edit-form');
    const btnNew = document.getElementById('btn-new-product-page');
    const btnCancel = document.getElementById('edit-cancel-btn');
    const imagesListEl = document.getElementById('admin-edit-images-list');

    function renderImageSlots(imagesArray) {
      if (!imagesListEl) return;
      const defaultLabels = ['Foto Principal', 'Detalle Textura', 'En Uso / Ambiente', 'Presentación'];
      const slots = [0, 1, 2, 3].map(idx => {
        const existing = (imagesArray && imagesArray[idx]) ? imagesArray[idx] : null;
        return {
          label: existing && existing.label ? existing.label : defaultLabels[idx],
          src: existing && existing.src ? existing.src : (idx === 0 ? 'assets/images/hero-textile.jpg' : '')
        };
      });

      imagesListEl.innerHTML = slots.map((slot, idx) => `
        <div class="admin-img-slot" data-slot-idx="${idx}" style="background:#FFFFFF; border:1px solid #E5DFD7; border-radius:8px; padding:0.65rem; display:flex; flex-direction:column; gap:0.45rem;">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <img src="${esc(slot.src || 'assets/images/hero-textile.jpg')}" class="slot-preview-img" alt="Vista ${idx + 1}" style="width:46px; height:46px; object-fit:cover; border-radius:6px; border:1px solid #EFEAE4; opacity:${slot.src ? '1' : '0.35'};" />
            <div style="flex:1; min-width:0;">
              <input type="text" class="admin-input slot-label-input" value="${esc(slot.label)}" placeholder="Etiqueta vista ${idx + 1}" style="padding:0.3rem 0.5rem; font-size:0.76rem; margin-bottom:0.25rem;" />
              <label class="btn-admin-outline" style="padding:0.22rem 0.55rem; font-size:0.72rem; cursor:pointer; display:inline-flex; align-items:center; gap:0.25rem; margin:0;">
                <span class="slot-upload-text">📁 Subir foto</span>
                <input type="file" accept="image/*" class="slot-file-input" style="display:none;" />
              </label>
            </div>
          </div>
          <input type="text" class="admin-input slot-src-input" value="${esc(slot.src)}" placeholder="O pegá ruta / URL de foto..." style="padding:0.3rem 0.5rem; font-size:0.74rem;" />
        </div>
      `).join('');

      imagesListEl.querySelectorAll('.admin-img-slot').forEach(slotEl => {
        const previewImg = slotEl.querySelector('.slot-preview-img');
        const srcInput = slotEl.querySelector('.slot-src-input');
        const fileInput = slotEl.querySelector('.slot-file-input');
        const uploadText = slotEl.querySelector('.slot-upload-text');

        if (srcInput && previewImg) {
          srcInput.addEventListener('input', () => {
            const val = srcInput.value.trim();
            previewImg.src = val || 'assets/images/hero-textile.jpg';
            previewImg.style.opacity = val ? '1' : '0.35';
          });
        }

        if (fileInput) {
          fileInput.addEventListener('change', async (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;
            if (uploadText) uploadText.textContent = '⏳ Subiendo...';
            try {
              let resultUrl = '';
              if (window.WorkshopDB && typeof window.WorkshopDB.processAndUploadImage === 'function') {
                const up = await window.WorkshopDB.processAndUploadImage(file, file.name);
                resultUrl = up.url || '';
                if (up.cloud) {
                  adminToast('☁️ Foto subida a Google Drive y lista para publicar.');
                } else {
                  adminToast('📸 Foto optimizada y cargada con éxito.');
                }
              }
              if (resultUrl && srcInput && previewImg) {
                srcInput.value = resultUrl;
                previewImg.src = resultUrl;
                previewImg.style.opacity = '1';
              }
            } catch (err) {
              alert('No se pudo procesar la imagen seleccionada.');
            } finally {
              if (uploadText) uploadText.textContent = '📁 Subir foto';
            }
          });
        }
      });
    }

    const colorsListEl = document.getElementById('admin-edit-colors-list');
    const newColorNameInput = document.getElementById('admin-new-color-name');
    const newColorHexInput = document.getElementById('admin-new-color-hex');
    const btnAddColor = document.getElementById('btn-admin-add-color');
    const allowEmbroideryCheckbox = document.getElementById('edit-allow-embroidery');

    function renderColorCheckboxes(selectedColorNames) {
      if (!colorsListEl) return;
      const palette = (window.WorkshopDB && window.WorkshopDB.getColorPalette)
        ? window.WorkshopDB.getColorPalette()
        : [
            { name: 'Crudo Natural', hex: '#F3EFEA' },
            { name: 'Rosa Viejo', hex: '#C87D69' },
            { name: 'Verde Salvia', hex: '#8A9A86' },
            { name: 'Terracota Suave', hex: '#A45A44' },
            { name: 'Avellana / Arena', hex: '#D8C8B8' },
            { name: 'Gris Perla', hex: '#C5C6C7' },
            { name: 'Celeste Bruma', hex: '#B8C9D4' }
          ];

      const selectedSet = new Set(
        Array.isArray(selectedColorNames) && selectedColorNames.length > 0
          ? selectedColorNames
          : palette.slice(0, 4).map(c => c.name)
      );

      colorsListEl.innerHTML = palette.map(c => {
        const isChecked = selectedSet.has(c.name);
        return `
          <label class="admin-color-chip-label" style="display:inline-flex; align-items:center; gap:0.45rem; padding:0.35rem 0.65rem; border-radius:999px; border:1px solid ${isChecked ? '#A45A44' : '#DED6CC'}; background:${isChecked ? '#FDF6F2' : '#FFFFFF'}; cursor:pointer; font-size:0.78rem; font-weight:600; color:#2B2625; user-select:none;">
            <input type="checkbox" class="prod-color-checkbox" value="${esc(c.name)}" data-hex="${esc(c.hex)}" ${isChecked ? 'checked' : ''} style="accent-color:#A45A44;" />
            <span style="width:14px; height:14px; border-radius:50%; background:${esc(c.hex)}; border:1px solid rgba(0,0,0,0.2); display:inline-block;"></span>
            <span>${esc(c.name)}</span>
          </label>
        `;
      }).join('');

      colorsListEl.querySelectorAll('.prod-color-checkbox').forEach(chk => {
        chk.addEventListener('change', () => {
          const lbl = chk.closest('.admin-color-chip-label');
          if (lbl) {
            lbl.style.borderColor = chk.checked ? '#A45A44' : '#DED6CC';
            lbl.style.background = chk.checked ? '#FDF6F2' : '#FFFFFF';
          }
        });
      });
    }

    if (btnAddColor) {
      btnAddColor.addEventListener('click', () => {
        const name = newColorNameInput ? newColorNameInput.value.trim() : '';
        const hex = newColorHexInput ? newColorHexInput.value : '#C87D69';
        if (!name) {
          alert('Escribí el nombre del nuevo color (ej: Lila Pastel o Mostaza).');
          return;
        }
        const currentlyChecked = [];
        if (colorsListEl) {
          colorsListEl.querySelectorAll('.prod-color-checkbox:checked').forEach(c => currentlyChecked.push(c.value));
        }
        currentlyChecked.push(name);
        if (window.WorkshopDB && window.WorkshopDB.addCustomColor) {
          window.WorkshopDB.addCustomColor(name, hex);
        }
        if (newColorNameInput) newColorNameInput.value = '';
        renderColorCheckboxes(currentlyChecked);
        adminToast(`🎨 Color "${name}" agregado a la paleta del taller.`);
      });
    }

    function renderProductsTable() {
      if (!tbody) return;
      const catNames = {
        'cuidado-personal': 'Cuidado Personal & Descanso',
        'organizacion': 'Organización & Hogar',
        'infantil': 'Infantil & Bebés'
      };
      const palette = (window.WorkshopDB && window.WorkshopDB.getColorPalette) ? window.WorkshopDB.getColorPalette() : [];

      tbody.innerHTML = products.map(p => {
        const firstImg = (p.images && p.images[0]) ? p.images[0].src : 'assets/images/hero-textile.jpg';
        const photoCount = (p.images || []).filter(i => i && i.src).length || 1;
        const availColors = Array.isArray(p.availableColors) && p.availableColors.length > 0
          ? p.availableColors
          : ['Crudo Natural', 'Rosa Viejo', 'Verde Salvia', 'Terracota Suave'];

        const colorDotsHtml = availColors.map(cName => {
          const found = palette.find(x => x.name === cName);
          const hex = found ? found.hex : '#D8C8B8';
          return `<span title="${esc(cName)}" style="display:inline-block; width:12px; height:12px; border-radius:50%; background:${esc(hex)}; border:1px solid rgba(0,0,0,0.22); margin-right:3px; vertical-align:middle;"></span>`;
        }).join('');

        return `
          <tr data-prod-id="${esc(p.id)}">
            <td style="width:70px;">
              <img src="${esc(firstImg)}" alt="${esc(p.title)}" style="width:54px; height:54px; object-fit:cover; border-radius:6px; border:1px solid rgba(43,38,37,0.1);" />
            </td>
            <td>
              <strong>${esc(p.title)}</strong><br>
              <span style="font-size:0.76rem; color:#8A837A;">ID: ${esc(p.id)} &middot; ${esc(p.texture || 'Confección artesanal')} &middot; 📸 ${photoCount} foto${photoCount > 1 ? 's' : ''}</span>
              <div style="margin-top:4px; font-size:0.73rem; color:#5F5852;">
                🎨 Colores: ${colorDotsHtml} <span style="color:#8A837A;">(${availColors.length})</span>
              </div>
            </td>
            <td><span class="admin-badge admin-badge--ready">${esc(catNames[p.category] || p.category)}</span></td>
            <td><strong>${esc(p.price)}</strong></td>
            <td><span class="admin-badge admin-badge--production">${esc(p.tag || 'Taller')}</span></td>
            <td>
              <div style="display:flex; gap:0.5rem;">
                <button type="button" class="btn-admin-cta btn-edit-prod" style="padding:0.4rem 0.8rem; font-size:0.78rem;">✏️ Editar / Colores</button>
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
            adminToast('Producto eliminado del catálogo.');
            renderProductsTable();
          }
        });
      });
    }

    function openEditor(id = null) {
      if (!modal) return;
      modal.classList.add('is-open');

      const costInput = document.getElementById('edit-cost');
      const metersInput = document.getElementById('edit-meters');

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
        if (costInput) costInput.value = prod.cost || '';
        if (metersInput) metersInput.value = prod.metersPerUnit || '';
        if (allowEmbroideryCheckbox) allowEmbroideryCheckbox.checked = prod.allowEmbroidery !== false;
        renderColorCheckboxes(prod.availableColors);
        renderImageSlots(prod.images || []);
      } else {
        document.getElementById('edit-product-id').value = '';
        document.getElementById('edit-title').value = '';
        document.getElementById('edit-category').value = 'cuidado-personal';
        document.getElementById('edit-price').value = '$ 16.500 ARS';
        document.getElementById('edit-texture').value = 'Confección a mano con telas nobles';
        document.getElementById('edit-tag').value = 'Novedad de Taller';
        document.getElementById('edit-desc').value = '';
        if (costInput) costInput.value = '';
        if (metersInput) metersInput.value = '0.8';
        if (allowEmbroideryCheckbox) allowEmbroideryCheckbox.checked = true;
        renderColorCheckboxes(['Crudo Natural', 'Rosa Viejo', 'Verde Salvia', 'Terracota Suave']);
        renderImageSlots([{ label: 'Foto Principal', src: 'assets/images/hero-textile.jpg' }]);
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
        const costEl = document.getElementById('edit-cost');
        const metersEl = document.getElementById('edit-meters');
        const cost = costEl && costEl.value ? parseFloat(costEl.value) : undefined;
        const metersPerUnit = metersEl && metersEl.value ? parseFloat(metersEl.value) : undefined;
        const allowEmbroidery = allowEmbroideryCheckbox ? allowEmbroideryCheckbox.checked : true;

        const selectedColors = [];
        if (colorsListEl) {
          colorsListEl.querySelectorAll('.prod-color-checkbox:checked').forEach(chk => {
            selectedColors.push(chk.value);
          });
        }
        if (selectedColors.length === 0) {
          selectedColors.push('Crudo Natural');
        }

        if (!title) return;

        const catMap = {
          'cuidado-personal': 'Cuidado Personal & Descanso',
          'organizacion': 'Organización & Hogar',
          'infantil': 'Infantil & Bebés'
        };

        // Recolectar las hasta 4 fotos
        const collectedImages = [];
        if (imagesListEl) {
          imagesListEl.querySelectorAll('.admin-img-slot').forEach((slotEl, idx) => {
            const lbl = slotEl.querySelector('.slot-label-input').value.trim() || `Vista ${idx + 1}`;
            const src = slotEl.querySelector('.slot-src-input').value.trim();
            if (src) {
              collectedImages.push({ label: lbl, src: src });
            }
          });
        }
        if (collectedImages.length === 0) {
          collectedImages.push({ label: 'Foto Principal', src: 'assets/images/hero-textile.jpg' });
        }

        if (id) {
          const idx = products.findIndex(p => p.id === id);
          if (idx >= 0) {
            products[idx] = {
              ...products[idx],
              title,
              category: cat,
              categoryName: catMap[cat] || products[idx].categoryName || 'Colección',
              price,
              texture,
              tag,
              desc,
              cost: cost !== undefined ? cost : products[idx].cost,
              metersPerUnit: metersPerUnit !== undefined ? metersPerUnit : products[idx].metersPerUnit,
              availableColors: selectedColors,
              allowEmbroidery: allowEmbroidery,
              images: collectedImages
            };
          }
        } else {
          const newId = 'p' + (Date.now() % 100000);
          products.unshift({
            id: newId,
            title,
            category: cat,
            categoryName: catMap[cat] || 'Colección',
            price,
            texture,
            tag,
            desc,
            story: desc,
            cost: cost,
            metersPerUnit: metersPerUnit || 0.8,
            availableColors: selectedColors,
            allowEmbroidery: allowEmbroidery,
            images: collectedImages
          });
        }

        saveProducts();
        modal.classList.remove('is-open');
        adminToast('✨ Creación, colores disponibles y fotos guardados con éxito.');
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
    if (window.WorkshopDB && typeof window.WorkshopDB.getSettings === 'function') {
      settings = window.WorkshopDB.getSettings();
    } else {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
        if (saved) settings = JSON.parse(saved);
      } catch (e) {}
    }

    // --- Bloque 0: Conexión con Google Sheets + Apps Script ---
    const cloudUrlInput = document.getElementById('cfg-cloud-url');
    const notifyEmailInput = document.getElementById('cfg-notify-email');
    const sheetUrlInput = document.getElementById('cfg-sheet-url');
    const cloudStatusBadge = document.getElementById('cfg-cloud-status-badge');
    const cloudFeedback = document.getElementById('cfg-cloud-feedback');
    const btnSaveCloud = document.getElementById('btn-cfg-save-cloud');
    const btnPullCloud = document.getElementById('btn-cfg-pull-cloud');
    const btnPushCloud = document.getElementById('btn-cfg-push-cloud');
    const btnOpenSheet = document.getElementById('btn-cfg-open-sheet');

    function showCloudMessage(msg, isError = false) {
      if (!cloudFeedback) return;
      cloudFeedback.style.display = 'block';
      cloudFeedback.style.background = isError ? '#FFEBEE' : '#E8F5E9';
      cloudFeedback.style.color = isError ? '#C62828' : '#2E7D32';
      cloudFeedback.textContent = msg;
    }

    function updateCloudBadgeUI() {
      const currentUrl = window.WorkshopDB && window.WorkshopDB.getCloudUrl ? window.WorkshopDB.getCloudUrl() : '';
      const sheetLink = (sheetUrlInput && sheetUrlInput.value.trim()) || settings.google_sheet_url || localStorage.getItem('divinalocura_sheet_url') || '';
      if (cloudUrlInput && !cloudUrlInput.value) cloudUrlInput.value = currentUrl;
      if (notifyEmailInput && !notifyEmailInput.value) notifyEmailInput.value = settings.notify_email || '';
      if (sheetUrlInput && !sheetUrlInput.value) sheetUrlInput.value = sheetLink;

      if (btnOpenSheet) {
        if (sheetLink) {
          btnOpenSheet.href = sheetLink;
          btnOpenSheet.style.display = 'inline-flex';
        } else {
          btnOpenSheet.style.display = 'none';
        }
      }

      if (cloudStatusBadge) {
        if (currentUrl) {
          cloudStatusBadge.className = 'admin-badge admin-badge--delivered';
          cloudStatusBadge.textContent = '☁️ Conectado a Google Sheets';
        } else {
          cloudStatusBadge.className = 'admin-badge admin-badge--pending';
          cloudStatusBadge.textContent = '💾 Modo Local (Falta pegar URL de Google)';
        }
      }
      refreshCloudPill();
    }

    updateCloudBadgeUI();

    if (btnSaveCloud) {
      btnSaveCloud.addEventListener('click', async () => {
        const url = cloudUrlInput ? cloudUrlInput.value.trim() : '';
        const notifyEmail = notifyEmailInput ? notifyEmailInput.value.trim() : '';
        const sheetLink = sheetUrlInput ? sheetUrlInput.value.trim() : '';

        if (window.WorkshopDB && window.WorkshopDB.setCloudUrl) {
          window.WorkshopDB.setCloudUrl(url);
        }
        settings = {
          ...settings,
          cloud_script_url: url,
          notify_email: notifyEmail,
          google_sheet_url: sheetLink
        };
        if (window.WorkshopDB && window.WorkshopDB.saveSettings) {
          window.WorkshopDB.saveSettings(settings);
        } else {
          localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
        }

        updateCloudBadgeUI();

        if (!url) {
          showCloudMessage('💾 Se guardó en modo local. Cuando crees la planilla de Google, pegá la URL acá.', false);
          return;
        }

        btnSaveCloud.disabled = true;
        showCloudMessage('⏳ Conectando con Google Sheets y sincronizando datos...', false);
        try {
          if (notifyEmail && window.WorkshopDB.saveSecureCloudConfig) {
            await window.WorkshopDB.saveSecureCloudConfig({ notifyEmail });
          }
          const pullRes = await window.WorkshopDB.pullAllFromCloud();
          if (pullRes && pullRes.ok) {
            updateCloudBadgeUI();
            showCloudMessage('✅ ¡Conectado con éxito a Google Sheets! Todos los pedidos, catálogo y finanzas están sincronizados.', false);
            adminToast('☁️ Conectado con éxito a Google Sheets');
          } else {
            const pushRes = await window.WorkshopDB.pushAllToCloud();
            if (pushRes && pushRes.ok) {
              updateCloudBadgeUI();
              showCloudMessage('✅ ¡Planilla inicializada con todos los datos actuales del taller!', false);
              adminToast('☁️ Datos subidos a la planilla de Google');
            } else {
              showCloudMessage('⚠️ Se guardó la URL, pero verificá que la Aplicación Web de Google tenga acceso para "Cualquier persona".', true);
            }
          }
        } catch (err) {
          showCloudMessage('⚠️ Error al conectar: verificá que la URL termine en /exec y tenga permisos públicos.', true);
        } finally {
          btnSaveCloud.disabled = false;
        }
      });
    }

    if (btnPullCloud) {
      btnPullCloud.addEventListener('click', async () => {
        if (!window.WorkshopDB || !window.WorkshopDB.isCloudConfigured()) {
          showCloudMessage('Primero pegá la URL de Google Apps Script arriba.', true);
          return;
        }
        showCloudMessage('⏳ Trayendo últimos datos desde la planilla de Google...', false);
        const res = await window.WorkshopDB.pullAllFromCloud();
        if (res && res.ok) {
          updateCloudBadgeUI();
          showCloudMessage('✅ Datos actualizados desde la planilla de Google.', false);
          adminToast('🔄 Datos sincronizados desde Google Sheets');
        } else {
          showCloudMessage('❌ No se pudo leer la planilla: ' + (res && res.error ? res.error : 'Revisá la URL'), true);
        }
      });
    }

    if (btnPushCloud) {
      btnPushCloud.addEventListener('click', async () => {
        if (!window.WorkshopDB || !window.WorkshopDB.isCloudConfigured()) {
          showCloudMessage('Primero pegá la URL de Google Apps Script arriba.', true);
          return;
        }
        showCloudMessage('⏳ Subiendo todos los productos, pedidos, stock y gastos a las pestañas de Google Sheets...', false);
        const res = await window.WorkshopDB.pushAllToCloud();
        if (res && res.ok) {
          updateCloudBadgeUI();
          showCloudMessage('✅ ¡Todos los datos actuales fueron volcados en las hojas de la planilla de Google!', false);
          adminToast('📤 Planilla de Google actualizada por completo');
        } else {
          showCloudMessage('❌ Error al subir a la planilla: ' + (res && res.error ? res.error : 'Revisá permisos'), true);
        }
      });
    }

    // --- Bloque 0.5, 1 y 2: Interruptores de Secciones, Textos Completos, Contacto y Mercado Pago ---
    const form = document.getElementById('form-admin-settings');
    if (form) {
      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val || '';
      };
      const getVal = (id) => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
      };

      // Interruptores de visibilidad (Elena decide qué activar)
      const chkGiftBoxes = document.getElementById('cfg-show-gift-boxes');
      const chkCustomBuilder = document.getElementById('cfg-show-custom-builder');
      const chkFabricShowcase = document.getElementById('cfg-show-fabric-showcase');
      const chkEnableCoupons = document.getElementById('cfg-enable-coupons');

      if (chkGiftBoxes) chkGiftBoxes.checked = settings.show_gift_boxes !== false;
      if (chkCustomBuilder) chkCustomBuilder.checked = settings.show_custom_builder !== false;
      if (chkFabricShowcase) chkFabricShowcase.checked = settings.show_fabric_showcase !== false;
      if (chkEnableCoupons) chkEnableCoupons.checked = settings.enable_coupons === true;

      // Cargar todos los textos editables
      setVal('cfg-announcement', settings.announcement);
      setVal('cfg-hero-eyebrow', settings.hero_eyebrow);
      setVal('cfg-hero-title', settings.hero_title);
      setVal('cfg-hero-tagline', settings.hero_tagline);
      setVal('cfg-hero-cta', settings.hero_cta);

      setVal('cfg-cat-eyebrow', settings.categories_eyebrow);
      setVal('cfg-cat-title', settings.categories_title);
      setVal('cfg-cat-desc', settings.categories_desc);

      setVal('cfg-catalog-eyebrow', settings.catalog_eyebrow);
      setVal('cfg-catalog-title', settings.catalog_title);
      setVal('cfg-catalog-desc', settings.catalog_desc);

      setVal('cfg-fabrics-title', settings.fabrics_title);
      setVal('cfg-fabrics-desc', settings.fabrics_desc);

      setVal('cfg-builder-title', settings.builder_title);
      setVal('cfg-builder-desc', settings.builder_desc);

      setVal('cfg-gifts-title', settings.gifts_title);
      setVal('cfg-gifts-desc', settings.gifts_desc);

      setVal('cfg-about-eyebrow', settings.about_eyebrow);
      setVal('cfg-about-title', settings.about_title);
      setVal('cfg-about-lead', settings.about_lead);
      setVal('cfg-about-p1', settings.about_p1);

      setVal('cfg-spaces-eyebrow', settings.spaces_eyebrow);
      setVal('cfg-spaces-title', settings.spaces_title);
      setVal('cfg-spaces-desc', settings.spaces_desc);

      setVal('cfg-footer-title', settings.footer_title);
      setVal('cfg-footer-desc', settings.footer_desc);
      setVal('cfg-footer-tagline', settings.footer_tagline);

      setVal('cfg-whatsapp', settings.whatsapp_phone);
      setVal('cfg-instagram', settings.instagram_user);
      setVal('cfg-github-token', settings.gh_token);

      const mpLinkInput = document.getElementById('cfg-mp-link');
      const mpAliasInput = document.getElementById('cfg-mp-alias');
      const mpTokenInput = document.getElementById('cfg-mp-token');
      if (mpLinkInput) mpLinkInput.value = settings.mp_payment_link || '';
      if (mpAliasInput) mpAliasInput.value = settings.mp_alias || '';

      const btnResetTexts = document.getElementById('btn-cfg-reset-default-texts');
      if (btnResetTexts) {
        btnResetTexts.addEventListener('click', () => {
          if (!confirm('¿Querés volver todos los títulos y textos a como venían originalmente de fábrica?')) return;
          [
            'cfg-announcement', 'cfg-hero-eyebrow', 'cfg-hero-title', 'cfg-hero-tagline', 'cfg-hero-cta',
            'cfg-cat-eyebrow', 'cfg-cat-title', 'cfg-cat-desc',
            'cfg-catalog-eyebrow', 'cfg-catalog-title', 'cfg-catalog-desc',
            'cfg-fabrics-title', 'cfg-fabrics-desc',
            'cfg-builder-title', 'cfg-builder-desc',
            'cfg-gifts-title', 'cfg-gifts-desc',
            'cfg-about-eyebrow', 'cfg-about-title', 'cfg-about-lead', 'cfg-about-p1',
            'cfg-spaces-eyebrow', 'cfg-spaces-title', 'cfg-spaces-desc',
            'cfg-footer-title', 'cfg-footer-desc', 'cfg-footer-tagline'
          ].forEach(id => setVal(id, ''));
          form.dispatchEvent(new Event('submit'));
          adminToast('🔄 Todos los textos volvieron a los originales.');
        });
      }

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const mpTokenVal = mpTokenInput ? mpTokenInput.value.trim() : '';
        const notifyEmailVal = notifyEmailInput ? notifyEmailInput.value.trim() : (settings.notify_email || '');

        const updated = {
          ...settings,
          show_gift_boxes: chkGiftBoxes ? chkGiftBoxes.checked : true,
          show_custom_builder: chkCustomBuilder ? chkCustomBuilder.checked : true,
          show_fabric_showcase: chkFabricShowcase ? chkFabricShowcase.checked : true,
          enable_coupons: chkEnableCoupons ? chkEnableCoupons.checked : false,

          announcement: getVal('cfg-announcement'),
          hero_eyebrow: getVal('cfg-hero-eyebrow'),
          hero_title: getVal('cfg-hero-title'),
          hero_tagline: getVal('cfg-hero-tagline'),
          hero_cta: getVal('cfg-hero-cta'),

          categories_eyebrow: getVal('cfg-cat-eyebrow'),
          categories_title: getVal('cfg-cat-title'),
          categories_desc: getVal('cfg-cat-desc'),

          catalog_eyebrow: getVal('cfg-catalog-eyebrow'),
          catalog_title: getVal('cfg-catalog-title'),
          catalog_desc: getVal('cfg-catalog-desc'),

          fabrics_title: getVal('cfg-fabrics-title'),
          fabrics_desc: getVal('cfg-fabrics-desc'),

          builder_title: getVal('cfg-builder-title'),
          builder_desc: getVal('cfg-builder-desc'),

          gifts_title: getVal('cfg-gifts-title'),
          gifts_desc: getVal('cfg-gifts-desc'),

          about_eyebrow: getVal('cfg-about-eyebrow'),
          about_title: getVal('cfg-about-title'),
          about_lead: getVal('cfg-about-lead'),
          about_p1: getVal('cfg-about-p1'),

          spaces_eyebrow: getVal('cfg-spaces-eyebrow'),
          spaces_title: getVal('cfg-spaces-title'),
          spaces_desc: getVal('cfg-spaces-desc'),

          footer_title: getVal('cfg-footer-title'),
          footer_desc: getVal('cfg-footer-desc'),
          footer_tagline: getVal('cfg-footer-tagline'),

          whatsapp_phone: getVal('cfg-whatsapp'),
          instagram_user: getVal('cfg-instagram'),
          mp_payment_link: mpLinkInput ? mpLinkInput.value.trim() : '',
          mp_alias: mpAliasInput ? mpAliasInput.value.trim() : '',
          notify_email: notifyEmailVal,
          gh_token: getVal('cfg-github-token')
        };

        settings = updated;
        if (window.WorkshopDB && typeof window.WorkshopDB.saveSettings === 'function') {
          window.WorkshopDB.saveSettings(updated);
        } else {
          localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
        }

        if ((mpTokenVal || notifyEmailVal) && window.WorkshopDB && window.WorkshopDB.saveSecureCloudConfig) {
          await window.WorkshopDB.saveSecureCloudConfig({
            mpAccessToken: mpTokenVal || undefined,
            notifyEmail: notifyEmailVal || undefined
          });
          if (mpTokenInput) mpTokenInput.value = '';
        }

        adminToast('✨ Textos de la página, secciones visibles y configuración guardados con éxito.');
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

    // Configuración de Seguridad & Contraseñas (Elena & Juanma)
    const passSuccessMsg = document.getElementById('cfg-pass-msg-success');
    const passErrorMsg = document.getElementById('cfg-pass-msg-error');

    async function handleConfigPassChange(role, curInputId, newInputId) {
      if (passSuccessMsg) passSuccessMsg.style.display = 'none';
      if (passErrorMsg) passErrorMsg.style.display = 'none';

      const curInput = document.getElementById(curInputId);
      const newInput = document.getElementById(newInputId);
      const curPass = curInput ? curInput.value.trim() : '';
      const newPass = newInput ? newInput.value.trim() : '';

      if (!window.WorkshopDB || !window.WorkshopDB.verifyAdminPassword) {
        if (passErrorMsg) {
          passErrorMsg.textContent = 'El módulo de seguridad no está disponible.';
          passErrorMsg.style.display = 'block';
        }
        return;
      }

      if (!newPass || newPass.length < 3) {
        if (passErrorMsg) {
          passErrorMsg.textContent = '❌ La nueva contraseña debe tener al menos 3 caracteres.';
          passErrorMsg.style.display = 'block';
        }
        return;
      }

      let res;
      if (window.WorkshopDB.updateAdminPasswordAsync) {
        res = await window.WorkshopDB.updateAdminPasswordAsync(role, newPass, curPass);
      } else {
        const checkCurrent = window.WorkshopDB.verifyAdminPassword(role, curPass);
        if (!checkCurrent.valid) {
          res = { success: false, error: `La contraseña actual ingresada para ${role === 'elena' ? 'Elena' : 'Juanma'} no es correcta.` };
        } else {
          res = window.WorkshopDB.updateAdminPassword(role, newPass);
        }
      }

      if (res && res.success) {
        if (passSuccessMsg) {
          passSuccessMsg.textContent = `✅ ¡La contraseña de ${role === 'elena' ? 'Elena' : 'Juanma'} se actualizó con éxito!`;
          passSuccessMsg.style.display = 'block';
        }
        if (curInput) curInput.value = '';
        if (newInput) newInput.value = '';
        adminToast(`🔑 Clave de ${role === 'elena' ? 'Elena' : 'Juanma'} actualizada`);
      } else {
        if (passErrorMsg) {
          passErrorMsg.textContent = `❌ ${res && res.error ? res.error : 'La contraseña actual no es correcta.'}`;
          passErrorMsg.style.display = 'block';
        }
      }
    }

    const btnSavePassElena = document.getElementById('btn-cfg-save-pass-elena');
    if (btnSavePassElena) {
      btnSavePassElena.addEventListener('click', () => {
        handleConfigPassChange('elena', 'cfg-pass-elena-current', 'cfg-pass-elena-new');
      });
    }

    const btnSavePassJuanma = document.getElementById('btn-cfg-save-pass-juanma');
    if (btnSavePassJuanma) {
      btnSavePassJuanma.addEventListener('click', () => {
        handleConfigPassChange('juanma', 'cfg-pass-juanma-current', 'cfg-pass-juanma-new');
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
