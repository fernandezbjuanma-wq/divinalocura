# 📖 Guía: Modo Administrador en Vivo & Posteos de Instagram en Divina Locura Deco

¡Ya está implementado el **Modo Administrador directo en la página** y el **sistema de Posteo estilo Instagram** para cada producto! Ahora puedes editar imágenes, precios, descripciones y crear nuevos productos desde tu propio celular o computadora sin tocar código.

Sitio en vivo: **https://fernandezbjuanma-wq.github.io/divinalocura/**

---

## 🔐 1. Cómo Activar el Modo Administrador en la Página

1. Baja hasta el final de la página (el pie de página o footer).
2. Haz clic en el botón discreto que dice **`Modo Admin`** (o presiona en tu teclado las teclas `Alt + E`).
3. Te aparecerá una ventana pidiendo la contraseña:
   - **Contraseña predeterminada:** `elena2026`
4. Al ingresar, verás en la parte superior de la pantalla la barra flotante negra:
   `🟢 Modo Admin Activo · Elena`

---

## ✏️ 2. Cómo Editar Productos, Precios, Fotos y Descripciones

Cuando el Modo Admin está activo:
1. En cada tarjeta de producto del catálogo verás dos botones arriba a la derecha:
   - **`✏️ Editar`**: Abre el editor completo del producto.
   - **`🗑️`**: Elimina el producto del catálogo.
2. Al presionar **`✏️ Editar`**, puedes modificar:
   - **Título del Producto**
   - **Categoría** (Cuidado Personal, Hogar & Cocina, Organización, Bebés & Infantil)
   - **Etiqueta Superior** (ej: *Favorito Skincare*, *Clásico del Taller*)
   - **Materiales / Textura** (ej: *Satén de seda premium anti-frizz*)
   - **Precio o Texto** (ej: *$12.500*, *Consultar Colores*, etc.)
   - **Descripción detallada**
   - **Fotografías y Vistas**:
     - Puedes cambiar el nombre de cada vista (ej: *Con Modelo*, *En Mesa*, *Detalle Taller*).
     - Puedes subir una foto nueva directamente desde tu celular o computadora con el botón **`Subir Foto desde tu Dispositivo`** (la procesa y muestra de inmediato).
     - Puedes agregar más fotos o eliminar fotos existentes con la cruz `✕`.
   - **Posteo de Instagram**:
     - La historia o caption detrás del producto (lo que Elena comparte en Instagram).
     - Los hashtags temáticos.
3. Haz clic en **`Guardar Producto`** y verás los cambios reflejados al instante en la tienda.

---

## ➕ 3. Cómo Agregar un Nuevo Producto

1. Con el Modo Admin activo, haz clic en el botón naranja de la barra superior: **`+ Nuevo Producto`**.
2. Completa los datos, sube las fotos que quieras y escribe la historia para el posteo de Instagram.
3. Haz clic en **`Guardar Producto`** y aparecerá de primero en el catálogo.

---

## 📸 4. Posteo Estilo Instagram para Cada Producto

Todos los clientes (incluso sin ser administradores) pueden interactuar con los posteos:
- En cada tarjeta hay un botón con el degradé de Instagram: **`Ver Posteo`** (o haciendo clic directamente sobre la foto del producto).
- Se abre una ventana interactiva idéntica a Instagram:
  - **Carrusel de Fotos**: Puedes deslizar las fotos con flechas o tocando los puntos.
  - **Doble toque / doble clic**: Al hacer doble toque en la foto, aparece el corazón animado latiendo y suma un me gusta.
  - **Historia de Elena**: El texto artesanal y cálido que cuenta los materiales y cómo se hizo la prenda.
  - **Comentarios**: Preguntas y opiniones de clientes.
  - **Botón de WhatsApp**: Permite que el cliente consulte o compre ese producto específico con un solo toque.

---

## ☁️ 5. Cómo Guardar los Cambios para Todo el Mundo (GitHub)

Los cambios que haces en tu navegador se guardan automáticamente en tu dispositivo para que no se pierdan. Para que queden publicados permanentemente para todos los visitantes:

### Opción A (La más sencilla en 2 clics):
1. En la barra superior de administración, haz clic en **`📥 Descargar Datos`**.
2. Se descargará el archivo `products-data.js` con todos tus productos y fotos actualizados.
3. Entras al repositorio en GitHub ([products-data.js en GitHub](https://github.com/fernandezbjuanma-wq/divinalocura/blob/main/products-data.js)), le das al lápiz ✏️, pegas el contenido y guardas con **Commit changes**.

### Opción B (Sincronización Automática con Token):
1. En la barra superior, haz clic en **`Publicar en GitHub`**.
2. Pegas tu Token Personal de GitHub (con permisos de `repo`) y la página enviará el commit automáticamente a GitHub sin que tengas que descargar nada.
