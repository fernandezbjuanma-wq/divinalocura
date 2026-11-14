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
    { id: 'mat-1', name: 'Satén de Seda Premium (Champán & Perla)', category: 'Telas', qty: 16, unit: 'metros', minAlert: 5 },
    { id: 'mat-2', name: 'Lino Rústico Puro Lavado (Crudo)', category: 'Telas', qty: 9, unit: 'metros', minAlert: 4 },
    { id: 'mat-3', name: 'Nido de Abeja (Waffle) Algodón 100%', category: 'Telas', qty: 14, unit: 'metros', minAlert: 5 },
    { id: 'mat-4', name: 'Puntilla de Algodón Vintage', category: 'Mercería', qty: 22, unit: 'metros', minAlert: 6 },
    { id: 'mat-5', name: 'Cierres Invisibles 20cm y 30cm', category: 'Mercería', qty: 28, unit: 'unidades', minAlert: 8 },
    { id: 'mat-6', name: 'Elásticos Suaves Especiales para Cofias', category: 'Mercería', qty: 35, unit: 'metros', minAlert: 10 },
    { id: 'mat-7', name: 'Bolsitas de Lino para Empaque de Regalo', category: 'Packaging', qty: 18, unit: 'unidades', minAlert: 5 }
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
  // HELPER PARA LOCALSTORAGE CON FALLBACK SEGURO
  // =========================================================================
  function getJson(key, defaultVal) {
    try {
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error leyendo', key, e);
    }
    return defaultVal;
  }

  function setJson(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn('Error guardando', key, e);
    }
  }

  function cleanPhoneKey(phone) {
    if (!phone) return 'anon';
    return phone.replace(/[^0-9]/g, '');
  }

  // =========================================================================
  // INICIALIZACIÓN DE BASES DE DATOS SI ESTÁN VACÍAS
  // =========================================================================
  function initDatabase() {
    // 1. Clientas
    if (!localStorage.getItem(KEY_CLIENTS)) {
      setJson(KEY_CLIENTS, SEED_CLIENTS);
    }

    // 2. Pedidos
    const existingOrders = getJson(KEY_ORDERS, null);
    if (!existingOrders || existingOrders.length === 0) {
      setJson(KEY_ORDERS, SEED_ORDERS);
    }

    // 3. Chats
    if (!localStorage.getItem(KEY_CHATS)) {
      setJson(KEY_CHATS, SEED_CHATS);
    }

    // 4. Stock Productos
    if (!localStorage.getItem(KEY_STOCK_PRODUCTS)) {
      setJson(KEY_STOCK_PRODUCTS, SEED_STOCK_PRODUCTS);
    }

    // 5. Stock Telas / Insumos
    if (!localStorage.getItem(KEY_STOCK_MATERIALS)) {
      setJson(KEY_STOCK_MATERIALS, SEED_STOCK_MATERIALS);
    }

    // 6. Gastos
    if (!localStorage.getItem(KEY_EXPENSES)) {
      setJson(KEY_EXPENSES, SEED_EXPENSES);
    }

    // 7. Analíticas & Tráfico
    if (!localStorage.getItem(KEY_ANALYTICS)) {
      setJson(KEY_ANALYTICS, SEED_ANALYTICS);
    }

    // 8. Cola de Producción Textil
    if (!localStorage.getItem(KEY_PRODUCTION)) {
      setJson(KEY_PRODUCTION, SEED_PRODUCTION);
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
      return clientRecord;
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
        orders[idx] = { ...orders[idx], ...updates };
        setJson(KEY_ORDERS, orders);
        return orders[idx];
      }
      return null;
    },

    deleteOrder: function (orderId) {
      let orders = this.getOrders();
      orders = orders.filter(o => o.id !== orderId);
      setJson(KEY_ORDERS, orders);
      return orders;
    },

    addOrder: function (newOrder) {
      const orders = this.getOrders();
      orders.unshift(newOrder);
      setJson(KEY_ORDERS, orders);

      // Actualizar contador de pedidos de la clienta
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

    // -----------------------------------------------------------------------
    // CHAT DIRECTO ENTRE CLIENTA Y ELENA
    // -----------------------------------------------------------------------
    getChats: function () {
      return getJson(KEY_CHATS, SEED_CHATS);
    },

    getMessagesForPhone: function (phone) {
      const chats = this.getChats();
      const key = cleanPhoneKey(phone);
      return chats[key] || [];
    },

    sendMessage: function (phone, text, sender, senderName) {
      const chats = this.getChats();
      const key = cleanPhoneKey(phone);
      if (!chats[key]) chats[key] = [];

      const newMsg = {
        id: 'msg-' + Date.now(),
        sender: sender || 'client', // 'client' | 'elena'
        senderName: senderName || (sender === 'elena' ? 'Elena (Taller)' : 'Clienta'),
        text: text.trim(),
        timestamp: new Date().toLocaleDateString('es-AR') + ' ' + new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
      };

      chats[key].push(newMsg);
      setJson(KEY_CHATS, chats);
      return newMsg;
    },

    // -----------------------------------------------------------------------
    // CONTROL DE STOCK (PIEZAS TERMINADAS)
    // -----------------------------------------------------------------------
    getProductStock: function () {
      return getJson(KEY_STOCK_PRODUCTS, SEED_STOCK_PRODUCTS);
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
    // CONTROL DE TELAS & INSUMOS DE PRODUCCIÓN
    // -----------------------------------------------------------------------
    getMaterials: function () {
      return getJson(KEY_STOCK_MATERIALS, SEED_STOCK_MATERIALS);
    },

    updateMaterialQty: function (materialId, deltaOrQty, isDelta = false) {
      const mats = this.getMaterials();
      const idx = mats.findIndex(m => m.id === materialId);
      if (idx >= 0) {
        if (isDelta) {
          mats[idx].qty = Math.max(0, (mats[idx].qty || 0) + deltaOrQty);
        } else {
          mats[idx].qty = Math.max(0, deltaOrQty);
        }
        setJson(KEY_STOCK_MATERIALS, mats);
        return mats[idx];
      }
      return null;
    },

    addMaterial: function (materialData) {
      const mats = this.getMaterials();
      const newMat = {
        id: 'mat-' + Date.now(),
        name: materialData.name,
        category: materialData.category || 'Telas',
        qty: parseFloat(materialData.qty) || 0,
        unit: materialData.unit || 'metros',
        minAlert: parseFloat(materialData.minAlert) || 2
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
      return stored ? parseFloat(stored) : 120000; // $120.000 ARS por defecto
    },

    setBudget: function (amount) {
      const num = Math.max(0, parseFloat(amount) || 0);
      localStorage.setItem(KEY_BUDGET, num);
      return num;
    },

    // Helper para normalizar fechas en formato 'YYYY-MM'
    normalizeYearMonth: function (dateStr) {
      if (!dateStr) return '';
      // Si viene como DD/MM/YYYY
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          const y = parts[2].trim().padStart(4, '20');
          const m = parts[1].trim().padStart(2, '0');
          return `${y}-${m}`;
        }
      }
      // Si viene como YYYY-MM-DD
      if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length >= 2) {
          const y = parts[0].trim();
          const m = parts[1].trim().padStart(2, '0');
          return `${y}-${m}`;
        }
      }
      return '';
    },

    // Obtener lista de meses disponibles para el selector 'sel-mes'
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

      // Asegurar que el mes actual siempre esté disponible
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
    // GASTOS & BALANCE DE PRODUCCIÓN (TALLER DIVINA LOCURA)
    // -----------------------------------------------------------------------
    getExpenses: function () {
      return getJson(KEY_EXPENSES, SEED_EXPENSES);
    },

    addExpense: function (expenseData) {
      const expenses = this.getExpenses();
      const newExp = {
        id: 'exp-' + Date.now(),
        date: expenseData.date || new Date().toISOString().split('T')[0],
        concept: expenseData.concept || 'Gasto de taller',
        category: expenseData.category || 'Telas',
        amount: parseFloat(expenseData.amount) || 0
      };
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

    // Resumen financiero filtrado por mes (o 'all' para histórico)
    getFinancialSummary: function (selectedMonth = 'all') {
      const allOrders = this.getOrders();
      const allExpenses = this.getExpenses();

      // Filtrar por período seleccionado
      const filteredOrders = allOrders.filter(ord => {
        if (!selectedMonth || selectedMonth === 'all') return true;
        return this.normalizeYearMonth(ord.date) === selectedMonth;
      });

      const filteredExpenses = allExpenses.filter(exp => {
        if (!selectedMonth || selectedMonth === 'all') return true;
        return this.normalizeYearMonth(exp.date) === selectedMonth;
      });

      // Sumar ingresos de pedidos no cancelados
      const totalIncome = filteredOrders.reduce((sum, ord) => {
        if (ord.totalAmount) return sum + ord.totalAmount;
        const itemsTotal = (ord.items || []).reduce((sub, item) => {
          const rawNum = String(item.price || '').replace(/[^0-9]/g, '');
          const priceNum = rawNum ? parseFloat(rawNum) : 0;
          return sub + (priceNum * (item.qty || 1));
        }, 0);
        return sum + itemsTotal;
      }, 0);

      // Sumar gastos
      const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

      const netProfit = totalIncome - totalExpenses;
      const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

      // Desglose por categoría para el componente de "Reparto del Mes"
      const categoryTotals = {};
      Object.keys(CATEGORY_COLORS).forEach(cat => {
        categoryTotals[cat] = 0;
      });

      filteredExpenses.forEach(exp => {
        const cat = exp.category || 'Varios';
        if (!categoryTotals[cat]) categoryTotals[cat] = 0;
        categoryTotals[cat] += (exp.amount || 0);
      });

      // Calcular porcentajes de reparto
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

      // Límites de consumo y presupuesto mensual
      const budgetLimit = this.getBudget();
      const budgetPercent = budgetLimit > 0 ? Math.min(100, Math.round((totalExpenses / budgetLimit) * 100)) : 0;
      let budgetStatus = 'ok';
      let budgetBadgeText = 'Dentro del límite presupuestario';

      if (totalExpenses > budgetLimit) {
        budgetStatus = 'danger';
        budgetBadgeText = '🚨 Límite de consumo superado';
      } else if (totalExpenses >= budgetLimit * 0.8) {
        budgetStatus = 'warning';
        budgetBadgeText = '⚠️ Advertencia (Cerca del tope)';
      } else {
        budgetStatus = 'ok';
        budgetBadgeText = '🌿 Consumo controlado & saludable';
      }

      // Valor del inventario de materiales en taller (metros * costo promedio estimado $3.500)
      const materials = this.getMaterials();
      const fabricStockValue = materials.reduce((sum, m) => sum + ((m.qty || 0) * 3500), 0);

      // Flujo de cobros: Cobrado 100% vs Señas 50% vs Saldo a cobrar
      let paidTotal = 0;
      let depositTotal = 0;
      let pendingBalance = 0;
      let paidOrdersCount = 0;
      let pendingOrdersCount = 0;

      filteredOrders.forEach(ord => {
        const amt = ord.totalAmount || 0;
        if (ord.status === 'Entregado') {
          paidTotal += amt;
          paidOrdersCount++;
        } else {
          // Pedido en confección: seña del 50% cobrada, saldo del 50% a cobrar contra entrega
          const deposit = Math.round(amt * 0.5);
          depositTotal += deposit;
          pendingBalance += (amt - deposit);
          pendingOrdersCount++;
        }
      });

      const avgTicket = filteredOrders.length > 0 ? Math.round(totalIncome / filteredOrders.length) : 0;

      // Rentabilidad por producto estrella de Elena
      const starProductsProfit = [
        { name: 'Almohadón Tusor & Lino con Vivos', category: 'Almohadones', cost: 4200, price: 14500, margin: 71, badge: '⭐ Alta Demanda' },
        { name: 'Bata Kimono Satén Seda Champán', category: 'Batas & Relax', cost: 8500, price: 28000, margin: 70, badge: '⭐ Producto Estrella' },
        { name: 'Juego de Cama Waffle Honeycomb', category: 'Dormitorio', cost: 11000, price: 36000, margin: 69, badge: '⭐ Mayor Facturación' },
        { name: 'Mantel Puro Lino Crudo Deshilachado', category: 'Mesa', cost: 7200, price: 24000, margin: 70, badge: '🌿 Clásico Noble' },
        { name: 'Nécessaire Impermeable con Cierre', category: 'Accesorios', cost: 2800, price: 9500, margin: 71, badge: '🌿 Rotación Rápida' }
      ];

      // Consumo estimado de insumos y telas en el período
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

    // Consumo de telas e insumos basado en pedidos confeccionados
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
          const id = item.id || '';
          if (id === 'p1' || id === 'p5') {
            satinMeters += (2.2 * qty);
          } else if (id === 'p2') {
            waffleMeters += (0.9 * qty);
          } else if (id === 'p3' || id === 'p4' || id === 'p6' || id === 'p8') {
            linenMeters += (1.4 * qty);
          } else {
            linenMeters += (1.0 * qty);
          }
        });
      });

      return {
        totalMeters: Math.round(satinMeters + linenMeters + waffleMeters),
        piecesFinished,
        satinMeters: Math.round(satinMeters),
        linenMeters: Math.round(linenMeters),
        waffleMeters: Math.round(waffleMeters)
      };
    },

    // -----------------------------------------------------------------------
    // ANALÍTICAS DE TRÁFICO & VISITAS DEL NEGOCIO
    // -----------------------------------------------------------------------
    getAnalytics: function () {
      return getJson(KEY_ANALYTICS, SEED_ANALYTICS);
    },

    trackVisit: function () {
      const data = this.getAnalytics();
      data.totalVisits = (data.totalVisits || 0) + 1;
      data.todayVisits = (data.todayVisits || 0) + 1;
      try {
        if (!sessionStorage.getItem('divinalocura_visited_session')) {
          data.uniqueVisitors = (data.uniqueVisitors || 0) + 1;
          sessionStorage.setItem('divinalocura_visited_session', 'true');
        }
      } catch (e) {
        // Fallback silencioso si sessionStorage está restringido
      }
      setJson(KEY_ANALYTICS, data);
      return data;
    },

    trackProductView: function (productId) {
      if (!productId) return;
      const data = this.getAnalytics();
      if (!data.productViews) data.productViews = {};
      data.productViews[productId] = (data.productViews[productId] || 0) + 1;
      setJson(KEY_ANALYTICS, data);
      return data;
    },

    // -----------------------------------------------------------------------
    // CONTROL DE PRODUCCIÓN & TALLER TEXTIL (COLA DE CONFECCIÓN)
    // -----------------------------------------------------------------------
    getProductionQueue: function () {
      return getJson(KEY_PRODUCTION, SEED_PRODUCTION);
    },

    addProductionItem: function (item) {
      const queue = this.getProductionQueue();
      const newItem = {
        id: 'prod-' + Date.now(),
        orderId: item.orderId || 'Encargo Directo',
        productName: item.productName || 'Pieza Textil Artesanal',
        clientName: item.clientName || 'Clienta',
        fabric: item.fabric || 'Satén / Lino',
        metersRequired: parseFloat(item.metersRequired) || 1.0,
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
        const currentIdx = phases.indexOf(item.phase);
        if (currentIdx >= 0 && currentIdx < phases.length - 1) {
          item.phase = phases[currentIdx + 1];
        } else if (currentIdx === phases.length - 1) {
          item.phase = 'completado';
        }
        setJson(KEY_PRODUCTION, queue);
        return item;
      }
      return null;
    },

    updateProductionPhase: function (itemId, phase) {
      const queue = this.getProductionQueue();
      const item = queue.find(p => p.id === itemId);
      if (item) {
        item.phase = phase;
        setJson(KEY_PRODUCTION, queue);
        return item;
      }
      return null;
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
        if (o.status === 'Entregado') {
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
      const conversionRate = analytics.totalVisits > 0 ? ((orders.length / analytics.totalVisits) * 100).toFixed(1) : '0.0';

      const lowProductStock = stock.filter(p => p.inStock <= (p.minAlert || 2));
      const lowMaterialStock = materials.filter(m => m.qty <= (m.minAlert || 5));
      const totalAlertsCount = lowProductStock.length + lowMaterialStock.length;

      const activeProduction = production.filter(p => p.phase !== 'completado');

      return {
        analytics,
        totalVisits: analytics.totalVisits || 1420,
        uniqueVisitors: analytics.uniqueVisitors || 985,
        todayVisits: analytics.todayVisits || 64,
        conversionRate,
        sources: analytics.sources || { instagram: 64, whatsapp: 22, direct: 14 },
        totalRevenue,
        totalExpenses,
        netProfit,
        profitMargin,
        avgTicket,
        ordersCount: orders.length,
        completedOrders,
        inProgressOrders,
        productionCount: activeProduction.length,
        productionTotal: production.length,
        productionQueue: production,
        lowProductStock,
        lowMaterialStock,
        totalAlertsCount,
        weeklyHistory: analytics.weeklyHistory || [],
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
          version: '3.0.0',
          exportedAt: new Date().toISOString(),
          readableDate: new Date().toLocaleDateString('es-AR') + ' ' + new Date().toLocaleTimeString('es-AR')
        },
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

        if (Array.isArray(data.clients)) setJson(KEY_CLIENTS, data.clients);
        if (Array.isArray(data.orders)) setJson(KEY_ORDERS, data.orders);
        if (data.chats && typeof data.chats === 'object') setJson(KEY_CHATS, data.chats);
        if (Array.isArray(data.stockProducts)) setJson(KEY_STOCK_PRODUCTS, data.stockProducts);
        if (Array.isArray(data.stockMaterials)) setJson(KEY_STOCK_MATERIALS, data.stockMaterials);
        if (Array.isArray(data.production)) setJson(KEY_PRODUCTION, data.production);
        if (data.analytics && typeof data.analytics === 'object') setJson(KEY_ANALYTICS, data.analytics);
        if (Array.isArray(data.expenses)) setJson(KEY_EXPENSES, data.expenses);
        if (typeof data.budget === 'number') localStorage.setItem(KEY_BUDGET, data.budget);

        return { success: true, message: 'Respaldo restaurado con éxito' };
      } catch (err) {
        console.error('Error restaurando respaldo:', err);
        return { success: false, error: err.message };
      }
    }
  };

  window.WorkshopDB = WorkshopDB;
})();
