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
    admin: ['admin', 'admin2026', 'juanma', 'juanma2026', 'elena', 'elena2026', 'mama'],
    elena: ['elena', 'elena2026', 'mama', 'admin', 'juanma'],
    juanma: ['juanma', 'juanma2026', 'admin', 'elena']
  };

  const DEFAULT_SETTINGS = {
    whatsapp_phone: '5491100000000',
    instagram_user: 'divina.locura.deco',
    announcement: 'Confección artesanal \u00B7 Piezas únicas elaboradas a fuego lento por Elena',
    gh_token: '',
    // Interruptores de Secciones (Elena decide qué mostrar)
    show_gift_boxes: true,
    show_custom_builder: true,
    show_fabric_showcase: true,
    enable_coupons: false,
    // Hero & Portada
    hero_eyebrow: 'CONFECCIÓN ARTESANAL \u00B7 BUENOS AIRES',
    hero_title: 'El arte del detalle. Diseño hecho a mano para abrazar tu hogar.',
    hero_tagline: 'Textiles con alma. Organización y calidez para tu día a día.',
    hero_cta: 'Explorar la Colección',
    // Categorías
    categories_eyebrow: 'Explorar por Colección',
    categories_title: 'Categorías Artesanales',
    categories_desc: 'Selecciona un rincón para descubrir las piezas confeccionadas en telas nobles por Elena.',
    // Catálogo
    catalog_eyebrow: 'Confección Auténtica de Elena',
    catalog_title: 'Colección de Taller',
    catalog_desc: 'Artículos utilitarios y blanquería hechos a mano con telas nobles y detalles únicos.',
    // Muestrario de Telas
    fabrics_eyebrow: 'Guía Textil \u00B7 Selección de Taller',
    fabrics_title: 'Muestrario de Telas & Especificaciones',
    fabrics_desc: 'Explorá qué telas tiene Elena en el taller, sus especificaciones reales, su caída y cuidados. Podés encargar cualquier diseño a medida con la tela que más te guste.',
    // Diseñador a Medida
    builder_eyebrow: 'Taller Interactivo \u00B7 Creá tu Pieza Única',
    builder_title: 'Diseñá tu Pedido a Medida o Subí tu Idea',
    builder_desc: 'Armá paso a paso el diseño que querés o subí una foto, captura o boceto de referencia para que Elena lo confeccione especialmente para vos en su máquina.',
    // Cajas de Regalo
    gifts_eyebrow: 'Regalería de Autor \u00B7 Sets & Cajas con 10% OFF',
    gifts_title: 'Cajas de Regalo & Ajuares Listos para Agasajar',
    gifts_desc: 'Presentación en caja artesanal perfumada, envuelta en papel de seda con cinta de algodón y tarjeta manuscrita con tu dedicatoria.',
    // Sobre Elena (El Taller)
    about_eyebrow: 'Manos Creadoras',
    about_title: 'Confeccionado por Elena',
    about_lead: 'Detrás de cada dobladillo, cada cierre y cada elección de tela está la pasión de Elena por transformar fibras nobles en objetos que brindan serenidad y calidez.',
    about_body: 'En Divina Locura Deco no creemos en la producción masiva. Cada pieza se confecciona individualmente en nuestro taller, prelavando las telas para garantizar que mantengan su textura y dimensión original lavado tras lavado.',
    about_quote: '\u201CCoser es una forma de cuidar a quienes habitan el hogar.\u201D',
    about_author: '\u2014 Elena',
    about_cta: 'Explorar la Colección Completa',
    // Espacios & Estilismo
    spaces_eyebrow: 'Atmósferas & Calidez \u00B7 Inspiración Zara Home & Anthropologie',
    spaces_title: 'Espacios que Inspiran Calma',
    spaces_desc: 'Cómo conviven nuestras piezas textiles en dormitorios, baños y rincones cotidianos de la casa.',
    spaces_cta: 'Consultar Asesoramiento Textil para tu Espacio \u2192',
    // Banner WhatsApp & Footer
    wa_banner_eyebrow: '¿Tienes una medida especial o consulta?',
    wa_banner_title: 'Charlemos directamente por WhatsApp',
    wa_banner_desc: 'Te asesoramos personalmente con los colores de telas, combinaciones y confección personalizada para tu espacio.',
    wa_banner_btn: 'Escribir a Elena',
    footer_desc: 'Textiles artesanales y piezas utilitarias en tela por Elena.',
    footer_copy: '\u00A9 2026 Divina Locura Deco \u2014 Confección artesanal por Elena. Diseñado con calidez & dedicación.'
  };

  // Cargar Ajustes (integrando posibles ajustes precargados en products-data.js y WorkshopDB)
  if (typeof INITIAL_SITE_SETTINGS !== 'undefined' && INITIAL_SITE_SETTINGS) {
    Object.assign(DEFAULT_SETTINGS, INITIAL_SITE_SETTINGS);
  }

  let settings = { ...DEFAULT_SETTINGS };
  try {
    const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (savedSettings) {
      settings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
    }
    if (window.WorkshopDB && typeof window.WorkshopDB.getSystemSettings === 'function') {
      const dbSettings = window.WorkshopDB.getSystemSettings();
      if (dbSettings && typeof dbSettings === 'object') {
        settings = { ...settings, ...dbSettings };
      }
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

  // Cargar Productos (unificado con WorkshopDB + migración v2)
  let products = [];
  if (window.WorkshopDB && typeof window.WorkshopDB.getProducts === 'function') {
    products = window.WorkshopDB.getProducts();
  } else {
    try {
      const savedProducts = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (savedProducts) products = JSON.parse(savedProducts);
    } catch (err) {
      console.warn('Error leyendo productos:', err);
    }
    if (!products || products.length === 0) {
      products = (typeof INITIAL_PRODUCTS !== 'undefined') ? JSON.parse(JSON.stringify(INITIAL_PRODUCTS)) : [];
    }
  }

  let currentCategory = 'todos';
  let currentRole = localStorage.getItem(STORAGE_KEY_ROLE); // 'elena' | 'juanma' | null

  // Elementos DOM Principales
  const productsGrid = document.getElementById('products-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const categoryTiles = document.querySelectorAll('[data-category-target]');
  const adminBar = document.getElementById('admin-bar');
  const adminBarUnified = document.getElementById('admin-bar-unified');
  const adminBarElena = document.getElementById('admin-bar-elena');
  const adminBarJuanma = document.getElementById('admin-bar-juanma');
  const topAnnouncementText = document.getElementById('top-announcement-text');
  const toastContainer = document.getElementById('toast-container');

  // Helper para asignar texto de forma segura si el elemento existe
  function setElText(id, text) {
    if (!id || typeof text !== 'string' || !text.trim()) return;
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // Configuración de Diapositivas Temáticas para el Hero
  let HERO_SLIDES_DATA = [
    {
      index: 0,
      filter: 'todos',
      eyebrow: settings.hero_eyebrow || 'CONFECCIÓN ARTESANAL · BUENOS AIRES',
      title: settings.hero_title || 'El arte del detalle. Diseño hecho a mano para abrazar tu hogar.',
      tagline: settings.hero_tagline || 'Textiles con alma. Organización y calidez para tu día a día.',
      cta: settings.hero_cta || 'Explorar la Colección',
      targetHref: '#catalogo'
    },
    {
      index: 1,
      filter: 'cuidado-personal',
      eyebrow: 'LÍNEA SATÉN ANTIFRIZZ · BIENESTAR & DESCANSO',
      title: 'Suavidad y cuidado para tus noches y tu rutina.',
      tagline: 'Cofias, fundas y antifaces en satén premium para cuidar tu piel y cabello.',
      cta: 'Ver Línea Satén',
      targetHref: '#catalogo'
    },
    {
      index: 2,
      filter: 'hogar',
      eyebrow: 'BLANQUERÍA & TEXTILES DE COCINA · PURO ALGODÓN',
      title: 'Calidez rústica para los rincones de tu mesa.',
      tagline: 'Repasadores nido de abeja, manteles y paneras en lino y puro algodón.',
      cta: 'Ver Colección Cocina',
      targetHref: '#catalogo'
    },
    {
      index: 3,
      filter: 'organizacion',
      eyebrow: 'ORGANIZACIÓN CON ENCANTO · PIEZAS UTILITARIAS',
      title: 'Espacios ordenados con texturas nobles y artesanales.',
      tagline: 'Organizadores colgantes, cestos y neceseres diseñados para acompañarte.',
      cta: 'Ver Organizadores',
      targetHref: '#catalogo'
    },
    {
      index: 4,
      filter: 'infantil',
      eyebrow: 'LÍNEA BEBÉ & NACIMIENTO · HIPOALERGÉNICO',
      title: 'Ternura y dedicación en cada puntada para tu bebé.',
      tagline: 'Organizadores conejito, ajuares y toallitas personalizadas con amor.',
      cta: 'Ver Línea Infantil',
      targetHref: '#catalogo'
    },
    {
      index: 5,
      filter: 'espacios',
      eyebrow: 'INSPIRACIÓN DECORATIVA · ESPACIOS VIVOS',
      title: 'Cada detalle cuenta una historia en tu hogar.',
      tagline: 'Almohadones, mantas de gasa y combinaciones que transmiten serenidad.',
      cta: 'Ver Galería de Espacios',
      targetHref: '#espacios'
    }
  ];

  // Aplicar ajustes visuales, interruptores de secciones y textos en toda la web
  function applySystemSettings() {
    setElText('top-announcement-text', settings.announcement);

    // Hero & Portada
    setElText('hero-eyebrow', settings.hero_eyebrow);
    setElText('hero-title', settings.hero_title);
    setElText('hero-tagline', settings.hero_tagline);
    setElText('hero-cta-text', settings.hero_cta);
    if (HERO_SLIDES_DATA && HERO_SLIDES_DATA[0]) {
      HERO_SLIDES_DATA[0].eyebrow = settings.hero_eyebrow;
      HERO_SLIDES_DATA[0].title = settings.hero_title;
      HERO_SLIDES_DATA[0].tagline = settings.hero_tagline;
      HERO_SLIDES_DATA[0].cta = settings.hero_cta;
    }

    // Categorías
    setElText('categories-eyebrow', settings.categories_eyebrow);
    setElText('previews-title', settings.categories_title);
    setElText('categories-desc', settings.categories_desc);

    // Catálogo
    setElText('catalog-eyebrow', settings.catalog_eyebrow);
    setElText('catalog-title', settings.catalog_title);
    setElText('catalog-desc', settings.catalog_desc);

    // Muestrario de Telas
    setElText('fabrics-eyebrow', settings.fabrics_eyebrow);
    setElText('fabric-swatch-title', settings.fabrics_title);
    setElText('fabric-swatch-desc', settings.fabrics_desc);

    // Diseñador a Medida
    setElText('builder-eyebrow', settings.builder_eyebrow);
    setElText('custom-builder-title', settings.builder_title);
    setElText('custom-builder-desc', settings.builder_desc);

    // Cajas de Regalo
    setElText('gifts-eyebrow', settings.gifts_eyebrow);
    setElText('gift-builder-title', settings.gifts_title);
    setElText('gift-builder-desc', settings.gifts_desc);

    // Sobre Elena
    setElText('about-eyebrow', settings.about_eyebrow);
    setElText('about-title', settings.about_title);
    setElText('about-lead', settings.about_lead);
    setElText('about-body', settings.about_body);
    setElText('about-quote', settings.about_quote);
    setElText('about-author', settings.about_author);
    setElText('about-cta-text', settings.about_cta);

    // Espacios & Estilismo
    setElText('spaces-eyebrow', settings.spaces_eyebrow);
    setElText('spaces-title', settings.spaces_title);
    setElText('spaces-desc', settings.spaces_desc);
    setElText('spaces-cta-text', settings.spaces_cta);

    // Banner WhatsApp & Footer
    setElText('wa-banner-eyebrow', settings.wa_banner_eyebrow);
    setElText('wa-banner-title', settings.wa_banner_title);
    setElText('wa-banner-desc', settings.wa_banner_desc);
    setElText('wa-banner-btn-text', settings.wa_banner_btn);
    setElText('footer-brand-desc', settings.footer_desc);
    setElText('footer-copy-text', settings.footer_copy);

    // Interruptores de Visibilidad de Secciones (Configurables por Elena)
    const giftBoxesSec = document.getElementById('armador-regalos');
    if (giftBoxesSec) {
      giftBoxesSec.style.display = settings.show_gift_boxes !== false ? '' : 'none';
    }
    const customBuilderSec = document.getElementById('disenador-a-medida');
    if (customBuilderSec) {
      customBuilderSec.style.display = settings.show_custom_builder !== false ? '' : 'none';
    }
    const fabricShowcaseSec = document.getElementById('muestrario-telas');
    if (fabricShowcaseSec) {
      fabricShowcaseSec.style.display = settings.show_fabric_showcase !== false ? '' : 'none';
    }
    document.querySelectorAll('.cart-coupon-row').forEach(el => {
      el.style.display = settings.enable_coupons === true ? 'flex' : 'none';
    });

    // Actualizar enlaces de Instagram en el sitio
    if (settings.instagram_user) {
      const igUser = settings.instagram_user.replace(/^@/, '');
      const igUrl = `https://www.instagram.com/${igUser}`;
      document.querySelectorAll('a[href*="instagram.com"], [data-ig-link]').forEach(a => {
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

    // Balancear las filas a exactamente 12 columnas en desktop para evitar huecos o bordes desparejos
    const rowSpans = [];
    for (let i = 0; i < filtered.length; i += 2) {
      if (i + 1 >= filtered.length) {
        rowSpans.push('catalog-item--w12');
      } else {
        const aLarge = filtered[i].size === 'large';
        const bLarge = filtered[i + 1].size === 'large';
        if (aLarge && !bLarge) {
          rowSpans.push('catalog-item--w7', 'catalog-item--w5');
        } else if (!aLarge && bLarge) {
          rowSpans.push('catalog-item--w5', 'catalog-item--w7');
        } else {
          rowSpans.push('catalog-item--w6', 'catalog-item--w6');
        }
      }
    }

    filtered.forEach((product, idx) => {
      const spanClass = rowSpans[idx] || (product.size === 'large' ? 'catalog-item--large' : 'catalog-item--medium');
      const card = document.createElement('article');
      card.className = `catalog-item ${product.size === 'large' ? 'catalog-item--large' : 'catalog-item--medium'} ${spanClass}`;
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

      // Barra de administración en tarjeta para administrador
      let adminBarHtml = '';
      if (currentRole) {
        adminBarHtml = `
          <div class="catalog-item__admin-bar">
            <button type="button" class="btn-card-admin btn-card-admin--edit" data-edit-id="${product.id}" title="Modificar esta pieza">
              ✏️ Modificar
            </button>
            <button type="button" class="btn-card-admin btn-card-admin--delete" data-delete-id="${product.id}" title="Eliminar producto">
              🗑️
            </button>
          </div>
        `;
      }

      // Colores disponibles de tela para esta pieza
      const palette = (window.WorkshopDB && typeof window.WorkshopDB.getColorPalette === 'function')
        ? window.WorkshopDB.getColorPalette()
        : [
            { name: 'Champán Seda', hex: '#E8DAC8' },
            { name: 'Crudo Natural', hex: '#F3EFE8' },
            { name: 'Rosa Viejo', hex: '#DFBDB5' },
            { name: 'Vichy Arena', hex: '#D4C3AE' },
            { name: 'Verde Salvia', hex: '#A6B5A7' },
            { name: 'Terracota Suave', hex: '#C87D69' },
            { name: 'Blanco Lino', hex: '#FAF8F5' },
            { name: 'Celeste Bebé', hex: '#C8DCE8' },
            { name: 'Gris Perla', hex: '#D3D1CE' },
            { name: 'Chocolate', hex: '#6D4C41' },
            { name: 'Gris Topo', hex: '#7A7671' },
            { name: 'Verde Esmeralda', hex: '#4D7C6F' }
          ];
      const availColorNames = (Array.isArray(product.availableColors) && product.availableColors.length > 0)
        ? product.availableColors
        : ['Champán Seda', 'Rosa Viejo', 'Arena Tostada', 'Salvia Suave'];
      const colorDotsHtml = availColorNames.slice(0, 6).map(cName => {
        const found = palette.find(c => c.name.toLowerCase() === String(cName).toLowerCase());
        const hex = found ? found.hex : '#DFD3C3';
        return `<span class="catalog-color-dot" style="background:${hex};" title="Disponible en ${cName}"></span>`;
      }).join('');

      card.innerHTML = `
        ${adminBarHtml}

        <div class="catalog-item__media" data-open-lookbook="${product.id}" style="cursor:pointer;" title="Click para ver la pieza, precio y opiniones">
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
          <h3 class="catalog-item__title"><a href="producto.html?id=${product.id}">${product.title}</a></h3>
          <p class="catalog-item__desc">${product.desc || ''}</p>
          <div class="catalog-item__colors-strip" title="Colores de tela disponibles para esta pieza">
            <span class="catalog-item__colors-label">Colores:</span>
            ${colorDotsHtml}
            <span class="catalog-item__colors-names">${availColorNames.slice(0, 3).join(', ')}${availColorNames.length > 3 ? ` +${availColorNames.length - 3}` : ''}</span>
          </div>
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
              <a href="producto.html?id=${product.id}" class="btn--lookbook-view" title="Ver página de la creación y comentarios">
                <span>Ver Pieza</span>
              </a>
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
    if (window.WorkshopDB && typeof window.WorkshopDB.saveProducts === 'function') {
      window.WorkshopDB.saveProducts(products);
      return;
    }
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

    // Navegar a la Página Individual del Producto
    document.querySelectorAll('[data-open-lookbook]').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        if (e.target.closest('.view-pill') || e.target.closest('.btn-card-admin')) return;
        const productId = trigger.getAttribute('data-open-lookbook');
        if (productId) {
          window.location.href = `producto.html?id=${productId}`;
        }
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
  // 4. SLIDER HERO MULTI-FOTO & MENÚS INTERACTIVOS (INSPIRACIÓN ZARA HOME)
  // =========================================================================
  let currentHeroSlideIndex = 0;
  let heroAutoplayTimer = null;
  let isHeroPaused = false;
  const HERO_AUTOPLAY_DURATION = 6000;

  function switchHeroVisuals(index) {
    const total = HERO_SLIDES_DATA.length;
    currentHeroSlideIndex = ((index % total) + total) % total;
    const slide = HERO_SLIDES_DATA[currentHeroSlideIndex];

    // 1. Cambiar slide activa de fondo (Crossfade)
    const slideEls = document.querySelectorAll('.hero__slide');
    slideEls.forEach((el, idx) => {
      if (idx === currentHeroSlideIndex) {
        el.classList.add('is-active');
      } else {
        el.classList.remove('is-active');
      }
    });

    // 2. Cambiar pastilla de navegación inferior del hero (sin hacer scroll vertical en la página)
    const navStrip = document.getElementById('hero-nav-strip');
    const navPills = document.querySelectorAll('.hero-nav-pill');
    navPills.forEach((pill, idx) => {
      if (idx === currentHeroSlideIndex) {
        pill.classList.add('is-active');
        if (navStrip && navStrip.scrollWidth > navStrip.clientWidth) {
          const targetLeft = pill.offsetLeft - (navStrip.clientWidth / 2) + (pill.clientWidth / 2);
          navStrip.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
        }
      } else {
        pill.classList.remove('is-active');
      }
    });

    // 3. Transición suave de textos editoriales
    const editorialContent = document.querySelector('.hero__editorial-content');
    if (editorialContent) {
      editorialContent.style.opacity = '0';
      editorialContent.style.transform = 'translateY(6px)';
      setTimeout(() => {
        setElText('hero-eyebrow', slide.eyebrow);
        setElText('hero-title', slide.title);
        setElText('hero-tagline', slide.tagline);
        setElText('hero-cta-text', slide.cta);
        const ctaBtn = document.getElementById('hero-cta-btn');
        if (ctaBtn) {
          ctaBtn.setAttribute('href', slide.targetHref);
          ctaBtn.setAttribute('data-target-filter', slide.filter);
        }
        editorialContent.style.opacity = '1';
        editorialContent.style.transform = 'translateY(0)';
      }, 160);
    }
  }

  function startHeroProgress() {
    const fillEl = document.getElementById('hero-progress-fill');
    if (!fillEl) return;
    fillEl.classList.add('is-reset');
    fillEl.style.width = '0%';
    void fillEl.offsetWidth; // Force reflow
    fillEl.classList.remove('is-reset');
    fillEl.style.transition = `width ${HERO_AUTOPLAY_DURATION}ms linear`;
    fillEl.style.width = '100%';
  }

  function stopHeroProgress() {
    const fillEl = document.getElementById('hero-progress-fill');
    if (!fillEl) return;
    const computedWidth = window.getComputedStyle(fillEl).width;
    fillEl.classList.add('is-reset');
    fillEl.style.width = computedWidth;
  }

  function scheduleHeroAutoplay() {
    if (heroAutoplayTimer) clearTimeout(heroAutoplayTimer);
    if (isHeroPaused) return;

    startHeroProgress();

    heroAutoplayTimer = setTimeout(() => {
      if (!isHeroPaused) {
        goToHeroSlide(currentHeroSlideIndex + 1, false);
      }
    }, HERO_AUTOPLAY_DURATION);
  }

  function goToHeroSlide(index, isUserAction = false) {
    switchHeroVisuals(index);
    const slide = HERO_SLIDES_DATA[currentHeroSlideIndex];

    // Sincronizar filtro de catálogo ÚNICAMENTE cuando la persona hace clic manualmente en el menú del hero
    if (isUserAction && slide.filter && slide.filter !== 'espacios' && currentCategory !== slide.filter) {
      currentCategory = slide.filter;
      filterBtns.forEach(btn => {
        if (btn.getAttribute('data-filter') === slide.filter) {
          btn.classList.add('is-active');
        } else {
          btn.classList.remove('is-active');
        }
      });
      renderCatalog();
    }

    scheduleHeroAutoplay();
  }

  function setupHeroSlider() {
    const heroEl = document.getElementById('hero');
    if (!heroEl) return;

    // Flechas de navegación
    const prevBtn = document.getElementById('hero-arrow-prev');
    const nextBtn = document.getElementById('hero-arrow-next');
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToHeroSlide(currentHeroSlideIndex - 1, true);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToHeroSlide(currentHeroSlideIndex + 1, true);
      });
    }

    // Pastillas del menú inferior del Hero
    document.querySelectorAll('.hero-nav-pill').forEach((pill, idx) => {
      pill.addEventListener('click', (e) => {
        e.preventDefault();
        // Si el usuario hace clic en la pastilla ya activa, desplazarse hacia el catálogo o espacios
        if (currentHeroSlideIndex === idx) {
          const filter = pill.getAttribute('data-hero-filter');
          if (filter === 'espacios') {
            const espSection = document.getElementById('espacios');
            if (espSection) espSection.scrollIntoView({ behavior: 'smooth' });
          } else {
            const catSection = document.getElementById('catalogo');
            if (catSection) catSection.scrollIntoView({ behavior: 'smooth' });
          }
        } else {
          // Cambiar de foto principal y contenido de inmediato
          goToHeroSlide(idx, true);
        }
      });
    });

    // Botón de llamado a la acción (CTA)
    const ctaBtn = document.getElementById('hero-cta-btn');
    if (ctaBtn) {
      ctaBtn.addEventListener('click', (e) => {
        const targetHref = ctaBtn.getAttribute('href');
        if (targetHref && targetHref.startsWith('#')) {
          e.preventDefault();
          const targetEl = document.querySelector(targetHref);
          if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Pausar rotación en hover / touch
    heroEl.addEventListener('mouseenter', () => {
      isHeroPaused = true;
      if (heroAutoplayTimer) clearTimeout(heroAutoplayTimer);
      stopHeroProgress();
    });

    heroEl.addEventListener('mouseleave', () => {
      isHeroPaused = false;
      scheduleHeroAutoplay();
    });

    heroEl.addEventListener('touchstart', () => {
      isHeroPaused = true;
      if (heroAutoplayTimer) clearTimeout(heroAutoplayTimer);
      stopHeroProgress();
    }, { passive: true });

    heroEl.addEventListener('touchend', () => {
      setTimeout(() => {
        isHeroPaused = false;
        scheduleHeroAutoplay();
      }, 3000);
    }, { passive: true });

    // Iniciar temporizador de rotación inicial
    scheduleHeroAutoplay();
  }

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

    // Si coincide con alguna diapositiva del hero y fue llamada fuera del slider, sincronizar foto
    const matchingIdx = HERO_SLIDES_DATA.findIndex(s => s.filter === category);
    if (matchingIdx > -1 && matchingIdx !== currentHeroSlideIndex) {
      switchHeroVisuals(matchingIdx);
    }

    renderCatalog();
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      applyFilter(btn.getAttribute('data-filter'));
    });
  });

  setupHeroSlider();

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
  const hamburgerBtn = document.getElementById('hamburger-btn') || document.getElementById('header-menu-btn');
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

  if (headerLoginBtn) {
    headerLoginBtn.addEventListener('click', () => {
      if (currentRole === 'elena' || currentRole === 'juanma' || currentRole === 'admin') {
        const dockEl = document.getElementById('footer-admin-dock');
        const toggleBtn = document.getElementById('btn-toggle-footer-admin');
        if (dockEl) {
          dockEl.style.display = 'block';
          if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
          if (typeof updateFooterDockBadges === 'function') updateFooterDockBadges();
          dockEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        showToast(currentRole === 'elena' ? '🌸 Sesión activa de Elena. Desplegando Panel de Control...' : '💻 Sesión activa de Juanma. Desplegando Panel de Control...');
      } else {
        openClientLogin();
      }
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

    if (window.WorkshopDB && typeof window.WorkshopDB.trackProductView === 'function') {
      window.WorkshopDB.trackProductView(productId);
    }

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

    // Renderizar colores de tela disponibles configurados por Elena para este producto
    const lbSwatchesBar = document.getElementById('lookbook-swatches-bar');
    const lbActiveToneEl = document.getElementById('lookbook-active-tone');
    if (lbSwatchesBar) {
      const palette = (window.WorkshopDB && typeof window.WorkshopDB.getColorPalette === 'function')
        ? window.WorkshopDB.getColorPalette()
        : [
            { name: 'Champán Seda', hex: '#E8DAC8' },
            { name: 'Crudo Natural', hex: '#F3EFE8' },
            { name: 'Rosa Viejo', hex: '#DFBDB5' },
            { name: 'Vichy Arena', hex: '#D4C3AE' },
            { name: 'Verde Salvia', hex: '#A6B5A7' },
            { name: 'Terracota Suave', hex: '#C87D69' },
            { name: 'Blanco Lino', hex: '#FAF8F5' },
            { name: 'Celeste Bebé', hex: '#C8DCE8' },
            { name: 'Gris Perla', hex: '#D3D1CE' },
            { name: 'Chocolate', hex: '#6D4C41' },
            { name: 'Gris Topo', hex: '#7A7671' },
            { name: 'Verde Esmeralda', hex: '#4D7C6F' }
          ];
      const availNames = (Array.isArray(product.availableColors) && product.availableColors.length > 0)
        ? product.availableColors
        : ['Champán Seda', 'Rosa Viejo', 'Arena Tostada', 'Salvia Suave', 'Blanco Nube'];
      lookbookSelectedTone = availNames[0] || 'Champán Seda';
      if (lbActiveToneEl) lbActiveToneEl.textContent = lookbookSelectedTone;

      lbSwatchesBar.innerHTML = availNames.map((cName, idx) => {
        const found = palette.find(c => c.name.toLowerCase() === String(cName).toLowerCase());
        const hex = found ? found.hex : '#DFD3C3';
        return `<button type="button" class="pdp-swatch-dot ${idx === 0 ? 'is-active' : ''}" data-lb-tone="${cName}" style="--swatch-hex: ${hex};" title="${cName}"></button>`;
      }).join('');

      lbSwatchesBar.querySelectorAll('[data-lb-tone]').forEach(btn => {
        btn.addEventListener('click', () => {
          lbSwatchesBar.querySelectorAll('[data-lb-tone]').forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          lookbookSelectedTone = btn.getAttribute('data-lb-tone') || 'Champán Seda';
          if (lbActiveToneEl) lbActiveToneEl.textContent = lookbookSelectedTone;
        });
      });
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
  // 6. SISTEMA DE ADMINISTRACIÓN UNIFICADO (TODAS LAS OPCIONES PARA JUANMA/ADMIN)
  //    ACCESO EXCLUSIVO DESDE EL PIE DE PÁGINA (ABAJO DEL TODO)
  // =========================================================================
  const openAdminBtn = document.getElementById('open-admin-btn');
  const teamAdminModal = document.getElementById('team-admin-modal');
  const teamAdminCancelBtn = document.getElementById('team-admin-cancel-btn');

  // Login de Administrador Único
  const formAdminLogin = document.getElementById('form-admin-login');
  const passAdminInput = document.getElementById('pass-admin');
  const btnLoginAdmin = document.getElementById('btn-login-admin');

  // Barra Unificada & Acciones
  const adminDashboardBtn = document.getElementById('admin-dashboard-btn');
  const adminOrdersBtn = document.getElementById('admin-orders-btn');
  const adminProductionBtn = document.getElementById('admin-production-btn');
  const adminStockBtn = document.getElementById('admin-stock-btn');
  const adminFinancesBtn = document.getElementById('admin-finances-btn');
  const adminChatBtn = document.getElementById('admin-chat-btn');
  const adminTutorialBtn = document.getElementById('admin-tutorial-btn');
  const adminSettingsBtn = document.getElementById('admin-settings-btn');
  const adminBackupBtn = document.getElementById('admin-backup-btn');
  const adminGithubBtn = document.getElementById('admin-github-btn');
  const adminNewProductBtn = document.getElementById('admin-new-product-btn');
  const adminLogoutBtn = document.getElementById('admin-logout-btn');

  // Compatibilidad con selectores de versiones previas
  const passElenaInput = document.getElementById('pass-elena');
  const btnLoginElena = document.getElementById('btn-login-elena');
  const adminNewElenaBtn = document.getElementById('admin-new-elena-btn');
  const adminLogoutElenaBtn = document.getElementById('admin-logout-elena-btn');
  const adminElenaSettingsBtn = document.getElementById('admin-elena-settings-btn');
  const adminElenaBackupBtn = document.getElementById('admin-elena-backup-btn');
  const adminElenaGithubBtn = document.getElementById('admin-elena-github-btn');
  const adminElenaSwitchRoleBtn = document.getElementById('admin-elena-switch-role-btn');

  const passJuanmaInput = document.getElementById('pass-juanma');
  const btnLoginJuanma = document.getElementById('btn-login-juanma');
  const adminDevSettingsBtn = document.getElementById('admin-dev-settings-btn');
  const adminExportBtn = document.getElementById('admin-export-btn');
  const adminNewJuanmaBtn = document.getElementById('admin-new-juanma-btn');
  const adminLogoutJuanmaBtn = document.getElementById('admin-logout-juanma-btn');
  const adminJuanmaTutorialBtn = document.getElementById('admin-juanma-tutorial-btn');
  const adminJuanmaOrdersBtn = document.getElementById('admin-juanma-orders-btn');
  const adminJuanmaChatBtn = document.getElementById('admin-juanma-chat-btn');
  const adminJuanmaStockBtn = document.getElementById('admin-juanma-stock-btn');
  const adminJuanmaFinancesBtn = document.getElementById('admin-juanma-finances-btn');
  const adminJuanmaSwitchRoleBtn = document.getElementById('admin-juanma-switch-role-btn');

  function updateAdminUi() {
    document.body.classList.remove('admin-mode-active', 'role-elena', 'role-juanma');

    const toggleBtn = document.getElementById('btn-toggle-footer-admin');
    const subfloorBtnLabel = document.getElementById('subfloor-btn-label');

    if (currentRole === 'elena') {
      document.body.classList.add('admin-mode-active', 'role-elena');
      if (subfloorBtnLabel) {
        subfloorBtnLabel.innerHTML = '🌸 Taller Textil &middot; Elena (Sesión Activa)';
      } else if (toggleBtn) {
        toggleBtn.innerHTML = '<span>🌸 Taller Textil &middot; Elena ▾</span>';
      }
      if (toggleBtn) {
        toggleBtn.setAttribute('title', 'Sesión activa: Elena (Taller Textil). Clic para desplegar / ocultar el Panel de Control');
      }
    } else if (currentRole === 'juanma' || currentRole === 'admin') {
      document.body.classList.add('admin-mode-active', 'role-juanma');
      if (subfloorBtnLabel) {
        subfloorBtnLabel.innerHTML = '💻 Administración &middot; Juanma (Sesión Activa)';
      } else if (toggleBtn) {
        toggleBtn.innerHTML = '<span>💻 Administración &middot; Juanma ▾</span>';
      }
      if (toggleBtn) {
        toggleBtn.setAttribute('title', 'Sesión activa: Juanma (Negocio & Finanzas). Clic para desplegar / ocultar el Panel de Control');
      }
    } else {
      if (subfloorBtnLabel) {
        subfloorBtnLabel.innerHTML = '🔒 Panel de Control &middot; Elena &amp; Juanma';
      } else if (toggleBtn) {
        toggleBtn.innerHTML = '<span>🔒 Administración ▾</span>';
      }
      if (toggleBtn) {
        toggleBtn.setAttribute('title', 'Acceso para Administradores (Elena & Juanma)');
      }
    }

    if (adminBar) adminBar.classList.add('is-hidden');
    if (adminBarUnified) adminBarUnified.style.display = 'none';
    if (adminBarElena) adminBarElena.style.display = 'none';
    if (adminBarJuanma) adminBarJuanma.style.display = 'none';

    renderCatalog();
    if (typeof updateClientUi === 'function') updateClientUi();
    if (typeof updateCartUi === 'function') updateCartUi();
    if (typeof updateElenaOrdersBadge === 'function') updateElenaOrdersBadge();
    if (typeof updateWorkshopCounters === 'function') updateWorkshopCounters();
    if (typeof updateFooterDockBadges === 'function') updateFooterDockBadges();
  }

  // Pestañas del Modal de Administradores (Login vs Cambiar Contraseña)
  function switchAdminModalTab(tabName) {
    const tabLogin = document.getElementById('btn-tab-login');
    const tabPass = document.getElementById('btn-tab-changepass');
    const viewLogin = document.getElementById('auth-view-login');
    const viewPass = document.getElementById('auth-view-changepass');
    const successMsg = document.getElementById('pass-change-msg-success');
    const errorMsg = document.getElementById('pass-change-msg-error');

    if (successMsg) successMsg.style.display = 'none';
    if (errorMsg) errorMsg.style.display = 'none';

    if (tabName === 'changepass') {
      if (tabLogin) tabLogin.classList.remove('is-active');
      if (tabPass) tabPass.classList.add('is-active');
      if (viewLogin) viewLogin.style.display = 'none';
      if (viewPass) viewPass.style.display = 'block';

      const curInput = document.getElementById('pass-current-input');
      if (curInput) {
        curInput.value = '';
        setTimeout(() => curInput.focus(), 100);
      }
      const newInput = document.getElementById('pass-new-input');
      if (newInput) newInput.value = '';
      const confInput = document.getElementById('pass-confirm-input');
      if (confInput) confInput.value = '';
    } else {
      if (tabLogin) tabLogin.classList.add('is-active');
      if (tabPass) tabPass.classList.remove('is-active');
      if (viewLogin) viewLogin.style.display = 'block';
      if (viewPass) viewPass.style.display = 'none';
    }
  }

  const tabLoginBtn = document.getElementById('btn-tab-login');
  if (tabLoginBtn) tabLoginBtn.addEventListener('click', () => switchAdminModalTab('login'));

  const tabPassBtn = document.getElementById('btn-tab-changepass');
  if (tabPassBtn) tabPassBtn.addEventListener('click', () => switchAdminModalTab('changepass'));

  const btnSessionSwitchPass = document.getElementById('btn-session-switch-pass');
  if (btnSessionSwitchPass) btnSessionSwitchPass.addEventListener('click', () => switchAdminModalTab('changepass'));

  const btnCancelChangepass = document.getElementById('btn-cancel-changepass');
  if (btnCancelChangepass) btnCancelChangepass.addEventListener('click', () => switchAdminModalTab('login'));

  function openTeamAdminLogin() {
    if (teamAdminModal) {
      teamAdminModal.classList.add('is-open');

      // Volver a la pestaña login por defecto
      switchAdminModalTab('login');

      // Detectar si ya hay una sesión activa de Elena o Juanma
      const activeRole = currentRole || localStorage.getItem(STORAGE_KEY_ROLE);
      const activeSessionBox = document.getElementById('auth-active-session-box');
      const profilesGrid = document.getElementById('auth-profiles-grid');
      const sessionIcon = document.getElementById('auth-session-icon');
      const sessionTitle = document.getElementById('auth-session-title');
      const sessionDesc = document.getElementById('auth-session-desc');

      if (activeRole) {
        if (activeSessionBox) activeSessionBox.style.display = 'block';
        if (profilesGrid) profilesGrid.style.display = 'none';

        const isElena = activeRole === 'elena';
        if (sessionIcon) sessionIcon.textContent = isElena ? '🌸' : '💻';
        if (sessionTitle) {
          sessionTitle.textContent = isElena 
            ? 'Sesión activa de Elena (Taller Textil & Confección)' 
            : 'Sesión activa de Juanma (Super Administrador)';
        }
        if (sessionDesc) {
          sessionDesc.textContent = isElena
            ? 'Tenés acceso al taller, pedidos de clientas, stock de telas, colores y balance.'
            : 'Tenés acceso total como Super Administrador a todas las áreas: taller, confección, pedidos, colores de telas, editor de textos de la web, finanzas y respaldo.';
        }

        const roleRadio = document.querySelector(`input[name="pass-role-target"][value="${activeRole}"]`);
        if (roleRadio) roleRadio.checked = true;
      } else {
        if (activeSessionBox) activeSessionBox.style.display = 'none';
        if (profilesGrid) profilesGrid.style.display = 'grid';
        if (passElenaInput) passElenaInput.value = '';
        if (passJuanmaInput) passJuanmaInput.value = '';
        if (passAdminInput) passAdminInput.value = '';
        setTimeout(() => {
          if (passElenaInput) passElenaInput.focus();
          else if (passAdminInput) passAdminInput.focus();
        }, 100);
      }
    }
  }

  function closeTeamAdminLogin() {
    if (teamAdminModal) teamAdminModal.classList.remove('is-open');
  }

  // Compatibilidad
  function openAdminLogin() {
    openTeamAdminLogin();
  }
  function closeAdminLogin() {
    closeTeamAdminLogin();
  }

  if (openAdminBtn) openAdminBtn.addEventListener('click', openTeamAdminLogin);
  if (teamAdminCancelBtn) teamAdminCancelBtn.addEventListener('click', closeTeamAdminLogin);

  // Login de Elena (Taller Textil & Confección) -> Redirección directa al Panel de Control
  async function handleElenaLogin() {
    const pass = (passElenaInput ? passElenaInput.value : '').trim();
    const res = (window.WorkshopDB && window.WorkshopDB.loginAdminAsync)
      ? await window.WorkshopDB.loginAdminAsync('elena', pass)
      : { valid: pass.toLowerCase() === 'elena' };

    if (res.valid) {
      currentRole = 'elena';
      localStorage.setItem(STORAGE_KEY_ROLE, 'elena');
      closeTeamAdminLogin();
      updateAdminUi();

      showToast('🌸 ¡Bienvenida Elena! Redirigiendo al Panel de Control...');
      setTimeout(() => {
        window.location.href = 'admin.html';
      }, 300);
    } else {
      alert(res.error || 'Clave incorrecta para Elena. Si la cambiaste, ingresá tu nueva clave.');
    }
  }

  // Login de Juanma (Administración & Finanzas) -> Redirección directa al Panel de Control
  async function handleJuanmaLogin() {
    const pass = (passJuanmaInput ? passJuanmaInput.value : '').trim();
    const res = (window.WorkshopDB && window.WorkshopDB.loginAdminAsync)
      ? await window.WorkshopDB.loginAdminAsync('juanma', pass)
      : { valid: pass.toLowerCase() === 'juanma' };

    if (res.valid) {
      currentRole = 'juanma';
      localStorage.setItem(STORAGE_KEY_ROLE, 'juanma');
      closeTeamAdminLogin();
      updateAdminUi();

      showToast('💻 ¡Bienvenido Juanma! Redirigiendo al Panel de Control...');
      setTimeout(() => {
        window.location.href = 'admin.html';
      }, 300);
    } else {
      alert(res.error || 'Clave incorrecta para Juanma. Si la cambiaste, ingresá tu nueva clave.');
    }
  }

  // Login Unificado de Respaldo -> Redirección directa al Panel de Control
  async function handleAdminLogin() {
    const pass = (passAdminInput ? passAdminInput.value : '').trim();
    const res = (window.WorkshopDB && window.WorkshopDB.loginAdminAsync)
      ? await window.WorkshopDB.loginAdminAsync(null, pass)
      : { valid: false };

    if (res.valid) {
      currentRole = res.role || 'juanma';
      localStorage.setItem(STORAGE_KEY_ROLE, currentRole);
      closeTeamAdminLogin();
      updateAdminUi();

      showToast(`✨ ¡Acceso concedido! Redirigiendo al Panel de Control...`);
      setTimeout(() => {
        window.location.href = 'admin.html';
      }, 300);
    } else {
      alert(res.error || 'Clave incorrecta. Por favor ingresá tu clave de administrador.');
    }
  }

  if (btnLoginElena) btnLoginElena.addEventListener('click', handleElenaLogin);
  if (passElenaInput) {
    passElenaInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleElenaLogin();
    });
  }

  if (btnLoginJuanma) btnLoginJuanma.addEventListener('click', handleJuanmaLogin);
  if (passJuanmaInput) {
    passJuanmaInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleJuanmaLogin();
    });
  }

  if (btnLoginAdmin) btnLoginAdmin.addEventListener('click', handleAdminLogin);
  if (passAdminInput) {
    passAdminInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAdminLogin();
    });
  }
  if (formAdminLogin) {
    formAdminLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      handleAdminLogin();
    });
  }

  // Guardar Nueva Contraseña de Administrador (en Google Sheets + local)
  const btnSaveNewPass = document.getElementById('btn-save-new-pass');
  if (btnSaveNewPass) {
    btnSaveNewPass.addEventListener('click', async () => {
      const targetRoleInput = document.querySelector('input[name="pass-role-target"]:checked');
      const targetRole = targetRoleInput ? targetRoleInput.value : 'elena';
      const curInput = document.getElementById('pass-current-input');
      const newInput = document.getElementById('pass-new-input');
      const confInput = document.getElementById('pass-confirm-input');
      const successMsg = document.getElementById('pass-change-msg-success');
      const errorMsg = document.getElementById('pass-change-msg-error');

      const currentPass = curInput ? curInput.value.trim() : '';
      const newPass = newInput ? newInput.value.trim() : '';
      const confPass = confInput ? confInput.value.trim() : '';

      if (successMsg) successMsg.style.display = 'none';
      if (errorMsg) errorMsg.style.display = 'none';

      if (!window.WorkshopDB) return;

      if (!newPass || newPass.length < 3) {
        if (errorMsg) {
          errorMsg.textContent = '❌ La nueva contraseña debe tener al menos 3 caracteres.';
          errorMsg.style.display = 'block';
        }
        return;
      }

      if (newPass !== confPass) {
        if (errorMsg) {
          errorMsg.textContent = '❌ La repetición de la contraseña no coincide con la nueva clave.';
          errorMsg.style.display = 'block';
        }
        return;
      }

      const res = window.WorkshopDB.updateAdminPasswordAsync
        ? await window.WorkshopDB.updateAdminPasswordAsync(targetRole, currentPass, newPass)
        : window.WorkshopDB.updateAdminPassword(targetRole, newPass);

      if (res.success) {
        if (successMsg) {
          successMsg.textContent = `✅ ¡La contraseña de ${targetRole === 'elena' ? 'Elena' : 'Juanma'} se actualizó con éxito! Ya podés usarla para entrar.`;
          successMsg.style.display = 'block';
        }
        if (curInput) curInput.value = '';
        if (newInput) newInput.value = '';
        if (confInput) confInput.value = '';
        showToast(`🔑 Contraseña de ${targetRole === 'elena' ? 'Elena' : 'Juanma'} guardada`);
      } else {
        if (errorMsg) {
          errorMsg.textContent = `❌ ${res.error || 'No se pudo guardar la clave.'}`;
          errorMsg.style.display = 'block';
        }
      }
    });
  }

  // Cierre de Sesión Unificado
  function logoutAdmin() {
    currentRole = null;
    localStorage.removeItem(STORAGE_KEY_ROLE);
    if (window.WorkshopDB && window.WorkshopDB.logoutCloud) window.WorkshopDB.logoutCloud();
    updateAdminUi();

    const dockEl = document.getElementById('footer-admin-dock');
    const toggleBtn = document.getElementById('btn-toggle-footer-admin');
    if (dockEl) dockEl.style.display = 'none';
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.innerHTML = '<span>🔒 Administración</span>';
    }

    const activeSessionBox = document.getElementById('auth-active-session-box');
    const profilesGrid = document.getElementById('auth-profiles-grid');
    if (activeSessionBox) activeSessionBox.style.display = 'none';
    if (profilesGrid) profilesGrid.style.display = 'grid';

    showToast('Sesión de administración cerrada.');
  }

  const btnSessionLogout = document.getElementById('btn-session-logout');
  if (btnSessionLogout) btnSessionLogout.addEventListener('click', logoutAdmin);

  if (adminLogoutBtn) adminLogoutBtn.addEventListener('click', logoutAdmin);
  if (adminLogoutElenaBtn) adminLogoutElenaBtn.addEventListener('click', logoutAdmin);
  if (adminLogoutJuanmaBtn) adminLogoutJuanmaBtn.addEventListener('click', logoutAdmin);

  // Botones de acción directa en la barra unificada
  if (adminSettingsBtn) adminSettingsBtn.addEventListener('click', openDevSettings);
  if (adminBackupBtn) adminBackupBtn.addEventListener('click', downloadProductsFile);
  if (adminNewProductBtn) adminNewProductBtn.addEventListener('click', () => openProductEditor(null));
  if (adminTutorialBtn) adminTutorialBtn.addEventListener('click', openElenaTutorial);

  // Atajos de teclado: Alt + E o Alt + A para abrir login
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLookbookModal();
      closeClientLogin();
      closeTeamAdminLogin();
      closeProductEditor();
      closeDevSettings();
      closeGithubModal();
      closeElenaTutorial();
      closeElenaOrders();
    }
    if ((e.altKey && e.key.toLowerCase() === 'e') || (e.altKey && e.key.toLowerCase() === 'a')) {
      openTeamAdminLogin();
    }
  });

  // =========================================================================
  // HUB DEL PANEL DE CONTROL EN EL PIE DE PÁGINA (ORGANIZADO Y DISCRETO)
  // =========================================================================
  function updateFooterDockBadges() {
    if (!window.WorkshopDB) return;
    try {
      const orders = window.WorkshopDB.getOrders ? window.WorkshopDB.getOrders() : [];
      const production = window.WorkshopDB.getProductionQueue ? window.WorkshopDB.getProductionQueue() : [];
      const chats = window.WorkshopDB.getChats ? window.WorkshopDB.getChats() : [];

      const oBadge = document.getElementById('dock-orders-badge');
      if (oBadge) oBadge.textContent = orders.length;

      const pBadge = document.getElementById('dock-prod-badge');
      if (pBadge) {
        const active = production.filter(p => p.phase !== 'completado');
        pBadge.textContent = active.length;
      }

      const cBadge = document.getElementById('dock-chat-badge');
      if (cBadge) cBadge.textContent = chats.length;

      const logoutBtn = document.getElementById('dock-logout-btn');
      if (logoutBtn) {
        logoutBtn.textContent = currentRole ? 'Cerrar Sesión' : 'Iniciar Sesión Admin';
      }
    } catch (err) {}
  }

  function setupFooterAdminHub() {
    const toggleBtn = document.getElementById('btn-toggle-footer-admin');
    const dockEl = document.getElementById('footer-admin-dock');
    const closeBtn = document.getElementById('btn-dock-close');
    const backupBtn = document.getElementById('dock-backup-btn');
    const githubBtn = document.getElementById('dock-github-btn');
    const logoutBtn = document.getElementById('dock-logout-btn');

    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        if (e) e.preventDefault();
        // NUNCA desplegar nada hacia abajo en la tienda pública
        if (dockEl) dockEl.style.display = 'none';
        toggleBtn.setAttribute('aria-expanded', 'false');
        // Abrir siempre la ventana flotante centrada en medio de la pantalla
        openTeamAdminLogin();
      });
    }

    if (closeBtn && dockEl) {
      closeBtn.addEventListener('click', () => {
        dockEl.style.display = 'none';
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
      });
    }

    if (backupBtn) {
      backupBtn.addEventListener('click', () => {
        if (typeof exportWorkshopBackup === 'function') {
          exportWorkshopBackup();
        } else if (typeof downloadProductsFile === 'function') {
          downloadProductsFile();
        }
      });
    }

    if (githubBtn) {
      githubBtn.addEventListener('click', () => {
        if (typeof openGithubModal === 'function') openGithubModal();
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (currentRole) {
          logoutAdmin();
          if (dockEl) dockEl.style.display = 'none';
          if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
        } else {
          openTeamAdminLogin();
        }
      });
    }

    // Botón para abrir el Editor de Textos y Secciones desde el dock inferior
    const dockEditTextsBtn = document.getElementById('btn-dock-edit-texts');
    if (dockEditTextsBtn) {
      dockEditTextsBtn.addEventListener('click', (e) => {
        if (e) e.preventDefault();
        openDevSettings();
      });
    }

    // Botones para subir de inmediato al inicio de la página desde el dock
    const scrollTopBtn = document.getElementById('btn-dock-scroll-top');
    const homeScrollBtn = document.getElementById('btn-dock-home-scroll');
    const handleScrollToTop = (e) => {
      if (window.location.pathname.includes('producto.html')) {
        if (e && e.currentTarget && e.currentTarget.tagName !== 'A') {
          e.preventDefault();
          window.location.href = 'index.html';
        }
        return;
      }
      if (e) e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    if (scrollTopBtn) scrollTopBtn.addEventListener('click', handleScrollToTop);
    if (homeScrollBtn) homeScrollBtn.addEventListener('click', handleScrollToTop);
  }

  setupFooterAdminHub();

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
  const inlineEditColorsList = document.getElementById('inline-edit-colors-list');
  const inlineNewColorName = document.getElementById('inline-new-color-name');
  const inlineNewColorHex = document.getElementById('inline-new-color-hex');
  const btnInlineAddColor = document.getElementById('btn-inline-add-color');
  const inlineAllowEmbroidery = document.getElementById('inline-allow-embroidery');

  function renderInlineProductColors(selectedColors = []) {
    if (!inlineEditColorsList) return;
    const palette = (window.WorkshopDB && typeof window.WorkshopDB.getColorPalette === 'function')
      ? window.WorkshopDB.getColorPalette()
      : [
          { name: 'Champán Seda', hex: '#E8DAC8' },
          { name: 'Crudo Natural', hex: '#F3EFE8' },
          { name: 'Rosa Viejo', hex: '#DFBDB5' },
          { name: 'Vichy Arena', hex: '#D4C3AE' },
          { name: 'Verde Salvia', hex: '#A6B5A7' },
          { name: 'Terracota Suave', hex: '#C87D69' },
          { name: 'Blanco Lino', hex: '#FAF8F5' },
          { name: 'Celeste Bebé', hex: '#C8DCE8' },
          { name: 'Gris Perla', hex: '#D3D1CE' },
          { name: 'Chocolate', hex: '#6D4C41' },
          { name: 'Gris Topo', hex: '#7A7671' },
          { name: 'Verde Esmeralda', hex: '#4D7C6F' }
        ];
    const activeSet = new Set(
      (Array.isArray(selectedColors) && selectedColors.length > 0
        ? selectedColors
        : ['Champán Seda', 'Rosa Viejo', 'Arena Tostada', 'Salvia Suave']
      ).map(c => String(c).toLowerCase())
    );

    inlineEditColorsList.innerHTML = palette.map(c => {
      const isChecked = activeSet.has(c.name.toLowerCase());
      return `
        <label style="display:inline-flex; align-items:center; gap:0.4rem; padding:0.35rem 0.65rem; background:#FFFFFF; border:1px solid #DFD3C3; border-radius:999px; font-size:0.78rem; cursor:pointer; user-select:none;">
          <input type="checkbox" class="inline-prod-color-check" value="${c.name}" ${isChecked ? 'checked' : ''} style="accent-color:#A45A44;" />
          <span style="width:13px; height:13px; border-radius:50%; background:${c.hex}; border:1px solid rgba(0,0,0,0.18); display:inline-block;"></span>
          <span>${c.name}</span>
        </label>
      `;
    }).join('');
  }

  function getSelectedInlineProductColors() {
    if (!inlineEditColorsList) return ['Champán Seda', 'Rosa Viejo', 'Arena Tostada', 'Salvia Suave'];
    const checked = Array.from(inlineEditColorsList.querySelectorAll('.inline-prod-color-check:checked')).map(el => el.value);
    return checked.length > 0 ? checked : ['Champán Seda'];
  }

  if (btnInlineAddColor) {
    btnInlineAddColor.addEventListener('click', () => {
      const name = (inlineNewColorName ? inlineNewColorName.value : '').trim();
      const hex = (inlineNewColorHex ? inlineNewColorHex.value : '#DFD3C3').trim();
      if (!name) {
        showToast('⚠️ Escribí el nombre del nuevo color (ej: Gris Perla).');
        return;
      }
      const currentSelected = getSelectedInlineProductColors();
      if (window.WorkshopDB && typeof window.WorkshopDB.addCustomColor === 'function') {
        window.WorkshopDB.addCustomColor(name, hex);
      }
      if (!currentSelected.includes(name)) currentSelected.push(name);
      renderInlineProductColors(currentSelected);
      if (inlineNewColorName) inlineNewColorName.value = '';
      showToast(`🎨 Color "${name}" agregado y seleccionado para este producto.`);
    });
  }

  function openProductEditor(id = null) {
    if (!productEditModal) return;

    if (productModalBadge) {
      productModalBadge.className = 'profile-badge-inline profile-badge--juanma';
      productModalBadge.textContent = '🌸 Taller & Catálogo \u00B7 Creación Artesanal';
    }

    if (devFieldsRow) devFieldsRow.style.display = 'grid';

    if (id) {
      const product = products.find(p => p.id === id);
      if (!product) return;

      if (productModalTitle) productModalTitle.textContent = `Modificar Creación: ${product.title}`;
      if (productModalDesc) productModalDesc.textContent = 'Cambiá la información, fotos, colores disponibles o precios de tu pieza. Al guardar se actualizará en la tienda de inmediato.';

      if (editProductId) editProductId.value = product.id;
      if (editTitle) editTitle.value = product.title || '';
      if (editCategory) editCategory.value = product.category || 'cuidado-personal';
      if (editPrice) editPrice.value = product.price || '';
      if (editTexture) editTexture.value = product.texture || '';
      if (editTag) editTag.value = product.tag || '';
      if (editSize) editSize.value = product.size || 'medium';
      if (editDesc) editDesc.value = product.desc || '';

      const ig = product.instagram || {};
      if (editIgCaption) editIgCaption.value = ig.caption || product.story || '';

      renderInlineProductColors(product.availableColors || ['Champán Seda', 'Rosa Viejo', 'Arena Tostada', 'Salvia Suave']);
      if (inlineAllowEmbroidery) inlineAllowEmbroidery.checked = product.allowEmbroidery !== false;

      renderImageRows(product.images || []);
    } else {
      if (productModalTitle) productModalTitle.textContent = 'Nueva Creación Artesanal';
      if (productModalDesc) productModalDesc.textContent = 'Completá los datos de la pieza, elegí en qué colores de tela está disponible y agregá fotos para publicarla en el catálogo.';

      if (editProductId) editProductId.value = '';
      if (editTitle) editTitle.value = '';
      if (editCategory) editCategory.value = 'cuidado-personal';
      if (editPrice) editPrice.value = '';
      if (editTexture) editTexture.value = 'Confección a mano con fibras nobles';
      if (editTag) editTag.value = 'Novedad de Taller';
      if (editSize) editSize.value = 'medium';
      if (editDesc) editDesc.value = '';
      if (editIgCaption) editIgCaption.value = '';

      renderInlineProductColors(['Champán Seda', 'Rosa Viejo', 'Arena Tostada', 'Salvia Suave']);
      if (inlineAllowEmbroidery) inlineAllowEmbroidery.checked = true;

      renderImageRows([
        { label: 'Foto Principal', src: 'assets/images/hero-textile.jpg' }
      ]);
    }

    if (editSaveBtn) {
      editSaveBtn.textContent = '✨ Guardar y Publicar en la Tienda';
    }

    productEditModal.classList.add('is-open');
  }

  function closeProductEditor() {
    if (productEditModal) productEditModal.classList.remove('is-open');
  }

  if (editCancelBtn) editCancelBtn.addEventListener('click', closeProductEditor);
  if (adminNewProductBtn) adminNewProductBtn.addEventListener('click', () => openProductEditor(null));
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

  // Subir imagen desde teléfono o computadora (comprimida y subida a Google Drive si está conectado)
  if (editFileInput) {
    editFileInput.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      editFileInput.value = '';
      showToast('⏳ Procesando y optimizando foto...');
      try {
        if (window.WorkshopDB && window.WorkshopDB.processAndUploadImage) {
          const res = await window.WorkshopDB.processAndUploadImage(file);
          addImageRow('Nueva Foto Subida', res.url);
          showToast(res.uploaded ? '☁️ ¡Foto subida a Google Drive y agregada!' : '📸 Foto optimizada y cargada.');
        } else {
          const reader = new FileReader();
          reader.onload = (event) => {
            addImageRow('Nueva Foto Subida', event.target.result);
            showToast('📸 Foto cargada desde tu dispositivo.');
          };
          reader.readAsDataURL(file);
        }
      } catch (err) {
        showToast('❌ No se pudo procesar la foto.');
      }
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

      const id = (editProductId && editProductId.value) ? editProductId.value : `prod_${Date.now()}`;
      const title = editTitle ? editTitle.value.trim() : '';
      if (!title) {
        alert('Por favor ingresá un título o nombre para la creación.');
        return;
      }
      const category = editCategory ? editCategory.value : 'cuidado-personal';
      const price = (editPrice && editPrice.value.trim()) ? editPrice.value.trim() : 'Consultar';
      const texture = (editTexture && editTexture.value.trim()) ? editTexture.value.trim() : 'Confección artesanal';
      const tag = (editTag && editTag.value.trim()) ? editTag.value.trim() : 'Hecho a Mano';
      const size = (editSize && editSize.value) ? editSize.value : 'medium';
      const desc = editDesc ? editDesc.value.trim() : '';
      const igCaption = editIgCaption ? editIgCaption.value.trim() : '';
      const availableColors = getSelectedInlineProductColors();
      const allowEmbroidery = inlineAllowEmbroidery ? inlineAllowEmbroidery.checked : true;

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
        availableColors,
        allowEmbroidery,
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
        showToast(currentRole === 'elena' ? `🌸 ¡Listo Elena! "${title}" ya está actualizada con sus colores disponibles.` : `✅ "${title}" actualizado con éxito.`);
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
  // 8. MODAL DE CONFIGURACIÓN DEL SISTEMA & EDITOR DE TEXTOS (ELENA & JUANMA)
  // =========================================================================
  const devSettingsModal = document.getElementById('dev-settings-modal');
  const devSettingsForm = document.getElementById('dev-settings-form');
  const devSettingsCloseBtn = document.getElementById('dev-settings-close-btn');

  const btnSyncGithubDirect = document.getElementById('btn-sync-github-direct');
  const btnDownloadBackup = document.getElementById('btn-download-backup');
  const btnResetFactory = document.getElementById('btn-reset-factory');
  const btnResetTexts = document.getElementById('btn-reset-texts');

  // Mapeo completo de inputs del modal de ajustes <-> propiedades de settings
  const SETTING_FIELD_MAP = [
    { id: 'setting-whatsapp', key: 'whatsapp_phone' },
    { id: 'setting-instagram', key: 'instagram_user' },
    { id: 'setting-announcement', key: 'announcement' },
    { id: 'setting-gh-token', key: 'gh_token' },
    // Hero & Portada
    { id: 'setting-hero-eyebrow', key: 'hero_eyebrow' },
    { id: 'setting-hero-cta', key: 'hero_cta' },
    { id: 'setting-hero-title', key: 'hero_title' },
    { id: 'setting-hero-tagline', key: 'hero_tagline' },
    // Categorías
    { id: 'setting-cat-eyebrow', key: 'categories_eyebrow' },
    { id: 'setting-cat-title', key: 'categories_title' },
    { id: 'setting-cat-desc', key: 'categories_desc' },
    // Catálogo
    { id: 'setting-catalog-eyebrow', key: 'catalog_eyebrow' },
    { id: 'setting-catalog-title', key: 'catalog_title' },
    { id: 'setting-catalog-desc', key: 'catalog_desc' },
    // Muestrario de Telas
    { id: 'setting-fabrics-eyebrow', key: 'fabrics_eyebrow' },
    { id: 'setting-fabrics-title', key: 'fabrics_title' },
    { id: 'setting-fabrics-desc', key: 'fabrics_desc' },
    // Diseñador a Medida
    { id: 'setting-builder-eyebrow', key: 'builder_eyebrow' },
    { id: 'setting-builder-title', key: 'builder_title' },
    { id: 'setting-builder-desc', key: 'builder_desc' },
    // Cajas de Regalo
    { id: 'setting-gifts-eyebrow', key: 'gifts_eyebrow' },
    { id: 'setting-gifts-title', key: 'gifts_title' },
    { id: 'setting-gifts-desc', key: 'gifts_desc' },
    // Sobre Elena
    { id: 'setting-about-eyebrow', key: 'about_eyebrow' },
    { id: 'setting-about-title', key: 'about_title' },
    { id: 'setting-about-lead', key: 'about_lead' },
    { id: 'setting-about-body', key: 'about_body' },
    { id: 'setting-about-quote', key: 'about_quote' },
    { id: 'setting-about-author', key: 'about_author' },
    { id: 'setting-about-cta', key: 'about_cta' },
    // Espacios & Estilismo
    { id: 'setting-spaces-eyebrow', key: 'spaces_eyebrow' },
    { id: 'setting-spaces-title', key: 'spaces_title' },
    { id: 'setting-spaces-desc', key: 'spaces_desc' },
    { id: 'setting-spaces-cta', key: 'spaces_cta' },
    // Banner WhatsApp & Footer
    { id: 'setting-wa-banner-eyebrow', key: 'wa_banner_eyebrow' },
    { id: 'setting-wa-banner-title', key: 'wa_banner_title' },
    { id: 'setting-wa-banner-desc', key: 'wa_banner_desc' },
    { id: 'setting-wa-banner-btn', key: 'wa_banner_btn' },
    { id: 'setting-footer-desc', key: 'footer_desc' },
    { id: 'setting-footer-copy', key: 'footer_copy' }
  ];

  function openDevSettings() {
    if (!devSettingsModal) return;
    SETTING_FIELD_MAP.forEach(({ id, key }) => {
      const el = document.getElementById(id);
      if (el) el.value = settings[key] || '';
    });
    const chkGifts = document.getElementById('setting-show-gift-boxes');
    const chkBuilder = document.getElementById('setting-show-custom-builder');
    const chkFabrics = document.getElementById('setting-show-fabric-showcase');
    const chkCoupons = document.getElementById('setting-enable-coupons');
    if (chkGifts) chkGifts.checked = settings.show_gift_boxes !== false;
    if (chkBuilder) chkBuilder.checked = settings.show_custom_builder !== false;
    if (chkFabrics) chkFabrics.checked = settings.show_fabric_showcase !== false;
    if (chkCoupons) chkCoupons.checked = settings.enable_coupons === true;

    devSettingsModal.classList.add('is-open');
  }

  function closeDevSettings() {
    if (devSettingsModal) devSettingsModal.classList.remove('is-open');
  }

  if (adminDevSettingsBtn) adminDevSettingsBtn.addEventListener('click', openDevSettings);
  if (adminElenaSettingsBtn) adminElenaSettingsBtn.addEventListener('click', openDevSettings);
  if (devSettingsCloseBtn) devSettingsCloseBtn.addEventListener('click', closeDevSettings);

  if (devSettingsForm) {
    devSettingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      SETTING_FIELD_MAP.forEach(({ id, key }) => {
        const el = document.getElementById(id);
        if (el) settings[key] = (el.value || '').trim();
      });

      const chkGifts = document.getElementById('setting-show-gift-boxes');
      const chkBuilder = document.getElementById('setting-show-custom-builder');
      const chkFabrics = document.getElementById('setting-show-fabric-showcase');
      const chkCoupons = document.getElementById('setting-enable-coupons');
      if (chkGifts) settings.show_gift_boxes = chkGifts.checked;
      if (chkBuilder) settings.show_custom_builder = chkBuilder.checked;
      if (chkFabrics) settings.show_fabric_showcase = chkFabrics.checked;
      if (chkCoupons) settings.enable_coupons = chkCoupons.checked;

      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
      if (window.WorkshopDB && typeof window.WorkshopDB.saveSystemSettings === 'function') {
        const curDb = window.WorkshopDB.getSystemSettings() || {};
        window.WorkshopDB.saveSystemSettings(Object.assign({}, curDb, settings));
      }
      applySystemSettings();
      closeDevSettings();
      showToast('✨ ¡Textos y secciones de la página actualizados!');
    });
  }

  // Botón Restablecer Textos Originales
  if (btnResetTexts) {
    btnResetTexts.addEventListener('click', () => {
      if (confirm('¿Restablecer los títulos y frases a los textos originales del taller?')) {
        SETTING_FIELD_MAP.forEach(({ id, key }) => {
          if (key !== 'whatsapp_phone' && key !== 'instagram_user' && key !== 'gh_token') {
            settings[key] = DEFAULT_SETTINGS[key];
            const el = document.getElementById(id);
            if (el) el.value = DEFAULT_SETTINGS[key] || '';
          }
        });
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
        applySystemSettings();
        showToast('✍️ Títulos y frases restaurados a los valores originales.');
      }
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
 * Divina Locura Deco - Base de Datos de Productos & Configuración
 * Generado automáticamente desde el Modo Administrador.
 */

const INITIAL_SITE_SETTINGS = ${JSON.stringify(settings, null, 2)};

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
  if (adminElenaBackupBtn) adminElenaBackupBtn.addEventListener('click', downloadProductsFile);
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
  if (adminElenaGithubBtn) adminElenaGithubBtn.addEventListener('click', openGithubModal);
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
  // 11. SISTEMA DE CLIENTAS & INICIO DE SESIÓN EXCLUSIVO CLIENTAS
  // =========================================================================
  const clientLoginModal = document.getElementById('client-login-modal');
  const clientLoginCancelBtn = document.getElementById('client-login-cancel-btn');
  const headerUserLabel = document.getElementById('header-user-label');

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

  function openClientLogin() {
    try {
      const savedCustomer = localStorage.getItem(STORAGE_KEY_CUSTOMER);
      if (savedCustomer) currentCustomer = JSON.parse(savedCustomer);
    } catch (e) {}
    updateClientUi();
    if (clientLoginModal) clientLoginModal.classList.add('is-open');
  }

  function closeClientLogin() {
    if (clientLoginModal) clientLoginModal.classList.remove('is-open');
  }

  if (clientLoginCancelBtn) {
    clientLoginCancelBtn.addEventListener('click', closeClientLogin);
  }

  function updateClientUi() {
    if (headerUserLabel) {
      if (currentRole === 'elena') {
        headerUserLabel.textContent = 'ELENA · TALLER 🌸';
      } else if (currentRole === 'juanma' || currentRole === 'admin') {
        headerUserLabel.textContent = 'JUANMA · SUPER ADMIN 💻';
      } else if (currentCustomer && currentCustomer.name) {
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

      // Renderizar pedidos de la clienta con fechas y notas de Elena
      if (clientOrdersList) {
        const allOrders = (window.WorkshopDB && typeof window.WorkshopDB.getOrders === 'function') 
          ? window.WorkshopDB.getOrders() 
          : orders;

        const clientOrders = allOrders.filter(o => 
          (o.customer && (
            (o.customer.phone && currentCustomer.phone && o.customer.phone.replace(/[^0-9]/g, '') === currentCustomer.phone.replace(/[^0-9]/g, '')) ||
            (o.customer.email && currentCustomer.email && o.customer.email.toLowerCase() === currentCustomer.email.toLowerCase()) ||
            (o.customer.name && currentCustomer.name && o.customer.name.toLowerCase() === currentCustomer.name.toLowerCase())
          ))
        );

        // Actualizar chips de KPIs del cliente
        const kpiOrders = document.getElementById('client-kpi-orders-count');
        const kpiActive = document.getElementById('client-kpi-active-count');
        if (kpiOrders) kpiOrders.textContent = clientOrders.length;
        if (kpiActive) {
          const activeOrders = clientOrders.filter(o => o.status !== 'Entregado').length;
          kpiActive.textContent = activeOrders;
        }

        if (clientOrders.length === 0) {
          clientOrdersList.innerHTML = '<p class="client-orders-empty">Aún no has enviado pedidos desde la web.</p>';
        } else {
          clientOrdersList.innerHTML = clientOrders.map(ord => `
            <div class="client-order-item">
              <div class="client-order-header">
                <span>Pedido #${ord.id}</span>
                <span class="client-order-badge">${ord.status || 'En preparación'}</span>
              </div>
              <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.35rem;">${ord.date} a las ${ord.time}</div>
              <div style="margin-bottom:0.35rem;">${(ord.items || []).map(i => `<strong>${i.qty}x</strong> ${i.title}${i.note ? ` (<em>${i.note}</em>)` : ''}`).join(', ')}</div>
              ${ord.estimatedDelivery ? `
                <div class="client-delivery-date-badge">
                  <span>📅 Entrega prevista:</span> <strong>${ord.estimatedDelivery}</strong>
                </div>
              ` : ''}
              ${ord.workshopNote ? `
                <div class="client-workshop-note-bubble">
                  <strong>🌸 Mensaje de Elena:</strong> "${ord.workshopNote}"
                </div>
              ` : ''}
              <div style="display:flex; flex-wrap:wrap; gap:0.45rem; margin-top:0.5rem;">
                <button type="button" class="btn btn--secondary btn-client-order-chat" data-ord-id="${ord.id}" style="padding:0.3rem 0.65rem; font-size:0.75rem; display:inline-flex; align-items:center; gap:0.3rem;">
                  <span>💬 Escribirle a Elena</span>
                </button>
                <button type="button" class="btn btn--secondary btn-client-order-pdf" data-ord-id="${ord.id}" style="padding:0.3rem 0.65rem; font-size:0.75rem; display:inline-flex; align-items:center; gap:0.3rem;">
                  <span>📄 Orden / Recibo PDF</span>
                </button>
              </div>
            </div>
          `).join('');

          // Botones para saltar directo al chat desde un pedido
          clientOrdersList.querySelectorAll('.btn-client-order-chat').forEach(b => {
            b.addEventListener('click', () => {
              const chatTabBtn = document.getElementById('btn-client-tab-chat');
              if (chatTabBtn) chatTabBtn.click();
              const chatInput = document.getElementById('client-chat-input');
              if (chatInput) {
                chatInput.value = `Hola Elena! Te consulto por mi pedido #${b.getAttribute('data-ord-id')}: `;
                chatInput.focus();
              }
            });
          });

          // Botones para abrir recibo PDF del pedido
          clientOrdersList.querySelectorAll('.btn-client-order-pdf').forEach(b => {
            b.addEventListener('click', () => {
              const ordId = b.getAttribute('data-ord-id');
              const targetOrd = clientOrders.find(o => o.id === ordId);
              if (targetOrd && typeof openPrintableOrderReceipt === 'function') {
                openPrintableOrderReceipt(targetOrd);
              }
            });
          });
        }
      }

      // Renderizar Chat Directo de la Clienta
      renderClientDirectChat();

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

  // Renderizar Mensajes de Chat Directo con Elena
  function renderClientDirectChat() {
    const chatContainer = document.getElementById('client-chat-history');
    if (!chatContainer || !currentCustomer || !currentCustomer.phone) return;

    if (!window.WorkshopDB) return;
    const msgs = window.WorkshopDB.getMessagesForPhone(currentCustomer.phone);

    if (msgs.length === 0) {
      chatContainer.innerHTML = '<p style="color:var(--text-muted); font-size:0.8rem; text-align:center; margin:auto;">Iniciá una conversación directa con Elena sobre tus pedidos o telas.</p>';
      return;
    }

    chatContainer.innerHTML = msgs.map(m => {
      const isClient = m.sender === 'client';
      return `
        <div class="chat-bubble-item ${isClient ? 'chat-bubble-item--client' : 'chat-bubble-item--elena'}" style="max-width:85%;">
          <div style="font-weight:700; font-size:0.75rem; margin-bottom:0.15rem;">
            ${isClient ? 'Tú' : '🌸 Elena (Taller)'}
          </div>
          <div>${m.text}</div>
          <div class="chat-bubble-meta">${m.timestamp}</div>
        </div>
      `;
    }).join('');

    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  // Enviar mensaje en Chat Directo Clienta -> Elena
  const clientChatForm = document.getElementById('client-direct-chat-form');
  const clientChatInput = document.getElementById('client-chat-input');
  if (clientChatForm && clientChatInput) {
    clientChatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = clientChatInput.value.trim();
      if (!text || !currentCustomer || !currentCustomer.phone) return;

      if (window.WorkshopDB) {
        window.WorkshopDB.sendMessage(currentCustomer.phone, text, 'client', currentCustomer.name);
      }
      clientChatInput.value = '';
      renderClientDirectChat();
      updateWorkshopCounters();
      if (typeof renderWorkshopChat === 'function') renderWorkshopChat();
      showToast('Mensaje enviado a Elena 🌸');
    });
  }

  // Pestañas internas en Mi Cuenta
  document.querySelectorAll('.client-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.client-tab-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const targetTab = btn.getAttribute('data-ctab');
      const paneOrders = document.getElementById('cpane-orders');
      const paneChat = document.getElementById('cpane-chat');
      const paneProfile = document.getElementById('cpane-profile');

      if (paneOrders) paneOrders.style.display = targetTab === 'orders' ? 'block' : 'none';
      if (paneChat) {
        paneChat.style.display = targetTab === 'chat' ? 'block' : 'none';
        if (targetTab === 'chat') renderClientDirectChat();
      }
      if (paneProfile) paneProfile.style.display = targetTab === 'profile' ? 'block' : 'none';
    });
  });

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

      if (window.WorkshopDB) {
        window.WorkshopDB.saveClient({ name, phone, email, address });
      }

      updateClientUi();
      closeClientLogin();
      updateWorkshopCounters();
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
      closeClientLogin();
      openCartDrawer();
    });
  }

  // Cambiar a Login de Administradores (Elena & Juanma) desde Mi Cuenta
  const btnSwitchToTeam = document.getElementById('btn-switch-to-team-modal');
  if (btnSwitchToTeam) {
    btnSwitchToTeam.addEventListener('click', () => {
      closeClientLogin();
      openTeamAdminLogin();
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

  // Estado de Cupones y Modalidad de Pago (Seña 50% vs Total 100%)
  const COUPONS_CATALOG = {
    'BIENVENIDA10': { code: 'BIENVENIDA10', pct: 10, label: '10% OFF Bienvenida' },
    'ATELIER15': { code: 'ATELIER15', pct: 15, label: '15% OFF Atelier Exclusivo' },
    'REGALO10': { code: 'REGALO10', pct: 10, label: '10% OFF Regalería' },
    'ELENA10': { code: 'ELENA10', pct: 10, label: '10% OFF Clienta Amiga' }
  };

  let activeCoupon = null;
  let paymentMode = 'deposit50'; // 'deposit50' (Seña 50%) o 'full100' (100% Total)

  const FALLBACK_ITEM_PRICES = {
    'p1': 28500,
    'p2': 9800,
    'p3': 18500,
    'p4': 22000,
    'p5': 11500,
    'p6': 13200,
    'p7': 24500,
    'p8': 15800,
    'p9': 26800,
    'p10': 32500,
    'p11': 19500,
    'p12': 28900,
    'p13': 17400,
    'p14': 14200,
    'p15': 54000,
    'p16': 16500
  };

  function parseItemUnitPrice(item) {
    const str = String(item.price || '');
    const m = str.match(/\$\s*([\d.,]+)/) || str.match(/([\d.]{4,})/);
    if (m) {
      const parsed = parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    if (item.id && FALLBACK_ITEM_PRICES[item.id]) {
      return FALLBACK_ITEM_PRICES[item.id];
    }
    return 16500;
  }

  function calculateCartTotals() {
    const subtotal = cart.reduce((sum, item) => {
      return sum + (parseItemUnitPrice(item) * (item.qty || 1));
    }, 0);

    const discountPct = activeCoupon ? activeCoupon.pct : 0;
    const discountAmount = Math.round(subtotal * (discountPct / 100));
    const finalTotal = Math.max(0, subtotal - discountAmount);
    const depositAmount = Math.round(finalTotal * 0.5);
    const pendingBalance = Math.max(0, finalTotal - depositAmount);
    const payableNow = paymentMode === 'deposit50' ? depositAmount : finalTotal;

    return {
      subtotal,
      discountPct,
      discountAmount,
      couponCode: activeCoupon ? activeCoupon.code : '',
      finalTotal,
      depositAmount,
      pendingBalance,
      payableNow,
      paymentMode
    };
  }

  function addToCart(productOrId, customNote = '', qtyToAdd = 1, customItemData = null, referenceImage = '') {
    let product = null;
    if (typeof productOrId === 'object' && productOrId !== null) {
      product = productOrId;
    } else if (customItemData && typeof customItemData === 'object') {
      product = customItemData;
    } else {
      product = products.find(p => p.id === productOrId);
    }
    if (!product) return;

    const refImg = referenceImage || product.referenceImage || (customItemData && customItemData.referenceImage) || '';
    const defaultImg = product.img || ((product.images && product.images[0]) ? product.images[0].src : 'assets/images/hero-textile.jpg');
    const addCount = Math.max(1, parseInt(qtyToAdd, 10) || 1);
    const displayPrice = product.price && String(product.price).includes('$')
      ? product.price
      : (FALLBACK_ITEM_PRICES[product.id] ? `$ ${FALLBACK_ITEM_PRICES[product.id].toLocaleString('es-AR')} ARS` : (product.price || '$ 16.500 ARS'));

    const existingIndex = cart.findIndex(item => item.id === product.id && (item.note || '') === (customNote || '') && (item.referenceImage || '') === (refImg || ''));
    if (existingIndex > -1) {
      cart[existingIndex].qty += addCount;
    } else {
      cart.push({
        id: product.id,
        title: product.title,
        price: displayPrice,
        categoryName: product.categoryName || getCategoryLabel(product.category || 'hogar'),
        img: defaultImg,
        note: customNote,
        referenceImage: refImg,
        qty: addCount
      });
    }

    saveCartToStorage();
    updateCartUi();
    openCartDrawer();
    showToast(`✨ Sumado a tu bolsa: "${product.title}" (${addCount})`);
  }

  function ensureCartFinancialSummaryBox() {
    if (!cartDrawerFooter || document.getElementById('cart-financial-box')) return;

    const showCoupons = settings && settings.enable_coupons === true;

    const finBox = document.createElement('div');
    finBox.id = 'cart-financial-box';
    finBox.className = 'cart-financial-box';
    finBox.innerHTML = `
      <!-- Cupones de Descuento (Opcional si Elena los activa en Configuración) -->
      <div class="cart-coupon-row" style="display:${showCoupons ? 'flex' : 'none'};">
        <input type="text" id="cart-coupon-input" class="cart-input cart-coupon-input" placeholder="Cupón (ej: BIENVENIDA10)" autocomplete="off" />
        <button type="button" class="btn-cart-coupon" id="btn-apply-coupon">Aplicar</button>
      </div>
      <div class="cart-coupon-feedback" id="cart-coupon-feedback" style="display:none;"></div>

      <!-- Selector de Modalidad: Seña 50% vs 100% Total -->
      <div class="cart-paymode-selector" role="radiogroup" aria-label="Modalidad de pago">
        <button type="button" class="cart-paymode-btn is-active" data-paymode="deposit50">
          <span class="cart-paymode-btn__title">⏳ Seña 50% (Reserva)</span>
          <span class="cart-paymode-btn__sub">50% hoy · 50% al entregar</span>
        </button>
        <button type="button" class="cart-paymode-btn" data-paymode="full100">
          <span class="cart-paymode-btn__title">✨ Total 100%</span>
          <span class="cart-paymode-btn__sub">Cancelación completa</span>
        </button>
      </div>

      <!-- Desglose de Importes -->
      <div class="cart-totals-breakdown">
        <div class="cart-totals-line">
          <span>Subtotal piezas:</span>
          <strong id="cart-val-subtotal">$ 0 ARS</strong>
        </div>
        <div class="cart-totals-line cart-totals-line--discount" id="cart-row-discount" style="display:none;">
          <span id="cart-lbl-discount">Descuento aplicado:</span>
          <strong id="cart-val-discount">- $ 0 ARS</strong>
        </div>
        <div class="cart-totals-line cart-totals-line--total">
          <span>Valor Total del Pedido:</span>
          <strong id="cart-val-total">$ 0 ARS</strong>
        </div>
        <div class="cart-totals-highlight" id="cart-payable-highlight">
          <div class="cart-totals-highlight__row">
            <span id="cart-lbl-payable-now">Monto a abonar hoy (Seña 50%):</span>
            <strong id="cart-val-payable-now">$ 0 ARS</strong>
          </div>
          <div class="cart-totals-highlight__sub" id="cart-val-pending-note">
            Saldo contra entrega: $ 0 ARS
          </div>
        </div>
      </div>

      <!-- Alias Bancario / Mercado Pago en 1 Clic + Orden PDF -->
      <div class="cart-alias-bar">
        <div class="cart-alias-bar__info">
          <span class="cart-alias-bar__kicker">TRANSFERENCIA / MERCADO PAGO</span>
          <strong class="cart-alias-bar__value" id="cart-alias-text">DIVINA.LOCURA.DECO</strong>
        </div>
        <div class="cart-alias-bar__actions">
          <button type="button" class="btn-copy-alias" id="btn-copy-alias" title="Copiar Alias CBU al portapapeles">
            <span>📋 Copiar Alias</span>
          </button>
          <button type="button" class="btn-copy-alias btn-preview-order-pdf" id="btn-cart-preview-pdf" title="Ver o descargar presupuesto / orden en PDF">
            <span>📄 Orden PDF</span>
          </button>
        </div>
      </div>
    `;

    cartDrawerFooter.insertBefore(finBox, cartDrawerFooter.firstChild);

    // Eventos de Cupón
    const couponInput = document.getElementById('cart-coupon-input');
    const applyCouponBtn = document.getElementById('btn-apply-coupon');
    if (applyCouponBtn && couponInput) {
      applyCouponBtn.addEventListener('click', () => {
        const raw = (couponInput.value || '').trim().toUpperCase();
        if (!raw) {
          activeCoupon = null;
          refreshCartFinancialSummary();
          return;
        }
        if (COUPONS_CATALOG[raw]) {
          activeCoupon = COUPONS_CATALOG[raw];
          showToast(`🎉 ¡Cupón ${activeCoupon.code} (${activeCoupon.pct}% OFF) aplicado!`);
          refreshCartFinancialSummary();
        } else {
          showToast('⚠️ Cupón no válido. Probá con BIENVENIDA10 o ATELIER15.');
        }
      });
    }

    // Eventos de Modalidad Seña 50% vs 100%
    finBox.querySelectorAll('.cart-paymode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        finBox.querySelectorAll('.cart-paymode-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        paymentMode = btn.getAttribute('data-paymode') || 'deposit50';
        refreshCartFinancialSummary();
      });
    });

    // Evento Copiar Alias en 1 Clic
    const copyAliasBtn = document.getElementById('btn-copy-alias');
    if (copyAliasBtn) {
      copyAliasBtn.addEventListener('click', () => {
        const aliasVal = (settings && settings.mp_alias) ? settings.mp_alias : 'DIVINA.LOCURA.DECO';
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(aliasVal).catch(() => {});
        }
        copyAliasBtn.innerHTML = '<span>✓ ¡Copiado!</span>';
        showToast(`📋 Alias "${aliasVal}" copiado al portapapeles.`);
        setTimeout(() => {
          copyAliasBtn.innerHTML = '<span>📋 Copiar Alias</span>';
        }, 2200);
      });
    }

    // Evento Vista Previa Orden PDF
    const previewPdfBtn = document.getElementById('btn-cart-preview-pdf');
    if (previewPdfBtn) {
      previewPdfBtn.addEventListener('click', () => {
        const totals = calculateCartTotals();
        const draftOrder = {
          id: 'PRE-' + Math.floor(1000 + Math.random() * 9000),
          date: new Date().toLocaleDateString('es-AR'),
          time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
          customer: {
            name: (cartInputName && cartInputName.value.trim()) || (currentCustomer && currentCustomer.name) || 'Clienta Invitada',
            phone: (cartInputPhone && cartInputPhone.value.trim()) || (currentCustomer && currentCustomer.phone) || '-',
            email: (cartInputEmail && cartInputEmail.value.trim()) || (currentCustomer && currentCustomer.email) || '',
            address: (cartInputAddress && cartInputAddress.value.trim()) || (currentCustomer && currentCustomer.address) || 'A coordinar con taller'
          },
          items: JSON.parse(JSON.stringify(cart)),
          subtotalAmount: totals.subtotal,
          discountAmount: totals.discountAmount,
          couponCode: totals.couponCode,
          totalAmount: totals.finalTotal,
          depositAmount: totals.depositAmount,
          pendingBalance: totals.pendingBalance,
          paymentMode: totals.paymentMode,
          estimatedDelivery: '5 a 7 días hábiles',
          workshopNote: 'Confección artesanal a medida en el taller de Elena.'
        };
        openPrintableOrderReceipt(draftOrder);
      });
    }
  }

  function refreshCartFinancialSummary() {
    ensureCartFinancialSummaryBox();
    const totals = calculateCartTotals();

    const couponRows = document.querySelectorAll('.cart-coupon-row');
    couponRows.forEach(row => {
      row.style.display = (settings && settings.enable_coupons === true) ? 'flex' : 'none';
    });

    const elSub = document.getElementById('cart-val-subtotal');
    const rowDisc = document.getElementById('cart-row-discount');
    const lblDisc = document.getElementById('cart-lbl-discount');
    const valDisc = document.getElementById('cart-val-discount');
    const elTotal = document.getElementById('cart-val-total');
    const lblPayNow = document.getElementById('cart-lbl-payable-now');
    const valPayNow = document.getElementById('cart-val-payable-now');
    const valPendingNote = document.getElementById('cart-val-pending-note');
    const feedbackEl = document.getElementById('cart-coupon-feedback');
    const aliasTextEl = document.getElementById('cart-alias-text');

    if (aliasTextEl) {
      aliasTextEl.textContent = (settings && settings.mp_alias) ? settings.mp_alias : 'DIVINA.LOCURA.DECO';
    }
    if (elSub) elSub.textContent = `$ ${totals.subtotal.toLocaleString('es-AR')} ARS`;

    if (rowDisc && valDisc && lblDisc) {
      if (totals.discountAmount > 0 && activeCoupon) {
        rowDisc.style.display = 'flex';
        lblDisc.textContent = `Cupón ${activeCoupon.code} (-${activeCoupon.pct}%):`;
        valDisc.textContent = `- $ ${totals.discountAmount.toLocaleString('es-AR')} ARS`;
      } else {
        rowDisc.style.display = 'none';
      }
    }

    if (feedbackEl) {
      if (activeCoupon) {
        feedbackEl.style.display = 'flex';
        feedbackEl.innerHTML = `<span>✓ ${activeCoupon.label} activo (-$ ${totals.discountAmount.toLocaleString('es-AR')})</span> <button type="button" id="btn-remove-coupon" style="background:none;border:none;color:#A45A44;cursor:pointer;font-weight:700;font-size:0.75rem;">Quitar ✕</button>`;
        const remBtn = document.getElementById('btn-remove-coupon');
        if (remBtn) {
          remBtn.onclick = () => {
            activeCoupon = null;
            const inp = document.getElementById('cart-coupon-input');
            if (inp) inp.value = '';
            refreshCartFinancialSummary();
          };
        }
      } else {
        feedbackEl.style.display = 'none';
      }
    }

    if (elTotal) elTotal.textContent = `$ ${totals.finalTotal.toLocaleString('es-AR')} ARS`;

    if (lblPayNow && valPayNow && valPendingNote) {
      if (totals.paymentMode === 'deposit50') {
        lblPayNow.textContent = 'Seña a abonar hoy (50%):';
        valPayNow.textContent = `$ ${totals.depositAmount.toLocaleString('es-AR')} ARS`;
        valPendingNote.textContent = `Saldo restante contra entrega: $ ${totals.pendingBalance.toLocaleString('es-AR')} ARS`;
      } else {
        lblPayNow.textContent = 'Total a abonar hoy (100%):';
        valPayNow.textContent = `$ ${totals.finalTotal.toLocaleString('es-AR')} ARS`;
        valPendingNote.textContent = 'Pedido 100% saldado (Sin saldo pendiente en entrega)';
      }
    }
  }

  // Generador de Orden / Recibo Imprimible y Descargable en PDF (Clientas & Taller)
  function openPrintableOrderReceipt(ord) {
    if (!ord) return;
    let modal = document.getElementById('order-receipt-pdf-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'order-receipt-pdf-modal';
      modal.className = 'admin-modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      document.body.appendChild(modal);
    }

    const items = ord.items || [];
    const calcTotal = ord.totalAmount || items.reduce((acc, i) => acc + parseItemUnitPrice(i) * (i.qty || 1), 0);
    const deposit = ord.depositAmount != null ? ord.depositAmount : Math.round(calcTotal * 0.5);
    const pending = ord.pendingBalance != null ? ord.pendingBalance : Math.max(0, calcTotal - deposit);
    const aliasStr = (settings && settings.mp_alias) ? settings.mp_alias : 'DIVINA.LOCURA.DECO';

    modal.innerHTML = `
      <div class="admin-modal__card receipt-pdf-card" id="printable-receipt-sheet">
        <div class="receipt-pdf-top-actions no-print">
          <span class="receipt-pdf-kicker">📄 COMPROBANTE & ORDEN DE TALLER</span>
          <div style="display:flex; gap:0.5rem;">
            <button type="button" class="btn btn--primary" id="btn-print-receipt-now" style="padding:0.45rem 0.95rem; font-size:0.78rem;">
              <span>🖨️ Imprimir / Guardar PDF</span>
            </button>
            <button type="button" class="btn btn--secondary" id="btn-close-receipt-modal" style="padding:0.45rem 0.85rem; font-size:0.78rem;">
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
              <div class="receipt-order-num">ORDEN #${ord.id || 'ORD-2026'}</div>
              <div class="receipt-order-date">Fecha: ${ord.date || new Date().toLocaleDateString('es-AR')} ${ord.time ? '· ' + ord.time : ''}</div>
            </div>
          </div>

          <div class="receipt-client-grid">
            <div>
              <span class="receipt-meta-label">CLIENTA</span>
              <strong>${ord.customer ? ord.customer.name : 'Clienta'}</strong>
            </div>
            <div>
              <span class="receipt-meta-label">WHATSAPP / CONTACTO</span>
              <strong>${ord.customer ? ord.customer.phone : '-'}</strong>
            </div>
            <div>
              <span class="receipt-meta-label">ENTREGA / LOCALIDAD</span>
              <strong>${(ord.customer && ord.customer.address) ? ord.customer.address : 'A convenir'}</strong>
            </div>
            <div>
              <span class="receipt-meta-label">PLAZO ESTIMADO</span>
              <strong>${ord.estimatedDelivery || '5 a 7 días hábiles'}</strong>
            </div>
          </div>

          <table class="receipt-items-table">
            <thead>
              <tr>
                <th>Cant.</th>
                <th>Pieza Textil &amp; Personalización de Taller</th>
                <th style="text-align:right;">Precio Unit.</th>
                <th style="text-align:right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => {
                const uPrice = parseItemUnitPrice(item);
                const sub = uPrice * (item.qty || 1);
                return `
                  <tr>
                    <td><strong>${item.qty || 1}x</strong></td>
                    <td>
                      <div style="font-weight:600; color:#2B2625;">${item.title}</div>
                      ${item.note ? `<div style="font-size:0.76rem; color:#8F4F3D; margin-top:2px;">🪡 ${item.note}</div>` : ''}
                      ${item.referenceImage ? `<div style="margin-top:6px; display:flex; align-items:center; gap:0.5rem;"><img src="${item.referenceImage}" alt="Referencia" style="width:46px; height:46px; object-fit:cover; border-radius:4px; border:1px solid #DFD3C3;" /><span style="font-size:0.72rem; color:#6E655F;">📸 Boceto / Foto de referencia adjuntada para la máquina de Elena</span></div>` : ''}
                    </td>
                    <td style="text-align:right;">$ ${uPrice.toLocaleString('es-AR')}</td>
                    <td style="text-align:right; font-weight:600;">$ ${sub.toLocaleString('es-AR')}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="receipt-totals-box">
            ${ord.discountAmount ? `
              <div class="receipt-total-row" style="color:#2E7D32;">
                <span>Descuento Aplicado (${ord.couponCode || 'Promoción'}):</span>
                <strong>- $ ${ord.discountAmount.toLocaleString('es-AR')} ARS</strong>
              </div>
            ` : ''}
            <div class="receipt-total-row receipt-total-row--main">
              <span>TOTAL DEL PEDIDO:</span>
              <strong>$ ${calcTotal.toLocaleString('es-AR')} ARS</strong>
            </div>
            <div class="receipt-total-row receipt-total-row--deposit">
              <span>⏳ Seña de Reserva (50% Confección):</span>
              <strong>$ ${deposit.toLocaleString('es-AR')} ARS</strong>
            </div>
            <div class="receipt-total-row">
              <span>📦 Saldo Restante contra Entrega (50%):</span>
              <strong>$ ${pending.toLocaleString('es-AR')} ARS</strong>
            </div>
          </div>

          <div class="receipt-footer-note">
            <div>
              <strong>Datos para Transferencia / Seña:</strong> Alias: <code>${aliasStr}</code> · WhatsApp Taller: +54 9 11 3693-2471
            </div>
            <div style="margin-top:0.35rem; font-style:italic; color:#6E655F;">
              “Cada pieza es cortada, prelavada y confeccionada a mano por Elena con dedicación artesanal.”
            </div>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('is-open');

    const closeBtn = document.getElementById('btn-close-receipt-modal');
    if (closeBtn) {
      closeBtn.onclick = () => modal.classList.remove('is-open');
    }
    const printBtn = document.getElementById('btn-print-receipt-now');
    if (printBtn) {
      printBtn.onclick = () => window.print();
    }
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
        <img src="${item.referenceImage || item.img}" alt="${item.title}" class="cart-item__thumb" />
        <div class="cart-item__info">
          <h4 class="cart-item__title">${item.title}</h4>
          <span class="cart-item__category">${item.categoryName}</span>
          <span class="cart-item__price">${item.price}</span>
          ${item.referenceImage ? `<div style="font-size:0.72rem; color:#8F4F3D; font-weight:600; margin-top:2px;">📸 Foto / Boceto adjunto para Elena</div>` : ''}
          
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

    // Actualizar desglose de importes, señas y cupones
    refreshCartFinancialSummary();

    // Sincronizar datos de clienta si está logueada
    if (currentCustomer) {
      if (cartInputName && !cartInputName.value) cartInputName.value = currentCustomer.name;
      if (cartInputPhone && !cartInputPhone.value) cartInputPhone.value = currentCustomer.phone;
      if (cartInputEmail && !cartInputEmail.value) cartInputEmail.value = currentCustomer.email || '';
      if (cartInputAddress && !cartInputAddress.value) cartInputAddress.value = currentCustomer.address || '';
    }
  }

  // Selector de Tono de Tela en el Modal Lookbook + Agregar a la Bolsa
  let lookbookSelectedTone = 'Champán Seda';
  const lookbookSwatchesBar = document.getElementById('lookbook-swatches-bar');
  const lookbookActiveToneEl = document.getElementById('lookbook-active-tone');
  const lookbookAddBagBtn = document.getElementById('lookbook-add-bag-btn');
  const lookbookCustomNote = document.getElementById('lookbook-custom-note');

  if (lookbookSwatchesBar) {
    lookbookSwatchesBar.querySelectorAll('[data-lb-tone]').forEach(btn => {
      btn.addEventListener('click', () => {
        lookbookSwatchesBar.querySelectorAll('[data-lb-tone]').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        lookbookSelectedTone = btn.getAttribute('data-lb-tone') || 'Champán Seda';
        if (lookbookActiveToneEl) lookbookActiveToneEl.textContent = lookbookSelectedTone;
      });
    });
  }

  if (lookbookAddBagBtn) {
    lookbookAddBagBtn.addEventListener('click', () => {
      if (!currentLookbookProduct) return;
      const rawNote = lookbookCustomNote ? lookbookCustomNote.value.trim() : '';
      const combinedNote = rawNote ? `Tono: ${lookbookSelectedTone} · ${rawNote}` : `Tono: ${lookbookSelectedTone}`;
      addToCart(currentLookbookProduct.id, combinedNote);
      closeLookbookModal();
    });
  }

  // Función para procesar y registrar el pedido (local + Google Sheets + aviso por mail)
  function createAndSaveOrder(name, phone, email, address, wantPayment) {
    const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const totals = calculateCartTotals();

    const newOrder = {
      id: orderId,
      date: new Date().toLocaleDateString('es-AR'),
      time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      customer: { name, phone, email, address },
      items: JSON.parse(JSON.stringify(cart)),
      totalCount: cart.reduce((sum, item) => sum + item.qty, 0),
      subtotalAmount: totals.subtotal,
      discountAmount: totals.discountAmount,
      couponCode: totals.couponCode,
      totalAmount: totals.finalTotal,
      depositAmount: totals.depositAmount,
      pendingBalance: totals.pendingBalance,
      payableNow: totals.payableNow,
      paymentMode: totals.paymentMode,
      status: 'Pendiente de Confirmación',
      paymentStatus: totals.paymentMode === 'deposit50' ? 'Seña 50% a coordinar' : 'Total 100% a coordinar',
      estimatedDelivery: '5 a 7 días hábiles',
      workshopNote: 'Pedido recibido en el taller. Elena revisará las telas y confirmará el inicio de la confección.'
    };

    orders.unshift(newOrder);
    try {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    } catch (e) {}

    // Sincronizar con WorkshopDB + enviar a Google Sheets (manda mail a Elena automáticamente)
    let cloudPromise = Promise.resolve({ ok: false });
    if (window.WorkshopDB) {
      window.WorkshopDB.addOrder(newOrder);
      const existingMsgs = window.WorkshopDB.getMessagesForPhone(phone);
      if (existingMsgs.length === 0) {
        window.WorkshopDB.sendMessage(
          phone, 
          `🌸 ¡Hola Elena! Acabo de enviar un pedido desde la web (#${orderId}) con ${newOrder.totalCount} pieza(s).`,
          'client',
          name
        );
      }
      if (typeof window.WorkshopDB.submitPublicOrder === 'function') {
        cloudPromise = window.WorkshopDB.submitPublicOrder(newOrder, !!wantPayment);
      }
    }

    if (!currentCustomer) {
      currentCustomer = { name, phone, email, address };
      try {
        localStorage.setItem(STORAGE_KEY_CUSTOMER, JSON.stringify(currentCustomer));
      } catch (e) {}
    }

    updateClientUi();
    updateElenaOrdersBadge();
    updateWorkshopCounters();

    newOrder._cloudPromise = cloudPromise;
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

  // Checkout por WhatsApp (incluye desglose de Seña 50% vs 100% y Cupón si aplica)
  if (cartBtnWhatsapp) {
    cartBtnWhatsapp.addEventListener('click', () => {
      if (cart.length === 0) return;
      const cust = getCartCustomerData();
      if (!cust) return;

      const order = createAndSaveOrder(cust.name, cust.phone, cust.email, cust.address, false);

      let msg = `🌸 *NUEVO PEDIDO #${order.id} · DIVINA LOCURA DECO*\n`;
      msg += `--------------------------------------\n`;
      msg += `*Cliente:* ${cust.name}\n`;
      msg += `*WhatsApp:* ${cust.phone}\n`;
      if (cust.email) msg += `*Email:* ${cust.email}\n`;
      if (cust.address) msg += `*Dirección/Entrega:* ${cust.address}\n`;
      msg += `\n*PIEZAS ENCARGADAS (${order.totalCount}):*\n`;
      order.items.forEach((item, i) => {
        msg += `${i + 1}. *${item.qty}x ${item.title}* (${item.price})\n`;
        if (item.note) msg += `   └ Personalización: ${item.note}\n`;
        if (item.referenceImage) msg += `   └ 📸 Boceto/Foto de referencia adjuntada en la orden #${order.id}\n`;
      });
      if (order.discountAmount > 0) {
        msg += `\n*Cupón aplicado (${order.couponCode}):* - $ ${order.discountAmount.toLocaleString('es-AR')} ARS`;
      }
      if (order.totalAmount > 0) {
        msg += `\n*Total del Pedido:* $ ${order.totalAmount.toLocaleString('es-AR')} ARS\n`;
        if (order.paymentMode === 'deposit50') {
          msg += `*Modalidad elegida:* Seña 50% ($ ${order.depositAmount.toLocaleString('es-AR')} ARS hoy y $ ${order.pendingBalance.toLocaleString('es-AR')} ARS contra entrega)\n`;
        } else {
          msg += `*Modalidad elegida:* Pago Total 100% ($ ${order.totalAmount.toLocaleString('es-AR')} ARS)\n`;
        }
      }
      msg += `--------------------------------------\n`;
      msg += `Hola Elena! Te envío mi pedido desde la web de Divina Locura Deco para coordinar la confección. ¡Muchas gracias! ✨`;

      const cleanPhone = (settings.whatsapp_phone || '').replace(/[^0-9]/g, '');
      let waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
      if (cleanPhone && cleanPhone !== '5491100000000') {
        waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`;
      }

      cart = [];
      activeCoupon = null;
      saveCartToStorage();
      updateCartUi();
      closeCartDrawer();

      window.open(waUrl, '_blank', 'noopener,noreferrer');
      showToast('🌸 ¡Pedido registrado en el taller y enviado por WhatsApp a Elena!');
    });
  }

  // Checkout por Email
  if (cartBtnEmail) {
    cartBtnEmail.addEventListener('click', async () => {
      if (cart.length === 0) return;
      const cust = getCartCustomerData();
      if (!cust) return;

      const order = createAndSaveOrder(cust.name, cust.phone, cust.email, cust.address, false);

      cart = [];
      activeCoupon = null;
      saveCartToStorage();
      updateCartUi();
      closeCartDrawer();

      const cloudCfg = (window.WorkshopDB && window.WorkshopDB.getCloudConfig) ? window.WorkshopDB.getCloudConfig() : {};
      if (cloudCfg.hasUrl && order._cloudPromise) {
        showToast('⏳ Enviando pedido directo al taller de Elena...');
        const res = await order._cloudPromise;
        if (res && res.ok) {
          showToast(`✅ ¡Pedido #${res.orderId || order.id} recibido! Elena ya recibió el aviso por correo.`);
          return;
        }
      }

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
      body += `\nTotal del Pedido: $ ${(order.totalAmount || 0).toLocaleString('es-AR')} ARS`;
      body += `\nSeña 50%: $ ${(order.depositAmount || 0).toLocaleString('es-AR')} ARS | Saldo contra entrega: $ ${(order.pendingBalance || 0).toLocaleString('es-AR')} ARS\n`;
      body += `\nFecha del pedido: ${order.date} a las ${order.time}\n`;

      const targetEmail = 'divinalocuradeco@gmail.com';
      window.location.href = `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      showToast('✉️ Pedido generado para envío por correo electrónico a Elena.');
    });
  }

  // Botón de Cobro Online con Mercado Pago
  function ensureMercadoPagoButton() {
    if (!cartDrawerFooter || document.getElementById('cart-btn-mercadopago')) return;
    const actionsBox = cartDrawerFooter.querySelector('.cart-actions-grid') || cartDrawerFooter.querySelector('.cart-drawer__actions') || cartDrawerFooter;
    const mpBtn = document.createElement('button');
    mpBtn.type = 'button';
    mpBtn.id = 'cart-btn-mercadopago';
    mpBtn.className = 'btn btn--secondary';
    mpBtn.style.cssText = 'display:inline-flex; width:100%; justify-content:center; align-items:center; gap:0.5rem; background:#009EE3; color:#FFFFFF; border:1px solid #009EE3; font-weight:700; margin-bottom:0.5rem;';
    mpBtn.innerHTML = '<span>💳 Encargar y Pagar con Mercado Pago</span>';
    actionsBox.insertBefore(mpBtn, actionsBox.firstChild);

    mpBtn.addEventListener('click', async () => {
      if (cart.length === 0) return;
      const cust = getCartCustomerData();
      if (!cust) return;
      mpBtn.disabled = true;
      showToast('💳 Registrando pedido y preparando pago con Mercado Pago...');
      const order = createAndSaveOrder(cust.name, cust.phone, cust.email, cust.address, true);
      cart = [];
      activeCoupon = null;
      saveCartToStorage();
      updateCartUi();
      closeCartDrawer();

      let payUrl = '';
      if (order._cloudPromise) {
        const res = await order._cloudPromise;
        if (res && res.paymentUrl) payUrl = res.paymentUrl;
      }
      if (!payUrl) {
        payUrl = settings.mp_payment_link || settings.mp_link || '';
      }
      mpBtn.disabled = false;
      if (payUrl) {
        window.open(payUrl, '_blank', 'noopener,noreferrer');
      } else {
        const aliasText = settings.mp_alias ? ` (Alias: ${settings.mp_alias})` : ' (Alias: DIVINA.LOCURA.DECO)';
        const amountLabel = order.paymentMode === 'deposit50'
          ? `Seña 50% de $ ${(order.depositAmount || 0).toLocaleString('es-AR')} ARS`
          : `Total de $ ${(order.totalAmount || 0).toLocaleString('es-AR')} ARS`;
        const msg = `🌸 Hola Elena! Acabo de registrar el pedido *#${order.id}* (${amountLabel}) a nombre de *${cust.name}* y quiero abonarlo con *Mercado Pago*${aliasText}. ¿Me confirmás el link o alias? ✨`;
        const cleanPhone = (settings.whatsapp_phone || '').replace(/[^0-9]/g, '');
        const waUrl = (cleanPhone && cleanPhone !== '5491100000000')
          ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`
          : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        showToast('💳 Pedido guardado. Se abrió WhatsApp para coordinar el pago con Elena.');
      }
    });
  }

  function refreshMercadoPagoButtonVisibility() {
    ensureMercadoPagoButton();
    const mpBtn = document.getElementById('cart-btn-mercadopago');
    if (mpBtn) {
      mpBtn.style.display = 'inline-flex';
    }
  }
  refreshMercadoPagoButtonVisibility();

  // =========================================================================
  // 12B. MUESTRARIO DE TELAS DE ELENA + DISEÑADOR DE ENCARGOS A MEDIDA + CAJAS
  // =========================================================================
  let currentShowcaseFabric = null;

  function getActiveShowcaseFabrics() {
    if (window.WorkshopDB && typeof window.WorkshopDB.getShowcaseFabrics === 'function') {
      const list = window.WorkshopDB.getShowcaseFabrics();
      if (Array.isArray(list) && list.length > 0) return list;
    }
    return [
      {
        id: 'saten',
        tabLabel: '✨ Satén de Seda Antifrizz',
        img: 'assets/images/catalog/sleep-mask-satin-fabric-closeup.jpg',
        badge: '120 g/m² · Brillo Perlado',
        kicker: 'Línea Descanso & Cuidado Personal',
        heading: 'Satén de Seda Antifrizz',
        desc: 'Tejido sedoso, hipoalergénico y termorregulador que evita la fricción capilar durante la noche. A diferencia del algodón convencional, no absorbe la hidratación natural de tu piel ni tus cremas nocturnas, previniendo el frizz, el quiebre y las marcas de expresión al despertar.',
        touch: 'Caída fluida, superficie ultra lisa de baja fricción y frescura térmica todo el año.',
        care: 'Lavar a mano o en ciclo delicado con agua fría (máx. 30°C) y jabón neutro. Secar tendido a la sombra sin retorcer.',
        colors: ['Champán Seda', 'Rosa Viejo', 'Blanco Nube', 'Negro Ónix'],
        filter: 'cuidado-personal',
        btnLabel: 'Ver Creaciones en Satén →'
      },
      {
        id: 'waffle',
        tabLabel: '🧇 Algodón Waffle Nido de Abeja',
        img: 'assets/images/cat-waffle.jpg',
        badge: '280 g/m² · Puro Algodón Prelavado',
        kicker: 'Línea Cocina, Mesa & Hogar',
        heading: 'Algodón Waffle Nido de Abeja',
        desc: 'Textura tridimensional alveolar 100% puro algodón. Su entramado panal multiplica la superficie de absorción y permite que el aire circule libremente, logrando un secado rápido e higiénico con estética rústica europea.',
        touch: 'Relieve esponjoso y envolvente que gana suavidad con cada lavado sin perder estructura ni encoger.',
        care: 'Apto lavarropas con agua fría o tibia. No requiere planchado para conservar su relieve natural nido de abeja.',
        colors: ['Arena Tostada', 'Salvia Suave', 'Terracota Suave', 'Blanco Nube'],
        filter: 'hogar',
        btnLabel: 'Ver Creaciones en Waffle →'
      },
      {
        id: 'lino',
        tabLabel: '🌾 Lino Rústico & Tusor',
        img: 'assets/images/catalog/cosmetic-bag-on-linen-surface.jpg',
        badge: '310 g/m² · Trama Orgánica Firme',
        kicker: 'Línea Organización, Baño & Accesorios',
        heading: 'Lino Rústico & Lienzo de Algodón',
        desc: 'Fibras nobles de porte arquitectónico pensadas para contenedores textiles, bolsilleros de pared y neceseres. Combinadas en el taller con forrería interior impermeable y pasamanería de algodón.',
        touch: 'Cuerpo firme, tacto orgánico natural y alta resistencia al uso cotidiano.',
        care: 'Limpiar interior impermeable con paño húmedo o lavar en ciclo suave con agua fría. Planchar del revés ligeramente húmedo.',
        colors: ['Arena Tostada', 'Champán Seda', 'Salvia Suave', 'Rosa Viejo'],
        filter: 'organizacion',
        btnLabel: 'Ver Organización & Lino →'
      },
      {
        id: 'bebe',
        tabLabel: '🐰 Gasa Pañalera & Doble Felpa',
        img: 'assets/images/models/model-towel-baby.jpg',
        badge: '420 g/m² · Hipoalergénico Bebés',
        kicker: 'Línea Recién Nacidos & Primera Infancia',
        heading: 'Gasa Pañalera & Toalla Doble Felpa',
        desc: 'Algodón peinado de doble felpa ultra absorbente y muselina pañalera 100% libre de sintéticos. Seleccionada especialmente por Elena para proteger la piel delicada del recién nacido y acompañar sus primeros sueños.',
        touch: 'Caricia de nube, libre de pelusas y apta para bordado personalizado a mano sin raspar en el reverso.',
        care: 'Lavar con jabón líquido neutro o hipoalergénico para bebé. No usar lavandina ni suavizantes perfumados.',
        colors: ['Blanco Nube', 'Rosa Viejo', 'Champán Seda', 'Azul Bruma'],
        filter: 'infantil',
        btnLabel: 'Ver Línea Bebés & Ajuar →'
      }
    ];
  }

  const fabricTabsNav = document.getElementById('fabric-tabs-nav');
  const fabricFilterBtn = document.getElementById('fabric-showcase-filter-btn');
  const btnOrderWithThisFabric = document.getElementById('btn-order-with-this-fabric');

  function selectShowcaseFabricById(fabricId) {
    const list = getActiveShowcaseFabrics();
    const info = list.find(f => f.id === fabricId) || list[0];
    if (!info) return;
    currentShowcaseFabric = info;

    if (fabricTabsNav) {
      fabricTabsNav.querySelectorAll('.fabric-tab-btn').forEach(b => {
        const isCurrent = b.getAttribute('data-fabric-key') === info.id;
        b.classList.toggle('is-active', isCurrent);
        b.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
      });
    }

    const imgEl = document.getElementById('fabric-showcase-img');
    const badgeEl = document.getElementById('fabric-showcase-badge');
    const kickerEl = document.getElementById('fabric-showcase-kicker');
    const headEl = document.getElementById('fabric-showcase-heading');
    const descEl = document.getElementById('fabric-showcase-desc');
    const touchEl = document.getElementById('fabric-showcase-touch');
    const careEl = document.getElementById('fabric-showcase-care');
    const btnLblEl = document.getElementById('fabric-showcase-btn-label');

    if (imgEl) imgEl.src = info.img || 'assets/images/hero-textile.jpg';
    if (badgeEl) badgeEl.textContent = info.badge || 'Tela Seleccionada de Taller';
    if (kickerEl) kickerEl.textContent = info.kicker || 'Muestrario de Elena';
    if (headEl) headEl.textContent = info.heading || info.name || 'Tela de Taller';
    if (descEl) descEl.textContent = info.desc || '';
    if (touchEl) touchEl.textContent = info.touch || '';
    if (careEl) careEl.textContent = info.care || '';
    if (btnLblEl) btnLblEl.textContent = info.btnLabel || `Ver Creaciones →`;
    if (fabricFilterBtn) fabricFilterBtn.setAttribute('data-fabric-filter', info.filter || 'todos');

    // Mostrar colores disponibles de esta tela en el muestrario
    let colorsRow = document.getElementById('fabric-showcase-colors-row');
    const specsGrid = document.querySelector('.fabric-showcase-specs');
    if (specsGrid && !colorsRow) {
      colorsRow = document.createElement('div');
      colorsRow.id = 'fabric-showcase-colors-row';
      colorsRow.className = 'fabric-spec-item';
      colorsRow.style.gridColumn = '1 / -1';
      specsGrid.appendChild(colorsRow);
    }
    if (colorsRow) {
      const palette = (window.WorkshopDB && typeof window.WorkshopDB.getColorPalette === 'function')
        ? window.WorkshopDB.getColorPalette()
        : [];
      const colorsArr = Array.isArray(info.colors) && info.colors.length > 0
        ? info.colors
        : ['Champán Seda', 'Rosa Viejo', 'Arena Tostada', 'Blanco Nube'];
      const pills = colorsArr.map(cName => {
        const found = palette.find(p => p.name.toLowerCase() === String(cName).toLowerCase());
        const hex = found ? found.hex : '#DFD3C3';
        return `<span style="display:inline-flex; align-items:center; gap:0.35rem; padding:0.2rem 0.55rem; background:#FFFFFF; border:1px solid #E5DDD3; border-radius:999px; font-size:0.75rem;"><span style="width:10px; height:10px; border-radius:50%; background:${hex}; border:1px solid rgba(0,0,0,0.18);"></span>${cName}</span>`;
      }).join(' ');
      colorsRow.innerHTML = `
        <span class="fabric-spec-label">🎨 TONOS DISPONIBLES EN TALLER PARA ENCARGOS</span>
        <div style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-top:0.35rem;">${pills}</div>
      `;
    }
  }

  function renderFabricShowcaseTabs() {
    const list = getActiveShowcaseFabrics();
    if (!fabricTabsNav || list.length === 0) return;

    fabricTabsNav.innerHTML = list.map((f, idx) => `
      <button type="button" class="fabric-tab-btn ${idx === 0 ? 'is-active' : ''}" data-fabric-key="${f.id}" role="tab" aria-selected="${idx === 0 ? 'true' : 'false'}">
        ${f.tabLabel || `🧵 ${f.heading || f.name}`}
      </button>
    `).join('');

    fabricTabsNav.querySelectorAll('.fabric-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectShowcaseFabricById(btn.getAttribute('data-fabric-key'));
      });
    });

    selectShowcaseFabricById(list[0].id);
  }
  renderFabricShowcaseTabs();

  if (fabricFilterBtn) {
    fabricFilterBtn.addEventListener('click', () => {
      const cat = fabricFilterBtn.getAttribute('data-fabric-filter') || 'todos';
      const targetFilterBtn = document.querySelector(`.catalog-filters .filter-btn[data-filter="${cat}"]`);
      if (targetFilterBtn) targetFilterBtn.click();
    });
  }

  // =========================================================================
  // 12C. CONSTRUCTOR DE DISEÑO A MEDIDA & SUBIDA DE IMAGEN PARA LA MÁQUINA DE ELENA
  // =========================================================================
  const cbState = {
    pieceType: 'Neceser / Porta Cosméticos',
    basePrice: 14500,
    fabricName: 'Algodón Waffle Nido de Abeja (280 g/m²)',
    colorName: 'Champán Seda',
    dimensions: '',
    finishings: ['Puntilla de algodón', 'Interior impermeable'],
    embroidery: '',
    extraNotes: '',
    referenceImage: ''
  };

  const cbPieceGrid = document.getElementById('cb-piece-grid');
  const cbFabricSelect = document.getElementById('cb-fabric-select');
  const cbColorSwatches = document.getElementById('cb-color-swatches');
  const cbActiveColorLabel = document.getElementById('cb-selected-color-lbl');
  const cbDimensionsInput = document.getElementById('cb-dimensions-input');
  const cbEmbroideryInput = document.getElementById('cb-embroidery-input');
  const cbFinishingsChecks = document.getElementById('cb-finishings-checks');
  const cbReferenceFile = document.getElementById('cb-reference-file');
  const cbUploadPreviewWrap = document.getElementById('cb-upload-preview-wrap');
  const cbUploadPreviewImg = document.getElementById('cb-upload-preview-img');
  const cbClearUploadBtn = document.getElementById('cb-clear-upload-btn');
  const cbExtraNotes = document.getElementById('cb-extra-notes');
  const btnAddCustomDesignToCart = document.getElementById('btn-add-custom-design-to-cart');
  const btnWaCustomDesign = document.getElementById('btn-wa-custom-design');

  function populateCustomBuilderFabricsAndColors() {
    const list = getActiveShowcaseFabrics();
    if (cbFabricSelect && list.length > 0) {
      cbFabricSelect.innerHTML = list.map(f => {
        const label = `${f.heading || f.name} (${f.badge ? f.badge.split('·')[0].trim() : 'Calidad Taller'})`;
        return `<option value="${label}" data-fabric-id="${f.id}">${label}</option>`;
      }).join('');
      cbState.fabricName = cbFabricSelect.value;
    }

    if (cbColorSwatches) {
      const palette = (window.WorkshopDB && typeof window.WorkshopDB.getColorPalette === 'function')
        ? window.WorkshopDB.getColorPalette()
        : [
            { name: 'Champán Seda', hex: '#F3EAE0' },
            { name: 'Rosa Viejo', hex: '#D8B4A6' },
            { name: 'Arena Tostada', hex: '#C6B39E' },
            { name: 'Salvia Suave', hex: '#A9B7A0' },
            { name: 'Terracota Suave', hex: '#C27D66' },
            { name: 'Blanco Nube', hex: '#FFFFFF' }
          ];
      cbColorSwatches.innerHTML = palette.map((c, idx) => `
        <button type="button" class="pdp-swatch-dot ${idx === 0 ? 'is-active' : ''}" data-cb-color="${c.name}" style="--swatch-hex: ${c.hex};" title="${c.name}"></button>
      `).join('');
      if (palette[0]) {
        cbState.colorName = palette[0].name;
        if (cbActiveColorLabel) cbActiveColorLabel.textContent = cbState.colorName;
      }

      cbColorSwatches.querySelectorAll('[data-cb-color]').forEach(btn => {
        btn.addEventListener('click', () => {
          cbColorSwatches.querySelectorAll('[data-cb-color]').forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          cbState.colorName = btn.getAttribute('data-cb-color') || 'Champán Seda';
          if (cbActiveColorLabel) cbActiveColorLabel.textContent = cbState.colorName;
          updateCustomBuilderLiveCard();
        });
      });
    }
  }

  function updateCustomBuilderLiveCard() {
    if (cbDimensionsInput) cbState.dimensions = cbDimensionsInput.value.trim();
    if (cbEmbroideryInput) cbState.embroidery = cbEmbroideryInput.value.trim();
    if (cbExtraNotes) cbState.extraNotes = cbExtraNotes.value.trim();
    if (cbFinishingsChecks) {
      cbState.finishings = Array.from(cbFinishingsChecks.querySelectorAll('input[type="checkbox"]:checked')).map(c => c.value);
    }

    // Calcular precio orientativo (base + bordado + detalles complejos)
    let estPrice = cbState.basePrice || 14500;
    if (cbState.embroidery) estPrice += 2500;
    if (cbState.finishings.length > 2) estPrice += (cbState.finishings.length - 2) * 1200;
    const estDeposit = Math.round(estPrice * 0.5);

    setElText('cb-live-piece-title', cbState.pieceType);
    setElText('cb-live-fabric-name', cbState.fabricName);
    setElText('cb-live-color-name', 'Tono: ' + cbState.colorName);
    const swCircle = document.getElementById('cb-live-swatch-circle');
    const activeDot = cbColorSwatches ? cbColorSwatches.querySelector('.is-active') : null;
    if (swCircle && activeDot) swCircle.style.background = activeDot.style.getPropertyValue('--swatch-hex') || '#F3EFEA';
    const notesRow = document.getElementById('cb-live-notes-row');
    if (notesRow) notesRow.style.display = cbState.extraNotes ? '' : 'none';
    setElText('cb-live-dims', cbState.dimensions || 'Estándar de taller (a coordinar)');
    setElText('cb-live-finishings', cbState.finishings.length > 0 ? cbState.finishings.join(' + ') : 'Costura clásica reforzada');
    setElText('cb-live-embroidery', cbState.embroidery ? `"${cbState.embroidery}" (+ $ 2.500)` : 'Sin bordado');
    setElText('cb-live-notes', cbState.extraNotes || 'Confección artesanal en máquina por Elena.');
    setElText('cb-live-price', `$ ${estPrice.toLocaleString('es-AR')} ARS`);
    setElText('cb-live-deposit', `$ ${estDeposit.toLocaleString('es-AR')} ARS`);

    const liveRefBox = document.getElementById('cb-live-ref-thumb');
    const liveRefThumb = document.getElementById('cb-live-ref-img');
    if (liveRefBox && liveRefThumb) {
      if (cbState.referenceImage) {
        liveRefBox.style.display = 'flex';
        liveRefThumb.src = cbState.referenceImage;
      } else {
        liveRefBox.style.display = 'none';
      }
    }

    return { estPrice, estDeposit };
  }

  populateCustomBuilderFabricsAndColors();
  if (cbPieceGrid) {
    const firstPiece = cbPieceGrid.querySelector('.cb-piece-btn.is-active');
    if (firstPiece) {
      cbState.pieceType = firstPiece.getAttribute('data-piece-name') || cbState.pieceType;
      cbState.basePrice = parseInt(firstPiece.getAttribute('data-piece-base') || '14500', 10) || 14500;
    }
  }
  updateCustomBuilderLiveCard();

  // Botón en el Muestrario de Telas: "✂️ Encargar Diseño a Medida con esta Tela"
  if (btnOrderWithThisFabric) {
    btnOrderWithThisFabric.addEventListener('click', () => {
      if (currentShowcaseFabric && cbFabricSelect) {
        const targetOpt = Array.from(cbFabricSelect.options).find(opt =>
          opt.getAttribute('data-fabric-id') === currentShowcaseFabric.id ||
          opt.value.toLowerCase().includes((currentShowcaseFabric.heading || '').toLowerCase())
        );
        if (targetOpt) {
          cbFabricSelect.value = targetOpt.value;
          cbState.fabricName = targetOpt.value;
          updateCustomBuilderLiveCard();
        }
      }
      const builderSec = document.getElementById('disenador-a-medida');
      if (builderSec) {
        builderSec.style.display = '';
        builderSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      showToast(`✂️ Tela "${currentShowcaseFabric ? currentShowcaseFabric.heading : 'de taller'}" seleccionada en el Diseñador a Medida.`);
    });
  }

  if (cbPieceGrid) {
    cbPieceGrid.querySelectorAll('.cb-piece-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        cbPieceGrid.querySelectorAll('.cb-piece-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        cbState.pieceType = btn.getAttribute('data-piece-name') || 'Diseño a Medida';
        const dims = btn.getAttribute('data-piece-dims');
        if (dims && cbDimensionsInput) cbDimensionsInput.value = dims;
        cbState.basePrice = parseInt(btn.getAttribute('data-piece-base') || '14500', 10) || 14500;
        updateCustomBuilderLiveCard();
      });
    });
  }

  if (cbFabricSelect) {
    cbFabricSelect.addEventListener('change', () => {
      cbState.fabricName = cbFabricSelect.value;
      updateCustomBuilderLiveCard();
    });
  }

  [cbDimensionsInput, cbEmbroideryInput, cbExtraNotes].forEach(inp => {
    if (inp) inp.addEventListener('input', updateCustomBuilderLiveCard);
  });

  if (cbFinishingsChecks) {
    cbFinishingsChecks.querySelectorAll('input[type="checkbox"]').forEach(chk => {
      chk.addEventListener('change', updateCustomBuilderLiveCard);
    });
  }

  if (cbReferenceFile) {
    cbReferenceFile.addEventListener('change', async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      showToast('⏳ Cargando tu foto o boceto de referencia para Elena...');
      try {
        if (window.WorkshopDB && typeof window.WorkshopDB.processAndUploadImage === 'function') {
          const res = await window.WorkshopDB.processAndUploadImage(file);
          if (res && res.url) {
            cbState.referenceImage = res.url;
          }
        } else {
          cbState.referenceImage = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
        }
        if (cbUploadPreviewWrap && cbUploadPreviewImg && cbState.referenceImage) {
          cbUploadPreviewImg.src = cbState.referenceImage;
          cbUploadPreviewWrap.style.display = 'flex';
        }
        updateCustomBuilderLiveCard();
        showToast('📸 ¡Foto / boceto adjuntado a tu ficha de confección!');
      } catch (err) {
        console.warn('Error subiendo boceto:', err);
      }
    });
  }

  if (cbClearUploadBtn) {
    cbClearUploadBtn.addEventListener('click', () => {
      cbState.referenceImage = '';
      if (cbReferenceFile) cbReferenceFile.value = '';
      if (cbUploadPreviewWrap) cbUploadPreviewWrap.style.display = 'none';
      updateCustomBuilderLiveCard();
    });
  }

  function buildCustomDesignSummaryNote() {
    const parts = [
      `Tela: ${cbState.fabricName}`,
      `Color: ${cbState.colorName}`
    ];
    if (cbState.dimensions) parts.push(`Medidas: ${cbState.dimensions}`);
    if (cbState.finishings && cbState.finishings.length > 0) {
      parts.push(`Detalles máquina: ${cbState.finishings.join(', ')}`);
    }
    if (cbState.embroidery) parts.push(`Bordado: "${cbState.embroidery}"`);
    if (cbState.extraNotes) parts.push(`Indicaciones: "${cbState.extraNotes}"`);
    if (cbState.referenceImage) parts.push(`📸 Incluye foto/boceto de referencia`);
    return parts.join(' · ');
  }

  if (btnAddCustomDesignToCart) {
    btnAddCustomDesignToCart.addEventListener('click', () => {
      const { estPrice } = updateCustomBuilderLiveCard();
      const customProduct = {
        id: 'custom_' + Date.now(),
        title: `Diseño a Medida · ${cbState.pieceType}`,
        price: `$ ${estPrice.toLocaleString('es-AR')} ARS`,
        categoryName: 'Confección a Medida · Máquina de Elena',
        img: cbState.referenceImage || 'assets/images/hero-textile.jpg',
        referenceImage: cbState.referenceImage || ''
      };
      const fullNote = buildCustomDesignSummaryNote();
      addToCart(customProduct, fullNote, 1, customProduct, cbState.referenceImage || '');
    });
  }

  if (btnWaCustomDesign) {
    btnWaCustomDesign.addEventListener('click', () => {
      const { estPrice, estDeposit } = updateCustomBuilderLiveCard();
      let msg = `✂️ *FICHA DE DISEÑO A MEDIDA · PARA LA MÁQUINA DE ELENA*\n`;
      msg += `--------------------------------------\n`;
      msg += `• *Pieza a confeccionar:* ${cbState.pieceType}\n`;
      msg += `• *Tela elegida:* ${cbState.fabricName}\n`;
      msg += `• *Color / Tono:* ${cbState.colorName}\n`;
      msg += `• *Medidas solicitadas:* ${cbState.dimensions || 'Estándar a coordinar'}\n`;
      msg += `• *Terminaciones de máquina:* ${cbState.finishings.length > 0 ? cbState.finishings.join(', ') : 'Clásica'}\n`;
      if (cbState.embroidery) msg += `• *Bordado a mano:* "${cbState.embroidery}"\n`;
      if (cbState.extraNotes) msg += `• *Notas / Idea:* "${cbState.extraNotes}"\n`;
      if (cbState.referenceImage) msg += `• *Foto / Boceto:* Tengo una imagen de referencia para mostrarte 📸\n`;
      msg += `• *Valor estimado:* $ ${estPrice.toLocaleString('es-AR')} ARS (Seña 50%: $ ${estDeposit.toLocaleString('es-AR')} ARS)\n`;
      msg += `--------------------------------------\n`;
      msg += `Hola Elena! Armé este diseño a medida en la web de Divina Locura Deco. ¿Podemos coordinar la confección? 🌸`;

      const cleanPhone = (settings.whatsapp_phone || '').replace(/[^0-9]/g, '');
      const waUrl = (cleanPhone && cleanPhone !== '5491100000000')
        ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(msg)}`
        : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  }

  // Armador de Cajas de Regalo con 10% OFF Automático
  const GIFT_BOXES_CATALOG = {
    gift_saten: {
      id: 'gift_saten',
      title: 'Caja Regalo · Mandala Calada & Blanquería Blanco Lino (-10%)',
      price: '$ 36.000 ARS',
      categoryName: 'Regalería de Autor · 10% OFF',
      img: 'assets/images/banco/cajas-regalo/caja-toalla-mandala-blanca.jpg'
    },
    gift_bebe: {
      id: 'gift_bebe',
      title: 'Caja Regalo · Ajuar Rosa Viejo, Broderie & Volados (-10%)',
      price: '$ 34.920 ARS',
      categoryName: 'Regalería Rosa & Broderie · 10% OFF',
      img: 'assets/images/banco/cajas-regalo/caja-set-rosa-volados.jpg'
    },
    gift_hogar: {
      id: 'gift_hogar',
      title: 'Caja Regalo · Set Anfitriona Terracota & Pasamanería Dorada (-10%)',
      price: '$ 38.700 ARS',
      categoryName: 'Regalería Premium · 10% OFF',
      img: 'assets/images/banco/cajas-regalo/caja-toalla-terracota-dorada.jpg'
    }
  };

  let selectedGiftBoxKey = 'gift_saten';
  const giftActiveBoxName = document.getElementById('gift-active-box-name');
  const giftRecipientInput = document.getElementById('gift-input-recipient');
  const giftToneSelect = document.getElementById('gift-input-tone');
  const giftMessageInput = document.getElementById('gift-input-message');
  const btnAddGiftToCart = document.getElementById('btn-add-gift-to-cart');

  document.querySelectorAll('.btn-select-gift-box').forEach(btn => {
    btn.addEventListener('click', () => {
      const gKey = btn.getAttribute('data-gift-select') || 'gift_saten';
      const gData = GIFT_BOXES_CATALOG[gKey];
      if (!gData) return;

      selectedGiftBoxKey = gKey;
      document.querySelectorAll('.gift-box-card').forEach(card => {
        card.classList.toggle('is-selected', card.getAttribute('data-gift-id') === gKey);
      });
      if (giftActiveBoxName) {
        giftActiveBoxName.textContent = `${gData.title} (${gData.price})`;
      }
      const panel = document.getElementById('gift-dedication-panel');
      if (panel) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      if (giftRecipientInput) {
        setTimeout(() => giftRecipientInput.focus(), 200);
      }
      showToast(`🎁 Seleccionaste: ${gData.title}. Completá la dedicatoria abajo o sumala directo a tu bolsa.`);
    });
  });

  if (btnAddGiftToCart) {
    btnAddGiftToCart.addEventListener('click', () => {
      const gData = GIFT_BOXES_CATALOG[selectedGiftBoxKey] || GIFT_BOXES_CATALOG.gift_saten;
      const recipient = (giftRecipientInput ? giftRecipientInput.value : '').trim();
      const tone = giftToneSelect ? giftToneSelect.value : 'Tonos Crudo & Champán';
      const msg = (giftMessageInput ? giftMessageInput.value : '').trim();

      const noteParts = [`Paleta: ${tone}`];
      if (recipient) noteParts.push(`Para/Bordado: "${recipient}"`);
      if (msg) noteParts.push(`Tarjeta manuscrita: "${msg}"`);

      addToCart(gData, noteParts.join(' · '), 1);
    });
  }

  // =========================================================================
  // 13. HUB FLOTANTE DESPLAZANTE & CHATBOT CONCIERGE ("ELENA ASISTENTE DEL TALLER")
  // =========================================================================
  const floatingConcierge = document.getElementById('floating-concierge');
  const conciergeFabToggle = document.getElementById('concierge-fab-toggle');
  const conciergeFabMenu = document.getElementById('concierge-fab-menu');
  const chatbotTriggerBtn = document.getElementById('chatbot-trigger-btn') || document.getElementById('chatbot-trigger');
  const chatbotWindow = document.getElementById('chatbot-window');
  const chatbotCloseBtn = document.getElementById('chatbot-close-btn');
  const chatbotMessages = document.getElementById('chatbot-messages');
  const chatbotForm = document.getElementById('chatbot-form');
  const chatbotInput = document.getElementById('chatbot-input');
  const chatbotSuggestions = document.getElementById('chatbot-suggestions');

  function syncInstagramLinks() {
    const rawUser = (settings && settings.instagram_user ? settings.instagram_user : 'divina.locura.deco')
      .replace(/^@/, '')
      .trim() || 'divina.locura.deco';
    const igUrl = `https://www.instagram.com/${rawUser}/`;
    document.querySelectorAll('[data-ig-link]').forEach(el => {
      el.setAttribute('href', igUrl);
    });
  }
  syncInstagramLinks();

  function setConciergeExpanded(expanded) {
    if (!floatingConcierge || !conciergeFabToggle) return;
    if (expanded) {
      floatingConcierge.classList.add('is-expanded');
      conciergeFabToggle.setAttribute('aria-expanded', 'true');
      if (conciergeFabMenu) conciergeFabMenu.setAttribute('aria-hidden', 'false');
    } else {
      floatingConcierge.classList.remove('is-expanded');
      conciergeFabToggle.setAttribute('aria-expanded', 'false');
      if (conciergeFabMenu) conciergeFabMenu.setAttribute('aria-hidden', 'true');
    }
  }

  function openChatbot() {
    setConciergeExpanded(false);
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

  if (conciergeFabToggle) {
    conciergeFabToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isChatOpen = chatbotWindow && chatbotWindow.classList.contains('is-open');
      if (isChatOpen) {
        closeChatbot();
        return;
      }
      const isExpanded = floatingConcierge && floatingConcierge.classList.contains('is-expanded');
      setConciergeExpanded(!isExpanded);
    });
  }

  document.querySelectorAll('a[href="#contacto"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setConciergeExpanded(true);
    });
  });

  if (chatbotTriggerBtn) {
    chatbotTriggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = chatbotWindow && chatbotWindow.classList.contains('is-open');
      if (isOpen) closeChatbot();
      else openChatbot();
    });
  }

  if (chatbotCloseBtn) chatbotCloseBtn.addEventListener('click', closeChatbot);

  document.addEventListener('click', (e) => {
    if (floatingConcierge && !floatingConcierge.contains(e.target)) {
      setConciergeExpanded(false);
    }
  });

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
    const elElena = document.getElementById('admin-elena-orders-count');
    const elJuanma = document.getElementById('admin-juanma-orders-count');
    if (elElena) elElena.textContent = orders.length;
    if (elJuanma) elJuanma.textContent = orders.length;
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
  if (adminJuanmaTutorialBtn) adminJuanmaTutorialBtn.addEventListener('click', openElenaTutorial);
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

  // =========================================================================
  // 15. CENTRO DE GESTIÓN DEL TALLER DE ELENA (PEDIDOS, CLIENTAS, CHAT, STOCK & GASTOS)
  // =========================================================================
  const adminElenaDashboardBtn = document.getElementById('admin-elena-dashboard-btn');
  const adminJuanmaDashboardBtn = document.getElementById('admin-juanma-dashboard-btn');
  const adminElenaProductionBtn = document.getElementById('admin-elena-production-btn');
  const adminJuanmaProductionBtn = document.getElementById('admin-juanma-production-btn');
  const adminElenaChatBtn = document.getElementById('admin-elena-chat-btn');
  const adminElenaChatCount = document.getElementById('admin-elena-chat-count');
  const adminElenaStockBtn = document.getElementById('admin-elena-stock-btn');
  const adminElenaFinancesBtn = document.getElementById('admin-elena-finances-btn');
  let activeChatPhone = null;

  function updateWorkshopCounters() {
    if (!window.WorkshopDB) return;
    const allOrders = window.WorkshopDB.getOrders();
    const allClients = window.WorkshopDB.getClients();
    const allChats = window.WorkshopDB.getChats();
    const allProduction = window.WorkshopDB.getProductionQueue ? window.WorkshopDB.getProductionQueue() : [];
    const activeProduction = allProduction.filter(p => p.phase !== 'completado');

    // Contadores de barra admin unificada (y retrocompatibilidad)
    const oCountUnified = document.getElementById('admin-orders-count');
    const oCountElena = document.getElementById('admin-elena-orders-count');
    const oCountJuanma = document.getElementById('admin-juanma-orders-count');
    if (oCountUnified) oCountUnified.textContent = allOrders.length;
    if (oCountElena) oCountElena.textContent = allOrders.length;
    if (oCountJuanma) oCountJuanma.textContent = allOrders.length;

    const pCountUnified = document.getElementById('admin-production-count');
    const pCountElena = document.getElementById('admin-elena-production-count');
    const pCountJuanma = document.getElementById('admin-juanma-production-count');
    if (pCountUnified) pCountUnified.textContent = activeProduction.length;
    if (pCountElena) pCountElena.textContent = activeProduction.length;
    if (pCountJuanma) pCountJuanma.textContent = activeProduction.length;

    const chatKeys = Object.keys(allChats);
    const cCountUnified = document.getElementById('admin-chat-count');
    const cCountElena = document.getElementById('admin-elena-chat-count');
    const cCountJuanma = document.getElementById('admin-juanma-chat-count');
    if (cCountUnified) cCountUnified.textContent = chatKeys.length;
    if (cCountElena) cCountElena.textContent = chatKeys.length;
    if (cCountJuanma) cCountJuanma.textContent = chatKeys.length;

    // Contadores en las pestañas del modal
    const countOrdersTab = document.getElementById('workshop-orders-count');
    if (countOrdersTab) countOrdersTab.textContent = allOrders.length;

    const countProductionTab = document.getElementById('workshop-production-count');
    if (countProductionTab) countProductionTab.textContent = activeProduction.length;

    const countClientsTab = document.getElementById('workshop-clients-count');
    if (countClientsTab) countClientsTab.textContent = allClients.length;

    const countChatTab = document.getElementById('workshop-chat-unread-count');
    if (countChatTab) countChatTab.textContent = chatKeys.length;
  }

  function switchWorkshopTab(tabKey) {
    document.querySelectorAll('.workshop-tab-btn').forEach(btn => {
      btn.classList.toggle('is-active', btn.getAttribute('data-wtab') === tabKey);
    });

    const panes = {
      dashboard: document.getElementById('wpane-dashboard'),
      orders: document.getElementById('wpane-orders'),
      production: document.getElementById('wpane-production'),
      clients: document.getElementById('wpane-clients'),
      chat: document.getElementById('wpane-chat'),
      stock: document.getElementById('wpane-stock'),
      finances: document.getElementById('wpane-finances')
    };

    Object.keys(panes).forEach(k => {
      if (panes[k]) {
        panes[k].style.display = k === tabKey ? 'block' : 'none';
        panes[k].classList.toggle('is-active', k === tabKey);
      }
    });

    if (tabKey === 'dashboard') renderWorkshopDashboard();
    if (tabKey === 'orders') renderWorkshopOrders();
    if (tabKey === 'production') renderWorkshopProduction();
    if (tabKey === 'clients') renderWorkshopClients();
    if (tabKey === 'chat') renderWorkshopChat(activeChatPhone);
    if (tabKey === 'stock') renderWorkshopStock();
    if (tabKey === 'finances') renderWorkshopFinances();
  }

  // Pestañas del Taller de Elena
  document.querySelectorAll('.workshop-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-wtab');
      switchWorkshopTab(tab);
    });
  });

  // TAB 0: RENDER DEL PANEL DE CONTROL EJECUTIVO & MÉTRICAS DEL NEGOCIO
  function renderWorkshopDashboard() {
    if (!window.WorkshopDB) return;
    const summary = window.WorkshopDB.getBusinessSummary();

    // 1. Timestamp
    const timeEl = document.getElementById('biz-hero-timestamp');
    if (timeEl) {
      timeEl.textContent = 'Actualizado ' + new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    }

    // 2. KPIs Clave
    const elVisits = document.getElementById('biz-kpi-visits');
    if (elVisits) elVisits.textContent = summary.totalVisits.toLocaleString('es-AR');

    const elToday = document.getElementById('biz-kpi-today');
    if (elToday) elToday.textContent = summary.todayVisits;

    const elUniques = document.getElementById('biz-kpi-uniques');
    if (elUniques) elUniques.textContent = summary.uniqueVisitors.toLocaleString('es-AR');

    const elConv = document.getElementById('biz-kpi-conv');
    if (elConv) elConv.textContent = summary.conversionRate + '%';

    const elRev = document.getElementById('biz-kpi-revenue');
    if (elRev) elRev.textContent = '$' + summary.totalRevenue.toLocaleString('es-AR');

    const elOrdersCount = document.getElementById('biz-kpi-orders-count');
    if (elOrdersCount) elOrdersCount.textContent = summary.ordersCount;

    const elAvgTicket = document.getElementById('biz-kpi-avg-ticket');
    if (elAvgTicket) elAvgTicket.textContent = '$' + summary.avgTicket.toLocaleString('es-AR');

    const elNetProfit = document.getElementById('biz-kpi-netprofit');
    if (elNetProfit) {
      elNetProfit.textContent = (summary.netProfit >= 0 ? '+$' : '-$') + Math.abs(summary.netProfit).toLocaleString('es-AR');
      elNetProfit.style.color = summary.netProfit >= 0 ? '#FAF8F5' : '#F87171';
    }

    const elMargin = document.getElementById('biz-kpi-margin');
    if (elMargin) elMargin.textContent = (summary.profitMargin >= 0 ? '+' : '') + summary.profitMargin + '%';

    const elProd = document.getElementById('biz-kpi-production');
    if (elProd) elProd.textContent = summary.productionCount + ' en curso';

    const elStockStatus = document.getElementById('biz-kpi-stock-status');
    if (elStockStatus) {
      if (summary.totalAlertsCount > 0) {
        elStockStatus.textContent = '⚠️ ' + summary.totalAlertsCount + ' insumo(s) con stock bajo';
        elStockStatus.style.color = '#FBBF24';
      } else {
        elStockStatus.textContent = '🧵 Stock de telas controlado';
        elStockStatus.style.color = '#A99E96';
      }
    }

    // 3. Fuentes de Tráfico
    const s = summary.sources || { instagram: 64, whatsapp: 22, direct: 14 };
    const igVal = document.getElementById('biz-source-ig-val');
    if (igVal) igVal.textContent = s.instagram + '%';
    const waVal = document.getElementById('biz-source-wa-val');
    if (waVal) waVal.textContent = s.whatsapp + '%';
    const dirVal = document.getElementById('biz-source-direct-val');
    if (dirVal) dirVal.textContent = s.direct + '%';

    // 4. Histograma Semanal de Visitas (Lun-Dom)
    const barsContainer = document.getElementById('biz-weekly-bars');
    if (barsContainer && Array.isArray(summary.weeklyHistory)) {
      const maxVal = Math.max(...summary.weeklyHistory.map(h => h.visits), 1);
      barsContainer.innerHTML = summary.weeklyHistory.map(h => {
        const pctHeight = Math.max(15, Math.round((h.visits / maxVal) * 100));
        return `
          <div class="biz-bar-col" title="${h.day}: ${h.visits} visitas, ${h.orders} pedidos">
            <span class="biz-bar-val">${h.visits}</span>
            <div class="biz-bar-track">
              <div class="biz-bar-fill" style="height:${pctHeight}%;"></div>
            </div>
            <span class="biz-bar-day">${h.day}</span>
          </div>
        `;
      }).join('');
    }

    // 5. Ranking de Creaciones Más Vistas en Lookbook
    const topContainer = document.getElementById('biz-top-products-container');
    if (topContainer) {
      const pViews = summary.productViews || {};
      const sorted = products.slice().sort((a, b) => (pViews[b.id] || 0) - (pViews[a.id] || 0)).slice(0, 4);
      topContainer.innerHTML = sorted.map(p => {
        const viewsCount = pViews[p.id] || (Math.floor(p.price / 40) + 120);
        return `
          <div class="biz-top-product-card" onclick="window.DivinaLocura.openLookbookModal('${p.id}')" style="cursor:pointer;" title="Ver pieza en el Lookbook">
            <img src="${p.image}" alt="${p.title}" class="biz-top-product-thumb" loading="lazy">
            <div class="biz-top-product-info">
              <span class="biz-top-product-title">${p.title}</span>
              <span class="biz-top-product-views">👁️ ${viewsCount} visitas &middot; $ ${p.price.toLocaleString('es-AR')}</span>
            </div>
          </div>
        `;
      }).join('');
    }

    // 6. Conectar los 12 Botones de Lanzador Central
    wireDashboardLauncher();
  }

  function wireDashboardLauncher() {
    const actMap = {
      'bact-new-product': () => openProductEditor(),
      'bact-orders': () => switchWorkshopTab('orders'),
      'bact-production': () => switchWorkshopTab('production'),
      'bact-stock': () => switchWorkshopTab('stock'),
      'bact-finances': () => switchWorkshopTab('finances'),
      'bact-clients': () => switchWorkshopTab('clients'),
      'bact-chat': () => switchWorkshopTab('chat'),
      'bact-settings': () => openDevSettingsModal(),
      'bact-backup': () => {
        const jsonStr = window.WorkshopDB.exportBackupJson();
        const nowStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `respaldo_taller_divina_locura_${nowStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Respaldo integral JSON descargado.');
      },
      'bact-github': () => openGithubModal(),
      'bact-tutorial': () => openElenaTutorial(),
      'bact-switch-role': () => {
        const newRole = currentRole === 'elena' ? 'juanma' : 'elena';
        window.DivinaLocura.setRole(newRole);
        showToast(`Perfil cambiado a: ${newRole === 'elena' ? 'Elena (Taller)' : 'Juanma (Programador)'}`);
      }
    };

    Object.keys(actMap).forEach(id => {
      const btn = document.getElementById(id);
      if (btn && !btn.hasAttribute('data-bound')) {
        btn.setAttribute('data-bound', 'true');
        btn.addEventListener('click', actMap[id]);
      }
    });
  }

  // TAB 1.5: RENDER DE CONTROL DE PRODUCCIÓN & CONFECCIÓN TEXTIL
  function renderWorkshopProduction() {
    if (!window.WorkshopDB) return;
    const queue = window.WorkshopDB.getProductionQueue();
    const listContainer = document.getElementById('workshop-production-list');

    // Conteo por fases
    const counts = { corte: 0, costura: 0, bordado: 0, calidad: 0, empaque: 0, completado: 0 };
    queue.forEach(item => {
      if (counts[item.phase] !== undefined) counts[item.phase]++;
    });

    const activeItems = queue.filter(item => item.phase !== 'completado');

    const elCorte = document.getElementById('phase-count-corte');
    if (elCorte) elCorte.textContent = counts.corte;
    const elCostura = document.getElementById('phase-count-costura');
    if (elCostura) elCostura.textContent = counts.costura;
    const elBordado = document.getElementById('phase-count-bordado');
    if (elBordado) elBordado.textContent = counts.bordado;
    const elCalidad = document.getElementById('phase-count-calidad');
    if (elCalidad) elCalidad.textContent = counts.calidad;
    const elEmpaque = document.getElementById('phase-count-empaque');
    if (elEmpaque) elEmpaque.textContent = counts.empaque;

    const elTotal = document.getElementById('prod-queue-total-count');
    if (elTotal) elTotal.textContent = activeItems.length;

    const elTabCount = document.getElementById('workshop-production-count');
    if (elTabCount) elTabCount.textContent = activeItems.length;

    if (!listContainer) return;

    if (queue.length === 0) {
      listContainer.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--text-secondary); padding:2rem;">No hay piezas en cola de confección. Agregá una con el botón "+ Nueva Pieza a Producción".</p>';
      return;
    }

    const phaseLabels = {
      corte: '1. Corte de Patrones',
      costura: '2. Costura & Confección',
      bordado: '3. Bordado / Detalle',
      calidad: '4. Calidad & Planchado',
      empaque: '5. Empaque & Despacho',
      completado: '✓ Confección Finalizada'
    };

    const phasePct = {
      corte: 20,
      costura: 40,
      bordado: 60,
      calidad: 80,
      empaque: 95,
      completado: 100
    };

    const nextPhaseName = {
      corte: 'Avanzar a Costura ➔',
      costura: 'Avanzar a Bordado ➔',
      bordado: 'Avanzar a Calidad ➔',
      calidad: 'Avanzar a Empaque ➔',
      empaque: 'Finalizar Pieza ✓',
      completado: 'Completado'
    };

    listContainer.innerHTML = queue.map(item => {
      const isDone = item.phase === 'completado';
      const pct = phasePct[item.phase] || 20;
      return `
        <div class="production-item-card" data-prod-id="${item.id}">
          <div class="prod-card-top">
            <div>
              <h4 class="prod-card-title">${item.productName}</h4>
              <div class="prod-card-client">👤 Clienta: <strong>${item.clientName}</strong> &middot; Ref: ${item.orderId}</div>
            </div>
            <span class="prod-phase-badge prod-phase-badge--${item.phase}">${phaseLabels[item.phase] || item.phase}</span>
          </div>

          <div class="prod-card-details">
            <div>🧵 <strong>Insumo:</strong> ${item.fabric} (${item.metersRequired}m)</div>
            <div>📅 <strong>Entrega pactada:</strong> ${item.targetDate} &middot; Inicio: ${item.assignedDate}</div>
            ${item.notes ? `<div>📝 <em>${item.notes}</em></div>` : ''}
          </div>

          <div class="prod-card-progress">
            <div style="display:flex; justify-content:space-between; font-size:0.72rem; color:var(--text-secondary);">
              <span>Avance de taller</span>
              <strong>${pct}%</strong>
            </div>
            <div class="prod-progress-bar-bg">
              <div class="prod-progress-bar-fill" style="width:${pct}%;"></div>
            </div>
          </div>

          <div class="prod-card-actions">
            ${!isDone ? `
              <button type="button" class="btn-advance-phase" data-prod-id="${item.id}">
                ${nextPhaseName[item.phase]}
              </button>
            ` : `
              <span style="font-size:0.75rem; color:#065F46; font-weight:700;">✓ Lista para entregar</span>
            `}
            <button type="button" class="btn-delete-prod" data-prod-id="${item.id}" title="Eliminar de la cola de confección">
              🗑️ Quitar
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Event listeners para avanzar fase y eliminar
    listContainer.querySelectorAll('.btn-advance-phase').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-prod-id');
        const updated = window.WorkshopDB.advanceProductionPhase(id);
        if (updated) {
          showToast(`Pieza avanzada a: ${phaseLabels[updated.phase] || updated.phase}`);
          renderWorkshopProduction();
          renderWorkshopDashboard();
          updateWorkshopCounters();
        }
      });
    });

    listContainer.querySelectorAll('.btn-delete-prod').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-prod-id');
        if (confirm('¿Quitar esta pieza de la cola de confección?')) {
          window.WorkshopDB.deleteProductionItem(id);
          showToast('Pieza quitada de confección.');
          renderWorkshopProduction();
          renderWorkshopDashboard();
          updateWorkshopCounters();
        }
      });
    });

    // Formulario de ingreso a producción
    wireAddProductionForm();
  }

  function wireAddProductionForm() {
    const toggleBtn = document.getElementById('btn-toggle-add-production');
    const cancelBtn = document.getElementById('btn-cancel-add-production');
    const box = document.getElementById('production-add-box');
    const form = document.getElementById('workshop-add-production-form');

    if (toggleBtn && !toggleBtn.hasAttribute('data-bound')) {
      toggleBtn.setAttribute('data-bound', 'true');
      toggleBtn.addEventListener('click', () => {
        if (box) box.style.display = box.style.display === 'none' ? 'block' : 'none';
      });
    }

    if (cancelBtn && !cancelBtn.hasAttribute('data-bound')) {
      cancelBtn.setAttribute('data-bound', 'true');
      cancelBtn.addEventListener('click', () => {
        if (box) box.style.display = 'none';
      });
    }

    if (form && !form.hasAttribute('data-bound')) {
      form.setAttribute('data-bound', 'true');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const productName = document.getElementById('prod-in-name').value.trim();
        const clientName = document.getElementById('prod-in-client').value.trim();
        const fabric = document.getElementById('prod-in-fabric').value.trim();
        const phase = document.getElementById('prod-in-phase').value;
        const targetDate = document.getElementById('prod-in-target').value.trim() || 'A coordinar';
        const notes = document.getElementById('prod-in-notes').value.trim();

        window.WorkshopDB.addProductionItem({
          productName,
          clientName,
          fabric,
          phase,
          targetDate,
          notes
        });

        form.reset();
        if (box) box.style.display = 'none';
        showToast('Pieza ingresada a la cola de confección.');
        renderWorkshopProduction();
        renderWorkshopDashboard();
        updateWorkshopCounters();
      });
    }
  }

  // TAB 1: RENDER DE PEDIDOS & ENTREGAS (FECHA ESTIMADA, ESTADOS Y NOTA PARA LA CLIENTA)
  function renderWorkshopOrders() {
    const listContainer = document.getElementById('workshop-orders-list');
    const emptyMsg = document.getElementById('elena-orders-empty');
    if (!listContainer || !window.WorkshopDB) return;

    const allOrders = window.WorkshopDB.getOrders();
    if (allOrders.length === 0) {
      if (emptyMsg) emptyMsg.style.display = 'block';
      listContainer.innerHTML = '';
      return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';

    listContainer.innerHTML = allOrders.map(ord => {
      const cleanPhone = (ord.customer.phone || '').replace(/[^0-9]/g, '');
      const replyMsg = `¡Hola ${ord.customer.name}! Te escribo del taller de Divina Locura Deco por tu pedido #${ord.id} 🌸`;
      const waReplyUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(replyMsg)}`;

      return `
        <div class="workshop-order-card" data-order-id="${ord.id}">
          <div class="workshop-order-top">
            <div>
              <div class="workshop-order-cust-name">
                <span>👤 ${ord.customer.name}</span>
                <span class="client-order-badge">${ord.status || 'Pendiente de Confirmación'}</span>
              </div>
              <div class="workshop-order-meta">
                📱 WhatsApp: <strong>${ord.customer.phone}</strong> 
                ${ord.customer.email ? `&middot; ✉️ ${ord.customer.email}` : ''}
                ${ord.customer.address ? `&middot; 📍 Entrega: <strong>${ord.customer.address}</strong>` : ''}
              </div>
            </div>
            <div style="text-align:right; font-size:0.8rem; color:var(--text-muted);">
              <strong>Pedido #${ord.id}</strong><br>
              ${ord.date} a las ${ord.time}
            </div>
          </div>

          <div class="workshop-order-items-box">
            <strong>Piezas encargadas (${ord.totalCount}):</strong>
            <ul>
              ${(ord.items || []).map(i => `
                <li><strong>${i.qty}x ${i.title}</strong> (${i.price})${i.note ? ` — <em>Nota de personalización: "${i.note}"</em>` : ''}</li>
              `).join('')}
            </ul>
          </div>

          <!-- Panel de Control para Elena: Estado, Fecha y Mensaje a la Clienta -->
          <div class="workshop-order-ctrl-grid">
            <div>
              <label class="workshop-field-label">Estado de Confección:</label>
              <select class="workshop-select ctrl-order-status" data-ord-id="${ord.id}">
                <option value="Pendiente de Confirmación" ${ord.status === 'Pendiente de Confirmación' ? 'selected' : ''}>⏳ Pendiente de Confirmación</option>
                <option value="Cortando Telas" ${ord.status === 'Cortando Telas' ? 'selected' : ''}>✂️ Cortando Telas &amp; Prelavado</option>
                <option value="En Confección" ${ord.status === 'En Confección' ? 'selected' : ''}>🧵 En Confección a Fuego Lento</option>
                <option value="Listo para Entrega" ${ord.status === 'Listo para Entrega' ? 'selected' : ''}>📦 Listo para Retirar / Enviar</option>
                <option value="Entregado" ${ord.status === 'Entregado' ? 'selected' : ''}>✅ Entregado / Finalizado</option>
              </select>

              <label class="workshop-field-label" style="margin-top:0.65rem;">Fecha Estimada de Entrega / Despacho:</label>
              <input type="text" class="workshop-input ctrl-order-date" data-ord-id="${ord.id}" value="${ord.estimatedDelivery || ''}" placeholder="Ej: 18 de Noviembre / En 4 días" />
            </div>

            <div>
              <label class="workshop-field-label">Aviso / Mensaje de Elena para la Clienta:</label>
              <textarea class="workshop-textarea ctrl-order-note" data-ord-id="${ord.id}" placeholder="Escribile un aviso (ej: Telas cortadas, te aviso cuando esté empaquetado)...">${ord.workshopNote || ''}</textarea>
            </div>
          </div>

          <div class="workshop-order-foot">
            <div class="workshop-actions-left">
              <button type="button" class="btn-workshop-save btn-save-order-changes" data-ord-id="${ord.id}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>Guardar Cambios del Pedido</span>
              </button>
              <button type="button" class="btn-workshop-chat btn-open-order-chat" data-phone="${cleanPhone}">
                <span>💬 Abrir Chat con Clienta</span>
              </button>
              <a href="${waReplyUrl}" target="_blank" rel="noopener noreferrer" class="btn btn--secondary" style="font-size:0.8rem; padding:0.5rem 0.85rem; display:inline-flex; align-items:center; gap:0.35rem;">
                <span>📱 WhatsApp</span>
              </a>
            </div>

            <button type="button" class="btn btn--admin-logout btn-delete-order" data-ord-id="${ord.id}" style="padding:0.4rem 0.75rem; font-size:0.75rem;">
              Archivar
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Listener Guardar Cambios de Pedido
    listContainer.querySelectorAll('.btn-save-order-changes').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.getAttribute('data-ord-id');
        const card = listContainer.querySelector(`[data-order-id="${orderId}"]`);
        if (!card) return;

        const newStatus = card.querySelector('.ctrl-order-status').value;
        const newDelivery = card.querySelector('.ctrl-order-date').value.trim();
        const newNote = card.querySelector('.ctrl-order-note').value.trim();

        window.WorkshopDB.updateOrder(orderId, {
          status: newStatus,
          estimatedDelivery: newDelivery,
          workshopNote: newNote
        });

        // Actualizar pedidos locales y clienta
        orders = window.WorkshopDB.getOrders();
        updateClientUi();
        updateWorkshopCounters();
        renderWorkshopOrders();
        showToast(`Pedido #${orderId} actualizado con éxito.`);
      });
    });

    // Listener Abrir Chat desde Pedido
    listContainer.querySelectorAll('.btn-open-order-chat').forEach(btn => {
      btn.addEventListener('click', () => {
        const phone = btn.getAttribute('data-phone');
        activeChatPhone = phone;
        switchWorkshopTab('chat');
      });
    });

    // Listener Archivar Pedido
    listContainer.querySelectorAll('.btn-delete-order').forEach(btn => {
      btn.addEventListener('click', () => {
        const orderId = btn.getAttribute('data-ord-id');
        if (confirm(`¿Querés archivar el pedido #${orderId}?`)) {
          window.WorkshopDB.deleteOrder(orderId);
          orders = window.WorkshopDB.getOrders();
          updateClientUi();
          updateWorkshopCounters();
          renderWorkshopOrders();
          showToast('Pedido archivado.');
        }
      });
    });
  }

  // TAB 2: DIRECTORIO DE CLIENTAS
  function renderWorkshopClients() {
    const clientsContainer = document.getElementById('workshop-clients-list');
    if (!clientsContainer || !window.WorkshopDB) return;

    const clients = window.WorkshopDB.getClients();
    if (clients.length === 0) {
      clientsContainer.innerHTML = '<p style="color:var(--text-muted); font-style:italic;">No hay clientas registradas todavía.</p>';
      return;
    }

    clientsContainer.innerHTML = clients.map(c => {
      const cleanPhone = (c.phone || '').replace(/[^0-9]/g, '');
      const waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(`¡Hola ${c.name}! Te escribo de Divina Locura Deco 🌸`)}`;

      return `
        <div class="workshop-client-card">
          <div>
            <div class="workshop-client-card__name">👤 ${c.name}</div>
            <span class="workshop-client-card__orders-count">🧺 ${c.totalOrders || 1} pedido(s) realizados</span>
            <div class="workshop-client-card__info">
              <div>📱 <strong>${c.phone}</strong></div>
              <div>✉️ ${c.email || 'No registrado'}</div>
              <div>📍 ${c.address || 'Entrega a convenir'}</div>
              <div style="font-size:0.72rem; color:var(--text-muted); margin-top:0.35rem;">Registrada: ${c.registeredAt}</div>
              ${c.notes ? `<div style="font-size:0.75rem; background:#FAF8F5; padding:0.4rem; border-radius:4px; margin-top:0.35rem;"><em>Nota: "${c.notes}"</em></div>` : ''}
            </div>
          </div>

          <div class="workshop-client-actions">
            <button type="button" class="btn-workshop-chat btn-client-chat-link" data-phone="${cleanPhone}" style="flex:1; justify-content:center; font-size:0.78rem;">
              <span>💬 Chat Interno</span>
            </button>
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn btn--secondary" style="flex:1; text-align:center; font-size:0.78rem; padding:0.5rem;">
              <span>📱 WhatsApp</span>
            </a>
          </div>
        </div>
      `;
    }).join('');

    // Salto al chat desde el directorio
    clientsContainer.querySelectorAll('.btn-client-chat-link').forEach(btn => {
      btn.addEventListener('click', () => {
        activeChatPhone = btn.getAttribute('data-phone');
        switchWorkshopTab('chat');
      });
    });
  }

  // TAB 3: CHAT INTERNO ENTRE CLIENTAS Y ELENA
  function renderWorkshopChat(preferredPhone = null) {
    const convsList = document.getElementById('workshop-chat-conversations-list');
    const messagesArea = document.getElementById('workshop-chat-messages');
    const activeNameEl = document.getElementById('workshop-chat-active-name');
    const activePhoneEl = document.getElementById('workshop-chat-active-phone');
    const waShortcut = document.getElementById('workshop-chat-wa-shortcut');
    const chatForm = document.getElementById('workshop-chat-form');
    const quickReplies = document.getElementById('workshop-quick-replies');

    if (!convsList || !messagesArea || !window.WorkshopDB) return;

    const chats = window.WorkshopDB.getChats();
    const clients = window.WorkshopDB.getClients();

    // Reunir teléfonos con mensajes o de clientas conocidas
    const allPhones = Array.from(new Set([
      ...Object.keys(chats),
      ...clients.map(c => c.phone.replace(/[^0-9]/g, ''))
    ])).filter(Boolean);

    if (allPhones.length === 0) {
      convsList.innerHTML = '<div style="padding:1rem; font-size:0.8rem; color:var(--text-muted);">No hay conversaciones aún.</div>';
      return;
    }

    if (!activeChatPhone || !allPhones.includes(activeChatPhone)) {
      activeChatPhone = preferredPhone && allPhones.includes(preferredPhone) ? preferredPhone : allPhones[0];
    }

    // Render lista lateral de conversaciones
    convsList.innerHTML = allPhones.map(phone => {
      const clientObj = clients.find(c => c.phone.replace(/[^0-9]/g, '') === phone);
      const name = clientObj ? clientObj.name : `Clienta (${phone})`;
      const msgs = chats[phone] || [];
      const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
      const isSelected = phone === activeChatPhone;

      return `
        <div class="workshop-chat-user-item ${isSelected ? 'is-active' : ''}" data-chat-phone="${phone}">
          <div class="workshop-chat-user-item__name">
            <span>🌸 ${name}</span>
            <span style="font-size:0.68rem; color:var(--text-muted); font-weight:normal;">${lastMsg ? lastMsg.timestamp.split(' ')[1] || '' : ''}</span>
          </div>
          <div class="workshop-chat-user-item__snippet">
            ${lastMsg ? `${lastMsg.sender === 'elena' ? 'Tú: ' : ''}${lastMsg.text}` : 'Sin mensajes'}
          </div>
        </div>
      `;
    }).join('');

    // Listener para cambiar de conversación
    convsList.querySelectorAll('.workshop-chat-user-item').forEach(item => {
      item.addEventListener('click', () => {
        activeChatPhone = item.getAttribute('data-chat-phone');
        renderWorkshopChat(activeChatPhone);
      });
    });

    // Render mensajes de la conversación activa
    const activeClient = clients.find(c => c.phone.replace(/[^0-9]/g, '') === activeChatPhone);
    const activeClientName = activeClient ? activeClient.name : `Clienta (${activeChatPhone})`;

    if (activeNameEl) activeNameEl.textContent = `🌸 ${activeClientName}`;
    if (activePhoneEl) activePhoneEl.textContent = `WhatsApp: ${activeChatPhone}`;
    if (waShortcut) {
      waShortcut.style.display = 'inline-flex';
      waShortcut.href = `https://api.whatsapp.com/send?phone=${activeChatPhone}&text=${encodeURIComponent(`Hola ${activeClientName}! Te escribo desde el taller de Divina Locura 🌸`)}`;
    }
    if (chatForm) chatForm.style.display = 'flex';
    if (quickReplies) quickReplies.style.display = 'flex';

    const activeMsgs = chats[activeChatPhone] || [];
    if (activeMsgs.length === 0) {
      messagesArea.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem; text-align:center; margin:auto;">Iniciá la conversación con esta clienta.</p>';
    } else {
      messagesArea.innerHTML = activeMsgs.map(m => {
        const isElena = m.sender === 'elena';
        return `
          <div class="chat-bubble-item ${isElena ? 'chat-bubble-item--elena' : 'chat-bubble-item--client'}">
            <div style="font-weight:700; font-size:0.75rem; margin-bottom:0.15rem;">
              ${isElena ? '🌸 Elena (Taller)' : `👤 ${m.senderName || activeClientName}`}
            </div>
            <div>${m.text}</div>
            <div class="chat-bubble-meta">${m.timestamp}</div>
          </div>
        `;
      }).join('');
      messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    // Input enviar mensaje
    const chatInput = document.getElementById('workshop-chat-input');
    if (chatForm && !chatForm.hasAttribute('data-bound')) {
      chatForm.setAttribute('data-bound', 'true');
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text || !activeChatPhone) return;

        window.WorkshopDB.sendMessage(activeChatPhone, text, 'elena', 'Elena (Taller)');
        chatInput.value = '';
        renderWorkshopChat(activeChatPhone);
        updateClientUi();
        updateWorkshopCounters();
      });
    }

    // Respuestas rápidas para Elena
    if (quickReplies && !quickReplies.hasAttribute('data-bound')) {
      quickReplies.setAttribute('data-bound', 'true');
      quickReplies.querySelectorAll('.btn-quick-reply').forEach(btn => {
        btn.addEventListener('click', () => {
          const quickText = btn.getAttribute('data-quick');
          if (chatInput) {
            chatInput.value = quickText;
            chatInput.focus();
          }
        });
      });
    }
  }

  // TAB 4: CONTROL DE STOCK & TELAS
  function renderWorkshopStock() {
    const productsContainer = document.getElementById('workshop-products-stock-list');
    const materialsContainer = document.getElementById('workshop-materials-list');
    if (!productsContainer || !materialsContainer || !window.WorkshopDB) return;

    // 1. Stock de Piezas Terminadas
    const pStock = window.WorkshopDB.getProductStock();
    productsContainer.innerHTML = pStock.map(p => {
      const pData = products.find(prod => prod.id === p.id) || { title: p.title };
      const imgSrc = (pData.images && pData.images[0]) ? pData.images[0].src : 'assets/images/hero-textile.jpg';

      return `
        <div class="workshop-stock-card" data-prod-id="${p.id}">
          <div style="display:flex; gap:0.75rem; align-items:center;">
            <img src="${imgSrc}" alt="${p.title}" style="width:48px; height:48px; border-radius:4px; object-fit:cover; border:1px solid var(--border-light);" />
            <div>
              <div class="workshop-stock-card__title">${p.title}</div>
              <span class="client-order-badge" style="font-size:0.65rem;">${p.status || 'Entrega Inmediata'}</span>
            </div>
          </div>

          <div class="workshop-stock-card__controls">
            <span style="font-size:0.8rem; color:var(--text-secondary);">Stock listo:</span>
            <div class="workshop-qty-pill">
              <button type="button" class="workshop-qty-btn btn-stock-dec" data-prod-id="${p.id}">-</button>
              <span class="workshop-qty-val" id="stock-val-${p.id}">${p.inStock}</span>
              <button type="button" class="workshop-qty-btn btn-stock-inc" data-prod-id="${p.id}">+</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Listeners sumar/restar stock productos
    productsContainer.querySelectorAll('.btn-stock-dec').forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = btn.getAttribute('data-prod-id');
        const item = pStock.find(s => s.id === pId);
        if (item) {
          const newQty = Math.max(0, (item.inStock || 0) - 1);
          window.WorkshopDB.updateProductStock(pId, newQty);
          const valEl = document.getElementById(`stock-val-${pId}`);
          if (valEl) valEl.textContent = newQty;
          showToast(`Stock de "${item.title}": ${newQty} un.`);
        }
      });
    });

    productsContainer.querySelectorAll('.btn-stock-inc').forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = btn.getAttribute('data-prod-id');
        const item = pStock.find(s => s.id === pId);
        if (item) {
          const newQty = (item.inStock || 0) + 1;
          window.WorkshopDB.updateProductStock(pId, newQty);
          const valEl = document.getElementById(`stock-val-${pId}`);
          if (valEl) valEl.textContent = newQty;
          showToast(`Stock de "${item.title}": ${newQty} un.`);
        }
      });
    });

    // 2. Stock de Telas & Insumos
    const materials = window.WorkshopDB.getMaterials();
    materialsContainer.innerHTML = materials.map(m => `
      <tr data-mat-id="${m.id}">
        <td><strong>${m.name}</strong></td>
        <td><span class="client-order-badge" style="background:#FAF8F5; color:var(--text-secondary);">${m.category}</span></td>
        <td><strong style="font-size:0.95rem;">${m.qty}</strong> ${m.unit}</td>
        <td>
          <div style="display:flex; gap:0.35rem;">
            <button type="button" class="btn btn--secondary btn-mat-adjust" data-mat-id="${m.id}" data-delta="-1" style="padding:0.25rem 0.5rem; font-size:0.75rem;">-1</button>
            <button type="button" class="btn btn--secondary btn-mat-adjust" data-mat-id="${m.id}" data-delta="1" style="padding:0.25rem 0.5rem; font-size:0.75rem;">+1</button>
            <button type="button" class="btn btn--secondary btn-mat-adjust" data-mat-id="${m.id}" data-delta="5" style="padding:0.25rem 0.5rem; font-size:0.75rem;">+5</button>
          </div>
        </td>
        <td>
          <button type="button" class="btn btn--admin-logout btn-mat-del" data-mat-id="${m.id}" style="padding:0.25rem 0.6rem; font-size:0.72rem;">Eliminar</button>
        </td>
      </tr>
    `).join('');

    materialsContainer.querySelectorAll('.btn-mat-adjust').forEach(btn => {
      btn.addEventListener('click', () => {
        const matId = btn.getAttribute('data-mat-id');
        const delta = parseFloat(btn.getAttribute('data-delta'));
        window.WorkshopDB.updateMaterialQty(matId, delta, true);
        renderWorkshopStock();
      });
    });

    materialsContainer.querySelectorAll('.btn-mat-del').forEach(btn => {
      btn.addEventListener('click', () => {
        const matId = btn.getAttribute('data-mat-id');
        if (confirm('¿Eliminar este insumo del taller?')) {
          window.WorkshopDB.deleteMaterial(matId);
          renderWorkshopStock();
          showToast('Insumo eliminado.');
        }
      });
    });

    // Form Agregar Insumo
    const formAddMat = document.getElementById('workshop-add-material-form');
    if (formAddMat && !formAddMat.hasAttribute('data-bound')) {
      formAddMat.setAttribute('data-bound', 'true');
      formAddMat.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('mat-add-name').value.trim();
        const category = document.getElementById('mat-add-category').value;
        const qty = parseFloat(document.getElementById('mat-add-qty').value) || 0;
        const unit = document.getElementById('mat-add-unit').value;

        window.WorkshopDB.addMaterial({ name, category, qty, unit });
        formAddMat.reset();
        renderWorkshopStock();
        showToast(`Insumo "${name}" guardado.`);
      });
    }
  }

  // TAB 5: BALANCE DE CONFECCIÓN & TALLER (ECONOMÍA ARTESANAL PROPIA)
  let currentSelectedFinancesMonth = 'all';

  function renderWorkshopFinances(monthToSelect) {
    if (!window.WorkshopDB) return;

    if (monthToSelect) {
      currentSelectedFinancesMonth = monthToSelect;
    }

    // 1. Selector de Meses
    const monthSelectEl = document.getElementById('fjc-select-month');
    if (monthSelectEl) {
      const availableMonths = window.WorkshopDB.getAvailableMonths();
      const currentVal = currentSelectedFinancesMonth;
      monthSelectEl.innerHTML = availableMonths.map(m => `
        <option value="${m.value}" ${m.value === currentVal ? 'selected' : ''}>${m.label}</option>
      `).join('');

      if (!monthSelectEl.hasAttribute('data-bound')) {
        monthSelectEl.setAttribute('data-bound', 'true');
        monthSelectEl.addEventListener('change', () => {
          currentSelectedFinancesMonth = monthSelectEl.value;
          renderWorkshopFinances(currentSelectedFinancesMonth);
        });
      }
    }

    // 2. Obtener Resumen Financiero Filtrado
    const summary = window.WorkshopDB.getFinancialSummary(currentSelectedFinancesMonth);

    // 3. Hero Panel: Balance Neto Real
    const netBalanceEl = document.getElementById('fjc-net-balance');
    const netAmountEl = document.getElementById('fjc-net-amount');
    const netSymbolEl = document.getElementById('fjc-net-symbol');
    const marginValEl = document.getElementById('fjc-margin-val');
    const ordersCountValEl = document.getElementById('fjc-orders-count-val');
    const budgetStatusChipText = document.getElementById('fjc-budget-status-chip-text');

    if (netBalanceEl && netAmountEl) {
      const isPositive = summary.netProfit >= 0;
      netBalanceEl.classList.toggle('bien', isPositive);
      netBalanceEl.classList.toggle('mal', !isPositive);
      if (netSymbolEl) netSymbolEl.textContent = isPositive ? '$' : '-$';
      netAmountEl.textContent = Math.abs(summary.netProfit).toLocaleString('es-AR');
    }

    if (marginValEl) marginValEl.textContent = `${summary.profitMargin}%`;
    if (ordersCountValEl) ordersCountValEl.textContent = summary.totalOrdersCount;
    if (budgetStatusChipText) {
      if (summary.budgetStatus === 'danger') {
        budgetStatusChipText.innerHTML = '🚨 Presupuesto: <strong>Excedido</strong>';
      } else if (summary.budgetStatus === 'warning') {
        budgetStatusChipText.innerHTML = '⚠️ Presupuesto: <strong>Cerca del Límite</strong>';
      } else {
        budgetStatusChipText.innerHTML = '🌿 Presupuesto: <strong>Controlado</strong>';
      }
    }

    // 4. Rejilla de 4 KPIs
    const kpiIncome = document.getElementById('fjc-kpi-income');
    const kpiIncomeSub = document.getElementById('fjc-kpi-income-sub');
    const kpiFabric = document.getElementById('fjc-kpi-fabric');
    const kpiFabricSub = document.getElementById('fjc-kpi-fabric-sub');
    const kpiExpenses = document.getElementById('fjc-kpi-expenses');
    const kpiExpensesSub = document.getElementById('fjc-kpi-expenses-sub');
    const kpiProfitRatio = document.getElementById('fjc-kpi-profit-ratio');
    const kpiProfitSub = document.getElementById('fjc-kpi-profit-sub');

    if (kpiIncome) kpiIncome.textContent = `$ ${summary.totalIncome.toLocaleString('es-AR')}`;
    if (kpiIncomeSub) kpiIncomeSub.textContent = `${summary.totalOrdersCount} pedido${summary.totalOrdersCount === 1 ? '' : 's'} confeccionado${summary.totalOrdersCount === 1 ? '' : 's'}`;

    if (kpiFabric) kpiFabric.textContent = `${summary.fabricConsumption.totalMeters} m`;
    if (kpiFabricSub) kpiFabricSub.textContent = `${summary.fabricConsumption.piecesFinished} pieza${summary.fabricConsumption.piecesFinished === 1 ? '' : 's'} confeccionada${summary.fabricConsumption.piecesFinished === 1 ? '' : 's'}`;

    if (kpiExpenses) kpiExpenses.textContent = `$ ${summary.totalExpenses.toLocaleString('es-AR')}`;
    if (kpiExpensesSub) kpiExpensesSub.textContent = `${summary.totalExpensesCount} gasto${summary.totalExpensesCount === 1 ? '' : 's'} registrado${summary.totalExpensesCount === 1 ? '' : 's'}`;

    if (kpiProfitRatio) kpiProfitRatio.textContent = `${summary.profitMargin}%`;
    if (kpiProfitSub) kpiProfitSub.textContent = `Utilidad neta sobre ventas`;

    // 5. Límites de Consumo & Presupuesto
    const budgetDisplayEl = document.getElementById('fjc-budget-display');
    const budgetUsedEl = document.getElementById('fjc-budget-used');
    const budgetTotalEl = document.getElementById('fjc-budget-total');
    const budgetPercentageEl = document.getElementById('fjc-budget-percentage');
    const budgetBarEl = document.getElementById('fjc-budget-bar');
    const budgetStatusTextEl = document.getElementById('fjc-budget-status-text');

    if (budgetDisplayEl) budgetDisplayEl.textContent = `$ ${summary.budgetLimit.toLocaleString('es-AR')} ARS`;
    if (budgetUsedEl) budgetUsedEl.textContent = `$ ${summary.totalExpenses.toLocaleString('es-AR')}`;
    if (budgetTotalEl) budgetTotalEl.textContent = `$ ${summary.budgetLimit.toLocaleString('es-AR')}`;
    if (budgetPercentageEl) budgetPercentageEl.textContent = `${summary.budgetPercent}%`;

    if (budgetBarEl) {
      budgetBarEl.style.width = `${Math.min(100, summary.budgetPercent)}%`;
      budgetBarEl.className = 'fjc-progress-fill';
      if (summary.budgetStatus === 'danger') {
        budgetBarEl.classList.add('fjc-progress-fill--danger');
      } else if (summary.budgetStatus === 'warning') {
        budgetBarEl.classList.add('fjc-progress-fill--warning');
      } else {
        budgetBarEl.classList.add('fjc-progress-fill--ok');
      }
    }

    if (budgetStatusTextEl) {
      budgetStatusTextEl.textContent = `${summary.budgetBadgeText} (Tope: $ ${summary.budgetLimit.toLocaleString('es-AR')} ARS)`;
    }

    // Botón Ajustar Presupuesto
    const btnEditBudget = document.getElementById('btn-fjc-edit-budget');
    if (btnEditBudget && !btnEditBudget.hasAttribute('data-bound')) {
      btnEditBudget.setAttribute('data-bound', 'true');
      btnEditBudget.addEventListener('click', () => {
        const current = window.WorkshopDB.getBudget();
        const input = prompt('Definir nuevo tope de consumo mensual ($ ARS):', current);
        if (input !== null) {
          const val = parseFloat(input);
          if (!isNaN(val) && val >= 0) {
            window.WorkshopDB.setBudget(val);
            renderWorkshopFinances(currentSelectedFinancesMonth);
            showToast(`Tope mensual actualizado a $ ${val.toLocaleString('es-AR')} ARS.`);
          }
        }
      });
    }

    // 6. Reparto de Gastos por Categoría (Barra Segmentada)
    const repartoBarEl = document.getElementById('fjc-reparto-bar');
    const categoriesListEl = document.getElementById('fjc-categories-list');

    if (repartoBarEl && categoriesListEl) {
      if (summary.categoryPercentages.length === 0) {
        repartoBarEl.innerHTML = '<div style="width:100%; height:100%; background:#E2E8F0;"></div>';
        categoriesListEl.innerHTML = '<div style="font-size:0.8rem; color:var(--text-muted); grid-column:1/-1;">Sin gastos registrados en este período.</div>';
      } else {
        repartoBarEl.innerHTML = summary.categoryPercentages.map(cat => `
          <div class="fjc-bar-segment" style="width:${cat.percent}%; background:${cat.color};" data-tooltip="${cat.category}: $${cat.amount.toLocaleString('es-AR')} (${cat.percent}%)" title="${cat.category}: $${cat.amount.toLocaleString('es-AR')} (${cat.percent}%)"></div>
        `).join('');

        categoriesListEl.innerHTML = summary.categoryPercentages.map(cat => `
          <div class="fjc-cat-chip">
            <div class="fjc-cat-chip-left">
              <span class="fjc-cat-dot" style="background:${cat.color};"></span>
              <strong>${cat.category}</strong>
            </div>
            <div>
              <span style="font-weight:700;">$ ${cat.amount.toLocaleString('es-AR')}</span>
              <small style="color:var(--text-muted); font-size:0.7rem; margin-left:0.25rem;">(${cat.percent}%)</small>
            </div>
          </div>
        `).join('');
      }
    }

    // 7. Consumo de Insumos & Trazabilidad Textil
    const fabricsGridEl = document.getElementById('fjc-fabrics-breakdown');
    if (fabricsGridEl) {
      const fc = summary.fabricConsumption;
      fabricsGridEl.innerHTML = `
        <div class="fjc-fabric-card">
          <div class="fjc-fabric-card__title">🌸 Satén Anti-frizz de Seda</div>
          <div class="fjc-fabric-card__meters">${fc.satinMeters} metros</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">Consumo en cofias regulables, scrunchies y fundas.</div>
        </div>
        <div class="fjc-fabric-card">
          <div class="fjc-fabric-card__title">🌾 Lino Puro Lavado Crudo</div>
          <div class="fjc-fabric-card__meters">${fc.linenMeters} metros</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">Consumo en cestos reversibles, neceseres y portarrollos.</div>
        </div>
        <div class="fjc-fabric-card">
          <div class="fjc-fabric-card__title">🧇 Nido de Abeja (Waffle)</div>
          <div class="fjc-fabric-card__meters">${fc.waffleMeters} metros</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">Consumo en repasadores rústicos de alta absorción.</div>
        </div>
      `;
    }

    // 8. Tabla de Movimientos / Gastos Filtrada
    const expensesContainer = document.getElementById('workshop-expenses-list');
    const expensesCountBadge = document.getElementById('fjc-expenses-count-badge');

    if (expensesCountBadge) {
      expensesCountBadge.textContent = `${summary.totalExpensesCount} gasto${summary.totalExpensesCount === 1 ? '' : 's'} en este período`;
    }

    if (expensesContainer) {
      if (summary.filteredExpenses.length === 0) {
        expensesContainer.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:1.25rem;">No hay gastos registrados en este período.</td></tr>';
      } else {
        expensesContainer.innerHTML = summary.filteredExpenses.map(exp => `
          <tr data-exp-id="${exp.id}">
            <td><strong style="color:var(--text-secondary);">${exp.date}</strong></td>
            <td><strong>${exp.concept}</strong></td>
            <td><span class="client-order-badge" style="background:#FAF8F5; color:var(--text-secondary); border:1px solid var(--border-light);">${exp.category}</span></td>
            <td><strong style="color:#C62828; font-size:0.95rem;">$ ${exp.amount.toLocaleString('es-AR')}</strong></td>
            <td>
              <button type="button" class="btn btn--admin-logout btn-exp-del" data-exp-id="${exp.id}" style="padding:0.25rem 0.6rem; font-size:0.72rem;">Borrar</button>
            </td>
          </tr>
        `).join('');

        expensesContainer.querySelectorAll('.btn-exp-del').forEach(btn => {
          btn.addEventListener('click', () => {
            const expId = btn.getAttribute('data-exp-id');
            if (confirm('¿Borrar este gasto del taller?')) {
              window.WorkshopDB.deleteExpense(expId);
              renderWorkshopFinances(currentSelectedFinancesMonth);
              showToast('Gasto eliminado.');
            }
          });
        });
      }
    }

    // 9. Formulario para Registrar Nuevo Gasto
    const formAddExp = document.getElementById('workshop-add-expense-form');
    if (formAddExp && !formAddExp.hasAttribute('data-bound')) {
      formAddExp.setAttribute('data-bound', 'true');
      const expDateInput = document.getElementById('exp-add-date');
      if (expDateInput) expDateInput.value = new Date().toISOString().split('T')[0];

      formAddExp.addEventListener('submit', (e) => {
        e.preventDefault();
        const date = document.getElementById('exp-add-date').value;
        const concept = document.getElementById('exp-add-concept').value.trim();
        const category = document.getElementById('exp-add-category').value;
        const amount = parseFloat(document.getElementById('exp-add-amount').value) || 0;

        window.WorkshopDB.addExpense({ date, concept, category, amount });
        formAddExp.reset();
        if (expDateInput) expDateInput.value = new Date().toISOString().split('T')[0];
        renderWorkshopFinances(currentSelectedFinancesMonth);
        showToast('Gasto registrado con éxito.');
      });
    }

    // 10. Botones de Respaldo JSON Integral (Divina Locura Deco)
    const btnDownloadBackup = document.getElementById('btn-fjc-download-backup');
    if (btnDownloadBackup && !btnDownloadBackup.hasAttribute('data-bound')) {
      btnDownloadBackup.setAttribute('data-bound', 'true');
      btnDownloadBackup.addEventListener('click', () => {
        const jsonStr = window.WorkshopDB.exportBackupJson();
        const nowStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `respaldo_taller_divina_locura_${nowStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Respaldo del taller descargado con éxito.');
      });
    }

    const restoreInput = document.getElementById('fjc-restore-file-input');
    if (restoreInput && !restoreInput.hasAttribute('data-bound')) {
      restoreInput.setAttribute('data-bound', 'true');
      restoreInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          const res = window.WorkshopDB.importBackupJson(event.target.result);
          if (res.success) {
            orders = window.WorkshopDB.getOrders();
            updateClientUi();
            updateWorkshopCounters();
            renderWorkshopFinances(currentSelectedFinancesMonth);
            showToast('¡Respaldo restaurado correctamente!');
          } else {
            alert('Error al restaurar respaldo: ' + (res.error || 'Formato no reconocido'));
          }
        };
        reader.readAsText(file);
      });
    }
  }

  // Apertura y Cierre del Centro de Gestión de Elena
  function openElenaWorkshopHub(targetTab = 'dashboard') {
    if (elenaOrdersModal) {
      updateWorkshopCounters();
      switchWorkshopTab(targetTab);
      elenaOrdersModal.classList.add('is-open');
      elenaOrdersModal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeElenaWorkshopHub() {
    if (elenaOrdersModal) {
      elenaOrdersModal.classList.remove('is-open');
      elenaOrdersModal.setAttribute('aria-hidden', 'true');
    }
  }

  // Conectar botones de la barra de administración (unificada y compatibilidad)
  if (adminDashboardBtn) {
    adminDashboardBtn.addEventListener('click', () => openElenaWorkshopHub('dashboard'));
  }
  if (adminElenaDashboardBtn) {
    adminElenaDashboardBtn.addEventListener('click', () => openElenaWorkshopHub('dashboard'));
  }
  if (adminJuanmaDashboardBtn) {
    adminJuanmaDashboardBtn.addEventListener('click', () => openElenaWorkshopHub('dashboard'));
  }

  if (adminOrdersBtn) {
    adminOrdersBtn.addEventListener('click', () => openElenaWorkshopHub('orders'));
  }
  if (adminElenaOrdersBtn) {
    adminElenaOrdersBtn.addEventListener('click', () => openElenaWorkshopHub('orders'));
  }
  if (adminJuanmaOrdersBtn) {
    adminJuanmaOrdersBtn.addEventListener('click', () => openElenaWorkshopHub('orders'));
  }

  if (adminProductionBtn) {
    adminProductionBtn.addEventListener('click', () => openElenaWorkshopHub('production'));
  }
  if (adminElenaProductionBtn) {
    adminElenaProductionBtn.addEventListener('click', () => openElenaWorkshopHub('production'));
  }
  if (adminJuanmaProductionBtn) {
    adminJuanmaProductionBtn.addEventListener('click', () => openElenaWorkshopHub('production'));
  }

  if (adminChatBtn) {
    adminChatBtn.addEventListener('click', () => openElenaWorkshopHub('chat'));
  }
  if (adminElenaChatBtn) {
    adminElenaChatBtn.addEventListener('click', () => openElenaWorkshopHub('chat'));
  }
  if (adminJuanmaChatBtn) {
    adminJuanmaChatBtn.addEventListener('click', () => openElenaWorkshopHub('chat'));
  }

  if (adminStockBtn) {
    adminStockBtn.addEventListener('click', () => openElenaWorkshopHub('stock'));
  }
  if (adminElenaStockBtn) {
    adminElenaStockBtn.addEventListener('click', () => openElenaWorkshopHub('stock'));
  }
  if (adminJuanmaStockBtn) {
    adminJuanmaStockBtn.addEventListener('click', () => openElenaWorkshopHub('stock'));
  }

  if (adminFinancesBtn) {
    adminFinancesBtn.addEventListener('click', () => openElenaWorkshopHub('finances'));
  }
  if (adminElenaFinancesBtn) {
    adminElenaFinancesBtn.addEventListener('click', () => openElenaWorkshopHub('finances'));
  }
  if (adminJuanmaFinancesBtn) {
    adminJuanmaFinancesBtn.addEventListener('click', () => openElenaWorkshopHub('finances'));
  }

  if (elenaOrdersCloseBtn) {
    elenaOrdersCloseBtn.addEventListener('click', closeElenaWorkshopHub);
  }

  // Exponer API global
  window.DivinaLocura = {
    openLookbookModal,
    openInstagramModal: openLookbookModal, // Compatibilidad retroactiva
    closeLookbookModal,
    openClientLogin,
    closeClientLogin,
    openTeamAdminLogin,
    closeTeamAdminLogin,
    openAdminLogin: openTeamAdminLogin,
    openCartDrawer,
    closeCartDrawer,
    addToCart,
    openChatbot,
    closeChatbot,
    openElenaTutorial,
    openElenaDashboard: () => openElenaWorkshopHub('dashboard'),
    openElenaOrders: () => openElenaWorkshopHub('orders'),
    openElenaProduction: () => openElenaWorkshopHub('production'),
    openElenaWorkshopHub,
    closeElenaWorkshopHub,
    openProductEditor,
    buildWhatsAppUrl,
    showToast,
    setRole: (role) => {
      currentRole = role;
      if (role) localStorage.setItem(STORAGE_KEY_ROLE, role);
      else localStorage.removeItem(STORAGE_KEY_ROLE);
      updateAdminUi();
    },
    getProducts: () => products,
    getSettings: () => settings,
    getCart: () => cart,
    getOrders: () => (window.WorkshopDB ? window.WorkshopDB.getOrders() : orders),
    renderCatalog
  };

  // Inicializar Interfaz
  if (window.WorkshopDB && typeof window.WorkshopDB.trackVisit === 'function') {
    window.WorkshopDB.trackVisit();
  }
  updateAdminUi();
  updateClientUi();
  updateCartUi();
  updateElenaOrdersBadge();
  updateWorkshopCounters();

  // Sincronización con Google Sheets (catálogo público, pagos de Mercado Pago y estado de pedidos de la clienta)
  if (window.WorkshopDB) {
    if (typeof window.WorkshopDB.pullPublicFromCloud === 'function') {
      window.WorkshopDB.pullPublicFromCloud().then((res) => {
        if (res && res.ok) {
          if (Array.isArray(res.products) && res.products.length > 0) {
            products = res.products;
            renderCatalog();
          }
          if (res.settings && typeof res.settings === 'object') {
            settings = Object.assign({}, settings, res.settings);
            applySystemSettings();
          }
          refreshMercadoPagoButtonVisibility();
        }
      });
    }
    if (typeof window.WorkshopDB.confirmMercadoPagoReturn === 'function') {
      window.WorkshopDB.confirmMercadoPagoReturn().then((payRes) => {
        if (payRes && payRes.ok && payRes.status === 'approved') {
          showToast('🎉 ¡Pago confirmado con éxito! Elena ya recibió el aviso para empezar tu pedido.');
          updateClientUi();
        }
      });
    }
    if (currentCustomer && currentCustomer.phone && typeof window.WorkshopDB.fetchClientCloudData === 'function') {
      window.WorkshopDB.fetchClientCloudData(currentCustomer.phone).then((cRes) => {
        if (cRes && cRes.ok) updateClientUi();
      });
    }
  }
});
