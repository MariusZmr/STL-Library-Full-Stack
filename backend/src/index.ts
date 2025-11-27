import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { sequelize } from './models';
import authRoutes from './routes/auth.routes';
import fileRoutes from './routes/file.routes'; // Import file routes

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes); // Use file routes

// Basic route
app.get('/', (req, res) => {
  res.send('STL Library Backend is running!');
});

// Function to connect to DB and start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    await sequelize.sync({ alter: true });
    console.log('All models were synchronized successfully.');

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or start the server:', error);
  }
};

startServer();
