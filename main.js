/**
 * Divina Locura Deco - Sistema Frontend & Modo Administrador Dual
 * Inspiración Anthropologie (lookbook editorial, secciones cuidadas y narrativas artesanales)
 * Dos Perfiles de Administración:
 *   1. Elena (Mamá / Taller): Interfaz simple, cálida y sin jerga técnica para publicar creaciones, fotos y precios.
 *   2. Juanma (Programador): Control del funcionamiento técnico, sincronización con GitHub, WhatsApp, anuncios y respaldos.
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. ESTADO DE DATOS (PRODUCTOS, ROLES, CLIENTAS, CARRITO & PEDIDOS)
  // =========================================================================
  const STORAGE_KEY_PRODUCTS = 'divinalocura_products';
  const STORAGE_KEY_ROLE = 'divinalocura_role'; // 'elena' | 'juanma' | null
  const STORAGE_KEY_SETTINGS = 'divinalocura_settings';
  const STORAGE_KEY_CUSTOMER = 'divinalocura_customer';
  const STORAGE_KEY_CART = 'divinalocura_cart';
  const STORAGE_KEY_ORDERS = 'divinalocura_orders';

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

  // Cargar Clienta
  let currentCustomer = null;
  try {
    const savedCustomer = localStorage.getItem(STORAGE_KEY_CUSTOMER);
    if (savedCustomer) currentCustomer = JSON.parse(savedCustomer);
  } catch (e) {
    console.warn('Error leyendo clienta:', e);
  }

  // Cargar Carrito / Bolsa
  let cart = [];
  try {
    const savedCart = localStorage.getItem(STORAGE_KEY_CART);
    if (savedCart) cart = JSON.parse(savedCart);
  } catch (e) {
    console.warn('Error leyendo carrito:', e);
  }

  // Cargar Pedidos Recibidos
  let orders = [];
  try {
    const savedOrders = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (savedOrders) orders = JSON.parse(savedOrders);
  } catch (e) {
    console.warn('Error leyendo pedidos:', e);
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
  } else if (typeof INITIAL_PRODUCTS !== 'undefined') {
    // Migración automática: si el navegador tenía en caché fotos antiguas de baja calidad, actualizar a la nueva fotografía editorial de alta gama
    const hasLegacyImages = products.some(p =>
      (p.images || []).some(img => (img.src || '').includes('real-') || (img.src || '').includes('/instagram/'))
    );
    if (hasLegacyImages) {
      products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
      try {
        localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
      } catch (e) {}
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
              <button type="button" class="btn--add-bag" data-add-bag="${product.id}" title="Agregar a mi bolsa de pedidos">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                <span>+ Bolsa</span>
              </button>
              <button class="btn btn--whatsapp" data-product-name="${product.title}" aria-label="Pedir por WhatsApp">
                <span>Pedir</span>
                <svg class="btn__icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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

    // Botón Agregar a la Bolsa (+ Bolsa)
    document.querySelectorAll('[data-add-bag]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const productId = btn.getAttribute('data-add-bag');
        addToCart(productId);
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
      openAdminLogin('team');
    });
  }

  if (headerLoginBtn) {
    headerLoginBtn.addEventListener('click', () => {
      openAdminLogin('client');
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
    if (typeof updateClientUi === 'function') updateClientUi();
    if (typeof updateCartUi === 'function') updateCartUi();
    if (typeof updateElenaOrdersBadge === 'function') updateElenaOrdersBadge();
  }

  function openAdminLogin(defaultTab = 'client') {
    if (adminLoginModal) {
      adminLoginModal.classList.add('is-open');
      if (passElenaInput) passElenaInput.value = '';
      if (passJuanmaInput) passJuanmaInput.value = '';

      if (defaultTab === 'team' && tabBtnTeam) {
        tabBtnTeam.click();
      } else if (tabBtnClient) {
        tabBtnClient.click();
      }
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

  // =========================================================================
  // 11. SISTEMA DE CLIENTAS & AUTENTICACIÓN UNIFICADA
  // =========================================================================
  const headerUserLabel = document.getElementById('header-user-label');
  const tabBtnClient = document.getElementById('tab-btn-client');
  const tabBtnTeam = document.getElementById('tab-btn-team');
  const authPanelClient = document.getElementById('auth-panel-client');
  const authPanelTeam = document.getElementById('auth-panel-team');

  const clientViewLoggedOut = document.getElementById('client-view-logged-out');
  const clientViewLoggedIn = document.getElementById('client-view-logged-in');

  const regClientName = document.getElementById('reg-client-name');
  const regClientPhone = document.getElementById('reg-client-phone');
  const regClientEmail = document.getElementById('reg-client-email');
  const regClientAddress = document.getElementById('reg-client-address');
  const btnSaveClientAccount = document.getElementById('btn-save-client-account');

  const loggedClientName = document.getElementById('logged-client-name');
  const loggedClientPhone = document.getElementById('logged-client-phone');
  const loggedClientEmail = document.getElementById('logged-client-email');
  const loggedClientAddress = document.getElementById('logged-client-address');
  const clientOrdersList = document.getElementById('client-orders-list');
  const btnLogoutClient = document.getElementById('btn-logout-client');
  const btnOpenCartFromProfile = document.getElementById('btn-open-cart-from-profile');

  function updateClientUi() {
    if (headerUserLabel) {
      if (currentCustomer && currentCustomer.name) {
        const firstName = currentCustomer.name.trim().split(' ')[0];
        headerUserLabel.textContent = `HOLA, ${firstName.toUpperCase()} 🌸`;
      } else {
        headerUserLabel.textContent = 'MI CUENTA';
      }
    }

    if (currentCustomer && currentCustomer.name) {
      if (clientViewLoggedOut) clientViewLoggedOut.style.display = 'none';
      if (clientViewLoggedIn) clientViewLoggedIn.style.display = 'block';

      if (loggedClientName) loggedClientName.textContent = `¡Hola, ${currentCustomer.name}!`;
      if (loggedClientPhone) loggedClientPhone.textContent = currentCustomer.phone || '-';
      if (loggedClientEmail) loggedClientEmail.textContent = currentCustomer.email || 'No especificado';
      if (loggedClientAddress) loggedClientAddress.textContent = currentCustomer.address || 'A convenir';

      // Renderizar pedidos de la clienta
      if (clientOrdersList) {
        const clientOrders = orders.filter(o => 
          (o.customer && (o.customer.phone === currentCustomer.phone || o.customer.email === currentCustomer.email || o.customer.name === currentCustomer.name))
        );
        if (clientOrders.length === 0) {
          clientOrdersList.innerHTML = '<p class="client-orders-empty">Aún no has enviado pedidos desde la web.</p>';
        } else {
          clientOrdersList.innerHTML = clientOrders.map(ord => `
            <div class="client-order-item">
              <div class="client-order-header">
                <span>Pedido #${ord.id}</span>
                <span class="client-order-badge">${ord.status || 'En preparación'}</span>
              </div>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.25rem;">${ord.date} a las ${ord.time}</div>
              <div>${(ord.items || []).map(i => `${i.qty}x ${i.title}${i.note ? ` (<em>${i.note}</em>)` : ''}`).join(', ')}</div>
            </div>
          `).join('');
        }
      }

      // Prellenar inputs de la bolsa
      const cartName = document.getElementById('cart-input-name');
      const cartPhone = document.getElementById('cart-input-phone');
      const cartEmail = document.getElementById('cart-input-email');
      const cartAddress = document.getElementById('cart-input-address');
      const cartBadge = document.getElementById('cart-customer-badge');

      if (cartName && !cartName.value) cartName.value = currentCustomer.name;
      if (cartPhone && !cartPhone.value) cartPhone.value = currentCustomer.phone;
      if (cartEmail && !cartEmail.value) cartEmail.value = currentCustomer.email || '';
      if (cartAddress && !cartAddress.value) cartAddress.value = currentCustomer.address || '';
      if (cartBadge) cartBadge.textContent = '🌸 Datos de clienta cargados';
    } else {
      if (clientViewLoggedOut) clientViewLoggedOut.style.display = 'block';
      if (clientViewLoggedIn) clientViewLoggedIn.style.display = 'none';
      const cartBadge = document.getElementById('cart-customer-badge');
      if (cartBadge) cartBadge.textContent = '';
    }
  }

  // Pestañas del Modal de Autenticación (Clientas vs Equipo)
  if (tabBtnClient) {
    tabBtnClient.addEventListener('click', () => {
      tabBtnClient.classList.add('is-active');
      tabBtnClient.setAttribute('aria-selected', 'true');
      if (tabBtnTeam) {
        tabBtnTeam.classList.remove('is-active');
        tabBtnTeam.setAttribute('aria-selected', 'false');
      }
      if (authPanelClient) authPanelClient.style.display = 'block';
      if (authPanelTeam) authPanelTeam.style.display = 'none';
    });
  }

  if (tabBtnTeam) {
    tabBtnTeam.addEventListener('click', () => {
      tabBtnTeam.classList.add('is-active');
      tabBtnTeam.setAttribute('aria-selected', 'true');
      if (tabBtnClient) {
        tabBtnClient.classList.remove('is-active');
        tabBtnClient.setAttribute('aria-selected', 'false');
      }
      if (authPanelTeam) authPanelTeam.style.display = 'block';
      if (authPanelClient) authPanelClient.style.display = 'none';
    });
  }

  // Guardar Registro de Clienta
  if (btnSaveClientAccount) {
    btnSaveClientAccount.addEventListener('click', () => {
      const name = (regClientName ? regClientName.value : '').trim();
      const phone = (regClientPhone ? regClientPhone.value : '').trim();
      const email = (regClientEmail ? regClientEmail.value : '').trim();
      const address = (regClientAddress ? regClientAddress.value : '').trim();

      if (!name || !phone) {
        alert('Por favor ingresá tu nombre y un teléfono/WhatsApp de contacto.');
        return;
      }

      currentCustomer = { name, phone, email, address };
      try {
        localStorage.setItem(STORAGE_KEY_CUSTOMER, JSON.stringify(currentCustomer));
      } catch (e) {}

      updateClientUi();
      showToast(`🌸 ¡Bienvenida ${name}! Tus datos quedaron guardados.`);
    });
  }

  // Cerrar Sesión de Clienta
  if (btnLogoutClient) {
    btnLogoutClient.addEventListener('click', () => {
      currentCustomer = null;
      localStorage.removeItem(STORAGE_KEY_CUSTOMER);
      updateClientUi();
      showToast('Sesión de clienta cerrada.');
    });
  }

  // Abrir Carrito desde el perfil
  if (btnOpenCartFromProfile) {
    btnOpenCartFromProfile.addEventListener('click', () => {
      closeAdminLogin();
      openCartDrawer();
    });
  }

  // =========================================================================
  // 12. BOLSA DE PEDIDOS (CARRITO) & ENLACE CON ELENA (WHATSAPP + EMAIL)
  // =========================================================================
  const cartDrawer = document.getElementById('cart-drawer');
  const cartDrawerClose = document.getElementById('cart-drawer-close');
  const cartDrawerBackdrop = document.getElementById('cart-drawer-backdrop');
  const headerCartBtn = document.getElementById('header-cart-btn');
  const headerCartCount = document.getElementById('header-cart-count');
  const cartDrawerCount = document.getElementById('cart-drawer-count');
  const cartEmptyState = document.getElementById('cart-empty-state');
  const cartItemsList = document.getElementById('cart-items-list');
  const cartDrawerFooter = document.getElementById('cart-drawer-footer');
  const cartEmptyCta = document.getElementById('cart-empty-cta');

  const cartInputName = document.getElementById('cart-input-name');
  const cartInputPhone = document.getElementById('cart-input-phone');
  const cartInputEmail = document.getElementById('cart-input-email');
  const cartInputAddress = document.getElementById('cart-input-address');

  const cartBtnWhatsapp = document.getElementById('cart-btn-whatsapp');
  const cartBtnEmail = document.getElementById('cart-btn-email');

  function openCartDrawer() {
    if (!cartDrawer) return;
    cartDrawer.classList.add('is-open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    updateCartUi();
  }

  function closeCartDrawer() {
    if (!cartDrawer) return;
    cartDrawer.classList.remove('is-open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (headerCartBtn) headerCartBtn.addEventListener('click', openCartDrawer);
  if (cartDrawerClose) cartDrawerClose.addEventListener('click', closeCartDrawer);
  if (cartDrawerBackdrop) cartDrawerBackdrop.addEventListener('click', closeCartDrawer);
  if (cartEmptyCta) {
    cartEmptyCta.addEventListener('click', () => {
      closeCartDrawer();
    });
  }

  function saveCartToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(cart));
    } catch (e) {}
  }

  function addToCart(productId, customNote = '') {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const defaultImg = (product.images && product.images[0]) ? product.images[0].src : 'assets/images/hero-textile.jpg';

    // Verificar si el mismo producto con la misma nota ya existe
    const existingIndex = cart.findIndex(item => item.id === productId && (item.note || '') === (customNote || ''));
    if (existingIndex > -1) {
      cart[existingIndex].qty += 1;
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        price: product.price || 'Confección a Mano',
        categoryName: product.categoryName || getCategoryLabel(product.category),
        img: defaultImg,
        note: customNote,
        qty: 1
      });
    }

    saveCartToStorage();
    updateCartUi();
    openCartDrawer();
    showToast(`✨ Sumado a tu bolsa: "${product.title}"`);
  }

  function updateCartUi() {
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);

    if (headerCartCount) {
      headerCartCount.textContent = totalCount;
      headerCartCount.classList.toggle('has-items', totalCount > 0);
    }
    if (cartDrawerCount) {
      cartDrawerCount.textContent = `(${totalCount} ${totalCount === 1 ? 'pieza' : 'piezas'})`;
    }

    if (cart.length === 0) {
      if (cartEmptyState) cartEmptyState.style.display = 'block';
      if (cartItemsList) cartItemsList.style.display = 'none';
      if (cartDrawerFooter) cartDrawerFooter.style.display = 'none';
      return;
    }

    if (cartEmptyState) cartEmptyState.style.display = 'none';
    if (cartItemsList) cartItemsList.style.display = 'flex';
    if (cartDrawerFooter) cartDrawerFooter.style.display = 'block';

    cartItemsList.innerHTML = cart.map((item, idx) => `
      <div class="cart-item-row" data-item-idx="${idx}">
        <img src="${item.img}" alt="${item.title}" class="cart-item__thumb" />
        <div class="cart-item__info">
          <h4 class="cart-item__title">${item.title}</h4>
          <span class="cart-item__category">${item.categoryName}</span>
          <span class="cart-item__price">${item.price}</span>
          
          <input 
            type="text" 
            class="cart-item__note-input" 
            data-cart-idx="${idx}" 
            placeholder="Personalización (ej: Nombre bordado, tono)" 
            value="${item.note || ''}" 
            title="Escribí si querés un nombre bordado o detalle especial"
          />

          <div class="cart-item__controls">
            <div class="cart-qty-stepper">
              <button type="button" class="cart-qty-btn btn-cart-dec" data-cart-idx="${idx}" aria-label="Restar una unidad">-</button>
              <span class="cart-qty-num">${item.qty}</span>
              <button type="button" class="cart-qty-btn btn-cart-inc" data-cart-idx="${idx}" aria-label="Sumar una unidad">+</button>
            </div>
            <button type="button" class="cart-item-remove" data-cart-del="${idx}">Eliminar</button>
          </div>
        </div>
      </div>
    `).join('');

    // Eventos de controles de cantidad y notas
    cartItemsList.querySelectorAll('.btn-cart-dec').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-cart-idx'), 10);
        if (cart[idx].qty > 1) {
          cart[idx].qty -= 1;
        } else {
          cart.splice(idx, 1);
        }
        saveCartToStorage();
        updateCartUi();
      });
    });

    cartItemsList.querySelectorAll('.btn-cart-inc').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-cart-idx'), 10);
        cart[idx].qty += 1;
        saveCartToStorage();
        updateCartUi();
      });
    });

    cartItemsList.querySelectorAll('[data-cart-del]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-cart-del'), 10);
        cart.splice(idx, 1);
        saveCartToStorage();
        updateCartUi();
      });
    });

    cartItemsList.querySelectorAll('.cart-item__note-input').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const idx = parseInt(inp.getAttribute('data-cart-idx'), 10);
        if (cart[idx]) {
          cart[idx].note = e.target.value;
          saveCartToStorage();
        }
      });
    });

    // Sincronizar datos de clienta si está logueada
    if (currentCustomer) {
      if (cartInputName && !cartInputName.value) cartInputName.value = currentCustomer.name;
      if (cartInputPhone && !cartInputPhone.value) cartInputPhone.value = currentCustomer.phone;
      if (cartInputEmail && !cartInputEmail.value) cartInputEmail.value = currentCustomer.email || '';
      if (cartInputAddress && !cartInputAddress.value) cartInputAddress.value = currentCustomer.address || '';
    }
  }

  // Hook del botón del Lookbook Modal para agregar a la bolsa
  const lookbookAddBagBtn = document.getElementById('lookbook-add-bag-btn');
  const lookbookCustomNote = document.getElementById('lookbook-custom-note');

  if (lookbookAddBagBtn) {
    lookbookAddBagBtn.addEventListener('click', () => {
      if (!currentLookbookProduct) return;
      const note = lookbookCustomNote ? lookbookCustomNote.value.trim() : '';
      addToCart(currentLookbookProduct.id, note);
      closeLookbookModal();
    });
  }

  // Función para procesar y registrar el pedido
  function createAndSaveOrder(name, phone, email, address) {
    const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const newOrder = {
      id: orderId,
      date: new Date().toLocaleDateString('es-AR'),
      time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      customer: { name, phone, email, address },
      items: JSON.parse(JSON.stringify(cart)),
      totalCount: cart.reduce((sum, item) => sum + item.qty, 0),
      status: 'Pendiente'
    };

    orders.unshift(newOrder);
    try {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    } catch (e) {}

    // Si la clienta no estaba guardada, guardarla
    if (!currentCustomer) {
      currentCustomer = { name, phone, email, address };
      try {
        localStorage.setItem(STORAGE_KEY_CUSTOMER, JSON.stringify(currentCustomer));
      } catch (e) {}
    }

    updateClientUi();
    updateElenaOrdersBadge();

    return newOrder;
  }

  function getCartCustomerData() {
    const name = (cartInputName ? cartInputName.value : '').trim();
    const phone = (cartInputPhone ? cartInputPhone.value : '').trim();
    const email = (cartInputEmail ? cartInputEmail.value : '').trim();
    const address = (cartInputAddress ? cartInputAddress.value : '').trim();

    if (!name || !phone) {
      alert('Por favor ingresá tu nombre y WhatsApp para que Elena pueda coordinar tu pedido.');
      return null;
    }

    return { name, phone, email, address };
  }

  // Checkout por WhatsApp
  if (cartBtnWhatsapp) {
    cartBtnWhatsapp.addEventListener('click', () => {
      if (cart.length === 0) return;
      const cust = getCartCustomerData();
      if (!cust) return;

      const order = createAndSaveOrder(cust.name, cust.phone, cust.email, cust.address);

      let msg = `🌸 *NUEVO PEDIDO DESDE LA TIENDA WEB*\n`;
      msg += `--------------------------------------\n`;
      msg += `*Cliente:* ${cust.name}\n`;
      msg += `*WhatsApp:* ${cust.phone}\n`;
      if (cust.email) msg += `*Email:* ${cust.email}\n`;
      if (cust.address) msg += `*Dirección/Entrega:* ${cust.address}\n`;
      msg += `\n*PIEZAS ENCARGADAS (${order.totalCount}):*\n`;
      order.items.forEach((item, i) => {
        msg += `${i + 1}. *${item.qty}x ${item.title}* (${item.price})\n`;
        if (item.note) msg += `   └ Nota: ${item.note}\n`;
      });
      msg += `--------------------------------------\n`;
      msg += `Hola Elena! Te envío mi pedido desde la web de Divina Locura Deco para coordinar disponibilidad y confección. ¡Muchas gracias! ✨`;

      const cleanPhone = (settings.whatsapp_phone || '').replace(/[^0-9]/g, '');
      let waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
      if (cleanPhone && cleanPhone !== '5491100000000') {
        waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;
      }

      // Vaciar carrito
      cart = [];
      saveCartToStorage();
      updateCartUi();
      closeCartDrawer();

      window.open(waUrl, '_blank', 'noopener,noreferrer');
      showToast('🌸 ¡Pedido enviado por WhatsApp a Elena! Te responderá en breve.');
    });
  }

  // Checkout por Email
  if (cartBtnEmail) {
    cartBtnEmail.addEventListener('click', () => {
      if (cart.length === 0) return;
      const cust = getCartCustomerData();
      if (!cust) return;

      const order = createAndSaveOrder(cust.name, cust.phone, cust.email, cust.address);

      const subject = `Nuevo Pedido en Tienda Web (#${order.id}) - ${cust.name}`;
      let body = `NUEVO PEDIDO DESDE LA TIENDA WEB - DIVINA LOCURA DECO\n\n`;
      body += `Cliente: ${cust.name}\n`;
      body += `WhatsApp / Teléfono: ${cust.phone}\n`;
      if (cust.email) body += `Email de Contacto: ${cust.email}\n`;
      if (cust.address) body += `Dirección / Localidad: ${cust.address}\n\n`;
      body += `PIEZAS ENCARGADAS (${order.totalCount}):\n`;
      order.items.forEach((item, i) => {
        body += `${i + 1}. ${item.qty}x ${item.title} (${item.price})\n`;
        if (item.note) body += `   - Personalización / Nota: ${item.note}\n`;
      });
      body += `\nFecha del pedido: ${order.date} a las ${order.time}\n`;
      body += `\nEnviado a través de la tienda web oficial de Divina Locura Deco.`;

      const targetEmail = 'divinalocuradeco@gmail.com';
      const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      cart = [];
      saveCartToStorage();
      updateCartUi();
      closeCartDrawer();

      window.location.href = mailtoUrl;
      showToast('✉️ Pedido generado para envío por correo electrónico a Elena.');
    });
  }

  // =========================================================================
  // 13. CHATBOT CONCIERGE ("ELENA ASISTENTE DEL TALLER")
  // =========================================================================
  const chatbotTriggerBtn = document.getElementById('chatbot-trigger-btn');
  const chatbotWindow = document.getElementById('chatbot-window');
  const chatbotCloseBtn = document.getElementById('chatbot-close-btn');
  const chatbotMessages = document.getElementById('chatbot-messages');
  const chatbotForm = document.getElementById('chatbot-form');
  const chatbotInput = document.getElementById('chatbot-input');
  const chatbotSuggestions = document.getElementById('chatbot-suggestions');

  function openChatbot() {
    if (chatbotWindow) {
      chatbotWindow.classList.add('is-open');
      chatbotWindow.setAttribute('aria-hidden', 'false');
      if (chatbotInput) chatbotInput.focus();
    }
  }

  function closeChatbot() {
    if (chatbotWindow) {
      chatbotWindow.classList.remove('is-open');
      chatbotWindow.setAttribute('aria-hidden', 'true');
    }
  }

  if (chatbotTriggerBtn) {
    chatbotTriggerBtn.addEventListener('click', () => {
      const isOpen = chatbotWindow && chatbotWindow.classList.contains('is-open');
      if (isOpen) closeChatbot();
      else openChatbot();
    });
  }

  if (chatbotCloseBtn) chatbotCloseBtn.addEventListener('click', closeChatbot);

  function appendChatMessage(text, sender = 'bot', actionButton = null) {
    if (!chatbotMessages) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg chat-msg--${sender}`;
    let contentHtml = `<div class="chat-bubble">${text}</div>`;
    if (actionButton) {
      contentHtml += `<div style="margin-top:0.4rem;">${actionButton}</div>`;
    }
    msgDiv.innerHTML = contentHtml;
    chatbotMessages.appendChild(msgDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  const BOT_KNOWLEDGE = {
    personalizado: '¡Nos encanta crear piezas únicas con historia! 🐰🤍 Para las conejitas de apego, babitas o toallitas infantiles, Elena borda a mano el nombre que elijas. Simplemente sumá la pieza a tu <strong>Bolsa de Pedidos</strong> y escribí el nombre en la nota de personalización, o contactanos por WhatsApp para ver tipografías.',
    saten: 'El <strong>satén de seda premium</strong> que usa Elena cuida tu piel y cabello durante el descanso. A diferencia del algodón común, no genera fricción (evitando el quiebre y el frizz matutino) y no absorbe las cremas nocturnas de tu rostro. ¡Es uno de los clásicos más pedidos del taller!',
    waffle: 'Nuestras piezas de <strong>nido de abeja (waffle) 100% puro algodón</strong> y lino están prelavadas para que no encojan. Te recomendamos lavarlas con agua fría en programa delicado o a mano, sin retorcer fuerte, y secarlas tendidas a la sombra para que conserven su esponjosidad.',
    envios: 'Elena confecciona cada pieza artesanalmente a fuego lento. Los pedidos habituales se despachan en <strong>3 a 5 días hábiles</strong>, y los bordados con nombre en <strong>5 a 7 días</strong>. Hacemos envíos seguros a todo el país y coordinamos entregas en Buenos Aires.',
    pedido: '¡Hacer tu pedido es muy sencillo! 🌸 Podés recorrer la colección, tocar el botón <strong>"+ Bolsa"</strong> en los artículos que te gusten, indicar si querés algún bordado o color especial, y tocar <strong>"Enviar Pedido a Elena por WhatsApp"</strong>. Elena lo recibe al instante y te responde personalmente.',
    whatsapp: '¡Qué lindo que quieras hablar con Elena! Hacé clic abajo para abrir una conversación directa en su WhatsApp:'
  };

  function processChatbotQuery(query) {
    const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (q.includes('personaliz') || q.includes('nombre') || q.includes('bordad') || q.includes('bebe') || q.includes('conejit') || q.includes('ajuar')) {
      return { text: BOT_KNOWLEDGE.personalizado };
    }
    if (q.includes('saten') || q.includes('frizz') || q.includes('cofia') || q.includes('almohada') || q.includes('pelo') || q.includes('skincare')) {
      return { text: BOT_KNOWLEDGE.saten };
    }
    if (q.includes('waffle') || q.includes('lavar') || q.includes('cuid') || q.includes('repasador') || q.includes('lino') || q.includes('cocina')) {
      return { text: BOT_KNOWLEDGE.waffle };
    }
    if (q.includes('envi') || q.includes('demor') || q.includes('tiempo') || q.includes('capital') || q.includes('llega') || q.includes('pais')) {
      return { text: BOT_KNOWLEDGE.envios };
    }
    if (q.includes('pedid') || q.includes('compr') || q.includes('bolsa') || q.includes('como') || q.includes('encarg')) {
      return { text: BOT_KNOWLEDGE.pedido };
    }
    if (q.includes('whatsapp') || q.includes('elena') || q.includes('telefono') || q.includes('hablar') || q.includes('contacto')) {
      const waUrl = buildWhatsAppUrl();
      const btnHtml = `<a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn--checkout-whatsapp" style="padding:0.4rem 0.8rem; font-size:0.75rem; text-decoration:none; display:inline-flex;">💬 Abrir WhatsApp con Elena</a>`;
      return { text: BOT_KNOWLEDGE.whatsapp, btn: btnHtml };
    }

    // Respuesta inteligente general con opción a WhatsApp
    const waUrl = buildWhatsAppUrl(`Consulta desde la web: "${query}"`);
    const btnHtml = `<a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn--checkout-whatsapp" style="padding:0.4rem 0.8rem; font-size:0.75rem; text-decoration:none; display:inline-flex;">💬 Consultar a Elena por WhatsApp</a>`;
    return {
      text: `¡Qué linda consulta! Para darte el mejor asesoramiento a medida sobre esa pieza o confección, podés consultar directamente a Elena por WhatsApp:`,
      btn: btnHtml
    };
  }

  if (chatbotForm && chatbotInput) {
    chatbotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatbotInput.value.trim();
      if (!text) return;

      appendChatMessage(text, 'user');
      chatbotInput.value = '';

      setTimeout(() => {
        const response = processChatbotQuery(text);
        appendChatMessage(response.text, 'bot', response.btn);
      }, 350);
    });
  }

  if (chatbotSuggestions) {
    chatbotSuggestions.querySelectorAll('.chat-suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const queryKey = chip.getAttribute('data-query');
        const questionText = chip.textContent;
        appendChatMessage(questionText, 'user');

        setTimeout(() => {
          let response;
          if (queryKey === 'whatsapp') {
            const waUrl = buildWhatsAppUrl();
            const btnHtml = `<a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn--checkout-whatsapp" style="padding:0.4rem 0.8rem; font-size:0.75rem; text-decoration:none; display:inline-flex;">💬 Abrir WhatsApp con Elena</a>`;
            response = { text: BOT_KNOWLEDGE.whatsapp, btn: btnHtml };
          } else {
            response = { text: BOT_KNOWLEDGE[queryKey] || BOT_KNOWLEDGE.pedido };
          }
          appendChatMessage(response.text, 'bot', response.btn);
        }, 300);
      });
    });
  }

  // =========================================================================
  // 14. TUTORIAL INTERACTIVO & GESTIÓN DE PEDIDOS PARA ELENA (MODO TALLER)
  // =========================================================================
  const adminElenaTutorialBtn = document.getElementById('admin-elena-tutorial-btn');
  const elenaTutorialModal = document.getElementById('elena-tutorial-modal');
  const elenaTutorialCloseBtn = document.getElementById('elena-tutorial-close-btn');

  const adminElenaOrdersBtn = document.getElementById('admin-elena-orders-btn');
  const adminElenaOrdersCount = document.getElementById('admin-elena-orders-count');
  const elenaOrdersModal = document.getElementById('elena-orders-modal');
  const elenaOrdersCloseBtn = document.getElementById('elena-orders-close-btn');
  const elenaOrdersEmpty = document.getElementById('elena-orders-empty');
  const elenaOrdersList = document.getElementById('elena-orders-list');

  function updateElenaOrdersBadge() {
    if (adminElenaOrdersCount) {
      adminElenaOrdersCount.textContent = orders.length;
    }
  }

  function openElenaTutorial() {
    if (elenaTutorialModal) {
      elenaTutorialModal.classList.add('is-open');
      elenaTutorialModal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeElenaTutorial() {
    if (elenaTutorialModal) {
      elenaTutorialModal.classList.remove('is-open');
      elenaTutorialModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (adminElenaTutorialBtn) adminElenaTutorialBtn.addEventListener('click', openElenaTutorial);
  if (elenaTutorialCloseBtn) elenaTutorialCloseBtn.addEventListener('click', closeElenaTutorial);

  // Tabs dentro del Tutorial de Elena
  document.querySelectorAll('.tutorial-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tutorial-tab').forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');

      const targetId = tab.getAttribute('data-tut-target');
      document.querySelectorAll('.tutorial-step').forEach(step => {
        step.style.display = step.id === targetId ? 'block' : 'none';
        step.classList.toggle('is-active', step.id === targetId);
      });
    });
  });

  // Modal de Pedidos Recibidos de Elena
  function renderElenaOrdersList() {
    if (!elenaOrdersList || !elenaOrdersEmpty) return;

    if (orders.length === 0) {
      elenaOrdersEmpty.style.display = 'block';
      elenaOrdersList.style.display = 'none';
      return;
    }

    elenaOrdersEmpty.style.display = 'none';
    elenaOrdersList.style.display = 'flex';

    elenaOrdersList.innerHTML = orders.map((ord, idx) => {
      const cleanPhone = (ord.customer.phone || '').replace(/[^0-9]/g, '');
      const replyMsg = `¡Hola ${ord.customer.name}! Te escribo del taller de Divina Locura Deco por tu pedido de confección en la web 🌸`;
      const waReplyUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(replyMsg)}`;

      return `
        <div class="elena-order-card" data-order-idx="${idx}">
          <div class="elena-order-header">
            <div>
              <span class="elena-order-customer">👤 ${ord.customer.name}</span>
              <div style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.15rem;">
                📱 WhatsApp: <strong>${ord.customer.phone}</strong> ${ord.customer.email ? `&middot; ✉️ ${ord.customer.email}` : ''}
              </div>
              ${ord.customer.address ? `<div style="font-size:0.78rem; color:var(--text-muted); margin-top:0.1rem;">📍 Entrega: ${ord.customer.address}</div>` : ''}
            </div>
            <div style="text-align:right;">
              <span class="client-order-badge">${ord.status || 'Pendiente'}</span>
              <div class="elena-order-date">${ord.date} &middot; ${ord.time}</div>
            </div>
          </div>

          <div class="elena-order-items">
            <strong>Piezas encargadas (${ord.totalCount}):</strong>
            <ul>
              ${(ord.items || []).map(i => `
                <li><strong>${i.qty}x ${i.title}</strong> (${i.price})${i.note ? ` — <em>Nota: "${i.note}"</em>` : ''}</li>
              `).join('')}
            </ul>
          </div>

          <div class="elena-order-actions">
            <a href="${waReplyUrl}" target="_blank" rel="noopener noreferrer" class="btn-contact-client-wa">
              <span>💬 Responder a la Clienta por WhatsApp</span>
            </a>
            <button type="button" class="btn btn--admin-logout" data-order-delete="${idx}" style="padding:0.4rem 0.75rem; font-size:0.75rem;">
              Archivar
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Botones para archivar/eliminar pedidos
    elenaOrdersList.querySelectorAll('[data-order-delete]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-order-delete'), 10);
        if (confirm('¿Querés archivar este pedido?')) {
          orders.splice(idx, 1);
          try {
            localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
          } catch (e) {}
          updateElenaOrdersBadge();
          renderElenaOrdersList();
          updateClientUi();
          showToast('Pedido archivado.');
        }
      });
    });
  }

  function openElenaOrders() {
    if (elenaOrdersModal) {
      renderElenaOrdersList();
      elenaOrdersModal.classList.add('is-open');
      elenaOrdersModal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeElenaOrders() {
    if (elenaOrdersModal) {
      elenaOrdersModal.classList.remove('is-open');
      elenaOrdersModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (adminElenaOrdersBtn) adminElenaOrdersBtn.addEventListener('click', openElenaOrders);
  if (elenaOrdersCloseBtn) elenaOrdersCloseBtn.addEventListener('click', closeElenaOrders);

  // Exponer API global
  window.DivinaLocura = {
    openLookbookModal,
    openInstagramModal: openLookbookModal, // Compatibilidad retroactiva
    closeLookbookModal,
    openProductEditor,
    closeProductEditor,
    openAdminLogin,
    openCartDrawer,
    closeCartDrawer,
    addToCart,
    openChatbot,
    closeChatbot,
    openElenaTutorial,
    openElenaOrders,
    setRole: (role) => {
      currentRole = role;
      if (role) localStorage.setItem(STORAGE_KEY_ROLE, role);
      else localStorage.removeItem(STORAGE_KEY_ROLE);
      updateAdminUi();
    },
    getProducts: () => products,
    getSettings: () => settings,
    getCart: () => cart,
    getOrders: () => orders,
    renderCatalog
  };

  // Inicializar Interfaz
  updateAdminUi();
  updateClientUi();
  updateCartUi();
  updateElenaOrdersBadge();
});
