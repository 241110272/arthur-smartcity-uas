const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
const cookieParser = require('cookie-parser');
const passport = require('passport');
require('dotenv').config();

// Import Passport Configuration
require('./src/config/passport.config');

// Import Session Configuration
const { setupSession, secureCookies } = require('./src/config/session.config');

// Import routes
const healthRoutes = require('./src/routes/health');
const authRoutes = require('./src/routes/auth');
const trafficLightRoutes = require('./src/routes/trafficLights');
const pedestrianRoutes = require('./src/routes/pedestrians');
const incidentRoutes = require('./src/routes/incidents');
const trafficMonitoringRoutes = require('./src/routes/trafficMonitoring');
const emergencyAlertRoutes = require('./src/routes/emergencyAlerts');
const airQualityRoutes = require('./src/routes/airQuality');
const publicTransportationRoutes = require('./src/routes/publicTransportation');
const feedbackRoutes = require('./src/routes/feedback');

// Import middleware
const { validateRequest, logger } = require('./src/middleware/validation');
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');
const { authenticateJWT, isAdmin } = require('./src/middleware/auth.middleware');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.set('trust proxy', 1);
// Make io available to routes
app.set('io', io);

const PORT = process.env.PORT || 5000;

/**
 * Middleware Configuration
 */

// Body parser
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Cookie Parser
app.use(cookieParser());

// Security headers
app.use(secureCookies);

// Session setup (server-side session management)
setupSession(app);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Logging
app.use(logger);

// Request validation
app.use(validateRequest);

/**
 * WebSocket Configuration untuk Real-time Updates
 */
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Listen untuk real-time traffic updates
  socket.on('subscribe_traffic_monitoring', () => {
    socket.join('traffic_monitoring');
  });

  // Listen untuk emergency alerts
  socket.on('subscribe_emergency_alerts', () => {
    socket.join('emergency_alerts');
  });

  // Listen untuk air quality updates
  socket.on('subscribe_air_quality', () => {
    socket.join('air_quality');
  });

  // Listen untuk transportation updates
  socket.on('subscribe_transportation', () => {
    socket.join('public_transportation');
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

/**
 * Routes Configuration
 */

// Health check endpoint
app.use('/api', healthRoutes);

// Auth routes
app.use('/api/auth', authRoutes);

// Legacy routes
app.use('/api/traffic-lights', trafficLightRoutes);
app.use('/api/pedestrians', pedestrianRoutes);
app.use('/api/incidents', incidentRoutes);

// Smart City Feature Routes
app.use('/api/traffic-monitoring', trafficMonitoringRoutes);
app.use('/api/emergency-alerts', emergencyAlertRoutes);
app.use('/api/air-quality', airQualityRoutes);
app.use('/api/public-transportation', publicTransportationRoutes);
app.use('/api/feedback', feedbackRoutes);

/**
 * Frontend Routes (untuk views)
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

app.get('/admin-dashboard', isAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin-dashboard.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

/**
 * Error Handling Middleware
 */

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

/**
 * Server Startup
 */

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║   Smart City Traffic Management System - Enhanced          ║
║   Server is running on port ${PORT}                           ║
║   Environment: ${process.env.NODE_ENV || 'development'}                                 ║
║   Features:                                                ║
║   - Real-time Traffic Monitoring                           ║
║   - Emergency Alert System                                 ║
║   - Air Quality Monitoring                                 ║
║   - Public Transportation Management                       ║
║   - Citizen Feedback System                                ║
║   - JWT + Passport Authentication                          ║
║   - Session & Cookie Security                              ║
║   - Role-Based Access Control                              ║
╚════════════════════════════════════════════════════════════╝
  `);
});

module.exports = { app, server, io };

