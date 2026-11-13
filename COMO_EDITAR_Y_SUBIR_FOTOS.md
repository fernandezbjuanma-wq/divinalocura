# 📖 Guía Fácil: Cómo Subir Fotos y Editar Secciones en Divina Locura Deco

¡Hola! Esta guía está pensada para que vos o tu mamá (Elena) puedan actualizar la tienda online directamente desde cualquier navegador web (computadora o celular), **sin necesidad de instalar programas ni escribir comandos**.

Cualquier cambio que guarden en GitHub se publica **automáticamente en vivo en https://fernandezbjuanma-wq.github.io/divinalocura/ en 30 a 60 segundos**.

---

## 📸 1. Cómo Subir Fotos Nuevas

1. Entrá a la carpeta de imágenes del proyecto en GitHub:  
   👉 [**Carpeta assets/images en GitHub**](https://github.com/fernandezbjuanma-wq/divinalocura/tree/main/assets/images)
2. Arriba a la derecha, hacé clic en el botón **"Add file"** y seleccioná **"Upload files"**.
3. Arrastrá tus fotos nuevas (o tocalas desde el celular para seleccionarlas de tu galería).
   > **Consejo**: Poneles nombres claros en minúsculas y sin espacios, por ejemplo: `almohadon-tusor-mostaza.jpg` o `neceser-flores.jpg`.
4. Bajá hasta el final y hacé clic en el botón verde **"Commit changes"**.
5. ¡Listo! Tu imagen ya está subida y su dirección dentro de la web será:  
   `assets/images/el-nombre-de-tu-foto.jpg`.

---

## ✍️ 2. Cómo Editar Textos, Nombres o Teléfono de WhatsApp

1. Abrí el archivo de la página en GitHub:  
   👉 [**index.html en GitHub**](https://github.com/fernandezbjuanma-wq/divinalocura/blob/main/index.html)
2. En la barra superior del archivo, hacé clic en el **icono del lápiz** ✏️ (**"Edit this file"**).
3. Buscá la parte que quieras cambiar:
   - **Para cambiar el texto de un producto**: Buscá el título del producto (por ejemplo `Set Skincare & Antifrizz Completo`) y escribí el nuevo texto que quieras.
   - **Para cambiar las fotos de un producto**: Buscá los botones `<button class="view-pill" data-view-src="assets/images/tu-foto.jpg">` y pegá la ruta de la foto nueva que subiste.
   - **Para cambiar el número de teléfono o mensaje de WhatsApp**: Buscá la sección de contacto o el atributo `data-product-name`.
4. Una vez que hiciste tus cambios, hacé clic en el botón verde **"Commit changes"** (arriba a la derecha).
5. Esperá unos 45 segundos, refrescá la página web y vas a ver tus cambios en vivo.

---

## 🎛️ 3. ¿Querés un Panel Visual con Usuario y Contraseña?

Si en lugar de editar el archivo preferís tener una pantalla privada (como un panel de control) donde inicies sesión y tengas:
- Un botón **"+ Nuevo Producto"**
- Casilleros para rellenar: *Título*, *Descripción*, *Categoría* y un botón de *Subir Foto*.

Avisame y podemos conectarle **Decap CMS** (es un panel administrativo gratuito que se conecta directo a GitHub).
