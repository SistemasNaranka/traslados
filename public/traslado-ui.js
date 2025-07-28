// traslado-ui.js
import { actualizarContadorPendientes } from './app.js';
import { getBodegaFiltro } from './filtro.js';
export function createTrasladoButton(doc, isSelected, moveHandler) {
  const btn = document.createElement('button');
  btn.className = `
    document-btn min-w-[170px] max-w-[200px] text-left p-3 border rounded-lg shadow-sm
    ${isSelected 
      ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-50' 
      : 'bg-white text-gray-800 border-blue-300 hover:bg-blue-50'} 
    transition-all duration-200
  `.trim();
  btn.innerHTML = `
    <div class="flex flex-col items-start w-full space-y-0.5">
      <div class="text-base font-semibold text-blue-900">Traslado: ${doc.traslado}</div>
      <div class="text-sm text-gray-700">Fecha: ${doc.fecha}</div>
      <div class="text-sm text-gray-700">Unidades: ${doc.unidades}</div>
      <div class="text-sm text-gray-700">Bodega Origen: ${doc.bodega_origen}</div>
    </div>
  `;

  btn.dataset.traslado = doc.traslado;
  btn.addEventListener('click', () => moveHandler(doc, isSelected));
  return btn;
}

export function initBuscador({ docs, selected, available, move }) {
  const buscador = document.getElementById('buscador');
  const clearBtn = document.getElementById('clear-search-btn');

  buscador?.addEventListener('input', function () {
    buscador.value = buscador.value.replace(/\D/g, ''); // Solo números

    const query = buscador.value.trim().toLowerCase();
    clearBtn.classList.toggle('hidden', query.length === 0);

    available.innerHTML = '';
    const idsSeleccionados = Array.from(selected.querySelectorAll('button')).map(btn => btn.dataset.traslado);
    const filtroBodega = getBodegaFiltro();

    const filtrados = docs.filter(doc => {
      const coincideBusqueda = doc.traslado.toString().toLowerCase().includes(query);
      const coincideFiltroBodega = filtroBodega === '' || String(doc.bodega_destino) === filtroBodega;
      const noSeleccionado = !idsSeleccionados.includes(String(doc.traslado));
      return coincideBusqueda && coincideFiltroBodega && noSeleccionado;
    });

    filtrados.forEach(doc => {
      available.appendChild(createTrasladoButton(doc, false, move));
    });
    actualizarContadorPendientes();

  });

  clearBtn?.addEventListener('click', () => {
    buscador.value = '';
    clearBtn.classList.add('hidden');

    available.innerHTML = '';
    const idsSeleccionados = Array.from(selected.querySelectorAll('button')).map(btn => btn.dataset.traslado);
    const filtroBodega = getBodegaFiltro();

    const noSeleccionados = docs.filter(doc =>
      !idsSeleccionados.includes(String(doc.traslado)) &&
      (filtroBodega === '' || String(doc.bodega_destino) === filtroBodega)
    );

    noSeleccionados.forEach(doc => {
      available.appendChild(createTrasladoButton(doc, false, move));
    });
    actualizarContadorPendientes();
  });
}
