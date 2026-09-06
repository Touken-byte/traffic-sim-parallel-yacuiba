const simEstado = {
  historial: [],
  tickActual: 0,
  intervalId: null,
  reproduciendo: false,
  velocidad: 1,
  loop: false,
};

function dibujarTick(tickIndex) {
  const canvas = document.getElementById('canvasSimulacion');
  const ctx = canvas.getContext('2d');
  const historial = simEstado.historial;

  if (!historial[tickIndex]) return;

  let lons = [], lats = [];
  historial.forEach((tick) => tick.forEach((v) => {
    if (v.lon && v.lat) { lons.push(v.lon); lats.push(v.lat); }
  }));

  const minLon = Math.min(...lons), maxLon = Math.max(...lons);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);

  function proyectar(lon, lat) {
    const x = ((lon - minLon) / (maxLon - minLon || 1)) * (canvas.width - 20) + 10;
    const y = canvas.height - (((lat - minLat) / (maxLat - minLat || 1)) * (canvas.height - 20) + 10);
    return [x, y];
  }

  const colores = { azul: '#3b82f6', amarillo: '#eab308', rojo: '#ef4444' };

  ctx.fillStyle = '#0a1128';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  historial[tickIndex].forEach((v) => {
    const [x, y] = proyectar(v.lon, v.lat);
    const detenido = v.velocidad === 0;

    ctx.beginPath();
    const radio = v.tipo === 'BUS' ? 6 : v.tipo === 'MOTO' ? 3 : 4;
    ctx.arc(x, y, radio, 0, Math.PI * 2);
    ctx.fillStyle = detenido ? '#555b6e' : (colores[v.color] || '#ffffff');
    ctx.fill();
  });

  ctx.fillStyle = '#a0a0c0';
  ctx.font = '12px Arial';
  ctx.fillText(`Tick ${tickIndex + 1}/${historial.length}`, 10, 15);
}

function avanzarTick() {
  if (simEstado.tickActual >= simEstado.historial.length) {
    if (simEstado.loop) {
      simEstado.tickActual = 0;
    } else {
      pausarSimulacion();
      return;
    }
  }
  dibujarTick(simEstado.tickActual);
  simEstado.tickActual++;
}

function iniciarIntervalo() {
  clearInterval(simEstado.intervalId);
  const delayBase = 200;
  simEstado.intervalId = setInterval(avanzarTick, delayBase / simEstado.velocidad);
  simEstado.reproduciendo = true;
  document.getElementById('btnPausar').textContent = '⏸ Pausar';
}

function pausarSimulacion() {
  clearInterval(simEstado.intervalId);
  simEstado.reproduciendo = false;
  document.getElementById('btnPausar').textContent = '▶ Reanudar';
}

function detenerSimulacion() {
  clearInterval(simEstado.intervalId);
  simEstado.reproduciendo = false;
  simEstado.tickActual = 0;
  document.getElementById('canvasSimulacion').style.display = 'none';
  document.getElementById('controlesSimulacion').classList.add('oculto');
}

function reiniciarSimulacion() {
  simEstado.tickActual = 0;
  if (!simEstado.reproduciendo) {
    iniciarIntervalo();
  }
}

function reproducirHistorial(historial) {
  const canvas = document.getElementById('canvasSimulacion');
  const ctx = canvas.getContext('2d');
  canvas.style.display = 'block';
  document.getElementById('controlesSimulacion').classList.remove('oculto');

  const tieneCoordenadas = historial.some((tick) => tick.some((v) => v.lon && v.lat));
  if (!tieneCoordenadas) {
    ctx.fillStyle = '#0a1128';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#a0a0c0';
    ctx.font = '14px Arial';
    ctx.fillText('Sin coordenadas reales para este modo (GPU simplificado)', 20, 180);
    document.getElementById('controlesSimulacion').classList.add('oculto');
    return;
  }

  simEstado.historial = historial;
  simEstado.tickActual = 0;
  simEstado.loop = document.getElementById('loopCheckbox').checked;
  simEstado.velocidad = parseFloat(document.getElementById('velocidadReproduccion').value);

  iniciarIntervalo();
}

// --- Listeners de los controles (se registran una sola vez) ---
document.getElementById('btnPausar').addEventListener('click', () => {
  if (simEstado.reproduciendo) {
    pausarSimulacion();
  } else {
    iniciarIntervalo();
  }
});

document.getElementById('btnDetener').addEventListener('click', detenerSimulacion);
document.getElementById('btnReiniciar').addEventListener('click', reiniciarSimulacion);

document.getElementById('velocidadReproduccion').addEventListener('change', (e) => {
  simEstado.velocidad = parseFloat(e.target.value);
  if (simEstado.reproduciendo) iniciarIntervalo();
});

document.getElementById('loopCheckbox').addEventListener('change', (e) => {
  simEstado.loop = e.target.checked;
});