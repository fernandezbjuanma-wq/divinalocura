/**
 * Divina Locura Deco - Banco Visual de Imágenes del Taller
 * Contiene el inventario unificado de fotos editoriales (Google Flow + Taller de Elena)
 */
const INITIAL_IMAGE_BANK = [
  {
    "id": "b_toallas-terracota-iniciales-meg",
    "title": "Juego de Toallas Terracota Iniciales M.G.",
    "category": "Blanquería & Toallas",
    "src": "assets/images/banco/blanqueria-toallas/toallas-terracota-iniciales-meg.jpg",
    "usedIn": "p9",
    "width": 1200,
    "height": 896
  },
  {
    "id": "b_toallas-gris-iniciales-mr-banco",
    "title": "Juego de Toallas Gris Oscuro M.R. en Banco",
    "category": "Blanquería & Toallas",
    "src": "assets/images/banco/blanqueria-toallas/toallas-gris-iniciales-mr-banco.jpg",
    "usedIn": "p9",
    "width": 1376,
    "height": 768
  },
  {
    "id": "b_toallas-gris-topo-iniciales-mr",
    "title": "Dúo de Toallas Gris Topo Bordado M.R.",
    "category": "Blanquería & Toallas",
    "src": "assets/images/banco/blanqueria-toallas/toallas-gris-topo-iniciales-mr.jpg",
    "usedIn": "p9",
    "width": 1200,
    "height": 896
  },
  {
    "id": "b_toallas-rosa-emmita-mariposa",
    "title": "Set de Toallas Rosa Bordado Emmita & Volado",
    "category": "Blanquería & Toallas",
    "src": "assets/images/banco/blanqueria-toallas/toallas-rosa-emmita-mariposa.jpg",
    "usedIn": "p9",
    "width": 1200,
    "height": 896
  },
  {
    "id": "b_toalla-terracota-encaje-guipur",
    "title": "Toalla Terracota con Guarda de Encaje Guipur",
    "category": "Blanquería & Toallas",
    "src": "assets/images/banco/blanqueria-toallas/toalla-terracota-encaje-guipur.jpg",
    "usedIn": "p9",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_toalla-cruda-encaje-broderie",
    "title": "Toalla Cruda con Guarda Broderie & Etiqueta",
    "category": "Blanquería & Toallas",
    "src": "assets/images/banco/blanqueria-toallas/toalla-cruda-encaje-broderie.jpg",
    "usedIn": "p9",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_toalla-rosa-viejo-boton-crochet",
    "title": "Toalla Rosa Viejo con Botón de Madera y Puntilla",
    "category": "Blanquería & Toallas",
    "src": "assets/images/banco/blanqueria-toallas/toalla-rosa-viejo-boton-crochet.jpg",
    "usedIn": "p9",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_toalla-botanica-hojas-puntilla-picos",
    "title": "Toalla Estampada Hojas con Puntilla en Picos",
    "category": "Blanquería & Toallas",
    "src": "assets/images/banco/blanqueria-toallas/toalla-botanica-hojas-puntilla-picos.jpg",
    "usedIn": "p9",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_toalla-lino-hojas-vertical",
    "title": "Toalla de Mano Estampa Botánica Lino",
    "category": "Blanquería & Toallas",
    "src": "assets/images/banco/blanqueria-toallas/toalla-lino-hojas-vertical.jpg",
    "usedIn": "p9",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_toalla-guarda-floral-marron",
    "title": "Toalla Arena con Guarda Floral Bordada",
    "category": "Blanquería & Toallas",
    "src": "assets/images/banco/blanqueria-toallas/toalla-guarda-floral-marron.jpg",
    "usedIn": "p9",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_repasador-colgado-guarda-floral-gris",
    "title": "Repasador Colgado Guarda Gris & Flores",
    "category": "Blanquería & Toallas",
    "src": "assets/images/banco/blanqueria-toallas/repasador-colgado-guarda-floral-gris.jpg",
    "usedIn": "p2",
    "width": 1376,
    "height": 768
  },
  {
    "id": "b_toalla-blanca-broderie-bano",
    "title": "Toalla Blanca con Broderie Calado en Baño",
    "category": "Blanquería & Toallas",
    "src": "assets/images/banco/blanqueria-toallas/toalla-blanca-broderie-bano.jpg",
    "usedIn": "p2",
    "width": 1376,
    "height": 768
  },
  {
    "id": "b_toalla-blanca-bacha-piedra",
    "title": "Toalla Broderie Junto a Bacha de Piedra",
    "category": "Blanquería & Toallas",
    "src": "assets/images/banco/blanqueria-toallas/toalla-blanca-bacha-piedra.jpg",
    "usedIn": "p2",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_toalla-blanca-guarda-lino-calado",
    "title": "Toalla Blanca con Guarda Lino Bordado Blanco",
    "category": "Blanquería & Toallas",
    "src": "assets/images/banco/blanqueria-toallas/toalla-blanca-guarda-lino-calado.jpg",
    "usedIn": "p9",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_camino-toalla-mandalas-doradas",
    "title": "Toalla Camino con Tres Soles Dorados Crochet",
    "category": "Blanquería & Toallas",
    "src": "assets/images/banco/blanqueria-toallas/camino-toalla-mandalas-doradas.jpg",
    "usedIn": "p9",
    "width": 1200,
    "height": 896
  },
  {
    "id": "b_toalla-chevron-volados-salvia",
    "title": "Toalla Salvia con Guarda Chevron & Volados",
    "category": "Blanquería & Toallas",
    "src": "assets/images/banco/blanqueria-toallas/toalla-chevron-volados-salvia.jpg",
    "usedIn": "p9",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_cubrecama-waffle-y-almohadones-bordados",
    "title": "Cubrecama Waffle Natural & Almohadones Bordados",
    "category": "Blanquería & Toallas",
    "src": "assets/images/banco/blanqueria-toallas/cubrecama-waffle-y-almohadones-bordados.jpg",
    "usedIn": "p15",
    "width": 1200,
    "height": 896
  },
  {
    "id": "b_caja-toalla-mandala-blanca",
    "title": "Caja Regalo Toallón Lino con Mandala Blanca",
    "category": "Cajas de Regalo",
    "src": "assets/images/banco/cajas-regalo/caja-toalla-mandala-blanca.jpg",
    "usedIn": "p10",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_caja-toalla-terracota-dorada",
    "title": "Caja Regalo Toalla Terracota y Pasamanería Dorada",
    "category": "Cajas de Regalo",
    "src": "assets/images/banco/cajas-regalo/caja-toalla-terracota-dorada.jpg",
    "usedIn": "p10",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_caja-set-rosa-volados",
    "title": "Caja Regalo Set Rosa Bebé con Botón & Volados",
    "category": "Cajas de Regalo",
    "src": "assets/images/banco/cajas-regalo/caja-set-rosa-volados.jpg",
    "usedIn": "p10",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_caja-regalo-tapa-mandala-calada",
    "title": "Caja Presentación Blanca Tapa Mandala Calada",
    "category": "Cajas de Regalo",
    "src": "assets/images/banco/cajas-regalo/caja-regalo-tapa-mandala-calada.jpg",
    "usedIn": "p10",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_caja-set-guarda-azteca-azul",
    "title": "Caja Set Blanco y Azul con Guarda Étnica",
    "category": "Cajas de Regalo",
    "src": "assets/images/banco/cajas-regalo/caja-set-guarda-azteca-azul.jpg",
    "usedIn": "p10",
    "width": 960,
    "height": 1280
  },
  {
    "id": "b_modelo-bolso-tote-bordado-casa",
    "title": "Modelo con Bolso Tote de Lienzo Bordado",
    "category": "Bolsos & Tote Bags",
    "src": "assets/images/banco/bolsos-totes/modelo-bolso-tote-bordado-casa.jpg",
    "usedIn": "p11",
    "width": 1376,
    "height": 768
  },
  {
    "id": "b_tote-lienzo-flores-fucsias",
    "title": "Tote Bag de Lienzo Bordado Flores Fucsias",
    "category": "Bolsos & Tote Bags",
    "src": "assets/images/banco/bolsos-totes/tote-lienzo-flores-fucsias.jpg",
    "usedIn": "p11",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_tote-lienzo-margarita-sol",
    "title": "Tote Bag de Lienzo Margarita Multicolor",
    "category": "Bolsos & Tote Bags",
    "src": "assets/images/banco/bolsos-totes/tote-lienzo-margarita-sol.jpg",
    "usedIn": "p11",
    "width": 1200,
    "height": 896
  },
  {
    "id": "b_tote-lienzo-gatito-negro",
    "title": "Tote Bag Lienzo Gatito Bordado & Flores",
    "category": "Bolsos & Tote Bags",
    "src": "assets/images/banco/bolsos-totes/tote-lienzo-gatito-negro.jpg",
    "usedIn": "p11",
    "width": 1200,
    "height": 896
  },
  {
    "id": "b_tote-lienzo-maceta-floral",
    "title": "Tote Bag Lienzo Maceta Floral Acuarelada",
    "category": "Bolsos & Tote Bags",
    "src": "assets/images/banco/bolsos-totes/tote-lienzo-maceta-floral.jpg",
    "usedIn": "p11",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_tote-lienzo-guirnalda-corazones",
    "title": "Tote Bag Lienzo Guirnalda de Corazones",
    "category": "Bolsos & Tote Bags",
    "src": "assets/images/banco/bolsos-totes/tote-lienzo-guirnalda-corazones.jpg",
    "usedIn": "p11",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_tote-lienzo-corona-corazones",
    "title": "Tote Bag Corona de Corazones Divina Locura",
    "category": "Bolsos & Tote Bags",
    "src": "assets/images/banco/bolsos-totes/tote-lienzo-corona-corazones.jpg",
    "usedIn": "p11",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_tote-lienzo-valijas-vintage",
    "title": "Tote Bag Estampa Valijas Vintage de Viaje",
    "category": "Bolsos & Tote Bags",
    "src": "assets/images/banco/bolsos-totes/tote-lienzo-valijas-vintage.jpg",
    "usedIn": "p11",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_tote-lienzo-mariposa-color",
    "title": "Tote Bag Mariposa Bordada Multicolor",
    "category": "Bolsos & Tote Bags",
    "src": "assets/images/banco/bolsos-totes/tote-lienzo-mariposa-color.jpg",
    "usedIn": "p11",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_bolso-circular-patchwork-cuadrille",
    "title": "Bolso Circular Patchwork Cuadrillé Arena & Gris",
    "category": "Bolsos & Tote Bags",
    "src": "assets/images/banco/bolsos-totes/bolso-circular-patchwork-cuadrille.jpg",
    "usedIn": "p12",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_bolso-verde-esmeralda-mandala",
    "title": "Bolso Estructurado Verde Esmeralda con Mandala",
    "category": "Bolsos & Tote Bags",
    "src": "assets/images/banco/bolsos-totes/bolso-verde-esmeralda-mandala.jpg",
    "usedIn": "p12",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_bolso-verde-esmeralda-lateral",
    "title": "Bolso Verde Petróleo con Aplique Bordado",
    "category": "Bolsos & Tote Bags",
    "src": "assets/images/banco/bolsos-totes/bolso-verde-esmeralda-lateral.jpg",
    "usedIn": "p12",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_cartera-denim-patchwork-flores",
    "title": "Cartera Denim & Patchwork Floral Artesanal",
    "category": "Bolsos & Tote Bags",
    "src": "assets/images/banco/bolsos-totes/cartera-denim-patchwork-flores.jpg",
    "usedIn": "p12",
    "width": 1200,
    "height": 896
  },
  {
    "id": "b_bolso-circular-lino-topo",
    "title": "Bolso Circular Minimalista en Lino Topo",
    "category": "Bolsos & Tote Bags",
    "src": "assets/images/banco/bolsos-totes/bolso-circular-lino-topo.jpg",
    "usedIn": "p12",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_bolso-circular-botanico-tierra",
    "title": "Bolso Circular Estampa Botánica Tonos Tierra",
    "category": "Bolsos & Tote Bags",
    "src": "assets/images/banco/bolsos-totes/bolso-circular-botanico-tierra.jpg",
    "usedIn": "p12",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_tote-bicolor-mostaza-terracota",
    "title": "Tote Bicolor Mostaza & Terracota Estampado",
    "category": "Bolsos & Tote Bags",
    "src": "assets/images/banco/bolsos-totes/tote-bicolor-mostaza-terracota.jpg",
    "usedIn": "p12",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_bolso-infantil-flores-3d",
    "title": "Bolso Creativo Infantil Flores de Tela 3D",
    "category": "Bolsos & Tote Bags",
    "src": "assets/images/banco/bolsos-totes/bolso-infantil-flores-3d.jpg",
    "usedIn": "p12",
    "width": 768,
    "height": 1376
  },
  {
    "id": "b_organizador-manija-circular-botanico",
    "title": "Organizador Portátil Manija Circular Hojas Doradas",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/banco/neceseres-organizadores/organizador-manija-circular-botanico.jpg",
    "usedIn": "p13",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_organizador-manija-circular-liberty-rosa",
    "title": "Organizador Manija Circular Liberty Rosa & Coral",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/banco/neceseres-organizadores/organizador-manija-circular-liberty-rosa.jpg",
    "usedIn": "p13",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_organizador-manija-circular-menta",
    "title": "Organizador Manija Circular Floral Oscuro & Menta",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/banco/neceseres-organizadores/organizador-manija-circular-menta.jpg",
    "usedIn": "p13",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_organizador-manija-circular-cristal",
    "title": "Organizador Manija Circular con Bolsillo Cristal",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/banco/neceseres-organizadores/organizador-manija-circular-cristal.jpg",
    "usedIn": "p13",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_coleccion-canastas-estampadas-manijas",
    "title": "Colección de 5 Canastas Textiles con Manijas",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/banco/neceseres-organizadores/coleccion-canastas-estampadas-manijas.jpg",
    "usedIn": "p14",
    "width": 1200,
    "height": 896
  },
  {
    "id": "b_duo-cestos-lienzo-y-arpillera",
    "title": "Dúo de Cestos Contenedores Lienzo & Arpillera",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/banco/neceseres-organizadores/duo-cestos-lienzo-y-arpillera.jpg",
    "usedIn": "p14",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_cesto-floral-bordado-ambiente",
    "title": "Cesto Contenedor con Flores Bordadas en Ambiente",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/banco/neceseres-organizadores/cesto-floral-bordado-ambiente.jpg",
    "usedIn": "p14",
    "width": 1376,
    "height": 768
  },
  {
    "id": "b_cesto-bordado-flores-blancas",
    "title": "Cesto Mesa de Luz Bordado Flores Blancas",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/banco/neceseres-organizadores/cesto-bordado-flores-blancas.jpg",
    "usedIn": "p14",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_porta-rollos-cilindrico-chevron",
    "title": "Porta Rollos / Pañuelos Cilíndrico Chevron",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/banco/neceseres-organizadores/porta-rollos-cilindrico-chevron.jpg",
    "usedIn": "p8",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_estuche-lino-iniciales-lp-bies",
    "title": "Estuche Grande de Lino Iniciales LP & Bies Floral",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/banco/neceseres-organizadores/estuche-lino-iniciales-lp-bies.jpg",
    "usedIn": "p16",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_neceser-medialuna-mandala-crochet",
    "title": "Neceser Medialuna Arpillera con Mandala Crochet",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/banco/neceseres-organizadores/neceser-medialuna-mandala-crochet.jpg",
    "usedIn": "p16",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_neceser-medialuna-trazos-azules",
    "title": "Neceser Medialuna Lino con Trazos Azules",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/banco/neceseres-organizadores/neceser-medialuna-trazos-azules.jpg",
    "usedIn": "p16",
    "width": 1200,
    "height": 896
  },
  {
    "id": "b_neceser-medialuna-estrellitas",
    "title": "Neceser Medialuna Lienzo Estrellitas Negras",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/banco/neceseres-organizadores/neceser-medialuna-estrellitas.jpg",
    "usedIn": "p16",
    "width": 1200,
    "height": 896
  },
  {
    "id": "b_neceser-medialuna-botanico-tropical",
    "title": "Neceser Medialuna Estampa Botánica Tropical",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/banco/neceseres-organizadores/neceser-medialuna-botanico-tropical.jpg",
    "usedIn": "p16",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_set-estuches-cristal-colores",
    "title": "Set Mini Estuches Cristal Vivo Pastel",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/banco/neceseres-organizadores/set-estuches-cristal-colores.jpg",
    "usedIn": "p6",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_bolsillero-pared-rayas-flores",
    "title": "Organizador Colgante Rayado Azul & Flores",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/banco/neceseres-organizadores/bolsillero-pared-rayas-flores.jpg",
    "usedIn": "p3",
    "width": 1376,
    "height": 768
  },
  {
    "id": "b_modelo-cofia-saten-blanca",
    "title": "Modelo con Cofia Satén Blanca en Dormitorio",
    "category": "Descanso & Satén",
    "src": "assets/images/banco/descanso-saten/modelo-cofia-saten-blanca.jpg",
    "usedIn": "p1",
    "width": 1376,
    "height": 768
  },
  {
    "id": "b_modelo-cofia-broderie-volados",
    "title": "Modelo con Cofia Artesanal Broderie & Volados",
    "category": "Descanso & Satén",
    "src": "assets/images/banco/descanso-saten/modelo-cofia-broderie-volados.jpg",
    "usedIn": "p1",
    "width": 896,
    "height": 1200
  },
  {
    "id": "b_modelo-tocador-neceser-skincare",
    "title": "Rutina Skincare en Baño con Neceser Floral",
    "category": "Descanso & Satén",
    "src": "assets/images/banco/descanso-saten/modelo-tocador-neceser-skincare.jpg",
    "usedIn": "p6",
    "width": 1376,
    "height": 768
  },
  {
    "id": "b_nino-cuarto-organizador-floral",
    "title": "Niño en Cuarto Infantil con Organizador Colgante",
    "category": "Infantil & Hogar",
    "src": "assets/images/banco/infantil-hogar/nino-cuarto-organizador-floral.jpg",
    "usedIn": "p3",
    "width": 1376,
    "height": 768
  },
  {
    "id": "b_nino-habitacion-bolsillero-madera",
    "title": "Cuarto Infantil Cálido con Bolsillero de Pared",
    "category": "Infantil & Hogar",
    "src": "assets/images/banco/infantil-hogar/nino-habitacion-bolsillero-madera.jpg",
    "usedIn": "p3",
    "width": 1376,
    "height": 768
  },
  {
    "id": "b_nena-abrazando-muneco-apego-cama",
    "title": "Nena Abrazando Muñeco de Apego en la Cama",
    "category": "Infantil & Hogar",
    "src": "assets/images/banco/infantil-hogar/nena-abrazando-muneco-apego-cama.jpg",
    "usedIn": "p4",
    "width": 1376,
    "height": 768
  },
  {
    "id": "b_nina-sueno-muneco-apego",
    "title": "Niña Jugando con Muñeco de Apego de Tela",
    "category": "Infantil & Hogar",
    "src": "assets/images/banco/infantil-hogar/nina-sueno-muneco-apego.jpg",
    "usedIn": "p4",
    "width": 1376,
    "height": 768
  },
  {
    "id": "b_funda-sillon-liencillo-mandala",
    "title": "Funda de Sillón en Liencillo con Mandala Bordada",
    "category": "Infantil & Hogar",
    "src": "assets/images/banco/infantil-hogar/funda-sillon-liencillo-mandala.jpg",
    "usedIn": "p15",
    "width": 1376,
    "height": 768
  },
  {
    "id": "b_editorial-mujer-living-mantas",
    "title": "Atmósfera de Hogar con Mantas y Almohadones",
    "category": "Infantil & Hogar",
    "src": "assets/images/banco/infantil-hogar/editorial-mujer-living-mantas.jpg",
    "usedIn": "p15",
    "width": 1376,
    "height": 768
  },
  {
    "id": "b_editorial-lectura-calma-hogar",
    "title": "Momento de Descanso en Sillón con Textiles",
    "category": "Infantil & Hogar",
    "src": "assets/images/banco/infantil-hogar/editorial-lectura-calma-hogar.jpg",
    "usedIn": "p15",
    "width": 1376,
    "height": 768
  },
  {
    "id": "orig_cat-baskets",
    "title": "Cat Baskets",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/cat-baskets.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_cat-bedding",
    "title": "Cat Bedding",
    "category": "Infantil & Hogar",
    "src": "assets/images/cat-bedding.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_cat-cushions",
    "title": "Cat Cushions",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/cat-cushions.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_cat-necessaire",
    "title": "Cat Necessaire",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/cat-necessaire.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_cat-table",
    "title": "Cat Table",
    "category": "Infantil & Hogar",
    "src": "assets/images/cat-table.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_cat-waffle",
    "title": "Cat Waffle",
    "category": "Infantil & Hogar",
    "src": "assets/images/cat-waffle.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_hero-textile",
    "title": "Hero Textile",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/hero-textile.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_model-baby-nursery",
    "title": "Model Baby Nursery",
    "category": "Infantil & Hogar",
    "src": "assets/images/models/model-baby-nursery.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_model-bag-sanitizer",
    "title": "Model Bag Sanitizer",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/models/model-bag-sanitizer.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_model-bath-roll",
    "title": "Model Bath Roll",
    "category": "Infantil & Hogar",
    "src": "assets/images/models/model-bath-roll.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_model-linen-pouch",
    "title": "Model Linen Pouch",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/models/model-linen-pouch.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_model-satin-skincare",
    "title": "Model Satin Skincare",
    "category": "Descanso & Satén",
    "src": "assets/images/models/model-satin-skincare.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_model-sleep-mask",
    "title": "Model Sleep Mask",
    "category": "Descanso & Satén",
    "src": "assets/images/models/model-sleep-mask.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_model-towel-baby",
    "title": "Model Towel Baby",
    "category": "Infantil & Hogar",
    "src": "assets/images/models/model-towel-baby.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_model-waffle-kitchen",
    "title": "Model Waffle Kitchen",
    "category": "Infantil & Hogar",
    "src": "assets/images/models/model-waffle-kitchen.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_cosmetic-bag-on-linen-surface",
    "title": "Cosmetic Bag On Linen Surface",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/catalog/cosmetic-bag-on-linen-surface.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_cosmetic-bag-on-wooden-table",
    "title": "Cosmetic Bag On Wooden Table",
    "category": "Infantil & Hogar",
    "src": "assets/images/catalog/cosmetic-bag-on-wooden-table.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_cosmetic-pouch-on-linen-cloth",
    "title": "Cosmetic Pouch On Linen Cloth",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/catalog/cosmetic-pouch-on-linen-cloth.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_cosmetic-pouch-on-linen-surface",
    "title": "Cosmetic Pouch On Linen Surface",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/catalog/cosmetic-pouch-on-linen-surface.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_cosmetic-pouch-on-stone-pedestal",
    "title": "Cosmetic Pouch On Stone Pedestal",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/catalog/cosmetic-pouch-on-stone-pedestal.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_embroidered-bunny-fabric-organiz",
    "title": "Embroidered Bunny Fabric Organiz",
    "category": "Infantil & Hogar",
    "src": "assets/images/catalog/embroidered-bunny-fabric-organiz.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_fabric-organizer-pockets-on-tabl",
    "title": "Fabric Organizer Pockets On Tabl",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/catalog/fabric-organizer-pockets-on-tabl.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_fabric-wall-organizer-hanging-on",
    "title": "Fabric Wall Organizer Hanging On",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/catalog/fabric-wall-organizer-hanging-on.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_fabric-wall-organizers-on-wall",
    "title": "Fabric Wall Organizers On Wall",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/catalog/fabric-wall-organizers-on-wall.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_handcrafted-cosmetic-bag-fabric-",
    "title": "Handcrafted Cosmetic Bag Fabric ",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/catalog/handcrafted-cosmetic-bag-fabric-.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_handcrafted-cotton-towels-on-bench",
    "title": "Handcrafted Cotton Towels On Bench",
    "category": "Infantil & Hogar",
    "src": "assets/images/catalog/handcrafted-cotton-towels-on-bench.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_handcrafted-fabric-wall-organize",
    "title": "Handcrafted Fabric Wall Organize",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/catalog/handcrafted-fabric-wall-organize.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_hanging-wall-organizer-in-room",
    "title": "Hanging Wall Organizer In Room",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/catalog/hanging-wall-organizer-in-room.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_nursery-products-displayed-on-shelf",
    "title": "Nursery Products Displayed On Shelf",
    "category": "Infantil & Hogar",
    "src": "assets/images/catalog/nursery-products-displayed-on-shelf.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_plush-dolls-on-wooden-shelf",
    "title": "Plush Dolls On Wooden Shelf",
    "category": "Infantil & Hogar",
    "src": "assets/images/catalog/plush-dolls-on-wooden-shelf.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_satin-sleep-mask-on-block",
    "title": "Satin Sleep Mask On Block",
    "category": "Descanso & Satén",
    "src": "assets/images/catalog/satin-sleep-mask-on-block.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_satin-sleep-mask-on-marble",
    "title": "Satin Sleep Mask On Marble",
    "category": "Descanso & Satén",
    "src": "assets/images/catalog/satin-sleep-mask-on-marble.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_sleep-bonnet-and-mask-on",
    "title": "Sleep Bonnet And Mask On",
    "category": "Descanso & Satén",
    "src": "assets/images/catalog/sleep-bonnet-and-mask-on.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_sleep-mask-on-beige-surface",
    "title": "Sleep Mask On Beige Surface",
    "category": "Descanso & Satén",
    "src": "assets/images/catalog/sleep-mask-on-beige-surface.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_sleep-mask-on-wooden-surface",
    "title": "Sleep Mask On Wooden Surface",
    "category": "Descanso & Satén",
    "src": "assets/images/catalog/sleep-mask-on-wooden-surface.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_sleep-mask-satin-fabric-closeup",
    "title": "Sleep Mask Satin Fabric Closeup",
    "category": "Descanso & Satén",
    "src": "assets/images/catalog/sleep-mask-satin-fabric-closeup.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_woman-adjusting-satin-sleep-bonnet",
    "title": "Woman Adjusting Satin Sleep Bonnet",
    "category": "Descanso & Satén",
    "src": "assets/images/catalog/woman-adjusting-satin-sleep-bonnet.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_woman-opening-cosmetic-bag",
    "title": "Woman Opening Cosmetic Bag",
    "category": "Neceseres & Organizadores",
    "src": "assets/images/catalog/woman-opening-cosmetic-bag.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_woman-reaching-toward-sleep-mask",
    "title": "Woman Reaching Toward Sleep Mask",
    "category": "Descanso & Satén",
    "src": "assets/images/catalog/woman-reaching-toward-sleep-mask.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  },
  {
    "id": "orig_woman-touching-satin-sleep-mask",
    "title": "Woman Touching Satin Sleep Mask",
    "category": "Descanso & Satén",
    "src": "assets/images/catalog/woman-touching-satin-sleep-mask.jpg",
    "usedIn": "Catálogo Base",
    "width": 1200,
    "height": 800
  }
];
