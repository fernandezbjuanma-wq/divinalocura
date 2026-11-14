# ☁️ Guía de Base de Datos (Google Sheets + Apps Script) y Subida de Fotos — Divina Locura Deco

Esta guía explica cómo activar gratis la **Planilla de Google en Vivo** para el taller de Elena y las **3 maneras de subir fotos nuevas** a la tienda.

---

## 📊 Parte 1: Conectar la Base de Datos en Google Sheets (en 5 minutos)

La página ya funciona de inmediato guardando todo en el navegador, pero al conectarla con una **Hoja de Cálculo de Google**, todo lo que ocurra en la web se guarda en vivo en la planilla de Elena y se sincroniza entre todos los celulares y computadoras:

1. **Crear la Planilla de Google**:
   - Entrá a [Google Sheets (sheets.new)](https://sheets.new) con la cuenta de Google de Elena o la tuya.
   - Ponele de título: **`Divina Locura Deco - Base de Datos`**.

2. **Abrir Google Apps Script**:
   - En el menú superior de la planilla, hacé clic en **Extensiones → Apps Script**.
   - Borrá las pocas líneas que aparecen por defecto en el editor.

3. **Pegar el Sistema del Taller**:
   - Abrí el archivo [`apps-script/Codigo.gs`](apps-script/Codigo.gs) de este repositorio, copiá todo su contenido y pegalo en el editor de Apps Script.
   - Tocá el ícono de **Guardar (💾)** arriba.

4. **Publicar como Aplicación Web**:
   - Arriba a la derecha tocá el botón azul **Implementar → Nueva implementación**.
   - En "Seleccionar tipo" (el engranaje ⚙️), elegí **Aplicación web**.
   - Completá así:
     - **Descripción**: `Base de Datos Divina Locura`
     - **Ejecutar como**: `Yo` (tu cuenta de Google)
     - **Quién tiene acceso**: **`Cualquier persona`** *(muy importante para que las clientas puedan enviar pedidos desde sus celulares)*.
   - Tocá **Implementar**, autorizá los permisos con tu cuenta de Google y **copiá la URL de la aplicación web** (termina en `/exec`).

5. **Conectar en el Panel de Control**:
   - Entrá a la web de Divina Locura, abrí el **Panel de Control → ⚙️ Configuración**.
   - En la primera tarjeta (**☁️ Base de Datos en Google Sheets**), pegá la URL que copiaste, poné el mail de Elena para recibir avisos automáticos de cada pedido y tocá **☁️ Conectar y Sincronizar con Google Sheets**.
   - Tocá **📤 Subir Datos Actuales a la Planilla** la primera vez para que se creen automáticamente las 10 pestañas con colores y formato en tu planilla (`Pedidos`, `Clientas`, `Mensajes`, `Stock de Piezas`, `Telas e Insumos`, `Gastos`, `Producción`, `Productos`, `Ajustes` y `Visitas`).

---

## 📸 Parte 2: Las 3 Formas de Subir Fotos Nuevas a la Página

### Opción 1: Pasármelas directamente por acá en el Chat (la más cómoda para vos)
- Adjuntá las fotos nuevas directamente en nuestro chat (podés subir varias juntas o un `.zip`) y decime a qué producto corresponden o qué precio/nombre querés ponerles.
- Yo mismo las recorro, las optimizo para que carguen rápido, las agrego a `assets/images/` y las dejo publicadas en GitHub Pages.

### Opción 2: Subirlas desde el celular o compu en el Panel de Control (`📸 Creaciones`)
- Entrá al **Panel de Control → 📸 Creaciones** y tocá **+ Nueva Creación Artesanal** (o **✏️ Editar / Fotos** en un producto existente).
- En el cuadro **📸 Fotos de la Creación (Hasta 4 Vistas)**, tocá el botón **📁 Subir foto** y elegí la foto desde la galería de tu celular o desde tu computadora.
- El sistema comprime la foto automáticamente para que no pese de más y, si conectaste Google Sheets, **la sube directo a una carpeta de tu Google Drive** llamada `Divina Locura Deco - Fotos de la Web` y publica el enlace en toda la tienda.

### Opción 3: Desde la misma Tienda Pública (Modo Edición Rápida)
- Cuando iniciás sesión como **Elena** o **Juanma**, arriba de cada producto del catálogo aparece el botón **✏️ Editar**.
- Al tocarlo se abre el editor con las 4 vistas donde también podés tocar **📁 Subir foto** y guardar al instante.
