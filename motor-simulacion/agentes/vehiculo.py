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
        self.distancia_seguridad = 5  # metros

    def avanzar(self, vehiculo_precedente=None):
        """Avanza un tick respetando velocidad máxima y distancia de seguridad."""
        if self.indice_ruta >= len(self.ruta) - 1:
            return  # llegó a destino

        self.velocidad_actual = self.velocidad_max

        if vehiculo_precedente:
            distancia = self._calcular_distancia(vehiculo_precedente)
            if distancia < self.distancia_seguridad:
                self.velocidad_actual = 0

        if self.velocidad_actual > 0:
            self.indice_ruta += 1
            self.posicion_actual = self.ruta[self.indice_ruta]

    def _calcular_distancia(self, otro_vehiculo):
        # Simplificación inicial: distancia por índice de ruta
        return abs(self.indice_ruta - otro_vehiculo.indice_ruta)

    def to_dict(self):
        return {
            "id": self.id,
            "tipo": self.tipo,
            "color": self.color,
            "posicion": self.posicion_actual,
            "velocidad": self.velocidad_actual,
        }


def generar_vehiculos(configuracion, grafo_nodos):
    """
    configuracion: lista de dicts [{tipo, cantidad, velocidadMax}, ...]
    grafo_nodos: lista de nodos disponibles del grafo
    """
    vehiculos = []
    contador = 0
    for conf in configuracion:
        for _ in range(conf["cantidad"]):
            nodo_inicial = random.choice(grafo_nodos)
            destino = random.choice(grafo_nodos)
            ruta = [nodo_inicial, destino]  # se reemplaza por ruta real del grafo en el siguiente paso
            vehiculo = Vehiculo(contador, conf["tipo"], nodo_inicial, ruta)
            vehiculos.append(vehiculo)
            contador += 1
    return vehiculos
