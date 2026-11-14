# Divina Locura Deco — Tienda Online & Sistema de Gestión del Taller

Sitio web editorial y plataforma integral de administración para **Divina Locura Deco**, el taller artesanal de blanquería, textiles de hogar, línea satén antifrizz y accesorios utilitarios confeccionados a mano por **Elena**.

🌐 **Sitio Web en Vivo:** [https://fernandezbjuanma-wq.github.io/divinalocura/](https://fernandezbjuanma-wq.github.io/divinalocura/)

---

## 📁 Estructura del Repositorio

### 1. Tienda Pública (Estética Zara Home & Anthropologie)
- [`index.html`](./index.html) — Página principal con portada dinámica multi-colección, catálogo interactivo, galería de espacios, historia del taller, carrito con Mercado Pago / Transferencia / WhatsApp y botón flotante desplazante (**Contacto & Atelier**).
- [`producto.html`](./producto.html) — Ficha editorial individual de cada creación con galería multivista, historia de confección, opiniones de clientas y accesos a WhatsApp e Instagram.
- [`style.css`](./style.css) — Sistema de diseño editorial cálido (paleta lino, alabastro, terracota y carbón).
- [`main.js`](./main.js) — Lógica principal de la tienda, carrito, asistente virtual, cuentas de clientas y sincronización en vivo.
- [`producto.js`](./producto.js) — Lógica de la ficha individual de producto y sistema de reseñas.
- [`products-data.js`](./products-data.js) — Catálogo base de creaciones del taller.

### 2. Panel de Control & Administración (Elena & Juanma)
- [`admin.html`](./admin.html) — Tablero Ejecutivo de Resumen y KPIs del taller.
- [`admin-pedidos.html`](./admin-pedidos.html) — Gestión de pedidos de clientas, señas del 50%, pagos y entregas.
- [`admin-produccion.html`](./admin-produccion.html) — Tablero Kanban de taller con descuento automático de metros de tela del stock.
- [`admin-stock.html`](./admin-stock.html) — Inventario de rollos de tela, costos por metro y alertas de reposición.
- [`admin-finances.html`](./admin-finances.html) — Tablero Financiero & Ganancias (ingresos, gastos, margen neto, presupuesto y exportación CSV).
- [`admin-chat.html`](./admin-chat.html) — Bandeja de mensajes directos de clientas y respuestas rápidas.
- [`admin-productos.html`](./admin-productos.html) — Gestor de creaciones con compresor automático de fotos y galería multivista.
- [`admin-configuracion.html`](./admin-configuracion.html) — Configuración de textos de la web, claves de administradores, Google Sheets y Mercado Pago.
- [`admin-guia.html`](./admin-guia.html) — Manual interactivo paso a paso para Elena y Juanma.
- [`admin.css`](./admin.css) & [`admin.js`](./admin.js) — Estilos editoriales y lógica del portal administrativo.

### 3. Base de Datos & Backend en Google Sheets
- [`workshop-db.js`](./workshop-db.js) — Motor de datos unificado con persistencia local y sincronización bidireccional en la nube con Google Sheets.
- [`apps-script/Codigo.gs`](./apps-script/Codigo.gs) — Script listo para pegar en **Google Sheets → Extensiones → Apps Script** (crea las 7 pestañas de base de datos, genera un menú propio en la planilla y habilita el conector con Mercado Pago).

### 4. Recursos & Documentación
- [`assets/images/`](./assets/images/) — Fotografías del catálogo (`catalog/`), modelos (`models/`) y portadas de colección.
- [`docs/`](./docs/) — Guías y manuales del proyecto:
  - 📘 **[Cómo conectar la Base de Datos en Google Sheets y Mercado Pago](./docs/COMO_CONECTAR_LA_BASE_DE_DATOS.md)**
  - 📸 **[Cómo editar y subir fotos nuevas al catálogo](./docs/COMO_EDITAR_Y_SUBIR_FOTOS.md)**
  - 📊 **[Informe Estratégico de Diseño y Marketing](./docs/INFORME_ESTRATEGICO_DISENO_Y_MARKETING.md)**
  - ✨ **[Moodboard e Inspiración Visual (Zara Home / Anthropologie)](./docs/INSPIRACION.md)**
