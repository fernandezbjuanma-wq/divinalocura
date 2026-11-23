# Estado Actual — Divina Locura Deco

- **Último commit en `main`:** `26c3989` (2026-11-18).
- **Sitio público:** `https://fernandezbjuanma-wq.github.io/divinalocura/` (GitHub Pages).
- **Desarrollo remoto:** configurado en GitHub + Antigravity Remote Agents.
- **Deploy Apps Script (`apps-script/Codigo.gs`):** workflow manual `.github/workflows/deploy-apps-script.yml` listo; requiere cargar Secrets `SCRIPT_ID`, `DEPLOYMENT_ID` y `CLASPRC_JSON` en GitHub.
- **Pendiente prioritario de seguridad:** auditar que `admin-finances.html`, `admin-banco.html`, `banco-data.js`, `workshop-db.js` y `apps-script/Codigo.gs` no expongan datos sensibles al ser repositorio público (evaluar separar el panel admin en un repo privado).
