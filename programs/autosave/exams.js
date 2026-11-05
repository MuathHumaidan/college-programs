/* الحفظ التلقائي لمنظّم جداول الاختبارات: نفس محتوى ملف الجلسة وآخر تبويب.
   ملف الجلسة يبقى هو النسخة الاحتياطية، ويُعدّ محفوظًا فقط عند الضغط على «حفظ الجلسة». */
(function () {
  const K = 'exams', store = window.HubStore;
  let ready = false, stored = null, lastTab, busy = false, warned = false;
  async function tick() {
    if (!ready || busy || Impact.open) return;
    busy = true;
    try {
      if (!sessionHasData()) {
        if (stored !== '') { await store.del(K); stored = ''; }
      } else {
        const mark = sessionMark();
        if (mark !== stored || currentTab !== lastTab) {
          const { snapshots, ...state } = S;
          const payload = Object.assign({ app: SESSION_APP, savedAt: new Date().toISOString() }, state, { schemaVersion: SCHEMA_VERSION });
          await store.set(K, { json: JSON.stringify(payload), fileMark: savedMark, fileAt: savedAt ? savedAt.toISOString() : null, tab: currentTab });
          stored = mark; lastTab = currentTab;
        }
      }
      // لا داعي لتحذير الإغلاق ما دام آخر تعديل حُفظ في المتصفح
      App.noUnloadPrompt = !sessionHasData() || sessionMark() === stored;
    } catch (e) {
      App.noUnloadPrompt = false;
      if (!warned) { warned = true; toast('تعذّر الحفظ التلقائي في المتصفح — احفظ الجلسة في ملف', 'warn'); }
    }
    busy = false;
  }
  (async function () {
    try {
      const saved = await store.get(K);
      if (saved && saved.json && !sessionHasData()) {
        const res = sessionToState(JSON.parse(saved.json));
        if (res.error) {
          toast('تعذّرت استعادة العمل المحفوظ: ' + res.error, 'warn');
          return;   // لا نكتب فوق نسخة لم نستطع قراءتها
        }
        S = res.state;
        verifyCandidate = null;
        refresh({ noGate: true });
        savedMark = saved.fileMark; savedAt = saved.fileAt ? new Date(saved.fileAt) : null;
        currentTab = saved.tab !== undefined ? saved.tab : currentTab;
        App.render();
        stored = sessionMark(); lastTab = currentTab;
        toast('استُعيد آخر عمل محفوظ في هذا المتصفح', 'ok');
      }
    } catch (e) { console.warn('autosave restore', e); }
    ready = true;
    setInterval(tick, 2000);
    tick();
  })();
})();
