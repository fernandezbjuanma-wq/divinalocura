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
    // GASTOS & BALANCE DE PRODUCCIÓN
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

    getFinancialSummary: function () {
      const orders = this.getOrders();
      const expenses = this.getExpenses();

      // Sumar ingresos de pedidos no cancelados
      const totalIncome = orders.reduce((sum, ord) => {
        if (ord.totalAmount) return sum + ord.totalAmount;
        // Parse de items si no tiene totalAmount
        const itemsTotal = (ord.items || []).reduce((sub, item) => {
          const rawNum = String(item.price || '').replace(/[^0-9]/g, '');
          const priceNum = rawNum ? parseFloat(rawNum) : 0;
          return sub + (priceNum * (item.qty || 1));
        }, 0);
        return sum + itemsTotal;
      }, 0);

      // Sumar gastos
      const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

      const netProfit = totalIncome - totalExpenses;
      const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

      return {
        totalIncome,
        totalExpenses,
        netProfit,
        profitMargin,
        totalOrdersCount: orders.length,
        totalExpensesCount: expenses.length
      };
    }
  };

  window.WorkshopDB = WorkshopDB;
})();
