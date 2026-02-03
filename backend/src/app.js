const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roleRequestRoutes = require('./routes/roleRequestRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const hostelRoutes = require('./routes/hostelRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const errorHandler = require('./middlewares/errorHandler');
const db = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

app.get('/api/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'disconnected'
  };

  try {
    await db.query('SELECT 1');
    health.database = 'connected';
    res.json(health);
  } catch (err) {
    health.status = 'error';
    health.database = 'disconnected';
    health.error = err.message;
    res.status(503).json(health);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/role-requests', roleRequestRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/tickets', ticketRoutes);

app.use(errorHandler);

module.exports = app;
