/**
 * ============================================================================
 *  DIVINA LOCURA DECO — BASE DE DATOS EN GOOGLE SHEETS (Apps Script)
 * ============================================================================
 *  Este archivo convierte una planilla de Google en la base de datos de la web.
 *  Cada hoja de la planilla es una "tabla": Pedidos, Clientas, Mensajes,
 *  Stock de Piezas, Telas e Insumos, Gastos, Producción, Productos, Ajustes
 *  y Visitas.
 *
 *  Cómo instalarlo: seguí la guía docs/COMO_CONECTAR_LA_BASE_DE_DATOS.md
 *
 *  1) Cambiá las dos claves iniciales de abajo (después se pueden cambiar
 *     desde la web).
 *  2) Ejecutá UNA VEZ la función "configurarTodo".
 *  3) Implementar → Nueva implementación → Aplicación web
 *     (Ejecutar como: Yo · Quién tiene acceso: Cualquier persona).
 * ============================================================================
 */

// --------------------------- AJUSTES EDITABLES ------------------------------
const CLAVE_INICIAL_ELENA = 'elena';     // Clave inicial de Elena (cambiala)
const CLAVE_INICIAL_JUANMA = 'juanma';   // Clave inicial de Juanma (cambiala)
const EMAIL_AVISOS = '';                 // Mail que recibe los avisos (vacío = tu mail)
const SITIO_WEB = 'https://fernandezbjuanma-wq.github.io/divinalocura/';
// ----------------------------------------------------------------------------

const VERSION = '1.0.0';
const ZONA = 'America/Argentina/Buenos_Aires';
const TOKEN_DIAS = 30;
const COL_DATOS = '_datos';

/**
 * Definición de cada hoja. Cada columna: [ruta del dato, título visible, tipo]
 * tipo: 'txt' (texto), 'num' (número), 'ro' (solo lectura, calculada).
 * Lo que Elena edite a mano en las columnas visibles se respeta al leer.
 */
const TABLAS = {
  orders: {
    hoja: 'Pedidos',
    columnas: [
      ['id', 'N° Pedido', 'txt'], ['date', 'Fecha', 'txt'], ['time', 'Hora', 'txt'],
      ['customer.name', 'Clienta', 'txt'], ['customer.phone', 'WhatsApp', 'txt'],
      ['customer.email', 'Email', 'txt'], ['customer.address', 'Dirección / Entrega', 'txt'],
      ['_piezas', 'Piezas encargadas', 'ro'], ['totalCount', 'Cantidad', 'num'],
      ['totalAmount', 'Total ($)', 'num'], ['status', 'Estado', 'txt'],
      ['paymentStatus', 'Pago', 'txt'], ['estimatedDelivery', 'Entrega estimada', 'txt'],
      ['workshopNote', 'Nota del taller', 'txt']
    ]
  },
  clients: {
    hoja: 'Clientas',
    columnas: [
      ['id', 'ID', 'txt'], ['name', 'Nombre', 'txt'], ['phone', 'WhatsApp', 'txt'],
      ['email', 'Email', 'txt'], ['address', 'Dirección', 'txt'],
      ['registeredAt', 'Alta', 'txt'], ['totalOrders', 'Pedidos', 'num'], ['notes', 'Notas', 'txt']
    ]
  },
  stockProducts: {
    hoja: 'Stock de Piezas',
    columnas: [
      ['id', 'ID', 'txt'], ['title', 'Pieza', 'txt'], ['inStock', 'Unidades', 'num'],
      ['minAlert', 'Alerta si baja de', 'num'], ['status', 'Disponibilidad', 'txt']
    ]
  },
  stockMaterials: {
    hoja: 'Telas e Insumos',
    columnas: [
      ['id', 'ID', 'txt'], ['name', 'Material', 'txt'], ['category', 'Categoría', 'txt'],
      ['qty', 'Cantidad', 'num'], ['unit', 'Unidad', 'txt'], ['minAlert', 'Alerta si baja de', 'num'],
      ['costPerUnit', 'Costo por unidad ($)', 'num']
    ]
  },
  expenses: {
    hoja: 'Gastos',
    columnas: [
      ['id', 'ID', 'txt'], ['date', 'Fecha', 'txt'], ['concept', 'Concepto', 'txt'],
      ['category', 'Categoría', 'txt'], ['amount', 'Monto ($)', 'num']
    ]
  },
  production: {
    hoja: 'Producción',
    columnas: [
      ['id', 'ID', 'txt'], ['orderId', 'Pedido', 'txt'], ['productName', 'Pieza', 'txt'],
      ['clientName', 'Clienta', 'txt'], ['fabric', 'Tela', 'txt'],
      ['metersRequired', 'Metros', 'num'], ['phase', 'Fase', 'txt'],
      ['assignedDate', 'Inicio', 'txt'], ['targetDate', 'Entrega', 'txt'],
      ['priority', 'Prioridad', 'txt'], ['notes', 'Notas', 'txt']
    ]
  },
  products: {
    hoja: 'Productos',
    columnas: [
      ['id', 'ID', 'txt'], ['title', 'Nombre', 'txt'], ['category', 'Categoría', 'txt'],
      ['price', 'Precio', 'txt'], ['texture', 'Telas / Textura', 'txt'],
      ['tag', 'Etiqueta', 'txt'], ['desc', 'Descripción', 'txt'], ['_fotos', 'Fotos', 'ro']
    ]
  }
};

