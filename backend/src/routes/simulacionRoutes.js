const express = require('express');
const axios = require('axios');
const router = express.Router();
const { crearSimulacion, listarSimulaciones } = require('../controllers/simulacionController');

const MOTOR_URL = process.env.MOTOR_SIMULACION_URL || 'http://motor-simulacion:5000';

router.post('/', crearSimulacion);
router.get('/', listarSimulaciones);

router.get('/grafo', async (req, res) => {
  try {
    const respuesta = await axios.get(`${MOTOR_URL}/grafo`);
    res.json(respuesta.data);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el grafo', detalle: error.message });
  }
});

module.exports = router;