#!/bin/bash

CANTIDADES=(10 30 60 100 200)

for n in "${CANTIDADES[@]}"; do
  echo "----- $n vehículos -----"
  curl -s -X POST http://localhost:4000/simulaciones \
    -H "Content-Type: application/json" \
    -d "{\"modo\": \"CPU\", \"tipoConfiguracion\": \"RAPIDA\", \"duracionTicks\": 15, \"semilla\": 42, \"vehiculos\": [{\"tipo\": \"AUTO\", \"cantidad\": $n, \"velocidadMax\": 40}]}" \
    | python3 -c "
import sys, json
d = json.load(sys.stdin)
m = d['simulacion']['metrica']
print(f\"tiempoParalelo={m['tiempoEjecucionMs']:.2f}ms | tiempoSecuencial={d['tiempoSecuencialMs']:.2f}ms | speedup={m['speedup']:.3f} | eficiencia={m['eficiencia']:.3f}\")
"
  echo ""
done
