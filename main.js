/**
 * Divina Locura Deco - Sistema Frontend & Modo Administrador
 * Maneja catálogo dinámico, posteo estilo Instagram con carrusel y panel de edición en vivo.
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 1. ESTADO DE DATOS (PRODUCTOS & MODO ADMIN)
  // =========================================================================
  const STORAGE_KEY_PRODUCTS = 'divinalocura_products';
  const STORAGE_KEY_ADMIN = 'divinalocura_admin';
  const DEFAULT_ADMIN_PASS = 'elena2026';

  let products = [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (saved) {
      products = JSON.parse(saved);
    }
  } catch (err) {
    console.warn('Error leyendo productos guardados:', err);
  }

  // Si no hay productos en localStorage, cargar los iniciales de products-data.js
  if (!products || products.length === 0) {
    if (typeof INITIAL_PRODUCTS !== 'undefined') {
      products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    } else {
      products = [];
    }
  }

  let currentCategory = 'todos';
  let isAdmin = localStorage.getItem(STORAGE_KEY_ADMIN) === 'true';

  // Elementos DOM
  const productsGrid = document.getElementById('products-grid');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const categoryTiles = document.querySelectorAll('[data-category-target]');
  const adminBar = document.getElementById('admin-bar');
  const toastContainer = document.getElementById('toast-container');

  // =========================================================================
  // 2. RENDERIZADO DEL CATÁLOGO LOOKBOOK
  // =========================================================================
  function renderCatalog() {
    if (!productsGrid) return;
    productsGrid.innerHTML = '';

    const filtered = products.filter(p => currentCategory === 'todos' || p.category === currentCategory);

    filtered.forEach(product => {
      const card = document.createElement('article');
      card.className = `catalog-item ${product.size === 'large' ? 'catalog-item--large' : 'catalog-item--medium'}`;
      card.setAttribute('data-category', product.category);
      card.setAttribute('data-id', product.id);

      const images = product.images && product.images.length > 0
        ? product.images
        : [{ label: 'Foto Principal', src: 'assets/images/hero-textile.jpg' }];

      const defaultImg = images[0].src;

      // Generar botones de vistas (Pills)
      const pillsHtml = images.map((img, idx) => `
        <button type="button" class="view-pill ${idx === 0 ? 'is-active' : ''}" data-view-src="${img.src}">
          ${img.label || `Vista ${idx + 1}`}
        </button>
      `).join('');

      card.innerHTML = `
        <div class="catalog-item__admin-bar">
          <button type="button" class="btn-card-admin btn-card-admin--edit" data-edit-id="${product.id}" title="Editar este producto">
            ✏️ Editar
          </button>
          <button type="button" class="btn-card-admin btn-card-admin--delete" data-delete-id="${product.id}" title="Eliminar producto">
            🗑️
          </button>
        </div>

        <div class="catalog-item__media" data-open-ig="${product.id}" title="Click para ver posteo estilo Instagram">
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
              <button type="button" class="btn--ig-view" data-open-ig="${product.id}" title="Ver historia y fotos en Instagram">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                <span>Ver Posteo</span>
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
      'cuidado-personal': 'Cuidado Personal',
      'hogar': 'Hogar & Cocina',
      'organizacion': 'Organización & Accesorios',
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
  // 3. EVENTOS DE TARJETAS (MULTIVISTA, WHATSAPP, MODAL IG, EDICIÓN ADMIN)
  // =========================================================================
  function bindCardEvents() {
    // A. Selector de Vistas (Pills)
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

    // B. Enlaces de WhatsApp
    document.querySelectorAll('.btn--whatsapp').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const productName = btn.getAttribute('data-product-name') || 'tus productos';
        const baseMessage = `Hola Elena, quería consultar sobre los productos de Divina Locura. En especial me encantó: "${productName}".`;
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(baseMessage)}`;
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      });
    });

    // C. Abrir Modal de Instagram al hacer click en la foto o en el botón "Ver Posteo"
    document.querySelectorAll('[data-open-ig]').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        if (e.target.closest('.view-pill') || e.target.closest('.btn-card-admin')) return;
        const productId = trigger.getAttribute('data-open-ig');
        openInstagramModal(productId);
      });
    });

    // D. Botones de Administración en Tarjetas
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
  // 4. FILTROS DE CATEGORÍAS
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
    renderCatalog();
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      applyFilter(btn.getAttribute('data-filter'));
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

  // =========================================================================
  // 5. MODAL DE POSTEO ESTILO INSTAGRAM CON CARRUSEL INTERACTIVO
  // =========================================================================
  const igModal = document.getElementById('instagram-post-modal');
  const igTrack = document.getElementById('ig-carousel-track');
  const igDots = document.getElementById('ig-dots');
  const igPrevBtn = document.getElementById('ig-prev-btn');
  const igNextBtn = document.getElementById('ig-next-btn');
  const igHeartPulse = document.getElementById('ig-heart-pulse');
  const igLikeBtn = document.getElementById('ig-like-btn');
  const igLikesText = document.getElementById('ig-likes-text');
  const igCaptionBody = document.getElementById('ig-caption-body');
  const igHashtags = document.getElementById('ig-hashtags');
  const igDate = document.getElementById('ig-date');
  const igCommentsContainer = document.getElementById('ig-comments-container');
  const igWhatsappCta = document.getElementById('ig-whatsapp-cta');
  const igCloseBtn = document.getElementById('ig-close-btn');

  let currentIgProduct = null;
  let currentSlideIndex = 0;
  let totalSlides = 0;

  function openInstagramModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || !igModal) return;

    currentIgProduct = product;
    currentSlideIndex = 0;

    // Configurar carrusel de fotos
    const images = product.images && product.images.length > 0
      ? product.images
      : [{ label: 'Detalle', src: 'assets/images/hero-textile.jpg' }];

    totalSlides = images.length;
    igTrack.innerHTML = '';
    igDots.innerHTML = '';

    images.forEach((img, idx) => {
      const slide = document.createElement('div');
      slide.className = 'ig-carousel-slide';
      slide.innerHTML = `<img src="${img.src}" alt="${img.label || product.title}" loading="lazy" />`;
      igTrack.appendChild(slide);

      const dot = document.createElement('div');
      dot.className = `ig-dot ${idx === 0 ? 'is-active' : ''}`;
      dot.addEventListener('click', () => goToSlide(idx));
      igDots.appendChild(dot);
    });

    updateCarouselView();

    // Textos y metadatos
    const igData = product.instagram || {};
    igCaptionBody.textContent = ` ${igData.caption || product.desc || 'Pieza confeccionada a mano en nuestro taller con amor y dedicación.'}`;
    igHashtags.textContent = igData.hashtags || '#divinalocura #hechoamano #decohogar #artesanal';
    igDate.textContent = igData.date || 'Reciente &middot; Taller Divina Locura';

    const likes = igData.likes || 148;
    igLikesText.textContent = `Les gusta a ${likes} personas`;
    igLikeBtn.classList.remove('is-liked');

    // Comentarios
    igCommentsContainer.innerHTML = '';
    const comments = igData.comments && igData.comments.length > 0
      ? igData.comments
      : [
          { user: 'lucia_deco', text: 'Hermosa confección, se nota la dedicación en cada detalle ✨' },
          { user: 'clara.hogar', text: 'Me encantó la combinación de colores!' }
        ];

    comments.forEach(c => {
      const row = document.createElement('div');
      row.className = 'ig-comment-item';
      row.innerHTML = `<strong class="ig-comment-user">${c.user}</strong> <span class="ig-comment-body">${c.text}</span>`;
      igCommentsContainer.appendChild(row);
    });

    // Botón de WhatsApp
    igWhatsappCta.setAttribute('data-product-name', product.title);

    igModal.classList.add('is-open');
    igModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeInstagramModal() {
    if (!igModal) return;
    igModal.classList.remove('is-open');
    igModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function goToSlide(index) {
    if (index < 0) index = 0;
    if (index >= totalSlides) index = totalSlides - 1;
    currentSlideIndex = index;
    updateCarouselView();
  }

  function updateCarouselView() {
    igTrack.style.transform = `translateX(-${currentSlideIndex * 100}%)`;

    // Actualizar puntos
    const dots = igDots.querySelectorAll('.ig-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === currentSlideIndex);
    });

    // Mostrar/ocultar flechas si hay una sola foto
    if (totalSlides <= 1) {
      igPrevBtn.classList.add('is-hidden');
      igNextBtn.classList.add('is-hidden');
    } else {
      igPrevBtn.classList.toggle('is-hidden', currentSlideIndex === 0);
      igNextBtn.classList.toggle('is-hidden', currentSlideIndex === totalSlides - 1);
    }
  }

  if (igPrevBtn) {
    igPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(currentSlideIndex - 1);
    });
  }

  if (igNextBtn) {
    igNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      goToSlide(currentSlideIndex + 1);
    });
  }

  if (igCloseBtn) {
    igCloseBtn.addEventListener('click', closeInstagramModal);
  }

  if (igModal) {
    igModal.addEventListener('click', (e) => {
      if (e.target === igModal) closeInstagramModal();
    });
  }

  // Interacción de Me Gusta (Corazón y Doble Tap)
  function triggerLike() {
    if (!currentIgProduct) return;
    const isLiked = igLikeBtn.classList.contains('is-liked');
    const baseLikes = (currentIgProduct.instagram && currentIgProduct.instagram.likes) || 148;

    if (!isLiked) {
      igLikeBtn.classList.add('is-liked');
      igLikesText.textContent = `Les gusta a ${baseLikes + 1} personas`;
      
      // Animación de pulso central
      if (igHeartPulse) {
        igHeartPulse.classList.remove('animate');
        void igHeartPulse.offsetWidth; // reiniciar animación
        igHeartPulse.classList.add('animate');
      }
    } else {
      igLikeBtn.classList.remove('is-liked');
      igLikesText.textContent = `Les gusta a ${baseLikes} personas`;
    }
  }

  if (igLikeBtn) {
    igLikeBtn.addEventListener('click', triggerLike);
  }

  const igMediaBox = document.getElementById('ig-media-box');
  if (igMediaBox) {
    let lastTap = 0;
    igMediaBox.addEventListener('click', (e) => {
      if (e.target.closest('.ig-nav-btn') || e.target.closest('.ig-dot')) return;
      const now = new Date().getTime();
      const timesince = now - lastTap;
      if (timesince < 300 && timesince > 0) {
        triggerLike();
      }
      lastTap = now;
    });
  }

  if (igWhatsappCta) {
    igWhatsappCta.addEventListener('click', (e) => {
      e.preventDefault();
      const productName = igWhatsappCta.getAttribute('data-product-name') || 'tus productos';
      const baseMessage = `Hola Elena, estuve viendo el posteo de "${productName}" en Divina Locura y me encantaría consultar disponibilidad y hacer un pedido!`;
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(baseMessage)}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    });
  }

  // Soporte de Teclado (Escape para cerrar, Flechas para navegar)
  document.addEventListener('keydown', (e) => {
    if (igModal && igModal.classList.contains('is-open')) {
      if (e.key === 'Escape') closeInstagramModal();
      if (e.key === 'ArrowLeft') goToSlide(currentSlideIndex - 1);
      if (e.key === 'ArrowRight') goToSlide(currentSlideIndex + 1);
    }
    // Atajo de teclado para abrir Admin: Alt + E o Ctrl + Shift + A
    if ((e.altKey && e.key.toLowerCase() === 'e') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
      openAdminLogin();
    }
  });

  // =========================================================================
  // 6. SISTEMA DE MODO ADMINISTRADOR (AUTENTICACIÓN & BARRA SUPERIOR)
  // =========================================================================
  const openAdminBtn = document.getElementById('open-admin-btn');
  const adminLoginModal = document.getElementById('admin-login-modal');
  const adminPassInput = document.getElementById('admin-pass-input');
  const adminLoginSubmitBtn = document.getElementById('admin-login-submit-btn');
  const adminLoginCancelBtn = document.getElementById('admin-login-cancel-btn');
  const adminLogoutBtn = document.getElementById('admin-logout-btn');
  const adminNewProductBtn = document.getElementById('admin-new-product-btn');
  const adminExportBtn = document.getElementById('admin-export-btn');
  const adminGithubBtn = document.getElementById('admin-github-btn');

  function updateAdminUi() {
    if (isAdmin) {
      document.body.classList.add('admin-mode-active');
      if (adminBar) adminBar.classList.remove('is-hidden');
    } else {
      document.body.classList.remove('admin-mode-active');
      if (adminBar) adminBar.classList.add('is-hidden');
    }
    renderCatalog();
  }

  function openAdminLogin() {
    if (isAdmin) {
      showToast('Ya te encuentras en Modo Administrador');
      return;
    }
    if (adminLoginModal) {
      adminLoginModal.classList.add('is-open');
      if (adminPassInput) {
        adminPassInput.value = '';
        setTimeout(() => adminPassInput.focus(), 100);
      }
    }
  }

  function closeAdminLogin() {
    if (adminLoginModal) adminLoginModal.classList.remove('is-open');
  }

  if (openAdminBtn) {
    openAdminBtn.addEventListener('click', openAdminLogin);
  }

  if (adminLoginCancelBtn) {
    adminLoginCancelBtn.addEventListener('click', closeAdminLogin);
  }

  if (adminLoginSubmitBtn) {
    adminLoginSubmitBtn.addEventListener('click', () => {
      const pass = (adminPassInput.value || '').trim();
      if (pass === DEFAULT_ADMIN_PASS) {
        isAdmin = true;
        localStorage.setItem(STORAGE_KEY_ADMIN, 'true');
        closeAdminLogin();
        updateAdminUi();
        showToast('✨ ¡Modo Administrador Activado! Ya puedes editar productos y fotos en vivo.');
      } else {
        alert('Contraseña incorrecta. (Clave por defecto: elena2026)');
      }
    });
  }

  if (adminPassInput) {
    adminPassInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        adminLoginSubmitBtn.click();
      }
    });
  }

  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', () => {
      isAdmin = false;
      localStorage.setItem(STORAGE_KEY_ADMIN, 'false');
      updateAdminUi();
      showToast('Sesión de administración cerrada.');
    });
  }

  // =========================================================================
  // 7. EDITOR DE PRODUCTOS (CREAR, EDITAR, SUBIR FOTOS DESDE EL DISPOSITIVO)
  // =========================================================================
  const productEditModal = document.getElementById('product-edit-modal');
  const productModalTitle = document.getElementById('product-modal-title');
  const productEditForm = document.getElementById('product-edit-form');
  const editProductId = document.getElementById('edit-product-id');
  const editTitle = document.getElementById('edit-title');
  const editCategory = document.getElementById('edit-category');
  const editTag = document.getElementById('edit-tag');
  const editTexture = document.getElementById('edit-texture');
  const editPrice = document.getElementById('edit-price');
  const editSize = document.getElementById('edit-size');
  const editDesc = document.getElementById('edit-desc');
  const editImagesList = document.getElementById('edit-images-list');
  const editFileInput = document.getElementById('edit-file-input');
  const btnAddImageUrl = document.getElementById('btn-add-image-url');
  const editIgCaption = document.getElementById('edit-ig-caption');
  const editIgHashtags = document.getElementById('edit-ig-hashtags');
  const editCancelBtn = document.getElementById('edit-cancel-btn');

  function openProductEditor(id = null) {
    if (!productEditModal) return;

    if (id) {
      const product = products.find(p => p.id === id);
      if (!product) return;

      productModalTitle.textContent = `Editar: ${product.title}`;
      editProductId.value = product.id;
      editTitle.value = product.title || '';
      editCategory.value = product.category || 'cuidado-personal';
      editTag.value = product.tag || '';
      editTexture.value = product.texture || '';
      editPrice.value = product.price || '';
      editSize.value = product.size || 'medium';
      editDesc.value = product.desc || '';

      const ig = product.instagram || {};
      editIgCaption.value = ig.caption || '';
      editIgHashtags.value = ig.hashtags || '';

      renderImageRows(product.images || []);
    } else {
      // Nuevo Producto
      productModalTitle.textContent = 'Crear Nuevo Producto';
      editProductId.value = '';
      editTitle.value = '';
      editCategory.value = 'cuidado-personal';
      editTag.value = 'Novedad de Taller';
      editTexture.value = '100% Hecho a mano';
      editPrice.value = 'Consultar';
      editSize.value = 'medium';
      editDesc.value = '';
      editIgCaption.value = 'Nuevo ingreso en Divina Locura Deco ✨ Confeccionado con fibras nobles y dedicación.';
      editIgHashtags.value = '#divinalocura #hechoamano #decoartesanal';

      renderImageRows([
        { label: 'Foto Principal', src: 'assets/images/hero-textile.jpg' }
      ]);
    }

    productEditModal.classList.add('is-open');
  }

  function closeProductEditor() {
    if (productEditModal) productEditModal.classList.remove('is-open');
  }

  if (editCancelBtn) {
    editCancelBtn.addEventListener('click', closeProductEditor);
  }

  if (adminNewProductBtn) {
    adminNewProductBtn.addEventListener('click', () => openProductEditor(null));
  }

  // Renderizar filas de imágenes en el editor
  function renderImageRows(images) {
    editImagesList.innerHTML = '';
    images.forEach((img, idx) => {
      addImageRow(img.label || `Vista ${idx + 1}`, img.src);
    });
  }

  function addImageRow(label = 'Vista', src = '') {
    const row = document.createElement('div');
    row.className = 'admin-image-row';
    row.innerHTML = `
      <img src="${src || 'assets/images/hero-textile.jpg'}" alt="Preview" class="admin-img-preview" />
      <input type="text" class="admin-input img-label-input" placeholder="Etiqueta (ej: Con Modelo, En Mesa)" value="${label}" style="flex:1;" />
      <input type="text" class="admin-input img-src-input" placeholder="Ruta o URL de la foto" value="${src}" style="flex:2;" />
      <button type="button" class="btn-remove-row" title="Eliminar foto">✕</button>
    `;

    // Actualizar previsualización si el usuario tipea una ruta
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

  // Subir imagen desde teléfono o PC (FileReader a Base64)
  if (editFileInput) {
    editFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target.result;
        addImageRow('Nueva Foto Subida', base64Data);
        showToast('📷 Imagen cargada correctamente desde tu dispositivo.');
      };
      reader.readAsDataURL(file);
      editFileInput.value = ''; // reset
    });
  }

  if (btnAddImageUrl) {
    btnAddImageUrl.addEventListener('click', () => {
      addImageRow('Nueva Vista', 'assets/images/catalog/handcrafted-cotton-towels-on-bench.jpg');
    });
  }

  // Guardar Cambios del Producto
  if (productEditForm) {
    productEditForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const id = editProductId.value || `prod_${Date.now()}`;
      const title = editTitle.value.trim();
      const category = editCategory.value;
      const tag = editTag.value.trim();
      const texture = editTexture.value.trim();
      const price = editPrice.value.trim();
      const size = editSize.value;
      const desc = editDesc.value.trim();
      const igCaption = editIgCaption.value.trim();
      const igHashtags = editIgHashtags.value.trim();

      // Recopilar imágenes
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
        images,
        instagram: {
          date: 'Actualizado recientemente',
          likes: existingIndex >= 0 && products[existingIndex].instagram ? products[existingIndex].instagram.likes : 150,
          caption: igCaption || desc,
          hashtags: igHashtags || '#divinalocura #hechoamano',
          comments: existingIndex >= 0 && products[existingIndex].instagram ? products[existingIndex].instagram.comments : []
        }
      };

      if (existingIndex >= 0) {
        products[existingIndex] = productPayload;
        showToast(`✅ "${title}" actualizado con éxito.`);
      } else {
        products.unshift(productPayload);
        showToast(`🎉 Nuevo producto "${title}" agregado al catálogo.`);
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
  // 8. EXPORTACIÓN & PUBLICACIÓN A GITHUB
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

  if (adminExportBtn) {
    adminExportBtn.addEventListener('click', downloadProductsFile);
  }

  if (modalDownloadDataBtn) {
    modalDownloadDataBtn.addEventListener('click', downloadProductsFile);
  }

  if (adminGithubBtn) {
    adminGithubBtn.addEventListener('click', () => {
      if (githubSyncModal) githubSyncModal.classList.add('is-open');
    });
  }

  if (ghSyncCloseBtn) {
    ghSyncCloseBtn.addEventListener('click', () => {
      if (githubSyncModal) githubSyncModal.classList.remove('is-open');
    });
  }

  // Sincronización directa vía GitHub REST API con Personal Access Token
  if (ghSyncSubmitBtn) {
    ghSyncSubmitBtn.addEventListener('click', async () => {
      const token = (ghTokenInput.value || '').trim();
      if (!token) {
        alert('Por favor ingresa un token de GitHub con permisos de escritura (repo).');
        return;
      }

      ghSyncSubmitBtn.disabled = true;
      ghSyncSubmitBtn.textContent = 'Enviando a GitHub...';

      try {
        const repo = 'fernandezbjuanma-wq/divinalocura';
        const path = 'products-data.js';
        const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;

        // Obtener SHA actual del archivo
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
        // Convertir string UTF-8 a base64 de manera segura
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
          if (githubSyncModal) githubSyncModal.classList.remove('is-open');
        } else {
          const errData = await putRes.json();
          alert(`Error al publicar: ${errData.message || 'Verifica el token.'}`);
        }
      } catch (err) {
        alert(`Error de conexión: ${err.message}`);
      } finally {
        ghSyncSubmitBtn.disabled = false;
        ghSyncSubmitBtn.textContent = '🚀 Enviar Commit a GitHub';
      }
    });
  }

  // =========================================================================
  // 9. TOAST NOTIFICATIONS
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
    }, 3500);
  }

  // Exponer API global para conveniencia y control
  window.DivinaLocura = {
    openInstagramModal,
    closeInstagramModal,
    openProductEditor,
    closeProductEditor,
    openAdminLogin,
    setAdminMode: (active) => {
      isAdmin = !!active;
      localStorage.setItem(STORAGE_KEY_ADMIN, isAdmin ? 'true' : 'false');
      updateAdminUi();
    },
    getProducts: () => products,
    renderCatalog
  };

  // Inicializar Interfaz
  updateAdminUi();
});
