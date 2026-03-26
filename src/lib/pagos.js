/**
 * Inicia el proceso de pago con MercadoPago.
 * Centraliza la lógica que estaba duplicada en Planes.jsx y ModalUpgrade.jsx.
 */
export async function iniciarPago({ userId, email }) {
  if (!userId) throw new Error('Se necesita el ID de usuario para pagar.');

  const response = await fetch('/api/pago/crear', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, email }),
  });

  if (!response.ok) {
    throw new Error(`Error del servidor: ${response.status}`);
  }

  const data = await response.json();

  if (!data.init_point) {
    throw new Error('No se recibió el punto de inicio de pago.');
  }

  window.location.href = data.init_point;
}