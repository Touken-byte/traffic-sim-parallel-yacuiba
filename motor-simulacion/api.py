from flask import Flask, request, jsonify
from paralelismo.secuencial import ejecutar_secuencial

app = Flask(__name__)


@app.route("/", methods=["GET"])
def salud():
    return jsonify({"mensaje": "Motor de simulación funcionando correctamente"})


@app.route("/simular", methods=["POST"])
def simular():
    data = request.get_json()

    modo = data.get("modo", "SECUENCIAL")
    configuracion_vehiculos = data.get("vehiculos", [])
    duracion_ticks = data.get("duracionTicks", 50)
    semilla = data.get("semilla", 42)

    if modo == "SECUENCIAL":
        resultado = ejecutar_secuencial(configuracion_vehiculos, duracion_ticks, semilla)
    else:
        return jsonify({"error": f"Modo {modo} aún no implementado"}), 400

    return jsonify(resultado)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
