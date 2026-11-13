/**
 * Divina Locura Deco - Sistema Frontend & Modo Administrador Dual
 * Inspiración Anthropologie (lookbook editorial, secciones cuidadas y narrativas artesanales)
 * Dos Perfiles de Administración:
 *   1. Elena (Mamá / Taller): Interfaz simple, cálida y sin jerga técnica para publicar creaciones, fotos y precios.
 *   2. Juanma (Programador): Control del funcionamiento técnico, sincronización con GitHub, WhatsApp, anuncios y respaldos.
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. ESTADO DE DATOS (PRODUCTOS, ROLES & CONFIGURACIÓN)
  // =========================================================================
  const STORAGE_KEY_PRODUCTS = 'divinalocura_products';
  const STORAGE_KEY_ROLE = 'divinalocura_role'; // 'elena' | 'juanma' | null
  const STORAGE_KEY_SETTINGS = 'divinalocura_settings';

  const PASSWORDS = {
    elena: ['elena', 'elena2026', 'mama'],
    juanma: ['juanma', 'juanma2026', 'admin']
  };

  const DEFAULT_SETTINGS = {
    whatsapp_phone: '5491100000000',
    instagram_user: 'divina.locura.deco',
    announcement: 'Confección artesanal \u00B7 Piezas únicas elaboradas a fuego lento por Elena',
    gh_token: ''
  };

  // Cargar Ajustes
  let settings = { ...DEFAULT_SETTINGS };
  try {
    const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (savedSettings) {
      settings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
    }
  } catch (e) {
    console.warn('Error leyendo ajustes:', e);
  }

  // Cargar Productos
  let products = [];
  try {
    const savedProducts = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (savedProducts) {
      products = JSON.parse(savedProducts);
    }
  } catch (err) {
    console.warn('Error leyendo productos:', err);
  }

  if (!products || products.length === 0) {
    if (typeof INITIAL_PRODUCTS !== 'undefined') {
      products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    } else {
      products = [];
    }
  }

  let currentCategory = 'todos';
  let currentRole = localStorage.getItem(STORAGE_KEY_ROLE); // 'elena' | 'juanma' | null

  // Elementos DOM Principales
  const productsGrid = document.getElementById('products-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const categoryTiles = document.querySelectorAll('[data-category-target]');
  const adminBar = document.getElementById('admin-bar');
  const adminBarElena = document.getElementById('admin-bar-elena');
  const adminBarJuanma = document.getElementById('admin-bar-juanma');
  const topAnnouncementText = document.getElementById('top-announcement-text');
  const toastContainer = document.getElementById('toast-container');

  // Aplicar ajustes visuales iniciales
  function applySystemSettings() {
    if (topAnnouncementText && settings.announcement) {
      topAnnouncementText.textContent = settings.announcement;
    }
    // Actualizar enlaces de Instagram en el sitio
    if (settings.instagram_user) {
      const igUrl = `https://www.instagram.com/${settings.instagram_user.replace(/^@/, '')}`;
      document.querySelectorAll('a[href*="instagram.com"]').forEach(a => {
        a.href = igUrl;
      });
    }
  }
  applySystemSettings();

  // Helper para generar enlaces de WhatsApp con número y mensaje
  function buildWhatsAppUrl(productName = '') {
    const cleanPhone = (settings.whatsapp_phone || '').replace(/[^0-9]/g, '');
    let msg = `Hola Elena, estuve mirando la tienda de Divina Locura Deco`;
    if (productName) {
      msg += ` y me encantó la pieza: "${productName}". ¿Podrías contarme disponibilidad y opciones?`;
    } else {
      msg += ` y me gustaría hacer una consulta sobre sus confecciones artesanales.`;
    }

    if (cleanPhone && cleanPhone !== '5491100000000') {
      return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;
    }
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
  }

  // =========================================================================
  // 2. RENDERIZADO DEL CATÁLOGO (ESTILO ANTHROPOLOGIE & ZARA HOME)
  // =========================================================================
  let searchQuery = '';

  function renderCatalog() {
    if (!productsGrid) return;
    productsGrid.innerHTML = '';

    const query = (searchQuery || '').toLowerCase().trim();
    const filtered = products.filter(p => {
      const matchCat = currentCategory === 'todos' || p.category === currentCategory;
      if (!matchCat) return false;
      if (!query) return true;
      return (
        (p.title && p.title.toLowerCase().includes(query)) ||
        (p.desc && p.desc.toLowerCase().includes(query)) ||
        (p.texture && p.texture.toLowerCase().includes(query)) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(query))
      );
    });

    if (filtered.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1.5rem; color: var(--text-secondary); background: var(--bg-surface); border-radius: var(--radius-sm); border: 1px dashed var(--border-medium);">
          <p style="font-family: var(--font-serif); font-size: 1.4rem; color: var(--text-primary); margin-bottom: 0.5rem;">No encontramos piezas para "${searchQuery}"</p>
          <p style="font-size: 0.88rem; max-width: 480px; margin: 0 auto 1.25rem;">Intenta con palabras como satén, lino, waffle, o selecciona otra categoría.</p>
          <button type="button" class="btn btn--secondary" id="btn-reset-search">Ver Todo el Catálogo</button>
        </div>
      `;
      const btnReset = document.getElementById('btn-reset-search');
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          searchQuery = '';
          const searchInp = document.getElementById('header-search-input');
          const searchClear = document.getElementById('header-search-clear');
          if (searchInp) searchInp.value = '';
          if (searchClear) searchClear.style.display = 'none';
          applyFilter('todos');
        });
      }
      return;
    }

    filtered.forEach(product => {
      const card = document.createElement('article');
      card.className = `catalog-item ${product.size === 'large' ? 'catalog-item--large' : 'catalog-item--medium'}`;
      card.setAttribute('data-category', product.category);
      card.setAttribute('data-id', product.id);

      const images = product.images && product.images.length > 0
        ? product.images
        : [{ label: 'Foto Principal', src: 'assets/images/hero-textile.jpg' }];

      const defaultImg = images[0].src;

      // Pills multivista
      const pillsHtml = images.map((img, idx) => `
        <button type="button" class="view-pill ${idx === 0 ? 'is-active' : ''}" data-view-src="${img.src}">
          ${img.label || `Vista ${idx + 1}`}
        </button>
      `).join('');

      // Barra de administración en tarjeta según rol
      let adminBarHtml = '';
      if (currentRole === 'elena') {
        adminBarHtml = `
          <div class="catalog-item__admin-bar">
            <button type="button" class="btn-card-admin btn-card-admin--edit" data-edit-id="${product.id}" title="Modificar esta pieza">
              ✏️ Modificar Creación
            </button>
          </div>
        `;
      } else if (currentRole === 'juanma') {
        adminBarHtml = `
          <div class="catalog-item__admin-bar">
            <button type="button" class="btn-card-admin btn-card-admin--edit" data-edit-id="${product.id}" title="Editar este producto">
              ✏️ Editar
            </button>
            <button type="button" class="btn-card-admin btn-card-admin--delete" data-delete-id="${product.id}" title="Eliminar producto">
              🗑️
            </button>
          </div>
        `;
      }

      card.innerHTML = `
        ${adminBarHtml}

        <div class="catalog-item__media" data-open-lookbook="${product.id}" title="Click para ver ficha editorial y detalles">
          <img src="${defaultImg}" alt="${product.title}" class="catalog-item__img" loading="lazy" />
          <span class="catalog-item__tag">${product.tag || 'Hecho a Mano'}</span>
          <div class="catalog-item__views" aria-label="Cambiar vista del producto">
            ${pillsHtml}
          </div>
        </div>

        <div class="catalog-item__info">
          <div class="catalog-item__meta">
            <span class="catalog-item__category">${product.categoryName || getCategoryLabel(product.category)}</span>
            <span class="catalog-item__texture">${product.texture || 'Confección artesanal'}</span>
          </div>
          <h3 class="catalog-item__title">${product.title}</h3>
          <p class="catalog-item__desc">${product.desc || ''}</p>
          <div class="catalog-item__footer">
            <span class="catalog-item__price">${product.price || 'Consultar'}</span>
            <div class="catalog-item__actions">
              <button class="btn btn--whatsapp" data-product-name="${product.title}" aria-label="Pedir por WhatsApp">
                <span>Pedir por WhatsApp</span>
                <svg class="btn__icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
              </button>
              <button type="button" class="btn--lookbook-view" data-open-lookbook="${product.id}" title="Vista Rápida de la Creación">
                <span>Vista Rápida</span>
              </button>
            </div>
          </div>
        </div>
      `;

      productsGrid.appendChild(card);
    });

    bindCardEvents();
  }

  function getCategoryLabel(slug) {
    const map = {
      'cuidado-personal': 'Cuidado Personal & Descanso',
      'hogar': 'Hogar & Cocina',
      'organizacion': 'Organización & Bolsos',
      'infantil': 'Bebés & Infantil'
    };
    return map[slug] || 'Colección Textil';
  }

  function saveProductsToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch (err) {
      console.error('Error guardando en localStorage:', err);
    }
  }

  // =========================================================================
  // 3. EVENTOS DE TARJETAS (MULTIVISTA, WHATSAPP, LOOKBOOK, EDICIÓN)
  // =========================================================================
  function bindCardEvents() {
    // Selector de Vistas (Pills)
    document.querySelectorAll('.view-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const newSrc = pill.getAttribute('data-view-src');
        const mediaBox = pill.closest('.catalog-item__media');
        if (!mediaBox) return;

        const mainImg = mediaBox.querySelector('.catalog-item__img');
        if (!mainImg || mainImg.getAttribute('src') === newSrc) return;

        mediaBox.querySelectorAll('.view-pill').forEach(btn => btn.classList.remove('is-active'));
        pill.classList.add('is-active');

        mainImg.style.opacity = '0';
        setTimeout(() => {
          mainImg.src = newSrc;
          mainImg.onload = () => { mainImg.style.opacity = '1'; };
          setTimeout(() => { mainImg.style.opacity = '1'; }, 80);
        }, 120);
      });
    });

    // Enlaces de WhatsApp con número configurable
    document.querySelectorAll('.btn--whatsapp').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const productName = btn.getAttribute('data-product-name') || '';
        const url = buildWhatsAppUrl(productName);
        window.open(url, '_blank', 'noopener,noreferrer');
      });
    });

    // Abrir Modal Lookbook / Ficha Editorial
    document.querySelectorAll('[data-open-lookbook]').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        if (e.target.closest('.view-pill') || e.target.closest('.btn-card-admin')) return;
        const productId = trigger.getAttribute('data-open-lookbook');
        openLookbookModal(productId);
      });
    });

    // Botones de Edición en Tarjetas
    document.querySelectorAll('.btn-card-admin--edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-edit-id');
        openProductEditor(id);
      });
    });

    document.querySelectorAll('.btn-card-admin--delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-delete-id');
        deleteProduct(id);
      });
    });
  }

  // =========================================================================
  // 4. FILTROS DE CATEGORÍAS & NAVEGACIÓN ZARA HOME
  // =========================================================================
  function applyFilter(category) {
    currentCategory = category;
    filterBtns.forEach(btn => {
      if (btn.getAttribute('data-filter') === category) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });

    document.querySelectorAll('.hero-nav-pill').forEach(pill => {
      if (pill.getAttribute('data-hero-filter') === category) {
        pill.classList.add('is-active');
      } else {
        pill.classList.remove('is-active');
      }
    });

    renderCatalog();
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      applyFilter(btn.getAttribute('data-filter'));
    });
  });

  // Pills de navegación inferior del Hero (Exactas a Zara Home)
  document.querySelectorAll('[data-hero-filter]').forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = pill.getAttribute('data-hero-filter');
      applyFilter(cat);
      const catalogSection = document.getElementById('catalogo');
      if (catalogSection) {
        catalogSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  categoryTiles.forEach(tile => {
    tile.addEventListener('click', (e) => {
      e.preventDefault();
      const targetCat = tile.getAttribute('data-category-target');
      applyFilter(targetCat);
      const catalogSection = document.getElementById('catalogo');
      if (catalogSection) {
        catalogSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Buscador Minimalista en Cabecera (Inspiración Zara Home)
  const headerSearchInput = document.getElementById('header-search-input');
  const headerSearchClear = document.getElementById('header-search-clear');

  if (headerSearchInput) {
    headerSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (headerSearchClear) {
        headerSearchClear.style.display = searchQuery.trim() ? 'inline-block' : 'none';
      }
      renderCatalog();
    });

    headerSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const catalogSection = document.getElementById('catalogo');
        if (catalogSection) catalogSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  if (headerSearchClear) {
    headerSearchClear.addEventListener('click', () => {
      searchQuery = '';
      if (headerSearchInput) headerSearchInput.value = '';
      headerSearchClear.style.display = 'none';
      renderCatalog();
    });
  }

  // Menú Lateral Desplegable (Drawer Estilo Zara Home)
  const sideDrawer = document.getElementById('side-drawer');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const drawerAdminBtn = document.getElementById('drawer-admin-btn');
  const headerLoginBtn = document.getElementById('header-login-btn');

  function openSideDrawer() {
    if (!sideDrawer) return;
    sideDrawer.classList.add('is-open');
    sideDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeSideDrawer() {
    if (!sideDrawer) return;
    sideDrawer.classList.remove('is-open');
    sideDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openSideDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeSideDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeSideDrawer);

  document.querySelectorAll('[data-close-drawer]').forEach(item => {
    item.addEventListener('click', () => {
      closeSideDrawer();
      const cat = item.getAttribute('data-filter');
      if (cat) {
        applyFilter(cat);
      }
    });
  });

  if (drawerAdminBtn) {
    drawerAdminBtn.addEventListener('click', () => {
      closeSideDrawer();
      openAdminLogin();
    });
  }

  if (headerLoginBtn) {
    headerLoginBtn.addEventListener('click', () => {
      openAdminLogin();
    });
  }

  // =========================================================================
  // 5. MODAL EDITORIAL LOOKBOOK & FICHA DE CREACIÓN (INSPIRACIÓN ANTHROPOLOGIE)
  // =========================================================================
  const lookbookModal = document.getElementById('lookbook-modal');
  const lookbookTrack = document.getElementById('lookbook-carousel-track');
  const lookbookDots = document.getElementById('lookbook-dots');
  const lookbookThumbs = document.getElementById('lookbook-thumbs');
  const lookbookPrevBtn = document.getElementById('lookbook-prev-btn');
  const lookbookNextBtn = document.getElementById('lookbook-next-btn');
  const lookbookCloseBtn = document.getElementById('lookbook-close-btn');

  const lookbookKicker = document.getElementById('lookbook-kicker');
  const lookbookTitle = document.getElementById('lookbook-title');
  const lookbookPrice = document.getElementById('lookbook-price');
  const lookbookTexturePill = document.getElementById('lookbook-texture-pill');
  const lookbookStory = document.getElementById('lookbook-story');
  const lookbookDesc = document.getElementById('lookbook-desc');
  const lookbookWhatsappCta = document.getElementById('lookbook-whatsapp-cta');
  const lookbookInstagramLink = document.getElementById('lookbook-instagram-link');

  let currentLookbookProduct = null;
  let currentSlideIndex = 0;
  let totalSlides = 0;

  function openLookbookModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || !lookbookModal) return;

    currentLookbookProduct = product;
    currentSlideIndex = 0;

    const images = product.images && product.images.length > 0
      ? product.images
      : [{ label: 'Detalle', src: 'assets/images/hero-textile.jpg' }];

    totalSlides = images.length;
    lookbookTrack.innerHTML = '';
    lookbookDots.innerHTML = '';
    lookbookThumbs.innerHTML = '';

    images.forEach((img, idx) => {
      // Slide grande
      const slide = document.createElement('div');
      slide.className = 'lookbook-slide';
      slide.innerHTML = `<img src="${img.src}" alt="${img.label || product.title}" loading="lazy" />`;
      lookbookTrack.appendChild(slide);

      // Dot
      const dot = document.createElement('div');
      dot.className = `lookbook-dot ${idx === 0 ? 'is-active' : ''}`;
      dot.addEventListener('click', () => goToLookbookSlide(idx));
      lookbookDots.appendChild(dot);

      // Thumbnail
      const thumb = document.createElement('div');
      thumb.className = `lookbook-thumb ${idx === 0 ? 'is-active' : ''}`;
      thumb.innerHTML = `<img src="${img.src}" alt="${img.label || `Foto ${idx + 1}`}" />`;
      thumb.addEventListener('click', () => goToLookbookSlide(idx));
      lookbookThumbs.appendChild(thumb);
    });

    updateLookbookCarouselView();

    // Rellenar Ficha Editorial Anthropologie
    if (lookbookKicker) {
      lookbookKicker.textContent = `EDICIÓN ARTESANAL \u00B7 ${product.categoryName || getCategoryLabel(product.category).toUpperCase()}`;
    }
    if (lookbookTitle) lookbookTitle.textContent = product.title;
    if (lookbookPrice) lookbookPrice.textContent = product.price || 'Consultar Confección';
    if (lookbookTexturePill) lookbookTexturePill.textContent = product.texture || 'Fibras Nobles & Hecho a Mano';

    const storyText = product.story || (product.instagram && product.instagram.caption) || 'Cada una de nuestras piezas es cortada, confeccionada y cuidada de forma individual en nuestro taller por Elena, respetando el tiempo natural de la costura artesanal.';
    if (lookbookStory) {
      lookbookStory.textContent = storyText;
    }
    if (lookbookDesc) {
      lookbookDesc.textContent = product.desc || 'Confección a mano con telas seleccionadas de primera calidad.';
    }

    lookbookModal.classList.add('is-open');
    lookbookModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLookbookModal() {
    if (!lookbookModal) return;
    lookbookModal.classList.remove('is-open');
    lookbookModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function goToLookbookSlide(index) {
    if (index < 0) index = 0;
    if (index >= totalSlides) index = totalSlides - 1;
    currentSlideIndex = index;
    updateLookbookCarouselView();
  }

  function updateLookbookCarouselView() {
    if (lookbookTrack) {
      lookbookTrack.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    }

    const dots = lookbookDots ? lookbookDots.querySelectorAll('.lookbook-dot') : [];
    dots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === currentSlideIndex);
    });

    const thumbs = lookbookThumbs ? lookbookThumbs.querySelectorAll('.lookbook-thumb') : [];
    thumbs.forEach((thumb, idx) => {
      thumb.classList.toggle('is-active', idx === currentSlideIndex);
    });

    if (lookbookPrevBtn && lookbookNextBtn) {
      lookbookPrevBtn.style.display = totalSlides <= 1 ? 'none' : 'flex';
      lookbookNextBtn.style.display = totalSlides <= 1 ? 'none' : 'flex';
    }
  }

  if (lookbookPrevBtn) {
    lookbookPrevBtn.addEventListener('click', () => {
      goToLookbookSlide((currentSlideIndex - 1 + totalSlides) % totalSlides);
    });
  }

  if (lookbookNextBtn) {
    lookbookNextBtn.addEventListener('click', () => {
      goToLookbookSlide((currentSlideIndex + 1) % totalSlides);
    });
  }

  if (lookbookCloseBtn) {
    lookbookCloseBtn.addEventListener('click', closeLookbookModal);
  }

  if (lookbookModal) {
    lookbookModal.addEventListener('click', (e) => {
      if (e.target === lookbookModal) closeLookbookModal();
    });
  }

  if (lookbookWhatsappCta) {
    lookbookWhatsappCta.addEventListener('click', (e) => {
      e.preventDefault();
      const title = currentLookbookProduct ? currentLookbookProduct.title : '';
      const url = buildWhatsAppUrl(title);
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }

  // =========================================================================
  // 6. SISTEMA DE PERFILES DE ADMINISTRACIÓN (ELENA & JUANMA)
  // =========================================================================
  const openAdminBtn = document.getElementById('open-admin-btn');
  const adminLoginModal = document.getElementById('admin-login-modal');
  const adminLoginCancelBtn = document.getElementById('admin-login-cancel-btn');

  // Perfil Elena
  const passElenaInput = document.getElementById('pass-elena');
  const btnLoginElena = document.getElementById('btn-login-elena');
  const adminNewElenaBtn = document.getElementById('admin-new-elena-btn');
  const adminLogoutElenaBtn = document.getElementById('admin-logout-elena-btn');

  // Perfil Juanma
  const passJuanmaInput = document.getElementById('pass-juanma');
  const btnLoginJuanma = document.getElementById('btn-login-juanma');
  const adminDevSettingsBtn = document.getElementById('admin-dev-settings-btn');
  const adminGithubBtn = document.getElementById('admin-github-btn');
  const adminExportBtn = document.getElementById('admin-export-btn');
  const adminNewJuanmaBtn = document.getElementById('admin-new-juanma-btn');
  const adminLogoutJuanmaBtn = document.getElementById('admin-logout-juanma-btn');

  function updateAdminUi() {
    document.body.classList.remove('admin-mode-active', 'role-elena', 'role-juanma');

    if (currentRole === 'elena') {
      document.body.classList.add('admin-mode-active', 'role-elena');
      if (adminBar) adminBar.classList.remove('is-hidden');
      if (adminBarElena) adminBarElena.style.display = 'flex';
      if (adminBarJuanma) adminBarJuanma.style.display = 'none';
    } else if (currentRole === 'juanma') {
      document.body.classList.add('admin-mode-active', 'role-juanma');
      if (adminBar) adminBar.classList.remove('is-hidden');
      if (adminBarElena) adminBarElena.style.display = 'none';
      if (adminBarJuanma) adminBarJuanma.style.display = 'flex';
    } else {
      if (adminBar) adminBar.classList.add('is-hidden');
      if (adminBarElena) adminBarElena.style.display = 'none';
      if (adminBarJuanma) adminBarJuanma.style.display = 'none';
    }

    renderCatalog();
  }

  function openAdminLogin() {
    if (currentRole) {
      showToast(`Ya estás conectado como ${currentRole === 'elena' ? 'Elena' : 'Juanma'}.`);
      return;
    }
    if (adminLoginModal) {
      adminLoginModal.classList.add('is-open');
      if (passElenaInput) passElenaInput.value = '';
      if (passJuanmaInput) passJuanmaInput.value = '';
    }
  }

  function closeAdminLogin() {
    if (adminLoginModal) adminLoginModal.classList.remove('is-open');
  }

  if (openAdminBtn) openAdminBtn.addEventListener('click', openAdminLogin);
  if (adminLoginCancelBtn) adminLoginCancelBtn.addEventListener('click', closeAdminLogin);

  // Login Elena
  if (btnLoginElena) {
    btnLoginElena.addEventListener('click', () => {
      const pass = (passElenaInput.value || '').trim().toLowerCase();
      if (PASSWORDS.elena.includes(pass) || pass === '') {
        currentRole = 'elena';
        localStorage.setItem(STORAGE_KEY_ROLE, 'elena');
        closeAdminLogin();
        updateAdminUi();
        showToast('🌸 ¡Bienvenida Elena! Ya puedes publicar fotos y cambiar precios fácilmente.');
      } else {
        alert('Clave de Elena incorrecta. (Clave por defecto: elena)');
      }
    });
  }

  if (passElenaInput) {
    passElenaInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') btnLoginElena.click();
    });
  }

  // Login Juanma
  if (btnLoginJuanma) {
    btnLoginJuanma.addEventListener('click', () => {
      const pass = (passJuanmaInput.value || '').trim().toLowerCase();
      if (PASSWORDS.juanma.includes(pass) || pass === '') {
        currentRole = 'juanma';
        localStorage.setItem(STORAGE_KEY_ROLE, 'juanma');
        closeAdminLogin();
        updateAdminUi();
        showToast('💻 ¡Modo Programador Activado! Acceso total a configuración, GitHub y respaldos.');
      } else {
        alert('Clave de Juanma incorrecta. (Clave por defecto: juanma)');
      }
    });
  }

  if (passJuanmaInput) {
    passJuanmaInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') btnLoginJuanma.click();
    });
  }

  // Cierre de Sesión para ambos roles
  function logoutAdmin() {
    currentRole = null;
    localStorage.removeItem(STORAGE_KEY_ROLE);
    updateAdminUi();
    showToast('Sesión de administración cerrada.');
  }

  if (adminLogoutElenaBtn) adminLogoutElenaBtn.addEventListener('click', logoutAdmin);
  if (adminLogoutJuanmaBtn) adminLogoutJuanmaBtn.addEventListener('click', logoutAdmin);

  // Atajos de teclado: Alt + E o Alt + A para abrir login
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLookbookModal();
      closeAdminLogin();
      closeProductEditor();
      closeDevSettings();
      closeGithubModal();
    }
    if ((e.altKey && e.key.toLowerCase() === 'e') || (e.altKey && e.key.toLowerCase() === 'a')) {
      openAdminLogin();
    }
  });

  // =========================================================================
  // 7. EDITOR DE PRODUCTO (ADAPTADO PARA ELENA Y JUANMA)
  // =========================================================================
  const productEditModal = document.getElementById('product-edit-modal');
  const productModalBadge = document.getElementById('product-modal-badge');
  const productModalTitle = document.getElementById('product-modal-title');
  const productModalDesc = document.getElementById('product-modal-desc');
  const productEditForm = document.getElementById('product-edit-form');

  const editProductId = document.getElementById('edit-product-id');
  const editTitle = document.getElementById('edit-title');
  const editCategory = document.getElementById('edit-category');
  const editPrice = document.getElementById('edit-price');
  const editTexture = document.getElementById('edit-texture');
  const editTag = document.getElementById('edit-tag');
  const editSize = document.getElementById('edit-size');
  const editDesc = document.getElementById('edit-desc');
  const editIgCaption = document.getElementById('edit-ig-caption');
  const editIgHashtags = document.getElementById('edit-ig-hashtags');

  const devFieldsRow = document.getElementById('dev-fields-row');
  const devHashtagsField = document.getElementById('dev-hashtags-field');

  const editImagesList = document.getElementById('edit-images-list');
  const editFileInput = document.getElementById('edit-file-input');
  const btnAddImageUrl = document.getElementById('btn-add-image-url');
  const editCancelBtn = document.getElementById('edit-cancel-btn');
  const editSaveBtn = document.getElementById('edit-save-btn');

  function openProductEditor(id = null) {
    if (!productEditModal) return;

    // Adaptar textos y visibilidad según si es Elena o Juanma
    const isElena = currentRole === 'elena';

    if (productModalBadge) {
      productModalBadge.className = isElena ? 'profile-badge-inline' : 'profile-badge-inline profile-badge--juanma';
      productModalBadge.textContent = isElena ? '🌸 Modo Taller de Elena' : '💻 Modo Programador';
    }

    if (devFieldsRow) devFieldsRow.style.display = isElena ? 'none' : 'grid';
    if (devHashtagsField) devHashtagsField.style.display = isElena ? 'none' : 'block';

    if (id) {
      const product = products.find(p => p.id === id);
      if (!product) return;

      productModalTitle.textContent = isElena ? `Modificar Creación: ${product.title}` : `Editar Producto (${product.id})`;
      productModalDesc.textContent = isElena
        ? 'Cambiá la información o agregá fotos de tu pieza. Al guardar se verá de inmediato en la tienda.'
        : 'Actualiza metadatos, fotos multivista y posteo editorial.';

      editProductId.value = product.id;
      editTitle.value = product.title || '';
      editCategory.value = product.category || 'cuidado-personal';
      editPrice.value = product.price || '';
      editTexture.value = product.texture || '';
      editTag.value = product.tag || '';
      editSize.value = product.size || 'medium';
      editDesc.value = product.desc || '';

      const ig = product.instagram || {};
      editIgCaption.value = ig.caption || '';
      editIgHashtags.value = ig.hashtags || '';

      renderImageRows(product.images || []);
    } else {
      productModalTitle.textContent = isElena ? '🌸 Publicar Nueva Creación' : 'Crear Nuevo Producto';
      productModalDesc.textContent = isElena
        ? 'Elegí las fotos de tu pieza y escribí cómo se llama y cuánto cuesta.'
        : 'Crea un nuevo ítem en la base de datos de productos.';

      editProductId.value = '';
      editTitle.value = '';
      editCategory.value = 'cuidado-personal';
      editPrice.value = '';
      editTexture.value = 'Confección a mano con fibras nobles';
      editTag.value = 'Novedad de Taller';
      editSize.value = 'medium';
      editDesc.value = '';
      editIgCaption.value = '';
      editIgHashtags.value = '#divinalocura #hechoamano #decoartesanal';

      renderImageRows([
        { label: 'Foto Principal', src: 'assets/images/hero-textile.jpg' }
      ]);
    }

    if (editSaveBtn) {
      editSaveBtn.textContent = isElena ? '✨ Guardar y Publicar en la Tienda' : 'Guardar Producto';
    }

    productEditModal.classList.add('is-open');
  }

  function closeProductEditor() {
    if (productEditModal) productEditModal.classList.remove('is-open');
  }

  if (editCancelBtn) editCancelBtn.addEventListener('click', closeProductEditor);
  if (adminNewElenaBtn) adminNewElenaBtn.addEventListener('click', () => openProductEditor(null));
  if (adminNewJuanmaBtn) adminNewJuanmaBtn.addEventListener('click', () => openProductEditor(null));

  function renderImageRows(images) {
    if (!editImagesList) return;
    editImagesList.innerHTML = '';
    const limitedImages = (images || []).slice(0, 4);
    limitedImages.forEach((img, idx) => {
      addImageRow(img.label || `Foto ${idx + 1}`, img.src);
    });
  }

  function addImageRow(label = 'Foto', src = '') {
    if (!editImagesList) return;
    const currentCount = editImagesList.querySelectorAll('.admin-image-row').length;
    if (currentCount >= 4) {
      showToast('⚠️ Máximo 4 fotos por producto (Inspiración Zara Home & Anthropologie).');
      return;
    }
    const row = document.createElement('div');
    row.className = 'admin-image-row';
    row.innerHTML = `
      <img src="${src || 'assets/images/hero-textile.jpg'}" alt="Preview" class="admin-img-preview" />
      <input type="text" class="admin-input img-label-input" placeholder="Etiqueta (ej: Foto 1, Ambiente, Detalle)" value="${label}" style="flex:1;" />
      <input type="text" class="admin-input img-src-input" placeholder="Ruta o Enlace" value="${src}" style="flex:2;" />
      <button type="button" class="btn-remove-row" title="Eliminar foto">✕</button>
    `;

    const srcInput = row.querySelector('.img-src-input');
    const preview = row.querySelector('.admin-img-preview');
    srcInput.addEventListener('input', () => {
      preview.src = srcInput.value;
    });

    row.querySelector('.btn-remove-row').addEventListener('click', () => {
      row.remove();
    });

    editImagesList.appendChild(row);
  }

  // Subir imagen desde teléfono o computadora (FileReader Base64)
  if (editFileInput) {
    editFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target.result;
        addImageRow('Nueva Foto Subida', base64Data);
        showToast('📸 Foto cargada desde tu dispositivo.');
      };
      reader.readAsDataURL(file);
      editFileInput.value = '';
    });
  }

  if (btnAddImageUrl) {
    btnAddImageUrl.addEventListener('click', () => {
      addImageRow('Nueva Foto', 'assets/images/catalog/handcrafted-cotton-towels-on-bench.jpg');
    });
  }

  // Guardar Creación / Producto
  if (productEditForm) {
    productEditForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const id = editProductId.value || `prod_${Date.now()}`;
      const title = editTitle.value.trim();
      const category = editCategory.value;
      const price = editPrice.value.trim() || 'Consultar';
      const texture = editTexture.value.trim() || 'Confección artesanal';
      const tag = editTag.value.trim() || 'Hecho a Mano';
      const size = editSize.value || 'medium';
      const desc = editDesc.value.trim();
      const igCaption = editIgCaption.value.trim();
      const igHashtags = editIgHashtags.value.trim();

      const images = [];
      editImagesList.querySelectorAll('.admin-image-row').forEach(row => {
        const label = row.querySelector('.img-label-input').value.trim();
        const src = row.querySelector('.img-src-input').value.trim();
        if (src) {
          images.push({ label: label || 'Vista', src });
        }
      });

      if (images.length === 0) {
        images.push({ label: 'Foto Principal', src: 'assets/images/hero-textile.jpg' });
      }

      // Máximo 4 fotos por producto (Inspiración Zara Home & Anthropologie)
      const finalImages = images.slice(0, 4);

      const existingIndex = products.findIndex(p => p.id === id);
      const productPayload = {
        id,
        title,
        category,
        categoryName: getCategoryLabel(category),
        size,
        tag,
        texture,
        price,
        desc,
        images: finalImages,
        story: igCaption || desc || 'Pieza única elaborada con amor en el taller de Divina Locura Deco.',
        instagram: {
          date: 'Edición Artesanal',
          likes: 0,
          caption: igCaption || desc || 'Pieza única elaborada con amor en el taller de Divina Locura Deco.',
          hashtags: '',
          comments: []
        }
      };

      if (existingIndex >= 0) {
        products[existingIndex] = productPayload;
        showToast(currentRole === 'elena' ? `🌸 ¡Listo Elena! "${title}" ya está actualizada.` : `✅ "${title}" actualizado con éxito.`);
      } else {
        products.unshift(productPayload);
        showToast(currentRole === 'elena' ? `🎉 ¡Felicitaciones Elena! "${title}" ya está publicada en la tienda.` : `🎉 Nuevo producto "${title}" agregado.`);
      }

      saveProductsToStorage();
      renderCatalog();
      closeProductEditor();
    });
  }

  function deleteProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    if (confirm(`¿Estás seguro de que deseas eliminar "${product.title}" del catálogo?`)) {
      products = products.filter(p => p.id !== id);
      saveProductsToStorage();
      renderCatalog();
      showToast(`🗑️ Producto eliminado.`);
    }
  }

  // =========================================================================
  // 8. MODAL DE CONFIGURACIÓN DEL SISTEMA (EXCLUSIVO JUANMA)
  // =========================================================================
  const devSettingsModal = document.getElementById('dev-settings-modal');
  const devSettingsForm = document.getElementById('dev-settings-form');
  const devSettingsCloseBtn = document.getElementById('dev-settings-close-btn');

  const settingWhatsapp = document.getElementById('setting-whatsapp');
  const settingInstagram = document.getElementById('setting-instagram');
  const settingAnnouncement = document.getElementById('setting-announcement');
  const settingGhToken = document.getElementById('setting-gh-token');

  const btnSyncGithubDirect = document.getElementById('btn-sync-github-direct');
  const btnDownloadBackup = document.getElementById('btn-download-backup');
  const btnResetFactory = document.getElementById('btn-reset-factory');

  function openDevSettings() {
    if (!devSettingsModal) return;
    if (settingWhatsapp) settingWhatsapp.value = settings.whatsapp_phone || '';
    if (settingInstagram) settingInstagram.value = settings.instagram_user || '';
    if (settingAnnouncement) settingAnnouncement.value = settings.announcement || '';
    if (settingGhToken) settingGhToken.value = settings.gh_token || '';
    devSettingsModal.classList.add('is-open');
  }

  function closeDevSettings() {
    if (devSettingsModal) devSettingsModal.classList.remove('is-open');
  }

  if (adminDevSettingsBtn) adminDevSettingsBtn.addEventListener('click', openDevSettings);
  if (devSettingsCloseBtn) devSettingsCloseBtn.addEventListener('click', closeDevSettings);

  if (devSettingsForm) {
    devSettingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (settingWhatsapp) settings.whatsapp_phone = (settingWhatsapp.value || '').trim();
      if (settingInstagram) settings.instagram_user = (settingInstagram.value || '').trim();
      if (settingAnnouncement) settings.announcement = (settingAnnouncement.value || '').trim();
      if (settingGhToken) settings.gh_token = (settingGhToken.value || '').trim();

      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
      applySystemSettings();
      closeDevSettings();
      showToast('⚙️ Configuración del sitio guardada correctamente.');
    });
  }

  // Botón Restablecer Catálogo Original
  if (btnResetFactory) {
    btnResetFactory.addEventListener('click', () => {
      if (confirm('¿Restablecer el catálogo al estado de fábrica? Se recuperarán los 8 productos originales.')) {
        if (typeof INITIAL_PRODUCTS !== 'undefined') {
          products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
          saveProductsToStorage();
          renderCatalog();
          showToast('🔄 Catálogo restaurado con los productos originales.');
        }
      }
    });
  }

  // =========================================================================
  // 9. SINCRONIZACIÓN CON GITHUB & RESPALDOS
  // =========================================================================
  const githubSyncModal = document.getElementById('github-sync-modal');
  const ghSyncCloseBtn = document.getElementById('gh-sync-close-btn');
  const modalDownloadDataBtn = document.getElementById('modal-download-data-btn');
  const ghTokenInput = document.getElementById('gh-token-input');
  const ghSyncSubmitBtn = document.getElementById('gh-sync-submit-btn');

  function generateProductsDataJs() {
    return `/**
 * Divina Locura Deco - Base de Datos de Productos
 * Generado automáticamente desde el Modo Administrador.
 */

