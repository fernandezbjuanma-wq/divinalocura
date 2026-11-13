/**
 * Divina Locura Deco - Interactividad Frontend (Vanilla JS)
 * Filtros de catálogo dinámicos e integración con WhatsApp para Elena
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Selector de Botones de Filtro
  const filterBtns = document.querySelectorAll('.filter-btn');
  const catalogCards = document.querySelectorAll('.catalog-item');
  const categoryTiles = document.querySelectorAll('[data-category-target]');

  // Función para filtrar productos
  function applyFilter(category) {
    // Actualizar clase activa en botones
    filterBtns.forEach(btn => {
      if (btn.getAttribute('data-filter') === category) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });

    // Mostrar/ocultar tarjetas con transición suave
    catalogCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category');
      
      if (category === 'todos' || cardCategory === category) {
        card.classList.remove('is-hidden');
        card.style.display = 'flex';
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, 30);
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(12px)';
        setTimeout(() => {
          card.classList.add('is-hidden');
          card.style.display = 'none';
        }, 250);
      }
    });
  }

  // Event listeners para botones de filtro
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedCategory = btn.getAttribute('data-filter');
      applyFilter(selectedCategory);
    });
  });

  // Event listeners para las tarjetas de categorías estilo Anthropologie (Preview Tiles)
  categoryTiles.forEach(tile => {
    tile.addEventListener('click', (e) => {
      e.preventDefault();
      const targetCat = tile.getAttribute('data-category-target');
      applyFilter(targetCat);
      
      // Scroll suave hacia el catálogo
      const catalogSection = document.getElementById('catalogo');
      if (catalogSection) {
        catalogSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // 2. Configuración de WhatsApp Dinámico para Elena
  const whatsappButtons = document.querySelectorAll('.btn--whatsapp');
  
  whatsappButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const productName = button.getAttribute('data-product-name') || 'tus productos';
      
      // Mensaje predeterminado solicitado:
      // "Hola Elena, quería consultar sobre los productos de Divina Locura..."
      let baseMessage = `Hola Elena, quería consultar sobre los productos de Divina Locura. En especial me encantó: "${productName}".`;
      
      const encodedMsg = encodeURIComponent(baseMessage);
      // Enlace a la API oficial de WhatsApp
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMsg}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    });
  });

  // 3. Selector de Vistas de Producto (Multi-View: Con Modelo, Producto Solo, Detalle Taller)
  const viewPills = document.querySelectorAll('.view-pill');
  viewPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      const newSrc = pill.getAttribute('data-view-src');
      const mediaBox = pill.closest('.catalog-item__media');
      if (!mediaBox) return;

      const mainImg = mediaBox.querySelector('.catalog-item__img');
      if (!mainImg || mainImg.getAttribute('src') === newSrc) return;

      // Actualizar botón activo en este producto
      mediaBox.querySelectorAll('.view-pill').forEach(btn => btn.classList.remove('is-active'));
      pill.classList.add('is-active');

      // Transición suave de cambio de imagen
      mainImg.style.opacity = '0';
      setTimeout(() => {
        mainImg.src = newSrc;
        mainImg.onload = () => {
          mainImg.style.opacity = '1';
        };
        setTimeout(() => {
          mainImg.style.opacity = '1';
        }, 80);
      }, 120);
    });
  });
});
