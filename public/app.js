import { checkAuth, logout } from './auth.js';
import { obtenerTraslados} from './traslado-api.js';
import { createTrasladoButton } from './traslado-ui.js';
import { initDropdown   } from './modals.js';
import { initBuscador } from './traslado-ui.js';
import { initModalPassword, solicitarPassword } from './modal-password.js';
import { mostrarLoading, ocultarResultado } from './modals.js';

checkAuth();

let docs = [];
let available, selected, approveBtn;

function actualizarContadorPendientes() {
  const contador = document.getElementById('contador-pendientes');
  const total = document.querySelectorAll('#available-documents button').length;
  if (contador) contador.textContent = total;
}

function updateApproveButton() {
  const total = selected?.querySelectorAll('button').length || 0;
  approveBtn.disabled = total === 0;
  approveBtn.classList.toggle('opacity-50', total === 0);
  approveBtn.innerHTML = `<i class="fas fa-check-circle mr-2"></i> Aprobar${total > 0 ? ` (${total})` : ''}`;
}
const passwordInput = document.getElementById('confirm-password');

passwordInput.addEventListener('input', () => {

  passwordInput.value = passwordInput.value.replace(/\D/g, '');
});

let move = function (doc, isSelected) {
  const btn = document.querySelector(`button[data-traslado="${doc.traslado}"]`);
  if (btn) btn.remove();
  const target = isSelected ? available : selected;
  const newBtn = createTrasladoButton(doc, !isSelected, move);
  target.appendChild(newBtn);
  updateApproveButton();
  actualizarContadorPendientes()
};

export async function recargarTraslados() {
  try {
    docs.length = 0;
    const nuevos = await obtenerTraslados();
    docs.push(...nuevos);
    available.innerHTML = '';

    nuevos.forEach(doc => {
      available.appendChild(createTrasladoButton(doc, false, move));
    });

    actualizarContadorPendientes();
    

  } catch (err) {
    console.error('Error recargando traslados:', err);
  }
}

window.recargarTrasladosUI = async () => {
  await recargarTraslados();
  updateApproveButton();
  actualizarContadorPendientes

};

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('logout-btn')?.addEventListener('click', logout);

  available = document.getElementById('available-documents');
  selected = document.getElementById('selected-documents');
  approveBtn = document.getElementById('approve-btn');

  await recargarTraslados();
  updateApproveButton();
  actualizarContadorPendientes()

  initDropdown({ docs, selected, available, move });
  initBuscador({ docs, selected, available, move });

  document.getElementById('select-all-btn')?.addEventListener('click', () => {
    available.querySelectorAll('button').forEach(btn => {
      const doc = docs.find(d => d.traslado == btn.dataset.traslado);
      if (doc) move(doc, false);
    });
  });

  document.getElementById('deselect-all-btn')?.addEventListener('click', () => {
    selected.querySelectorAll('button').forEach(btn => {
      const doc = docs.find(d => d.traslado == btn.dataset.traslado);
      if (doc) move(doc, true);
    });
  });

  initModalPassword();

  approveBtn.addEventListener('click', () => {
    const seleccionados = Array.from(selected.querySelectorAll('button')).map(btn => {
      const doc = docs.find(d => d.traslado == btn.dataset.traslado);
      return {
        traslado: doc.traslado,
        fecha: doc.fecha,
      };
    });
    solicitarPassword(seleccionados);
  });

  window.ocultarResultado = ocultarResultado;
});
export { actualizarContadorPendientes };
