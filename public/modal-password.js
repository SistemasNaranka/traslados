//public/modal-password.js
import { mostrarLoading, ocultarLoading, mostrarResultado } from './modals.js';
import { eliminarTrasladosPorId } from '../utils/indexeddb.js';

let passwordModal, passwordInput, confirmBtn, cancelBtn;
let documentosSeleccionados = [];

export function initModalPassword() {
  passwordModal = document.getElementById('password-modal');
  passwordInput = document.getElementById('confirm-password');
  confirmBtn = document.getElementById('confirm-password-btn');
  cancelBtn = document.getElementById('cancel-password-btn');

  confirmBtn?.addEventListener('click', confirmarPassword);
  cancelBtn?.addEventListener('click', () => {
    passwordModal.classList.add('hidden');
    passwordInput.value = '';
    document.getElementById('password-error')?.classList.add('hidden');
  });
}

export function solicitarPassword(docs) {
  documentosSeleccionados = docs;
  passwordModal.classList.remove('hidden');
  passwordInput.value = '';
  passwordInput.focus();
}

async function confirmarPassword() {
  const password = passwordInput.value.trim();
  if (!password) {
    document.getElementById('password-error')?.classList.remove('hidden');
    passwordInput.focus();
    return;
  }
  document.getElementById('password-error')?.classList.add('hidden');

  passwordModal.classList.add('hidden');
  mostrarLoading();

  try {
    const traslados = [...documentosSeleccionados].map(doc => ({
      fecha: doc.fecha,
      traslado: doc.traslado
    }));

    const empresa = localStorage.getItem('empresa') || 'desconocida';
    const codigo_ultra = localStorage.getItem('codigo_ultra')
    const password = passwordInput.value.trim();

    const bodyData = {
        traslados,
        empresa,
        clave: password,
        codigo_ultra
    };

    console.log('Datos enviados al backend /api/aprobar:', bodyData);

    const response = await fetch('/api/aprobar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify(bodyData)
    });

    const result = await response.json();
  

    if (response.ok) {
      let mensaje = result.webhook?.mensaje || 'Los traslados fueron aprobados correctamente.';

      if (mensaje.toLowerCase() === 'successful') {
        mensaje = 'Traslados aprobados correctamente.';
        const aprobados = documentosSeleccionados.map(d => d.traslado);
        await eliminarTrasladosPorId(aprobados);       
      }

      mostrarResultado(mensaje, 'success');
    } else {
      const error = result?.error || 'No se pudo aprobar los traslados.';
      mostrarResultado(`Error: ${error}`, 'error');
    }

    } catch (err) {
    console.error('Error en fetch /api/aprobar:', err);
    mostrarResultado('Error al enviar la solicitud.', 'error');
    }
   finally {
    document.getElementById('selected-documents').innerHTML = '';
    await window.recargarTrasladosUI?.();
    ocultarLoading();
  }
}