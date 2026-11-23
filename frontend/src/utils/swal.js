import Swal from 'sweetalert2'

export const ACCENT_COLOR = '#0f766e'

export function fireDialog(optionsOrTitle, text, icon) {
  const dark = document.documentElement.getAttribute('data-bs-theme') === 'dark'
  const base = {
    confirmButtonColor: ACCENT_COLOR,
    theme: dark ? 'bootstrap-5-dark' : 'bootstrap-5-light',
  }
  if (typeof optionsOrTitle === 'string') {
    return Swal.fire({ ...base, title: optionsOrTitle, text, icon })
  }
  return Swal.fire({ ...base, ...optionsOrTitle })
}
