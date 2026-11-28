/**
 * Divina Locura Deco — Motor de Paginación A4, Renderizado Editorial Canvas2D
 * y Generador Nativo de PDF Multi-Página (ISO-32000) + Enlace Compartible.
 * Cero dependencias externas: funciona 100% offline, en celulares y escritorio.
 */

(function () {
  'use strict';

  const A4_W = 794;
  const A4_H = 1123;
  const PDF_PT_W = 595.28;
  const PDF_PT_H = 841.89;
  const RENDER_SCALE = 2.15; // ~205 DPI reales en A4 (1707 x 2414 px), texto e imágenes ultra nítidos

  const THEMES = {
    terracota: {
      accent: '#A45A44',
      accentDark: '#884633',
      accentSoft: '#FAF2ED',
      headerFill: '#F5EFE7',
      border: '#CFC2B4',
      borderSoft: '#E3DAD0'
    },
    carbon: {
      accent: '#2B2625',
      accentDark: '#1B1716',
      accentSoft: '#F4F1EC',
      headerFill: '#F2EEE8',
      border: '#CCC2B7',
      borderSoft: '#E2DBD2'
    },
    salvia: {
      accent: '#557361',
      accentDark: '#3F5949',
      accentSoft: '#F1F6F3',
      headerFill: '#EEF3F0',
      border: '#C6D1CA',
      borderSoft: '#DCE5DF'
    }
  };

  function formatMoneyArs(value, withCents = true) {
    const num = Number(value) || 0;
    const hasFraction = Math.abs(num - Math.round(num)) > 0.001;
    const useDecimals = withCents || hasFraction;
    return '$ ' + num.toLocaleString('es-AR', {
      minimumFractionDigits: useDecimals ? 2 : 0,
      maximumFractionDigits: useDecimals ? 2 : 0
    });
  }

  function computeQuoteTotals(quote) {
    const items = Array.isArray(quote && quote.items) ? quote.items : [];
    const primaryItems = items.filter(it => !it.isAlternative);
    const calcItems = primaryItems.length > 0 ? primaryItems : items;

    let subtotal = 0;
    let totalCost = 0;
    calcItems.forEach(it => {
      const qty = Math.max(0, parseFloat(it.qty) || 0);
      const unit = Math.max(0, parseFloat(it.unitPrice) || 0);
      const cost = Math.max(0, parseFloat(it.unitCost) || 0);
      subtotal += qty * unit;
      totalCost += qty * cost;
    });

    const discPct = Math.max(0, Math.min(100, parseFloat(quote && quote.discountPercent) || 0));
    const discFix = Math.max(0, parseFloat(quote && quote.discountFixed) || 0);
    const discountAmount = Math.min(subtotal, Math.round((subtotal * (discPct / 100) + discFix) * 100) / 100);
    const shippingCost = Math.max(0, parseFloat(quote && quote.shippingCost) || 0);
    const totalAmount = Math.max(0, Math.round((subtotal - discountAmount + shippingCost) * 100) / 100);
    const depositAmount = Math.round(totalAmount * 0.5 * 100) / 100;
    const pendingBalance = Math.max(0, Math.round((totalAmount - depositAmount) * 100) / 100);
    const estimatedProfit = totalAmount - totalCost;
    const profitMargin = totalAmount > 0 ? Math.round((estimatedProfit / totalAmount) * 100) : 0;

    return {
      subtotal,
      discountAmount,
      shippingCost,
      totalAmount,
      depositAmount,
      pendingBalance,
      totalCost,
      estimatedProfit,
      profitMargin,
      hasAlternatives: items.some(it => !!it.isAlternative)
    };
  }

  function estimateItemHeight(item) {
    const desc = String((item && item.desc) || '');
    const title = String((item && item.title) || '');
    const explicitLines = desc.split('\n').reduce((acc, line) => acc + Math.max(1, Math.ceil(line.length / 54)), 0);
    const titleLines = Math.max(1, Math.ceil(title.length / 26)) + (item && item.variant ? 2 : 0) + (item && item.isAlternative ? 1 : 0);
    const rightHeight = 42 + explicitLines * 15.5 + 22;
    const leftHeight = Math.max(126, titleLines * 16 + 32);
    return Math.max(148, rightHeight, leftHeight);
  }

  function hasClosingSummary(quote) {
    if (!quote) return false;
    if (quote.showTotals !== false) return true;
    return !!(
      (quote.deliveryTime && String(quote.deliveryTime).trim()) ||
      (quote.paymentTerms && String(quote.paymentTerms).trim()) ||
      (quote.footerNotes && String(quote.footerNotes).trim())
    );
  }

  /**
   * Divide los ítems en páginas A4 exactas sin cortar ninguna fila por la mitad.
   */
  function paginateQuote(quote) {
    const items = Array.isArray(quote && quote.items) ? quote.items : [];
    const needsSummary = hasClosingSummary(quote);
    const summaryHeight = needsSummary ? 188 : 0;

    const FIRST_PAGE_BUDGET = 770; // Cabecera + Cliente/Saludo + Encabezado tabla + Pie
    const NEXT_PAGE_BUDGET = 868;  // Cabecera + Encabezado tabla + Pie

    if (items.length === 0) {
      return [{
        pageNumber: 1,
        totalPages: 1,
        isFirst: true,
        items: [],
        showTableHead: true,
        showSummary: needsSummary
      }];
    }

    const pages = [];
    let currentItems = [];
    let usedH = 0;
    let isFirst = true;

    items.forEach((it) => {
      const h = estimateItemHeight(it);
      const budget = isFirst ? FIRST_PAGE_BUDGET : NEXT_PAGE_BUDGET;
      if (currentItems.length > 0 && usedH + h > budget) {
        pages.push({
          isFirst: isFirst,
          items: currentItems,
          usedH: usedH,
          showTableHead: true,
          showSummary: false
        });
        currentItems = [it];
        usedH = h;
        isFirst = false;
      } else {
        currentItems.push(it);
        usedH += h;
      }
    });

    if (currentItems.length > 0) {
      const lastBudget = isFirst ? FIRST_PAGE_BUDGET : NEXT_PAGE_BUDGET;
      if (needsSummary && usedH + summaryHeight > lastBudget) {
        pages.push({
          isFirst: isFirst,
          items: currentItems,
          usedH: usedH,
          showTableHead: true,
          showSummary: false
        });
        pages.push({
          isFirst: false,
          items: [],
          usedH: summaryHeight,
          showTableHead: false,
          showSummary: true
        });
      } else {
        pages.push({
          isFirst: isFirst,
          items: currentItems,
          usedH: usedH + summaryHeight,
          showTableHead: true,
          showSummary: needsSummary
        });
      }
    }

    const totalPages = pages.length;
    return pages.map((p, idx) => Object.assign({}, p, {
      pageNumber: idx + 1,
      totalPages: totalPages
    }));
  }

  // ---------------------------------------------------------------------------
  // UTILIDADES DE DIBUJO EN CANVAS 2D (ALTA DEFINICIÓN)
  // ---------------------------------------------------------------------------
  function loadImageSafe(src) {
    return new Promise((resolve) => {
      if (!src) return resolve(null);
      const img = new Image();
      if (/^https?:\/\//i.test(src)) {
        img.crossOrigin = 'anonymous';
      }
      let settled = false;
      const done = (val) => {
        if (!settled) {
          settled = true;
          resolve(val);
        }
      };
      const timer = setTimeout(() => done(null), 4500);
      img.onload = () => {
        clearTimeout(timer);
        done(img);
      };
      img.onerror = () => {
        clearTimeout(timer);
        done(null);
      };
      img.src = src;
    });
  }

  function wrapLines(ctx, text, maxWidth) {
    const paragraphs = String(text || '').split('\n');
    const lines = [];
    paragraphs.forEach((para) => {
      const trimmed = para.trim();
      if (!trimmed) {
        lines.push('');
        return;
      }
      const words = trimmed.split(/\s+/);
      let line = '';
      words.forEach((word) => {
        const test = line ? (line + ' ' + word) : word;
        if (ctx.measureText(test).width > maxWidth && line) {
          lines.push(line);
          line = word;
        } else {
          line = test;
        }
      });
      if (line) lines.push(line);
    });
    return lines;
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    const rad = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.lineTo(x + w - rad, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
    ctx.lineTo(x + w, y + h - rad);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    ctx.lineTo(x + rad, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
    ctx.lineTo(x, y + rad);
    ctx.quadraticCurveTo(x, y, x + rad, y);
    ctx.closePath();
  }

  function drawCoverImage(ctx, img, x, y, w, h) {
    const iw = img.naturalWidth || img.width || 1;
    const ih = img.naturalHeight || img.height || 1;
    const scale = Math.max(w / iw, h / ih);
    const sw = w / scale;
    const sh = h / scale;
    const sx = Math.max(0, (iw - sw) / 2);
    const sy = Math.max(0, (ih - sh) * 0.28);
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  function buildBrandContactLines(settings) {
    const st = settings || {};
    const rawWa = String(st.whatsapp_phone || '5491136932471').replace(/[^0-9]/g, '');
    let prettyWa = '+54 9 11 3693-2471';
    if (rawWa && rawWa !== '5491100000000' && rawWa !== '5491136932471') {
      prettyWa = '+' + rawWa;
    }
    const ig = String(st.instagram_user || 'divina.locura.deco').replace(/^@/, '');
    const alias = st.mp_alias || 'DIVINA.LOCURA.DECO';
    return {
      line1: 'Divina Locura Deco · Taller Textil & Blanquería de Autor · Confección artesanal por Elena',
      line2: `WhatsApp: ${prettyWa}  ·  Instagram: @${ig}  ·  Alias: ${alias}`
    };
  }

  async function renderQuotePagesToCanvases(quote, settings) {
    if (document.fonts && document.fonts.ready) {
      try { await document.fonts.ready; } catch (e) {}
    }

    const pages = paginateQuote(quote);
    const totals = computeQuoteTotals(quote);
    const theme = THEMES[quote && quote.theme] || THEMES.terracota;
    const contact = buildBrandContactLines(settings);

    // Precargar imágenes únicas
    const imgMap = new Map();
    const uniqueSrcs = Array.from(new Set(
      (quote.items || []).map(it => it && it.image).filter(Boolean)
    ));
    await Promise.all(uniqueSrcs.map(async (src) => {
      const loaded = await loadImageSafe(src);
      if (loaded) imgMap.set(src, loaded);
    }));

    const canvases = [];
    const PAD_X = 44;
    const CONTENT_W = A4_W - PAD_X * 2; // 706

    for (let pIdx = 0; pIdx < pages.length; pIdx++) {
      const page = pages[pIdx];
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(A4_W * RENDER_SCALE);
      canvas.height = Math.round(A4_H * RENDER_SCALE);
      const ctx = canvas.getContext('2d');
      ctx.scale(RENDER_SCALE, RENDER_SCALE);

      // Fondo blanco puro papel A4
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, A4_W, A4_H);

      // Filete superior de marca
      ctx.fillStyle = theme.accent;
      ctx.fillRect(0, 0, A4_W, 5);

      let curY = 40;

      // 1. CABECERA DE PÁGINA
      // Monograma circular DL
      const monoX = PAD_X;
      const monoY = curY + 2;
      ctx.save();
      ctx.beginPath();
      ctx.arc(monoX + 25, monoY + 25, 25, 0, Math.PI * 2);
      ctx.fillStyle = theme.accentSoft;
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = theme.accent;
      ctx.stroke();
      ctx.fillStyle = theme.accent;
      ctx.font = '600 18px "Playfair Display", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('DL', monoX + 25, monoY + 26);
      ctx.restore();

      // Nombre de marca
      ctx.fillStyle = '#2B2625';
      ctx.font = '600 23px "Playfair Display", Georgia, serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('DIVINA LOCURA DECO', monoX + 64, curY + 5);

      ctx.fillStyle = '#8C7A6B';
      ctx.font = '600 9.5px "Montserrat", sans-serif';
      ctx.fillText('TALLER TEXTIL & BLANQUERÍA DE AUTOR · POR ELENA', monoX + 64, curY + 35);

      // Caja derecha PRESUPUESTO
      const badgeW = 246;
      const badgeH = 38;
      const badgeX = A4_W - PAD_X - badgeW;
      roundRectPath(ctx, badgeX, curY, badgeW, badgeH, 3);
      ctx.fillStyle = theme.accent;
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '600 13px "Montserrat", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('P R E S U P U E S T O', badgeX + badgeW / 2, curY + badgeH / 2 + 0.5);

      // N° Cotización y Fecha debajo de la caja
      const qNum = String(quote.number || '000101');
      const qDate = String(quote.date || new Date().toLocaleDateString('es-AR'));
      ctx.fillStyle = '#2B2625';
      ctx.font = '700 10.5px "Montserrat", sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText(`Cotización N°: ${qNum}  ·  ${qDate}`, A4_W - PAD_X, curY + badgeH + 8);

      let headerBottomY = curY + badgeH + 24;
      if (quote.validity && String(quote.validity).trim()) {
        ctx.fillStyle = '#7A7067';
        ctx.font = '500 9px "Montserrat", sans-serif';
        ctx.fillText(`Validez de la oferta: ${quote.validity}`, A4_W - PAD_X, curY + badgeH + 22);
        headerBottomY = curY + badgeH + 36;
      }

      // Línea divisoria cabecera
      ctx.beginPath();
      ctx.moveTo(PAD_X, headerBottomY);
      ctx.lineTo(A4_W - PAD_X, headerBottomY);
      ctx.strokeStyle = '#D5C8B9';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      curY = headerBottomY + 14;

      // 2. BLOQUE CLIENTA & SALUDO (Página 1)
      if (page.isFirst) {
        const cli = quote.client || {};
        const companyLine = String(cli.company || cli.attention || 'CLIENTE ESPECIAL').toUpperCase();
        ctx.fillStyle = '#2B2625';
        ctx.font = '700 12px "Montserrat", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(companyLine, PAD_X, curY);
        curY += 17;

        if (cli.attention || cli.phone || cli.location) {
          ctx.font = '700 10.8px "Montserrat", sans-serif';
          ctx.fillStyle = '#2B2625';
          const atteLabel = cli.attention ? `Atte.:  ${cli.attention}` : '';
          if (atteLabel) ctx.fillText(atteLabel, PAD_X, curY);

          const metaBits = [cli.phone ? `Tel: ${cli.phone}` : '', cli.location || ''].filter(Boolean).join('  ·  ');
          if (metaBits) {
            ctx.font = '500 9.6px "Montserrat", sans-serif';
            ctx.fillStyle = '#6C635C';
            ctx.textAlign = 'right';
            ctx.fillText(metaBits, A4_W - PAD_X, curY + 1);
            ctx.textAlign = 'left';
          }
          curY += 18;
        }

        const intro = String(quote.introText || 'De nuestra mayor consideración, nos dirigimos a Ud. a fin de presentarle cotización artesanal de las siguientes creaciones:');
        ctx.font = 'italic 400 10.4px "Montserrat", sans-serif';
        ctx.fillStyle = '#4A433E';
        const introLines = wrapLines(ctx, intro, CONTENT_W);
        introLines.slice(0, 3).forEach((ln) => {
          ctx.fillText(ln, PAD_X, curY);
          curY += 15;
        });
        curY += 6;
      }

      // 3. ENCABEZADO DE TABLA DIVIDIDA
      const colProdW = Math.round(CONTENT_W * 0.52) - 2;
      const colRightX = PAD_X + Math.round(CONTENT_W * 0.52) + 2;
      const colRightW = CONTENT_W - Math.round(CONTENT_W * 0.52) - 2;
      const wQty = Math.round(colRightW * 0.25) - 2;
      const wUnit = Math.round(colRightW * 0.375) - 2;
      const wSub = colRightW - wQty - wUnit - 6;

      if (page.showTableHead) {
        const thH = 30;
        const boxes = [
          { x: PAD_X, w: colProdW, label: 'PRODUCTO' },
          { x: colRightX, w: wQty, label: 'CANTIDAD' },
          { x: colRightX + wQty + 3, w: wUnit, label: 'PRECIO UNITARIO' },
          { x: colRightX + wQty + 3 + wUnit + 3, w: wSub, label: 'SUBTOTAL' }
        ];
        boxes.forEach((b) => {
          roundRectPath(ctx, b.x, curY, b.w, thH, 2);
          ctx.fillStyle = theme.headerFill;
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.strokeStyle = '#C6B8A8';
          ctx.stroke();

          ctx.fillStyle = theme.accent;
          ctx.font = '700 9.4px "Montserrat", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(b.label, b.x + b.w / 2, curY + thH / 2 + 0.5);
        });
        curY += thH + 4;

        ctx.beginPath();
        ctx.moveTo(PAD_X, curY);
        ctx.lineTo(A4_W - PAD_X, curY);
        ctx.strokeStyle = theme.border;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 4. FILAS DE ÍTEMS DE ESTA PÁGINA
      const splitX = PAD_X + Math.round(CONTENT_W * 0.52);

      page.items.forEach((it) => {
        const qty = Math.max(0, parseFloat(it.qty) || 0);
        const unit = Math.max(0, parseFloat(it.unitPrice) || 0);
        const sub = qty * unit;

        ctx.font = '400 9.8px "Montserrat", sans-serif';
        const descLines = wrapLines(ctx, it.desc || '', A4_W - PAD_X - splitX - 18);
        ctx.font = '700 10.5px "Montserrat", sans-serif';
        const titleLines = wrapLines(ctx, String(it.title || 'PIEZA ARTESANAL').toUpperCase(), splitX - PAD_X - 126);

        const rightNeeded = 38 + Math.max(1, descLines.length) * 14.5 + 18;
        const leftNeeded = Math.max(126, titleLines.length * 15 + (it.variant ? 24 : 0) + (it.isAlternative ? 22 : 0) + 28);
        const rowH = Math.max(146, rightNeeded, leftNeeded);

        // Fotografía del producto (96 x 96)
        const imgX = PAD_X + 6;
        const imgY = curY + 14;
        const imgSize = 96;

        ctx.save();
        roundRectPath(ctx, imgX, imgY, imgSize, imgSize, 4);
        ctx.fillStyle = '#F7F3EC';
        ctx.fill();
        ctx.clip();
        const loadedImg = it.image ? imgMap.get(it.image) : null;
        if (loadedImg) {
          drawCoverImage(ctx, loadedImg, imgX, imgY, imgSize, imgSize);
        } else {
          ctx.fillStyle = theme.accent;
          ctx.font = '600 20px "Playfair Display", Georgia, serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('DL', imgX + imgSize / 2, imgY + imgSize / 2 - 6);
          ctx.fillStyle = '#8C7A6B';
          ctx.font = '600 7.5px "Montserrat", sans-serif';
          ctx.fillText('HECHO A MANO', imgX + imgSize / 2, imgY + imgSize / 2 + 13);
        }
        ctx.restore();

        roundRectPath(ctx, imgX, imgY, imgSize, imgSize, 4);
        ctx.strokeStyle = '#E4DBD0';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Título y variante a la derecha de la foto
        let txY = curY + 17;
        const txX = imgX + imgSize + 14;
        ctx.fillStyle = '#2B2625';
        ctx.font = '700 10.5px "Montserrat", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        titleLines.slice(0, 4).forEach((tln) => {
          ctx.fillText(tln, txX, txY);
          txY += 14.5;
        });

        if (it.variant && String(it.variant).trim()) {
          txY += 3;
          ctx.font = '600 9px "Montserrat", sans-serif';
          const varLines = wrapLines(ctx, String(it.variant).trim(), splitX - txX - 12);
          varLines.slice(0, 2).forEach((vln) => {
            const vw = Math.min(splitX - txX - 10, ctx.measureText(vln).width + 12);
            roundRectPath(ctx, txX, txY, vw, 17, 3);
            ctx.fillStyle = theme.accentSoft;
            ctx.fill();
            ctx.fillStyle = theme.accent;
            ctx.fillText(vln, txX + 6, txY + 3.5);
            txY += 19;
          });
        }

        if (it.isAlternative) {
          txY += 2;
          ctx.font = '700 8px "Montserrat", sans-serif';
          const altTxt = 'OPCIÓN ALTERNATIVA';
          const aw = ctx.measureText(altTxt).width + 12;
          roundRectPath(ctx, txX, txY, aw, 16, 3);
          ctx.fillStyle = '#F3ECE4';
          ctx.fill();
          ctx.fillStyle = '#7D5B4F';
          ctx.fillText(altTxt, txX + 6, txY + 4);
        }

        // Línea vertical central de la fila
        ctx.beginPath();
        ctx.moveTo(splitX, curY);
        ctx.lineTo(splitX, curY + rowH);
        ctx.strokeStyle = theme.border;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Franja superior derecha: Cantidad | Precio Unitario | Subtotal
        const metricsH = 34;
        ctx.textBaseline = 'middle';
        const mMidY = curY + metricsH / 2;

        ctx.fillStyle = '#2B2625';
        ctx.font = '600 10.5px "Montserrat", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(String(qty), colRightX + wQty / 2, mMidY);

        ctx.fillStyle = '#4A433E';
        ctx.font = '500 10.3px "Montserrat", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(formatMoneyArs(unit, true), colRightX + wQty + 3 + wUnit - 6, mMidY);

        ctx.fillStyle = '#2B2625';
        ctx.font = '700 10.5px "Montserrat", sans-serif';
        ctx.fillText(formatMoneyArs(sub, true), A4_W - PAD_X - 4, mMidY);

        // Línea horizontal bajo Cantidad / Precio / Subtotal
        ctx.beginPath();
        ctx.moveTo(splitX, curY + metricsH);
        ctx.lineTo(A4_W - PAD_X, curY + metricsH);
        ctx.strokeStyle = '#DDD2C5';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Descripción detallada debajo
        ctx.fillStyle = '#4A433E';
        ctx.font = '400 9.8px "Montserrat", sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        let dY = curY + metricsH + 10;
        descLines.forEach((dln) => {
          if (dY < curY + rowH - 10) {
            ctx.fillText(dln, splitX + 12, dY);
            dY += 14.5;
          }
        });

        // Línea divisoria inferior de la fila
        curY += rowH;
        ctx.beginPath();
        ctx.moveTo(PAD_X, curY);
        ctx.lineTo(A4_W - PAD_X, curY);
        ctx.strokeStyle = theme.border;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // 5. BLOQUE FINAL DE CONDICIONES & CUADRO DE TOTALES (En última hoja)
      if (page.showSummary) {
        curY += 16;
        const condW = quote.showTotals !== false ? Math.round(CONTENT_W * 0.55) : CONTENT_W;
        const condLinesRaw = [];
        if (quote.deliveryTime) condLinesRaw.push(`Plazo estimado de confección: ${quote.deliveryTime}`);
        if (quote.paymentTerms) condLinesRaw.push(`Condiciones de pago: ${quote.paymentTerms}`);
        if (quote.footerNotes) condLinesRaw.push(String(quote.footerNotes));
        if (totals.hasAlternatives && quote.showTotals === false) {
          condLinesRaw.unshift('Cotización comparativa por escala de cantidades. Cada fila expresa el valor unitario y subtotal correspondiente a esa opción.');
        }

        if (condLinesRaw.length > 0) {
          ctx.font = '400 9.2px "Montserrat", sans-serif';
          const wrappedCond = [];
          condLinesRaw.forEach((cl) => {
            wrapLines(ctx, cl, condW - 26).forEach(w => wrappedCond.push(w));
          });
          const boxH = Math.max(66, 30 + wrappedCond.length * 13.5);
          roundRectPath(ctx, PAD_X, curY, condW, boxH, 3);
          ctx.fillStyle = '#FAF8F4';
          ctx.fill();
          ctx.strokeStyle = '#E3DAD0';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.fillStyle = theme.accent;
          ctx.fillRect(PAD_X, curY, 3.5, boxH);

          ctx.font = '700 8.8px "Montserrat", sans-serif';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText('DETALLES DE CONFECCIÓN ARTESANAL & CONDICIONES', PAD_X + 13, curY + 10);

          ctx.fillStyle = '#4A433E';
          ctx.font = '400 9.1px "Montserrat", sans-serif';
          let cy = curY + 25;
          wrappedCond.slice(0, 8).forEach((wln) => {
            ctx.fillText(wln, PAD_X + 13, cy);
            cy += 13.5;
          });
        }

        if (quote.showTotals !== false) {
          const totW = CONTENT_W - condW - 18;
          const totX = A4_W - PAD_X - totW;
          const rows = [];
          rows.push({ label: 'Subtotal', val: formatMoneyArs(totals.subtotal, true), kind: 'normal' });
          if (totals.discountAmount > 0) {
            const pctTxt = Number(quote.discountPercent) > 0 ? ` (${quote.discountPercent}%)` : '';
            rows.push({ label: `Bonificación${pctTxt}`, val: '- ' + formatMoneyArs(totals.discountAmount, true), kind: 'discount' });
          }
          if (totals.shippingCost > 0) {
            rows.push({ label: 'Envío / Logística', val: formatMoneyArs(totals.shippingCost, true), kind: 'normal' });
          }
          rows.push({ label: 'TOTAL PRESUPUESTO', val: formatMoneyArs(totals.totalAmount, true), kind: 'grand' });
          if (quote.showDeposit) {
            rows.push({ label: 'Seña 50% (Inicio Confección)', val: formatMoneyArs(totals.depositAmount, true), kind: 'deposit' });
            rows.push({ label: 'Saldo 50% (Contra Entrega)', val: formatMoneyArs(totals.pendingBalance, true), kind: 'normal' });
          }

          let ty = curY;
          rows.forEach((r) => {
            const rh = r.kind === 'grand' ? 32 : 25;
            ctx.fillStyle = r.kind === 'grand' ? theme.accent : (r.kind === 'deposit' ? theme.accentSoft : '#FFFFFF');
            ctx.fillRect(totX, ty, totW, rh);
            ctx.strokeStyle = '#CFC2B4';
            ctx.lineWidth = 1;
            ctx.strokeRect(totX, ty, totW, rh);

            ctx.textBaseline = 'middle';
            ctx.fillStyle = r.kind === 'grand' ? '#FFFFFF' : (r.kind === 'discount' ? '#2E6B47' : '#2B2625');
            ctx.font = (r.kind === 'grand' || r.kind === 'deposit')
              ? '700 10px "Montserrat", sans-serif'
              : '500 9.6px "Montserrat", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(r.label, totX + 10, ty + rh / 2 + 0.5);

            ctx.font = r.kind === 'grand'
              ? '700 11.4px "Montserrat", sans-serif'
              : '700 9.8px "Montserrat", sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(r.val, totX + totW - 10, ty + rh / 2 + 0.5);
            ty += rh;
          });
        }
      }

      // 6. PIE DE PÁGINA EN CADA HOJA (Barra Marca + Página X de Y)
      const footH = 44;
      const footY = A4_H - 32 - footH;
      const pageBoxW = 118;
      const brandBarW = CONTENT_W - pageBoxW - 8;

      roundRectPath(ctx, PAD_X, footY, brandBarW, footH, 3);
      ctx.fillStyle = theme.accent;
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '600 9.1px "Montserrat", sans-serif';
      ctx.fillText(contact.line1, PAD_X + brandBarW / 2, footY + 15.5);
      ctx.font = '400 8.3px "Montserrat", sans-serif';
      ctx.fillText(contact.line2, PAD_X + brandBarW / 2, footY + 30);

      const pageBoxX = PAD_X + brandBarW + 8;
      roundRectPath(ctx, pageBoxX, footY, pageBoxW, footH, 3);
      ctx.fillStyle = '#E8DFD3';
      ctx.fill();
      ctx.strokeStyle = '#D4C7B7';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#2B2625';
      ctx.font = '700 9.6px "Montserrat", sans-serif';
      ctx.fillText(`Página ${page.pageNumber} de ${page.totalPages}`, pageBoxX + pageBoxW / 2, footY + footH / 2 + 0.5);

      canvases.push(canvas);
    }

    return canvases;
  }

  // ---------------------------------------------------------------------------
  // ENSAMBLADOR NATIVO DE PDF 1.4 MULTI-PÁGINA (SIN LIBRERÍAS EXTERNAS)
  // ---------------------------------------------------------------------------
  function dataUrlToUint8(dataUrl) {
    const base64 = dataUrl.split(',')[1] || '';
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    return bytes;
  }

  function canvasesToPdfBlob(canvases) {
    const encoder = new TextEncoder();
    const chunks = [];
    let byteOffset = 0;

    function pushStr(str) {
      const b = encoder.encode(str);
      chunks.push(b);
      byteOffset += b.length;
    }

    function pushBytes(uint8) {
      chunks.push(uint8);
      byteOffset += uint8.length;
    }

    // Cabecera PDF 1.4 con comentario binario estándar
    pushBytes(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));

    const numPages = canvases.length;
    const totalObjs = 2 + numPages * 3;
    const offsets = new Array(totalObjs + 1).fill(0);

    // 1: Catalog
    offsets[1] = byteOffset;
    pushStr('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

    // 2: Pages
    const kidsRefs = [];
    for (let i = 0; i < numPages; i++) {
      kidsRefs.push(`${3 + i * 3} 0 R`);
    }
    offsets[2] = byteOffset;
    pushStr(`2 0 obj\n<< /Type /Pages /Kids [${kidsRefs.join(' ')}] /Count ${numPages} >>\nendobj\n`);

    // 3..N: Page + Content Stream + DCTDecode JPEG XObject
    for (let i = 0; i < numPages; i++) {
      const canvas = canvases[i];
      const jpegBytes = dataUrlToUint8(canvas.toDataURL('image/jpeg', 0.92));

      const pageObjId = 3 + i * 3;
      const contentObjId = 4 + i * 3;
      const imgObjId = 5 + i * 3;

      offsets[pageObjId] = byteOffset;
      pushStr(
        `${pageObjId} 0 obj\n` +
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_PT_W} ${PDF_PT_H}] ` +
        `/Resources << /XObject << /Im0 ${imgObjId} 0 R >> >> ` +
        `/Contents ${contentObjId} 0 R >>\n` +
        `endobj\n`
      );

      const contentCmd = `q\n${PDF_PT_W} 0 0 ${PDF_PT_H} 0 0 cm\n/Im0 Do\nQ\n`;
      const contentBytes = encoder.encode(contentCmd);
      offsets[contentObjId] = byteOffset;
      pushStr(`${contentObjId} 0 obj\n<< /Length ${contentBytes.length} >>\nstream\n`);
      pushBytes(contentBytes);
      pushStr('\nendstream\nendobj\n');

      offsets[imgObjId] = byteOffset;
      pushStr(
        `${imgObjId} 0 obj\n` +
        `<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} ` +
        `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\n` +
        `stream\n`
      );
      pushBytes(jpegBytes);
      pushStr('\nendstream\nendobj\n');
    }

    // Tabla XREF exacta (20 bytes por entrada según ISO-32000)
    const xrefOffset = byteOffset;
    pushStr(`xref\n0 ${totalObjs + 1}\n`);
    pushStr('0000000000 65535 f \n');
    for (let id = 1; id <= totalObjs; id++) {
      const offStr = String(offsets[id]).padStart(10, '0');
      pushStr(`${offStr} 00000 n \n`);
    }

    pushStr(`trailer\n<< /Size ${totalObjs + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

    return new Blob(chunks, { type: 'application/pdf' });
  }

  function buildQuoteFilename(quote, ext) {
    const num = String((quote && quote.number) || '000101').replace(/[^0-9A-Za-z-]/g, '');
    const rawClient = (quote && quote.client && (quote.client.attention || quote.client.company)) || 'Clienta';
    const slug = String(rawClient)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Za-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 32) || 'Clienta';
    return `Presupuesto-${num}-${slug}-DivinaLocuraDeco.${ext || 'pdf'}`;
  }

  function triggerBlobDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  async function generateQuotePdfBlob(quote, settings) {
    const canvases = await renderQuotePagesToCanvases(quote, settings);
    const blob = canvasesToPdfBlob(canvases);
    const filename = buildQuoteFilename(quote, 'pdf');
    return { blob, filename, canvases };
  }

  async function downloadQuotePdf(quote, settings) {
    const res = await generateQuotePdfBlob(quote, settings);
    triggerBlobDownload(res.blob, res.filename);
    return res;
  }

  async function downloadQuoteImages(quote, settings) {
    const canvases = await renderQuotePagesToCanvases(quote, settings);
    for (let i = 0; i < canvases.length; i++) {
      const suffix = canvases.length > 1 ? `-Pag-${i + 1}` : '';
      const fname = buildQuoteFilename(quote, 'jpg').replace(/\.jpg$/, `${suffix}.jpg`);
      await new Promise((resolve) => {
        canvases[i].toBlob((blob) => {
          if (blob) triggerBlobDownload(blob, fname);
          setTimeout(resolve, 180);
        }, 'image/jpeg', 0.94);
      });
    }
    return canvases.length;
  }

  async function shareQuotePdfFile(quote, settings, shareText) {
    const res = await generateQuotePdfBlob(quote, settings);
    const file = new File([res.blob], res.filename, { type: 'application/pdf' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: `Presupuesto #${quote.number} · Divina Locura Deco`,
        text: shareText || `Te compartimos el Presupuesto #${quote.number} de Divina Locura Deco 🌸`,
        files: [file]
      });
      return { shared: true, filename: res.filename };
    }
    triggerBlobDownload(res.blob, res.filename);
    return { shared: false, downloaded: true, filename: res.filename };
  }

  // ---------------------------------------------------------------------------
  // CODIFICADOR COMPACTO PARA LINK ONLINE DEL PRESUPUESTO (presupuesto.html#q=...)
  // ---------------------------------------------------------------------------
  function encodeQuoteForUrl(quote) {
    try {
      const compact = {
        n: quote.number || '000101',
        d: quote.date || '',
        v: quote.validity || '',
        t: quote.theme || 'terracota',
        c: {
          co: (quote.client && quote.client.company) || '',
          at: (quote.client && quote.client.attention) || '',
          ph: (quote.client && quote.client.phone) || '',
          lo: (quote.client && quote.client.location) || ''
        },
        in: quote.introText || '',
        st: quote.showTotals !== false ? 1 : 0,
        sd: quote.showDeposit ? 1 : 0,
        dp: Number(quote.discountPercent) || 0,
        df: Number(quote.discountFixed) || 0,
        sc: Number(quote.shippingCost) || 0,
        dt: quote.deliveryTime || '',
        pt: quote.paymentTerms || '',
        fn: quote.footerNotes || '',
        it: (quote.items || []).map(it => ({
          ti: it.title || '',
          va: it.variant || '',
          // No incluir data: base64 pesados en el hash de WhatsApp; conservar rutas del catálogo/Drive
          im: (it.image && !String(it.image).startsWith('data:')) ? it.image : '',
          q: Number(it.qty) || 1,
          u: Number(it.unitPrice) || 0,
          al: it.isAlternative ? 1 : 0,
          de: it.desc || ''
        }))
      };
      const json = JSON.stringify(compact);
      const utf8 = new TextEncoder().encode(json);
      let bin = '';
      for (let i = 0; i < utf8.length; i++) bin += String.fromCharCode(utf8[i]);
      return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (e) {
      return '';
    }
  }

  function decodeQuoteFromUrl(token) {
    try {
      if (!token) return null;
      let b64 = String(token).replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const raw = JSON.parse(new TextDecoder().decode(bytes));
      if (!raw || typeof raw !== 'object') return null;
      return {
        id: 'COT-' + (raw.n || '000101'),
        number: raw.n || '000101',
        date: raw.d || '',
        validity: raw.v || '',
        theme: raw.t || 'terracota',
        client: {
          company: (raw.c && raw.c.co) || '',
          attention: (raw.c && raw.c.at) || '',
          phone: (raw.c && raw.c.ph) || '',
          location: (raw.c && raw.c.lo) || ''
        },
        introText: raw.in || '',
        showTotals: raw.st !== 0,
        showDeposit: !!raw.sd,
        discountPercent: Number(raw.dp) || 0,
        discountFixed: Number(raw.df) || 0,
        shippingCost: Number(raw.sc) || 0,
        deliveryTime: raw.dt || '',
        paymentTerms: raw.pt || '',
        footerNotes: raw.fn || '',
        items: Array.isArray(raw.it) ? raw.it.map((x, idx) => ({
          uid: 'qi-shared-' + idx,
          title: x.ti || 'Pieza Artesanal',
          variant: x.va || '',
          image: x.im || '',
          qty: Number(x.q) || 1,
          unitPrice: Number(x.u) || 0,
          isAlternative: !!x.al,
          desc: x.de || ''
        })) : []
      };
    } catch (e) {
      return null;
    }
  }

  window.DivinaLocuraQuotePDF = {
    formatMoneyArs,
    computeQuoteTotals,
    paginateQuote,
    buildBrandContactLines,
    buildQuoteFilename,
    renderQuotePagesToCanvases,
    generateQuotePdfBlob,
    downloadQuotePdf,
    downloadQuoteImages,
    shareQuotePdfFile,
    encodeQuoteForUrl,
    decodeQuoteFromUrl
  };
})();
