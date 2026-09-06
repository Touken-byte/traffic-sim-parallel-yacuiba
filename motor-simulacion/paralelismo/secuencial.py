import time
from agentes.motor import MotorSimulacion
from utils.grafo import obtener_coordenadas


def ejecutar_secuencial(configuracion_vehiculos, duracion_ticks, semilla):
    inicio = time.perf_counter()

    motor = MotorSimulacion(configuracion_vehiculos, duracion_ticks, semilla)
    historial = motor.correr()

    tiempo_total_ms = (time.perf_counter() - inicio) * 1000

    coords = obtener_coordenadas()
    for tick in historial:
        for vehiculo in tick:
            lon, lat = coords.get(vehiculo["posicion"], (0.0, 0.0))
            vehiculo["lon"] = lon
            vehiculo["lat"] = lat

    velocidades = [v["velocidad"] for tick in historial for v in tick]
    velocidad_promedio = sum(velocidades) / len(velocidades) if velocidades else 0

    return {
        "tiempoEjecucionMs": tiempo_total_ms,
        "velocidadPromedio": velocidad_promedio,
        "congestionPromedio": 0,
        "speedup": 1.0,
        "eficiencia": 1.0,
        "historial": historial,
    }