const HOJA_MENSAJES = 'Mensajes';
const COLS_MENSAJES = ['ID', 'WhatsApp', 'Remitente', 'Nombre', 'Mensaje', 'Fecha y hora'];
const HOJA_AJUSTES = 'Ajustes';
const HOJA_VISITAS = 'Visitas';
const COLS_VISITAS = ['Fecha y hora', 'Día', 'Tipo', 'Página', 'Origen', 'Producto', 'Visitante'];

// Colecciones que el panel puede reemplazar enteras (solo con sesión iniciada)
const REEMPLAZABLES = ['stockProducts', 'stockMaterials', 'expenses', 'production', 'products'];
// Colecciones que se fusionan por ID (para no pisar pedidos que entran mientras Elena trabaja)
const FUSIONABLES = ['orders', 'clients'];

// ============================================================================
//  ENTRADA HTTP
// ============================================================================
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'publicData') return responder(accionPublicData());
  return responder({ ok: true, app: 'Divina Locura Deco', version: VERSION, mensaje: 'Base de datos funcionando 🌸' });
}

function doPost(e) {
  try {
    const params = (e && e.parameter) || {};
    // Avisos automáticos de Mercado Pago
    if (params.mp === '1') {
      let cuerpo = {};
      try { cuerpo = JSON.parse(e.postData.contents || '{}'); } catch (err) {}
      const idPago = (cuerpo.data && cuerpo.data.id) || params.id || params['data.id'];
      const tipo = cuerpo.type || params.topic || params.type;
      if (idPago && (!tipo || String(tipo).indexOf('payment') >= 0)) confirmarPagoMP(String(idPago));
      return responder({ ok: true });
    }

    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const accion = body.action;
    const publicas = {
      ping: () => ({ ok: true, version: VERSION }),
      publicData: () => accionPublicData(),
      createOrder: () => accionCrearPedido(body),
      registerClient: () => accionRegistrarClienta(body),
      sendClientMessage: () => accionMensajeClienta(body),
      clientData: () => accionDatosClienta(body),
      trackVisit: () => accionVisita(body),
      login: () => accionLogin(body),
      changePassword: () => accionCambiarClave(body),
      confirmPayment: () => accionConfirmarPago(body)
    };
    if (publicas[accion]) return responder(publicas[accion]());

    // A partir de acá, todo requiere sesión de administrador
    const sesion = validarToken(body.token);
    if (!sesion) return responder({ ok: false, code: 'AUTH', error: 'La sesión venció. Volvé a ingresar con tu clave.' });

    const privadas = {
      pull: () => accionPull(body),
      save: () => accionGuardar(body),
      uploadImage: () => accionSubirFoto(body),
      setSecureConfig: () => accionConfigSegura(body),
      logout: () => { PropertiesService.getScriptProperties().deleteProperty('tok_' + body.token); return { ok: true }; }
    };
    if (privadas[accion]) return responder(privadas[accion]());
    return responder({ ok: false, error: 'Acción desconocida: ' + accion });
  } catch (err) {
    console.error(err);
    return responder({ ok: false, error: String(err && err.message || err) });
  }
}

function responder(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ============================================================================
//  CONFIGURACIÓN INICIAL (ejecutar una sola vez desde el editor)
// ============================================================================
function configurarTodo() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const props = PropertiesService.getScriptProperties();
  props.setProperty('SPREADSHEET_ID', ss.getId());
  if (!props.getProperty('SALT')) props.setProperty('SALT', Utilities.getUuid());
  if (!props.getProperty('PWD_elena')) props.setProperty('PWD_elena', hashClave(CLAVE_INICIAL_ELENA));
  if (!props.getProperty('PWD_juanma')) props.setProperty('PWD_juanma', hashClave(CLAVE_INICIAL_JUANMA));

  Object.keys(TABLAS).forEach(nombre => prepararHoja(nombre));
  prepararHojaSimple(HOJA_MENSAJES, COLS_MENSAJES);
  prepararHojaSimple(HOJA_AJUSTES, ['Clave', 'Valor']);
  prepararHojaSimple(HOJA_VISITAS, COLS_VISITAS);

  const hoja1 = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
  if (hoja1 && ss.getSheets().length > 1 && hoja1.getLastRow() === 0) ss.deleteSheet(hoja1);

  carpetaFotos();
  // Pedir permiso de mail en esta ejecución
  try { MailApp.getRemainingDailyQuota(); } catch (e) {}
  Logger.log('✅ Listo. Ahora: Implementar → Nueva implementación → Aplicación web.');
}

function prepararHoja(nombre) {
  const def = TABLAS[nombre];
  const sh = obtenerHoja(def.hoja);
  const titulos = def.columnas.map(c => c[1]).concat([COL_DATOS]);
  sh.getRange(1, 1, 1, titulos.length).setValues([titulos])
    .setFontWeight('bold').setBackground('#A45A44').setFontColor('#FFFFFF');
  sh.setFrozenRows(1);
  sh.hideColumns(titulos.length);
  return sh;
}

function prepararHojaSimple(nombreHoja, titulos) {
  const sh = obtenerHoja(nombreHoja);
  sh.getRange(1, 1, 1, titulos.length).setValues([titulos])
    .setFontWeight('bold').setBackground('#A45A44').setFontColor('#FFFFFF');
  sh.setFrozenRows(1);
  return sh;
}

function planilla() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
}

function obtenerHoja(nombre) {
  const ss = planilla();
  return ss.getSheetByName(nombre) || ss.insertSheet(nombre);
}

