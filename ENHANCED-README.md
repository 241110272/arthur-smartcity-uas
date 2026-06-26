# Smart City Traffic Management System - Production-Ready Edition

## Overview

An enterprise-grade Smart City Traffic Management System built with Node.js, Express.js, and MySQL. This project implements comprehensive traffic management with real-time monitoring, emergency alerts, air quality tracking, public transportation management, and citizen feedback system.

## 🎯 Key Features

### 1. **Real-time Traffic Monitoring**
- Live traffic congestion tracking across city locations
- Vehicle count and speed monitoring
- Congestion level classification (low, medium, high, critical)
- Historical traffic data analysis
- Peak hour identification

### 2. **Emergency Alert System**
- Real-time emergency incident reporting
- Multi-type alerts (accidents, hazards, emergency vehicles, air quality, natural disasters)
- Severity-based alert classification
- Emergency vehicle priority routing
- Socket.IO real-time broadcasting

### 3. **Air Quality Monitoring**
- Real-time Air Quality Index (AQI) tracking
- Pollutant measurement (PM2.5, PM10, O3, NO2, SO2, CO)
- Correlation analysis between traffic and air quality
- Automatic alert generation for unhealthy levels
- Air quality trends and statistics

### 4. **Public Transportation Management**
- Real-time vehicle location tracking (Bus, MRT, LRT, Minibus, Tram)
- Occupancy rate monitoring
- Route management and statistics
- Transportation issue reporting
- Multi-vehicle type support

### 5. **Citizen Feedback System**
- Public complaint and suggestion submission
- Multi-category feedback (traffic, transportation, air quality, general)
- Priority-based ticket management
- Admin response system
- Location-based feedback distribution

### 6. **Advanced Security**
- JWT + Passport.js authentication
- Session-based cookie security
- Parameterized query protection against SQL injection
- Role-Based Access Control (User, Admin, SuperAdmin)
- HTTPS-ready with security headers
- Password hashing with bcryptjs

## 🏗️ Architecture

### Technology Stack
- **Backend**: Node.js, Express.js 4.18.2
- **Database**: MySQL 8.0+ with connection pooling
- **Authentication**: JWT + Passport.js + Express-Session
- **Real-time**: Socket.IO 4.5+
- **Validation**: Express-validator
- **Security**: Helmet, bcryptjs, parameterized queries

### Project Structure

```
src/
├── config/           # Configuration files
│   ├── passport.config.js      # JWT & Passport strategy
│   └── session.config.js       # Session & cookie management
├── controllers/      # Business logic
│   ├── AuthController.js
│   ├── TrafficMonitoringController.js
│   ├── EmergencyAlertController.js
│   ├── AirQualityController.js
│   ├── PublicTransportationController.js
│   └── CitizenFeedbackController.js
├── middleware/       # Express middleware
│   ├── auth.middleware.js      # JWT & RBAC
│   ├── errorHandler.js         # Global error handling
│   └── validation.js           # Request validation
├── models/          # Database models
│   ├── User.js
│   ├── TrafficMonitoring.js
│   ├── EmergencyAlert.js
│   ├── AirQualityMonitoring.js
│   ├── PublicTransportation.js
│   └── CitizenFeedback.js
├── routes/          # API endpoints
│   ├── auth.js
│   ├── trafficMonitoring.js
│   ├── emergencyAlerts.js
│   ├── airQuality.js
│   ├── publicTransportation.js
│   └── feedback.js
├── utils/           # Utility functions
│   ├── database.js           # Connection pool
│   └── database.util.js      # Safe query builder
└── views/           # HTML templates
```

## 🔐 Security Implementation

### 1. Authentication & Authorization

**JWT Implementation (Per PDF 5)**
```javascript
// Token Generation
const token = jwt.sign(
  {
    sub: user.id,
    email: user.email,
    role: user.role
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

**Passport.js Strategy**
- Implemented JWT strategy for stateless authentication
- Extracts bearer tokens from Authorization header
- Validates token signature with environment secret

**Role-Based Access Control**
```javascript
// Three-tier RBAC system
- Superadmin: Full system control
- Admin: Feature management & monitoring
- User: View & report functionality
```

### 2. Session & Cookie Security

**Express-session Configuration**
- Server-side session management with secure cookies
- HTTPOnly flag prevents XSS attacks
- Secure flag for HTTPS in production
- SameSite: Strict for CSRF prevention
- 24-hour session expiration

### 3. SQL Injection Prevention

**Parameterized Queries (Database.util.js)**
```javascript
// All queries use ? placeholders
const [rows] = await connection.execute(
  'SELECT * FROM users WHERE email = ?',
  [email]
);
```

**Benefits**
- Database driver handles escaping automatically
- Prevents SQL injection attacks
- Improves query performance with prepared statements

### 4. Data Protection

- Password hashing with bcryptjs (salt rounds: 10)
- JWT tokens expire after 7 days
- Session cookies expire after 24 hours
- Comprehensive audit logging

## 📊 Database Schema

### Core Tables
1. **users** - User accounts with role-based access
2. **traffic_monitoring** - Real-time traffic data
3. **emergency_alerts** - Emergency incident tracking
4. **air_quality_monitoring** - Air quality measurements
5. **public_transportation** - Vehicle tracking
6. **citizen_feedback** - Feedback & complaints
7. **feedback_responses** - Admin responses
8. **sessions** - Session management
9. **system_logs** - Audit trail

All tables include proper indexing for performance optimization.

## 🚀 Installation & Setup

### Prerequisites
- Node.js 14.0+
- MySQL 8.0+
- npm or yarn

### Setup Steps

1. **Clone and install dependencies**
```bash
npm install
```

2. **Configure environment variables** (.env)
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=smartcity_traffic
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRY=7d
SESSION_SECRET=your_session_secret_key
NODE_ENV=development
```

