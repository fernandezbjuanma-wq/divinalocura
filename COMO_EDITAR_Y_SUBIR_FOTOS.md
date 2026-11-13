# 📖 Guía: Dos Perfiles de Administración en Divina Locura Deco
**Sitio en Vivo:** [https://fernandezbjuanma-wq.github.io/divinalocura/](https://fernandezbjuanma-wq.github.io/divinalocura/)

La web cuenta con **dos perfiles independientes** diseñados específicamente para cada necesidad:
1. **🌸 Perfil Elena (Mamá · Modo Taller)**: Súper intuitivo, cálido y directo. Para subir fotos de nuevas creaciones, cambiar precios y descripciones desde el celular o la computadora sin tocar código ni conceptos técnicos.
2. **💻 Perfil Juanma (Modo Programador & Web)**: Herramientas avanzadas para programación, ajustes de WhatsApp, anuncios, sincronización directa con GitHub y copias de seguridad.

---

## 🔐 1. Cómo Ingresar al Panel de Administración

1. Baja hasta el final de la página (el pie de página o footer).
2. Haz clic en el botón discreto que dice **`Modo Admin`** (o presiona las teclas `Alt + E` en tu teclado).
3. Aparecerá la ventana con las dos tarjetas:
   - **🌸 Elena · Taller & Creaciones**: Clave rápida: `elena` o `elena2026`.
   - **💻 Juanma · Programación & Web**: Clave rápida: `juanma` o `juanma2026`.
4. Ingresas la clave de tu perfil y haces clic en el botón.

---

## 🌸 2. Guía para Elena (Modo Taller de Creaciones)

¡Hola Elena! Este modo está pensado para que puedas gestionar tus creaciones de la forma más fácil y rápida:

### A. Para Publicar una Nueva Creación
1. En la parte superior de la pantalla verás una barra que dice:  
   `🌸 ¡Hola Elena! · Modo Taller de Creaciones`
2. Haz clic en el botón terracota: **`📸 Publicar Nueva Pieza`**.
3. Completa los datos con tus palabras:
   - **¿Cómo se llama la pieza?** (ej: *Set de Satén Antifrizz*, *Repasador Waffle con Guarda Vichy*).
   - **¿En qué categoría va?** (Dormitorio & Descanso, Hogar & Cocina, Organización, Bebés).
   - **Precio**: Pones el monto (ej: *$12.500*) o podés escribir *"Consultar"*.
   - **Telas & Materiales**: Qué tela usaste (ej: *Satén de seda premium*, *100% puro algodón*).
   - **Descripción**: Para qué sirve y qué incluye.
   - **Fotos**: Haz clic en el botón **`📸 Elegir foto desde tu celular o compu`** y selecciona una o más fotos de tu galería.
   - **Historia de la Pieza**: Contá brevemente cómo la confeccionaste o qué te inspiró.
4. Haz clic en **`✨ Guardar y Publicar en la Tienda`**.
5. ¡Listo! Tu producto aparecerá de inmediato publicado en la tienda.

### B. Para Modificar una Creación Existente o Cambiar el Precio
1. Busca la tarjeta de la pieza en el catálogo.
2. Arriba a la derecha de la foto verás el botón: **`✏️ Modificar Creación`**.
3. Cambias el precio, la foto o lo que quieras y le das a **`✨ Guardar y Publicar en la Tienda`**.

---

## 💻 3. Guía para Juanma (Programación & Funcionamiento Web)

Cuando ingresas como Juanma (`juanma`), verás la barra técnica superior con acceso total:

### A. ⚙️ Configuración Web (`dev-settings-modal`)
Al hacer clic en **`Configuración Web`** puedes:
- **Número de WhatsApp**: Configura el número telefónico receptor de pedidos (ej: `54911...`). Se actualiza dinámicamente en todos los botones de la web y en las fichas editoriales.
- **Usuario de Instagram**: Cambia el usuario `@divina.locura.deco` y sus enlaces.
- **Barra de Anuncios**: Cambia el texto marquesina superior de la web en tiempo real.
- **GitHub Personal Access Token (PAT)**: Para enviar commits automáticos con un solo clic.
- **🔄 Restablecer Catálogo Original**: Recupera los 8 productos de fábrica en caso de pruebas.

### B. 🚀 Sincronizar Cambios con GitHub Pages
Para que los cambios hechos desde el navegador queden publicados permanentemente para todos los clientes en internet:
1. **Opción Directa (con Token)**:
   - Ingresa tu GitHub PAT en Configuración y haz clic en **`🚀 Enviar Commit a GitHub`**.
   - La web enviará la actualización de `products-data.js` a la rama `main` vía GitHub REST API.
2. **Opción Backup (Descargar archivo)**:
   - Haz clic en **`Backup`** para descargar el archivo `products-data.js` actualizado.
   - Puedes commitearlo con git:
     ```bash
     git add products-data.js && git commit -m "feat: actualizar catalogo" && git push origin main
     ```

---

## ✨ 4. Experiencia Lookbook Inspirada en Anthropologie

Cada pieza del catálogo cuenta con una **Ficha Lookbook Editorial** (haciendo clic en la foto o en **`✨ Ficha Lookbook`**):
- **Galería Multivista**: Deslizador de fotos con miniaturas interactivas (vistas de taller, en uso, con modelo).
- **Kicker & Tipografía Serif**: Estilo editorial de alta gama.
- **Historia de la Pieza**: La narrativa del taller de Elena.
- **Detalles & Cuidados Textiles**: Recomendaciones de lavado slow-fashion.
- **Botón de Pedido a Medida por WhatsApp**: Abre directamente el chat con Elena con el producto preseleccionado.