// ============================================================================
//  LECTURA / ESCRITURA DE TABLAS
// ============================================================================
function leerTabla(nombre) {
  const def = TABLAS[nombre];
  const sh = obtenerHoja(def.hoja);
  const ultima = sh.getLastRow();
  if (ultima < 2) return [];
  const valores = sh.getRange(1, 1, ultima, sh.getLastColumn()).getValues();
  const encabezado = valores[0].map(String);
  const iDatos = encabezado.indexOf(COL_DATOS);
  const indices = def.columnas.map(c => encabezado.indexOf(c[1]));
  const lista = [];

  for (let r = 1; r < valores.length; r++) {
    const fila = valores[r];
    if (fila.every(v => v === '' || v === null)) continue;
    let obj = {};
    if (iDatos >= 0 && fila[iDatos]) {
      try { obj = JSON.parse(fila[iDatos]); } catch (e) { obj = {}; }
    }
    def.columnas.forEach((col, k) => {
      const idx = indices[k];
      if (idx < 0 || col[2] === 'ro') return;
      let v = fila[idx];
      if (v === '' || v === null) return;
      if (v instanceof Date) v = Utilities.formatDate(v, ZONA, 'dd/MM/yyyy');
      if (col[2] === 'num') { const n = Number(String(v).replace(/[^0-9.,-]/g, '').replace(',', '.')); if (!isNaN(n)) v = n; }
      else v = String(v);
      ponerRuta(obj, col[0], v);
    });
    if (!obj.id) obj.id = nombre.slice(0, 3) + '-' + r;
    lista.push(obj);
  }
  return lista;
}

function escribirTabla(nombre, lista) {
  const def = TABLAS[nombre];
  const sh = prepararHoja(nombre);
  const nCols = def.columnas.length + 1;
  const ultima = sh.getLastRow();
  if (ultima > 1) sh.getRange(2, 1, ultima - 1, Math.max(nCols, sh.getLastColumn())).clearContent();
  if (!lista.length) return;

  const filas = lista.map(obj => {
    const fila = def.columnas.map(col => {
      if (col[0] === '_piezas') return (obj.items || []).map(i => (i.qty || 1) + 'x ' + (i.title || '') + (i.note ? ' (' + i.note + ')' : '')).join(' · ');
      if (col[0] === '_fotos') return (obj.images || []).map(i => i.src).filter(s => s && s.indexOf('data:') !== 0).join('\n');
      const v = leerRuta(obj, col[0]);
      return v === undefined || v === null ? '' : v;
    });
    let json = JSON.stringify(obj);
    if (json.length > 48000) {
      const copia = JSON.parse(json);
      (copia.images || []).forEach(img => { if (String(img.src || '').indexOf('data:') === 0) img.src = 'assets/images/hero-textile.jpg'; });
      json = JSON.stringify(copia).slice(0, 48000);
    }
    fila.push(json);
    return fila;
  });

  const rango = sh.getRange(2, 1, filas.length, nCols);
  rango.setNumberFormat('@');
  def.columnas.forEach((col, k) => {
    if (col[2] === 'num') sh.getRange(2, k + 1, filas.length, 1).setNumberFormat('#,##0.##');
  });
  rango.setValues(filas);
}

function leerMensajes() {
  const sh = obtenerHoja(HOJA_MENSAJES);
  const ultima = sh.getLastRow();
  const chats = {};
  if (ultima < 2) return chats;
  sh.getRange(2, 1, ultima - 1, 6).getValues().forEach(f => {
    if (!f[0] && !f[4]) return;
    const tel = limpiarTel(f[1]);
    if (!chats[tel]) chats[tel] = [];
    chats[tel].push({
      id: String(f[0]), sender: String(f[2] || 'client'), senderName: String(f[3] || ''),
      text: String(f[4] || ''), timestamp: f[5] instanceof Date ? Utilities.formatDate(f[5], ZONA, 'dd/MM/yyyy HH:mm') : String(f[5] || '')
    });
  });
  return chats;
}

function agregarMensaje(tel, msg) {
  const sh = prepararHojaSimple(HOJA_MENSAJES, COLS_MENSAJES);
  const fila = sh.getLastRow() + 1;
  sh.getRange(fila, 1, 1, 6).setNumberFormat('@')
    .setValues([[msg.id, limpiarTel(tel), msg.sender, msg.senderName, msg.text, msg.timestamp]]);
}