3. **Setup database**
```bash
node setup-db.js
# Or manually import database.sql into MySQL
```

4. **Start server**
```bash
# Development
npm run dev

# Production
npm start
```

5. **Access the application**
- Admin Dashboard: http://localhost:5000/admin-dashboard
- Login: http://localhost:5000/login
- Register: http://localhost:5000/register

## 🔌 API Documentation

### Authentication
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/current-user (requires JWT)
```

### Traffic Monitoring
```
GET  /api/traffic-monitoring/latest
GET  /api/traffic-monitoring/location/:location
GET  /api/traffic-monitoring/congestion
GET  /api/traffic-monitoring/statistics
POST /api/traffic-monitoring/record (authenticated)
```

### Emergency Alerts
```
GET  /api/emergency-alerts/active
GET  /api/emergency-alerts/type/:type
GET  /api/emergency-alerts/near (query: latitude, longitude)
POST /api/emergency-alerts/create (authenticated)
POST /api/emergency-alerts/emergency-vehicle (authenticated)
```

### Air Quality
```
GET  /api/air-quality/latest
GET  /api/air-quality/unhealthy
GET  /api/air-quality/trend/:location
GET  /api/air-quality/statistics
POST /api/air-quality/record (authenticated)
```

### Public Transportation
```
GET  /api/public-transportation/active
GET  /api/public-transportation/route/:route
GET  /api/public-transportation/near (query: latitude, longitude)
GET  /api/public-transportation/statistics
POST /api/public-transportation/register (authenticated)
PUT  /api/public-transportation/:id/location (authenticated)
```

### Citizen Feedback
```
GET  /api/feedback/category/:category
GET  /api/feedback/user/:userId
POST /api/feedback/submit (authenticated)
GET  /api/feedback/admin/open (admin only)
GET  /api/feedback/admin/high-priority (admin only)
GET  /api/feedback/admin/statistics (admin only)
PUT  /api/feedback/:id/status (admin only)
```

## 👥 User Roles

### Superadmin
- Full system access
- User management
- System configuration
- All admin functions

### Admin
- Dashboard access
- Monitor all features
- Manage feedback & alerts
- Generate reports

### User
- Submit feedback & reports
- View public data
- Record traffic/air quality
- Report transportation issues

## 🔄 Real-time Features

### Socket.IO Implementation
```javascript
// Subscribe to updates
socket.emit('subscribe_traffic_monitoring');
socket.emit('subscribe_emergency_alerts');
socket.emit('subscribe_air_quality');
socket.emit('subscribe_transportation');

// Listen for events
socket.on('emergency_alert_created', (alert) => {
  // Handle new alert
});
```

## 📝 Middleware Architecture

Following PDF 1 concepts, the system implements:

1. **Application-level Middleware**
   - Body parser, CORS, Session, Passport

2. **Router-level Middleware**
   - Authentication & Authorization
   - Request validation

3. **Error-handling Middleware**
   - Global error handler with proper logging

4. **Built-in Middleware**
   - Express static file serving

5. **Third-party Middleware**
   - bcryptjs, jsonwebtoken, socket.io

## 🧪 Testing

Sample test users (password: 'password'):
- Email: superadmin@smartcity.com (Superadmin)
- Email: admin@smartcity.com (Admin)
- Email: user1@smartcity.com (User)

## 📈 Performance Optimization

- **Database Connection Pooling**: 10 concurrent connections
- **Query Indexing**: Optimized indexes on frequently queried fields
- **Parameterized Queries**: Prepared statements for faster execution
- **Real-time Socket.IO**: Efficient broadcasting with room subscriptions
- **Caching**: Session storage for reduced database queries

## 🛠️ Maintenance

### Regular Tasks
- Monitor system logs
- Review feedback regularly
- Backup database daily
- Check air quality alerts
- Verify emergency system functionality

### Scaling Considerations
- Use Redis for distributed sessions
- Implement database replication
- Load balance with Nginx/HAProxy
- Container deployment with Docker
- CDN for static assets

## 📚 References

### PDF Concepts Implemented

**PDF 1: Middleware**
- 5 middleware types architecture
- Request validation pipeline
- Error handling middleware
- Security headers middleware

**PDF 2: REST API**
- HTTP methods (GET, POST, PUT, DELETE)
- Resource-based endpoints
- Proper status codes
- RESTful route structure

**PDF 3: MVC Architecture**
- Model layer with database abstraction
- View layer with HTML templates
- Controller layer with business logic
- Clear separation of concerns

**PDF 4: Basic Authentication**
- Bearer token authentication
- JWT token validation
- Authentication middleware

**PDF 5: JWT + Passport**
- JWT structure (header.payload.signature)
- Passport.js strategy implementation
- Token generation & verification
- Session serialization

## 🤝 Contributing

For improvements or bug fixes:
1. Create a feature branch
2. Make changes with proper testing
3. Submit pull request with documentation
4. Follow code style guidelines

## 📄 License

This project is proprietary and confidential.

## 📞 Support

For issues or questions, contact the development team.

---

**Version**: 2.0.0 Production Edition
**Last Updated**: 2024
**Status**: Production Ready ✅
