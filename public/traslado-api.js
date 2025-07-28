// traslado-api.js
/* export async function obtenerTraslados() {
  const datos = localStorage.getItem('traslados');
  if (!datos) throw new Error('No se encontraron traslados');
  return JSON.parse(datos);
} */
import { obtenerTrasladosIndexedDB } from './utils/indexeddb.js';

export async function obtenerTraslados() {
  return await obtenerTrasladosIndexedDB();
}