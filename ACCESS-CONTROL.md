# Smart City Traffic Management System - Role-Based Access Control (RBAC)

## Overview

Sistem implementasi RBAC (Role-Based Access Control) yang jelas dengan 3 tingkat user role untuk memastikan semua fitur dapat diakses dengan aman dan terstruktur.

---

## 🔐 User Roles & Permissions

### 1. **SUPERADMIN** - Full System Control
**Access Level**: Complete

#### Dashboard Features Accessible:
- ✅ Main Dashboard (Overview)
- ✅ Traffic Light Management
- ✅ Pedestrian Crossing Management
- ✅ Incident Management
- ✅ Emergency Alerts Management (Create & View)
- ✅ Air Quality Monitoring (View & Manage)
- ✅ Public Transportation Management (Register & Monitor)
- ✅ Citizen Feedback Management (View & Respond)
- ✅ Analytics & Reporting (Full Access)
- ✅ User Management (CRUD Operations)

#### API Endpoints Accessible:
```
Admin Endpoints (All):
POST   /api/traffic-lights - Create traffic light
GET    /api/traffic-lights - View all traffic lights
PUT    /api/traffic-lights/:id - Update traffic light
DELETE /api/traffic-lights/:id - Delete traffic light

POST   /api/pedestrians - Create crossing
GET    /api/pedestrians - View crossings
PUT    /api/pedestrians/:id - Update crossing
DELETE /api/pedestrians/:id - Delete crossing

GET    /api/incidents - View incidents
POST   /api/incidents - Create incident
PUT    /api/incidents/:id - Update incident

GET    /api/emergency-alerts/admin/critical - View critical alerts
POST   /api/emergency-alerts/create - Create alert
PUT    /api/emergency-alerts/:id/status - Update alert status

GET    /api/air-quality/admin/report - Generate reports
GET    /api/air-quality/admin/correlation - Traffic correlation

GET    /api/public-transportation/admin/issues - Manage issues
POST   /api/public-transportation/register - Register vehicles

GET    /api/feedback/admin/open - View open tickets
GET    /api/feedback/admin/high-priority - Priority feedback
PUT    /api/feedback/:id/status - Update feedback status
POST   /api/feedback/:id/response - Admin response

GET    /api/auth/users - User management
POST   /api/auth/users - Create user
PUT    /api/auth/users/:id - Update user
DELETE /api/auth/users/:id - Delete user
```

---

### 2. **ADMIN** - Management & Monitoring

**Access Level**: Operational Control (No User Management)

#### Dashboard Features Accessible:
- ✅ Main Dashboard (Overview)
- ✅ Traffic Light Management (View & Control)
- ✅ Pedestrian Crossing Management (View & Control)
- ✅ Incident Management (View & Update)
- ✅ Emergency Alerts Management (Create & Respond)
- ✅ Air Quality Monitoring (View & Analyze)
- ✅ Public Transportation Management (Monitor & Issue Tracking)
- ✅ Citizen Feedback Management (View & Respond)
- ✅ Analytics & Reporting (View Reports)
- ❌ User Management (No Access)

#### API Endpoints Accessible:
```
Management Endpoints (No User Management):
GET    /api/traffic-lights - View traffic lights
PUT    /api/traffic-lights/:id - Update status
POST   /api/traffic-lights/:id/optimize - Optimize signal

GET    /api/pedestrians - View crossings
PUT    /api/pedestrians/:id - Update crossing

GET    /api/incidents - View incidents
PUT    /api/incidents/:id - Update incident status

GET    /api/emergency-alerts/active - Active alerts
POST   /api/emergency-alerts/create - Create alert
PUT    /api/emergency-alerts/:id/status - Update status
GET    /api/emergency-alerts/admin/critical - Critical alerts

GET    /api/air-quality/latest - Current data
GET    /api/air-quality/unhealthy - Problem areas
GET    /api/air-quality/admin/correlation - Analysis

GET    /api/public-transportation/active - Active vehicles
GET    /api/public-transportation/admin/issues - Issues
POST   /api/public-transportation/report-issue - Report issue

GET    /api/feedback - All feedback
GET    /api/feedback/admin/open - Open tickets
GET    /api/feedback/admin/high-priority - Priority items
PUT    /api/feedback/:id/status - Update status
POST   /api/feedback/:id/response - Send response

❌ /api/auth/users - NO USER MANAGEMENT
```

---

### 3. **USER** - View & Report Only

**Access Level**: Read-Only + Submit Reports

#### Dashboard Features Accessible:
- ✅ Main Dashboard (Overview)
- ✅ Live Traffic Monitoring (View)
- ✅ Emergency Alerts (View Only)
- ✅ Air Quality Data (View)
- ✅ Public Transportation Info (View)
- ✅ Citizen Feedback (Submit & View Own)
- ✅ Analytics (View Reports)
- ❌ Traffic Light Control (No Access)
- ❌ Incident Management (No Access)
- ❌ User Management (No Access)

#### API Endpoints Accessible:
```
User Endpoints (Read-Only + Submit):
GET    /api/traffic-lights - View only
GET    /api/pedestrians - View only

GET    /api/incidents - View public incidents
POST   /api/incidents - Can report new incident

GET    /api/emergency-alerts/active - View active alerts
GET    /api/emergency-alerts/near - Get alerts near location

GET    /api/air-quality/latest - Current data
GET    /api/air-quality/unhealthy - Problem areas

GET    /api/public-transportation/active - View vehicles
GET    /api/public-transportation/near - Nearby vehicles
POST   /api/public-transportation/report-issue - Report issue

GET    /api/feedback - View own feedback
GET    /api/feedback/user/:userId - Own feedback history
POST   /api/feedback/submit - Submit feedback

❌ All /api/admin/* endpoints
❌ All /api/auth/users endpoints
```

