/**
 * Divina Locura Deco - Base de Datos de Productos & Configuración
 * Contiene la información de catálogo (16 creaciones artesanales con Google Flow),
 * fotos multivista, colores disponibles y textos editoriales.
 */

const CATALOG_SCHEMA_VERSION = '20261118_v2_16posts';

const INITIAL_SITE_SETTINGS = {
  whatsapp_phone: "5491100000000",
  instagram_user: "divina.locura.deco",
  announcement: "Confección artesanal · Piezas únicas elaboradas a fuego lento por Elena",
  gh_token: "",
  hero_eyebrow: "CONFECCIÓN ARTESANAL · BUENOS AIRES",
  hero_title: "El arte del detalle. Diseño hecho a mano para abrazar tu hogar.",
  hero_tagline: "Textiles con alma. Organización y calidez para tu día a día.",
  hero_cta: "Explorar la Colección",
  categories_eyebrow: "Explorar por Colección",
  categories_title: "Categorías Artesanales",
  categories_desc: "Selecciona un rincón para descubrir las piezas confeccionadas en telas nobles por Elena.",
  catalog_eyebrow: "Confección Auténtica de Elena",
  catalog_title: "Colección de Taller",
  catalog_desc: "Artículos utilitarios, blanquería bordada y accesorios hechos a mano con telas nobles y detalles únicos.",
  about_eyebrow: "Manos Creadoras",
  about_title: "Confeccionado por Elena",
  about_lead: "Detrás de cada dobladillo, cada cierre y cada elección de tela está la pasión de Elena por transformar fibras nobles en objetos que brindan serenidad y calidez.",
  about_body: "En Divina Locura Deco no creemos en la producción masiva. Cada pieza se confecciona individualmente en nuestro taller, prelavando las telas para garantizar que mantengan su textura y dimensión original lavado tras lavado.",
  about_quote: "“Coser es una forma de cuidar a quienes habitan el hogar.”",
  about_author: "— Elena",
  about_cta: "Explorar la Colección Completa",
  spaces_eyebrow: "Atmósferas & Calidez · Inspiración Zara Home & Anthropologie",
  spaces_title: "Espacios que Inspiran Calma",
  spaces_desc: "Cómo conviven nuestras piezas textiles en dormitorios, baños y rincones cotidianos de la casa.",
  spaces_cta: "Consultar Asesoramiento Textil para tu Espacio →",
  wa_banner_eyebrow: "¿Tienes una medida especial o consulta?",
  wa_banner_title: "Charlemos directamente por WhatsApp",
  wa_banner_desc: "Te asesoramos personalmente con los colores de telas, combinaciones y confección personalizada para tu espacio.",
  wa_banner_btn: "Escribir a Elena",
  footer_desc: "Textiles artesanales y piezas utilitarias en tela por Elena.",
  footer_copy: "© 2026 Divina Locura Deco — Confección artesanal por Elena. Diseñado con calidez & dedicación."
};