function leerAjustes() {
  const sh = obtenerHoja(HOJA_AJUSTES);
  const ultima = sh.getLastRow();
  const ajustes = {};
  if (ultima < 2) return ajustes;
  sh.getRange(2, 1, ultima - 1, 2).getValues().forEach(f => {
    if (!f[0]) return;
    let v = f[1];
    if (typeof v === 'string' && /^[\[{]/.test(v)) { try { v = JSON.parse(v); } catch (e) {} }
    ajustes[String(f[0])] = v;
  });
  return ajustes;
}

function escribirAjustes(obj) {
  const sh = prepararHojaSimple(HOJA_AJUSTES, ['Clave', 'Valor']);
  const ultima = sh.getLastRow();
  if (ultima > 1) sh.getRange(2, 1, ultima - 1, 2).clearContent();
  const filas = Object.keys(obj).filter(k => k !== 'gh_token').map(k => [k, typeof obj[k] === 'object' ? JSON.stringify(obj[k]) : obj[k]]);
  if (filas.length) sh.getRange(2, 1, filas.length, 2).setNumberFormat('@').setValues(filas);
}

// ============================================================================
//  ACCIONES PÚBLICAS (tienda)
// ============================================================================
function accionPublicData() {
  const cache = CacheService.getScriptCache();
  const enCache = cache.get('public_v1');
  if (enCache) return JSON.parse(enCache);
  const ajustes = leerAjustes();
  delete ajustes._presupuesto;
  const res = {
    ok: true,
    products: leerTabla('products'),
    settings: ajustes,
    mpEnabled: !!PropertiesService.getScriptProperties().getProperty('MP_ACCESS_TOKEN')
  };
  const txt = JSON.stringify(res);
  if (txt.length < 95000) cache.put('public_v1', txt, 300);
  return res;
}

function accionCrearPedido(body) {
  const entrada = limpiarProfundo(body.order || {});
  if (!entrada.customer || !entrada.customer.name || !entrada.customer.phone) {
    return { ok: false, error: 'Faltan el nombre o el WhatsApp de la clienta.' };
  }
  if (!Array.isArray(entrada.items) || !entrada.items.length) return { ok: false, error: 'El pedido está vacío.' };

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const pedidos = leerTabla('orders');
    const productos = leerTabla('products');
    const mapaProd = {};
    productos.forEach(p => { mapaProd[p.id] = p; });

    // Precios calculados en el servidor (no se puede manipular desde el navegador)
    let total = 0;
    let cantidad = 0;
    const items = entrada.items.slice(0, 30).map(it => {
      const qty = Math.max(1, Math.min(50, parseInt(it.qty, 10) || 1));
      const prod = mapaProd[it.id];
      const precioTxt = prod ? prod.price : it.price;
      const unit = precioNumero(precioTxt);
      total += unit * qty;
      cantidad += qty;
      return { id: String(it.id || ''), title: prod ? prod.title : String(it.title || 'Pieza'), price: String(precioTxt || ''), unitPrice: unit, qty: qty, note: String(it.note || '').slice(0, 300) };
    });

    let id = String(entrada.id || '').replace(/[^A-Z0-9-]/gi, '') || nuevoIdPedido();
    if (pedidos.some(p => p.id === id)) id = nuevoIdPedido();
    const ahora = new Date();
    const pedido = {
      id: id,
      date: Utilities.formatDate(ahora, ZONA, 'dd/MM/yyyy'),
      time: Utilities.formatDate(ahora, ZONA, 'HH:mm'),
      customer: {
        name: String(entrada.customer.name).slice(0, 80), phone: String(entrada.customer.phone).slice(0, 30),
        email: String(entrada.customer.email || '').slice(0, 80), address: String(entrada.customer.address || '').slice(0, 160)
      },
      items: items, totalCount: cantidad, totalAmount: total,
      status: 'Pendiente de Confirmación', paymentStatus: 'Pendiente',
      channel: String(entrada.channel || 'web').slice(0, 20),
      estimatedDelivery: '5 a 7 días hábiles',
      workshopNote: 'Pedido recibido en el taller. Elena revisará las telas y confirmará el inicio de la confección.'
    };
    pedidos.unshift(pedido);
    escribirTabla('orders', pedidos);
    upsertClienta(pedido.customer, true);

    agregarMensaje(pedido.customer.phone, {
      id: 'msg-' + ahora.getTime(), sender: 'client', senderName: pedido.customer.name,
      text: '🌸 ¡Hola Elena! Acabo de enviar un pedido desde la web (#' + id + ') con ' + cantidad + ' pieza(s).',
      timestamp: Utilities.formatDate(ahora, ZONA, 'dd/MM/yyyy HH:mm')
    });

    let urlPago = '';
    if (body.wantPayment) urlPago = crearPreferenciaMP(pedido);
    try { avisarPedidoNuevo(pedido); } catch (e) { console.warn('Mail no enviado', e); }
    return { ok: true, orderId: id, order: pedido, paymentUrl: urlPago };
  } finally {
    lock.releaseLock();
  }
}

function accionRegistrarClienta(body) {
  const c = limpiarProfundo(body.client || {});
  if (!c.name || !c.phone) return { ok: false, error: 'Faltan datos.' };
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    upsertClienta(c, false);
    return { ok: true };
  } finally { lock.releaseLock(); }
}

function upsertClienta(c, sumarPedido) {
  const clientas = leerTabla('clients');
  const tel = limpiarTel(c.phone);
  const idx = clientas.findIndex(x => limpiarTel(x.phone) === tel);
  if (idx >= 0) {
    const ex = clientas[idx];
    ex.name = c.name || ex.name;
    ex.email = c.email || ex.email || '';
    ex.address = c.address || ex.address || '';
    if (sumarPedido) ex.totalOrders = (Number(ex.totalOrders) || 0) + 1;
  } else {
    clientas.unshift({
      id: 'CLI-' + String(Date.now()).slice(-6), name: String(c.name).slice(0, 80), phone: String(c.phone).slice(0, 30),
      email: String(c.email || '').slice(0, 80), address: String(c.address || '').slice(0, 160),
      registeredAt: Utilities.formatDate(new Date(), ZONA, 'dd/MM/yyyy'), totalOrders: sumarPedido ? 1 : 0, notes: ''
    });
  }
  escribirTabla('clients', clientas);
}

function accionMensajeClienta(body) {
  const tel = limpiarTel(body.phone);
  const texto = limpiarTexto(body.text).slice(0, 1000);
  if (tel.length < 6 || !texto) return { ok: false, error: 'Mensaje inválido.' };
  const ahora = new Date();
  const msg = {
    id: 'msg-' + ahora.getTime(), sender: 'client', senderName: limpiarTexto(body.name || 'Clienta').slice(0, 80),
    text: texto, timestamp: Utilities.formatDate(ahora, ZONA, 'dd/MM/yyyy HH:mm')
  };
  agregarMensaje(tel, msg);
  // Aviso por mail como máximo una vez cada 30 minutos por clienta
  const cache = CacheService.getScriptCache();
  if (!cache.get('aviso_msg_' + tel)) {
    cache.put('aviso_msg_' + tel, '1', 1800);
    try {
      MailApp.sendEmail({
        to: emailAvisos(), name: 'Divina Locura Deco',
        subject: '💬 Nuevo mensaje de ' + msg.senderName + ' en la web',
        htmlBody: plantillaMail('Nuevo mensaje de una clienta', '<p><b>' + msg.senderName + '</b> (' + tel + ') te escribió:</p><blockquote style="border-left:3px solid #A45A44;padding-left:10px;color:#444">' + msg.text + '</blockquote>')
      });
    } catch (e) {}
  }
  return { ok: true, message: msg };
}

