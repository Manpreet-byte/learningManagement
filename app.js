const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const logger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const testRoutes = require('./routes/testRoutes');
const courseRoutes = require('./routes/courseRoutes');
const studentRoutes = require('./routes/studentRoutes');
const enrollRoutes = require('./routes/enrollRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(logger);

app.get('/', (req, res) => {
  res.json({ message: 'LMS backend is running' });
});

app.use('/api/test', testRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/enroll', enrollRoutes);
app.use('/api/auth', authRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
