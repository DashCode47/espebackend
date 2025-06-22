import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import matchRoutes from './routes/match.routes';
import postRoutes from './routes/post.routes';
import notificationRoutes from './routes/notification.routes';
import promotionRoutes from './routes/promotion.routes';
import bannerRoutes from './routes/bannerRoutes';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/banners', bannerRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('ESPEConnect API funcionando');
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
