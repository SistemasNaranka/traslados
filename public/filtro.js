// filtro.js
let bodegaFiltroActiva = '';

export function setBodegaFiltro(valor) {
  bodegaFiltroActiva = valor;
}

export function getBodegaFiltro() {
  return bodegaFiltroActiva;
}