const INITIAL_PRODUCTS = ${JSON.stringify(products, null, 2)};
`;
  }

  function downloadProductsFile() {
    const content = generateProductsDataJs();
    const blob = new Blob([content], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products-data.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('📥 Archivo products-data.js descargado.');
  }

  if (adminExportBtn) adminExportBtn.addEventListener('click', downloadProductsFile);
  if (modalDownloadDataBtn) modalDownloadDataBtn.addEventListener('click', downloadProductsFile);
  if (btnDownloadBackup) btnDownloadBackup.addEventListener('click', downloadProductsFile);

  function openGithubModal() {
    if (githubSyncModal) {
      if (ghTokenInput && settings.gh_token) {
        ghTokenInput.value = settings.gh_token;
      }
      githubSyncModal.classList.add('is-open');
    }
  }

  function closeGithubModal() {
    if (githubSyncModal) githubSyncModal.classList.remove('is-open');
  }

  if (adminGithubBtn) adminGithubBtn.addEventListener('click', openGithubModal);
  if (ghSyncCloseBtn) ghSyncCloseBtn.addEventListener('click', closeGithubModal);

  async function pushToGithub(token) {
    if (!token) {
      alert('Ingresa un token de GitHub (PAT) con permisos de "repo".');
      return;
    }

    try {
      const repo = 'fernandezbjuanma-wq/divinalocura';
      const path = 'products-data.js';
      const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;

      const getRes = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      let sha = null;
      if (getRes.ok) {
        const getData = await getRes.json();
        sha = getData.sha;
      }

      const newContent = generateProductsDataJs();
      const base64Content = btoa(unescape(encodeURIComponent(newContent)));

      const putRes = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'feat: actualizar productos desde Modo Admin en la web',
          content: base64Content,
          sha: sha || undefined
        })
      });

      if (putRes.ok) {
        showToast('🚀 ¡Cambios publicados directamente en GitHub con éxito!');
        closeGithubModal();
        closeDevSettings();
      } else {
        const errData = await putRes.json();
        alert(`Error al publicar: ${errData.message || 'Verifica el token.'}`);
      }
    } catch (err) {
      alert(`Error de conexión: ${err.message}`);
    }
  }

  if (ghSyncSubmitBtn) {
    ghSyncSubmitBtn.addEventListener('click', () => {
      const token = (ghTokenInput.value || '').trim();
      pushToGithub(token);
    });
  }

  if (btnSyncGithubDirect) {
    btnSyncGithubDirect.addEventListener('click', () => {
      const token = (settingGhToken.value || settings.gh_token || '').trim();
      pushToGithub(token);
    });
  }

  // =========================================================================
  // 10. TOAST NOTIFICATIONS
  // =========================================================================
  function showToast(message) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  // Exponer API global
  window.DivinaLocura = {
    openLookbookModal,
    openInstagramModal: openLookbookModal, // Compatibilidad retroactiva
    closeLookbookModal,
    openProductEditor,
    closeProductEditor,
    openAdminLogin,
    setRole: (role) => {
      currentRole = role;
      if (role) localStorage.setItem(STORAGE_KEY_ROLE, role);
      else localStorage.removeItem(STORAGE_KEY_ROLE);
      updateAdminUi();
    },
    getProducts: () => products,
    getSettings: () => settings,
    renderCatalog
  };

  // Inicializar Interfaz
  updateAdminUi();
});
