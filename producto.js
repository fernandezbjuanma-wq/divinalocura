/**
 * Divina Locura Deco - Lógica de Página Individual de Producto (PDP)
 * Manejo de galería lookbook, selector de vistas, precios, bolsa de pedidos
 * y sistema interactivo de opiniones y comentarios de clientas.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Obtener ID del producto desde la URL (?id=...)
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id') || 'p1';

  // 2. Obtener lista de productos
  let allProducts = [];
  try {
    const saved = localStorage.getItem('divinalocura_products');
    if (saved) allProducts = JSON.parse(saved);
  } catch (e) {}

  if (!allProducts || allProducts.length === 0) {
    if (typeof INITIAL_PRODUCTS !== 'undefined') {
      allProducts = INITIAL_PRODUCTS;
    }
  }

  const product = allProducts.find(p => p.id === productId) || allProducts[0];
  if (!product) return;

  // Actualizar título de la pestaña del navegador
  document.title = `${product.title} — Divina Locura Deco`;

  // 3. Referencias del DOM
  const breadcrumbCategory = document.getElementById('pdp-breadcrumb-category');
  const breadcrumbCurrent = document.getElementById('pdp-breadcrumb-current');

  const mainImage = document.getElementById('pdp-main-image');
  const galleryBadge = document.getElementById('pdp-gallery-badge');
  const thumbsStrip = document.getElementById('pdp-thumbs-strip');

  const pdpEyebrow = document.getElementById('pdp-eyebrow');
  const pdpTitle = document.getElementById('pdp-title');
  const pdpPriceAmount = document.getElementById('pdp-price-amount');
  const pdpPriceNote = document.getElementById('pdp-price-note');
  const pdpTexture = document.getElementById('pdp-texture');
  const pdpStory = document.getElementById('pdp-story');
  const pdpDesc = document.getElementById('pdp-desc');

  const pdpQtyMinus = document.getElementById('pdp-qty-minus');
  const pdpQtyPlus = document.getElementById('pdp-qty-plus');
  const pdpQtyInput = document.getElementById('pdp-qty-input');
  const pdpAddBagBtn = document.getElementById('pdp-add-bag-btn');
  const pdpWaBtn = document.getElementById('pdp-wa-btn');
  const pdpAdminEditBtn = document.getElementById('pdp-admin-edit-btn');

  // Comentarios
  const pdpRatingStars = document.getElementById('pdp-rating-stars');
  const pdpRatingScore = document.getElementById('pdp-rating-score');
  const pdpRatingCount = document.getElementById('pdp-rating-count');
  const pdpCommentsHeaderCount = document.getElementById('pdp-comments-header-count');
  const pdpCommentsList = document.getElementById('pdp-comments-list');
  const pdpReviewForm = document.getElementById('pdp-review-form');
  const reviewStarsPicker = document.getElementById('review-stars-picker');
  const reviewNameInput = document.getElementById('review-name');
  const reviewTextInput = document.getElementById('review-text');

  // Relacionados
  const pdpRelatedGrid = document.getElementById('pdp-related-grid');

  // 4. Rellenar Migas de Pan (Breadcrumbs)
  if (breadcrumbCategory) {
    const catLabel = product.categoryName || 'Colección Textil';
    breadcrumbCategory.textContent = catLabel;
    breadcrumbCategory.href = `index.html#catalogo`;
  }
  if (breadcrumbCurrent) {
    breadcrumbCurrent.textContent = product.title;
  }

  // 5. Galería de Imágenes Multivista
  const images = product.images && product.images.length > 0
    ? product.images
    : [{ label: 'Pieza Principal', src: 'assets/images/hero-textile.jpg' }];

  if (mainImage) {
    mainImage.src = images[0].src;
    mainImage.alt = product.title;
  }
  if (galleryBadge) {
    galleryBadge.textContent = product.tag || 'Confección Artesanal';
  }

  if (thumbsStrip) {
    thumbsStrip.innerHTML = '';
    images.forEach((img, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `pdp-thumb-btn ${idx === 0 ? 'is-active' : ''}`;
      btn.innerHTML = `
        <img src="${img.src}" alt="${img.label || product.title}" loading="lazy" />
        <span class="pdp-thumb-label">${img.label || `Vista ${idx + 1}`}</span>
      `;
      btn.addEventListener('click', () => {
        thumbsStrip.querySelectorAll('.pdp-thumb-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        if (mainImage) {
          mainImage.style.opacity = '0.3';
          setTimeout(() => {
            mainImage.src = img.src;
            mainImage.onload = () => { mainImage.style.opacity = '1'; };
            setTimeout(() => { mainImage.style.opacity = '1'; }, 50);
          }, 120);
        }
      });
      thumbsStrip.appendChild(btn);
    });
  }

  // 6. Información del Producto & Precio
  if (pdpEyebrow) {
    pdpEyebrow.textContent = `Edición Artesanal · ${product.categoryName || 'Taller Textil'}`;
  }
  if (pdpTitle) {
    pdpTitle.textContent = product.title;
  }

  // Formato de Precio
  const standardPrices = {
    'p1': '$ 28.500 ARS',
    'p2': '$ 9.800 ARS',
    'p3': '$ 18.500 ARS',
    'p4': '$ 22.000 ARS',
    'p5': '$ 11.500 ARS',
    'p6': '$ 13.200 ARS',
    'p7': '$ 24.500 ARS',
    'p8': '$ 15.800 ARS'
  };

  let displayPrice = product.price || standardPrices[product.id] || '$ 16.500 ARS';
  let priceNote = 'Confección a pedido';

  if (product.price && product.price.includes('$')) {
    displayPrice = product.price;
    priceNote = 'Precio de taller';
  } else if (standardPrices[product.id]) {
    displayPrice = standardPrices[product.id];
    priceNote = product.price || 'Kit completo confeccionado a mano';
  }

  if (pdpPriceAmount) pdpPriceAmount.textContent = displayPrice;
  if (pdpPriceNote) pdpPriceNote.textContent = priceNote;

  if (pdpTexture) {
    pdpTexture.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="m4.93 4.93 4.24 4.24"></path><path d="m14.83 9.17 4.24-4.24"></path><path d="m14.83 14.83 4.24 4.24"></path><path d="m9.17 14.83-4.24 4.24"></path></svg>
      <span>${product.texture || 'Fibras naturales & Satén de seda'}</span>
    `;
  }

  const storyContent = product.story || (product.instagram && product.instagram.caption) || 'Cada dobladillo y cada remate se realiza en nuestro taller familiar por Elena, prelavando cada tela con suavizantes naturales para asegurar que la pieza mantenga su caricia y forma.';
  if (pdpStory) pdpStory.textContent = `“${storyContent}”`;
  if (pdpDesc) pdpDesc.textContent = product.desc || 'Pieza utilitaria de alta gama pensada para aportar armonía, practicidad y calidez al hogar.';

  // 7. Cantidad y Botones de Compra
  let currentQty = 1;

  if (pdpQtyMinus) {
    pdpQtyMinus.addEventListener('click', () => {
      if (currentQty > 1) {
        currentQty -= 1;
        if (pdpQtyInput) pdpQtyInput.value = currentQty;
      }
    });
  }

  if (pdpQtyPlus) {
    pdpQtyPlus.addEventListener('click', () => {
      currentQty += 1;
      if (pdpQtyInput) pdpQtyInput.value = currentQty;
    });
  }

  if (pdpQtyInput) {
    pdpQtyInput.addEventListener('change', () => {
      const val = parseInt(pdpQtyInput.value, 10);
      currentQty = isNaN(val) || val < 1 ? 1 : val;
      pdpQtyInput.value = currentQty;
    });
  }

  if (pdpAddBagBtn) {
    pdpAddBagBtn.addEventListener('click', () => {
      if (window.DivinaLocura && window.DivinaLocura.addToCart) {
        window.DivinaLocura.addToCart(product.id, '', currentQty);
      }
    });
  }

  if (pdpWaBtn) {
    pdpWaBtn.addEventListener('click', (e) => {
      e.preventDefault();
      let query = `${product.title} (Cantidad: ${currentQty})`;
      if (window.DivinaLocura && window.DivinaLocura.buildWhatsAppUrl) {
        window.open(window.DivinaLocura.buildWhatsAppUrl(query), '_blank', 'noopener,noreferrer');
      } else {
        window.open(`https://api.whatsapp.com/send?phone=5491100000000&text=${encodeURIComponent('Hola Elena, me interesa: ' + query)}`, '_blank');
      }
    });
  }

  // Botón de Edición Rápida si es Admin activo
  const activeRole = localStorage.getItem('divinalocura_role');
  if (pdpAdminEditBtn && activeRole) {
    pdpAdminEditBtn.style.display = 'inline-flex';
    pdpAdminEditBtn.textContent = '✏️ Modificar esta Creación';
    pdpAdminEditBtn.addEventListener('click', () => {
      if (window.DivinaLocura && window.DivinaLocura.openProductEditor) {
        window.DivinaLocura.openProductEditor(product.id);
      }
    });
  }

  // 8. SISTEMA DE RESEÑAS & COMENTARIOS ("sus comentarios")
  const STORAGE_KEY_REVIEWS = `divinalocura_reviews_${product.id}`;

  const defaultReviewsMap = {
    'p1': [
      { user: 'Mariana H.', date: 'Hace 3 días', stars: 5, verified: true, text: 'Hermosa la calidad Elena, me cambió el pelo por completo! El satén es súper suave y la cofia no se sale al dormir. La presentación es un lujo ✨' },
      { user: 'Valeria M.', date: 'Hace 1 semana', stars: 5, verified: true, text: 'Lo pedí en color champán y llegó impecable en su bolsita de lino. Se nota el amor y la dedicación en cada puntada. Súper recomendado!' },
      { user: 'Sofía R.', date: 'Hace 2 semanas', stars: 5, verified: true, text: 'Excelente confección. El elástico no marca la frente y la tela es de primer nivel. Volveré a comprar para regalar.' }
    ],
    'p2': [
      { user: 'Florencia B.', date: 'Hace 4 días', stars: 5, verified: true, text: 'El nido de abeja seca espectacular y la guarda en vichy le da ese toque rústico europeo que buscaba para mi cocina.' },
      { user: 'Camila P.', date: 'Hace 2 semanas', stars: 5, verified: true, text: 'Compré 3 repasadores en distintos tonos. Después de varios lavados siguen perfectos y sin deformarse.' }
    ],
    'p3': [
      { user: 'Lucía C.', date: 'Hace 5 días', stars: 5, verified: true, text: 'Queda soñado en la pieza de los chicos. Los bolsillos son amplios y tienen fuelle, entran libros y juguetes perfectamente.' },
      { user: 'Estudio Madera', date: 'Hace 3 semanas', stars: 5, verified: true, text: 'Excelente combinación de textil grueso y varilla de madera natural. Aporta mucha calidez a la pared.' }
    ],
    'p4': [
      { user: 'Paula S.', date: 'Hace 4 días', stars: 5, verified: true, text: 'La conejita es aún más tierna en persona. El bordado del nombre de mi beba quedó delicadísimo. Mil gracias Elena!' },
      { user: 'Micaela G.', date: 'Hace 2 semanas', stars: 5, verified: true, text: 'Regalo inolvidable de nacimiento. Las telas son suaves y no desprenden ninguna fibra.' }
    ],
    'p5': [
      { user: 'Agustina D.', date: 'Hace 1 semana', stars: 5, verified: true, text: 'Bloquea el 100% de la luz y el acolchado es una nube. Es el mejor antifaz de descanso que he tenido.' }
    ],
    'p6': [
      { user: 'Jimena T.', date: 'Hace 6 días', stars: 5, verified: true, text: 'El forro impermeable interior es súper práctico para cosméticos o lápices. El cierre corre súper suave.' }
    ],
    'p7': [
      { user: 'Romina B.', date: 'Hace 1 semana', stars: 5, verified: true, text: 'La doble felpa de la toallita absorbe de inmediato y no irrita la piel del recién nacido. El bordado un amor.' }
    ],
    'p8': [
      { user: 'Andrea V.', date: 'Hace 5 días', stars: 5, verified: true, text: 'Un detalle elegante para el baño de visitas que todos elogian. La terminación con puntilla es soñada.' }
    ]
  };

  function loadReviews() {
    let savedReviews = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
      if (raw) savedReviews = JSON.parse(raw);
    } catch (e) {}

    const defaults = defaultReviewsMap[product.id] || [
      { user: 'Cliente Satisfecho', date: 'Hace unos días', stars: 5, verified: true, text: 'Hermosa confección a mano. Superó mis expectativas por la calidez de la tela y las terminaciones.' }
    ];

    return [...savedReviews, ...defaults];
  }

  function renderReviews() {
    const reviews = loadReviews();

    // Calcular promedio
    const total = reviews.length;
    const avg = total > 0 ? (reviews.reduce((sum, r) => sum + r.stars, 0) / total).toFixed(1) : '5.0';
    const starsHtml = '★'.repeat(Math.round(avg)) + '☆'.repeat(5 - Math.round(avg));

    if (pdpRatingStars) pdpRatingStars.textContent = starsHtml;
    if (pdpRatingScore) pdpRatingScore.textContent = avg;
    if (pdpRatingCount) pdpRatingCount.textContent = `(${total} ${total === 1 ? 'opinión' : 'opiniones'})`;
    if (pdpCommentsHeaderCount) pdpCommentsHeaderCount.textContent = `(${total})`;

    if (pdpCommentsList) {
      pdpCommentsList.innerHTML = '';
      reviews.forEach(rev => {
        const card = document.createElement('article');
        card.className = 'pdp-comment-card';
        card.innerHTML = `
          <div class="pdp-comment-top">
            <span class="pdp-comment-user">
              ${rev.user}
              ${rev.verified ? '<span class="pdp-verified-badge">✓ Clienta Verificada</span>' : ''}
            </span>
            <span class="pdp-comment-date">${rev.date || 'Reciente'}</span>
          </div>
          <div class="pdp-comment-stars">${'★'.repeat(rev.stars)}${'☆'.repeat(5 - rev.stars)}</div>
          <p class="pdp-comment-text">${rev.text}</p>
        `;
        pdpCommentsList.appendChild(card);
      });
    }
  }

  renderReviews();

  // Selector de estrellas en el formulario
  let selectedStars = 5;
  if (reviewStarsPicker) {
    const starSpans = reviewStarsPicker.querySelectorAll('span');
    function updateStarPicker(score) {
      starSpans.forEach(span => {
        const val = parseInt(span.getAttribute('data-star'), 10);
        span.classList.toggle('is-active', val <= score);
      });
    }
    updateStarPicker(5);

    starSpans.forEach(span => {
      span.addEventListener('click', () => {
        selectedStars = parseInt(span.getAttribute('data-star'), 10);
        updateStarPicker(selectedStars);
      });
      span.addEventListener('mouseenter', () => {
        const hoverVal = parseInt(span.getAttribute('data-star'), 10);
        starSpans.forEach(s => {
          s.classList.toggle('is-hovered', parseInt(s.getAttribute('data-star'), 10) <= hoverVal);
        });
      });
      span.addEventListener('mouseleave', () => {
        starSpans.forEach(s => s.classList.remove('is-hovered'));
      });
    });
  }

  // Prellenar nombre si hay cliente autenticado
  try {
    const custRaw = localStorage.getItem('divinalocura_customer');
    if (custRaw) {
      const cust = JSON.parse(custRaw);
      if (cust && cust.name && reviewNameInput) {
        reviewNameInput.value = cust.name;
      }
    }
  } catch (e) {}

  // Enviar Nuevo Comentario / Opinión
  if (pdpReviewForm) {
    pdpReviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const userName = (reviewNameInput && reviewNameInput.value ? reviewNameInput.value.trim() : '') || 'Clienta Anónima';
      const userText = (reviewTextInput && reviewTextInput.value ? reviewTextInput.value.trim() : '');

      if (!userText) {
        alert('Por favor escribe tu opinión o comentario sobre esta pieza.');
        return;
      }

      const newReview = {
        user: userName,
        stars: selectedStars,
        text: userText,
        date: 'Hoy',
        verified: true
      };

      let existing = [];
      try {
        const raw = localStorage.getItem(STORAGE_KEY_REVIEWS);
        if (raw) existing = JSON.parse(raw);
      } catch (err) {}

      existing.unshift(newReview);
      localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(existing));

      if (reviewTextInput) reviewTextInput.value = '';
      renderReviews();

      if (window.DivinaLocura && window.DivinaLocura.showToast) {
        window.DivinaLocura.showToast('✨ ¡Gracias por tu comentario! Ha sido publicado.');
      } else {
        alert('✨ ¡Muchas gracias por tu opinión! Tu comentario ha sido publicado.');
      }
    });
  }

  // 9. OTRAS PIEZAS DEL TALLER (RELACIONADOS)
  if (pdpRelatedGrid) {
    const related = allProducts.filter(p => p.id !== product.id).slice(0, 4);
    pdpRelatedGrid.innerHTML = '';

    related.forEach(rel => {
      const relImg = (rel.images && rel.images[0]) ? rel.images[0].src : 'assets/images/hero-textile.jpg';
      const relPrice = rel.price || standardPrices[rel.id] || '$ 16.500 ARS';

      const card = document.createElement('article');
      card.className = 'catalog-item catalog-item--medium';
      card.innerHTML = `
        <div class="catalog-item__media" onclick="window.location.href='producto.html?id=${rel.id}'" style="cursor:pointer;" title="Ver pieza">
          <img src="${relImg}" alt="${rel.title}" class="catalog-item__img" loading="lazy" />
          <span class="catalog-item__tag">${rel.tag || 'Hecho a Mano'}</span>
        </div>
        <div class="catalog-item__info">
          <div class="catalog-item__meta">
            <span class="catalog-item__category">${rel.categoryName || 'Colección'}</span>
          </div>
          <h3 class="catalog-item__title"><a href="producto.html?id=${rel.id}">${rel.title}</a></h3>
          <div class="catalog-item__footer">
            <span class="catalog-item__price">${relPrice}</span>
            <a href="producto.html?id=${rel.id}" class="btn--lookbook-view">
              <span>Ver Pieza</span>
            </a>
          </div>
        </div>
      `;
      pdpRelatedGrid.appendChild(card);
    });
  }
});
