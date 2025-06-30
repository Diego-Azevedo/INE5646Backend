require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(express.json());
app.use(cors({
  origin: ['https://jsonconvert.org', 'https://www.jsonconvert.org', 'http://localhost:9000', 'websocket.bruno.g.alvez.vms.ufsc.br'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

connectDB();

app.use('/auth', authRoutes);
app.use('/user', userRoutes);

app.get('/', (req, res) => res.status(200).json({ message: 'API Online!' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
