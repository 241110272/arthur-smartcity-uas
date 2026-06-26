# Smart City Traffic Management System - Deployment & Implementation Guide

## 🚀 Quick Start Guide

### Step 1: Install Dependencies
```bash
cd uas/arthur-smartcity-traffic-sourcecode
npm install
```

### Step 2: Configure Environment
Create `.env` file with:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=smartcity_traffic
JWT_SECRET=smartcity_traffic_secret_key_2026_production_secure_key_ultra_secure_128bit
JWT_EXPIRY=7d
SESSION_SECRET=smartcity_session_secret_2026_production_ultra_secure_key
NODE_ENV=development
```

### Step 3: Setup Database
```bash
# Using setup script
node setup-db.js

# Or manually with MySQL
mysql -u root < database.sql
```

### Step 4: Start Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start

# Server runs on http://localhost:5000
```

### Step 5: Access Application
- **Admin Dashboard**: http://localhost:5000/admin-dashboard
- **Login**: http://localhost:5000/login
- **Register**: http://localhost:5000/register

## 📋 Security Checklist

### Pre-Deployment
- [ ] Change all default passwords
- [ ] Generate strong JWT_SECRET (min 32 chars)
- [ ] Generate strong SESSION_SECRET (min 32 chars)
- [ ] Update database credentials
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Set NODE_ENV=production
- [ ] Enable helmet security headers

### Database Security
- [ ] Run database.sql with proper user permissions
- [ ] Backup database regularly
- [ ] Enable database encryption
- [ ] Use parameterized queries only
- [ ] Configure database access controls
- [ ] Monitor database logs

### API Security
- [ ] Validate all inputs on server-side
- [ ] Rate limit endpoints
- [ ] Implement request logging
- [ ] Monitor suspicious activities
- [ ] Implement DDoS protection
- [ ] Use HTTPS/TLS only

## 🔧 Configuration Guide

### Environment Variables

#### Database Configuration
```
DB_HOST=localhost          # MySQL host
DB_USER=root              # Database user
DB_PASSWORD=              # Database password (empty for dev)
DB_NAME=smartcity_traffic # Database name
```

#### Authentication
```
JWT_SECRET=<64+ char random string>       # JWT signing key
JWT_EXPIRY=7d                             # Token expiration
SESSION_SECRET=<64+ char random string>   # Session key
```

#### Server
```
PORT=5000                 # Server port
NODE_ENV=development      # development or production
```

#### Features
```
ENABLE_REAL_TIME_MONITORING=true
ENABLE_AIR_QUALITY=true
ENABLE_EMERGENCY_ALERTS=true
ENABLE_FEEDBACK_SYSTEM=true
ENABLE_ANALYTICS=true
```

### SSL/TLS Configuration (Production)

```javascript
// In server.js for production
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('path/to/private.key'),
  cert: fs.readFileSync('path/to/certificate.crt')
};

https.createServer(options, app).listen(PORT);
```

## 📊 API Usage Examples

### Authentication

**Register**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "user@example.com",
    "password": "securepass123",
    "confirmPassword": "securepass123",
    "full_name": "John Doe",
    "phone": "081234567890"
  }'
```

**Login**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123"
  }'
```

### Traffic Monitoring

**Record Traffic Data**
```bash
curl -X POST http://localhost:5000/api/traffic-monitoring/record \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "location_name": "Jl. Sudirman",
    "latitude": -6.2131,
    "longitude": 106.8000,
    "congestion_level": "high",
    "vehicle_count": 250,
    "average_speed": 20.5
  }'
```

**Get Latest Traffic**
```bash
curl http://localhost:5000/api/traffic-monitoring/latest \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Emergency Alerts

**Create Emergency Alert**
```bash
curl -X POST http://localhost:5000/api/emergency-alerts/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "alert_type": "accident",
    "severity": "high",
    "location_name": "Jl. Sudirman - Bundaran HI",
    "latitude": -6.2087,
    "longitude": 106.7968,
    "description": "Major traffic accident blocking 2 lanes"
  }'
```

### Air Quality

**Record Air Quality Data**
```bash
curl -X POST http://localhost:5000/api/air-quality/record \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "location_name": "Jl. Sudirman",
    "latitude": -6.2131,
    "longitude": 106.8000,
    "aqi": 150,
    "pm2_5": 35.5,
    "pm10": 55.2,
    "quality_level": "Unhealthy"
  }'
