/* الحفظ التلقائي لبرنامج «جداول الكلية»: التقارير المرفوعة وآخر تبويب. */
(function () {
  const K = 'schedules', store = window.HubStore;
  let ready = false, lastSig = null, lastTab = null, timer = null, warned = false;
  const sig = () => JSON.stringify([SETUP_DONE, FILES.map(f => [f.name, f.type, f.rows, !!f.pending, !!f.blocked])]);
  function save() {
    timer = null;
    const s = sig();
    if (s !== lastSig) {
      const job = FILES.length ? store.set(K, { files: FILES.slice(), setupDone: SETUP_DONE }) : store.del(K);
      job.then(() => { lastSig = s; }).catch(() => {
        if (!warned) { warned = true; toast('تعذّر الحفظ التلقائي في المتصفح — قد لا تكفي مساحة الجهاز', true); }
      });
    }
    if (TAB !== lastTab) { lastTab = TAB; store.set(K + ':tab', TAB).catch(() => {}); }
  }
  function later() { if (ready && !timer) timer = setTimeout(save, 500); }
  const origRefresh = refresh, origSelect = selectTab;
  refresh = function () { const r = origRefresh.apply(this, arguments); later(); return r; };
  selectTab = function () { const r = origSelect.apply(this, arguments); later(); return r; };
  setInterval(later, 3000);   // يلتقط تأكيد لوحة التهيئة وأي تغيير لا يمر عبر التحديث
  (async function () {
    try {
      const saved = await store.get(K), tab = await store.get(K + ':tab');
      if (saved && saved.files && saved.files.length && !FILES.length) {
        FILES.push(...saved.files);
        SETUP_DONE = !!saved.setupDone;
        rebuildRAW();
        refresh();
        if (tab) selectTab(tab);
        toast('استُعيد آخر عمل محفوظ في هذا المتصفح');
      }
      lastSig = sig(); lastTab = TAB;
    } catch (e) { console.warn('autosave restore', e); }
    ready = true;
  })();
})();
