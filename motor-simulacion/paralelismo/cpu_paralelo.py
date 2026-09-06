import time
from multiprocessing import Pool, cpu_count
from agentes.vehiculo import generar_vehiculos


def _calcular_siguiente_liviano(args):
    """
    Recibe solo datos mínimos (no el objeto Vehiculo completo) para
    reducir el costo de serialización entre procesos.
    """
    indice_ruta, largo_ruta, indice_precedente, distancia_seguridad = args

    if indice_ruta >= largo_ruta - 1:
        return (indice_ruta, 0)

    velocidad = 1  # marcador: se resuelve la velocidad real fuera, aquí solo movemos índice
    if indice_precedente is not None and abs(indice_ruta - indice_precedente) < distancia_seguridad:
        return (indice_ruta, 0)

    return (indice_ruta + 1, 1)


def ejecutar_cpu_paralelo(configuracion_vehiculos, duracion_ticks, semilla, num_procesos=None):
    inicio = time.perf_counter()

    vehiculos = generar_vehiculos(configuracion_vehiculos, semilla)
    num_procesos = num_procesos or cpu_count()

    historial = []
    with Pool(processes=num_procesos) as pool:
        for _ in range(duracion_ticks):
            snapshot = [v.indice_ruta for v in vehiculos]

            args = [
                (
                    vehiculos[i].indice_ruta,
                    len(vehiculos[i].ruta),
                    snapshot[i - 1] if i > 0 else None,
                    vehiculos[i].distancia_seguridad,
                )
                for i in range(len(vehiculos))
            ]

            # chunksize agrupa varias tareas por proceso, reduciendo la cantidad
            # de mensajes enviados entre procesos (menos overhead de comunicación)
            chunksize = max(1, len(vehiculos) // (num_procesos * 4))
            resultados = pool.map(_calcular_siguiente_liviano, args, chunksize=chunksize)

            for vehiculo, (nuevo_indice, avanzo) in zip(vehiculos, resultados):
                vehiculo.indice_ruta = nuevo_indice
                vehiculo.velocidad_actual = vehiculo.velocidad_max if avanzo else 0
                if avanzo:
                    vehiculo.posicion_actual = vehiculo.ruta[nuevo_indice]

            historial.append([v.to_dict() for v in vehiculos])

    tiempo_total_ms = (time.perf_counter() - inicio) * 1000
    velocidades = [v["velocidad"] for tick in historial for v in tick]
    velocidad_promedio = sum(velocidades) / len(velocidades) if velocidades else 0

    return {
        "tiempoEjecucionMs": tiempo_total_ms,
        "velocidadPromedio": velocidad_promedio,
        "congestionPromedio": 0,
        "speedup": 1.0,
        "eficiencia": 1.0,
        "nucleosUsados": num_procesos,
        "historial": historial,
    }