function accionDatosClienta(body) {
  const tel = limpiarTel(body.phone);
  if (tel.length < 8) return { ok: false, error: 'Teléfono inválido.' };
  const pedidos = leerTabla('orders').filter(o => o.customer && limpiarTel(o.customer.phone) === tel).map(o => ({
    id: o.id, date: o.date, time: o.time, items: o.items, totalCount: o.totalCount, totalAmount: o.totalAmount,
    status: o.status, paymentStatus: o.paymentStatus, estimatedDelivery: o.estimatedDelivery, workshopNote: o.workshopNote,
    customer: { name: o.customer.name, phone: o.customer.phone }
  }));
  const chats = leerMensajes();
  return { ok: true, orders: pedidos, messages: chats[tel] || [] };
}

function accionVisita(body) {
  const ahora = new Date();
  const sh = obtenerHoja(HOJA_VISITAS);
  if (sh.getLastRow() === 0) prepararHojaSimple(HOJA_VISITAS, COLS_VISITAS);
  sh.appendRow([
    Utilities.formatDate(ahora, ZONA, 'dd/MM/yyyy HH:mm'), Utilities.formatDate(ahora, ZONA, 'yyyy-MM-dd'),
    String(body.type || 'visita').slice(0, 20), String(body.page || '').slice(0, 60),
    String(body.source || 'directo').slice(0, 30), String(body.productId || '').slice(0, 30),
    String(body.visitorId || '').slice(0, 40)
  ]);
  return { ok: true };
}

// ============================================================================
//  SEGURIDAD: CLAVES Y SESIONES
// ============================================================================
function hashClave(clave) {
  const salt = PropertiesService.getScriptProperties().getProperty('SALT') || 'divina';
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + '|' + String(clave).trim().toLowerCase(), Utilities.Charset.UTF_8);
  return bytes.map(b => ('0' + (b & 0xff).toString(16)).slice(-2)).join('');
}

function claveCorrecta(rol, clave) {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('PWD_elena')) configurarClavesIniciales();
  const guardada = props.getProperty('PWD_' + rol);
  return !!guardada && guardada === hashClave(clave);
}

function configurarClavesIniciales() {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty('SALT')) props.setProperty('SALT', Utilities.getUuid());
  if (!props.getProperty('PWD_elena')) props.setProperty('PWD_elena', hashClave(CLAVE_INICIAL_ELENA));
  if (!props.getProperty('PWD_juanma')) props.setProperty('PWD_juanma', hashClave(CLAVE_INICIAL_JUANMA));
}

function demasiadosIntentos(rol) {
  const cache = CacheService.getScriptCache();
  return Number(cache.get('fallos_' + rol) || 0) >= 8;
}

function registrarFallo(rol) {
  const cache = CacheService.getScriptCache();
  cache.put('fallos_' + rol, String(Number(cache.get('fallos_' + rol) || 0) + 1), 600);
}

function accionLogin(body) {
  const clave = String(body.password || '');
  let roles = ['elena', 'juanma'];
  if (body.role === 'elena' || body.role === 'juanma') roles = [body.role];
  for (let i = 0; i < roles.length; i++) {
    if (demasiadosIntentos(roles[i])) return { ok: false, error: 'Demasiados intentos. Esperá 10 minutos y probá de nuevo.' };
  }
  const rol = roles.find(r => claveCorrecta(r, clave));
  if (!rol) {
    roles.forEach(registrarFallo);
    return { ok: false, error: 'Clave incorrecta.' };
  }
  const props = PropertiesService.getScriptProperties();
  const ahora = Date.now();
  const todas = props.getProperties();
  Object.keys(todas).forEach(k => {
    if (k.indexOf('tok_') !== 0) return;
    try { if (JSON.parse(todas[k]).exp < ahora) props.deleteProperty(k); } catch (e) { props.deleteProperty(k); }
  });
  const token = Utilities.getUuid() + Utilities.getUuid().slice(0, 8);
  props.setProperty('tok_' + token, JSON.stringify({ role: rol, exp: ahora + TOKEN_DIAS * 86400000 }));
  return { ok: true, token: token, role: rol };
}

function validarToken(token) {
  if (!token || typeof token !== 'string') return null;
  const props = PropertiesService.getScriptProperties();
  const raw = props.getProperty('tok_' + token);
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    if (s.exp < Date.now()) { props.deleteProperty('tok_' + token); return null; }
    return s;
  } catch (e) { return null; }
}

function accionCambiarClave(body) {
  const rol = body.role;
  if (rol !== 'elena' && rol !== 'juanma') return { ok: false, error: 'Elegí a qué administrador le cambiás la clave.' };
  if (demasiadosIntentos(rol)) return { ok: false, error: 'Demasiados intentos. Esperá 10 minutos.' };
  if (!claveCorrecta(rol, body.current || '')) { registrarFallo(rol); return { ok: false, error: 'La contraseña actual no es correcta.' }; }
  const nueva = String(body.newPassword || '').trim();
  if (nueva.length < 4) return { ok: false, error: 'La nueva contraseña debe tener al menos 4 caracteres.' };
  PropertiesService.getScriptProperties().setProperty('PWD_' + rol, hashClave(nueva));
  return { ok: true, message: '¡Contraseña de ' + (rol === 'elena' ? 'Elena' : 'Juanma') + ' actualizada!' };
}

