// public/auth.js
import { guardarTrasladosIndexedDB } from './utils/indexeddb.js';


export function checkAuth() {
  if (!localStorage.getItem('token')) {
    window.location.href = '/login.html';
  }
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('codigo_ultra');
  localStorage.removeItem('empresa');
  // localStorage.removeItem('traslados');
  indexedDB.deleteDatabase('trasladosDB');
  window.location.href = '/login.html';
}

export async function login(email, password) {

  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const result = await response.json()


  if (response.ok) {
    if (!result.token) {
      console.warn('No se recibió token.');
      return { ok: false, error: 'No se recibió token válido del servidor.' };
    }

    localStorage.setItem('token', result.token);
    localStorage.setItem('codigo_ultra', result.user?.codigo_ultra || '');
    localStorage.setItem('empresa', result.user?.empresa || '');
    // localStorage.setItem('traslados', JSON.stringify(result.traslados));
    try {
      await guardarTrasladosIndexedDB(result.traslados);
    } catch (error) {
      console.error('Error al guardar traslados en IndexedDB:', error);
      return { ok: false, error: 'Error al guardar los traslados' };
    }

    return { ok: true };
  } else {
      return {
        ok: false,
        error: result.error || 'Error al iniciar sesión.'
      };
    }
}
