"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
const prisma_1 = require("./utils/prisma");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const match_routes_1 = __importDefault(require("./routes/match.routes"));
const post_routes_1 = __importDefault(require("./routes/post.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const promotion_routes_1 = __importDefault(require("./routes/promotion.routes"));
const bannerRoutes_1 = __importDefault(require("./routes/bannerRoutes"));
const career_routes_1 = __importDefault(require("./routes/career.routes"));
const trip_routes_1 = __importDefault(require("./routes/trip.routes"));
const errorHandler_1 = require("./middlewares/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Swagger documentation
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'ESPEConnect API Documentation'
}));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/matches', match_routes_1.default);
app.use('/api/posts', post_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/promotions', promotion_routes_1.default);
app.use('/api/banners', bannerRoutes_1.default);
app.use('/api/careers', career_routes_1.default);
app.use('/api/trips', trip_routes_1.default);
// Base route
app.get('/', (req, res) => {
    res.send('ESPEConnect API funcionando');
});
// Health check endpoint with database connection test
app.get('/health', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Test database connection
        yield prisma_1.prisma.$queryRaw `SELECT 1`;
        res.json({
            status: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            status: 'error',
            database: 'disconnected',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        });
    }
}));
// Error handler
app.use(errorHandler_1.errorHandler);
// Only start server if not in Vercel environment
if (process.env.VERCEL !== '1') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en puerto ${PORT}`);
        console.log(`Documentación Swagger disponible en: http://localhost:${PORT}/api-docs`);
    });
}
// Export app for Vercel
exports.default = app;
