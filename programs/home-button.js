/* زر الرجوع إلى الصفحة الرئيسية، ولا يظهر عند الطباعة. */
(function () {
  const css = document.createElement('style');
  css.textContent = "#hubHome{position:fixed;left:16px;bottom:16px;z-index:2147483000;background:#123A2B;color:#fff;font:700 14px/1 'Cairo','IBM Plex Sans Arabic',system-ui,sans-serif;padding:11px 16px;border-radius:10px;text-decoration:none;box-shadow:0 4px 14px rgba(0,0,0,.28)}#hubHome:hover,#hubHome:focus-visible{background:#12855A}@media print{#hubHome{display:none!important}}";
  document.head.appendChild(css);
  const a = document.createElement('a');
  a.id = 'hubHome'; a.href = '../'; a.textContent = 'الرئيسية'; a.dir = 'rtl';
  document.body.appendChild(a);
})();
