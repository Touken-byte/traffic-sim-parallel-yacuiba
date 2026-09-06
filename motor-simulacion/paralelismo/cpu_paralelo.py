import time
from multiprocessing import Pool, cpu_count
from agentes.vehiculo import generar_vehiculos


def _calcular_vehiculo(args):
    """Función a nivel de módulo: necesaria para que multiprocessing pueda enviarla a otros procesos."""
    vehiculo, indice_precedente = args
    return vehiculo.calcular_siguiente(indice_precedente)


def ejecutar_cpu_paralelo(configuracion_vehiculos, duracion_ticks, semilla, num_procesos=None):
    inicio = time.perf_counter()

    vehiculos = generar_vehiculos(configuracion_vehiculos, semilla)
    num_procesos = num_procesos or cpu_count()

    historial = []
    with Pool(processes=num_procesos) as pool:
        for _ in range(duracion_ticks):
            snapshot = [v.indice_ruta for v in vehiculos]
            args = [
                (vehiculos[i], snapshot[i - 1] if i > 0 else None)
                for i in range(len(vehiculos))
            ]
            resultados = pool.map(_calcular_vehiculo, args)

            for vehiculo, (nuevo_indice, nueva_pos, velocidad) in zip(vehiculos, resultados):
                vehiculo.indice_ruta = nuevo_indice
                vehiculo.posicion_actual = nueva_pos
                vehiculo.velocidad_actual = velocidad

            historial.append([v.to_dict() for v in vehiculos])

    tiempo_total_ms = (time.perf_counter() - inicio) * 1000
    velocidades = [v["velocidad"] for tick in historial for v in tick]
    velocidad_promedio = sum(velocidades) / len(velocidades) if velocidades else 0

    return {
        "tiempoEjecucionMs": tiempo_total_ms,
        "velocidadPromedio": velocidad_promedio,
        "congestionPromedio": 0,
        "speedup": 1.0,       # se calcula de verdad en el siguiente paso, comparando contra secuencial
        "eficiencia": 1.0,
        "nucleosUsados": num_procesos,
        "historial": historial,
    }
