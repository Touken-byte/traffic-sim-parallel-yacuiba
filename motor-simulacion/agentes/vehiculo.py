import random

TIPOS_VEHICULO = {
    "AUTO": {"velocidad_max": 40, "color": "azul", "ocupacion": 1.0},
    "MOTO": {"velocidad_max": 55, "color": "amarillo", "ocupacion": 0.5},
    "BUS": {"velocidad_max": 25, "color": "rojo", "ocupacion": 2.0},
}


class Vehiculo:
    def __init__(self, id_vehiculo, tipo, nodo_inicial, ruta):
        self.id = id_vehiculo
        self.tipo = tipo
        self.velocidad_max = TIPOS_VEHICULO[tipo]["velocidad_max"]
        self.color = TIPOS_VEHICULO[tipo]["color"]
        self.posicion_actual = nodo_inicial
        self.ruta = ruta
        self.indice_ruta = 0
        self.velocidad_actual = 0
        self.distancia_seguridad = 2  # en "pasos" de ruta

    def calcular_siguiente(self, indice_precedente=None):
        """
        Calcula (sin modificar el estado todavía) cuál sería el siguiente
        índice de ruta, posición y velocidad de este vehículo, dado el
        índice del vehículo precedente en el tick anterior.
        Devuelve una tupla (nuevo_indice, nueva_posicion, nueva_velocidad).
        """
        if self.indice_ruta >= len(self.ruta) - 1:
            return (self.indice_ruta, self.posicion_actual, 0)

        velocidad = self.velocidad_max

        if indice_precedente is not None:
            distancia = abs(self.indice_ruta - indice_precedente)
            if distancia < self.distancia_seguridad:
                velocidad = 0

        if velocidad > 0:
            nuevo_indice = self.indice_ruta + 1
            nueva_posicion = self.ruta[nuevo_indice]
            return (nuevo_indice, nueva_posicion, velocidad)

        return (self.indice_ruta, self.posicion_actual, 0)

    def to_dict(self):
        return {
            "id": self.id,
            "tipo": self.tipo,
            "color": self.color,
            "posicion": self.posicion_actual,
            "velocidad": self.velocidad_actual,
        }


def generar_vehiculos(configuracion, semilla=42):
    from utils.grafo import generar_ruta_aleatoria

    random.seed(semilla)

    vehiculos = []
    contador = 0
    for conf in configuracion:
        for _ in range(conf["cantidad"]):
            ruta = generar_ruta_aleatoria()
            vehiculo = Vehiculo(contador, conf["tipo"], ruta[0], ruta)
            vehiculos.append(vehiculo)
            contador += 1
    return vehiculos