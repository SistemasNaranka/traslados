// modals.js
import { createTrasladoButton } from './traslado-ui.js';
import { actualizarContadorPendientes } from './app.js'
import { setBodegaFiltro, getBodegaFiltro } from './filtro.js';
export function mostrarLoading() {
  document.getElementById('loading-modal')?.classList.remove('hidden');
}

export function ocultarLoading() {
  document.getElementById('loading-modal')?.classList.add('hidden');
}

export function mostrarResultado(mensaje, tipo = 'info') {
  const modal = document.getElementById('result-modal');
  const icon = document.getElementById('result-icon');
  const msg = document.getElementById('result-message');

  modal.classList.remove('hidden');
  msg.textContent = mensaje;

  icon.className = 'text-4xl mb-4';
  icon.innerHTML = tipo === 'success'
    ? '<i class="fas fa-check-circle text-green-500"></i>'
    : tipo === 'error'
    ? '<i class="fas fa-times-circle text-red-500"></i>'
    : '<i class="fas fa-info-circle text-blue-500"></i>';
}

export function ocultarResultado() {
  document.getElementById('result-modal')?.classList.add('hidden');
  // Aquí puedes volver a recargar sin recargar la página:
  if (window.recargarTrasladosUI) {
    window.recargarTrasladosUI(); // Llama a la función global definida más abajo
  }
}
export function initDropdown({ docs, selected, available, move }) {
  const button = document.getElementById('dropdown-container');
  const menu = document.getElementById('dropdown-menu');
  const arrow = document.getElementById('dropdown-arrow');
  const searchInput = document.getElementById('dropdown-search');

  // Mostrar menú al hacer clic
  button.addEventListener('click', (e) => {
    if (!menu.classList.contains('hidden')) return;
    e.stopPropagation();
    menu.classList.remove('hidden');
    arrow.classList.add('rotate-180');
    searchInput.focus();
  });

  // Filtro de búsqueda dentro del menú
  searchInput.addEventListener('input', () => {
    const filtro = searchInput.value.toLowerCase();
    const items = document.querySelectorAll('#dropdown-menu li[data-value]');

    items.forEach(item => {
      const visible = item.textContent.toLowerCase().includes(filtro);
      item.classList.toggle('hidden', !visible);
    });

    if (filtro === '') aplicarFiltroBodega('');
  });

  // Evento al hacer clic en una opción
  function asignarEventosAItems() {
    document.querySelectorAll('#dropdown-menu li[data-value]').forEach(item => {
      item.addEventListener('click', () => {
        const value = item.dataset.value;
        searchInput.value = item.textContent;
        aplicarFiltroBodega(value);
        menu.classList.add('hidden');
        arrow.classList.remove('rotate-180');
      });
    });
  }

  // Función para aplicar filtro por bodega
  function aplicarFiltroBodega(valor) {
    setBodegaFiltro(valor)
    available.innerHTML = '';

    const idsSeleccionados = Array.from(selected.querySelectorAll('button')).map(btn => btn.dataset.traslado);

    const filtrados = docs.filter(doc =>
      !idsSeleccionados.includes(String(doc.traslado)) &&
      (valor === '' || String(doc.bodega_destino) === valor)
    );

    filtrados.forEach(doc => {
      available.appendChild(createTrasladoButton(doc, false, move));
    });

    actualizarContadorPendientes();
  }

  // Llenar el menú desplegable con las bodegas únicas
  function cargarOpcionesBodegas() {
    const bodegas = [
      ...new Map(docs.map(doc => [doc.bodega_destino, doc.nombre_destino])).entries()
    ];

    menu.innerHTML = '';

    const opcionTodos = document.createElement('li');
    opcionTodos.dataset.value = '';
    opcionTodos.textContent = 'Todas las bodegas';
    opcionTodos.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer font-semibold text-black';
    menu.appendChild(opcionTodos);

    bodegas.forEach(([id, nombre]) => {
      const li = document.createElement('li');
      li.dataset.value = id;
      li.textContent = nombre;
      li.className = 'px-4 py-2 hover:bg-gray-100 cursor-pointer text-black';
      menu.appendChild(li);
    });

    asignarEventosAItems();
  }

  // Ocultar menú al hacer clic fuera
  window.addEventListener('click', (e) => {
    if (!button.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.add('hidden');
      arrow.classList.remove('rotate-180');
    }
  });

  // Inicializar el menú con las bodegas
  cargarOpcionesBodegas();
}
