const express = require('express');
const router = express.Router();
const { crearSimulacion, listarSimulaciones } = require('../controllers/simulacionController');

router.post('/', crearSimulacion);
router.get('/', listarSimulaciones);

module.exports = router;
