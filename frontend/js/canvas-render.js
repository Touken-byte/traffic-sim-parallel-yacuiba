let aristasGrafo = [];
let limitesGrafo = null;
const vista = { zoom: 1, offsetX: 0, offsetY: 0, arrastrando: false, ultimoX: 0, ultimoY: 0 };

const simEstado = {
  historial: [],
  tickActual: 0,
  intervalId: null,
  reproduciendo: false,
  velocidad: 1,
  loop: false,
};

function dibujarVehiculo(ctx, x, y, tipo, color, detenido) {
  ctx.fillStyle = detenido ? '#555b6e' : color;

  if (tipo === 'BUS') {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillRect(-7, -3.5, 14, 7);
    ctx.restore();
  } else if (tipo === 'MOTO') {
    ctx.beginPath();
    ctx.moveTo(x, y - 4);
    ctx.lineTo(x - 3.5, y + 3);
    ctx.lineTo(x + 3.5, y + 3);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function calcularLimites() {
  let lons = [], lats = [];

  aristasGrafo.forEach(([a, b]) => {
    lons.push(a[0], b[0]);
    lats.push(a[1], b[1]);
  });

  if (lons.length === 0) {
    simEstado.historial.forEach((tick) => tick.forEach((v) => {
      if (v.lon && v.lat) { lons.push(v.lon); lats.push(v.lat); }
    }));
  }

  limitesGrafo = {
    minLon: Math.min(...lons), maxLon: Math.max(...lons),
    minLat: Math.min(...lats), maxLat: Math.max(...lats),
  };
}

function proyectar(lon, lat, canvas) {
  const { minLon, maxLon, minLat, maxLat } = limitesGrafo;
  const xBase = ((lon - minLon) / (maxLon - minLon || 1)) * (canvas.width - 20) + 10;
  const yBase = canvas.height - (((lat - minLat) / (maxLat - minLat || 1)) * (canvas.height - 20) + 10);

  const cx = canvas.width / 2, cy = canvas.height / 2;
  const x = cx + (xBase - cx) * vista.zoom + vista.offsetX;
  const y = cy + (yBase - cy) * vista.zoom + vista.offsetY;

  return [x, y];
}

function dibujarCalles(ctx, canvas) {
  ctx.strokeStyle = 'rgba(120, 130, 170, 0.35)';
  ctx.lineWidth = 1;
  aristasGrafo.forEach(([a, b]) => {
    const [x1, y1] = proyectar(a[0], a[1], canvas);
    const [x2, y2] = proyectar(b[0], b[1], canvas);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  });
}

function dibujarTick(tickIndex) {
  const canvas = document.getElementById('canvasSimulacion');
  const ctx = canvas.getContext('2d');
  const historial = simEstado.historial;

  if (!historial[tickIndex]) return;
  if (!limitesGrafo) calcularLimites();

  const colores = { azul: '#3b82f6', amarillo: '#eab308', rojo: '#ef4444' };

  ctx.fillStyle = '#0a1128';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  dibujarCalles(ctx, canvas);

  historial[tickIndex].forEach((v) => {
    const [x, y] = proyectar(v.lon, v.lat, canvas);
    const detenido = v.velocidad === 0;
    dibujarVehiculo(ctx, x, y, v.tipo, colores[v.color] || '#ffffff', detenido);
  });

  ctx.fillStyle = '#e0e0f0';
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

async function reproducirHistorial(historial) {
  const canvas = document.getElementById('canvasSimulacion');
  const ctx = canvas.getContext('2d');
  canvas.style.display = 'block';
  document.getElementById('controlesSimulacion').classList.remove('oculto');
  document.getElementById('ayudaZoom').classList.remove('oculto');

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

  if (aristasGrafo.length === 0) {
    try {
      const data = await obtenerGrafo();
      aristasGrafo = data.aristas;
    } catch (e) {
      console.warn('No se pudo cargar el grafo de calles:', e.message);
    }
  }

  limitesGrafo = null;
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

// --- Zoom (rueda del mouse) y paneo (arrastrar) ---
const canvasEl = document.getElementById('canvasSimulacion');

canvasEl.addEventListener('wheel', (e) => {
  e.preventDefault();
  const factor = e.deltaY < 0 ? 1.1 : 0.9;
  vista.zoom = Math.min(Math.max(vista.zoom * factor, 0.5), 8);
  if (!simEstado.reproduciendo) dibujarTick(Math.max(simEstado.tickActual - 1, 0));
});

canvasEl.addEventListener('mousedown', (e) => {
  vista.arrastrando = true;
  vista.ultimoX = e.clientX;
  vista.ultimoY = e.clientY;
});

window.addEventListener('mousemove', (e) => {
  if (!vista.arrastrando) return;
  vista.offsetX += e.clientX - vista.ultimoX;
  vista.offsetY += e.clientY - vista.ultimoY;
  vista.ultimoX = e.clientX;
  vista.ultimoY = e.clientY;
  if (!simEstado.reproduciendo) dibujarTick(Math.max(simEstado.tickActual - 1, 0));
});

window.addEventListener('mouseup', () => {
  vista.arrastrando = false;
});

document.getElementById('btnResetVista').addEventListener('click', () => {
  vista.zoom = 1;
  vista.offsetX = 0;
  vista.offsetY = 0;
  if (!simEstado.reproduciendo) dibujarTick(Math.max(simEstado.tickActual - 1, 0));
});