# Informe Estratégico de Diseño, Arquitectura Web y Marketing Visual
**Proyecto:** Divina Locura Deco (Emprendimiento de Elena)  
**Versión:** 2.0 Editorial Boutique & Lookbook Digital  
**Inspiración Principal:** Anthropologie & Zara Home  
**Referencias Complementarias:** The Citizenry, Glassette, West Elm, Rowen & Wren

---

## 1. Arquitectura Web y Referencias de Inspiración (UI/UX)

Para que la tienda digital transmita la misma calidez, exclusividad y cuidado artesanal que los productos físicos confeccionados por Elena, la arquitectura web se distancia radicalmente de los e-commerce masivos e impersonales para adoptar el concepto de **boutique digital o lookbook editorial**.

### Referencias Clave de Inspiración

* **Anthropologie:** Referente fundamental por su estética bohemia y poética, uso generoso del espacio en blanco (`padding` y `margin` amplios), tipografías elegantes (serifas con remate fino y sans-serif geométricas espaciadas), y una presentación artística de las colecciones textiles mediante fichas editoriales, notas de taller y narrativas de confección.
* **Zara Home y H&M Home:** Modelos para estructurar catálogos limpios, ordenados por categorías funcionales y atmósferas vivas, donde la neutralidad del diseño (tonos marfil, arena y lino crudo) hace resaltar la riqueza y textura de los tejidos. Su cabecera minimalista (menú hamburguesa discreto, logo tipográfico Didone, buscador subrayado y botones de texto) aporta serenidad y sofisticación.
* **The Citizenry y Glassette:** Inspiración para destacar el valor de la artesanía de autor, el comercio local, la producción consciente ("slow deco") y los detalles hechos a mano con un enfoque sofisticado y contemporáneo.
* **West Elm y Rowen and Wren:** Referencias de "modernismo orgánico" y estilo rústico-chic, que definen la paleta de colores tierra, arena, tiza y madera natural.

### Estructura de la Arquitectura Implementada

1. **Encabezado Minimalista (Hero Section & Header Zara Home):**
   * Encabezado despejado con menú lateral deslizable (*drawer* con desenfoque de fondo), logotipo Didone en mayúsculas espaciadas, campo de búsqueda en vivo con línea inferior y botones limpios (`INICIAR SESIÓN`, `AYUDA`, `WHATSAPP`).
   * Hero cinematográfico a sangre completa (`hero-textile.jpg`) con tipografía serifada contundente (*"El arte del detalle. Diseño hecho a mano para abrazar tu hogar"*), eslogan de autor y navegación horizontal inferior que filtra el catálogo dinámicamente y realiza scroll suave.

2. **Categorías Artesanales con Previsualización Directa (Inspiración Anthropologie):**
   * Cuadros visuales interactivos con bordes suaves que permiten descubrir las familias de productos por atmósfera antes de sumergirse en el catálogo.

3. **Grilla Asimétrica (Lookbook E-Commerce):**
   * Uso de CSS Grid y Flexbox para romper la monotonía de las tiendas tradicionales. Se alternan tarjetas de producto en tamaño grande (*featured*) y mediano.
   * Cada producto dispone de multivista interactiva (hasta 4 fotografías seleccionadas: con modelo, en ambiente, en mesa y detalle de textura macro).
   * Botón de **"Vista Rápida"** que despliega el modal editorial Lookbook con carrusel, miniaturas, historia de la pieza, ficha técnica y botón de pedido inmediato.

4. **Navegación por Categorías Funcionales:**
   * **Cuidado Personal y Descanso:** Sets de satén antifrizz de seda pura, cofias regulables, antifaces mullidos y scrunchies.
   * **Hogar & Cocina:** Repasadores en nido de abeja 100% algodón puro con guardas vichy y porta rollos acolchados de baño con pasamanería.
   * **Organización & Accesorios:** Organizadores colgantes de pared en liencillo y varilla de madera, nécessaires impermeables y portasani con mosquetón.
   * **Bebés & Infantil:** Muñecas de apego personalizadas con nombre bordado, baberos y toallitas con capucha en doble felpa de algodón hipoalergénico.

5. **Atmósferas & Estilismo ("Espacios que Inspiran Calma"):**
   * Galería editorial de 6 ambientes reales donde conviven armónicamente las piezas textiles, reforzando la inspiración de interiorismo cotidiano.

---

## 2. Estrategia de Marketing Visual y Fotografía de Producto

En el rubro textil artesanal, el cliente no compra únicamente un objeto utilitario, sino la experiencia de calidez, bienestar y orden que ese objeto aporta a su hogar. La estrategia visual se centra en generar un vínculo emocional inmediato.

### Principios de Fotografía Estilo "Lookbook"

