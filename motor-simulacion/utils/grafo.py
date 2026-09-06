import networkx as nx
import random
import os

RUTA_GRAFO = os.path.join(os.path.dirname(__file__), "..", "data", "grafo_yacuiba.graphml")

_grafo = None


def cargar_grafo():
    global _grafo
    if _grafo is None:
        grafo = nx.read_graphml(RUTA_GRAFO)

        # El .graphml guarda todos los atributos como texto; convertimos
        # 'length' a float para que shortest_path pueda sumarlo como número.
        for _, _, datos in grafo.edges(data=True):
            if "length" in datos:
                try:
                    datos["length"] = float(datos["length"])
                except (TypeError, ValueError):
                    datos["length"] = 1.0
            else:
                datos["length"] = 1.0

        _grafo = grafo
    return _grafo


def obtener_nodos():
    grafo = cargar_grafo()
    return list(grafo.nodes())


def generar_ruta_aleatoria():
    """Devuelve una ruta real (lista de nodos) entre dos puntos aleatorios del grafo."""
    grafo = cargar_grafo()
    nodos = list(grafo.nodes())

    intentos = 0
    while intentos < 10:
        origen = random.choice(nodos)
        destino = random.choice(nodos)
        if origen != destino:
            try:
                ruta = nx.shortest_path(grafo, origen, destino, weight="length")
                if len(ruta) > 1:
                    return ruta
            except nx.NetworkXNoPath:
                pass
        intentos += 1

    return [origen, origen]