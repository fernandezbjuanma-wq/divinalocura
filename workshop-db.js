/**
 * Divina Locura Deco - Workshop Database & State Manager
 * Gestiona la base de datos de clientas, pedidos, chat interno con el taller,
 * control de stock de piezas e insumos, y registro de gastos y balance de Elena.
 */

(function () {
  'use strict';

  const KEY_CLIENTS = 'divinalocura_clients_db';
  const KEY_ORDERS = 'divinalocura_orders';
  const KEY_CHATS = 'divinalocura_chats_db';
  const KEY_STOCK_PRODUCTS = 'divinalocura_stock_products_db';
  const KEY_STOCK_MATERIALS = 'divinalocura_stock_materials_db';
  const KEY_EXPENSES = 'divinalocura_expenses_db';
  const KEY_BUDGET = 'divinalocura_workshop_budget';
  const KEY_ANALYTICS = 'divinalocura_analytics_db';
  const KEY_PRODUCTION = 'divinalocura_production_db';
  const KEY_SECURITY = 'divinalocura_passwords';
  const KEY_PRODUCTS = 'divinalocura_products';
  const KEY_PRODUCTS_LEGACY = 'divinalocura_custom_products';
  const KEY_SETTINGS = 'divinalocura_settings';
  const KEY_CLOUD_URL = 'divinalocura_cloud_url';
  const KEY_ADMIN_TOKEN = 'divinalocura_admin_token';
  const KEY_VISITOR_ID = 'divinalocura_visitor_id';
  const KEY_KNOWN_IDS = 'divinalocura_known_ids';

  // URL de Google Apps Script (si se pega acá queda fija para todos los dispositivos;
  // también se puede pegar desde Configuración de la Tienda sin tocar código).
  const DEFAULT_CLOUD_URL = '';

  const CATEGORY_COLORS = {
    'Telas': '#C87D69',        // Terracota textil artesanal (identitario Divina Locura)
    'Mercería': '#658572',     // Verde salvia de confección
    'Packaging': '#C49E68',    // Arena trigo y lino cálido
    'Envíos': '#B5734C',       // Caramelo rústico
    'Herramientas': '#7D5B4F', // Arcilla café de máquinas y tijeras
    'Varios': '#8F8A85'        // Lino crudo neutro
  };

  const MONTH_NAMES = {
    '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril',
    '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto',
    '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre'
  };

  // =========================================================================
  // SEED DATA INICIAL
  // =========================================================================
  const SEED_CLIENTS = [
    {
      id: 'CLI-101',
      name: 'Mariana Gómez',
      phone: '11 4567 8901',
      email: 'mariana.g@gmail.com',
      address: 'Palermo Soho, CABA',
      registeredAt: '10/11/2026',
      totalOrders: 1,
      notes: 'Prefiere tonos champán y crudo. Muy atenta.'
    },
    {
      id: 'CLI-102',
      name: 'Valeria Martínez',
      phone: '11 6234 7890',
      email: 'valemartinez@hotmail.com',
      address: 'Belgrano R, CABA',
      registeredAt: '08/11/2026',
      totalOrders: 1,
      notes: 'Pidió conejita con nombre Emma bordado a mano.'
    },
    {
      id: 'CLI-103',
      name: 'Sofía Rodríguez',
      phone: '11 3456 1122',
      email: 'sofia.rodriguez@gmail.com',
      address: 'Rosario, Santa Fe',
      registeredAt: '05/11/2026',
      totalOrders: 1,
      notes: 'Excelente clienta. Envío por correo al interior.'
    },
    {
      id: 'CLI-104',
      name: 'Luciana Rossi',
      phone: '11 7890 4433',
      email: 'lucianarossi@gmail.com',
      address: 'San Isidro, Bs.As.',
      registeredAt: '12/11/2026',
      totalOrders: 0,
      notes: 'Consultó por set de skincare y neceser a juego.'
    }
  ];

  const SEED_ORDERS = [
    {
      id: 'ORD-8421',
      date: '11/11/2026',
      time: '14:30',
      customer: {
        name: 'Mariana Gómez',
        phone: '11 4567 8901',
        email: 'mariana.g@gmail.com',
        address: 'Palermo Soho, CABA'
      },
      items: [
        {
          id: 'p1',
          title: 'Set Skincare & Antifrizz Completo',
          price: '$ 28.500 ARS · Kit Completo',
          qty: 1,
          note: 'Color champán sedoso con scrunchie a tono'
        }
      ],
      totalCount: 1,
      totalAmount: 28500,
      status: 'En Confección',
      estimatedDelivery: '18 de Noviembre',
      workshopNote: 'Cofia y funda cortadas. Armando el packaging de lino con cinta rústica.'
    },
    {
      id: 'ORD-7914',
      date: '09/11/2026',
      time: '11:15',
      customer: {
        name: 'Valeria Martínez',
        phone: '11 6234 7890',
        email: 'valemartinez@hotmail.com',
        address: 'Belgrano R, CABA'
      },
      items: [
        {
          id: 'p4',
          title: 'Conejita de Apego & Babero Bordado',
          price: '$ 22.000 ARS · Con Nombre Bordado',
          qty: 1,
          note: 'Bordar nombre "Emma" con hilo beige en cursiva'
        },
        {
          id: 'p2',
          title: 'Repasador Waffle & Lino Pesado',
          price: '$ 9.800 ARS · Puro Algodón',
          qty: 2,
          note: 'Puro algodón crudo prelavado'
        }
      ],
      totalCount: 3,
      totalAmount: 41600,
      status: 'Cortando Telas',
      estimatedDelivery: '21 de Noviembre',
      workshopNote: 'Lino prelavado listo. Iniciando bordado a mano del nombre "Emma".'
    },
    {
      id: 'ORD-6502',
      date: '04/11/2026',
      time: '17:40',
      customer: {
        name: 'Sofía Rodríguez',
        phone: '11 3456 1122',
        email: 'sofia.rodriguez@gmail.com',
        address: 'Rosario, Santa Fe'
      },
      items: [
        {
          id: 'p5',
          title: 'Cofia Doble Faz Regulable Satén',
          price: '$ 11.500 ARS · Satén Anti-frizz',
          qty: 2,
          note: 'Una perla y una rosa viejo'
        }
      ],
      totalCount: 2,
      totalAmount: 23000,
      status: 'Entregado',
      estimatedDelivery: '07 de Noviembre',
      workshopNote: 'Despachado por Correo Argentino. Clienta avisó que le llegó hermoso.'
    }
  ];

  const SEED_CHATS = {
    '1145678901': [
      {
        id: 'msg-1',
        sender: 'client',
        senderName: 'Mariana Gómez',
        text: '¡Hola Elena! Te consulto por mi pedido del Set de Satén, ¿se le puede sumar una scrunchie extra en color tostado?',
        timestamp: '11/11/2026 15:00'
      },
      {
        id: 'msg-2',
        sender: 'elena',
        senderName: 'Elena (Taller)',
        text: '¡Hola Mariana hermosa! Sí, por supuesto, ya te la agrego en la misma bolsita artesanal sin costo extra 🌸',
        timestamp: '11/11/2026 16:15'
      },
      {
        id: 'msg-3',
        sender: 'client',
        senderName: 'Mariana Gómez',
        text: '¡Qué divina sos Elena, muchísimas gracias! Quedo atenta cuando esté listo.',
        timestamp: '11/11/2026 17:00'
      }
    ],
    '1162347890': [
      {
        id: 'msg-4',
        sender: 'client',
        senderName: 'Valeria Martínez',
        text: 'Elena querida, te pedí la conejita con el nombre Emma. ¿La letra puede ser cursiva bordada?',
        timestamp: '09/11/2026 12:00'
      },
      {
        id: 'msg-5',
        sender: 'elena',
        senderName: 'Elena (Taller)',
        text: '¡Hola Vale! Sí, te la bordo en cursiva delicada con hilo de seda beige, va a quedar un amor 🤍',
        timestamp: '09/11/2026 14:10'
      }
    ]
  };

  const SEED_STOCK_PRODUCTS = [
    { id: 'p1', title: 'Set Skincare & Antifrizz Completo', inStock: 3, minAlert: 2, status: 'Entrega Inmediata' },
    { id: 'p2', title: 'Repasador Waffle & Lino Pesado', inStock: 8, minAlert: 3, status: 'Entrega Inmediata' },
    { id: 'p3', title: 'Cesta Organizadora de Tela Reversible', inStock: 4, minAlert: 2, status: 'Entrega Inmediata' },
    { id: 'p4', title: 'Conejita de Apego & Babero Bordado', inStock: 2, minAlert: 1, status: 'Por Encargo (Bordado)' },
    { id: 'p5', title: 'Cofia Doble Faz Regulable Satén', inStock: 6, minAlert: 2, status: 'Entrega Inmediata' },
    { id: 'p6', title: 'Neceser Estampado Lino y Algodón', inStock: 5, minAlert: 2, status: 'Entrega Inmediata' },
    { id: 'p7', title: 'Ajuar Completo de Bebé Doble Felpa', inStock: 1, minAlert: 1, status: 'Por Encargo' },
    { id: 'p8', title: 'Portarrollos Colgante Lino & Puntilla', inStock: 7, minAlert: 2, status: 'Entrega Inmediata' }
  ];

  const SEED_STOCK_MATERIALS = [
    { id: 'mat-1', name: 'Satén de Seda Premium (Champán & Perla)', category: 'Telas', qty: 16, unit: 'metros', minAlert: 5, costPerUnit: 4200 },
    { id: 'mat-2', name: 'Lino Rústico Puro Lavado (Crudo)', category: 'Telas', qty: 9, unit: 'metros', minAlert: 4, costPerUnit: 3800 },
    { id: 'mat-3', name: 'Nido de Abeja (Waffle) Algodón 100%', category: 'Telas', qty: 14, unit: 'metros', minAlert: 5, costPerUnit: 3400 },
    { id: 'mat-4', name: 'Puntilla de Algodón Vintage', category: 'Mercería', qty: 22, unit: 'metros', minAlert: 6, costPerUnit: 950 },
    { id: 'mat-5', name: 'Cierres Invisibles 20cm y 30cm', category: 'Mercería', qty: 28, unit: 'unidades', minAlert: 8, costPerUnit: 650 },
    { id: 'mat-6', name: 'Elásticos Suaves Especiales para Cofias', category: 'Mercería', qty: 35, unit: 'metros', minAlert: 10, costPerUnit: 420 },
    { id: 'mat-7', name: 'Bolsitas de Lino para Empaque de Regalo', category: 'Packaging', qty: 18, unit: 'unidades', minAlert: 5, costPerUnit: 1100 }
  ];

  const SEED_EXPENSES = [
    { id: 'exp-1', date: '2026-11-04', concept: 'Compra 15m Satén seda importado en Once', category: 'Telas', amount: 42000 },
    { id: 'exp-2', date: '2026-11-06', concept: 'Cajas rígidas de empaque y etiquetas artesanales', category: 'Packaging', amount: 18500 },
    { id: 'exp-3', date: '2026-11-08', concept: 'Hilos Gutermann seda, elásticos y botones madera', category: 'Mercería', amount: 9400 },
    { id: 'exp-4', date: '2026-11-10', concept: 'Envío rollos de tela desde hilandería', category: 'Envíos', amount: 6800 },
    { id: 'exp-5', date: '2026-11-12', concept: 'Tijera zig-zag y agujas de bordado para taller', category: 'Herramientas', amount: 12500 }
  ];

  const SEED_ANALYTICS = {
    totalVisits: 1420,
    uniqueVisitors: 985,
    todayVisits: 64,
    sources: {
      instagram: 64,
      whatsapp: 22,
      direct: 14
    },
    productViews: {
      'p1': 412,
      'p2': 298,
      'p3': 245,
      'p4': 210,
      'p5': 380,
      'p6': 195,
      'p7': 140,
      'p8': 260
    },
    weeklyHistory: [
      { day: 'Lun', visits: 180, orders: 1, revenue: 23000 },
      { day: 'Mar', visits: 210, orders: 0, revenue: 0 },
      { day: 'Mié', visits: 260, orders: 1, revenue: 41600 },
      { day: 'Jue', visits: 230, orders: 0, revenue: 0 },
      { day: 'Vie', visits: 290, orders: 1, revenue: 28500 },
      { day: 'Sáb', visits: 170, orders: 0, revenue: 0 },
      { day: 'Dom', visits: 80,  orders: 0, revenue: 0 }
    ]
  };

  const SEED_PRODUCTION = [
    {
      id: 'prod-001',
      orderId: 'ORD-8421',
      productName: 'Set Skincare & Antifrizz Completo (Cofia + Scrunchie)',
      clientName: 'Mariana Gómez',
      fabric: 'Satén Anti-frizz de Seda (Champán)',
      metersRequired: 1.5,
      phase: 'costura',
      assignedDate: '11/11/2026',
      targetDate: '18/11/2026',
      priority: 'normal',
      notes: 'Color champán sedoso con scrunchie a tono y elástico suave.'
    },
    {
      id: 'prod-002',
      orderId: 'ORD-7914',
      productName: 'Conejita de Apego & Babero Bordado a Mano',
      clientName: 'Valeria Martínez',
      fabric: 'Lino Puro Crudo & Rayado Terracota',
      metersRequired: 1.2,
      phase: 'corte',
      assignedDate: '09/11/2026',
      targetDate: '21/11/2026',
      priority: 'alta',
      notes: 'Bordar con hilo de seda beige nombre "Emma" en cursiva.'
    },
    {
      id: 'prod-003',
      orderId: 'ORD-7914',
      productName: 'Repasador Waffle & Lino Pesado (2 unidades)',
      clientName: 'Valeria Martínez',
      fabric: 'Nido de Abeja (Waffle) Puro Algodón',
      metersRequired: 2.0,
      phase: 'bordado',
      assignedDate: '09/11/2026',
      targetDate: '21/11/2026',
      priority: 'normal',
      notes: 'Tirita en cinta hilera de algodón espigada rústica.'
    },
    {
      id: 'prod-004',
      orderId: 'ORD-6502',
      productName: 'Cofia Doble Faz Regulable Satén (2 unidades)',
      clientName: 'Sofía Rodríguez',
      fabric: 'Satén Perla & Rosa Viejo',
      metersRequired: 1.8,
      phase: 'empaque',
      assignedDate: '04/11/2026',
      targetDate: '07/11/2026',
      priority: 'urgente',
      notes: 'Lista y planchada. Empaquetada con ramita de lavanda.'
    }
  ];

  // =========================================================================
  // HELPER PARA LOCALSTORAGE + SINCRONIZACIÓN CON GOOGLE SHEETS
  // =========================================================================
  const KEY_TO_COLLECTION = {};
  KEY_TO_COLLECTION[KEY_CLIENTS] = 'clients';
  KEY_TO_COLLECTION[KEY_ORDERS] = 'orders';
  KEY_TO_COLLECTION[KEY_CHATS] = 'chats';
  KEY_TO_COLLECTION[KEY_STOCK_PRODUCTS] = 'stockProducts';
  KEY_TO_COLLECTION[KEY_STOCK_MATERIALS] = 'stockMaterials';
  KEY_TO_COLLECTION[KEY_EXPENSES] = 'expenses';
  KEY_TO_COLLECTION[KEY_PRODUCTION] = 'production';
  KEY_TO_COLLECTION[KEY_PRODUCTS] = 'products';
  KEY_TO_COLLECTION[KEY_SETTINGS] = 'settings';

  let suppressCloudSync = false;
  const pendingCloudSaves = {};
  const syncListeners = [];
  let cloudMeta = { sheetUrl: '', mpEnabled: false, notifyEmail: '', lastSync: null, syncing: false, lastError: '' };

  function notifySyncListeners(detail) {
    syncListeners.forEach(fn => { try { fn(detail); } catch (e) {} });
    try {
      window.dispatchEvent(new CustomEvent('divinalocura:sync', { detail: detail || cloudMeta }));
    } catch (e) {}
  }

  function getJson(key, defaultVal) {
    try {
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error leyendo', key, e);
    }
    return defaultVal;
  }

  function setJson(key, val, skipCloud) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      // Mantener sincronizada la clave vieja de productos por si alguna pestaña la lee
      if (key === KEY_PRODUCTS) localStorage.setItem(KEY_PRODUCTS_LEGACY, JSON.stringify(val));
    } catch (e) {
      console.warn('Error guardando', key, e);
    }
    const col = KEY_TO_COLLECTION[key];
    if (col && !skipCloud && !suppressCloudSync) {
      scheduleCloudSave(col, val);
    }
  }

  function getKnownIds(col) {
    const all = getJson(KEY_KNOWN_IDS, {});
    return Array.isArray(all[col]) ? all[col] : [];
  }

  function setKnownIds(col, list) {
    if (!Array.isArray(list)) return;
    const all = getJson(KEY_KNOWN_IDS, {});
    all[col] = list.map(x => x && x.id).filter(Boolean);
    try { localStorage.setItem(KEY_KNOWN_IDS, JSON.stringify(all)); } catch (e) {}
  }

  function scheduleCloudSave(collectionName, data) {
    if (!getCloudUrl() || !getAdminToken()) return;
    clearTimeout(pendingCloudSaves[collectionName]);
    pendingCloudSaves[collectionName] = setTimeout(() => {
      pushCollectionToCloud(collectionName, data);
    }, 350);
  }

  function getCloudUrl() {
    try {
      const saved = (localStorage.getItem(KEY_CLOUD_URL) || '').trim();
      if (saved) return saved;
      const st = getJson(KEY_SETTINGS, {});
      if (st && st.cloud_url) return String(st.cloud_url).trim();
    } catch (e) {}
    return DEFAULT_CLOUD_URL;
  }

  function getAdminToken() {
    try { return localStorage.getItem(KEY_ADMIN_TOKEN) || ''; } catch (e) { return ''; }
  }

  async function callCloud(action, payload) {
    const url = getCloudUrl();
    if (!url) return { ok: false, offline: true, error: 'Sin URL de Google Sheets configurada.' };
    try {
      const body = Object.assign({ action: action, token: getAdminToken() }, payload || {});
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(body),
        redirect: 'follow'
      });
      const json = await res.json();
      if (json && json.code === 'AUTH') {
        try { localStorage.removeItem(KEY_ADMIN_TOKEN); } catch (e) {}
      }
      return json || { ok: false, error: 'Respuesta vacía' };
    } catch (err) {
      return { ok: false, networkError: true, error: String(err && err.message || err) };
    }
  }

  async function pushCollectionToCloud(collectionName, data) {
    if (!getCloudUrl() || !getAdminToken()) return { ok: false, skipped: true };
    cloudMeta.syncing = true;
    notifySyncListeners({ status: 'saving', collection: collectionName });
    const baseIds = (collectionName === 'orders' || collectionName === 'clients') ? getKnownIds(collectionName) : undefined;
    const res = await callCloud('save', { name: collectionName, data: data, baseIds: baseIds });
    cloudMeta.syncing = false;
    if (res && res.ok) {
      cloudMeta.lastSync = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
      cloudMeta.lastError = '';
      if (Array.isArray(res.data) && (collectionName === 'orders' || collectionName === 'clients')) {
        suppressCloudSync = true;
        setJson(collectionName === 'orders' ? KEY_ORDERS : KEY_CLIENTS, res.data, true);
        setKnownIds(collectionName, res.data);
        suppressCloudSync = false;
      } else if (Array.isArray(data)) {
        setKnownIds(collectionName, data);
      }
      notifySyncListeners({ status: 'saved', collection: collectionName, lastSync: cloudMeta.lastSync });
    } else {
      cloudMeta.lastError = (res && res.error) || 'No se pudo guardar en Google Sheets';
      notifySyncListeners({ status: 'error', error: cloudMeta.lastError });
    }
    return res;
  }

  function cleanPhoneKey(phone) {
    if (!phone) return 'anon';
    return String(phone).replace(/[^0-9]/g, '');
  }

  function escapeHtml(str) {
    return String(str === undefined || str === null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // =========================================================================
  // INICIALIZACIÓN DE BASES DE DATOS SI ESTÁN VACÍAS
  // =========================================================================
  function initDatabase() {
    suppressCloudSync = true;
    try {
      // Migrar productos si habían quedado en la clave vieja del panel
      const mainProds = localStorage.getItem(KEY_PRODUCTS);
      const legacyProds = localStorage.getItem(KEY_PRODUCTS_LEGACY);
      if (!mainProds && legacyProds) {
        localStorage.setItem(KEY_PRODUCTS, legacyProds);
      } else if (mainProds && legacyProds && mainProds !== legacyProds) {
        // Preferir la lista donde haya más productos o ediciones recientes
        try {
          const a = JSON.parse(mainProds);
          const b = JSON.parse(legacyProds);
          if (Array.isArray(b) && b.length >= (Array.isArray(a) ? a.length : 0)) {
            localStorage.setItem(KEY_PRODUCTS, legacyProds);
          }
        } catch (e) {}
      }

      if (!localStorage.getItem(KEY_CLIENTS)) setJson(KEY_CLIENTS, SEED_CLIENTS, true);
      const existingOrders = getJson(KEY_ORDERS, null);
      if (!existingOrders || existingOrders.length === 0) setJson(KEY_ORDERS, SEED_ORDERS, true);
      if (!localStorage.getItem(KEY_CHATS)) setJson(KEY_CHATS, SEED_CHATS, true);
      if (!localStorage.getItem(KEY_STOCK_PRODUCTS)) setJson(KEY_STOCK_PRODUCTS, SEED_STOCK_PRODUCTS, true);
      if (!localStorage.getItem(KEY_STOCK_MATERIALS)) setJson(KEY_STOCK_MATERIALS, SEED_STOCK_MATERIALS, true);
      if (!localStorage.getItem(KEY_EXPENSES)) setJson(KEY_EXPENSES, SEED_EXPENSES, true);
      if (!localStorage.getItem(KEY_ANALYTICS)) setJson(KEY_ANALYTICS, SEED_ANALYTICS, true);
      if (!localStorage.getItem(KEY_PRODUCTION)) setJson(KEY_PRODUCTION, SEED_PRODUCTION, true);
    } finally {
      suppressCloudSync = false;
    }
  }

  initDatabase();

  // =========================================================================
  // API DEL TALLER (WorkshopDB)
  // =========================================================================
  const WorkshopDB = {
    // -----------------------------------------------------------------------
    // CLIENTAS
    // -----------------------------------------------------------------------
    getClients: function () {
      return getJson(KEY_CLIENTS, SEED_CLIENTS);
    },

    saveClient: function (clientData) {
      const clients = this.getClients();
      const cleanPhone = cleanPhoneKey(clientData.phone);
      const existingIdx = clients.findIndex(c => cleanPhoneKey(c.phone) === cleanPhone);

      const clientRecord = {
        id: clientData.id || ('CLI-' + Math.floor(100 + Math.random() * 900)),
        name: clientData.name || 'Clienta',
        phone: clientData.phone || '',
        email: clientData.email || '',
        address: clientData.address || '',
        registeredAt: clientData.registeredAt || new Date().toLocaleDateString('es-AR'),
        totalOrders: clientData.totalOrders || 0,
        notes: clientData.notes || ''
      };

      if (existingIdx >= 0) {
        clients[existingIdx] = { ...clients[existingIdx], ...clientRecord };
      } else {
        clients.unshift(clientRecord);
      }

      setJson(KEY_CLIENTS, clients);
      // Si es una clienta registrándose en la tienda pública, enviarlo al servidor
      if (getCloudUrl() && !getAdminToken()) {
        callCloud('registerClient', { client: clientRecord });
      }
      return clientRecord;
    },

    // -----------------------------------------------------------------------
    // PRODUCTOS DEL CATÁLOGO (UNIFICADOS ENTRE TIENDA Y PANEL)
    // -----------------------------------------------------------------------
    getProducts: function () {
      const saved = getJson(KEY_PRODUCTS, null);
      if (Array.isArray(saved) && saved.length > 0) return saved;
      const legacy = getJson(KEY_PRODUCTS_LEGACY, null);
      if (Array.isArray(legacy) && legacy.length > 0) {
        setJson(KEY_PRODUCTS, legacy, true);
        return legacy;
      }
      if (typeof INITIAL_PRODUCTS !== 'undefined' && Array.isArray(INITIAL_PRODUCTS)) {
        return JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
      }
      if (typeof window.INITIAL_PRODUCTS !== 'undefined' && Array.isArray(window.INITIAL_PRODUCTS)) {
        return JSON.parse(JSON.stringify(window.INITIAL_PRODUCTS));
      }
      return [];
    },

    saveProducts: function (productsList) {
      if (!Array.isArray(productsList)) return [];
      setJson(KEY_PRODUCTS, productsList);
      return productsList;
    },

    getSettings: function (defaults) {
      return Object.assign({}, defaults || {}, getJson(KEY_SETTINGS, {}));
    },

    saveSettings: function (settingsObj) {
      const merged = Object.assign({}, getJson(KEY_SETTINGS, {}), settingsObj || {});
      if (merged.cloud_url !== undefined) {
        try { localStorage.setItem(KEY_CLOUD_URL, String(merged.cloud_url || '').trim()); } catch (e) {}
      }
      setJson(KEY_SETTINGS, merged);
      return merged;
    },

    // -----------------------------------------------------------------------
    // PEDIDOS & GESTIÓN DE ESTADO / FECHA / NOTA DE TALLER
    // -----------------------------------------------------------------------
    getOrders: function () {
      return getJson(KEY_ORDERS, SEED_ORDERS);
    },

    updateOrder: function (orderId, updates) {
      const orders = this.getOrders();
      const idx = orders.findIndex(o => o.id === orderId);
      if (idx >= 0) {
        const prevStatus = orders[idx].status;
        orders[idx] = { ...orders[idx], ...updates };
        setJson(KEY_ORDERS, orders);
        // Si el pedido pasa a "Cortando Telas" o "En Confección" y todavía no está en la cola de producción, sumarlo automáticamente
        const newSt = orders[idx].status;
        if (newSt !== prevStatus && (newSt === 'Cortando Telas' || newSt === 'En Confección')) {
          this.ensureOrderInProduction(orders[idx]);
        }
        return orders[idx];
      }
      return null;
    },

    ensureOrderInProduction: function (order) {
      if (!order || !order.id) return [];
      const queue = this.getProductionQueue();
      if (queue.some(p => p.orderId === order.id)) return [];
      const created = [];
      (order.items || []).forEach(it => {
        const qty = Number(it.qty) || 1;
        const est = this.estimateFabricForItem(it);
        const item = this.addProductionItem({
          orderId: order.id,
          productName: (qty > 1 ? qty + 'x ' : '') + (it.title || 'Pieza Textil'),
          clientName: (order.customer && order.customer.name) || 'Clienta',
          fabric: est.fabricName,
          metersRequired: +(est.metersPerUnit * qty).toFixed(2),
          phase: order.status === 'En Confección' ? 'costura' : 'corte',
          targetDate: order.estimatedDelivery || 'A coordinar',
          priority: 'normal',
          notes: it.note || order.workshopNote || ''
        });
        created.push(item);
      });
      return created;
    },

    estimateFabricForItem: function (it) {
      const id = String((it && it.id) || '').toLowerCase();
      const title = String((it && (it.title || it.productName)) || '').toLowerCase();
      if (id === 'p1' || title.includes('set skincare') || title.includes('kit')) {
        return { fabricName: 'Satén de Seda Premium', metersPerUnit: 1.5 };
      }
      if (id === 'p5' || title.includes('cofia') || title.includes('antifaz') || title.includes('satén') || title.includes('saten')) {
        return { fabricName: 'Satén de Seda Premium', metersPerUnit: 0.9 };
      }
      if (id === 'p2' || title.includes('waffle') || title.includes('repasador') || title.includes('nido de abeja') || title.includes('toall')) {
        return { fabricName: 'Nido de Abeja (Waffle) Algodón 100%', metersPerUnit: 0.9 };
      }
      return { fabricName: 'Lino Rústico Puro Lavado', metersPerUnit: 1.2 };
    },

    deleteOrder: function (orderId) {
      let orders = this.getOrders();
      orders = orders.filter(o => o.id !== orderId);
      setJson(KEY_ORDERS, orders);
      return orders;
    },

    addOrder: function (newOrder) {
      const orders = this.getOrders();
      // Si la pieza está con entrega inmediata en stock, descontar 1 unidad terminada
      const stock = this.getProductStock();
      let stockChanged = false;
      (newOrder.items || []).forEach(it => {
        const st = stock.find(s => s.id === it.id);
        if (st && st.inStock > 0) {
          const take = Math.min(st.inStock, Number(it.qty) || 1);
          st.inStock = Math.max(0, st.inStock - take);
          stockChanged = true;
        }
      });
      if (stockChanged) setJson(KEY_STOCK_PRODUCTS, stock);

      orders.unshift(newOrder);
      setJson(KEY_ORDERS, orders);

      if (newOrder.customer && newOrder.customer.phone) {
        this.saveClient({
          name: newOrder.customer.name,
          phone: newOrder.customer.phone,
          email: newOrder.customer.email,
          address: newOrder.customer.address,
          totalOrders: 1
        });
      }

      return orders;
    },

    // Enviar pedido al servidor (Google Sheets + mail a Elena + link de Mercado Pago opcional)
    submitPublicOrder: async function (newOrder, wantPayment) {
      if (!getCloudUrl()) return { ok: false, offline: true };
      const res = await callCloud('createOrder', { order: newOrder, wantPayment: !!wantPayment });
      if (res && res.ok && res.order) {
        suppressCloudSync = true;
        const orders = this.getOrders().map(o => (o.id === newOrder.id ? res.order : o));
        setJson(KEY_ORDERS, orders, true);
        suppressCloudSync = false;
      }
      return res;
    },

    // -----------------------------------------------------------------------
    // CHAT DIRECTO ENTRE CLIENTA Y ELENA
    // -----------------------------------------------------------------------
    getChats: function () {
      const raw = getJson(KEY_CHATS, SEED_CHATS) || {};
      Object.keys(raw).forEach(k => {
        if (Array.isArray(raw[k])) {
          raw[k] = raw[k].map(m => ({
            ...m,
            time: m.time || m.timestamp || ''
          }));
        }
      });
      return raw;
    },

    getMessagesForPhone: function (phone) {
      const chats = this.getChats();
      const key = cleanPhoneKey(phone);
      return chats[key] || chats[phone] || [];
    },

    getChatForPhone: function (phone) {
      return this.getMessagesForPhone(phone);
    },

    sendMessage: function (phone, text, sender, senderName) {
      const chats = this.getChats();
      const key = cleanPhoneKey(phone) || phone;
      if (!chats[key]) chats[key] = [];

      const ts = new Date().toLocaleDateString('es-AR') + ' ' + new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
      const normSender = (sender === 'workshop' ? 'elena' : (sender || 'client'));
      const newMsg = {
        id: 'msg-' + Date.now(),
        sender: normSender,
        senderName: senderName || (normSender === 'elena' ? 'Elena (Taller)' : 'Clienta'),
        text: String(text || '').trim(),
        timestamp: ts,
        time: ts
      };

      chats[key].push(newMsg);
      setJson(KEY_CHATS, chats);

      if (normSender !== 'elena' && getCloudUrl() && !getAdminToken()) {
        callCloud('sendClientMessage', { phone: phone, name: newMsg.senderName, text: newMsg.text });
      }
      return newMsg;
    },

    addMessageToChat: function (phone, msgObj) {
      if (!msgObj) return null;
      return this.sendMessage(phone, msgObj.text || '', msgObj.sender || 'workshop', msgObj.senderName);
    },

    fetchClientCloudData: async function (phone) {
      if (!getCloudUrl() || !phone) return null;
      const res = await callCloud('clientData', { phone: phone });
      if (res && res.ok) {
        suppressCloudSync = true;
        if (Array.isArray(res.orders) && res.orders.length) {
          const current = this.getOrders();
          const map = {};
          current.forEach(o => { map[o.id] = o; });
          res.orders.forEach(o => { map[o.id] = Object.assign(map[o.id] || {}, o); });
          setJson(KEY_ORDERS, Object.values(map), true);
        }
        if (Array.isArray(res.messages)) {
          const chats = this.getChats();
          chats[cleanPhoneKey(phone)] = res.messages;
          setJson(KEY_CHATS, chats, true);
        }
        suppressCloudSync = false;
      }
      return res;
    },

    // -----------------------------------------------------------------------
    // CONTROL DE STOCK (PIEZAS TERMINADAS)
    // -----------------------------------------------------------------------
    getProductStock: function () {
      const stock = getJson(KEY_STOCK_PRODUCTS, SEED_STOCK_PRODUCTS);
      // Asegurar que cualquier producto nuevo del catálogo aparezca en el control de stock
      const prods = this.getProducts();
      let added = false;
      prods.forEach(p => {
        if (p && p.id && !stock.some(s => s.id === p.id)) {
          stock.push({ id: p.id, title: p.title, inStock: 2, minAlert: 1, status: 'Entrega Inmediata' });
          added = true;
        }
      });
      if (added) setJson(KEY_STOCK_PRODUCTS, stock, true);
      return stock;
    },

    updateProductStock: function (productId, newQty, newStatus) {
      const stock = this.getProductStock();
      const idx = stock.findIndex(s => s.id === productId);
      if (idx >= 0) {
        if (typeof newQty === 'number') stock[idx].inStock = Math.max(0, newQty);
        if (newStatus) stock[idx].status = newStatus;
        setJson(KEY_STOCK_PRODUCTS, stock);
        return stock[idx];
      }
      return null;
    },

    // -----------------------------------------------------------------------
    // CONTROL DE TELAS & INSUMOS DE PRODUCCIÓN (CON DESCUENTO AUTOMÁTICO)
    // -----------------------------------------------------------------------
    getMaterials: function () {
      const raw = getJson(KEY_STOCK_MATERIALS, SEED_STOCK_MATERIALS) || [];
      return raw.map(m => {
        const q = m.qty !== undefined ? Number(m.qty) : Number(m.currentStock || 0);
        const minA = m.minAlert !== undefined ? Number(m.minAlert) : Number(m.minStock || 4);
        const cat = m.category || m.type || 'Telas';
        return {
          ...m,
          qty: q,
          currentStock: q,
          minAlert: minA,
          minStock: minA,
          category: cat,
          type: cat,
          unit: m.unit || 'm'
        };
      });
    },

    findMatchingMaterial: function (textOrFabric) {
      const mats = this.getMaterials();
      const q = String(textOrFabric || '').toLowerCase();
      if (!q) return null;
      // 1) Coincidencia por ID directo
      const byId = mats.find(m => m.id.toLowerCase() === q);
      if (byId) return byId;
      // 2) Coincidencia por palabras clave textiles
      const keywords = [
        { words: ['satén', 'saten', 'seda', 'champán', 'champan', 'perla', 'antifrizz'], match: m => /sat[eé]n|seda/i.test(m.name) },
        { words: ['waffle', 'nido de abeja', 'repasador', 'felpa', 'toall'], match: m => /waffle|abeja/i.test(m.name) },
        { words: ['lino', 'tusor', 'crudo', 'cesta', 'conej', 'portarroll', 'neceser'], match: m => /lino/i.test(m.name) && m.category === 'Telas' },
        { words: ['puntilla', 'encaje'], match: m => /puntilla/i.test(m.name) },
        { words: ['cierre'], match: m => /cierre/i.test(m.name) },
        { words: ['elástico', 'elastico'], match: m => /el[aá]stico/i.test(m.name) },
        { words: ['bolsita', 'empaque', 'packaging'], match: m => /bolsita|empaque/i.test(m.name) }
      ];
      for (let i = 0; i < keywords.length; i++) {
        if (keywords[i].words.some(w => q.includes(w))) {
          const found = mats.find(keywords[i].match);
          if (found) return found;
        }
      }
      // 3) Coincidencia por palabras sueltas del nombre del material
      return mats.find(m => {
        const tokens = String(m.name || '').toLowerCase().split(/\s+/).filter(t => t.length >= 4);
        return tokens.some(t => q.includes(t));
      }) || null;
    },

    updateMaterialQty: function (materialId, deltaOrQty, isDelta = false) {
      const mats = this.getMaterials();
      const idx = mats.findIndex(m => m.id === materialId);
      if (idx >= 0) {
        const cur = mats[idx].qty !== undefined ? Number(mats[idx].qty) : Number(mats[idx].currentStock || 0);
        const nextQty = isDelta
          ? Math.max(0, +(cur + Number(deltaOrQty)).toFixed(2))
          : Math.max(0, +Number(deltaOrQty).toFixed(2));
        mats[idx].qty = nextQty;
        mats[idx].currentStock = nextQty;
        setJson(KEY_STOCK_MATERIALS, mats);
        return mats[idx];
      }
      return null;
    },

    updateMaterialStock: function (materialId, newQty) {
      return this.updateMaterialQty(materialId, newQty, false);
    },

    addMaterial: function (materialData) {
      const mats = this.getMaterials();
      const q = parseFloat(materialData.qty !== undefined ? materialData.qty : materialData.currentStock) || 0;
      const minA = parseFloat(materialData.minAlert !== undefined ? materialData.minAlert : materialData.minStock) || 4;
      const cat = materialData.category || materialData.type || 'Telas';
      const newMat = {
        id: 'mat-' + Date.now(),
        name: materialData.name,
        category: cat,
        type: cat,
        qty: q,
        currentStock: q,
        unit: materialData.unit || 'metros',
        minAlert: minA,
        minStock: minA,
        costPerUnit: parseFloat(materialData.costPerUnit) || 3500,
        color: materialData.color || '#C87D69'
      };
      mats.push(newMat);
      setJson(KEY_STOCK_MATERIALS, mats);
      return newMat;
    },

    deleteMaterial: function (materialId) {
      let mats = this.getMaterials();
      mats = mats.filter(m => m.id !== materialId);
      setJson(KEY_STOCK_MATERIALS, mats);
      return mats;
    },

    // -----------------------------------------------------------------------
    // PRESUPUESTO & LÍMITES DE CONSUMO DEL TALLER
    // -----------------------------------------------------------------------
    getBudget: function () {
      const stored = localStorage.getItem(KEY_BUDGET);
      return stored ? parseFloat(stored) : 120000;
    },

    setBudget: function (amount) {
      const num = Math.max(0, parseFloat(amount) || 0);
      localStorage.setItem(KEY_BUDGET, num);
      if (!suppressCloudSync) scheduleCloudSave('budget', num);
      return num;
    },

    normalizeYearMonth: function (dateStr) {
      if (!dateStr) return '';
      const s = String(dateStr);
      if (s.includes('/')) {
        const parts = s.split('/');
        if (parts.length === 3) {
          const y = parts[2].trim().slice(0, 4).padStart(4, '20');
          const m = parts[1].trim().padStart(2, '0');
          return `${y}-${m}`;
        }
      }
      if (s.includes('-')) {
        const parts = s.split('-');
        if (parts.length >= 2) {
          const y = parts[0].trim();
          const m = parts[1].trim().padStart(2, '0');
          return `${y}-${m}`;
        }
      }
      return '';
    },

    getAvailableMonths: function () {
      const orders = this.getOrders();
      const expenses = this.getExpenses();
      const monthSet = new Set();

      orders.forEach(o => {
        const ym = this.normalizeYearMonth(o.date);
        if (ym) monthSet.add(ym);
      });

      expenses.forEach(e => {
        const ym = this.normalizeYearMonth(e.date);
        if (ym) monthSet.add(ym);
      });

      const now = new Date();
      const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      monthSet.add(currentYM);

      const sortedMonths = Array.from(monthSet).sort().reverse();
      const list = [
        { value: 'all', label: '📊 Todos los períodos (Histórico Total)' }
      ];

      sortedMonths.forEach(ym => {
        const [y, m] = ym.split('-');
        const name = MONTH_NAMES[m] || m;
        list.push({
          value: ym,
          label: `🗓️ ${name} ${y}`
        });
      });

      return list;
    },

    // -----------------------------------------------------------------------
    // GASTOS & BALANCE DE PRODUCCIÓN (SUMA METROS SI COMPRA TELA)
    // -----------------------------------------------------------------------
    getExpenses: function () {
      const raw = getJson(KEY_EXPENSES, SEED_EXPENSES) || [];
      return raw.map(e => ({
        ...e,
        concept: e.concept || e.description || 'Gasto de taller',
        description: e.description || e.concept || 'Gasto de taller'
      }));
    },

    addExpense: function (expenseData) {
      const expenses = this.getExpenses();
      const textConcept = expenseData.concept || expenseData.description || 'Gasto de taller';
      const newExp = {
        id: 'exp-' + Date.now(),
        date: expenseData.date || new Date().toISOString().split('T')[0],
        concept: textConcept,
        description: textConcept,
        category: expenseData.category || 'Telas',
        amount: parseFloat(expenseData.amount) || 0
      };

      // Si el gasto dice por ejemplo "Compra 10m Satén" o trae materialId + qtyAdded, sumar al stock automáticamente
      let restocked = null;
      const explicitMatId = expenseData.materialId;
      const explicitQty = parseFloat(expenseData.qtyAdded);
      if (explicitMatId && explicitQty > 0) {
        restocked = this.updateMaterialQty(explicitMatId, explicitQty, true);
      } else if (newExp.category === 'Telas' || newExp.category === 'Mercería' || newExp.category === 'Packaging') {
        const m = String(newExp.concept).match(/(\d+(?:[.,]\d+)?)\s*(?:m|mt|mts|metros|un|u|unidades)\b/i);
        const target = this.findMatchingMaterial(newExp.concept);
        if (m && target) {
          const qtyAdd = parseFloat(m[1].replace(',', '.'));
          if (qtyAdd > 0) {
            restocked = this.updateMaterialQty(target.id, qtyAdd, true);
          }
        }
      }
      if (restocked) newExp.restockedMaterial = `${restocked.name} (${restocked.qty} ${restocked.unit})`;

      expenses.unshift(newExp);
      setJson(KEY_EXPENSES, expenses);
      return newExp;
    },

    deleteExpense: function (expenseId) {
      let expenses = this.getExpenses();
      expenses = expenses.filter(e => e.id !== expenseId);
      setJson(KEY_EXPENSES, expenses);
      return expenses;
    },

    // Resumen financiero filtrado por mes (con rentabilidad real calculada de los pedidos y catálogo)
    getFinancialSummary: function (selectedMonth = 'all') {
      const allOrders = this.getOrders();
      const allExpenses = this.getExpenses();

      const filteredOrders = allOrders.filter(ord => {
        if (!selectedMonth || selectedMonth === 'all') return true;
        return this.normalizeYearMonth(ord.date) === selectedMonth;
      });

      const filteredExpenses = allExpenses.filter(exp => {
        if (!selectedMonth || selectedMonth === 'all') return true;
        return this.normalizeYearMonth(exp.date) === selectedMonth;
      });

      const parsePrice = (val) => {
        if (typeof val === 'number') return val;
        const m = String(val || '').match(/\$\s*([\d.,]+)/) || String(val || '').match(/([\d.,]+)/);
        if (!m) return 0;
        return parseFloat(m[1].replace(/\./g, '').replace(',', '.')) || 0;
      };

      const totalIncome = filteredOrders.reduce((sum, ord) => {
        if (ord.totalAmount) return sum + Number(ord.totalAmount);
        const itemsTotal = (ord.items || []).reduce((sub, item) => {
          return sub + (parsePrice(item.price) * (item.qty || 1));
        }, 0);
        return sum + itemsTotal;
      }, 0);

      const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
      const netProfit = totalIncome - totalExpenses;
      const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

      const categoryTotals = {};
      Object.keys(CATEGORY_COLORS).forEach(cat => { categoryTotals[cat] = 0; });
      filteredExpenses.forEach(exp => {
        const cat = exp.category || 'Varios';
        if (!categoryTotals[cat]) categoryTotals[cat] = 0;
        categoryTotals[cat] += (parseFloat(exp.amount) || 0);
      });

      const categoryPercentages = Object.keys(categoryTotals)
        .map(cat => {
          const amount = categoryTotals[cat];
          const pct = totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : '0.0';
          return {
            category: cat,
            amount: amount,
            percent: parseFloat(pct),
            color: CATEGORY_COLORS[cat] || '#94A3B8'
          };
        })
        .filter(item => item.amount > 0)
        .sort((a, b) => b.amount - a.amount);

      const budgetLimit = this.getBudget();
      const budgetPercent = budgetLimit > 0 ? Math.min(100, Math.round((totalExpenses / budgetLimit) * 100)) : 0;
      let budgetStatus = 'ok';
      let budgetBadgeText = '🌿 Consumo controlado & saludable';
      if (totalExpenses > budgetLimit) {
        budgetStatus = 'danger';
        budgetBadgeText = '🚨 Límite de consumo superado';
      } else if (totalExpenses >= budgetLimit * 0.8) {
        budgetStatus = 'warning';
        budgetBadgeText = '⚠️ Advertencia (Cerca del tope)';
      }

      const materials = this.getMaterials();
      const fabricStockValue = materials.reduce((sum, m) => sum + ((parseFloat(m.qty) || 0) * (parseFloat(m.costPerUnit) || 3500)), 0);

      let paidTotal = 0;
      let depositTotal = 0;
      let pendingBalance = 0;
      let paidOrdersCount = 0;
      let pendingOrdersCount = 0;

      filteredOrders.forEach(ord => {
        const amt = parseFloat(ord.totalAmount) || 0;
        const isPaid = ord.status === 'Entregado' || String(ord.paymentStatus || '').includes('Pagado') || ord.status === 'Confirmado · Pagado';
        if (isPaid) {
          paidTotal += amt;
          paidOrdersCount++;
        } else {
          const deposit = Math.round(amt * 0.5);
          depositTotal += deposit;
          pendingBalance += (amt - deposit);
          pendingOrdersCount++;
        }
      });

      const avgTicket = filteredOrders.length > 0 ? Math.round(totalIncome / filteredOrders.length) : 0;

      // Rentabilidad real por producto del catálogo + unidades vendidas en el período
      const catalog = this.getProducts();
      const soldCountByProd = {};
      filteredOrders.forEach(ord => {
        (ord.items || []).forEach(it => {
          const key = it.id || it.title;
          soldCountByProd[key] = (soldCountByProd[key] || 0) + (Number(it.qty) || 1);
        });
      });

      const starProductsProfit = catalog.slice(0, 8).map(p => {
        const price = parsePrice(p.price) || 12500;
        const est = this.estimateFabricForItem(p);
        const mat = this.findMatchingMaterial(est.fabricName);
        const unitCostMat = mat ? (parseFloat(mat.costPerUnit) || 3500) : 3500;
        const cost = Number(p.cost) || Math.round(est.metersPerUnit * unitCostMat + 850); // tela + mercería/packaging
        const margin = price > 0 ? Math.round(((price - cost) / price) * 100) : 0;
        const sold = soldCountByProd[p.id] || soldCountByProd[p.title] || 0;
        return {
          id: p.id,
          name: p.title,
          category: p.category || 'Taller',
          cost: cost,
          price: price,
          margin: margin,
          sold: sold,
          badge: sold >= 2 ? `🔥 ${sold} vendidos` : (sold === 1 ? '⭐ 1 vendido' : (p.tag || '🌿 En catálogo'))
        };
      }).sort((a, b) => (b.sold * b.price) - (a.sold * a.price) || b.margin - a.margin).slice(0, 6);

      const fabricConsumption = this.getFabricConsumption(selectedMonth);

      return {
        selectedMonth,
        totalIncome,
        totalRevenue: totalIncome,
        totalExpenses,
        netProfit,
        profitMargin,
        avgTicket,
        fabricStockValue,
        paidTotal,
        paidOrdersCount,
        depositTotal,
        pendingBalance,
        pendingOrdersCount,
        starProductsProfit,
        totalOrdersCount: filteredOrders.length,
        totalExpensesCount: filteredExpenses.length,
        filteredOrders,
        filteredExpenses,
        expensesByCategory: categoryTotals,
        categoryPercentages,
        budgetLimit,
        budgetPercent,
        budgetStatus,
        budgetBadgeText,
        fabricConsumption
      };
    },

    getFabricConsumption: function (selectedMonth = 'all') {
      const orders = this.getOrders().filter(ord => {
        if (!selectedMonth || selectedMonth === 'all') return true;
        return this.normalizeYearMonth(ord.date) === selectedMonth;
      });

      let satinMeters = 0;
      let linenMeters = 0;
      let waffleMeters = 0;
      let piecesFinished = 0;

      orders.forEach(ord => {
        (ord.items || []).forEach(item => {
          const qty = item.qty || 1;
          piecesFinished += qty;
          const est = this.estimateFabricForItem(item);
          if (/sat[eé]n/i.test(est.fabricName)) satinMeters += est.metersPerUnit * qty;
          else if (/waffle/i.test(est.fabricName)) waffleMeters += est.metersPerUnit * qty;
          else linenMeters += est.metersPerUnit * qty;
        });
      });

      return {
        totalMeters: Math.round(satinMeters + linenMeters + waffleMeters),
        piecesFinished,
        satinMeters: +(satinMeters).toFixed(1),
        linenMeters: +(linenMeters).toFixed(1),
        waffleMeters: +(waffleMeters).toFixed(1)
      };
    },

    // -----------------------------------------------------------------------
    // ANALÍTICAS DE TRÁFICO & VISITAS REALES
    // -----------------------------------------------------------------------
    getAnalytics: function () {
      return getJson(KEY_ANALYTICS, SEED_ANALYTICS);
    },

    detectTrafficSource: function () {
      try {
        const params = new URLSearchParams(window.location.search);
        const utm = (params.get('utm_source') || params.get('ref') || params.get('origen') || '').toLowerCase();
        const ref = (document.referrer || '').toLowerCase();
        const combined = utm + ' ' + ref;
        if (combined.includes('instagram') || combined.includes('ig')) return 'instagram';
        if (combined.includes('whatsapp') || combined.includes('wa.me')) return 'whatsapp';
        if (combined.includes('google')) return 'google';
        if (combined.includes('facebook') || combined.includes('fb')) return 'facebook';
      } catch (e) {}
      return 'directo';
    },

    getVisitorId: function () {
      try {
        let vid = localStorage.getItem(KEY_VISITOR_ID);
        if (!vid) {
          vid = 'v-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
          localStorage.setItem(KEY_VISITOR_ID, vid);
        }
        return vid;
      } catch (e) {
        return 'anon';
      }
    },

    trackVisit: function () {
      const data = this.getAnalytics();
      data.totalVisits = (data.totalVisits || 0) + 1;
      data.todayVisits = (data.todayVisits || 0) + 1;
      const src = this.detectTrafficSource();
      const vid = this.getVisitorId();
      let isNewSession = false;
      try {
        if (!sessionStorage.getItem('divinalocura_visited_session')) {
          data.uniqueVisitors = (data.uniqueVisitors || 0) + 1;
          sessionStorage.setItem('divinalocura_visited_session', 'true');
          isNewSession = true;
        }
      } catch (e) {}
      setJson(KEY_ANALYTICS, data, true);
      if (isNewSession && getCloudUrl()) {
        callCloud('trackVisit', {
          type: 'visita',
          page: window.location.pathname.split('/').pop() || 'index.html',
          source: src,
          visitorId: vid
        });
      }
      return data;
    },

    trackProductView: function (productId) {
      if (!productId) return;
      const data = this.getAnalytics();
      if (!data.productViews) data.productViews = {};
      data.productViews[productId] = (data.productViews[productId] || 0) + 1;
      setJson(KEY_ANALYTICS, data, true);
      if (getCloudUrl()) {
        callCloud('trackVisit', {
          type: 'producto',
          productId: productId,
          source: this.detectTrafficSource(),
          visitorId: this.getVisitorId()
        });
      }
      return data;
    },

    recordProductView: function (productId) {
      return this.trackProductView(productId);
    },

    // -----------------------------------------------------------------------
    // CONTROL DE PRODUCCIÓN & TALLER TEXTIL (CON DESCUENTO AUTOMÁTICO DE TELA)
    // -----------------------------------------------------------------------
    getProductionQueue: function () {
      const raw = getJson(KEY_PRODUCTION, SEED_PRODUCTION) || [];
      return raw.map(item => ({
        ...item,
        productName: item.productName || item.productTitle || 'Pieza Textil Artesanal',
        productTitle: item.productTitle || item.productName || 'Pieza Textil Artesanal',
        metersRequired: item.metersRequired || item.metersUsed || 1.0,
        metersUsed: item.metersUsed || item.metersRequired || 1.0
      }));
    },

    addProductionItem: function (item) {
      const queue = this.getProductionQueue();
      const prodName = item.productName || item.productTitle || 'Pieza Textil Artesanal';
      const est = this.estimateFabricForItem({ title: prodName });
      const meters = parseFloat(item.metersRequired || item.metersUsed) || est.metersPerUnit || 1.0;
      const fabricText = item.fabric || est.fabricName;

      // Descontar automáticamente los metros del rollo de tela correspondiente
      let deductedInfo = '';
      if (item.deductStock !== false) {
        const mat = item.materialId
          ? this.getMaterials().find(m => m.id === item.materialId)
          : this.findMatchingMaterial(fabricText + ' ' + prodName);
        if (mat) {
          const updated = this.updateMaterialQty(mat.id, -meters, true);
          if (updated) {
            deductedInfo = `${meters} ${updated.unit} de ${updated.name} (quedan ${updated.qty} ${updated.unit})`;
          }
        }
      }

      const newItem = {
        id: 'prod-' + Date.now() + '-' + Math.floor(Math.random() * 100),
        orderId: item.orderId || 'Encargo Directo',
        productName: prodName,
        productTitle: prodName,
        clientName: item.clientName || 'Clienta',
        fabric: fabricText,
        metersRequired: meters,
        metersUsed: meters,
        deductedInfo: deductedInfo,
        phase: item.phase || 'corte',
        assignedDate: item.assignedDate || new Date().toLocaleDateString('es-AR'),
        targetDate: item.targetDate || 'A coordinar',
        priority: item.priority || 'normal',
        notes: item.notes || ''
      };
      queue.unshift(newItem);
      setJson(KEY_PRODUCTION, queue);
      return newItem;
    },

    advanceProductionPhase: function (itemId) {
      const phases = ['corte', 'costura', 'bordado', 'calidad', 'empaque', 'completado'];
      const queue = this.getProductionQueue();
      const item = queue.find(p => p.id === itemId);
      if (item) {
        const prev = item.phase;
        const currentIdx = phases.indexOf(item.phase);
        if (currentIdx >= 0 && currentIdx < phases.length - 1) {
          item.phase = phases[currentIdx + 1];
        } else if (currentIdx === phases.length - 1) {
          item.phase = 'completado';
        }
        setJson(KEY_PRODUCTION, queue);
        if (prev !== 'completado' && item.phase === 'completado') {
          this.onProductionCompleted(item);
        }
        return item;
      }
      return null;
    },

    updateProductionPhase: function (itemId, phase) {
      const queue = this.getProductionQueue();
      const item = queue.find(p => p.id === itemId);
      if (item) {
        const prev = item.phase;
        item.phase = phase;
        setJson(KEY_PRODUCTION, queue);
        if (prev !== 'completado' && phase === 'completado') {
          this.onProductionCompleted(item);
        }
        return item;
      }
      return null;
    },

    onProductionCompleted: function (item) {
      if (!item) return;
      // Si es reposición de stock del taller, sumar 1 unidad terminada al producto correspondiente
      if (/stock|taller|reposici/i.test(String(item.clientName || '') + ' ' + String(item.orderId || ''))) {
        const stock = this.getProductStock();
        const q = String(item.productName || item.productTitle || '').toLowerCase();
        const match = stock.find(s => q.includes(s.title.toLowerCase().slice(0, 10)) || s.title.toLowerCase().includes(q.slice(0, 10)));
        if (match) {
          this.updateProductStock(match.id, (match.inStock || 0) + 1);
        }
      }
      // Si pertenece a un pedido y todas sus piezas están completadas, marcar como "Listo para Entregar"
      if (item.orderId && item.orderId.startsWith('ORD-')) {
        const queue = this.getProductionQueue().filter(p => p.orderId === item.orderId);
        if (queue.length > 0 && queue.every(p => p.phase === 'completado')) {
          const ord = this.getOrders().find(o => o.id === item.orderId);
          if (ord && ord.status !== 'Entregado' && ord.status !== 'entregado') {
            this.updateOrder(item.orderId, { status: 'Listo para Entregar ✨' });
          }
        }
      }
    },

    deleteProductionItem: function (itemId) {
      let queue = this.getProductionQueue();
      queue = queue.filter(p => p.id !== itemId);
      setJson(KEY_PRODUCTION, queue);
      return queue;
    },

    // -----------------------------------------------------------------------
    // RESUMEN CONSOLIDADO DEL NEGOCIO & ECONOMÍA
    // -----------------------------------------------------------------------
    getBusinessSummary: function () {
      const analytics = this.getAnalytics();
      const orders = this.getOrders();
      const expenses = this.getExpenses();
      const stock = this.getProductStock();
      const materials = this.getMaterials();
      const production = this.getProductionQueue();

      let totalRevenue = 0;
      let completedOrders = 0;
      let inProgressOrders = 0;

      orders.forEach(o => {
        const amt = parseFloat(o.totalAmount) || 0;
        totalRevenue += amt;
        if (o.status === 'Entregado' || o.status === 'entregado') {
          completedOrders++;
        } else {
          inProgressOrders++;
        }
      });

      let totalExpenses = 0;
      expenses.forEach(e => {
        totalExpenses += (parseFloat(e.amount) || 0);
      });

      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
      const avgTicket = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
      const visits = analytics.totalVisits !== undefined ? analytics.totalVisits : 0;
      const conversionRate = visits > 0 ? ((orders.length / visits) * 100).toFixed(1) : '0.0';

      const lowProductStock = stock.filter(p => p.inStock <= (p.minAlert || 2));
      const lowMaterialStock = materials.filter(m => m.qty <= (m.minAlert || 5));
      const totalAlertsCount = lowProductStock.length + lowMaterialStock.length;

      const activeProduction = production.filter(p => p.phase !== 'completado');

      return {
        analytics,
        totalVisits: visits,
        visits: visits,
        uniqueVisitors: analytics.uniqueVisitors !== undefined ? analytics.uniqueVisitors : 0,
        todayVisits: analytics.todayVisits !== undefined ? analytics.todayVisits : 0,
        isRealAnalytics: !!analytics.isReal,
        conversionRate,
        sources: analytics.sources || { instagram: 64, whatsapp: 22, direct: 14 },
        totalRevenue,
        revenue: totalRevenue,
        totalExpenses,
        netProfit,
        profit: netProfit,
        profitMargin,
        netMargin: profitMargin,
        avgTicket,
        ordersCount: orders.length,
        totalOrders: orders.length,
        completedOrders,
        inProgressOrders,
        pendingOrders: inProgressOrders,
        productionCount: activeProduction.length,
        productionActive: activeProduction.length,
        productionTotal: production.length,
        productionQueue: production,
        lowProductStock,
        lowMaterialStock,
        totalAlertsCount,
        weeklyHistory: analytics.weeklyHistory || [],
        dailyHistory: analytics.dailyHistory || [],
        productViews: analytics.productViews || {}
      };
    },

    // -----------------------------------------------------------------------
    // RESPALDO INTEGRAL DEL TALLER (JSON BACKUP EXPORT & IMPORT)
    // -----------------------------------------------------------------------
    exportBackupJson: function () {
      const backupData = {
        meta: {
          app: 'Divina Locura Deco - Taller de Confección & Gestión Integral',
          version: '4.0.0',
          exportedAt: new Date().toISOString(),
          readableDate: new Date().toLocaleDateString('es-AR') + ' ' + new Date().toLocaleTimeString('es-AR')
        },
        products: this.getProducts(),
        settings: this.getSettings(),
        clients: this.getClients(),
        orders: this.getOrders(),
        chats: this.getChats(),
        stockProducts: this.getProductStock(),
        stockMaterials: this.getMaterials(),
        production: this.getProductionQueue(),
        analytics: this.getAnalytics(),
        expenses: this.getExpenses(),
        budget: this.getBudget()
      };

      return JSON.stringify(backupData, null, 2);
    },

    importBackupJson: function (jsonString) {
      try {
        const data = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
        if (!data || typeof data !== 'object') throw new Error('Formato JSON inválido');

        if (Array.isArray(data.products)) setJson(KEY_PRODUCTS, data.products);
        if (data.settings && typeof data.settings === 'object') setJson(KEY_SETTINGS, data.settings);
        if (Array.isArray(data.clients)) setJson(KEY_CLIENTS, data.clients);
        if (Array.isArray(data.orders)) setJson(KEY_ORDERS, data.orders);
        if (data.chats && typeof data.chats === 'object') setJson(KEY_CHATS, data.chats);
        if (Array.isArray(data.stockProducts)) setJson(KEY_STOCK_PRODUCTS, data.stockProducts);
        if (Array.isArray(data.stockMaterials)) setJson(KEY_STOCK_MATERIALS, data.stockMaterials);
        if (Array.isArray(data.production)) setJson(KEY_PRODUCTION, data.production);
        if (data.analytics && typeof data.analytics === 'object') setJson(KEY_ANALYTICS, data.analytics, true);
        if (Array.isArray(data.expenses)) setJson(KEY_EXPENSES, data.expenses);
        if (typeof data.budget === 'number') this.setBudget(data.budget);

        return { success: true, message: 'Respaldo restaurado con éxito' };
      } catch (err) {
        console.error('Error restaurando respaldo:', err);
        return { success: false, error: err.message };
      }
    },

    // -----------------------------------------------------------------------
    // GESTIÓN DE SEGURIDAD & CLAVES (GOOGLE SHEETS + FALLBACK LOCAL)
    // -----------------------------------------------------------------------
    getAdminPasswords: function () {
      try {
        const saved = localStorage.getItem(KEY_SECURITY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            return {
              elena: parsed.elena || 'elena',
              juanma: parsed.juanma || 'juanma'
            };
          }
        }
      } catch (e) {}
      return { elena: 'elena', juanma: 'juanma' };
    },

    updateAdminPassword: function (role, newPassword) {
      if (!role || !newPassword) {
        return { success: false, error: 'Por favor completá todos los campos.' };
      }
      const trimmed = newPassword.trim();
      if (trimmed.length < 3) {
        return { success: false, error: 'La nueva contraseña debe tener al menos 3 caracteres.' };
      }
      const passwords = this.getAdminPasswords();
      passwords[role] = trimmed;
      try {
        localStorage.setItem(KEY_SECURITY, JSON.stringify(passwords));
        return {
          success: true,
          message: `¡Contraseña de ${role === 'elena' ? 'Elena' : 'Juanma'} actualizada correctamente!`
        };
      } catch (e) {
        return { success: false, error: 'No se pudo guardar la contraseña en el navegador.' };
      }
    },

    updateAdminPasswordAsync: async function (role, currentPassword, newPassword) {
      if (getCloudUrl()) {
        const res = await callCloud('changePassword', { role: role, current: currentPassword, newPassword: newPassword });
        if (res && res.ok) {
          this.updateAdminPassword(role, newPassword);
          return { success: true, message: res.message || '¡Contraseña actualizada en Google!' };
        }
        if (res && !res.networkError) {
          return { success: false, error: res.error || 'No se pudo actualizar la clave.' };
        }
      }
      const check = this.verifyAdminPassword(role, currentPassword);
      if (!check.valid) {
        return { success: false, error: `La contraseña actual ingresada para ${role === 'elena' ? 'Elena' : 'Juanma'} no es correcta.` };
      }
      return this.updateAdminPassword(role, newPassword);
    },

    verifyAdminPassword: function (role, enteredPassword) {
      const passwords = this.getAdminPasswords();
      const entered = (enteredPassword || '').trim().toLowerCase();
      if (!entered) return { valid: false };

      if (role === 'elena') {
        const isOk = entered === passwords.elena.toLowerCase();
        return { valid: isOk, role: 'elena', name: 'Elena' };
      }

      if (role === 'juanma') {
        const isOk = entered === passwords.juanma.toLowerCase();
        return { valid: isOk, role: 'juanma', name: 'Juanma' };
      }

      if (entered === passwords.elena.toLowerCase()) {
        return { valid: true, role: 'elena', name: 'Elena' };
      }
      if (entered === passwords.juanma.toLowerCase()) {
        return { valid: true, role: 'juanma', name: 'Juanma' };
      }

      return { valid: false };
    },

    loginAdminAsync: async function (role, enteredPassword) {
      const entered = (enteredPassword || '').trim();
      if (!entered) return { valid: false, error: 'Ingresá tu contraseña.' };

      if (getCloudUrl()) {
        const res = await callCloud('login', { role: role, password: entered });
        if (res && res.ok && res.token) {
          try { localStorage.setItem(KEY_ADMIN_TOKEN, res.token); } catch (e) {}
          this.updateAdminPassword(res.role || role || 'elena', entered);
          return { valid: true, role: res.role || role || 'elena', cloud: true };
        }
        if (res && !res.networkError && !res.offline) {
          return { valid: false, error: res.error || 'Clave incorrecta.' };
        }
      }

      const local = this.verifyAdminPassword(role, entered);
      return { valid: local.valid, role: local.role, error: local.valid ? '' : 'Clave incorrecta.' };
    },

    logoutCloud: function () {
      if (getCloudUrl() && getAdminToken()) {
        callCloud('logout', {});
      }
      try { localStorage.removeItem(KEY_ADMIN_TOKEN); } catch (e) {}
    },

    // -----------------------------------------------------------------------
    // SINCRONIZACIÓN CON GOOGLE SHEETS & SUBIDA DE FOTOS A GOOGLE DRIVE
    // -----------------------------------------------------------------------
    getCloudConfig: function () {
      return {
        url: getCloudUrl(),
        connected: !!(getCloudUrl() && getAdminToken()),
        hasUrl: !!getCloudUrl(),
        hasToken: !!getAdminToken(),
        sheetUrl: cloudMeta.sheetUrl || '',
        mpEnabled: !!cloudMeta.mpEnabled,
        notifyEmail: cloudMeta.notifyEmail || '',
        lastSync: cloudMeta.lastSync,
        syncing: cloudMeta.syncing,
        lastError: cloudMeta.lastError
      };
    },

    setCloudUrl: function (url) {
      const clean = String(url || '').trim();
      try {
        localStorage.setItem(KEY_CLOUD_URL, clean);
        const st = getJson(KEY_SETTINGS, {});
        st.cloud_url = clean;
        localStorage.setItem(KEY_SETTINGS, JSON.stringify(st));
      } catch (e) {}
      return clean;
    },

    onSyncChange: function (cb) {
      if (typeof cb === 'function') syncListeners.push(cb);
    },

    // Trae catálogo y textos públicos para cualquier visitante de la tienda
    pullPublicFromCloud: async function () {
      const url = getCloudUrl();
      if (!url) return { ok: false, offline: true };
      try {
        const res = await fetch(url + (url.includes('?') ? '&' : '?') + 'action=publicData', { method: 'GET', redirect: 'follow' });
        const json = await res.json();
        if (json && json.ok) {
          suppressCloudSync = true;
          if (Array.isArray(json.products) && json.products.length > 0) {
            setJson(KEY_PRODUCTS, json.products, true);
          }
          if (json.settings && typeof json.settings === 'object' && Object.keys(json.settings).length > 0) {
            const merged = Object.assign({}, getJson(KEY_SETTINGS, {}), json.settings);
            setJson(KEY_SETTINGS, merged, true);
          }
          cloudMeta.mpEnabled = !!json.mpEnabled;
          suppressCloudSync = false;
          notifySyncListeners({ status: 'public-loaded', mpEnabled: cloudMeta.mpEnabled });
        }
        return json;
      } catch (err) {
        return { ok: false, error: String(err && err.message || err) };
      }
    },

    // Trae toda la base de datos de la planilla al abrir el Panel de Control
    pullAllFromCloud: async function (onlyCollections) {
      if (!getCloudUrl() || !getAdminToken()) return { ok: false, skipped: true };
      cloudMeta.syncing = true;
      notifySyncListeners({ status: 'pulling' });
      const res = await callCloud('pull', { collections: onlyCollections || null });
      cloudMeta.syncing = false;

      if (!res || !res.ok) {
        cloudMeta.lastError = (res && res.error) || 'No se pudo conectar con Google Sheets';
        notifySyncListeners({ status: 'error', error: cloudMeta.lastError });
        return res || { ok: false };
      }

      suppressCloudSync = true;
      try {
        const isEmptySheet = Array.isArray(res.orders) && res.orders.length === 0 &&
          Array.isArray(res.products) && res.products.length === 0 &&
          Array.isArray(res.stockMaterials) && res.stockMaterials.length === 0 && !onlyCollections;

        if (isEmptySheet) {
          // Primera vez que se conecta la planilla: subir los datos actuales del taller para poblarla sola
          await this.pushAllToCloud();
        } else {
          if (Array.isArray(res.orders)) { setJson(KEY_ORDERS, res.orders, true); setKnownIds('orders', res.orders); }
          if (Array.isArray(res.clients)) { setJson(KEY_CLIENTS, res.clients, true); setKnownIds('clients', res.clients); }
          if (res.chats && typeof res.chats === 'object') setJson(KEY_CHATS, res.chats, true);
          if (Array.isArray(res.stockProducts) && res.stockProducts.length) setJson(KEY_STOCK_PRODUCTS, res.stockProducts, true);
          if (Array.isArray(res.stockMaterials) && res.stockMaterials.length) setJson(KEY_STOCK_MATERIALS, res.stockMaterials, true);
          if (Array.isArray(res.expenses)) setJson(KEY_EXPENSES, res.expenses, true);
          if (Array.isArray(res.production)) setJson(KEY_PRODUCTION, res.production, true);
          if (Array.isArray(res.products) && res.products.length) setJson(KEY_PRODUCTS, res.products, true);
          if (res.settings && typeof res.settings === 'object' && Object.keys(res.settings).length) {
            const st = Object.assign({}, getJson(KEY_SETTINGS, {}), res.settings);
            setJson(KEY_SETTINGS, st, true);
          }
          if (typeof res.budget === 'number' && res.budget > 0) localStorage.setItem(KEY_BUDGET, res.budget);
          if (res.analytics && typeof res.analytics === 'object') setJson(KEY_ANALYTICS, res.analytics, true);
        }
        if (res.sheetUrl) cloudMeta.sheetUrl = res.sheetUrl;
        if (res.mpEnabled !== undefined) cloudMeta.mpEnabled = !!res.mpEnabled;
        if (res.notifyEmail) cloudMeta.notifyEmail = res.notifyEmail;
        cloudMeta.lastSync = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
        cloudMeta.lastError = '';
      } finally {
        suppressCloudSync = false;
      }

      notifySyncListeners({ status: 'pulled', lastSync: cloudMeta.lastSync, sheetUrl: cloudMeta.sheetUrl });
      return res;
    },

    // Sube todas las colecciones actuales a la planilla de Google
    pushAllToCloud: async function () {
      if (!getCloudUrl() || !getAdminToken()) return { ok: false, error: 'Iniciá sesión y conectá la URL de Google Sheets primero.' };
      const list = [
        ['products', this.getProducts()],
        ['orders', this.getOrders()],
        ['clients', this.getClients()],
        ['chats', this.getChats()],
        ['stockProducts', this.getProductStock()],
        ['stockMaterials', this.getMaterials()],
        ['expenses', this.getExpenses()],
        ['production', this.getProductionQueue()],
        ['settings', this.getSettings()],
        ['budget', this.getBudget()]
      ];
      for (let i = 0; i < list.length; i++) {
        const r = await pushCollectionToCloud(list[i][0], list[i][1]);
        if (!r || !r.ok) return r || { ok: false };
      }
      return { ok: true };
    },

    saveSecureCloudConfig: async function (opts) {
      const r = await callCloud('setSecureConfig', opts || {});
      if (r && r.ok) {
        cloudMeta.mpEnabled = !!r.mpEnabled;
        cloudMeta.notifyEmail = r.notifyEmail || cloudMeta.notifyEmail;
      }
      return r;
    },

    confirmMercadoPagoReturn: async function () {
      try {
        const params = new URLSearchParams(window.location.search);
        const payId = params.get('payment_id') || params.get('collection_id');
        if (!payId || !getCloudUrl()) return null;
        const r = await callCloud('confirmPayment', { paymentId: payId });
        if (window.history && window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
        return r;
      } catch (e) { return null; }
    },

    // Comprime cualquier foto en el navegador (máx 1200px, JPEG 82%) y si Google Drive está conectado la sube ahí
    processAndUploadImage: function (file, maxWidth = 1200, quality = 0.82) {
      return new Promise((resolve, reject) => {
        if (!file) return reject(new Error('No se seleccionó ningún archivo'));
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
        reader.onload = (evt) => {
          const img = new Image();
          img.onerror = () => resolve({ url: evt.target.result, uploaded: false });
          img.onload = async () => {
            let w = img.width;
            let h = img.height;
            if (w > maxWidth) {
              h = Math.round((h * maxWidth) / w);
              w = maxWidth;
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            const dataUrl = canvas.toDataURL('image/jpeg', quality);

            if (getCloudUrl() && getAdminToken()) {
              const up = await callCloud('uploadImage', {
                name: (file.name || 'pieza').replace(/\.[^.]+$/, ''),
                dataUrl: dataUrl
              });
              if (up && up.ok && up.url) {
                return resolve({ url: up.url, uploaded: true, fileId: up.fileId });
              }
            }
            resolve({ url: dataUrl, uploaded: false });
          };
          img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
      });
    },

    escapeHtml: escapeHtml
  };

  window.WorkshopDB = WorkshopDB;
})();
