const datos = JSON.parse(sessionStorage.getItem('ultimaSimulacion') || 'null');

if (!datos) {
  window.location.href = 'config.html';
} else {
  const m = datos.simulacion.metrica;
  document.getElementById('tarjetasResultado').innerHTML = `
    <div id="resultado">
✅ Simulación #${datos.simulacion.id} completada (${datos.simulacion.modo})
Vehículos: ${datos.simulacion.numVehiculos}
Tiempo de ejecución: ${m.tiempoEjecucionMs.toFixed(2)} ms
Tiempo secuencial (referencia): ${datos.tiempoSecuencialMs.toFixed(2)} ms
Speedup: ${m.speedup.toFixed(3)}
Eficiencia: ${m.eficiencia.toFixed(3)}
    </div>
  `;
}

function descargarCsv() {
  if (!datos) return;
  const m = datos.simulacion.metrica;
  const filas = [
    ['campo', 'valor'],
    ['id', datos.simulacion.id],
    ['modo', datos.simulacion.modo],
    ['numVehiculos', datos.simulacion.numVehiculos],
    ['tiempoEjecucionMs', m.tiempoEjecucionMs],
    ['tiempoSecuencialMs', datos.tiempoSecuencialMs],
    ['speedup', m.speedup],
    ['eficiencia', m.eficiencia],
  ];
  const csv = filas.map((f) => f.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `simulacion_${datos.simulacion.id}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById('btnExportarCsv').addEventListener('click', descargarCsv);
document.getElementById('btnNuevaSimulacion').addEventListener('click', () => {
  window.location.href = 'config.html';
});