// utils/indexeddb.js
export async function guardarTrasladosIndexedDB(traslados) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(traslados)) {
      console.warn('No hay traslados para guardar.');
      return resolve(); // No hay nada que guardar, pero no es un error
    }

    const request = indexedDB.open('trasladosDB', 2);

    request.onupgradeneeded = function (e) {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('traslados')) {
        db.createObjectStore('traslados', { keyPath: 'traslado' });
      }
    };

    request.onsuccess = function (e) {
      const db = e.target.result;
      const tx = db.transaction('traslados', 'readwrite');
      const store = tx.objectStore('traslados');
      console.log('Guardando en IndexedDB:', traslados);

      traslados.forEach(t => {
        console.log('Guardando traslado:', t);
        if (!t.traslado) {
          console.warn('Objeto sin ID traslado:', t);
        }
        store.put(t);
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };

    request.onerror = () => reject(request.error);
  });
}


export async function obtenerTrasladosIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('trasladosDB', 2);

    request.onupgradeneeded = function (e) {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('traslados')) {
        db.createObjectStore('traslados', { keyPath: 'traslado' });
      }
    };

    request.onsuccess = function (e) {
      const db = e.target.result;
      const tx = db.transaction('traslados', 'readonly');
      const store = tx.objectStore('traslados');
      const traslados = [];

      store.openCursor().onsuccess = function (event) {
        const cursor = event.target.result;
        if (cursor) {
          traslados.push(cursor.value);
          cursor.continue();
        } else {
          resolve(traslados);
        }
      };

      tx.onerror = () => reject(tx.error);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function eliminarTrasladosPorId(ids) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('trasladosDB', 2);

    request.onupgradeneeded = function (e) {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('traslados')) {
        db.createObjectStore('traslados', { keyPath: 'traslado' });
      }
    };

    request.onsuccess = function (event) {
      const db = event.target.result;
      const tx = db.transaction('traslados', 'readwrite');
      const store = tx.objectStore('traslados');

      ids.forEach(id => {
        store.delete(id);
      });

      tx.oncomplete = () => resolve();
      tx.onerror = (e) => reject(e);
    };

    request.onerror = (e) => reject(e);
  });
}
