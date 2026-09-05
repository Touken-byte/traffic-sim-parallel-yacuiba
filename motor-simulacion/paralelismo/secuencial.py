import time
from agentes.motor import MotorSimulacion


def ejecutar_secuencial(configuracion_vehiculos, duracion_ticks, semilla, grafo_nodos):
    inicio = time.perf_counter()

    motor = MotorSimulacion(configuracion_vehiculos, duracion_ticks, semilla, grafo_nodos)
    historial = motor.correr()

    tiempo_total_ms = (time.perf_counter() - inicio) * 1000

    velocidades = [v["velocidad"] for tick in historial for v in tick]
    velocidad_promedio = sum(velocidades) / len(velocidades) if velocidades else 0

    return {
        "tiempoEjecucionMs": tiempo_total_ms,
        "velocidadPromedio": velocidad_promedio,
        "congestionPromedio": 0,  # se calcula con más detalle en el siguiente sprint
        "speedup": 1.0,           # el secuencial es la base de comparación
        "eficiencia": 1.0,
        "historial": historial,
    }
