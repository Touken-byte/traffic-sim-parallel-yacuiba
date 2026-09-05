const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MOTOR_URL = process.env.MOTOR_SIMULACION_URL || 'http://motor-simulacion:5000';

async function crearSimulacion(req, res) {
  try {
    const { modo, tipoConfiguracion, duracionTicks, semilla, vehiculos } = req.body;

    const numVehiculos = vehiculos.reduce((acc, v) => acc + v.cantidad, 0);

    // 1. Llamar al motor de simulación en Python
    const respuestaMotor = await axios.post(`${MOTOR_URL}/simular`, {
      modo,
      duracionTicks,
      semilla,
      vehiculos,
    });

    const resultado = respuestaMotor.data;

    // 2. Guardar la simulación en la base de datos
    const simulacion = await prisma.simulacion.create({
      data: {
        modo,
        tipoConfiguracion,
        numVehiculos,
        duracionTicks,
        semilla,
        vehiculos: {
          create: vehiculos.map((v) => ({
            tipo: v.tipo,
            cantidad: v.cantidad,
            velocidadMax: v.velocidadMax,
          })),
        },
        metrica: {
          create: {
            tiempoEjecucionMs: resultado.tiempoEjecucionMs,
            velocidadPromedio: resultado.velocidadPromedio,
            congestionPromedio: resultado.congestionPromedio,
            speedup: resultado.speedup,
            eficiencia: resultado.eficiencia,
          },
        },
      },
      include: { vehiculos: true, metrica: true },
    });

    res.status(201).json({ simulacion, historial: resultado.historial });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Error al ejecutar la simulación', detalle: error.message });
  }
}

async function listarSimulaciones(req, res) {
  const simulaciones = await prisma.simulacion.findMany({
    include: { vehiculos: true, metrica: true },
    orderBy: { fechaEjecucion: 'desc' },
    take: 20,
  });
  res.json(simulaciones);
}

module.exports = { crearSimulacion, listarSimulaciones };
