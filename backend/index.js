const express = require('express');
const cors = require('cors');
require('dotenv').config();
const simulacionRoutes = require('./src/routes/simulacionRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensaje: 'API Simulador de Tráfico funcionando correctamente' });
});

app.use('/simulaciones', simulacionRoutes);

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});