const INITIAL_PRODUCTS = [
  {
    id: 'p1',
    title: 'Set Skincare & Antifrizz Completo',
    category: 'cuidado-personal',
    categoryName: 'Cuidado Personal',
    size: 'large',
    tag: 'Favorito Skincare · Satén',
    texture: 'Satén de seda premium anti-frizz & broderie',
    price: '$ 28.500 ARS · Kit Completo',
    cost: 11200,
    meters: 1.4,
    allowEmbroidery: true,
    availableColors: ['Champán Seda', 'Blanco Lino', 'Rosa Viejo', 'Crudo Natural'],
    desc: 'Cuidado integral para tu piel y cabello. Incluye funda de almohada de satén sedoso para evitar el quiebre al dormir, cofia doble faz regulable (o versión con volados en broderie), antifaz y bolsita de lino artesanal.',
    images: [
      { label: 'Con Modelo', src: 'assets/images/catalog/woman-adjusting-satin-sleep-bonnet.jpg' },
      { label: 'Cofia Blanca', src: 'assets/images/banco/descanso-saten/modelo-cofia-saten-blanca.jpg' },
      { label: 'Cofia Broderie', src: 'assets/images/banco/descanso-saten/modelo-cofia-broderie-volados.jpg' },
      { label: 'Set Completo', src: 'assets/images/catalog/sleep-bonnet-and-mask-on.jpg' }
    ],
    instagram: {
      date: 'Hace 3 días',
      likes: 184,
      caption: 'Buenas tardes por acá! ✨ Les comparto uno de los preferidos indiscutidos del taller: nuestro Set de Satén Sedoso (¡ahora también en blanco nube y edición broderie con volados!). Cada cofia y funda está cortada y confeccionada a mano para que no quiebre el pelo ni absorba tus cremas nocturnas. ¿Qué tono elegís para tu cama?',
      hashtags: '#divinalocura #saténantifrizz #skincareroutine #hechoamano #dormirbien #tallerartesanal',
      comments: [
        { user: 'mariana_home', text: 'Hermosa la calidad Elena, la cofia blanca con voladito es un sueño ✨' },
        { user: 'valen.lifestyle', text: 'Te mandé mensajito al WhatsApp para pedir el mío en champán 💖' }
      ]
    }
  },
  {
    id: 'p2',
    title: 'Repasador Waffle & Toallas con Guarda Floral',
    category: 'hogar',
    categoryName: 'Hogar & Cocina',
    size: 'medium',
    tag: 'Clásico del Taller',
    texture: 'Nido de abeja 100% puro algodón & broderie',
    price: '$ 9.800 ARS · Puro Algodón',
    cost: 4100,
    meters: 0.7,
    allowEmbroidery: true,
    availableColors: ['Crudo Natural', 'Blanco Lino', 'Vichy Arena', 'Verde Salvia'],
    desc: 'Tejido nido de abeja súper absorbente con guardas florales bordadas, broderie calado o cuadrillé vichy y etiqueta artesanal de Divina Locura Deco.',
    images: [
      { label: 'En Banco', src: 'assets/images/catalog/handcrafted-cotton-towels-on-bench.jpg' },
      { label: 'Guarda Floral', src: 'assets/images/banco/blanqueria-toallas/repasador-colgado-guarda-floral-gris.jpg' },
      { label: 'En Baño Broderie', src: 'assets/images/banco/blanqueria-toallas/toalla-blanca-broderie-bano.jpg' },
      { label: 'En Cocina', src: 'assets/images/models/model-waffle-kitchen.jpg' }
    ],
    instagram: {
      date: 'Hace 4 días',
      likes: 152,
      caption: 'El nido de abeja y el algodón puro son de esos clásicos que transforman la cocina y el toilette. Para esta tanda sumamos guardas con flores botánicas en gris humo y terminaciones caladas en broderie blanco con etiqueta cosida a máquina una por una. Secan espectacular ✨',
      hashtags: '#cocinaconencanto #wafflecotton #broderie #repasadores #decohogar #divinalocura',
      comments: [
        { user: 'florencia.b', text: 'Ese detalle con la guarda floral colgada me enamoró!' }
      ]
    }
  },
  {
    id: 'p3',
    title: 'Organizador Colgante de Pared Artesanal',
    category: 'organizacion',
    categoryName: 'Organización',
    size: 'medium',
    tag: 'Diseño Práctico',
    texture: 'Lienzo tramado, madera natural & bolsillos amplios',
    price: '$ 18.500 ARS · A Medida',
    cost: 7600,
    meters: 1.2,
    allowEmbroidery: true,
    availableColors: ['Crudo Natural', 'Vichy Arena', 'Terracota Suave', 'Verde Salvia'],
    desc: 'Ideal para colgar en cuna, cuarto infantil, baño o escritorio de taller. Bolsillos con fuelle espacioso para libros, juguetes, pinceles o elementos diarios siempre ordenados.',
    images: [
      { label: 'Cuarto Infantil', src: 'assets/images/banco/infantil-hogar/nino-cuarto-organizador-floral.jpg' },
      { label: 'En Habitación', src: 'assets/images/catalog/hanging-wall-organizer-in-room.jpg' },
      { label: 'Rayado & Flores', src: 'assets/images/banco/neceseres-organizadores/bolsillero-pared-rayas-flores.jpg' },
      { label: 'Doble Pared', src: 'assets/images/catalog/fabric-wall-organizers-on-wall.jpg' }
    ],
    instagram: {
      date: 'Hace 5 días',
      likes: 192,
      caption: 'El orden visual da paz a toda la casa —y a los chicos les encanta tener sus libros y muñecos al alcance de la mano! 🧸 Diseñé estos bolsilleros en lienzo rústico prelavado con estampas florales, rayitas y varilla de madera natural. Se hacen en la medida exacta de tu pared o cuna.',
      hashtags: '#organizacionhogar #bolsillero #cuartoinfantil #artesanal #decojapandi #espaciocreativo',
      comments: [
        { user: 'luciac_deco', text: 'Queda soñado en la pieza de los chicos! Super práctico 😍' },
        { user: 'estudiomadera', text: 'Excelente combinación de textil y madera natural.' }
      ]
    }
  },
  {
    id: 'p4',
    title: 'Muñecas de Apego & Peluches Bordados',
    category: 'infantil',
    categoryName: 'Bebés & Infantil',
    size: 'large',
    tag: 'Bordado Personalizado',
    texture: 'Algodón hipoalergénico suave & bordado artesanal',
    price: '$ 22.000 ARS · Con Nombre Bordado',
    cost: 8400,
    meters: 0.9,
    allowEmbroidery: true,
    availableColors: ['Crudo Natural', 'Rosa Viejo', 'Terracota Suave', 'Celeste Bebé'],
    desc: 'Compañeros de sueños únicos para bebés y niños. Confeccionados en liencillo y felpa hipoalergénica lavable, con carita bordada puntada por puntada y nombre personalizado.',
    images: [
      { label: 'Hora de Dormir', src: 'assets/images/banco/infantil-hogar/nena-abrazando-muneco-apego-cama.jpg' },
      { label: 'Juego & Apego', src: 'assets/images/banco/infantil-hogar/nina-sueno-muneco-apego.jpg' },
      { label: 'En Repisa', src: 'assets/images/catalog/plush-dolls-on-wooden-shelf.jpg' },
      { label: 'Con Bebé', src: 'assets/images/models/model-baby-nursery.jpg' }
    ],
    instagram: {
      date: 'Hace 6 días',
      likes: 238,
      caption: 'Ver cómo los más chiquitos abrazan su muñeco de tela antes de dormir es la mayor recompensa del taller 🐰🤍 Cada conejito y compañerito lleva tela prelavada súper suave, carita bordada a mano sin botones peligrosos y el nombre del bebé bordado con dedicación.',
      hashtags: '#muñecodeapego #infanciafeliz #bebesyniños #ajuarbebe #regalospersonalizados #divinalocura',
      comments: [
        { user: 'mama_de_ema', text: 'La que le hiciste a Ema duerme con ella todas las noches! Gracias Elena' },
        { user: 'agus_gonzalez', text: 'Cuánto demora el bordado con el nombre de mi sobrina?' }
      ]
    }
  },
  {
    id: 'p5',
    title: 'Antifaces de Descanso Acolchados',
    category: 'cuidado-personal',
    categoryName: 'Cuidado Personal',
    size: 'medium',
    tag: 'Descanso Sereno · Satén',
    texture: 'Satén premium, guata mullida & elástico forrado',
    price: '$ 11.500 ARS · Satén Anti-frizz',
    cost: 4300,
    meters: 0.5,
    allowEmbroidery: true,
    availableColors: ['Champán Seda', 'Terracota Suave', 'Chocolate', 'Verde Salvia'],
    desc: 'Bloquean completamente la luz para un sueño profundo y reparador. Rellenos de guata liviana con elástico forrado en satén a tono o contraste para cuidar el cabello.',
    images: [
      { label: 'Terracota & Salvia', src: 'assets/images/catalog/sleep-mask-on-wooden-surface.jpg' },
      { label: 'Set Bordado', src: 'assets/images/catalog/woman-touching-satin-sleep-mask.jpg' },
      { label: 'En Mármol', src: 'assets/images/catalog/satin-sleep-mask-on-marble.jpg' },
      { label: 'Cobre en Pedestal', src: 'assets/images/catalog/sleep-mask-on-beige-surface.jpg' }
    ],
    instagram: {
      date: 'Hace 1 semana',
      likes: 167,
      caption: 'Para quienes valoran la oscuridad absoluta al dormir o descansar en viaje ✨ Los armamos combinando satén terracota con elástico en salvia, champán perla o cobre satinado. No marcan la cara ni tiran del pelo, y podés sumarle su neceser floral haciendo juego.',
      hashtags: '#antifaz #descansoperfecto #satén #bienestar #viajes #hechoamano',
      comments: [
        { user: 'sofia_paz', text: 'El terracota con elástico salvia es una combinación preciosa!' }
      ]
    }
  },
  {
    id: 'p6',
    title: 'Neceseres Botánicos, Tocador & Portasani',
    category: 'organizacion',
    categoryName: 'Organización & Accesorios',
    size: 'medium',
    tag: 'Básico Esencial · Lino',
    texture: 'Lino floral, forro impermeable & posavasos haciendo juego',
    price: '$ 13.200 ARS · Lino Rústico',
    cost: 5400,
    meters: 0.65,
    allowEmbroidery: true,
    availableColors: ['Crudo Natural', 'Rosa Viejo', 'Verde Salvia', 'Blanco Lino'],
    desc: 'Neceseres confeccionados en linos florales con interior impermeable lavable, cierre reforzado con tirador artesanal y opción de set tocador o porta-sanitizante.',
    images: [
      { label: 'En Pedestal', src: 'assets/images/catalog/cosmetic-pouch-on-stone-pedestal.jpg' },
      { label: 'Set Posavasos', src: 'assets/images/catalog/cosmetic-pouch-on-linen-cloth.jpg' },
      { label: 'En Tocador', src: 'assets/images/banco/descanso-saten/modelo-tocador-neceser-skincare.jpg' },
      { label: 'Portasani & Bolso', src: 'assets/images/models/model-bag-sanitizer.jpg' }
    ],
    instagram: {
      date: 'Hace 1 semana',
      likes: 194,
      caption: 'Lo que llevamos en la cartera o dejamos en el vanitory también merece ser lindo 🌸 Estos nécessaires tienen interior impermeable lavable por si se abre un sérum o labial, tirador reforzado y hasta podemos sumar posavasos o portasani con la misma tela.',
      hashtags: '#necessaire #cartuchera #accesoriosdemoda #linoartesanal #organizatucartera',
      comments: [
        { user: 'camila_b', text: 'El estampado de flores con el juego de posavasos quedó divino!' }
      ]
    }
  },
  {
    id: 'p7',
    title: 'Ajuar de Bebé & Toallitas con Nombre',
    category: 'infantil',
    categoryName: 'Bebés & Maternidad',
    size: 'large',
    tag: 'Ajuar de Nacimiento',
    texture: 'Toalla doble felpa, algodón puro & bordado a mano',
    price: '$ 24.500 ARS · Ajuar Doble Felpa',
    cost: 9600,
    meters: 1.5,
    allowEmbroidery: true,
    availableColors: ['Crudo Natural', 'Celeste Bebé', 'Rosa Viejo', 'Blanco Lino'],
    desc: 'Piezas hipoalergénicas ultra suaves para recibir al bebé: toallones con capucha, babitas en doble felpa de algodón puro y organizadores de cuna con orejitas bordadas.',
    images: [
      { label: 'Conejito Ajuar', src: 'assets/images/catalog/embroidered-bunny-fabric-organiz.jpg' },
      { label: 'Con Bebé', src: 'assets/images/models/model-towel-baby.jpg' },
      { label: 'Rincón Nursery', src: 'assets/images/catalog/nursery-products-displayed-on-shelf.jpg' },
      { label: 'Cesto Algodón', src: 'assets/images/cat-baskets.jpg' }
    ],
    instagram: {
      date: 'Hace 2 semanas',
      likes: 245,
      caption: 'Preparar la llegada de un bebé es de los momentos más emocionantes en el taller 🤍 Cada toallita con capucha, babita y bolsillero de orejitas se confecciona en algodón hipoalergénico y se borda con el nombre elegido en letra cursiva delicada.',
      hashtags: '#maternidad #ajuarbebe #toallaspersonalizadas #bordadoartesanal #embarazo',
      comments: [
        { user: 'abuelafeliz', text: 'Le regalé el set a mi primera nieta y los papás quedaron fascinados.' }
      ]
    }
  },
  {
    id: 'p8',
    title: 'Porta Rollos & Pañuelos Cilíndrico Acolchado',
    category: 'hogar',
    categoryName: 'Hogar & Baño',
    size: 'medium',
    tag: 'Detalle de Baño · Exclusivo',
    texture: 'Tela trama chevron, lino bordado, cierre y puntilla',
    price: '$ 15.800 ARS · Lino & Puntilla',
    cost: 6200,
    meters: 0.75,
    allowEmbroidery: false,
    availableColors: ['Terracota Suave', 'Crudo Natural', 'Vichy Arena', 'Gris Perla'],
    desc: 'Dispenser de pañuelos o porta rollos cilíndrico confeccionado en tela acolchada trama espiga/chevron con cierre superior, ojal bordado y detalle de puntillas.',
    images: [
      { label: 'Chevron Terracota', src: 'assets/images/banco/neceseres-organizadores/porta-rollos-cilindrico-chevron.jpg' },
      { label: 'En Baño', src: 'assets/images/models/model-bath-roll.jpg' },
      { label: 'Cesto Tocador', src: 'assets/images/banco/neceseres-organizadores/cesto-floral-bordado-ambiente.jpg' },
      { label: 'Guarda Broderie', src: 'assets/images/banco/blanqueria-toallas/toalla-blanca-bacha-piedra.jpg' }
    ],
    instagram: {
      date: 'Hace 2 semanas',
      likes: 168,
      caption: 'Para que cada rincón del baño, el toilette o la mesita de luz tenga calidez y prolijidad ✨ Mirá cómo quedó este porta pañuelos cilíndrico en tela espiga terracota y arena con cierre reforzado para recargar el rollo en segundos.',
      hashtags: '#bañodeco #portapanuelos #detallesqueenamoran #costuracreativa #hogarconestilo #divinalocura',
      comments: [
        { user: 'patricia_deco', text: 'Qué buena idea para tener los pañuelos lindos arriba de la mesa!' }
      ]
    }
  },
  {
    id: 'p9',
    title: 'Juegos de Toallas & Toallones Bordados con Puntilla',
    category: 'hogar',
    categoryName: 'Hogar & Baño',
    size: 'medium',
    tag: 'Bordado & Iniciales · Nuevo',
    texture: 'Toalla 500gr doble felpa, lino, broderie & encaje guipur',
    price: '$ 26.800 ARS · Juego 2 Piezas',
    cost: 11800,
    meters: 1.6,
    allowEmbroidery: true,
    availableColors: ['Terracota Suave', 'Gris Topo', 'Rosa Viejo', 'Crudo Natural', 'Blanco Lino'],
    desc: 'Dúos de toalla de rostro y toallón de cuerpo en doble felpa gruesa, intervenidos con guardas de lino, iniciales bordadas (MG, MR), nombres infantiles con volados o encaje guipur.',
    images: [
      { label: 'Terracota Iniciales', src: 'assets/images/banco/blanqueria-toallas/toallas-terracota-iniciales-meg.jpg' },
      { label: 'Set Gris M.R.', src: 'assets/images/banco/blanqueria-toallas/toallas-gris-iniciales-mr-banco.jpg' },
      { label: 'Infantil Emmita', src: 'assets/images/banco/blanqueria-toallas/toallas-rosa-emmita-mariposa.jpg' },
      { label: 'Guarda Guipur', src: 'assets/images/banco/blanqueria-toallas/toalla-terracota-encaje-guipur.jpg' }
    ],
    instagram: {
      date: 'Hoy · Novedad del Taller',
      likes: 214,
      caption: 'Recién salidos de la máquina bordadora 🪡✨ Armamos estos juegos completos de toalla y toallón personalizados con iniciales (como estos en gris topo M.R. y terracota con corona floral), o en rosa con volados, mariposas y nombre para los más peques. ¿Qué iniciales querés bordar?',
      hashtags: '#toallasbordadas #iniciales #blanqueriadeautor #regalospersonalizados #divinalocuradeco',
      comments: [
        { user: 'claudia.v', text: 'Me morí con el juego de Emmita y el de las iniciales en gris con bies ✨' },
        { user: 'noelia_arq', text: 'El terracota con la guarda de guipur es digno de hotel boutique!' }
      ]
    }
  },
  {
    id: 'p10',
    title: 'Cajas de Regalo "Mandala Calada" con Blanquería',
    category: 'hogar',
    categoryName: 'Regalería de Autor',
    size: 'large',
    tag: 'Caja Mandala · Edición Regalo',
    texture: 'Toallón bordado, botón de madera, pasamanería dorada & caja calada',
    price: '$ 32.500 ARS · Caja Presentación',
    cost: 14200,
    meters: 1.5,
    allowEmbroidery: true,
    availableColors: ['Crudo Natural', 'Terracota Suave', 'Rosa Viejo', 'Blanco Lino'],
    desc: 'Presentación de lujo en caja rígida blanca con tapa ventana calada en forma de mandala. Incluye toallón artesanal con mandala bordada, botones de coco/madera y puntillas a mano.',
    images: [
      { label: 'Caja Mandala Blanca', src: 'assets/images/banco/cajas-regalo/caja-toalla-mandala-blanca.jpg' },
      { label: 'Pasamanería Dorada', src: 'assets/images/banco/cajas-regalo/caja-toalla-terracota-dorada.jpg' },
      { label: 'Set Rosa Volados', src: 'assets/images/banco/cajas-regalo/caja-set-rosa-volados.jpg' },
      { label: 'Tapa Calada', src: 'assets/images/banco/cajas-regalo/caja-regalo-tapa-mandala-calada.jpg' }
    ],
    instagram: {
      date: 'Hace 1 día',
      likes: 263,
      caption: 'Cuando hacés un regalo pensado con el corazón, la presentación lo es todo 🎁🌸 Estas cajas con ventana calada en mandala dejan asomar el bordado del toallón, los botoncitos de madera y las puntillas doradas o broderie antes siquiera de abrirlas. ¡Listas para agasajar!',
      hashtags: '#cajaderegalo #regalosunicos #mandala #diadelamadre #casamientos #divinalocura',
      comments: [
        { user: 'veronica_m', text: 'Quedé como una reina cuando regalé la caja con la guarda dorada 💖' },
        { user: 'sol.decor', text: 'Esa caja blanca calada es una obra de arte!' }
      ]
    }
  },
  {
    id: 'p11',
    title: 'Tote Bags de Lienzo Puro con Bordado Botánico',
    category: 'organizacion',
    categoryName: 'Bolsos & Paseo',
    size: 'large',
    tag: 'Bordado a Mano · Nuevo',
    texture: 'Lienzo pesado 100% algodón prelavado & hilos bordados',
    price: '$ 19.500 ARS · Lienzo Prelavado',
    cost: 7800,
    meters: 1.1,
    allowEmbroidery: true,
    availableColors: ['Crudo Natural', 'Blanco Lino', 'Vichy Arena'],
    desc: 'Bolsos tote amplios y resistentes en lienzo crudo grueso con manijas reforzadas e ilustraciones bordadas en relieve: flores silvestres, margaritas, gatitos, corazones o valijas vintage.',
    images: [
      { label: 'Con Modelo', src: 'assets/images/banco/bolsos-totes/modelo-bolso-tote-bordado-casa.jpg' },
      { label: 'Flores Fucsias', src: 'assets/images/banco/bolsos-totes/tote-lienzo-flores-fucsias.jpg' },
      { label: 'Margarita Solar', src: 'assets/images/banco/bolsos-totes/tote-lienzo-margarita-sol.jpg' },
      { label: 'Gatito Floral', src: 'assets/images/banco/bolsos-totes/tote-lienzo-gatito-negro.jpg' }
    ],
    instagram: {
      date: 'Hace 1 día',
      likes: 207,
      caption: 'Livianas para llevar todo el día, súper firmes para libros o compu y tan lindas que levantan cualquier look de mañana 🌿✨ Estrenamos nuestra nueva línea de Tote Bags en lienzo puro con bordados de flores, margaritas, corazones y gatitos con la firma del taller.',
      hashtags: '#totebag #bolsodelienzo #bordadoartesanal #modasustentable #paseos #divinalocura',
      comments: [
        { user: 'julietar_uy', text: 'El del gatito negro y el de las flores fucsias los necesito ya!! 😻' },
        { user: 'martina.s', text: 'Se lavan re bien y no pierden forma, ya tengo dos!' }
      ]
    }
  },
  {
    id: 'p12',
    title: 'Bolsos Circulares & Carteras Patchwork de Autor',
    category: 'organizacion',
    categoryName: 'Carteras & Diseño',
    size: 'medium',
    tag: 'Piezas Únicas · Patchwork',
    texture: 'Lino verde petróleo, denim patchwork & cuadrillé arena',
    price: '$ 28.900 ARS · Diseño de Autor',
    cost: 12400,
    meters: 1.3,
    allowEmbroidery: false,
    availableColors: ['Verde Esmeralda', 'Gris Topo', 'Vichy Arena', 'Terracota Suave'],
    desc: 'Carteras y bolsos de diseño independiente: formato circular con bolsillo patchwork cuadrillé o lino minimalista, modelo estructurado en lino verde esmeralda con mandala y denim artesanal.',
    images: [
      { label: 'Circular Cuadrillé', src: 'assets/images/banco/bolsos-totes/bolso-circular-patchwork-cuadrille.jpg' },
      { label: 'Verde Esmeralda', src: 'assets/images/banco/bolsos-totes/bolso-verde-esmeralda-mandala.jpg' },
      { label: 'Denim Patchwork', src: 'assets/images/banco/bolsos-totes/cartera-denim-patchwork-flores.jpg' },
      { label: 'Circular Lino Topo', src: 'assets/images/banco/bolsos-totes/bolso-circular-lino-topo.jpg' }
    ],
    instagram: {
      date: 'Hace 2 días',
      likes: 189,
      caption: 'Piezas irrepetibles cortadas y ensambladas en la mesa del taller ✂️👜 Combinamos cuadrillé tejido con lino arena en nuestro bolso circular, creamos el modelo estructurado en verde esmeralda con mandala aplicada y rescatamos denim con patchwork floral multicolor.',
      hashtags: '#carterasartesanales #patchwork #diseñodeautor #bolsocircular #hechoenbuenosaires',
      comments: [
        { user: 'ale_diseno', text: 'Ese bolso verde esmeralda y el circular cuadrillé son increíbles!' }
      ]
    }
  },
  {
    id: 'p13',
    title: 'Organizador Portátil Manija Circular & Bolsillos',
    category: 'organizacion',
    categoryName: 'Organización Portátil',
    size: 'medium',
    tag: 'Costura, Maquillaje & Auto',
    texture: 'Gabardina floral, cuerpo acolchado con guata & bolsillo cristal',
    price: '$ 17.400 ARS · Manija Madera/Tela',
    cost: 7100,
    meters: 0.85,
    allowEmbroidery: true,
    availableColors: ['Vichy Arena', 'Rosa Viejo', 'Verde Esmeralda', 'Crudo Natural'],
    desc: 'Organizador colgante o de mano con práctica manija circular ribeteada al bies y múltiples bolsillos frontales (opción bolsillo cristal transparente) ideal para costurero, brochas, tejido o auto.',
    images: [
      { label: 'Botánico Arena', src: 'assets/images/banco/neceseres-organizadores/organizador-manija-circular-botanico.jpg' },
      { label: 'Liberty Rosa', src: 'assets/images/banco/neceseres-organizadores/organizador-manija-circular-liberty-rosa.jpg' },
      { label: 'Floral Menta', src: 'assets/images/banco/neceseres-organizadores/organizador-manija-circular-menta.jpg' },
      { label: 'Bolsillo Cristal', src: 'assets/images/banco/neceseres-organizadores/organizador-manija-circular-cristal.jpg' }
    ],
    instagram: {
      date: 'Hace 2 días',
      likes: 175,
      caption: 'Uno de los inventos más pedidos del taller 💡 Lo colgás de un percherito, del picaporte, en el baño o detrás del respaldo del auto y tenés todo ordenado a la vista! Viene en gabardina floreada, liberty con vivo coral o fondo oscuro con vivo menta.',
      hashtags: '#organizadorportatil #costurero #maquillajeordenado #accesoriospracticos #divinalocuradeco',
      comments: [
        { user: 'carla.tejidos', text: 'Lo uso para mis agujas de crochet y tijeritas, es lo más cómodo que hay!' }
      ]
    }
  },
  {
    id: 'p14',
    title: 'Canastas & Cestos Organizadores con Manijas',
    category: 'hogar',
    categoryName: 'Organización & Tocador',
    size: 'medium',
    tag: 'Orden Cálido · Lino & Flores',
    texture: 'Lienzo reversible estampado, arpillera fina & bordado floral',
    price: '$ 14.200 ARS · Set x2 Canastas',
    cost: 5600,
    meters: 0.9,
    allowEmbroidery: true,
    availableColors: ['Crudo Natural', 'Rosa Viejo', 'Vichy Arena', 'Verde Salvia'],
    desc: 'Contenedores flexibles y firmes con doble capa de tela, manijas cosidas y borde rebatible. Perfectos para algodones en el baño, pañales, ovillos, llaves o ropa doblada.',
    images: [
      { label: 'Colección 5 Estampas', src: 'assets/images/banco/neceseres-organizadores/coleccion-canastas-estampadas-manijas.jpg' },
      { label: 'Dúo Arpillera', src: 'assets/images/banco/neceseres-organizadores/duo-cestos-lienzo-y-arpillera.jpg' },
      { label: 'Cesto Bordado', src: 'assets/images/banco/neceseres-organizadores/cesto-floral-bordado-ambiente.jpg' },
      { label: 'Flores Blancas', src: 'assets/images/banco/neceseres-organizadores/cesto-bordado-flores-blancas.jpg' }
    ],
    instagram: {
      date: 'Hace 3 días',
      likes: 161,
      caption: 'Canastitas que abrazan el orden en cada repisa y mesa de luz 🧺🌿 Se confeccionan con interior de lienzo crudo reforzado para que mantengan su forma solas y exterior en estampas botánicas, corazones o arpillera rústica con bordados blancos.',
      hashtags: '#canastastextiles #cestosdetela #ordenhogar #organizacionbano #hechoamano',
      comments: [
        { user: 'paulita_g', text: 'Las usé en el cambiador del bebé y después en mi vestidor, las amo!' }
      ]
    }
  },
  {
    id: 'p15',
    title: 'Cubrecama Waffle Natural & Cubre Sillón Mandala',
    category: 'hogar',
    categoryName: 'Dormitorio & Living',
    size: 'large',
    tag: 'Textil Mayor · A Medida',
    texture: 'Waffle nido de abeja pesado, liencillo rústico & bordado mandala',
    price: '$ 54.000 ARS · A Medida de Cama/Sillón',
    cost: 24500,
    meters: 3.4,
    allowEmbroidery: false,
    availableColors: ['Crudo Natural', 'Blanco Lino', 'Vichy Arena', 'Gris Perla'],
    desc: 'Textiles protagonistas para vestir la habitación y el living: pie de cama / cubrecama en nido de abeja grueso con almohadones bordados y funda cubre sillón en liencillo con mandala central.',
    images: [
      { label: 'Cama Waffle Natural', src: 'assets/images/banco/blanqueria-toallas/cubrecama-waffle-y-almohadones-bordados.jpg' },
      { label: 'Cubre Sillón Mandala', src: 'assets/images/banco/infantil-hogar/funda-sillon-liencillo-mandala.jpg' },
      { label: 'Living Cálido', src: 'assets/images/banco/infantil-hogar/editorial-mujer-living-mantas.jpg' },
      { label: 'Momento Calma', src: 'assets/images/banco/infantil-hogar/editorial-lectura-calma-hogar.jpg' }
    ],
    instagram: {
      date: 'Hace 4 días',
      likes: 229,
      caption: 'Nada transforma tanto la energía de un ambiente como una buena textura natural en la cama o en ese sillón favorito de lectura ☕🤍 Confeccionamos cubrecamas en waffle pesado, fundas de almohadón bordadas y cubre sillones a medida con mandalas caladas.',
      hashtags: '#dormitoriozarahome #piedecama #wafflebedding #cubresillon #calidez #divinalocura',
      comments: [
        { user: 'estela_decora', text: 'Ese cubre sillón con la mandala blanca bordada es mi sueño para el living!' }
      ]
    }
  },
  {
    id: 'p16',
    title: 'Estuche Iniciales "L.P." & Neceseres Medialuna de Lino',
    category: 'organizacion',
    categoryName: 'Personalizados · Lino',
    size: 'medium',
    tag: 'Iniciales & Crochet · Nuevo',
    texture: 'Arpillera fina, lino natural, bies floral & aplicación crochet',
    price: '$ 16.500 ARS · Con Iniciales / Crochet',
    cost: 6800,
    meters: 0.7,
    allowEmbroidery: true,
    availableColors: ['Crudo Natural', 'Terracota Suave', 'Vichy Arena', 'Gris Topo'],
    desc: 'Sobres y neceseres en formato medialuna o estuche amplio con iniciales bordadas en terracota y bies floreado, o intervenidos con mandalas al crochet, estrellitas y trazos orgánicos.',
    images: [
      { label: 'Iniciales LP & Bies', src: 'assets/images/banco/neceseres-organizadores/estuche-lino-iniciales-lp-bies.jpg' },
      { label: 'Mandala Crochet', src: 'assets/images/banco/neceseres-organizadores/neceser-medialuna-mandala-crochet.jpg' },
      { label: 'Trazos Azules', src: 'assets/images/banco/neceseres-organizadores/neceser-medialuna-trazos-azules.jpg' },
      { label: 'Lienzo Estrellitas', src: 'assets/images/banco/neceseres-organizadores/neceser-medialuna-estrellitas.jpg' }
    ],
    instagram: {
      date: 'Hace 5 días',
      likes: 181,
      caption: 'Pequeños tesoros pensados con tu identidad ✨ Desde el estuche grande en lino con iniciales bordadas y bies de florcitas hasta las medialunas con mandala tejida al crochet a mano, estrellitas negras o trazos botánicos en azul profundo.',
      hashtags: '#neceserpersonalizado #inicialesbordadas #crochet #lino #regaloconamor #divinalocura',
      comments: [
        { user: 'laura.p', text: 'Justo mis iniciales LP!! Lo quiero para guardar mi agenda y lapiceras 💖' }
      ]
    }
  }
];
