/* الحفظ التلقائي لبرنامج «المقررات المستحقة»: يحفظ التقارير المرفوعة ويعيد قراءتها عند الفتح. */
(function () {
  const K = 'courses-due', store = window.HubStore, SINGLE = [1, 4];
  let list = [];
  const orig = loadFile;
  loadFile = async function (event, num) {
    const files = [...event.target.files];
    await orig(event, num);
    const st = document.getElementById('status' + num);
    if (!files.length || !st || !st.textContent.startsWith('✓')) return;
    list = list.filter(x => !(x.num === num && (SINGLE.includes(num) || files.some(f => f.name === x.file.name))));
    files.forEach(file => list.push({ num, file }));
    store.set(K, list).catch(() => showError('تعذّر الحفظ التلقائي في المتصفح — قد لا تكفي مساحة الجهاز', 'warn'));
  };
  (async function () {
    try {
      const saved = await store.get(K);
      if (!saved || !saved.length) return;
      list = saved;
      if (document.readyState !== 'complete') await new Promise(r => addEventListener('load', r, { once: true }));
      const batch = document.getElementById('currentBatchInput');
      let keep = '';
      try { keep = (JSON.parse(localStorage.getItem('appSettings') || '{}').batch) || ''; } catch (e) {}
      for (const x of saved) await orig({ target: { files: [x.file], value: '' } }, x.num);
      if (batch && keep) { batch.value = keep; saveSettings(); }
    } catch (e) { console.warn('autosave restore', e); }
  })();
})();
