from .vehiculo import generar_vehiculos


class MotorSimulacion:
    def __init__(self, configuracion_vehiculos, duracion_ticks, semilla):
        self.duracion_ticks = duracion_ticks
        self.vehiculos = generar_vehiculos(configuracion_vehiculos, semilla)
        self.historial = []

    def ejecutar_tick(self):
        snapshot = [v.indice_ruta for v in self.vehiculos]
        resultados = []
        for i, vehiculo in enumerate(self.vehiculos):
            indice_precedente = snapshot[i - 1] if i > 0 else None
            resultados.append(vehiculo.calcular_siguiente(indice_precedente))

        for vehiculo, (nuevo_indice, nueva_pos, velocidad) in zip(self.vehiculos, resultados):
            vehiculo.indice_ruta = nuevo_indice
            vehiculo.posicion_actual = nueva_pos
            vehiculo.velocidad_actual = velocidad

    def correr(self):
        for _ in range(self.duracion_ticks):
            self.ejecutar_tick()
            self.historial.append([v.to_dict() for v in self.vehiculos])
        return self.historial
