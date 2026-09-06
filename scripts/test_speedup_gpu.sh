#!/bin/bash

CANTIDADES=(10 50 100 300 500)

for n in "${CANTIDADES[@]}"; do
  echo "----- $n vehículos (GPU) -----"
  curl -s -X POST http://localhost:4000/simulaciones \
    -H "Content-Type: application/json" \
    -d "{\"modo\": \"GPU\", \"tipoConfiguracion\": \"RAPIDA\", \"duracionTicks\": 15, \"semilla\": 42, \"vehiculos\": [{\"tipo\": \"AUTO\", \"cantidad\": $n, \"velocidadMax\": 40}]}" \
    | python3 -c "
import sys, json
d = json.load(sys.stdin)
m = d['simulacion']['metrica']
print(f\"tiempoGPU={m['tiempoEjecucionMs']:.2f}ms | tiempoSecuencial={d['tiempoSecuencialMs']:.2f}ms | speedup={m['speedup']:.2f} | eficiencia={m['eficiencia']:.3f}\")
"
  echo ""
done
