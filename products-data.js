/**
 * Divina Locura Deco - Base de Datos Inicial de Productos
 * Contiene la información de catálogo, fotos multivista y posteo estilo Instagram para cada producto.
 */

const INITIAL_PRODUCTS = [
  {
    id: 'p1',
    title: 'Set Skincare & Antifrizz Completo',
    category: 'cuidado-personal',
    categoryName: 'Cuidado Personal',
    size: 'large',
    tag: 'Favorito Skincare · Satén',
    texture: 'Satén de seda premium anti-frizz',
    price: 'Consultar Colores / kit completo',
    desc: 'Cuidado integral para tu piel y cabello. Incluye funda de almohada de satén sedoso para evitar el quiebre y las marcas al dormir, cofia doble faz regulable, scrunchies y bolsita de lino artesanal.',
    images: [
      { label: 'Con Modelo', src: 'assets/images/catalog/woman-adjusting-satin-sleep-bonnet.jpg' },
      { label: 'Set Completo', src: 'assets/images/catalog/sleep-bonnet-and-mask-on.jpg' },
      { label: 'En Cama', src: 'assets/images/models/model-satin-skincare.jpg' },
      { label: 'Detalle Taller', src: 'assets/images/real-satin-skincare-set.jpg' }
    ],
    instagram: {
      date: 'Hace 3 días',
      likes: 184,
      caption: 'Buenas tardes por acá! ✨ Les comparto uno de los preferidos indiscutidos del taller: nuestro Set de Satén Sedoso. Cada cofia y funda está cortada y confeccionada a mano cuidando cada detalle para que no quiebre el pelo ni absorba las cremas de noche. ¿Qué color te gustaría tener en tu cama?',
      hashtags: '#divinalocura #saténantifrizz #skincareroutine #hechoamano #dormirbien #tallerartesanal',
      comments: [
        { user: 'mariana_home', text: 'Hermosa la calidad Elena, me cambió el pelo por completo! ✨' },
        { user: 'valen.lifestyle', text: 'Te mandé mensajito al WhatsApp para pedir el mío en champán 💖' }
      ]
    }
  },
  {
    id: 'p2',
    title: 'Repasador Waffle con Guarda Vichy',
    category: 'hogar',
    categoryName: 'Hogar & Cocina',
    size: 'medium',
    tag: 'Clásico del Taller',
    texture: 'Nido de abeja 100% puro algodón',
    price: 'Confección a Mano',
    desc: 'Tejido nido de abeja súper absorbente con detalle en cuadrillé mostaza, verde o chocolate y etiqueta artesanal de Divina Locura Deco.',
    images: [
      { label: 'En Banco', src: 'assets/images/catalog/handcrafted-cotton-towels-on-bench.jpg' },
      { label: 'En Cocina', src: 'assets/images/models/model-waffle-kitchen.jpg' },
      { label: 'Pila Waffle', src: 'assets/images/cat-waffle.jpg' },
      { label: 'Detalle Taller', src: 'assets/images/real-waffle-dishcloth.jpg' }
    ],
    instagram: {
      date: 'Hace 4 días',
      likes: 139,
      caption: 'El nido de abeja 100% algodón es de esos clásicos que nunca pasan de moda. Para esta tanda elegí guardas en vichy mostaza y verde oliva con terminación a contratono y etiquetas cosidas a máquina una a una. Secan espectacular y decoran la mesada con calidez.',
      hashtags: '#cocinaconencanto #wafflecotton #cuadrillevichy #repasadores #decohogar #divinalocura',
      comments: [
        { user: 'florencia.b', text: 'Ese detalle en vichy es una locura de lindo!' }
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
    texture: 'Tela tramada, madera & bolsillos',
    price: 'A Medida',
    desc: 'Ideal para colgar en cuna, dormitorio, baño o taller. Cuenta con bolsillos reforzados para tener libros, accesorios o artículos diarios ordenados.',
    images: [
      { label: 'En Habitación', src: 'assets/images/catalog/hanging-wall-organizer-in-room.jpg' },
      { label: 'En Pared', src: 'assets/images/catalog/fabric-wall-organizers-on-wall.jpg' },
      { label: 'En Mesa', src: 'assets/images/catalog/fabric-organizer-pockets-on-tabl.jpg' },
      { label: 'Detalle Taller', src: 'assets/images/real-pvc-organizer.jpg' }
    ],
    instagram: {
      date: 'Hace 5 días',
      likes: 156,
      caption: 'El orden visual da paz al hogar. Diseñé este organizador con varilla de madera natural y bolsillos con fuelle espacioso para libros infantiles, cremas, toallitas o elementos de trabajo. Hecho en liencillo rústico prelavado para que no encoja.',
      hashtags: '#organizacionhogar #bolsillero #artesanal #decojapandi #espaciocreativo',
      comments: [
        { user: 'luciac_deco', text: 'Queda soñado en la pieza de los chicos 😍' },
        { user: 'estudiomadera', text: 'Excelente combinación de textil y madera.' }
      ]
    }
  },
  {
    id: 'p4',
    title: 'Muñecas de Apego Conejitas Personalizadas',
    category: 'infantil',
    categoryName: 'Bebés & Infantil',
    size: 'large',
    tag: 'Bordado Personalizado',
    texture: 'Algodón suave & bordado artesanal',
    price: 'Personalizado / con nombre',
    desc: 'Compañeras de sueños únicas para los más pequeños. Confeccionadas en suave liencillo de algodón con vestidos en rayas o flores, y el nombre de la niña o bebé bordado a mano con dedicación.',
    images: [
      { label: 'En Repisa', src: 'assets/images/catalog/plush-dolls-on-wooden-shelf.jpg' },
      { label: 'Con Bebé', src: 'assets/images/models/model-baby-nursery.jpg' },
      { label: 'Nursery', src: 'assets/images/catalog/nursery-products-displayed-on-shelf.jpg' },
      { label: 'Detalle Taller', src: 'assets/images/real-baby-rabbit-doll.jpg' }
    ],
    instagram: {
      date: 'Hace 6 días',
      likes: 218,
      caption: 'Cada conejita que sale del taller lleva una historia. Vestidito de liencillo en rayitas, carita bordada a mano puntada por puntada y el nombre del bebé bordado en su corazón. Son hipoalergénicas, súper suaves y lavables. Un recuerdo que guardan toda la vida 🐰🤍',
      hashtags: '#muñecodeapego #conejita #bebesyniños #ajuarbebe #regalospersonalizados #divinalocura',
      comments: [
        { user: 'mama_de_ema', text: 'La que le hiciste a Ema duerme con ella todas las noches! Gracias Elena' },
        { user: 'agus_gonzalez', text: 'Cuánto demora el bordado con nombre personalizado?' }
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
    texture: 'Satén premium, felpa suave & elástico forrado',
    price: 'Varios Tonos / hecho a mano',
    desc: 'Bloquean completamente la luz para un sueño profundo y reparador. Su elástico forrado en satén cuida el cabello y no deja marcas en el rostro.',
    images: [
      { label: 'En Mármol', src: 'assets/images/catalog/satin-sleep-mask-on-marble.jpg' },
      { label: 'Con Modelo', src: 'assets/images/catalog/woman-touching-satin-sleep-mask.jpg' },
      { label: 'En Madera', src: 'assets/images/catalog/sleep-mask-on-wooden-surface.jpg' },
      { label: 'Detalle Taller', src: 'assets/images/real-sleep-mask.jpg' }
    ],
    instagram: {
      date: 'Hace 1 semana',
      likes: 167,
      caption: 'Para quienes valoran la oscuridad absoluta al dormir o durante una siesta reparadora. Forrados en satén de tacto sedoso y rellenos de guata mullida que no ejerce presión sobre los párpados. Viene con su bolsita de guardado para llevar de viaje.',
      hashtags: '#antifaz #descansoperfecto #satén #bienestar #viajes #hechoamano',
      comments: [
        { user: 'sofia_paz', text: 'No puedo viajar sin el mío, es comodísimo!' }
      ]
    }
  },
  {
    id: 'p6',
    title: 'Neceseres, Cartucheras & Portasani',
    category: 'organizacion',
    categoryName: 'Organización & Accesorios',
    size: 'medium',
    tag: 'Básico Esencial · Lino',
    texture: 'Lino rústico, forro impermeable & cierre reforzado',
    price: 'Personalizado / varios tamaños',
    desc: 'Confeccionados en telas tramadas con forro interior lavable para maquillaje, elementos de aseo o papelería. Incluye opción con mosquetón metálico para enganchar en el bolso.',
    images: [
      { label: 'En Pedestal', src: 'assets/images/catalog/cosmetic-pouch-on-stone-pedestal.jpg' },
      { label: 'Con Modelo', src: 'assets/images/catalog/woman-opening-cosmetic-bag.jpg' },
      { label: 'En Lino', src: 'assets/images/catalog/cosmetic-bag-on-linen-surface.jpg' },
      { label: 'Detalle Taller', src: 'assets/images/real-linen-pouch.jpg' }
    ],
    instagram: {
      date: 'Hace 1 semana',
      likes: 194,
      caption: 'Lo que llevamos en la cartera también merece ser lindo. Estos nécessaires tienen forro impermeable por dentro por si se abre un cosmético, y cierre reforzado con tirador de tela artesanal. También armamos los portasani con mosquetón para tener el alcohol en gel a mano.',
      hashtags: '#necessaire #cartuchera #accesoriosdemoda #linoartesanal #organizatucartera',
      comments: [
        { user: 'camila_b', text: 'El estampado de flores con lino es un sueño!' }
      ]
    }
  },
  {
    id: 'p7',
    title: 'Ajuar de Bebé & Toallitas con Nombre',
    category: 'infantil',
    categoryName: 'Bebés & Maternidad',
    size: 'medium',
    tag: 'Ajuar de Nacimiento',
    texture: 'Toalla doble felpa, algodón puro & bordado',
    price: 'Bordado a Elección',
    desc: 'Piezas hipoalergénicas ultra suaves para la piel del bebé, organizadores bordados con orejitas de conejito y toallitas con nombre personalizado hecho a mano.',
    images: [
      { label: 'Conejito Ajuar', src: 'assets/images/catalog/embroidered-bunny-fabric-organiz.jpg' },
      { label: 'Con Bebé', src: 'assets/images/models/model-towel-baby.jpg' },
      { label: 'Bordado Taller', src: 'assets/images/real-custom-embroidery.jpg' }
    ],
    instagram: {
      date: 'Hace 2 semanas',
      likes: 245,
      caption: 'Preparar la llegada de un bebé es de los momentos más emocionantes. Estas toallitas con capucha y babitas en doble felpa de algodón puro son una caricia. Se bordan con el nombre a contratono en tipografía cursiva delicada.',
      hashtags: '#maternidad #ajuarbebe #toallaspersonalizadas #bordadoartesanal #embarazo',
      comments: [
        { user: 'abuelafeliz', text: 'Le regalé el set a mi primera nieta y los papás quedaron fascinados.' }
      ]
    }
  },
  {
    id: 'p8',
    title: 'Porta Rollos Cilíndrico Acolchado',
    category: 'hogar',
    categoryName: 'Hogar & Baño',
    size: 'medium',
    tag: 'Detalle de Baño · Exclusivo',
    texture: 'Lino jaspeado, cierre y puntilla',
    price: 'Diseño Exclusivo',
    desc: 'Dispenser de papel higiénico o pañuelos confeccionado en tela con cierre reforzado y aplique de pasamanería bordada dorada.',
    images: [
      { label: 'En Baño', src: 'assets/images/models/model-bath-roll.jpg' },
      { label: 'Cesto Textil', src: 'assets/images/catalog/handcrafted-cosmetic-bag-fabric-.jpg' },
      { label: 'Detalle Taller', src: 'assets/images/real-roll-dispenser.jpg' }
    ],
    instagram: {
      date: 'Hace 2 semanas',
      likes: 122,
      caption: 'Para que hasta el último rincón de tu baño tenga calidez y armonía. Este porta rollos oculta el rollo de repuesto o pañuelos con un diseño acolchado en lino jaspeado y pasamanería bordada dorada.',
      hashtags: '#bañodeco #detallesqueenamoran #costuracreativa #hogarconestilo #divinalocura',
      comments: [
        { user: 'patricia_deco', text: 'Qué buena idea para no tener los rollos a la vista!' }
      ]
    }
  }
];