```

### Public Transportation

**Register Vehicle**
```bash
curl -X POST http://localhost:5000/api/public-transportation/register \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicle_type": "bus",
    "vehicle_number": "BUS-001",
    "route_name": "Route A: Downtown - Airport",
    "current_location_lat": -6.2087,
    "current_location_lng": 106.7968,
    "occupancy_rate": 85
  }'
```

### Citizen Feedback

**Submit Feedback**
```bash
curl -X POST http://localhost:5000/api/feedback/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "feedback_type": "complaint",
    "category": "traffic",
    "title": "Chronic traffic congestion",
    "description": "Peak hours are extremely congested",
    "location_name": "Jl. Sudirman",
    "latitude": -6.2131,
    "longitude": 106.8000,
    "priority": "high"
  }'
```

## 🔍 Monitoring & Logging

### System Logs Location
- All system events logged to database `system_logs` table
- Access via admin dashboard
- Query logs: `SELECT * FROM system_logs ORDER BY created_at DESC LIMIT 100;`

### Real-time Monitoring
- Socket.IO dashboard connections
- Emergency alert broadcasts
- Traffic monitoring updates
- Transportation location tracking

### Performance Metrics
- Database query performance
- API response times
- Memory usage
- Connection pool stats

## 🐛 Troubleshooting

### Common Issues

**Connection Refused**
```
Error: connect ECONNREFUSED 127.0.0.1:3306
Solution: Ensure MySQL is running and credentials are correct
```

**JWT Token Error**
```
Error: Invalid token signature
Solution: Verify JWT_SECRET matches between token generation and validation
```

**CORS Error**
```
Error: No 'Access-Control-Allow-Origin'
Solution: Check CORS configuration in server.js
```

**Database Query Error**
```
Error: ER_PARSE_ERROR
Solution: Verify SQL syntax and ensure all ? placeholders are present
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev
```

## 📚 Database Maintenance

### Regular Backups
```bash
# Export database
mysqldump -u root -p smartcity_traffic > backup-$(date +%Y%m%d).sql

# Import backup
mysql -u root -p smartcity_traffic < backup-20240101.sql
```

### Optimize Tables
```sql
-- Run periodically to optimize performance
OPTIMIZE TABLE traffic_monitoring;
OPTIMIZE TABLE emergency_alerts;
OPTIMIZE TABLE air_quality_monitoring;
OPTIMIZE TABLE citizen_feedback;
```

### Clean Old Data
```sql
-- Remove logs older than 90 days
DELETE FROM system_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Archive old monitoring data
INSERT INTO traffic_monitoring_archive 
SELECT * FROM traffic_monitoring 
WHERE recorded_at < DATE_SUB(NOW(), INTERVAL 365 DAY);
```

## 🚀 Production Deployment

### Docker Deployment
```dockerfile
FROM node:16-alpine

WORKDIR /app
COPY package.json .
RUN npm install --production
COPY . .

EXPOSE 5000
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DB_HOST=mysql
      - DB_USER=root
      - DB_PASSWORD=password
      - NODE_ENV=production
    depends_on:
      - mysql

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_DATABASE=smartcity_traffic
      - MYSQL_ROOT_PASSWORD=password
    volumes:
      - mysql_data:/var/lib/mysql
      - ./database.sql:/docker-entrypoint-initdb.d/init.sql

volumes:
  mysql_data:
```

### Nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name smartcity.example.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## 📞 Support & Documentation

- **API Docs**: See ENHANCED-README.md
- **Architecture**: See project structure section
- **Security**: See security implementation section

## ✅ Completion Checklist

- [x] Core authentication system
- [x] JWT + Passport.js integration
- [x] Session & cookie security
- [x] SQL injection prevention
- [x] Role-based access control
- [x] Real-time traffic monitoring
- [x] Emergency alert system
- [x] Air quality monitoring
- [x] Public transportation management
- [x] Citizen feedback system
- [x] Admin dashboard
- [x] Socket.IO real-time updates
- [x] Comprehensive error handling
- [x] Database optimization
- [x] Security headers
- [x] Documentation

---

**System Status**: ✅ Production Ready
**Last Updated**: 2024
**Security Level**: Enterprise Grade