// ============================================================================
//  ACCIONES DEL PANEL (requieren sesión)
// ============================================================================
function accionPull(body) {
  const pedir = Array.isArray(body.collections) && body.collections.length ? body.collections : null;
  const quiere = n => !pedir || pedir.indexOf(n) >= 0;
  const res = { ok: true };
  Object.keys(TABLAS).forEach(n => { if (quiere(n)) res[n] = leerTabla(n); });
  if (quiere('chats')) res.chats = leerMensajes();
  if (quiere('settings') || quiere('budget')) {
    const aj = leerAjustes();
    res.budget = aj._presupuesto !== undefined && aj._presupuesto !== '' ? Number(aj._presupuesto) : null;
    delete aj._presupuesto;
    res.settings = aj;
  }
  if (quiere('analytics')) res.analytics = calcularAnaliticas(res.orders || leerTabla('orders'));
  if (!pedir) {
    const props = PropertiesService.getScriptProperties();
    res.sheetUrl = planilla().getUrl();
    res.mpEnabled = !!props.getProperty('MP_ACCESS_TOKEN');
    res.notifyEmail = emailAvisos();
  }
  return res;
}

function accionGuardar(body) {
  const nombre = body.name;
  const lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    if (REEMPLAZABLES.indexOf(nombre) >= 0) {
      if (!Array.isArray(body.data)) return { ok: false, error: 'Datos inválidos.' };
      escribirTabla(nombre, body.data);
      if (nombre === 'products') CacheService.getScriptCache().remove('public_v1');
      return { ok: true };
    }
    if (FUSIONABLES.indexOf(nombre) >= 0) {
      if (!Array.isArray(body.data)) return { ok: false, error: 'Datos inválidos.' };
      const actuales = leerTabla(nombre);
      const entrantes = body.data;
      const idsEntrantes = {};
      entrantes.forEach(x => { if (x && x.id) idsEntrantes[x.id] = true; });
      const conocidos = {};
      (body.baseIds || []).forEach(id => { conocidos[id] = true; });
      // Lo que llegó al servidor y el panel todavía no conocía, se conserva arriba
      const nuevosDelServidor = actuales.filter(x => !idsEntrantes[x.id] && !conocidos[x.id]);
      const resultado = nuevosDelServidor.concat(entrantes);
      escribirTabla(nombre, resultado);
      return { ok: true, data: resultado };
    }
    if (nombre === 'chats') {
      const actuales = leerMensajes();
      const entrantes = body.data || {};
      const sh = prepararHojaSimple(HOJA_MENSAJES, COLS_MENSAJES);
      const nuevos = [];
      Object.keys(entrantes).forEach(tel => {
        const t = limpiarTel(tel);
        const ids = {};
        (actuales[t] || []).forEach(m => { ids[m.id] = true; });
        (entrantes[tel] || []).forEach(m => {
          if (!m || ids[m.id]) return;
          nuevos.push([String(m.id), t, String(m.sender || 'elena'), String(m.senderName || ''), String(m.text || ''), String(m.timestamp || '')]);
          if (!actuales[t]) actuales[t] = [];
          actuales[t].push(m);
        });
      });
      if (nuevos.length) sh.getRange(sh.getLastRow() + 1, 1, nuevos.length, 6).setNumberFormat('@').setValues(nuevos);
      return { ok: true, data: actuales };
    }
    if (nombre === 'settings') {
      const aj = leerAjustes();
      const presupuesto = aj._presupuesto;
      const nuevos = Object.assign({}, body.data || {});
      delete nuevos.gh_token;
      if (presupuesto !== undefined) nuevos._presupuesto = presupuesto;
      escribirAjustes(nuevos);
      CacheService.getScriptCache().remove('public_v1');
      return { ok: true };
    }
    if (nombre === 'budget') {
      const aj = leerAjustes();
      aj._presupuesto = Number(body.data) || 0;
      escribirAjustes(aj);
      return { ok: true };
    }
    return { ok: false, error: 'Colección desconocida: ' + nombre };
  } finally {
    lock.releaseLock();
  }
}

function carpetaFotos() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('FOTOS_FOLDER_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  const carpeta = DriveApp.createFolder('Divina Locura Deco - Fotos de la Web');
  props.setProperty('FOTOS_FOLDER_ID', carpeta.getId());
  return carpeta;
}

function accionSubirFoto(body) {
  const datos = String(body.dataUrl || '');
  const m = datos.match(/^data:(image\/[a-z+]+);base64,(.+)$/);
  if (!m) return { ok: false, error: 'Formato de imagen inválido.' };
  const blob = Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], (String(body.name || 'foto').replace(/[^\w.-]/g, '_') || 'foto') + '.jpg');
  const archivo = carpetaFotos().createFile(blob);
  try {
    archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {
    return { ok: false, error: 'Tu cuenta de Google no permite compartir archivos públicamente. Revisá la configuración de Drive.' };
  }
  return { ok: true, url: 'https://lh3.googleusercontent.com/d/' + archivo.getId() + '=w1600', fileId: archivo.getId() };
}

