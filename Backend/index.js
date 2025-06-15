import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.config.js'
import userRoutes from './routes/user.routes.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Database connection
connectDB();

// Routes
app.use('/api/user', userRoutes);


export default app;