* **Iluminación Natural Indirecta:** Descarte total de flashes directos, luces frías o luz artificial de techo. La fotografía recrea la luz suave de la mañana o el atardecer filtrándose por ventanales, generando sombras suaves, cálidas y orgánicas que realzan el relieve de las costuras y los hilados.
* **Paleta Cromática Cohesionada:** Coherencia visual estricta en tonos neutros cálidos: tiza (`#faf7f2`), arena suave (`#f5f0ea`), lino crudo (`#e8dfd5`), terracota artesanal (`#b46a55`) y toques de verde salvia. Se evitan contrastes estridentes o fondos blancos hospitalarios para priorizar la calidez hogareña.
* **Contexto de Uso (Lifestyle Cotidiano):** Cada pieza se contextualiza en la vida real. Un neceser no se exhibe sobre un fondo blanco vacío, sino sobre un pedestal de piedra o madera rústica junto a un cepillo de cerdas naturales, ramas de eucalipto o frascos de vidrio ámbar.

### Integración de Modelos Humanos y Escenarios con Inteligencia Artificial

Para elevar el valor percibido de la marca sin los costos inaccesibles de una producción fotográfica internacional, se diseñó e implementó un flujo de trabajo asistido por IA:

1. **Generación de Entornos Vivos:**
   * Utilización de modelos generativos y herramientas de *Inpainting/Outpainting* de alta resolución para recrear dormitorios luminosos con sábanas de lino, baños spa con tocadores de piedra y nurseries nórdicos con muebles de madera clara.

2. **Modelos Humanos Cotidianos:**
   * Incorporación sutil de figuras humanas interactuando de forma orgánica con las piezas: una mujer colocándose la cofia de satén frente a un espejo cálido, manos acomodando toallas waffle dobladas o una mamá arrullando a su bebé junto a la conejita de apego.
   * Esto humaniza la marca, aporta escala física real a los productos y genera una identificación inmediata en la compradora.

3. **Protección de la Textura y Confección Real de Elena:**
   * La ambientación generativa se aplica a los fondos y el entorno humano, protegiendo con rigurosidad las características reales del producto textil (puntillas, terminaciones de dobladillo, nido de abeja del waffle, satén sedoso y bordados personalizados con nombre) para preservar la autenticidad y honestidad de la propuesta.

---

## 3. Experiencia de Usuario (UX), Clientes & Canales de Conversión

### Sistema de Clientes y Bolsa de Pedidos

1. **Registro e Identificación de Clientes:**
   * Modal accesible desde la cabecera que permite al cliente registrarse con su Nombre, Teléfono/WhatsApp, Email y Dirección de entrega.
   * Al iniciar sesión, la cabecera saluda al cliente por su nombre y recuerda sus datos para agilizar futuros pedidos.
   * Separación transparente entre el acceso de clientes y el acceso administrativo del equipo (Elena & Juanma).

2. **Bolsa de Pedidos (Carrito Boutique):**
   * Panel lateral deslizante que reúne las piezas seleccionadas.
   * Opción de personalización en cada producto (colores de tela, nombres a bordar, especificaciones para ajuar o conejitas).
   * Checkout directo que notifica a Elena instantáneamente por dos vías:
     * **WhatsApp estructurado:** Mensaje con desglose de ítems, variantes, total estimado y datos de contacto de la clienta.
     * **Email automático:** Correo con formato de orden de compra listo para enviar al correo de Elena.

3. **Chatbot Concierge del Taller ("Elena Asistente"):**
   * Asistente virtual ubicado en la esquina inferior de la pantalla para resolver dudas frecuentes en tiempo real:
     * Guía para personalizar bordados y ajuares de bebé.
     * Consejos de lavado y cuidado para telas de satén de seda, lino y algodón waffle.
     * Tiempos de confección artesanal y envíos.
     * Enlace directo para hablar personalmente con Elena por WhatsApp.

---

## 4. Filosofía de Gestión Dual: Elena (Taller) & Juanma (Tecnología)

* **Modo Taller de Elena:**
  * Diseñado específicamente para que Elena gestione su catálogo sin complicaciones técnicas: lenguaje cálido, botones grandes, carga de fotos directa desde el teléfono y tutorial interactivo paso a paso integrado en su barra de control.
  * Módulo de revisión de pedidos recibidos para que Elena pueda ver qué clienta le encargó cada producto y contactarla con un solo toque.

* **Modo Programador de Juanma:**
  * Panel técnico para administración de variables globales, números de WhatsApp, textos promocionales, descargas de respaldo JSON/JS y sincronización con el repositorio GitHub.

---
*Divina Locura Deco — Documento Estratégico de Arquitectura & Identidad de Marca.*
