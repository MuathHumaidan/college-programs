/* مخزن الحفظ التلقائي المشترك: يحفظ في متصفح هذا الجهاز فقط، ولا يرسل شيئًا إلى أي مكان. */
(function () {
  let opened;
  function db() {
    return opened || (opened = new Promise((res, rej) => {
      const r = indexedDB.open('hub_autosave', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('kv');
      r.onsuccess = () => { r.result.onversionchange = () => r.result.close(); res(r.result); };
      r.onerror = () => rej(r.error);
    }));
  }
  function run(mode, fn) {
    return db().then(d => new Promise((res, rej) => {
      const t = d.transaction('kv', mode), q = fn(t.objectStore('kv'));
      t.oncomplete = () => res(q.result);
      t.onerror = t.onabort = () => rej(t.error);
    }));
  }
  window.HubStore = {
    get: k => run('readonly', s => s.get(k)),
    set: (k, v) => run('readwrite', s => s.put(v, k)),
    del: k => run('readwrite', s => s.delete(k)),
  };
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
})();