function accionConfigSegura(body) {
  const props = PropertiesService.getScriptProperties();
  if (typeof body.mpAccessToken === 'string') {
    const t = body.mpAccessToken.trim();
    if (t) props.setProperty('MP_ACCESS_TOKEN', t); else props.deleteProperty('MP_ACCESS_TOKEN');
  }
  if (typeof body.notifyEmail === 'string') {
    const em = body.notifyEmail.trim();
    if (em) props.setProperty('EMAIL_AVISOS', em); else props.deleteProperty('EMAIL_AVISOS');
  }
  CacheService.getScriptCache().remove('public_v1');
  return { ok: true, mpEnabled: !!props.getProperty('MP_ACCESS_TOKEN'), notifyEmail: emailAvisos() };
}

// ============================================================================
//  ANALÍTICAS REALES (a partir de la hoja Visitas y de los Pedidos)
// ============================================================================
function calcularAnaliticas(pedidos) {
  const sh = obtenerHoja(HOJA_VISITAS);
  const ultima = sh.getLastRow();
  const filas = ultima > 1 ? sh.getRange(2, 1, ultima - 1, 7).getValues() : [];
  const hoy = Utilities.formatDate(new Date(), ZONA, 'yyyy-MM-dd');
  const visitantes = {};
  const origenes = {};
  const vistasProducto = {};
  const porDia = {};
  let total = 0;
  let hoyN = 0;

  filas.forEach(f => {
    const dia = f[1] instanceof Date ? Utilities.formatDate(f[1], ZONA, 'yyyy-MM-dd') : String(f[1]);
    const tipo = String(f[2] || 'visita');
    if (tipo === 'producto') {
      const pid = String(f[5] || '');
      if (pid) vistasProducto[pid] = (vistasProducto[pid] || 0) + 1;
      return;
    }
    total++;
    if (dia === hoy) hoyN++;
    porDia[dia] = (porDia[dia] || 0) + 1;
    const o = String(f[4] || 'directo').toLowerCase();
    origenes[o] = (origenes[o] || 0) + 1;
    if (f[6]) visitantes[f[6]] = true;
  });

  const pct = n => total ? Math.round((n / total) * 100) : 0;
  const instagram = origenes.instagram || 0;
  const whatsapp = origenes.whatsapp || 0;
  const otros = total - instagram - whatsapp;

  const nombresDia = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const semana = [];
  const ultimos30 = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const clave = Utilities.formatDate(d, ZONA, 'yyyy-MM-dd');
    const claveAR = Utilities.formatDate(d, ZONA, 'dd/MM/yyyy');
    const delDia = (pedidos || []).filter(p => normalizarFecha(p.date) === claveAR);
    const item = {
      date: clave,
      day: nombresDia[Number(Utilities.formatDate(d, ZONA, 'u')) % 7],
      visits: porDia[clave] || 0,
      orders: delDia.length,
      revenue: delDia.reduce((s, p) => s + (Number(p.totalAmount) || 0), 0)
    };
    ultimos30.push(item);
    if (i < 7) semana.push(item);
  }

  return {
    totalVisits: total,
    uniqueVisitors: Object.keys(visitantes).length,
    todayVisits: hoyN,
    sources: { instagram: pct(instagram), whatsapp: pct(whatsapp), direct: total ? 100 - pct(instagram) - pct(whatsapp) : 0 },
    sourcesDetail: origenes,
    productViews: vistasProducto,
    weeklyHistory: semana,
    dailyHistory: ultimos30,
    otherVisits: otros,
    isReal: true
  };
}

function normalizarFecha(f) {
  if (!f) return '';
  if (f instanceof Date) return Utilities.formatDate(f, ZONA, 'dd/MM/yyyy');
  const p = String(f).split('/');
  if (p.length === 3) return ('0' + p[0]).slice(-2) + '/' + ('0' + p[1]).slice(-2) + '/' + p[2];
  return String(f);
}

// ============================================================================
//  MERCADO PAGO (opcional)
// ============================================================================
function crearPreferenciaMP(pedido) {
  const token = PropertiesService.getScriptProperties().getProperty('MP_ACCESS_TOKEN');
  if (!token) return '';
  const items = pedido.items.filter(i => i.unitPrice > 0).map(i => ({
    title: String(i.title).slice(0, 120), quantity: i.qty, unit_price: i.unitPrice, currency_id: 'ARS'
  }));
  if (!items.length) return '';
  const pref = {
    items: items,
    external_reference: pedido.id,
    payer: { name: pedido.customer.name, email: pedido.customer.email || undefined },
    back_urls: { success: SITIO_WEB + '?pago=ok', failure: SITIO_WEB + '?pago=error', pending: SITIO_WEB + '?pago=pendiente' },
    auto_return: 'approved',
    notification_url: ScriptApp.getService().getUrl() + '?mp=1',
    statement_descriptor: 'DIVINA LOCURA'
  };
  const r = UrlFetchApp.fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'post', contentType: 'application/json', payload: JSON.stringify(pref),
    headers: { Authorization: 'Bearer ' + token }, muteHttpExceptions: true
  });
  if (r.getResponseCode() >= 300) { console.warn('MP error', r.getContentText()); return ''; }
  return JSON.parse(r.getContentText()).init_point || '';
}

function accionConfirmarPago(body) {
  const id = String(body.paymentId || '').replace(/[^0-9]/g, '');
  if (!id) return { ok: false, error: 'Pago inválido.' };
  return confirmarPagoMP(id);
}

