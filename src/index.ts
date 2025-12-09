import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger';
import { prisma } from './utils/prisma';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import matchRoutes from './routes/match.routes';
import postRoutes from './routes/post.routes';
import notificationRoutes from './routes/notification.routes';
import promotionRoutes from './routes/promotion.routes';
import establishmentRoutes from './routes/establishment.routes';
import bannerRoutes from './routes/bannerRoutes';
import careerRoutes from './routes/career.routes';
import tripRoutes from './routes/trip.routes';
import eventRoutes from './routes/event.routes';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();

// Middlewares - CORS Configuration
const allowedOrigins = [
  'https://fit-flex-six.vercel.app',
  'https://fitandflex-production.up.railway.app',
  'http://localhost:3000',
  'http://localhost:8080',
];

// Agregar orígenes desde variable de entorno si existe
if (process.env.ALLOWED_ORIGINS) {
  const envOrigins = process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
  allowedOrigins.push(...envOrigins);
}

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // En desarrollo, permitir todos los orígenes
      // En producción, descomentar la siguiente línea para bloquear orígenes no permitidos
      // callback(new Error('Not allowed by CORS'));
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));

// JSON parser - skip for multipart/form-data (let multer handle it)
app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    // Skip JSON parsing for multipart requests - multer will handle it
    return next();
  }
  // Parse JSON for other requests
  express.json()(req, res, next);
});

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'ESPEConnect API Documentation'
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/establishments', establishmentRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/careers', careerRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/events', eventRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('ESPEConnect API funcionando');
});

// Health check endpoint with database connection test
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Error handler
app.use(errorHandler);

// Only start server if not in Vercel environment
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`Documentación Swagger disponible en: http://localhost:${PORT}/api-docs`);
  });
}

// Export app for Vercel
export default app;
