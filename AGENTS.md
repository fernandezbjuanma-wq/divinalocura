# AGENTS.md — Divina Locura Deco (`divinalocura`)

Fuente de verdad para Antigravity, Codex y Claude Code (ver `README.md` para detalle de módulos).

## Arquitectura
- Tienda pública en GitHub Pages (`https://fernandezbjuanma-wq.github.io/divinalocura/`): `index.html`, `catalogo.html`, `producto.html`, `disenar.html`, `style.css`, `main.js`, `producto.js`, `products-data.js`.
- Panel admin: `admin*.html`, `admin.css`, `admin.js`, `banco-data.js`, `workshop-db.js`.
- Backend Sheets / Mercado Pago: `apps-script/Codigo.gs`.
- Despliegue manual Apps Script: `.github/workflows/deploy-apps-script.yml` (`workflow_dispatch`, usando GitHub Secrets).

## Flujo de trabajo autónomo
1. Leer `AGENTS.md`, `README.md` y `ESTADO_ACTUAL.md`.
2. Nunca commitear directo en `main` ni usar `force push`: crear rama propia (`ag/`, `codex/`, `claude/`) y abrir PR para aprobación humana.
3. Si el mismo error falla 3 veces, frenar y explicar bloqueo + alternativas.
4. Las conversaciones entre agentes no se sincronizan en vivo: GitHub es la memoria compartida.

## Seguridad y privacidad (repositorio Público por GitHub Pages)
- **Atención:** este repo es **Público** (necesario para GitHub Pages en plan Free).
- **Prohibido** commitear contraseñas, tokens de Mercado Pago, CBU/alias reales, datos personales de clientes, `.env*` ni `.clasprc.json`.
- No modificar Apps Script productivo sin aprobación explícita.
