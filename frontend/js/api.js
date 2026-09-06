const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:4000'
  : 'http://backend:4000';

async function crearSimulacion(payload) {
  const respuesta = await fetch(`${API_URL}/simulaciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!respuesta.ok) {
    const error = await respuesta.json();
    throw new Error(error.detalle || 'Error al crear la simulación');
  }

  return respuesta.json();
}