function confirmarPagoMP(idPago) {
  const token = PropertiesService.getScriptProperties().getProperty('MP_ACCESS_TOKEN');
  if (!token) return { ok: false, error: 'Mercado Pago no está configurado.' };
  const r = UrlFetchApp.fetch('https://api.mercadopago.com/v1/payments/' + idPago, {
    headers: { Authorization: 'Bearer ' + token }, muteHttpExceptions: true
  });
  if (r.getResponseCode() >= 300) return { ok: false, error: 'No se encontró el pago.' };
  const pago = JSON.parse(r.getContentText());
  const ref = String(pago.external_reference || '');
  const estado = pago.status === 'approved' ? 'Pagado ✅' : (pago.status === 'pending' || pago.status === 'in_process' ? 'Pago pendiente ⏳' : 'Pago rechazado ❌');
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const pedidos = leerTabla('orders');
    const p = pedidos.find(x => x.id === ref);
    if (p && p.paymentStatus !== estado) {
      const yaPagado = p.paymentStatus === 'Pagado ✅';
      p.paymentStatus = estado;
      p.paymentId = idPago;
      if (pago.status === 'approved' && p.status === 'Pendiente de Confirmación') p.status = 'Confirmado · Pagado';
      escribirTabla('orders', pedidos);
      if (pago.status === 'approved' && !yaPagado) {
        try {
          MailApp.sendEmail({
            to: emailAvisos(), name: 'Divina Locura Deco', subject: '💰 Pago recibido del pedido #' + ref,
            htmlBody: plantillaMail('¡Entró un pago por Mercado Pago!', '<p>El pedido <b>#' + ref + '</b> de <b>' + p.customer.name + '</b> fue pagado: <b>$ ' + Number(pago.transaction_amount || p.totalAmount).toLocaleString('es-AR') + '</b>.</p>')
          });
        } catch (e) {}
      }
    }
  } finally { lock.releaseLock(); }
  return { ok: true, status: pago.status, orderId: ref, paymentStatus: estado };
}

// ============================================================================
//  MAILS
// ============================================================================
function emailAvisos() {
  return PropertiesService.getScriptProperties().getProperty('EMAIL_AVISOS') || EMAIL_AVISOS || Session.getEffectiveUser().getEmail();
}

function avisarPedidoNuevo(p) {
  const filas = p.items.map(i => '<tr><td style="padding:6px;border-bottom:1px solid #eee">' + i.qty + 'x ' + i.title + (i.note ? '<br><small style="color:#888">Nota: ' + i.note + '</small>' : '') + '</td><td style="padding:6px;border-bottom:1px solid #eee;text-align:right">' + (i.unitPrice ? '$ ' + (i.unitPrice * i.qty).toLocaleString('es-AR') : i.price) + '</td></tr>').join('');
  const tel = limpiarTel(p.customer.phone);
  const wa = 'https://wa.me/' + (tel.indexOf('54') === 0 ? tel : '549' + tel);
  const html = '<p><b>' + p.customer.name + '</b> hizo un pedido desde la web.</p>' +
    '<p>📱 <a href="' + wa + '">' + p.customer.phone + '</a>' + (p.customer.email ? ' · ✉️ ' + p.customer.email : '') + (p.customer.address ? '<br>📍 ' + p.customer.address : '') + '</p>' +
    '<table style="width:100%;border-collapse:collapse">' + filas + '<tr><td style="padding:6px"><b>Total</b></td><td style="padding:6px;text-align:right"><b>$ ' + p.totalAmount.toLocaleString('es-AR') + '</b></td></tr></table>' +
    '<p style="margin-top:18px"><a href="' + SITIO_WEB + 'admin-pedidos.html" style="background:#A45A44;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Ver en el Panel de Control</a></p>';
  MailApp.sendEmail({ to: emailAvisos(), name: 'Divina Locura Deco', subject: '🛍️ Nuevo pedido #' + p.id + ' de ' + p.customer.name, htmlBody: plantillaMail('¡Nuevo pedido en la web! 🌸', html) });
}

function plantillaMail(titulo, contenido) {
  return '<div style="font-family:Georgia,serif;max-width:560px;margin:auto;background:#FAF8F5;padding:24px;border-radius:10px;color:#2B2625">' +
    '<div style="font-size:12px;letter-spacing:2px;color:#A45A44;text-transform:uppercase">Divina Locura Deco</div>' +
    '<h2 style="margin:6px 0 16px">' + titulo + '</h2><div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5">' + contenido + '</div></div>';
}

// ============================================================================
//  UTILIDADES
// ============================================================================
function limpiarTel(t) { return String(t || '').replace(/[^0-9]/g, ''); }

function limpiarTexto(t) {
  return String(t === undefined || t === null ? '' : t).replace(/</g, '‹').replace(/>/g, '›').replace(/"/g, '”').trim();
}

function limpiarProfundo(v) {
  if (typeof v === 'string') return limpiarTexto(v);
  if (Array.isArray(v)) return v.map(limpiarProfundo);
  if (v && typeof v === 'object') {
    const o = {};
    Object.keys(v).forEach(k => { o[k] = limpiarProfundo(v[k]); });
    return o;
  }
  return v;
}

function precioNumero(txt) {
  const s = String(txt || '');
  const m = s.match(/\$\s*([\d.,]+)/) || s.match(/([\d.,]+)/);
  if (!m) return 0;
  return Number(m[1].replace(/\./g, '').replace(',', '.')) || 0;
}

function nuevoIdPedido() {
  return 'ORD-' + String(Date.now()).slice(-5) + Math.floor(Math.random() * 10);
}

function leerRuta(obj, ruta) {
  return ruta.split('.').reduce((o, k) => (o === undefined || o === null ? undefined : o[k]), obj);
}

function ponerRuta(obj, ruta, valor) {
  const partes = ruta.split('.');
  let o = obj;
  for (let i = 0; i < partes.length - 1; i++) {
    if (!o[partes[i]] || typeof o[partes[i]] !== 'object') o[partes[i]] = {};
    o = o[partes[i]];
  }
  o[partes[partes.length - 1]] = valor;
}
