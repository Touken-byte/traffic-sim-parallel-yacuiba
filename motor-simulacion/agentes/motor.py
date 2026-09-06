from .vehiculo import generar_vehiculos


class MotorSimulacion:
    def __init__(self, configuracion_vehiculos, duracion_ticks, semilla):
        self.configuracion_vehiculos = configuracion_vehiculos
        self.duracion_ticks = duracion_ticks
        self.semilla = semilla
        self.vehiculos = generar_vehiculos(configuracion_vehiculos)
        self.historial = []

    def ejecutar_tick(self):
        for i, vehiculo in enumerate(self.vehiculos):
            precedente = self.vehiculos[i - 1] if i > 0 else None
            vehiculo.avanzar(precedente)

    def correr(self):
        for _ in range(self.duracion_ticks):
            self.ejecutar_tick()
            self.historial.append([v.to_dict() for v in self.vehiculos])
        return self.historial
