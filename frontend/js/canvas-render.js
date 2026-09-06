function reproducirHistorial(historial) {
  const canvas = document.getElementById('canvasSimulacion');
  const ctx = canvas.getContext('2d');
  canvas.style.display = 'block';

  // Calcular los límites (bounding box) de todas las coordenadas del historial
  let lons = [], lats = [];
  historial.forEach((tick) => tick.forEach((v) => {
    if (v.lon && v.lat) { lons.push(v.lon); lats.push(v.lat); }
  }));

  if (lons.length === 0) {
    ctx.fillStyle = '#a0a0c0';
    ctx.font = '14px Arial';
    ctx.fillText('Sin coordenadas reales para este modo (GPU simplificado)', 20, 180);
    return;
  }

  const minLon = Math.min(...lons), maxLon = Math.max(...lons);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);

  function proyectar(lon, lat) {
    const x = ((lon - minLon) / (maxLon - minLon || 1)) * (canvas.width - 20) + 10;
    const y = canvas.height - (((lat - minLat) / (maxLat - minLat || 1)) * (canvas.height - 20) + 10);
    return [x, y];
  }

  const colores = { azul: '#3b82f6', amarillo: '#eab308', rojo: '#ef4444' };

  let tickActual = 0;
  clearInterval(window._intervaloSimulacion);
  window._intervaloSimulacion = setInterval(() => {
    if (tickActual >= historial.length) {
      clearInterval(window._intervaloSimulacion);
      return;
    }
    ctx.fillStyle = '#0a1128';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    historial[tickActual].forEach((v) => {
      const [x, y] = proyectar(v.lon, v.lat);
      ctx.beginPath();
      ctx.arc(x, y, v.tipo === 'BUS' ? 6 : v.tipo === 'MOTO' ? 3 : 4, 0, Math.PI * 2);
      ctx.fillStyle = colores[v.color] || '#ffffff';
      ctx.fill();
    });

    ctx.fillStyle = '#a0a0c0';
    ctx.font = '12px Arial';
    ctx.fillText(`Tick ${tickActual + 1}/${historial.length}`, 10, 15);

    tickActual++;
  }, 200);
}
