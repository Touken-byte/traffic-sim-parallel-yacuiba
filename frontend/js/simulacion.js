const datos = JSON.parse(sessionStorage.getItem('ultimaSimulacion') || 'null');

if (!datos) {
  window.location.href = 'config.html';
} else {
  document.getElementById('resumenSimulacion').textContent =
    `Simulación #${datos.simulacion.id} — Modo ${datos.simulacion.modo} — ${datos.simulacion.numVehiculos} vehículos`;

  if (datos.historial && datos.historial.length > 0) {
    reproducirHistorial(datos.historial);
  }
}

document.getElementById('btnVerResultados').addEventListener('click', () => {
  window.location.href = 'resultados.html';
});

document.getElementById('btnVolverConfig').addEventListener('click', () => {
  window.location.href = 'config.html';
});
