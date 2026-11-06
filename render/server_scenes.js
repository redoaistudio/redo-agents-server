// Конфиг ролика AI News из JSON-спецификации (window.__SPEC), собранной pipeline/script.py.
(function () {
  const S = window.__SPEC; if (!S) return;
  const brand = Object.assign({}, AI_BRAND, { right: S.right || '' });
  const specs = S.scenes.map((x) => Object.assign({}, x));
  CFGS.job = mkCfg6(brand, specs, { news: S.ticker, tickY: 1430, ad: S.ad || null, tail: false });
})();
