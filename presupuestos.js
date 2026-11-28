/**
 * Divina Locura Deco — Sistema Integral de Presupuestos & Cotizaciones de Marca
 * Para Elena (Taller) y Juanma (Super Admin) + Visor Público para Clientas.
 */

(function () {
  'use strict';

  const INTRO_PRESETS = {
    formal: 'De nuestra mayor consideración, nos dirigimos a Ud. a fin de presentarle cotización artesanal de las siguientes creaciones confeccionadas a mano en nuestro taller:',
    calido: '¡Hola! Qué alegría acompañarte a vestir y organizar tus espacios. Te compartimos con mucha dedicación el presupuesto detallado de las piezas pensadas para vos:',
    mayorista: 'Nos complace acercarle nuestra propuesta por cantidad de piezas textiles artesanales, confeccionadas en telas nobles prelavadas con terminación de autor:'
  };

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

  function toast(msg) {
    if (window.DivinaLocuraAdmin && typeof window.DivinaLocuraAdmin.toast === 'function') {
      window.DivinaLocuraAdmin.toast(msg);
      return;
    }
    let box = document.getElementById('q-fallback-toast');
    if (!box) {
      box = document.createElement('div');
      box.id = 'q-fallback-toast';
      box.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99999;background:#2B2625;color:#FAF8F5;padding:12px 18px;border-radius:8px;border-left:4px solid #A45A44;font-size:0.86rem;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,0.25);transition:opacity 0.25s;';
      document.body.appendChild(box);
    }
    box.textContent = msg;
    box.style.opacity = '1';
    clearTimeout(box._t);
    box._t = setTimeout(() => { box.style.opacity = '0'; }, 3200);
  }

  function parseCatalogPrice(priceStr) {
    if (typeof priceStr === 'number') return priceStr;
    const raw = String(priceStr || '');
    const m = raw.match(/\$\s*([\d.,]+)/) || raw.match(/([\d.,]+)/);
    if (!m) return 15000;
    const cleaned = m[1].replace(/\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 15000;
  }

  function normalizeArPhoneForWa(phoneStr) {
    let digits = String(phoneStr || '').replace(/[^0-9]/g, '');
    if (!digits) return '';
    if (digits.startsWith('00')) digits = digits.slice(2);
    if (digits.startsWith('549')) return digits;
    if (digits.startsWith('54') && digits.length >= 12) return '549' + digits.slice(2);
    if (digits.startsWith('0')) digits = digits.slice(1);
    // Quitar prefijo local 15 si ingresaron ej: 1545678901 -> 1145678901
    if (digits.startsWith('15') && digits.length === 10) {
      digits = '11' + digits.slice(2);
    }
    if (digits.length >= 8 && digits.length <= 11) {
      return '549' + digits;
    }
    return digits;
  }

  function getWorkshopSettings() {
    const defaults = (typeof INITIAL_SITE_SETTINGS !== 'undefined' && INITIAL_SITE_SETTINGS) ? INITIAL_SITE_SETTINGS : {};
    if (window.WorkshopDB && typeof window.WorkshopDB.getSettings === 'function') {
      return window.WorkshopDB.getSettings(defaults);
    }
    return defaults;
  }

  function getShareUrlForQuote(quote) {
    const token = window.DivinaLocuraQuotePDF.encodeQuoteForUrl(quote);
    const base = window.location.href.split('?')[0].split('#')[0].replace(/\/[^/]*$/, '/');
    return `${base}presupuesto.html#q=${token}`;
  }

  function buildWhatsAppMessage(quote, includeOnlineLink = true) {
    const fmt = window.DivinaLocuraQuotePDF.formatMoneyArs;
    const totals = window.DivinaLocuraQuotePDF.computeQuoteTotals(quote);
    const cli = quote.client || {};
    const greetName = cli.attention || cli.company || '';
    const settings = getWorkshopSettings();
    const alias = settings.mp_alias || 'DIVINA.LOCURA.DECO';

    const lines = [];
    lines.push(`✨ *DIVINA LOCURA DECO* · _Taller Textil & Blanquería de Autor_`);
    lines.push(`📄 *Presupuesto N° ${quote.number || '000101'}* (${quote.date || new Date().toLocaleDateString('es-AR')})`);
    lines.push('');
    lines.push(greetName ? `¡Hola *${greetName}*! 🌸 Te compartimos el detalle de tu cotización artesanal:` : `¡Hola! 🌸 Te compartimos el detalle de tu cotización artesanal:`);
    lines.push('');

    (quote.items || []).forEach((it) => {
      const qty = Math.max(0, parseFloat(it.qty) || 0);
      const unit = Math.max(0, parseFloat(it.unitPrice) || 0);
      const sub = qty * unit;
      const altBadge = it.isAlternative ? ' _(Opción alternativa)_' : '';
      const varTxt = it.variant ? ` · _${it.variant}_` : '';
      lines.push(`• *${qty}x ${it.title}*${varTxt}${altBadge}`);
      lines.push(`   Unitario: ${fmt(unit, false)}  →  *Subtotal: ${fmt(sub, false)}*`);
    });

    if (quote.showTotals !== false && (quote.items || []).length > 0) {
      lines.push('');
      if (totals.discountAmount > 0) {
        lines.push(`🏷️ Bonificación aplicada: - ${fmt(totals.discountAmount, false)}`);
      }
      if (totals.shippingCost > 0) {
        lines.push(`🚚 Envío / Logística: ${fmt(totals.shippingCost, false)}`);
      }
      lines.push(`✨ *TOTAL COTIZADO: ${fmt(totals.totalAmount, false)} ARS*`);
      if (quote.showDeposit) {
        lines.push(`🪡 Seña 50% (inicio de confección): *${fmt(totals.depositAmount, false)}*`);
        lines.push(`📦 Saldo 50% (contra entrega): *${fmt(totals.pendingBalance, false)}*`);
      }
    }

    lines.push('');
    if (quote.deliveryTime) lines.push(`⏳ *Plazo estimado:* ${quote.deliveryTime}`);
    if (quote.validity) lines.push(`📅 *Validez:* ${quote.validity}`);
    lines.push(`💳 *Alias Transferencia / MP:* ${alias}`);

    if (includeOnlineLink) {
      const shareUrl = getShareUrlForQuote(quote);
      if (shareUrl && shareUrl.length < 7500) {
        lines.push('');
        lines.push(`🔗 *Ver y descargar presupuesto completo en PDF:*`);
        lines.push(shareUrl);
      }
    }

    lines.push('');
    lines.push(`Quedamos a tu disposición por cualquier medida, tela o detalle que quieras ajustar 🤍`);
    lines.push(`— *Elena · Divina Locura Deco*`);

    return lines.join('\n');
  }

  // ===========================================================================
  // RENDERIZADOR COMPARTIDO DE HOJAS A4 EN HTML (VISTA PREVIA + IMPRESIÓN + WEB)
  // ===========================================================================
  function renderQuoteHtmlSheets(quote, settings) {
    const pages = window.DivinaLocuraQuotePDF.paginateQuote(quote);
    const totals = window.DivinaLocuraQuotePDF.computeQuoteTotals(quote);
    const fmt = window.DivinaLocuraQuotePDF.formatMoneyArs;
    const contact = window.DivinaLocuraQuotePDF.buildBrandContactLines(settings);
    const themeKey = (quote && quote.theme) || 'terracota';
    const cli = (quote && quote.client) || {};

    return pages.map((page) => {
      const clientBlockHtml = page.isFirst ? `
        <div class="qa4-client-section">
          <div class="qa4-client-company">${esc(cli.company || cli.attention || 'CLIENTE ESPECIAL')}</div>
          ${(cli.attention || cli.phone || cli.location) ? `
            <div class="qa4-client-atte-row">
              <div class="qa4-client-atte">
                ${cli.attention ? `<strong>Atte.:</strong>&nbsp;&nbsp;<strong>${esc(cli.attention)}</strong>` : ''}
              </div>
              <div class="qa4-client-contact-meta">
                ${[cli.phone ? `Tel: ${esc(cli.phone)}` : '', cli.location ? esc(cli.location) : ''].filter(Boolean).join('  ·  ')}
              </div>
            </div>
          ` : ''}
          <p class="qa4-intro-text">${esc(quote.introText || INTRO_PRESETS.formal)}</p>
        </div>
      ` : '<div style="height:10px;"></div>';

      const tableHeadHtml = page.showTableHead ? `
        <div class="qa4-table-head">
          <div class="qa4-th">Producto</div>
          <div class="qa4-th">Cantidad</div>
          <div class="qa4-th">Precio Unitario</div>
          <div class="qa4-th">Subtotal</div>
        </div>
      ` : '';

      const itemsHtml = page.items.length > 0 ? `
        <div class="qa4-items-wrap">
          ${page.items.map((it) => {
            const qty = Math.max(0, parseFloat(it.qty) || 0);
            const unit = Math.max(0, parseFloat(it.unitPrice) || 0);
            const sub = qty * unit;
            return `
              <div class="qa4-item-row">
                <div class="qa4-item-left">
                  <div class="qa4-item-photo">
                    ${it.image
                      ? `<img src="${esc(it.image)}" alt="${esc(it.title)}" onerror="this.style.display='none';this.parentNode.innerHTML='<div class=\\'qa4-item-photo-placeholder\\'><span>DL</span><small>Artesanal</small></div>';" />`
                      : `<div class="qa4-item-photo-placeholder"><span>DL</span><small>Hecho a Mano</small></div>`
                    }
                  </div>
                  <div class="qa4-item-title-wrap">
                    <div class="qa4-item-title">${esc(it.title || 'PIEZA ARTESANAL')}</div>
                    ${it.variant ? `<div class="qa4-item-variant">${esc(it.variant)}</div>` : ''}
                    ${it.isAlternative ? `<br><span class="qa4-item-alt-tag">Opción Alternativa</span>` : ''}
                  </div>
                </div>
                <div class="qa4-item-right">
                  <div class="qa4-item-metrics">
                    <div class="qa4-metric-qty">${esc(qty)}</div>
                    <div class="qa4-metric-unit">${esc(fmt(unit, true))}</div>
                    <div class="qa4-metric-sub">${esc(fmt(sub, true))}</div>
                  </div>
                  <div class="qa4-item-desc">${esc(it.desc || '')}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : (page.isFirst ? `
        <div style="border:1px dashed #D5C8B9; border-radius:6px; padding:36px 24px; text-align:center; color:#8A837A; margin-top:12px; font-size:11px;">
          Agregá productos del catálogo o piezas personalizadas a medida desde el panel izquierdo para ver tu cotización aquí.
        </div>
      ` : '');

      let summaryHtml = '';
      if (page.showSummary) {
        const hasCond = !!(quote.deliveryTime || quote.paymentTerms || quote.footerNotes || (totals.hasAlternatives && quote.showTotals === false));
        const condBoxHtml = hasCond ? `
          <div class="qa4-conditions-box" style="${quote.showTotals === false ? 'grid-column: 1 / -1;' : ''}">
            <div class="qa4-conditions-title">Detalles de Confección Artesanal &amp; Condiciones</div>
            ${(totals.hasAlternatives && quote.showTotals === false) ? `<div class="qa4-conditions-line"><strong>Modalidad comparativa:</strong> Cada fila expresa el precio unitario y subtotal correspondiente a la escala de unidades cotizada.</div>` : ''}
            ${quote.deliveryTime ? `<div class="qa4-conditions-line"><strong>Plazo estimado:</strong> ${esc(quote.deliveryTime)}</div>` : ''}
            ${quote.paymentTerms ? `<div class="qa4-conditions-line"><strong>Forma de pago:</strong> ${esc(quote.paymentTerms)}</div>` : ''}
            ${quote.footerNotes ? `<div class="qa4-conditions-line" style="font-style:italic; color:#6C635C; margin-top:4px;">“${esc(quote.footerNotes)}”</div>` : ''}
          </div>
        ` : '<div></div>';

        const totalsBoxHtml = quote.showTotals !== false ? `
          <div class="qa4-totals-card">
            <div class="qa4-total-row">
              <span>Subtotal</span>
              <strong>${esc(fmt(totals.subtotal, true))}</strong>
            </div>
            ${totals.discountAmount > 0 ? `
              <div class="qa4-total-row" style="color:#2E6B47;">
                <span>Bonificación${Number(quote.discountPercent) > 0 ? ` (${esc(quote.discountPercent)}%)` : ''}</span>
                <strong>- ${esc(fmt(totals.discountAmount, true))}</strong>
              </div>
            ` : ''}
            ${totals.shippingCost > 0 ? `
              <div class="qa4-total-row">
                <span>Envío / Logística</span>
                <strong>${esc(fmt(totals.shippingCost, true))}</strong>
              </div>
            ` : ''}
            <div class="qa4-total-row qa4-total-row--grand">
              <span>TOTAL PRESUPUESTO</span>
              <span>${esc(fmt(totals.totalAmount, true))}</span>
            </div>
            ${quote.showDeposit ? `
              <div class="qa4-total-row qa4-total-row--deposit">
                <span>Seña 50% (Inicio Confección)</span>
                <strong>${esc(fmt(totals.depositAmount, true))}</strong>
              </div>
              <div class="qa4-total-row">
                <span>Saldo 50% (Contra Entrega)</span>
                <strong>${esc(fmt(totals.pendingBalance, true))}</strong>
              </div>
            ` : ''}
          </div>
        ` : '';

        summaryHtml = `
          <div class="qa4-summary-section">
            ${condBoxHtml}
            ${totalsBoxHtml}
          </div>
        `;
      }

      return `
        <article class="quote-a4-page" data-quote-theme="${esc(themeKey)}">
          <header class="qa4-header">
            <div class="qa4-brand">
              <div class="qa4-monogram">DL</div>
              <div class="qa4-brand-text">
                <div class="qa4-brand-name">Divina Locura Deco</div>
                <div class="qa4-brand-sub">Taller Textil &amp; Blanquería de Autor &middot; Por Elena</div>
              </div>
            </div>
            <div class="qa4-title-block">
              <div class="qa4-badge-box">PRESUPUESTO</div>
              <div class="qa4-quote-meta">Cotización N°: ${esc(quote.number || '000101')} &middot; ${esc(quote.date || new Date().toLocaleDateString('es-AR'))}</div>
              ${quote.validity ? `<div class="qa4-quote-validity">Validez de la oferta: ${esc(quote.validity)}</div>` : ''}
            </div>
          </header>

          ${clientBlockHtml}
          ${tableHeadHtml}
          ${itemsHtml}
          ${summaryHtml}

          <footer class="qa4-footer">
            <div class="qa4-footer-brand-bar">
              <div class="qa4-footer-line1">${esc(contact.line1)}</div>
              <div class="qa4-footer-line2">${esc(contact.line2)}</div>
            </div>
            <div class="qa4-footer-page-box">
              Página ${page.pageNumber} de ${page.totalPages}
            </div>
          </footer>
        </article>
      `;
    }).join('');
  }

  function fitScaleWrapToContainer(viewportEl, scaleWrapEl) {
    if (!viewportEl || !scaleWrapEl) return;
    const availW = Math.max(280, viewportEl.clientWidth - 28);
    const scale = Math.min(1, availW / 794);
    scaleWrapEl.style.transform = `scale(${scale})`;
    const pageEls = scaleWrapEl.querySelectorAll('.quote-a4-page');
    const count = pageEls.length || 1;
    const rawHeight = count * 1123 + Math.max(0, count - 1) * 24;
    viewportEl.style.minHeight = Math.round(rawHeight * scale + 36) + 'px';
    scaleWrapEl.style.marginBottom = Math.round((rawHeight * scale) - rawHeight) + 'px';
  }

  // ===========================================================================
  // PÁGINA DE ADMINISTRACIÓN: CONSTRUCTOR DE PRESUPUESTOS (admin-presupuestos.html)
  // ===========================================================================
  function createBlankQuote() {
    const nextNum = (window.WorkshopDB && window.WorkshopDB.getNextQuoteNumber)
      ? window.WorkshopDB.getNextQuoteNumber()
      : '000102';
    const role = localStorage.getItem('divinalocura_role') || 'elena';
    const settings = getWorkshopSettings();
    const alias = settings.mp_alias || 'DIVINA.LOCURA.DECO';

    return {
      id: 'COT-' + nextNum,
      number: nextNum,
      date: new Date().toLocaleDateString('es-AR'),
      validity: '10 días corridos',
      status: 'borrador',
      theme: 'terracota',
      client: {
        company: '',
        attention: '',
        phone: '',
        email: '',
        location: ''
      },
      introText: INTRO_PRESETS.formal,
      items: [],
      showTotals: true,
      showDeposit: true,
      discountPercent: 0,
      discountFixed: 0,
      shippingCost: 0,
      deliveryTime: '5 a 7 días hábiles desde la confirmación',
      paymentTerms: `Seña del 50% para iniciar confección · Saldo 50% contra entrega. Transferencia o Mercado Pago (Alias: ${alias}).`,
      footerNotes: 'Cada pieza es cortada y confeccionada a mano en nuestro taller con telas nobles prelavadas.',
      createdBy: role
    };
  }

  function initAdminPresupuestosPage() {
    if (!window.WorkshopDB) return;

    let currentQuote = createBlankQuote();
    let historyFilter = 'todos';
    let photoTargetItemUid = null;
    let customModalSelectedImg = '';

    // Referencias DOM
    const kpiTotalCount = document.getElementById('qkpi-count');
    const kpiTotalAmount = document.getElementById('qkpi-amount');
    const kpiPendingCount = document.getElementById('qkpi-pending');
    const kpiApprovedCount = document.getElementById('qkpi-approved');
    const kpiMarginAvg = document.getElementById('qkpi-margin');

    const inpNumber = document.getElementById('q-inp-number');
    const inpDate = document.getElementById('q-inp-date');
    const inpValidity = document.getElementById('q-inp-validity');
    const selStatus = document.getElementById('q-inp-status');
    const selClientQuick = document.getElementById('q-client-quick-select');
    const inpCompany = document.getElementById('q-inp-company');
    const inpAttention = document.getElementById('q-inp-attention');
    const inpPhone = document.getElementById('q-inp-phone');
    const inpLocation = document.getElementById('q-inp-location');
    const inpIntro = document.getElementById('q-inp-intro');

    const itemsListEl = document.getElementById('q-editor-items-list');
    const chkShowTotals = document.getElementById('q-chk-show-totals');
    const chkShowDeposit = document.getElementById('q-chk-show-deposit');
    const inpDiscPct = document.getElementById('q-inp-disc-pct');
    const inpDiscFix = document.getElementById('q-inp-disc-fix');
    const inpShipping = document.getElementById('q-inp-shipping');
    const inpDelivery = document.getElementById('q-inp-delivery');
    const inpPayment = document.getElementById('q-inp-payment');
    const inpFooterNotes = document.getElementById('q-inp-footer-notes');

    const elCostSum = document.getElementById('q-int-cost');
    const elProfitSum = document.getElementById('q-int-profit');
    const elMarginPct = document.getElementById('q-int-margin');

    const stageViewport = document.getElementById('q-stage-viewport');
    const stageScaleWrap = document.getElementById('q-stage-scale-wrap');
    const mobileTabPreviewBadge = document.getElementById('q-mob-pages-count');
    const mobileTabHistoryBadge = document.getElementById('q-mob-history-count');

    // Inicializar vista móvil por defecto
    if (!document.body.getAttribute('data-q-mobile-view')) {
      document.body.setAttribute('data-q-mobile-view', 'editor');
    }

    // 1. Comprobar parámetros de URL (?quoteId=..., ?fromOrder=..., ?clientPhone=..., #importQ=...)
    function checkUrlPrefill() {
      const hash = window.location.hash || '';
      const impMatch = hash.match(/[#&]importQ=([^&]+)/);
      if (impMatch && impMatch[1] && window.DivinaLocuraQuotePDF.decodeQuoteFromUrl) {
        const imported = window.DivinaLocuraQuotePDF.decodeQuoteFromUrl(impMatch[1]);
        if (imported) {
          imported.createdBy = 'clienta';
          imported.status = 'enviado';
          const allProducts = window.WorkshopDB.getProducts();
          imported.items = (imported.items || []).map((it) => {
            const matchProd = allProducts.find(p => String(p.title || '').toUpperCase() === String(it.title || '').toUpperCase());
            return Object.assign({}, it, {
              unitCost: matchProd && matchProd.cost ? Number(matchProd.cost) : Math.round((Number(it.unitPrice) || 0) * 0.4)
            });
          });
          window.WorkshopDB.saveQuote(imported);
          currentQuote = imported;
          if (window.history && window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
          toast(`🌸 Presupuesto #${imported.number} de la clienta importado para editar`);
          return;
        }
      }

      const params = new URLSearchParams(window.location.search);
      const qId = params.get('quoteId');
      const fromOrder = params.get('fromOrder');
      const clientPhone = params.get('clientPhone');
      const isNew = params.get('new');

      if (qId) {
        const found = window.WorkshopDB.getQuoteById(qId);
        if (found) {
          currentQuote = JSON.parse(JSON.stringify(found));
          return;
        }
      }

      if (fromOrder) {
        const ord = window.WorkshopDB.getOrders().find(o => o.id === fromOrder);
        if (ord) {
          const base = createBlankQuote();
          const allProducts = window.WorkshopDB.getProducts();
          base.client = {
            company: (ord.customer && ord.customer.name ? ord.customer.name.toUpperCase() : ''),
            attention: (ord.customer && ord.customer.name) || '',
            phone: (ord.customer && ord.customer.phone) || '',
            email: (ord.customer && ord.customer.email) || '',
            location: (ord.customer && ord.customer.address) || ''
          };
          base.deliveryTime = ord.estimatedDelivery || base.deliveryTime;
          base.items = (ord.items || []).map((it, idx) => {
            const catProd = allProducts.find(p => p.id === it.id);
            const uPrice = parseCatalogPrice(it.price);
            return {
              uid: 'qi-ord-' + Date.now() + '-' + idx,
              productId: catProd ? catProd.id : 'custom',
              isCustom: !catProd,
              isAlternative: false,
              title: String(it.title || 'PIEZA ARTESANAL').toUpperCase(),
              variant: catProd ? (catProd.tag || catProd.categoryName || '') : 'Confección a Medida',
              image: it.referenceImage || (catProd && catProd.images && catProd.images[0] ? catProd.images[0].src : ''),
              qty: Number(it.qty) || 1,
              unitPrice: uPrice,
              unitCost: catProd && catProd.cost ? Number(catProd.cost) : Math.round(uPrice * 0.42),
              desc: it.note || (catProd ? catProd.desc : 'Pieza confeccionada artesanalmente en el taller.')
            };
          });
          currentQuote = base;
          toast(`📋 Datos cargados desde el Pedido #${ord.id}`);
          return;
        }
      }

      if (clientPhone) {
        const cleanTarget = String(clientPhone).replace(/[^0-9]/g, '');
        const cli = window.WorkshopDB.getClients().find(c => String(c.phone || '').replace(/[^0-9]/g, '') === cleanTarget);
        if (cli) {
          const base = createBlankQuote();
          base.client = {
            company: (cli.name || '').toUpperCase(),
            attention: cli.name || '',
            phone: cli.phone || '',
            email: cli.email || '',
            location: cli.address || ''
          };
          currentQuote = base;
          toast(`👩 Clienta ${cli.name} cargada en el presupuesto`);
          return;
        }
      }

      if (!isNew) {
        const existing = window.WorkshopDB.getQuotes();
        if (existing.length > 0) {
          // Si hay un presupuesto recién creado o el de muestra inicial y aún no tocó nada, empezamos limpio pero con acceso rápido al historial,
          // o cargamos el primero si viene de muestra para que vea la hoja A4 vestida enseguida:
          currentQuote = JSON.parse(JSON.stringify(existing[0]));
        }
      }
    }

    function populateClientsDropdown() {
      if (!selClientQuick) return;
      const clients = window.WorkshopDB.getClients();
      selClientQuick.innerHTML = '<option value="">— Elegir clienta registrada o escribir abajo libremente —</option>' +
        clients.map(c => `<option value="${esc(c.id)}">${esc(c.name)} (${esc(c.phone || 'sin tel')})</option>`).join('');
    }

    function syncFormFromState() {
      if (inpNumber) inpNumber.value = currentQuote.number || '';
      if (inpDate) inpDate.value = currentQuote.date || '';
      if (inpValidity) inpValidity.value = currentQuote.validity || '';
      if (selStatus) selStatus.value = currentQuote.status || 'borrador';

      const cli = currentQuote.client || {};
      if (inpCompany) inpCompany.value = cli.company || '';
      if (inpAttention) inpAttention.value = cli.attention || '';
      if (inpPhone) inpPhone.value = cli.phone || '';
      if (inpLocation) inpLocation.value = cli.location || '';
      if (inpIntro) inpIntro.value = currentQuote.introText || INTRO_PRESETS.formal;

      if (chkShowTotals) chkShowTotals.checked = currentQuote.showTotals !== false;
      if (chkShowDeposit) chkShowDeposit.checked = !!currentQuote.showDeposit;
      if (inpDiscPct) inpDiscPct.value = currentQuote.discountPercent || 0;
      if (inpDiscFix) inpDiscFix.value = currentQuote.discountFixed || 0;
      if (inpShipping) inpShipping.value = currentQuote.shippingCost || 0;
      if (inpDelivery) inpDelivery.value = currentQuote.deliveryTime || '';
      if (inpPayment) inpPayment.value = currentQuote.paymentTerms || '';
      if (inpFooterNotes) inpFooterNotes.value = currentQuote.footerNotes || '';

      document.querySelectorAll('[data-q-theme-btn]').forEach((btn) => {
        btn.classList.toggle('is-active', btn.getAttribute('data-q-theme-btn') === (currentQuote.theme || 'terracota'));
      });

      renderEditorItems();
      renderLivePreview();
    }

    function renderEditorItems() {
      if (!itemsListEl) return;
      const items = currentQuote.items || [];
      const fmt = window.DivinaLocuraQuotePDF.formatMoneyArs;

      if (items.length === 0) {
        itemsListEl.innerHTML = `
          <div style="border:1.5px dashed #D7C9BA; border-radius:9px; padding:1.75rem 1.25rem; text-align:center; background:#FAF8F4;">
            <div style="font-size:1.5rem; margin-bottom:0.35rem;">🪡</div>
            <div style="font-weight:700; color:#2B2625; font-size:0.92rem; margin-bottom:0.25rem;">Todavía no hay creaciones en este presupuesto</div>
            <div style="font-size:0.8rem; color:#6C635C;">Tocá <strong>“+ Agregar del Catálogo”</strong> o <strong>“+ Personalizado a Medida”</strong> acá arriba para empezar.</div>
          </div>
        `;
        return;
      }

      itemsListEl.innerHTML = items.map((it, idx) => {
        const qty = Math.max(0, parseFloat(it.qty) || 0);
        const unit = Math.max(0, parseFloat(it.unitPrice) || 0);
        const sub = qty * unit;
        return `
          <div class="q-editor-item ${it.isAlternative ? 'is-alternative' : ''}" data-item-uid="${esc(it.uid)}">
            <div class="q-editor-item__top">
              <button type="button" class="q-editor-item__photo-btn btn-change-item-photo" title="Cambiar fotografía de este ítem">
                ${it.image
                  ? `<img src="${esc(it.image)}" alt="${esc(it.title)}" />`
                  : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-family:var(--font-serif);font-weight:700;color:#A45A44;font-size:1.1rem;">DL</div>`
                }
                <span class="q-editor-item__photo-overlay">📸 Foto</span>
              </button>

              <div class="q-editor-item__main">
                <input type="text" class="q-input inp-item-title" value="${esc(it.title)}" placeholder="Nombre del producto o pieza a medida" style="font-weight:700; text-transform:uppercase; font-size:0.82rem;" />
                <input type="text" class="q-input inp-item-variant" value="${esc(it.variant || '')}" placeholder="Tela, color o medida (ej: Satén Champán · 2,20 × 1,80 m)" style="font-size:0.79rem; padding:0.44rem 0.68rem;" />
              </div>
            </div>

            <div style="margin-top:0.6rem;">
              <textarea class="q-textarea inp-item-desc" rows="2" placeholder="Descripción detallada, telas prelavadas, bordado personalizado, terminaciones...">${esc(it.desc || '')}</textarea>
            </div>

            <div class="q-editor-item__numbers">
              <div>
                <label class="q-label">Cantidad</label>
                <input type="number" min="1" step="1" class="q-input inp-item-qty" value="${esc(qty)}" />
              </div>
              <div>
                <label class="q-label">Precio Unitario ($)</label>
                <input type="number" min="0" step="0.01" class="q-input inp-item-price" value="${esc(unit)}" />
              </div>
              <div>
                <label class="q-label">Subtotal Fila</label>
                <div class="q-editor-item__subtotal-box item-live-subtotal">${esc(fmt(sub, true))}</div>
              </div>
            </div>

            <div class="q-editor-item__toolbar">
              <div style="display:flex; align-items:center; gap:0.65rem; flex-wrap:wrap;">
                <label style="display:inline-flex; align-items:center; gap:0.35rem; font-size:0.74rem; font-weight:600; color:#5F5852; cursor:pointer;" title="Marcá esta casilla si estás cotizando otra escala de unidades del mismo producto (ej: 10u, 50u, 100u) y no querés que se duplique en el Total General">
                  <input type="checkbox" class="chk-item-alt" ${it.isAlternative ? 'checked' : ''} />
                  <span>Opción alternativa (no sumar al total)</span>
                </label>
                <label style="display:inline-flex; align-items:center; gap:0.3rem; font-size:0.72rem; color:#7A7067;" title="Costo interno unitario de taller (Solo visible para vos, nunca sale en el PDF)">
                  <span>Costo int. $:</span>
                  <input type="number" min="0" step="100" class="q-input inp-item-cost" value="${esc(it.unitCost || 0)}" style="width:84px; padding:0.22rem 0.45rem; font-size:0.74rem;" />
                </label>
              </div>

              <div style="display:flex; align-items:center; gap:0.35rem;">
                <button type="button" class="q-mini-btn btn-dup-item" title="Duplicar este producto abajo para cotizar otra cantidad o variante (ej: por 10, por 50, por 100)">
                  <span>📋 Otra cant.</span>
                </button>
                <button type="button" class="q-mini-btn btn-move-up" ${idx === 0 ? 'disabled style="opacity:0.4;"' : ''} title="Subir">↑</button>
                <button type="button" class="q-mini-btn btn-move-down" ${idx === items.length - 1 ? 'disabled style="opacity:0.4;"' : ''} title="Bajar">↓</button>
                <button type="button" class="q-mini-btn q-mini-btn--danger btn-del-item" title="Quitar ítem">🗑️</button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Eventos en línea de cada fila
      itemsListEl.querySelectorAll('.q-editor-item').forEach((rowEl) => {
        const uid = rowEl.getAttribute('data-item-uid');
        const findItem = () => (currentQuote.items || []).find(x => x.uid === uid);

        const onTextChange = () => {
          const item = findItem();
          if (!item) return;
          item.title = rowEl.querySelector('.inp-item-title').value;
          item.variant = rowEl.querySelector('.inp-item-variant').value;
          item.desc = rowEl.querySelector('.inp-item-desc').value;
          item.qty = Math.max(0, parseFloat(rowEl.querySelector('.inp-item-qty').value) || 0);
          item.unitPrice = Math.max(0, parseFloat(rowEl.querySelector('.inp-item-price').value) || 0);
          item.unitCost = Math.max(0, parseFloat(rowEl.querySelector('.inp-item-cost').value) || 0);
          const subBox = rowEl.querySelector('.item-live-subtotal');
          if (subBox) {
            subBox.textContent = fmt(item.qty * item.unitPrice, true);
          }
          renderLivePreview();
        };

        rowEl.querySelectorAll('.inp-item-title, .inp-item-variant, .inp-item-desc, .inp-item-qty, .inp-item-price, .inp-item-cost').forEach((inp) => {
          inp.addEventListener('input', onTextChange);
        });

        const altChk = rowEl.querySelector('.chk-item-alt');
        if (altChk) {
          altChk.addEventListener('change', () => {
            const item = findItem();
            if (!item) return;
            item.isAlternative = altChk.checked;
            rowEl.classList.toggle('is-alternative', item.isAlternative);
            renderLivePreview();
          });
        }

        const photoBtn = rowEl.querySelector('.btn-change-item-photo');
        if (photoBtn) {
          photoBtn.addEventListener('click', () => openPhotoPickerModal(uid));
        }

        const dupBtn = rowEl.querySelector('.btn-dup-item');
        if (dupBtn) {
          dupBtn.addEventListener('click', () => {
            const idxNow = currentQuote.items.findIndex(x => x.uid === uid);
            if (idxNow < 0) return;
            const orig = currentQuote.items[idxNow];
            const copy = JSON.parse(JSON.stringify(orig));
            copy.uid = 'qi-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
            copy.qty = orig.qty === 1 ? 10 : orig.qty * 2;
            copy.isAlternative = true;
            currentQuote.items.splice(idxNow + 1, 0, copy);
            renderEditorItems();
            renderLivePreview();
            toast('📋 Fila duplicada como opción por cantidad (podés ajustar cantidad y precio unitario)');
          });
        }

        const upBtn = rowEl.querySelector('.btn-move-up');
        if (upBtn) {
          upBtn.addEventListener('click', () => {
            const idxNow = currentQuote.items.findIndex(x => x.uid === uid);
            if (idxNow > 0) {
              const tmp = currentQuote.items[idxNow - 1];
              currentQuote.items[idxNow - 1] = currentQuote.items[idxNow];
              currentQuote.items[idxNow] = tmp;
              renderEditorItems();
              renderLivePreview();
            }
          });
        }

        const downBtn = rowEl.querySelector('.btn-move-down');
        if (downBtn) {
          downBtn.addEventListener('click', () => {
            const idxNow = currentQuote.items.findIndex(x => x.uid === uid);
            if (idxNow >= 0 && idxNow < currentQuote.items.length - 1) {
              const tmp = currentQuote.items[idxNow + 1];
              currentQuote.items[idxNow + 1] = currentQuote.items[idxNow];
              currentQuote.items[idxNow] = tmp;
              renderEditorItems();
              renderLivePreview();
            }
          });
        }

        const delBtn = rowEl.querySelector('.btn-del-item');
        if (delBtn) {
          delBtn.addEventListener('click', () => {
            currentQuote.items = currentQuote.items.filter(x => x.uid !== uid);
            renderEditorItems();
            renderLivePreview();
          });
        }
      });
    }

    function renderLivePreview() {
      const settings = getWorkshopSettings();
      const totals = window.DivinaLocuraQuotePDF.computeQuoteTotals(currentQuote);
      const fmt = window.DivinaLocuraQuotePDF.formatMoneyArs;

      if (elCostSum) elCostSum.textContent = fmt(totals.totalCost, false);
      if (elProfitSum) {
        elProfitSum.textContent = fmt(totals.estimatedProfit, false);
        elProfitSum.style.color = totals.estimatedProfit >= 0 ? '#1E6B47' : '#B43C32';
      }
      if (elMarginPct) elMarginPct.textContent = `${totals.profitMargin}% margen`;

      if (stageScaleWrap) {
        stageScaleWrap.innerHTML = renderQuoteHtmlSheets(currentQuote, settings);
        fitScaleWrapToContainer(stageViewport, stageScaleWrap);
        const pCount = stageScaleWrap.querySelectorAll('.quote-a4-page').length || 1;
        if (mobileTabPreviewBadge) mobileTabPreviewBadge.textContent = `${pCount} pág`;
      }
    }

    function refreshKpisAndHistory() {
      const quotes = window.WorkshopDB.getQuotes();
      const fmt = window.DivinaLocuraQuotePDF.formatMoneyArs;

      let sumAll = 0;
      let pendingCount = 0;
      let approvedCount = 0;
      let marginAcc = 0;
      let marginCount = 0;

      quotes.forEach((q) => {
        const t = window.DivinaLocuraQuotePDF.computeQuoteTotals(q);
        sumAll += t.totalAmount;
        if (q.status === 'enviado' || q.status === 'borrador') pendingCount++;
        if (q.status === 'aprobado') approvedCount++;
        if (t.totalAmount > 0) {
          marginAcc += t.profitMargin;
          marginCount++;
        }
      });

      if (kpiTotalCount) kpiTotalCount.textContent = String(quotes.length);
      if (kpiTotalAmount) kpiTotalAmount.textContent = `${fmt(sumAll, false)} cotizados`;
      if (kpiPendingCount) kpiPendingCount.textContent = String(pendingCount);
      if (kpiApprovedCount) kpiApprovedCount.textContent = String(approvedCount);
      if (kpiMarginAvg) kpiMarginAvg.textContent = marginCount > 0 ? `${Math.round(marginAcc / marginCount)}%` : '—';

      const navBadge = document.getElementById('nav-quotes-count');
      if (navBadge) navBadge.textContent = String(quotes.length);
      if (mobileTabHistoryBadge) mobileTabHistoryBadge.textContent = String(quotes.length);

      renderHistoryTable();
    }

    function renderHistoryTable() {
      const tbody = document.getElementById('q-history-tbody');
      if (!tbody) return;

      const searchEl = document.getElementById('q-history-search');
      const term = (searchEl ? searchEl.value : '').toLowerCase().trim();
      const all = window.WorkshopDB.getQuotes();
      const fmt = window.DivinaLocuraQuotePDF.formatMoneyArs;

      const filtered = all.filter((q) => {
        const matchStatus = historyFilter === 'todos' || q.status === historyFilter;
        const cliStr = `${(q.client && q.client.company) || ''} ${(q.client && q.client.attention) || ''} ${(q.client && q.client.phone) || ''}`.toLowerCase();
        const matchTerm = !term || String(q.number || '').toLowerCase().includes(term) || cliStr.includes(term);
        return matchStatus && matchTerm;
      });

      if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:#8A837A;">No se encontraron presupuestos con este filtro.</td></tr>`;
        return;
      }

      const statusLabels = {
        borrador: '📝 Borrador',
        enviado: '📲 Enviado',
        aprobado: '✅ Aprobado',
        vencido: '⏳ Archivado'
      };

      tbody.innerHTML = filtered.map((q) => {
        const t = window.DivinaLocuraQuotePDF.computeQuoteTotals(q);
        const cliName = (q.client && (q.client.company || q.client.attention)) || 'Sin destinatario';
        const subCli = (q.client && q.client.attention && q.client.company && q.client.attention.toUpperCase() !== q.client.company.toUpperCase())
          ? `<div style="font-size:0.75rem; color:#6C635C;">Atte.: ${esc(q.client.attention)}</div>`
          : '';
        return `
          <tr data-hist-id="${esc(q.id)}">
            <td>
              <strong>#${esc(q.number)}</strong>
              ${q.createdBy === 'clienta' ? `<div style="font-size:0.68rem; color:#A45A44; font-weight:700;">🌸 Web Clienta</div>` : ''}
            </td>
            <td>${esc(q.date || '-')}</td>
            <td>
              <div style="font-weight:600; color:#2B2625;">${esc(cliName)}</div>
              ${subCli}
            </td>
            <td>${(q.items || []).length} pieza(s)</td>
            <td><strong>${esc(fmt(t.totalAmount, false))}</strong></td>
            <td>
              <span class="q-status-pill q-status-pill--${esc(q.status || 'borrador')}">${statusLabels[q.status] || esc(q.status)}</span>
              ${q.linkedOrderId ? `<div style="font-size:0.7rem; color:#1E6B47; margin-top:3px; font-weight:600;">↳ Pedido #${esc(q.linkedOrderId)}</div>` : ''}
            </td>
            <td>
              <div style="display:flex; gap:0.35rem; flex-wrap:wrap;">
                <button type="button" class="q-mini-btn btn-hist-edit" title="Abrir y editar en el constructor">✏️ Abrir</button>
                <button type="button" class="q-mini-btn btn-hist-pdf" title="Descargar PDF directo">📥 PDF</button>
                <button type="button" class="q-mini-btn btn-hist-wa" title="Enviar por WhatsApp">💬 WA</button>
                <button type="button" class="q-mini-btn btn-hist-dup" title="Duplicar como nuevo presupuesto">📑</button>
                ${q.status !== 'aprobado' ? `<button type="button" class="q-mini-btn btn-hist-order" style="background:#EAF6EF; border-color:rgba(30,107,71,0.3); color:#1E6B47;" title="Aprobar y convertir en Pedido real del Taller">✨ A Pedido</button>` : ''}
                <button type="button" class="q-mini-btn q-mini-btn--danger btn-hist-del" title="Eliminar presupuesto">🗑️</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      tbody.querySelectorAll('tr[data-hist-id]').forEach((tr) => {
        const qId = tr.getAttribute('data-hist-id');
        const getQ = () => window.WorkshopDB.getQuoteById(qId);

        const editBtn = tr.querySelector('.btn-hist-edit');
        if (editBtn) {
          editBtn.addEventListener('click', () => {
            const q = getQ();
            if (!q) return;
            currentQuote = JSON.parse(JSON.stringify(q));
            syncFormFromState();
            setMobileView('editor');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            toast(`✏️ Editando Presupuesto #${q.number}`);
          });
        }

        const pdfBtn = tr.querySelector('.btn-hist-pdf');
        if (pdfBtn) {
          pdfBtn.addEventListener('click', async () => {
            const q = getQ();
            if (!q) return;
            pdfBtn.disabled = true;
            pdfBtn.textContent = '⏳...';
            try {
              await window.DivinaLocuraQuotePDF.downloadQuotePdf(q, getWorkshopSettings());
              toast(`📥 PDF del Presupuesto #${q.number} descargado.`);
            } finally {
              pdfBtn.disabled = false;
              pdfBtn.textContent = '📥 PDF';
            }
          });
        }

        const waBtn = tr.querySelector('.btn-hist-wa');
        if (waBtn) {
          waBtn.addEventListener('click', () => {
            const q = getQ();
            if (!q) return;
            currentQuote = JSON.parse(JSON.stringify(q));
            syncFormFromState();
            openWhatsAppModal();
          });
        }

        const dupBtn = tr.querySelector('.btn-hist-dup');
        if (dupBtn) {
          dupBtn.addEventListener('click', () => {
            const q = getQ();
            if (!q) return;
            const copy = JSON.parse(JSON.stringify(q));
            const nextNum = window.WorkshopDB.getNextQuoteNumber();
            copy.id = 'COT-' + nextNum;
            copy.number = nextNum;
            copy.date = new Date().toLocaleDateString('es-AR');
            copy.status = 'borrador';
            delete copy.linkedOrderId;
            window.WorkshopDB.saveQuote(copy);
            currentQuote = copy;
            syncFormFromState();
            refreshKpisAndHistory();
            setMobileView('editor');
            toast(`📑 Presupuesto duplicado como #${nextNum}`);
          });
        }

        const ordBtn = tr.querySelector('.btn-hist-order');
        if (ordBtn) {
          ordBtn.addEventListener('click', () => {
            const q = getQ();
            if (!q) return;
            const sendProd = confirm(`¿Querés convertir el Presupuesto #${q.number} en un Pedido confirmado?\n\nPresioná ACEPTAR para crearlo y enviarlo también a la línea de Producción (Corte de Telas).`);
            if (!sendProd && !confirm(`¿Querés crear solo el Pedido en estado Pendiente (sin pasarlo todavía a Producción)?`)) {
              return;
            }
            const res = window.WorkshopDB.convertQuoteToOrder(q.id, { sendToProduction: sendProd });
            if (res && res.ok) {
              if (currentQuote && currentQuote.id === q.id) {
                currentQuote.status = 'aprobado';
                currentQuote.linkedOrderId = res.order.id;
                syncFormFromState();
              }
              refreshKpisAndHistory();
              toast(`🎉 ¡Presupuesto #${q.number} convertido en Pedido #${res.order.id}!`);
            }
          });
        }

        const delBtn = tr.querySelector('.btn-hist-del');
        if (delBtn) {
          delBtn.addEventListener('click', () => {
            const q = getQ();
            if (!q) return;
            if (confirm(`¿Eliminar el Presupuesto #${q.number}?`)) {
              window.WorkshopDB.deleteQuote(q.id);
              refreshKpisAndHistory();
              toast(`🗑️ Presupuesto #${q.number} eliminado.`);
            }
          });
        }
      });
    }

    // 2. Vincular controles del formulario principal
    function bindMainFormEvents() {
      const syncHeaderFields = () => {
        currentQuote.number = (inpNumber ? inpNumber.value.trim() : '') || '000101';
        currentQuote.id = 'COT-' + currentQuote.number.replace(/[^0-9A-Za-z-]/g, '');
        currentQuote.date = inpDate ? inpDate.value : '';
        currentQuote.validity = inpValidity ? inpValidity.value : '';
        currentQuote.status = selStatus ? selStatus.value : 'borrador';
        currentQuote.client = {
          company: inpCompany ? inpCompany.value : '',
          attention: inpAttention ? inpAttention.value : '',
          phone: inpPhone ? inpPhone.value : '',
          email: (currentQuote.client && currentQuote.client.email) || '',
          location: inpLocation ? inpLocation.value : ''
        };
        currentQuote.introText = inpIntro ? inpIntro.value : '';
        currentQuote.showTotals = chkShowTotals ? chkShowTotals.checked : true;
        currentQuote.showDeposit = chkShowDeposit ? chkShowDeposit.checked : false;
        currentQuote.discountPercent = Math.max(0, parseFloat(inpDiscPct ? inpDiscPct.value : 0) || 0);
        currentQuote.discountFixed = Math.max(0, parseFloat(inpDiscFix ? inpDiscFix.value : 0) || 0);
        currentQuote.shippingCost = Math.max(0, parseFloat(inpShipping ? inpShipping.value : 0) || 0);
        currentQuote.deliveryTime = inpDelivery ? inpDelivery.value : '';
        currentQuote.paymentTerms = inpPayment ? inpPayment.value : '';
        currentQuote.footerNotes = inpFooterNotes ? inpFooterNotes.value : '';
        renderLivePreview();
      };

      [
        inpNumber, inpDate, inpValidity, selStatus,
        inpCompany, inpAttention, inpPhone, inpLocation, inpIntro,
        inpDiscPct, inpDiscFix, inpShipping, inpDelivery, inpPayment, inpFooterNotes
      ].forEach((el) => {
        if (el) el.addEventListener('input', syncHeaderFields);
      });

      [chkShowTotals, chkShowDeposit, selStatus].forEach((el) => {
        if (el) el.addEventListener('change', syncHeaderFields);
      });

      if (selClientQuick) {
        selClientQuick.addEventListener('change', () => {
          const cid = selClientQuick.value;
          if (!cid) return;
          const cli = window.WorkshopDB.getClients().find(c => c.id === cid);
          if (cli) {
            currentQuote.client = {
              company: (cli.name || '').toUpperCase(),
              attention: cli.name || '',
              phone: cli.phone || '',
              email: cli.email || '',
              location: cli.address || ''
            };
            syncFormFromState();
            toast(`👩 Datos de ${cli.name} completados`);
          }
        });
      }

      // Selector de tema visual del documento
      document.querySelectorAll('[data-q-theme-btn]').forEach((btn) => {
        btn.addEventListener('click', () => {
          currentQuote.theme = btn.getAttribute('data-q-theme-btn') || 'terracota';
          document.querySelectorAll('[data-q-theme-btn]').forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          renderLivePreview();
        });
      });

      // Plantillas de texto de saludo
      document.querySelectorAll('[data-q-intro-preset]').forEach((chip) => {
        chip.addEventListener('click', () => {
          const key = chip.getAttribute('data-q-intro-preset');
          if (INTRO_PRESETS[key] && inpIntro) {
            inpIntro.value = INTRO_PRESETS[key];
            currentQuote.introText = INTRO_PRESETS[key];
            renderLivePreview();
          }
        });
      });

      // Botón Nuevo Presupuesto en Blanco
      const btnNewQuote = document.getElementById('btn-q-new-blank');
      if (btnNewQuote) {
        btnNewQuote.addEventListener('click', () => {
          currentQuote = createBlankQuote();
          if (selClientQuick) selClientQuick.value = '';
          syncFormFromState();
          setMobileView('editor');
          toast(`✨ Nuevo Presupuesto #${currentQuote.number} listo para armar`);
        });
      }

      // Guardar Presupuesto
      document.querySelectorAll('.js-q-save-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const saved = window.WorkshopDB.saveQuote(currentQuote);
          if (saved) {
            currentQuote = JSON.parse(JSON.stringify(saved));
            refreshKpisAndHistory();
            toast(`💾 Presupuesto #${saved.number} guardado en el sistema.`);
          }
        });
      });

      // Descargar PDF Directo
      document.querySelectorAll('.js-q-download-pdf').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const origHtml = btn.innerHTML;
          btn.disabled = true;
          btn.innerHTML = '<span>⏳ Generando PDF A4...</span>';
          try {
            window.WorkshopDB.saveQuote(currentQuote);
            refreshKpisAndHistory();
            const res = await window.DivinaLocuraQuotePDF.downloadQuotePdf(currentQuote, getWorkshopSettings());
            toast(`📥 Descargado: ${res.filename}`);
          } catch (err) {
            alert('No se pudo generar el PDF: ' + (err && err.message ? err.message : err));
          } finally {
            btn.disabled = false;
            btn.innerHTML = origHtml;
          }
        });
      });

      // Imprimir / PDF Vectorial del navegador
      document.querySelectorAll('.js-q-print-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          window.WorkshopDB.saveQuote(currentQuote);
          refreshKpisAndHistory();
          window.print();
        });
      });

      // Descargar como Imagen HD (JPG para mandar directo en chat)
      const btnImgExport = document.getElementById('btn-q-download-jpg');
      if (btnImgExport) {
        btnImgExport.addEventListener('click', async () => {
          const orig = btnImgExport.innerHTML;
          btnImgExport.disabled = true;
          btnImgExport.innerHTML = '<span>⏳ Creando imagen...</span>';
          try {
            const count = await window.DivinaLocuraQuotePDF.downloadQuoteImages(currentQuote, getWorkshopSettings());
            toast(`🖼️ ${count} imagen(es) HD descargadas listas para WhatsApp.`);
          } finally {
            btnImgExport.disabled = false;
            btnImgExport.innerHTML = orig;
          }
        });
      }

      // Compartir archivo PDF nativo (Celulares Android / iPhone)
      const btnShareNative = document.getElementById('btn-q-share-native-pdf');
      if (btnShareNative) {
        btnShareNative.addEventListener('click', async () => {
          btnShareNative.disabled = true;
          try {
            window.WorkshopDB.saveQuote(currentQuote);
            refreshKpisAndHistory();
            const msg = buildWhatsAppMessage(currentQuote, false);
            const r = await window.DivinaLocuraQuotePDF.shareQuotePdfFile(currentQuote, getWorkshopSettings(), msg);
            if (r.shared) {
              window.WorkshopDB.updateQuoteStatus(currentQuote.id, 'enviado');
              currentQuote.status = 'enviado';
              if (selStatus) selStatus.value = 'enviado';
              refreshKpisAndHistory();
            } else {
              toast('📥 PDF descargado en tu dispositivo. Adjuntalo directo en el chat de WhatsApp.');
            }
          } catch (e) {
            // Cancelación del cuadro compartir del celular no es error
          } finally {
            btnShareNative.disabled = false;
          }
        });
      }

      // Abrir Modal de Envío por WhatsApp
      document.querySelectorAll('.js-q-open-wa').forEach((btn) => {
        btn.addEventListener('click', openWhatsAppModal);
      });

      // Pestañas móviles (Editor | Vista Previa A4 | Historial)
      document.querySelectorAll('[data-q-mob-tab]').forEach((tabBtn) => {
        tabBtn.addEventListener('click', () => {
          setMobileView(tabBtn.getAttribute('data-q-mob-tab'));
        });
      });

      // Filtros de historial
      document.querySelectorAll('[data-q-hist-filter]').forEach((fBtn) => {
        fBtn.addEventListener('click', () => {
          document.querySelectorAll('[data-q-hist-filter]').forEach(b => b.classList.remove('is-active'));
          fBtn.classList.add('is-active');
          historyFilter = fBtn.getAttribute('data-q-hist-filter');
          renderHistoryTable();
        });
      });

      const histSearch = document.getElementById('q-history-search');
      if (histSearch) histSearch.addEventListener('input', renderHistoryTable);

      window.addEventListener('resize', () => {
        fitScaleWrapToContainer(stageViewport, stageScaleWrap);
      });
    }

    function setMobileView(viewName) {
      document.body.setAttribute('data-q-mobile-view', viewName);
      document.querySelectorAll('[data-q-mob-tab]').forEach((b) => {
        b.classList.toggle('is-active', b.getAttribute('data-q-mob-tab') === viewName);
      });
      if (viewName === 'preview') {
        requestAnimationFrame(() => fitScaleWrapToContainer(stageViewport, stageScaleWrap));
      }
    }

    // -------------------------------------------------------------------------
    // 3. MODAL: AGREGAR PRODUCTOS DEL CATÁLOGO
    // -------------------------------------------------------------------------
    const catModal = document.getElementById('q-catalog-modal');
    const catGrid = document.getElementById('q-catalog-modal-grid');
    const catSearch = document.getElementById('q-catalog-search');
    let catActiveFilter = 'todos';

    function renderCatalogPicker() {
      if (!catGrid) return;
      const products = window.WorkshopDB.getProducts();
      const term = (catSearch ? catSearch.value : '').toLowerCase().trim();
      const fmt = window.DivinaLocuraQuotePDF.formatMoneyArs;

      const filtered = products.filter((p) => {
        const matchCat = catActiveFilter === 'todos' || p.category === catActiveFilter;
        const matchTerm = !term ||
          String(p.title || '').toLowerCase().includes(term) ||
          String(p.desc || '').toLowerCase().includes(term) ||
          String(p.texture || '').toLowerCase().includes(term);
        return matchCat && matchTerm;
      });

      if (filtered.length === 0) {
        catGrid.innerHTML = `<p style="grid-column:1/-1; text-align:center; color:#8A837A; padding:2rem;">No encontramos productos con esa búsqueda. Podés agregarlo como pieza personalizada a medida.</p>`;
        return;
      }

      catGrid.innerHTML = filtered.map((p) => {
        const numPrice = parseCatalogPrice(p.price);
        const mainImg = (p.images && p.images[0] && p.images[0].src) ? p.images[0].src : '';
        const colors = Array.isArray(p.availableColors) && p.availableColors.length > 0
          ? p.availableColors
          : ['Tono Clásico de Taller'];

        return `
          <div class="q-cat-prod-card" data-pick-pid="${esc(p.id)}">
            <img src="${esc(mainImg)}" alt="${esc(p.title)}" class="q-cat-prod-card__img" />
            <div class="q-cat-prod-card__body">
              <div style="font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#8C7A6B;">${esc(p.categoryName || p.category)}</div>
              <h4 class="q-cat-prod-card__title">${esc(p.title)}</h4>
              <div class="q-cat-prod-card__price">${esc(fmt(numPrice, false))}</div>
              <div style="display:grid; grid-template-columns:1fr 68px; gap:0.4rem; margin-top:0.25rem;">
                <select class="q-select pick-color-sel" style="padding:0.36rem 0.5rem; font-size:0.75rem;">
                  ${colors.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}
                </select>
                <input type="number" min="1" value="1" class="q-input pick-qty-inp" style="padding:0.36rem 0.45rem; font-size:0.78rem; text-align:center;" title="Cantidad" />
              </div>
              <button type="button" class="btn-admin-cta btn-pick-add-now" style="width:100%; justify-content:center; margin-top:auto; padding:0.5rem;">
                <span>＋ Agregar al Presupuesto</span>
              </button>
            </div>
          </div>
        `;
      }).join('');

      catGrid.querySelectorAll('.q-cat-prod-card').forEach((card) => {
        const pid = card.getAttribute('data-pick-pid');
        const btn = card.querySelector('.btn-pick-add-now');
        if (!btn) return;
        btn.addEventListener('click', () => {
          const prod = products.find(x => x.id === pid);
          if (!prod) return;
          const chosenColor = card.querySelector('.pick-color-sel').value;
          const chosenQty = Math.max(1, parseInt(card.querySelector('.pick-qty-inp').value, 10) || 1);
          const uPrice = parseCatalogPrice(prod.price);
          const mainImg = (prod.images && prod.images[0] && prod.images[0].src) ? prod.images[0].src : '';

          currentQuote.items.push({
            uid: 'qi-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            productId: prod.id,
            isCustom: false,
            isAlternative: false,
            title: String(prod.title || '').toUpperCase(),
            variant: [prod.texture, chosenColor ? `Tono: ${chosenColor}` : ''].filter(Boolean).join(' · '),
            image: mainImg,
            qty: chosenQty,
            unitPrice: uPrice,
            unitCost: prod.cost ? Number(prod.cost) : Math.round(uPrice * 0.4),
            desc: prod.desc || ''
          });

          renderEditorItems();
          renderLivePreview();
          toast(`🛍️ Agregado: ${chosenQty}x ${prod.title}`);
        });
      });
    }

    const btnOpenCatalog = document.getElementById('btn-q-add-catalog');
    if (btnOpenCatalog && catModal) {
      btnOpenCatalog.addEventListener('click', () => {
        catModal.classList.add('is-open');
        renderCatalogPicker();
      });
    }
    if (catSearch) catSearch.addEventListener('input', renderCatalogPicker);
    document.querySelectorAll('[data-q-cat-pill]').forEach((pill) => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('[data-q-cat-pill]').forEach(p => p.classList.remove('is-active'));
        pill.classList.add('is-active');
        catActiveFilter = pill.getAttribute('data-q-cat-pill');
        renderCatalogPicker();
      });
    });

    // -------------------------------------------------------------------------
    // 4. MODAL: AGREGAR CREACIÓN PERSONALIZADA / A MEDIDA
    // -------------------------------------------------------------------------
    const customModal = document.getElementById('q-custom-modal');
    const customTitleInp = document.getElementById('q-cust-title');
    const customFabricSel = document.getElementById('q-cust-fabric');
    const customVariantInp = document.getElementById('q-cust-variant');
    const customQtyInp = document.getElementById('q-cust-qty');
    const customPriceInp = document.getElementById('q-cust-price');
    const customCostInp = document.getElementById('q-cust-cost');
    const customDescInp = document.getElementById('q-cust-desc');
    const customImgPreview = document.getElementById('q-cust-img-preview');
    const customFileInp = document.getElementById('q-cust-file-input');

    function updateCustomModalPreview() {
      if (!customImgPreview) return;
      if (customModalSelectedImg) {
        customImgPreview.innerHTML = `<img src="${esc(customModalSelectedImg)}" alt="Vista previa" style="width:100%;height:100%;object-fit:cover;" />`;
      } else {
        customImgPreview.innerHTML = `<div style="text-align:center;color:#A45A44;font-family:var(--font-serif);font-weight:700;font-size:1.25rem;">DL<div style="font-family:var(--font-sans);font-size:0.62rem;color:#8C7A6B;font-weight:600;">SELLO TALLER</div></div>`;
      }
    }

    const btnOpenCustom = document.getElementById('btn-q-add-custom');
    if (btnOpenCustom && customModal) {
      btnOpenCustom.addEventListener('click', () => {
        customModalSelectedImg = '';
        if (customTitleInp) customTitleInp.value = '';
        if (customVariantInp) customVariantInp.value = '';
        if (customQtyInp) customQtyInp.value = '1';
        if (customPriceInp) customPriceInp.value = '';
        if (customCostInp) customCostInp.value = '';
        if (customDescInp) customDescInp.value = '';

        if (customFabricSel && window.WorkshopDB.getShowcaseFabrics) {
          const fabrics = window.WorkshopDB.getShowcaseFabrics();
          customFabricSel.innerHTML = '<option value="">— Elegir tela noble del taller (opcional) —</option>' +
            fabrics.map(f => `<option value="${esc(f.id)}">${esc(f.name)}</option>`).join('');
        }
        updateCustomModalPreview();
        customModal.classList.add('is-open');
        setTimeout(() => { if (customTitleInp) customTitleInp.focus(); }, 80);
      });
    }

    if (customFabricSel) {
      customFabricSel.addEventListener('change', () => {
        const fid = customFabricSel.value;
        if (!fid || !window.WorkshopDB.getShowcaseFabrics) return;
        const fab = window.WorkshopDB.getShowcaseFabrics().find(f => f.id === fid);
        if (!fab) return;
        if (customVariantInp && !customVariantInp.value.trim()) {
          customVariantInp.value = `${fab.name} · Prelavado en Taller`;
        }
        if (!customModalSelectedImg && fab.img) {
          customModalSelectedImg = fab.img;
          updateCustomModalPreview();
        }
      });
    }

    if (customFileInp) {
      customFileInp.addEventListener('change', async () => {
        const file = customFileInp.files && customFileInp.files[0];
        if (!file) return;
        try {
          const processed = await window.WorkshopDB.processAndUploadImage(file, 900, 0.84);
          customModalSelectedImg = processed.url;
          updateCustomModalPreview();
          toast('📸 Foto cargada para la pieza a medida');
        } catch (err) {
          alert('No se pudo leer la imagen.');
        }
      });
    }

    const btnCustomPickBank = document.getElementById('btn-cust-pick-bank');
    if (btnCustomPickBank) {
      btnCustomPickBank.addEventListener('click', () => {
        openPhotoPickerModal('__CUSTOM_MODAL__');
      });
    }

    const btnCustomConfirm = document.getElementById('btn-cust-confirm-add');
    if (btnCustomConfirm) {
      btnCustomConfirm.addEventListener('click', () => {
        const title = (customTitleInp ? customTitleInp.value.trim() : '') || 'CONFECCIÓN PERSONALIZADA A MEDIDA';
        const variant = customVariantInp ? customVariantInp.value.trim() : 'Hecho a Medida en Taller';
        const qty = Math.max(1, parseFloat(customQtyInp ? customQtyInp.value : 1) || 1);
        const price = Math.max(0, parseFloat(customPriceInp ? customPriceInp.value : 0) || 0);
        const cost = Math.max(0, parseFloat(customCostInp ? customCostInp.value : 0) || Math.round(price * 0.4));
        const desc = (customDescInp ? customDescInp.value.trim() : '') || 'Pieza confeccionada artesanalmente a medida según especificaciones acordadas con la clienta.';

        currentQuote.items.push({
          uid: 'qi-cust-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          productId: 'custom',
          isCustom: true,
          isAlternative: false,
          title: title.toUpperCase(),
          variant: variant,
          image: customModalSelectedImg,
          qty: qty,
          unitPrice: price,
          unitCost: cost,
          desc: desc
        });

        customModal.classList.remove('is-open');
        renderEditorItems();
        renderLivePreview();
        toast(`✨ Pieza a medida agregada: ${title}`);
      });
    }

    // -------------------------------------------------------------------------
    // 5. MODAL: SELECTOR DE FOTOGRAFÍA (BANCO VISUAL 105+ FOTOS + SUBIDA CELULAR)
    // -------------------------------------------------------------------------
    const photoModal = document.getElementById('q-photo-picker-modal');
    const photoGrid = document.getElementById('q-photo-picker-grid');
    const photoSearch = document.getElementById('q-photo-picker-search');
    const photoUploadInp = document.getElementById('q-photo-upload-input');

    function applyChosenPhoto(src) {
      if (photoTargetItemUid === '__CUSTOM_MODAL__') {
        customModalSelectedImg = src;
        updateCustomModalPreview();
      } else {
        const item = (currentQuote.items || []).find(x => x.uid === photoTargetItemUid);
        if (item) {
          item.image = src;
          renderEditorItems();
          renderLivePreview();
        }
      }
      if (photoModal) photoModal.classList.remove('is-open');
    }

    function openPhotoPickerModal(targetUid) {
      photoTargetItemUid = targetUid;
      if (!photoModal || !photoGrid) return;
      renderPhotoBankGrid();
      photoModal.classList.add('is-open');
    }

    function renderPhotoBankGrid() {
      if (!photoGrid) return;
      const bank = window.WorkshopDB.getImageBank ? window.WorkshopDB.getImageBank() : [];
      const products = window.WorkshopDB.getProducts ? window.WorkshopDB.getProducts() : [];
      const term = (photoSearch ? photoSearch.value : '').toLowerCase().trim();

      const combined = [];
      const seen = new Set();

      // Si estamos editando un producto del catálogo, mostrar sus ángulos primero
      if (photoTargetItemUid && photoTargetItemUid !== '__CUSTOM_MODAL__') {
        const curItem = (currentQuote.items || []).find(x => x.uid === photoTargetItemUid);
        if (curItem && curItem.productId && curItem.productId !== 'custom') {
          const prod = products.find(p => p.id === curItem.productId);
          if (prod && Array.isArray(prod.images)) {
            prod.images.forEach((im) => {
              if (im && im.src && !seen.has(im.src)) {
                seen.add(im.src);
                combined.push({ title: `★ ${im.label || prod.title}`, category: 'De este producto', src: im.src });
              }
            });
          }
        }
      }

      bank.forEach((b) => {
        if (b && b.src && !seen.has(b.src)) {
          seen.add(b.src);
          combined.push({ title: b.title || 'Foto Taller', category: b.category || 'Banco', src: b.src });
        }
      });

      const filtered = combined.filter(it =>
        !term || it.title.toLowerCase().includes(term) || it.category.toLowerCase().includes(term)
      );

      photoGrid.innerHTML = filtered.slice(0, 80).map((it) => `
        <button type="button" class="bank-picker-item" data-chosen-src="${esc(it.src)}">
          <img src="${esc(it.src)}" alt="${esc(it.title)}" loading="lazy" />
          <span>${esc(it.title)}</span>
        </button>
      `).join('');

      photoGrid.querySelectorAll('[data-chosen-src]').forEach((btn) => {
        btn.addEventListener('click', () => {
          applyChosenPhoto(btn.getAttribute('data-chosen-src'));
        });
      });
    }

    if (photoSearch) photoSearch.addEventListener('input', renderPhotoBankGrid);
    if (photoUploadInp) {
      photoUploadInp.addEventListener('change', async () => {
        const file = photoUploadInp.files && photoUploadInp.files[0];
        if (!file) return;
        try {
          const res = await window.WorkshopDB.processAndUploadImage(file, 900, 0.84);
          applyChosenPhoto(res.url);
          toast('📸 Foto propia subida y aplicada');
        } catch (err) {
          alert('No se pudo procesar la foto.');
        }
      });
    }

    const btnNoPhoto = document.getElementById('btn-photo-use-monogram');
    if (btnNoPhoto) {
      btnNoPhoto.addEventListener('click', () => applyChosenPhoto(''));
    }

    // -------------------------------------------------------------------------
    // 6. MODAL: ENVIAR POR WHATSAPP (MENSAJE EDITABLE + LINK + ADJUNTAR PDF)
    // -------------------------------------------------------------------------
    const waModal = document.getElementById('q-whatsapp-modal');
    const waPhoneInp = document.getElementById('q-wa-modal-phone');
    const waTextInp = document.getElementById('q-wa-modal-text');
    const waChkLink = document.getElementById('q-wa-chk-link');

    function openWhatsAppModal() {
      window.WorkshopDB.saveQuote(currentQuote);
      refreshKpisAndHistory();
      if (!waModal) return;
      if (waPhoneInp) waPhoneInp.value = (currentQuote.client && currentQuote.client.phone) || '';
      if (waTextInp) waTextInp.value = buildWhatsAppMessage(currentQuote, waChkLink ? waChkLink.checked : true);
      waModal.classList.add('is-open');
    }

    if (waChkLink && waTextInp) {
      waChkLink.addEventListener('change', () => {
        waTextInp.value = buildWhatsAppMessage(currentQuote, waChkLink.checked);
      });
    }

    const btnWaSendNow = document.getElementById('btn-q-wa-send-now');
    if (btnWaSendNow) {
      btnWaSendNow.addEventListener('click', () => {
        const rawPhone = waPhoneInp ? waPhoneInp.value.trim() : '';
        if (rawPhone && currentQuote.client) {
          currentQuote.client.phone = rawPhone;
          if (inpPhone) inpPhone.value = rawPhone;
        }
        const cleanWa = normalizeArPhoneForWa(rawPhone);
        const text = waTextInp ? waTextInp.value : buildWhatsAppMessage(currentQuote, true);

        currentQuote.status = 'enviado';
        if (selStatus) selStatus.value = 'enviado';
        window.WorkshopDB.saveQuote(currentQuote);
        refreshKpisAndHistory();

        const targetUrl = cleanWa
          ? `https://wa.me/${cleanWa}?text=${encodeURIComponent(text)}`
          : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(targetUrl, '_blank', 'noopener');
        if (waModal) waModal.classList.remove('is-open');
      });
    }

    const btnWaCopyLink = document.getElementById('btn-q-wa-copy-link');
    if (btnWaCopyLink) {
      btnWaCopyLink.addEventListener('click', async () => {
        const url = getShareUrlForQuote(currentQuote);
        try {
          await navigator.clipboard.writeText(url);
          toast('🔗 Enlace online del presupuesto copiado al portapapeles');
        } catch (e) {
          prompt('Copiá este enlace del presupuesto:', url);
        }
      });
    }

    const btnWaDownloadPdf = document.getElementById('btn-q-wa-download-pdf');
    if (btnWaDownloadPdf) {
      btnWaDownloadPdf.addEventListener('click', async () => {
        btnWaDownloadPdf.disabled = true;
        try {
          const r = await window.DivinaLocuraQuotePDF.downloadQuotePdf(currentQuote, getWorkshopSettings());
          toast(`📥 PDF descargado (${r.filename}). Ya podés adjuntarlo en WhatsApp.`);
        } finally {
          btnWaDownloadPdf.disabled = false;
        }
      });
    }

    // Cerrar cualquier modal con [data-q-close-modal] o tecla Escape
    document.querySelectorAll('[data-q-close-modal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const backdrop = btn.closest('.q-modal-backdrop');
        if (backdrop) backdrop.classList.remove('is-open');
      });
    });
    document.querySelectorAll('.q-modal-backdrop').forEach((backdrop) => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) backdrop.classList.remove('is-open');
      });
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.q-modal-backdrop.is-open').forEach(m => m.classList.remove('is-open'));
      }
    });

    // Secuencia inicial
    populateClientsDropdown();
    checkUrlPrefill();
    bindMainFormEvents();
    syncFormFromState();
    refreshKpisAndHistory();
  }

  // ===========================================================================
  // VISOR PÚBLICO DE PRESUPUESTO PARA CLIENTAS (presupuesto.html)
  // ===========================================================================
  function initPublicQuoteViewer() {
    const stageViewport = document.getElementById('public-quote-stage');
    const scaleWrap = document.getElementById('public-quote-scale-wrap');
    if (!stageViewport || !scaleWrap) return;

    let quote = null;
    const hash = window.location.hash || '';
    const m = hash.match(/[#&]q=([^&]+)/);
    if (m && m[1]) {
      quote = window.DivinaLocuraQuotePDF.decodeQuoteFromUrl(m[1]);
    }
    if (!quote) {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      if (id && window.WorkshopDB && window.WorkshopDB.getQuoteById) {
        quote = window.WorkshopDB.getQuoteById(id);
      }
    }
    if (!quote && window.WorkshopDB && window.WorkshopDB.getQuotes) {
      const list = window.WorkshopDB.getQuotes();
      if (list.length > 0) quote = list[0];
    }

    if (!quote) {
      scaleWrap.innerHTML = `
        <div style="background:#FFFFFF; border:1px solid #E2D9CE; border-radius:10px; padding:3rem 2rem; text-align:center; max-width:520px; margin:2rem auto;">
          <h2 style="font-family:'Playfair Display',serif; margin-bottom:0.5rem;">Presupuesto no encontrado</h2>
          <p style="font-size:0.9rem; color:#5F5852; margin-bottom:1.25rem;">El enlace puede estar incompleto. Escribinos por WhatsApp y te lo reenviamos enseguida.</p>
          <a href="index.html" class="btn-admin-cta">Ir a la Tienda Divina Locura Deco</a>
        </div>
      `;
      return;
    }

    const settings = getWorkshopSettings();
    document.title = `Presupuesto #${quote.number} · Divina Locura Deco`;

    const titleBadge = document.getElementById('pub-q-number-label');
    if (titleBadge) titleBadge.textContent = `Cotización #${quote.number}`;

    scaleWrap.innerHTML = renderQuoteHtmlSheets(quote, settings);
    fitScaleWrapToContainer(stageViewport, scaleWrap);
    window.addEventListener('resize', () => fitScaleWrapToContainer(stageViewport, scaleWrap));

    const btnPdf = document.getElementById('pub-btn-download-pdf');
    if (btnPdf) {
      btnPdf.addEventListener('click', async () => {
        const orig = btnPdf.innerHTML;
        btnPdf.disabled = true;
        btnPdf.innerHTML = '<span>⏳ Descargando PDF...</span>';
        try {
          await window.DivinaLocuraQuotePDF.downloadQuotePdf(quote, settings);
        } finally {
          btnPdf.disabled = false;
          btnPdf.innerHTML = orig;
        }
      });
    }

    const btnPrint = document.getElementById('pub-btn-print');
    if (btnPrint) btnPrint.addEventListener('click', () => window.print());

    const btnApproveWa = document.getElementById('pub-btn-approve-wa');
    if (btnApproveWa) {
      const rawTallerWa = String(settings.whatsapp_phone || '5491136932471').replace(/[^0-9]/g, '');
      const tallerPhone = (rawTallerWa && rawTallerWa !== '5491100000000') ? rawTallerWa : '5491136932471';
      const totals = window.DivinaLocuraQuotePDF.computeQuoteTotals(quote);
      const fmt = window.DivinaLocuraQuotePDF.formatMoneyArs;
      const clientName = (quote.client && (quote.client.attention || quote.client.company)) || '';
      const msg = `¡Hola Elena! 🌸 Vi el *Presupuesto N° ${quote.number}*${clientName ? ` a nombre de ${clientName}` : ''}${quote.showTotals !== false ? ` por ${fmt(totals.totalAmount, false)}` : ''} y quiero confirmarlo para avanzar con la confección.`;
      btnApproveWa.href = `https://wa.me/${tallerPhone}?text=${encodeURIComponent(msg)}`;
    }

    const btnEditAdmin = document.getElementById('pub-btn-edit-admin');
    if (btnEditAdmin) {
      const tok = window.DivinaLocuraQuotePDF.encodeQuoteForUrl(quote);
      btnEditAdmin.href = `admin-presupuestos.html#importQ=${tok}`;
    }
  }

  // ===========================================================================
  // AUTOGESTIÓN PARA CLIENTAS: ARMÁ TU PROPIO PRESUPUESTO (cotizar.html)
  // Precios oficiales protegidos + Catálogo + Piezas a Medida + Bolsa + PDF/WA
  // ===========================================================================
  const CLIENT_BESPOKE_TYPES = [
    { id: 'neceser', icon: '👝', name: 'Neceser / Cartuchera a Medida', basePrice: 14500, dims: '24 × 16 × 8 cm', img: 'assets/images/catalog/cosmetic-pouch-on-stone-pedestal.jpg' },
    { id: 'funda', icon: '🛏️', name: 'Funda de Almohada o Almohadón', basePrice: 16500, dims: '50 × 70 cm (o 45 × 45 cm)', img: 'assets/images/catalog/woman-adjusting-satin-sleep-bonnet.jpg' },
    { id: 'organizador', icon: '🧺', name: 'Organizador Colgante o Cesto Textil', basePrice: 21000, dims: '60 × 35 cm con bolsillos', img: 'assets/images/catalog/hanging-wall-organizer-in-room.jpg' },
    { id: 'mesa', icon: '🍽️', name: 'Camino de Mesa / Mantel / Individuales', basePrice: 22500, dims: '180 × 45 cm', img: 'assets/images/catalog/handcrafted-cotton-towels-on-bench.jpg' },
    { id: 'cortinas', icon: '🪟', name: 'Cortinas o Pie de Cama en Tusor / Lino', basePrice: 38000, dims: '2,20 × 1,60 m (par)', img: 'assets/images/banco/blanqueria-toallas/toalla-cruda-encaje-broderie.jpg' },
    { id: 'ajuar', icon: '🍼', name: 'Ajuar de Bebé / Toallón / Babita', basePrice: 19500, dims: '80 × 80 cm con capucha', img: 'assets/images/models/model-towel-baby.jpg' },
    { id: 'especial', icon: '✨', name: 'Otro Diseño Especial / Souvenirs', basePrice: 18500, dims: 'Según tu idea o medida', img: 'assets/images/catalog/plush-dolls-on-wooden-shelf.jpg' }
  ];

  function initClientQuoteBuilder() {
    if (!window.WorkshopDB || !window.DivinaLocuraQuotePDF) return;

    const settings = getWorkshopSettings();
    const alias = settings.mp_alias || 'DIVINA.LOCURA.DECO';
    const webRef = 'WEB-' + String(Math.floor(1000 + Math.random() * 9000));

    let savedCustomer = {};
    try {
      savedCustomer = JSON.parse(localStorage.getItem('divinalocura_customer') || '{}') || {};
    } catch (e) {}

    let quote = {
      id: 'COT-' + webRef,
      number: webRef,
      date: new Date().toLocaleDateString('es-AR'),
      validity: '7 días corridos',
      status: 'enviado',
      theme: 'terracota',
      client: {
        company: savedCustomer.name ? String(savedCustomer.name).toUpperCase() : '',
        attention: savedCustomer.name || '',
        phone: savedCustomer.phone || '',
        email: savedCustomer.email || '',
        location: savedCustomer.address || ''
      },
      introText: 'De nuestra mayor consideración, presentamos el presupuesto oficial generado online con las siguientes creaciones artesanales de Divina Locura Deco:',
      items: [],
      showTotals: true,
      showDeposit: true,
      discountPercent: 0,
      discountFixed: 0,
      shippingCost: 0,
      deliveryTime: '5 a 7 días hábiles desde la confirmación con Elena',
      paymentTerms: `Reserva con Seña del 50% · Saldo 50% contra entrega. Transferencia o Mercado Pago (Alias: ${alias}).`,
      footerNotes: 'Valores oficiales de tienda. En confecciones especiales a medida, Elena confirmará el ajuste exacto según dimensiones finales.',
      createdBy: 'clienta'
    };

    const inpName = document.getElementById('cq-inp-name');
    const inpAtte = document.getElementById('cq-inp-atte');
    const inpPhone = document.getElementById('cq-inp-phone');
    const inpLocation = document.getElementById('cq-inp-location');
    const chkDeposit = document.getElementById('cq-chk-deposit');
    const inpClientNote = document.getElementById('cq-inp-note');

    const itemsListEl = document.getElementById('cq-items-list');
    const cartBannerEl = document.getElementById('cq-cart-banner');
    const cartBannerCountEl = document.getElementById('cq-cart-banner-count');
    const btnImportCart = document.getElementById('btn-cq-import-cart');

    const stageViewport = document.getElementById('cq-stage-viewport');
    const stageScaleWrap = document.getElementById('cq-stage-scale-wrap');
    const mobPagesBadge = document.getElementById('cq-mob-pages-count');

    if (!document.body.getAttribute('data-q-mobile-view')) {
      document.body.setAttribute('data-q-mobile-view', 'editor');
    }

    function readStoreCart() {
      try {
        const arr = JSON.parse(localStorage.getItem('divinalocura_cart') || '[]');
        return Array.isArray(arr) ? arr : [];
      } catch (e) {
        return [];
      }
    }

    function importItemsFromStoreCart(silent) {
      const storeCart = readStoreCart();
      if (storeCart.length === 0) return;
      const allProducts = window.WorkshopDB.getProducts();
      storeCart.forEach((ci, idx) => {
        const prod = allProducts.find(p => p.id === ci.id);
        const officialPrice = prod ? parseCatalogPrice(prod.price) : parseCatalogPrice(ci.price);
        quote.items.push({
          uid: 'cqi-cart-' + Date.now() + '-' + idx,
          productId: prod ? prod.id : 'custom',
          isCustom: !prod,
          isAlternative: false,
          title: String(prod ? prod.title : (ci.title || 'PIEZA ARTESANAL')).toUpperCase(),
          variant: prod ? (prod.texture || prod.categoryName || '') : 'Confección a Medida',
          image: ci.referenceImage || ci.img || (prod && prod.images && prod.images[0] ? prod.images[0].src : ''),
          qty: Math.max(1, parseInt(ci.qty, 10) || 1),
          unitPrice: officialPrice,
          unitCost: prod && prod.cost ? Number(prod.cost) : Math.round(officialPrice * 0.4),
          baseDesc: prod ? prod.desc : 'Pieza personalizada diseñada desde la tienda.',
          clientNote: ci.note || '',
          desc: [prod ? prod.desc : '', ci.note ? `Detalle elegido: ${ci.note}` : ''].filter(Boolean).join('\n')
        });
      });
      if (cartBannerEl) cartBannerEl.style.display = 'none';
      renderClientItems();
      renderPreview();
      if (!silent) toast(`🛍️ Se importaron ${storeCart.length} producto(s) de tu Bolsa al presupuesto`);
    }

    // Revisar URL (?fromCart=1 o ?addProduct=pX)
    const params = new URLSearchParams(window.location.search);
    if (params.get('fromCart') === '1') {
      importItemsFromStoreCart(true);
    } else {
      const addPid = params.get('addProduct');
      if (addPid) {
        const prod = window.WorkshopDB.getProducts().find(p => p.id === addPid);
        if (prod) {
          const uPrice = parseCatalogPrice(prod.price);
          quote.items.push({
            uid: 'cqi-url-' + Date.now(),
            productId: prod.id,
            isCustom: false,
            isAlternative: false,
            title: String(prod.title || '').toUpperCase(),
            variant: prod.texture || prod.categoryName || '',
            image: (prod.images && prod.images[0] && prod.images[0].src) || '',
            qty: 1,
            unitPrice: uPrice,
            unitCost: prod.cost ? Number(prod.cost) : Math.round(uPrice * 0.4),
            baseDesc: prod.desc || '',
            clientNote: '',
            desc: prod.desc || ''
          });
        }
      }
      const cartItems = readStoreCart();
      if (cartItems.length > 0 && cartBannerEl) {
        cartBannerEl.style.display = 'flex';
        if (cartBannerCountEl) {
          const totalUnits = cartItems.reduce((s, x) => s + (Number(x.qty) || 1), 0);
          cartBannerCountEl.textContent = String(totalUnits);
        }
      }
    }

    // Si entra vacía sin ítems del carrito, precargar 1 creación clásica de muestra para que vea cómo luce su hoja PDF en vivo
    if (quote.items.length === 0 && readStoreCart().length === 0) {
      const p1 = window.WorkshopDB.getProducts()[0];
      if (p1) {
        const uPrice = parseCatalogPrice(p1.price);
        quote.items.push({
          uid: 'cqi-welcome-1',
          productId: p1.id,
          isCustom: false,
          isAlternative: false,
          title: String(p1.title || '').toUpperCase(),
          variant: `${p1.texture || ''} · Tono: ${(p1.availableColors && p1.availableColors[0]) || 'Champán Seda'}`,
          image: (p1.images && p1.images[0] && p1.images[0].src) || '',
          qty: 1,
          unitPrice: uPrice,
          unitCost: p1.cost ? Number(p1.cost) : Math.round(uPrice * 0.4),
          baseDesc: p1.desc || '',
          clientNote: '',
          desc: p1.desc || ''
        });
      }
    }

    if (inpName) inpName.value = quote.client.company ? quote.client.attention || quote.client.company : '';
    if (inpAtte) inpAtte.value = '';
    if (inpPhone) inpPhone.value = quote.client.phone || '';
    if (inpLocation) inpLocation.value = quote.client.location || '';

    function syncClientFields() {
      const mainName = inpName ? inpName.value.trim() : '';
      const atteVal = inpAtte ? inpAtte.value.trim() : '';
      quote.client = {
        company: mainName ? mainName.toUpperCase() : 'PRESUPUESTO ONLINE',
        attention: atteVal || mainName,
        phone: inpPhone ? inpPhone.value.trim() : '',
        email: savedCustomer.email || '',
        location: inpLocation ? inpLocation.value.trim() : ''
      };
      quote.showDeposit = chkDeposit ? chkDeposit.checked : true;
      const customExtraNote = inpClientNote ? inpClientNote.value.trim() : '';
      quote.footerNotes = customExtraNote
        ? `Nota de la clienta: ${customExtraNote} · Valores oficiales sujetos a disponibilidad de telas nobles.`
        : 'Valores oficiales de tienda. En confecciones especiales a medida, Elena confirmará el ajuste exacto según dimensiones finales.';
      renderPreview();
    }

    [inpName, inpAtte, inpPhone, inpLocation, inpClientNote].forEach((el) => {
      if (el) el.addEventListener('input', syncClientFields);
    });
    if (chkDeposit) chkDeposit.addEventListener('change', syncClientFields);
    if (btnImportCart) btnImportCart.addEventListener('click', () => importItemsFromStoreCart(false));

    // Selector de tema visual
    document.querySelectorAll('[data-cq-theme]').forEach((btn) => {
      btn.addEventListener('click', () => {
        quote.theme = btn.getAttribute('data-cq-theme') || 'terracota';
        document.querySelectorAll('[data-cq-theme]').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        renderPreview();
      });
    });

    function renderClientItems() {
      if (!itemsListEl) return;
      const fmt = window.DivinaLocuraQuotePDF.formatMoneyArs;
      if (quote.items.length === 0) {
        itemsListEl.innerHTML = `
          <div style="border:1.5px dashed #D7C9BA; border-radius:9px; padding:1.75rem 1.25rem; text-align:center; background:#FAF8F4;">
            <div style="font-size:1.5rem; margin-bottom:0.35rem;">🌸</div>
            <div style="font-weight:700; color:#2B2625; font-size:0.92rem; margin-bottom:0.25rem;">Tu presupuesto está vacío</div>
            <div style="font-size:0.82rem; color:#6C635C;">Elegí productos con los botones <strong>“+ Elegir del Catálogo”</strong> o <strong>“+ Sumar Pieza a Medida”</strong> acá arriba.</div>
          </div>
        `;
        return;
      }

      itemsListEl.innerHTML = quote.items.map((it) => {
        const sub = (Number(it.qty) || 1) * (Number(it.unitPrice) || 0);
        return `
          <div class="cq-item-card" data-cqi-uid="${esc(it.uid)}">
            <div class="cq-item-card__head">
              ${it.image
                ? `<img src="${esc(it.image)}" alt="${esc(it.title)}" class="cq-item-card__thumb" />`
                : `<div class="cq-item-card__thumb" style="display:flex;align-items:center;justify-content:center;font-family:var(--font-serif);font-weight:700;color:#A45A44;">DL</div>`
              }
              <div class="cq-item-card__info">
                <h4 class="cq-item-card__title">${esc(it.title)}</h4>
                <div class="cq-item-card__meta">${esc(it.variant || 'Confección Artesanal')}</div>
              </div>
              <button type="button" class="q-mini-btn q-mini-btn--danger btn-cqi-remove" title="Quitar del presupuesto">✕</button>
            </div>

            <div>
              <input type="text" class="q-input inp-cqi-note" value="${esc(it.clientNote || '')}" placeholder="🪡 Detalle opcional: color preferido, inicial o nombre a bordar..." style="font-size:0.79rem; padding:0.45rem 0.7rem;" />
            </div>

            <div class="cq-item-card__controls">
              <div style="display:flex; align-items:center; gap:0.55rem;">
                <span style="font-size:0.74rem; font-weight:600; color:#5F5852;">Cantidad:</span>
                <div class="cq-qty-stepper">
                  <button type="button" class="cq-qty-btn btn-cqi-minus" aria-label="Restar uno">−</button>
                  <input type="number" min="1" max="500" class="cq-qty-val inp-cqi-qty" value="${esc(it.qty)}" />
                  <button type="button" class="cq-qty-btn btn-cqi-plus" aria-label="Sumar uno">+</button>
                </div>
              </div>

              <div class="cq-price-summary">
                <span class="cq-price-unit">Unitario oficial: ${esc(fmt(it.unitPrice, false))}${it.isCustom ? ' (base est.)' : ''}</span>
                <span class="cq-price-sub el-cqi-sub">${esc(fmt(sub, false))}</span>
              </div>
            </div>
          </div>
        `;
      }).join('');

      itemsListEl.querySelectorAll('.cq-item-card').forEach((cardEl) => {
        const uid = cardEl.getAttribute('data-cqi-uid');
        const getIt = () => quote.items.find(x => x.uid === uid);

        const refreshRowCalc = () => {
          const item = getIt();
          if (!item) return;
          const subEl = cardEl.querySelector('.el-cqi-sub');
          if (subEl) subEl.textContent = fmt(item.qty * item.unitPrice, false);
          item.desc = [item.baseDesc || '', item.clientNote ? `Detalle solicitado: ${item.clientNote}` : ''].filter(Boolean).join('\n');
          renderPreview();
        };

        const minusBtn = cardEl.querySelector('.btn-cqi-minus');
        const plusBtn = cardEl.querySelector('.btn-cqi-plus');
        const qtyInp = cardEl.querySelector('.inp-cqi-qty');
        const noteInp = cardEl.querySelector('.inp-cqi-note');
        const delBtn = cardEl.querySelector('.btn-cqi-remove');

        if (minusBtn && qtyInp) {
          minusBtn.addEventListener('click', () => {
            const item = getIt();
            if (!item) return;
            item.qty = Math.max(1, (Number(item.qty) || 1) - 1);
            qtyInp.value = item.qty;
            refreshRowCalc();
          });
        }
        if (plusBtn && qtyInp) {
          plusBtn.addEventListener('click', () => {
            const item = getIt();
            if (!item) return;
            item.qty = Math.min(500, (Number(item.qty) || 1) + 1);
            qtyInp.value = item.qty;
            refreshRowCalc();
          });
        }
        if (qtyInp) {
          qtyInp.addEventListener('input', () => {
            const item = getIt();
            if (!item) return;
            item.qty = Math.max(1, Math.min(500, parseInt(qtyInp.value, 10) || 1));
            refreshRowCalc();
          });
        }
        if (noteInp) {
          noteInp.addEventListener('input', () => {
            const item = getIt();
            if (!item) return;
            item.clientNote = noteInp.value.trim();
            refreshRowCalc();
          });
        }
        if (delBtn) {
          delBtn.addEventListener('click', () => {
            quote.items = quote.items.filter(x => x.uid !== uid);
            renderClientItems();
            renderPreview();
          });
        }
      });
    }

    function renderPreview() {
      if (!stageScaleWrap) return;
      stageScaleWrap.innerHTML = renderQuoteHtmlSheets(quote, settings);
      fitScaleWrapToContainer(stageViewport, stageScaleWrap);
      const pCount = stageScaleWrap.querySelectorAll('.quote-a4-page').length || 1;
      if (mobPagesBadge) mobPagesBadge.textContent = `${pCount} pág`;
    }

    // Modal Catálogo para Clientas
    const catModal = document.getElementById('cq-catalog-modal');
    const catGrid = document.getElementById('cq-catalog-grid');
    const catSearch = document.getElementById('cq-catalog-search');
    let catFilter = 'todos';

    function renderClientCatalogModal() {
      if (!catGrid) return;
      const products = window.WorkshopDB.getProducts();
      const term = (catSearch ? catSearch.value : '').toLowerCase().trim();
      const fmt = window.DivinaLocuraQuotePDF.formatMoneyArs;

      const filtered = products.filter((p) => {
        const mCat = catFilter === 'todos' || p.category === catFilter;
        const mTerm = !term || String(p.title || '').toLowerCase().includes(term) || String(p.desc || '').toLowerCase().includes(term);
        return mCat && mTerm;
      });

      catGrid.innerHTML = filtered.map((p) => {
        const officialPrice = parseCatalogPrice(p.price);
        const img = (p.images && p.images[0] && p.images[0].src) || '';
        const colors = Array.isArray(p.availableColors) && p.availableColors.length > 0 ? p.availableColors : ['Clásico de Taller'];
        return `
          <div class="q-cat-prod-card" data-cq-pid="${esc(p.id)}">
            <img src="${esc(img)}" alt="${esc(p.title)}" class="q-cat-prod-card__img" />
            <div class="q-cat-prod-card__body">
              <div style="font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#8C7A6B;">${esc(p.categoryName || p.category)}</div>
              <h4 class="q-cat-prod-card__title">${esc(p.title)}</h4>
              <div class="q-cat-prod-card__price">${esc(fmt(officialPrice, false))}</div>
              <div style="display:grid; grid-template-columns:1fr 66px; gap:0.4rem; margin-top:0.2rem;">
                <select class="q-select cq-pick-color" style="padding:0.35rem 0.45rem; font-size:0.75rem;">
                  ${colors.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}
                </select>
                <input type="number" min="1" value="1" class="q-input cq-pick-qty" style="padding:0.35rem 0.4rem; font-size:0.78rem; text-align:center;" />
              </div>
              <button type="button" class="btn-admin-cta btn-cq-pick-add" style="width:100%; justify-content:center; margin-top:auto; padding:0.5rem;">
                <span>＋ Sumar a mi Presupuesto</span>
              </button>
            </div>
          </div>
        `;
      }).join('');

      catGrid.querySelectorAll('.q-cat-prod-card').forEach((card) => {
        const pid = card.getAttribute('data-cq-pid');
        const btn = card.querySelector('.btn-cq-pick-add');
        if (!btn) return;
        btn.addEventListener('click', () => {
          const prod = products.find(x => x.id === pid);
          if (!prod) return;
          const color = card.querySelector('.cq-pick-color').value;
          const qty = Math.max(1, parseInt(card.querySelector('.cq-pick-qty').value, 10) || 1);
          const uPrice = parseCatalogPrice(prod.price);
          quote.items.push({
            uid: 'cqi-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            productId: prod.id,
            isCustom: false,
            isAlternative: false,
            title: String(prod.title || '').toUpperCase(),
            variant: `${prod.texture || prod.categoryName || ''} · Tono: ${color}`,
            image: (prod.images && prod.images[0] && prod.images[0].src) || '',
            qty: qty,
            unitPrice: uPrice,
            unitCost: prod.cost ? Number(prod.cost) : Math.round(uPrice * 0.4),
            baseDesc: prod.desc || '',
            clientNote: '',
            desc: prod.desc || ''
          });
          renderClientItems();
          renderPreview();
          toast(`✨ Sumado: ${qty}x ${prod.title}`);
        });
      });
    }

    const btnOpenCat = document.getElementById('btn-cq-open-catalog');
    if (btnOpenCat && catModal) {
      btnOpenCat.addEventListener('click', () => {
        catModal.classList.add('is-open');
        renderClientCatalogModal();
      });
    }
    if (catSearch) catSearch.addEventListener('input', renderClientCatalogModal);
    document.querySelectorAll('[data-cq-cat-pill]').forEach((pill) => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('[data-cq-cat-pill]').forEach(p => p.classList.remove('is-active'));
        pill.classList.add('is-active');
        catFilter = pill.getAttribute('data-cq-cat-pill');
        renderClientCatalogModal();
      });
    });

    // Modal Pieza a Medida Guiada para Clientas (con precios base oficiales de disenar.html)
    const bespokeModal = document.getElementById('cq-bespoke-modal');
    const bespokeTypeGrid = document.getElementById('cq-bespoke-type-grid');
    const bespokeFabricSel = document.getElementById('cq-bespoke-fabric');
    const bespokeColorSel = document.getElementById('cq-bespoke-color');
    const bespokeDimsInp = document.getElementById('cq-bespoke-dims');
    const bespokeEmbInp = document.getElementById('cq-bespoke-emb');
    const bespokeQtyInp = document.getElementById('cq-bespoke-qty');
    const bespokeNotesInp = document.getElementById('cq-bespoke-notes');
    const bespokeFileInp = document.getElementById('cq-bespoke-file');
    const bespokeFileStatus = document.getElementById('cq-bespoke-file-status');

    let selectedBespokeType = CLIENT_BESPOKE_TYPES[0];
    let uploadedBespokePhoto = '';

    function renderBespokeTypes() {
      if (!bespokeTypeGrid) return;
      const fmt = window.DivinaLocuraQuotePDF.formatMoneyArs;
      bespokeTypeGrid.innerHTML = CLIENT_BESPOKE_TYPES.map((bt) => `
        <button type="button" class="cq-bespoke-card ${bt.id === selectedBespokeType.id ? 'is-active' : ''}" data-bt-id="${esc(bt.id)}">
          <strong>${bt.icon} ${esc(bt.name)}</strong>
          <small>Base taller: ${esc(fmt(bt.basePrice, false))}</small>
        </button>
      `).join('');

      bespokeTypeGrid.querySelectorAll('[data-bt-id]').forEach((b) => {
        b.addEventListener('click', () => {
          const found = CLIENT_BESPOKE_TYPES.find(x => x.id === b.getAttribute('data-bt-id'));
          if (!found) return;
          selectedBespokeType = found;
          if (bespokeDimsInp) bespokeDimsInp.value = found.dims;
          renderBespokeTypes();
        });
      });
    }

    const btnOpenBespoke = document.getElementById('btn-cq-open-bespoke');
    if (btnOpenBespoke && bespokeModal) {
      btnOpenBespoke.addEventListener('click', () => {
        selectedBespokeType = CLIENT_BESPOKE_TYPES[0];
        uploadedBespokePhoto = '';
        if (bespokeDimsInp) bespokeDimsInp.value = selectedBespokeType.dims;
        if (bespokeEmbInp) bespokeEmbInp.value = '';
        if (bespokeQtyInp) bespokeQtyInp.value = '1';
        if (bespokeNotesInp) bespokeNotesInp.value = '';
        if (bespokeFileStatus) bespokeFileStatus.textContent = 'Opcional: podés adjuntar foto de tu espacio o boceto';

        if (bespokeColorSel && window.WorkshopDB.getColorPalette) {
          const cols = window.WorkshopDB.getColorPalette();
          bespokeColorSel.innerHTML = cols.map(c => `<option value="${esc(c.name || c)}">${esc(c.name || c)}</option>`).join('');
        }
        renderBespokeTypes();
        bespokeModal.classList.add('is-open');
      });
    }

    if (bespokeFileInp) {
      bespokeFileInp.addEventListener('change', async () => {
        const f = bespokeFileInp.files && bespokeFileInp.files[0];
        if (!f) return;
        try {
          const r = await window.WorkshopDB.processAndUploadImage(f, 900, 0.82);
          uploadedBespokePhoto = r.url;
          if (bespokeFileStatus) bespokeFileStatus.textContent = '✅ Foto de referencia adjuntada';
        } catch (e) {}
      });
    }

    const btnConfirmBespoke = document.getElementById('btn-cq-confirm-bespoke');
    if (btnConfirmBespoke) {
      btnConfirmBespoke.addEventListener('click', () => {
        const fabric = bespokeFabricSel ? bespokeFabricSel.value : 'Lino Rústico & Lienzo';
        const color = bespokeColorSel ? bespokeColorSel.value : 'Crudo Natural';
        const dims = bespokeDimsInp ? bespokeDimsInp.value.trim() : selectedBespokeType.dims;
        const emb = bespokeEmbInp ? bespokeEmbInp.value.trim() : '';
        const qty = Math.max(1, parseInt(bespokeQtyInp ? bespokeQtyInp.value : '1', 10) || 1);
        const extra = bespokeNotesInp ? bespokeNotesInp.value.trim() : '';

        const descParts = [
          `Confección personalizada a medida en el taller de Elena.`,
          `Medidas solicitadas: ${dims}.`,
          emb ? `Bordado artesanal personalizado: "${emb}".` : '',
          extra ? `Indicaciones adicionales: ${extra}` : '',
          `Valor base orientativo de taller sujeto a confirmación final según medidas exactas.`
        ].filter(Boolean);

        quote.items.push({
          uid: 'cqi-besp-' + Date.now(),
          productId: 'custom',
          isCustom: true,
          isAlternative: false,
          title: `${selectedBespokeType.name.toUpperCase()} (A MEDIDA)`,
          variant: `${fabric} · Tono: ${color} · ${dims}`,
          image: uploadedBespokePhoto || selectedBespokeType.img,
          qty: qty,
          unitPrice: selectedBespokeType.basePrice,
          unitCost: Math.round(selectedBespokeType.basePrice * 0.42),
          baseDesc: descParts.join(' '),
          clientNote: '',
          desc: descParts.join(' ')
        });

        bespokeModal.classList.remove('is-open');
        renderClientItems();
        renderPreview();
        toast(`✂️ Pieza a medida sumada a tu presupuesto`);
      });
    }

    // Acciones de Exportación para la Clienta: PDF, Compartir PDF, Imprimir, WhatsApp a Elena y Pasar a Bolsa
    function persistClientQuoteRecord() {
      syncClientFields();
      if (quote.client.attention || quote.client.phone) {
        try {
          localStorage.setItem('divinalocura_customer', JSON.stringify({
            name: quote.client.attention || quote.client.company,
            phone: quote.client.phone || '',
            email: quote.client.email || '',
            address: quote.client.location || ''
          }));
        } catch (e) {}
      }
      if (quote.items.length > 0 && window.WorkshopDB.saveQuote) {
        window.WorkshopDB.saveQuote(quote);
      }
    }

    document.querySelectorAll('.js-cq-download-pdf').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (quote.items.length === 0) {
          toast('Agregá al menos una pieza para descargar tu presupuesto en PDF.');
          return;
        }
        const orig = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span>⏳ Generando tu PDF...</span>';
        try {
          persistClientQuoteRecord();
          const res = await window.DivinaLocuraQuotePDF.downloadQuotePdf(quote, settings);
          toast(`📥 ¡Listo! Se descargó ${res.filename}`);
        } finally {
          btn.disabled = false;
          btn.innerHTML = orig;
        }
      });
    });

    const btnShareNative = document.getElementById('btn-cq-share-pdf');
    if (btnShareNative) {
      btnShareNative.addEventListener('click', async () => {
        if (quote.items.length === 0) {
          toast('Agregá al menos una pieza primero.');
          return;
        }
        btnShareNative.disabled = true;
        try {
          persistClientQuoteRecord();
          await window.DivinaLocuraQuotePDF.shareQuotePdfFile(
            quote,
            settings,
            `Presupuesto #${quote.number} · Divina Locura Deco 🌸`
          );
        } catch (e) {} finally {
          btnShareNative.disabled = false;
        }
      });
    }

    document.querySelectorAll('.js-cq-print').forEach((btn) => {
      btn.addEventListener('click', () => {
        persistClientQuoteRecord();
        window.print();
      });
    });

    document.querySelectorAll('.js-cq-send-elena-wa').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (quote.items.length === 0) {
          toast('Agregá al menos una pieza antes de enviarlo a Elena.');
          return;
        }
        persistClientQuoteRecord();
        const rawTallerWa = String(settings.whatsapp_phone || '5491136932471').replace(/[^0-9]/g, '');
        const tallerPhone = (rawTallerWa && rawTallerWa !== '5491100000000') ? rawTallerWa : '5491136932471';
        const fmt = window.DivinaLocuraQuotePDF.formatMoneyArs;
        const totals = window.DivinaLocuraQuotePDF.computeQuoteTotals(quote);
        const shareUrl = getShareUrlForQuote(quote);
        const cName = quote.client.attention && quote.client.attention !== 'PRESUPUESTO ONLINE' ? quote.client.attention : '';

        const lines = [];
        lines.push(`¡Hola Elena! 🌸 Armé mi *Presupuesto Online #${quote.number}* en la web de *Divina Locura Deco*${cName ? ` a nombre de *${cName}*` : ''}:`);
        lines.push('');
        quote.items.forEach((it) => {
          const sub = (Number(it.qty) || 1) * (Number(it.unitPrice) || 0);
          lines.push(`• *${it.qty}x ${it.title}* (${it.variant || 'Artesanal'}) → ${fmt(sub, false)}`);
          if (it.clientNote) lines.push(`   _Nota: ${it.clientNote}_`);
        });
        lines.push('');
        lines.push(`✨ *Total estimado:* ${fmt(totals.totalAmount, false)} ARS`);
        if (quote.showDeposit) {
          lines.push(`🪡 *Seña 50%:* ${fmt(totals.depositAmount, false)} ARS`);
        }
        if (quote.client.location) lines.push(`📍 *Localidad:* ${quote.client.location}`);
        if (shareUrl && shareUrl.length < 7500) {
          lines.push('');
          lines.push(`📄 *Ver mi hoja de presupuesto completa / Editar en Taller:*`);
          lines.push(shareUrl);
        }
        lines.push('');
        lines.push(`¿Me confirmás disponibilidad para avanzar? ¡Muchas gracias! 🤍`);

        window.open(`https://wa.me/${tallerPhone}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
      });
    });

    const btnPushToCart = document.getElementById('btn-cq-push-to-cart');
    if (btnPushToCart) {
      btnPushToCart.addEventListener('click', () => {
        if (quote.items.length === 0) {
          toast('Tu presupuesto está vacío.');
          return;
        }
        persistClientQuoteRecord();
        const currentCart = readStoreCart();
        quote.items.forEach((it) => {
          const fmtPrice = `$ ${Number(it.unitPrice || 0).toLocaleString('es-AR')} ARS`;
          currentCart.push({
            id: it.productId && it.productId !== 'custom' ? it.productId : ('bespoke-' + Date.now() + '-' + Math.floor(Math.random() * 100)),
            title: it.title,
            price: fmtPrice,
            categoryName: it.isCustom ? 'A Medida' : 'Catálogo',
            img: it.image || 'assets/images/hero-textile.jpg',
            note: [it.variant, it.clientNote].filter(Boolean).join(' · '),
            referenceImage: it.isCustom ? it.image : '',
            qty: Number(it.qty) || 1
          });
        });
        try {
          localStorage.setItem('divinalocura_cart', JSON.stringify(currentCart));
        } catch (e) {}
        toast('🛍️ ¡Piezas pasadas a tu Bolsa de Pedidos!');
        setTimeout(() => {
          window.location.href = 'catalogo.html';
        }, 500);
      });
    }

    // Pestañas móviles y cierre de modales
    document.querySelectorAll('[data-cq-mob-tab]').forEach((tabBtn) => {
      tabBtn.addEventListener('click', () => {
        const v = tabBtn.getAttribute('data-cq-mob-tab');
        document.body.setAttribute('data-q-mobile-view', v);
        document.querySelectorAll('[data-cq-mob-tab]').forEach(b => b.classList.toggle('is-active', b.getAttribute('data-cq-mob-tab') === v));
        if (v === 'preview') {
          requestAnimationFrame(() => fitScaleWrapToContainer(stageViewport, stageScaleWrap));
        }
      });
    });

    document.querySelectorAll('[data-q-close-modal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const bd = btn.closest('.q-modal-backdrop');
        if (bd) bd.classList.remove('is-open');
      });
    });
    document.querySelectorAll('.q-modal-backdrop').forEach((bd) => {
      bd.addEventListener('click', (e) => {
        if (e.target === bd) bd.classList.remove('is-open');
      });
    });

    window.addEventListener('resize', () => fitScaleWrapToContainer(stageViewport, stageScaleWrap));

    syncClientFields();
    renderClientItems();
    renderPreview();
  }

  window.DivinaLocuraQuotes = {
    initAdmin: initAdminPresupuestosPage,
    initClient: initClientQuoteBuilder,
    initPublic: initPublicQuoteViewer,
    renderHtmlSheets: renderQuoteHtmlSheets
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (document.body.getAttribute('data-public-quote') === '1') {
      initPublicQuoteViewer();
    } else if (document.body.getAttribute('data-client-quote-builder') === '1') {
      initClientQuoteBuilder();
    }
  });
})();