---

## 🎯 Feature Access Matrix

| Feature | SuperAdmin | Admin | User |
|---------|:----------:|:-----:|:----:|
| Dashboard | ✅ | ✅ | ✅ |
| Traffic Light Control | ✅ | ✅ | ❌ |
| Traffic Light View | ✅ | ✅ | ✅ |
| Pedestrian Management | ✅ | ✅ | ❌ |
| Pedestrian View | ✅ | ✅ | ✅ |
| Incident Management | ✅ | ✅ | ❌ |
| Incident Report | ✅ | ✅ | ✅ |
| Emergency Alert Create | ✅ | ✅ | ❌ |
| Emergency Alert View | ✅ | ✅ | ✅ |
| Air Quality Admin | ✅ | ✅ | ❌ |
| Air Quality View | ✅ | ✅ | ✅ |
| Transportation Admin | ✅ | ✅ | ❌ |
| Transportation View | ✅ | ✅ | ✅ |
| Feedback Respond | ✅ | ✅ | ❌ |
| Feedback Submit | ✅ | ✅ | ✅ |
| Analytics Full | ✅ | ✅ | ✅ |
| User Management | ✅ | ❌ | ❌ |

---

## 🔑 Implementation Details

### Frontend Access Control (dashboard.html)

1. **Navigation Menu**
   - Admin Menu (visible only to SuperAdmin/Admin)
   - Features Menu (visible to all authenticated users)
   - User Profile Menu (visible to all)

2. **Feature Tabs**
   - Emergency Alerts: Visible to all, but create button only for Admin+
   - Air Quality: Visible to all, but admin features for Admin+
   - Transportation: Visible to all, but register button only for Admin+
   - Feedback: Visible to all, with respond feature for Admin+
   - User Management: Only visible to SuperAdmin

### Backend Access Control (middleware)

```javascript
// Applied to all protected routes:

1. authenticateJWT() - Verifies token is valid
   - Used: All routes requiring authentication

2. authorize(['admin']) - Checks user role
   - Used: /api/*/admin/*, management endpoints
   
3. authorize(['user', 'admin', 'superadmin']) - Public user features
   - Used: /api/*/submit, /api/*/report
```

---

## 📋 Example Use Cases

### Scenario 1: Traffic Congestion Alert
1. **User**: Uses app to report incident → Posted to system
2. **Admin**: Reviews incident → Updates status, creates emergency alert
3. **SuperAdmin**: Monitors all alerts → Can override any admin decision

### Scenario 2: Air Quality Issue
1. **System**: Detects unhealthy air quality level
2. **Admin**: Views on dashboard → Can respond to citizens
3. **User**: Sees air quality data → Can submit health-related feedback
4. **SuperAdmin**: Reviews trends → Generates reports

### Scenario 3: Public Feedback
1. **User**: Submits citizen feedback
2. **Admin**: Reviews feedback → Responds and updates status
3. **SuperAdmin**: Monitors feedback system → Can escalate issues

---

## 🛡️ Security Mechanisms

### 1. Token-Based Authentication
- JWT tokens expire after 7 days
- Tokens include user role in payload
- Backend verifies role on every request

### 2. Middleware Protection
- All sensitive endpoints use `authenticateJWT` middleware
- Role-based endpoints use `authorize` middleware
- Admin-only endpoints checked before execution

### 3. SQL Injection Prevention
- All queries use parameterized statements
- DatabaseUtil provides safe query builders
- No string concatenation in queries

### 4. Data Isolation
- Users see only appropriate data
- Feedback queries filtered by user_id for regular users
- Admin routes explicitly checked before access

---

## 🚀 Access Testing Checklist

### For SuperAdmin Role:
- [ ] Can access admin menu
- [ ] Can create/edit/delete traffic lights
- [ ] Can manage users
- [ ] Can view all analytics reports
- [ ] Can create emergency alerts

### For Admin Role:
- [ ] Can access admin menu (traffic, incidents)
- [ ] Cannot access user management
- [ ] Can create emergency alerts
- [ ] Can respond to feedback
- [ ] Can view all analytics

### For User Role:
- [ ] Cannot see admin menu
- [ ] Can only view traffic/incident data
- [ ] Can submit feedback
- [ ] Can report incidents
- [ ] Can see emergency alerts

---

## 📞 Roles Assignment

### How to Assign Roles:
```bash
# Via API (SuperAdmin only)
POST /api/auth/users
{
  "username": "admin_user",
  "email": "admin@example.com",
  "password": "secure_password",
  "full_name": "Admin Name",
  "role": "admin"  # or "user", "superadmin"
}

# Roles available: "user", "admin", "superadmin"
```

### Default Test Accounts:
Check database.sql or setup-db.js for seeded test accounts with different roles.

---

## 📈 Performance Considerations

- Role checking performed at middleware level (fast)
- Endpoint access restrictions prevent unnecessary data processing
- Frontend navigation updates prevent unauthorized UI access
- All audit trails logged for compliance

---

## 🔄 Future Enhancements

1. **Fine-grained Permissions**
   - Per-feature role assignments
   - Custom permission bundles

2. **Time-based Access**
   - Restrict admin access during certain hours
   - Scheduled role escalation

3. **Department-based RBAC**
   - Traffic department staff
   - Environmental monitoring team
   - Public relations staff

4. **Audit Logging**
   - Track all admin actions
   - Generate compliance reports
   - Access attempt logs

