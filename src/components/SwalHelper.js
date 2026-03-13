import Swal from 'sweetalert2';

const defaultConfirmOptions = {
  title: 'Sei sicuro?',
  text: '',
  icon: 'warning',
  confirmButtonColor: '#d32f2f',
  cancelButtonColor: '#1976d2',
  confirmButtonText: 'Sì',
  cancelButtonText: 'No',
};

export async function confirm(options = {}) {
  const opts = { ...defaultConfirmOptions, ...options, showCancelButton: true };
  const result = await Swal.fire(opts);
  return result.isConfirmed;
}

export function success(message, title = 'Successo', opts = {}) {
  return Swal.fire({ title, text: message, icon: 'success', timer: 2000, showConfirmButton: false, ...opts });
}

export function error(message, title = 'Errore', opts = {}) {
  return Swal.fire({ title, text: message, icon: 'error', ...opts });
}

const SwalHelper = { confirm, success, error };

export default SwalHelper;
