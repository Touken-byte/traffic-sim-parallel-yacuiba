let modoActual = 'RAPIDA';

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('activo'));
    tab.classList.add('activo');
    modoActual = tab.dataset.modo;

    document.getElementById('panel-rapido').classList.toggle('oculto', modoActual !== 'RAPIDA');
    document.getElementById('panel-avanzado').classList.toggle('oculto', modoActual !== 'AVANZADA');
  });
});

function construirVehiculos() {
  if (modoActual === 'RAPIDA') {
    const total = parseInt(document.getElementById('totalVehiculos').value, 10);
    return [
      { tipo: 'AUTO', cantidad: Math.round(total * 0.6), velocidadMax: 40 },
      { tipo: 'MOTO', cantidad: Math.round(total * 0.3), velocidadMax: 55 },
      { tipo: 'BUS', cantidad: Math.max(total - Math.round(total * 0.6) - Math.round(total * 0.3), 0), velocidadMax: 25 },
    ];
  }

  return [
    { tipo: 'AUTO', cantidad: parseInt(document.getElementById('cantAuto').value, 10), velocidadMax: parseFloat(document.getElementById('velAuto').value) },
    { tipo: 'MOTO', cantidad: parseInt(document.getElementById('cantMoto').value, 10), velocidadMax: parseFloat(document.getElementById('velMoto').value) },
    { tipo: 'BUS', cantidad: parseInt(document.getElementById('cantBus').value, 10), velocidadMax: parseFloat(document.getElementById('velBus').value) },
  ];
}

document.getElementById('btnIniciar').addEventListener('click', async () => {
  const boton = document.getElementById('btnIniciar');
  const mensajeError = document.getElementById('mensajeError');

  const payload = {
    modo: document.getElementById('modoEjecucion').value,
    tipoConfiguracion: modoActual,
    duracionTicks: parseInt(document.getElementById('duracionTicks').value, 10),
    semilla: parseInt(document.getElementById('semilla').value, 10),
    vehiculos: construirVehiculos(),
  };

  boton.disabled = true;
  boton.textContent = 'Simulando...';
  mensajeError.classList.add('oculto');

  try {
    const data = await crearSimulacion(payload);
    sessionStorage.setItem('ultimaSimulacion', JSON.stringify(data));
    window.location.href = 'simulacion.html';
  } catch (error) {
    mensajeError.classList.remove('oculto');
    mensajeError.textContent = `❌ Error: ${error.message}`;
    boton.disabled = false;
    boton.textContent = 'Iniciar Simulación';
  }
});