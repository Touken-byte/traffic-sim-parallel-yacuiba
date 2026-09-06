const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MOTOR_URL = process.env.MOTOR_SIMULACION_URL || 'http://motor-simulacion:5000';
const GPU_MOTOR_URL = process.env.GPU_MOTOR_URL;
async function crearSimulacion(req, res) {
  try {
    const { modo, tipoConfiguracion, duracionTicks, semilla, vehiculos } = req.body;

    const numVehiculos = vehiculos.reduce((acc, v) => acc + v.cantidad, 0);

    // 1. Correr el modo solicitado (motor local para SECUENCIAL/CPU, Colab para GPU)
    let resultadoModo;
    if (modo === 'GPU') {
      if (!GPU_MOTOR_URL) {
        throw new Error('GPU_MOTOR_URL no está configurada en el .env');
      }
      const respuestaGpu = await axios.post(`${GPU_MOTOR_URL}/simular_gpu`, {
        duracionTicks,
        vehiculos,
      });
      resultadoModo = respuestaGpu.data;
    } else {
      const respuestaModo = await axios.post(`${MOTOR_URL}/simular`, {
        modo,
        duracionTicks,
        semilla,
        vehiculos,
      });
      resultadoModo = respuestaModo.data;
    }

    // 2. Si el modo no es SECUENCIAL, correr también el secuencial como base de comparación
    let tiempoSecuencialMs = resultadoModo.tiempoEjecucionMs;
    if (modo !== 'SECUENCIAL') {
      const respuestaSecuencial = await axios.post(`${MOTOR_URL}/simular`, {
        modo: 'SECUENCIAL',
        duracionTicks,
        semilla,
        vehiculos,
      });
      tiempoSecuencialMs = respuestaSecuencial.data.tiempoEjecucionMs;
    }

    // 3. Calcular speedup y eficiencia reales
    const nucleosUsados = resultadoModo.nucleosUsados || 1;
    const speedup = tiempoSecuencialMs / resultadoModo.tiempoEjecucionMs;
    const eficiencia = speedup / nucleosUsados;

    // 4. Guardar en la base de datos
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
            tiempoEjecucionMs: resultadoModo.tiempoEjecucionMs,
            velocidadPromedio: resultadoModo.velocidadPromedio,
            congestionPromedio: resultadoModo.congestionPromedio,
            speedup,
            eficiencia,
          },
        },
      },
      include: { vehiculos: true, metrica: true },
    });

    res.status(201).json({
      simulacion,
      tiempoSecuencialMs,
      historial: resultadoModo.historial,
    });
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
