-- Create database
CREATE DATABASE IF NOT EXISTS smartcity_traffic;
USE smartcity_traffic;

-- ========================================
-- Users Management Table (Enhanced RBAC)
-- ========================================
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(15),
  role ENUM('user', 'admin', 'superadmin') DEFAULT 'user',
  is_active TINYINT(1) DEFAULT 1,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Traffic Management Tables
-- ========================================
CREATE TABLE IF NOT EXISTS traffic_lights (
  id INT PRIMARY KEY AUTO_INCREMENT,
  intersection_name VARCHAR(100) NOT NULL UNIQUE,
  location VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  current_status ENUM('red', 'yellow', 'green') DEFAULT 'red',
  status_duration INT DEFAULT 30,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_intersection (intersection_name),
  INDEX idx_status (current_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS traffic_data (
  id INT PRIMARY KEY AUTO_INCREMENT,
  traffic_light_id INT NOT NULL,
  vehicle_count INT DEFAULT 0,
  average_speed DECIMAL(5, 2),
  congestion_level ENUM('low', 'medium', 'high') DEFAULT 'low',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (traffic_light_id) REFERENCES traffic_lights(id) ON DELETE CASCADE,
  INDEX idx_traffic_light (traffic_light_id),
  INDEX idx_created_at (created_at),
  INDEX idx_congestion (congestion_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS pedestrian_activity;
DROP TABLE IF EXISTS pedestrian_crossings;
CREATE TABLE pedestrian_crossings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  location_name VARCHAR(100) NOT NULL,
  street_name VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  current_signal ENUM('wait', 'walk') DEFAULT 'wait',
  wait_time_estimate INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_location (location_name),
  INDEX idx_street (street_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pedestrian_activity (
  id INT PRIMARY KEY AUTO_INCREMENT,
  crossing_id INT NOT NULL,
  pedestrian_count INT DEFAULT 0,
  wait_time INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (crossing_id) REFERENCES pedestrian_crossings(id) ON DELETE CASCADE,
  INDEX idx_crossing (crossing_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS incident_reports;
CREATE TABLE incident_reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  incident_type VARCHAR(50) NOT NULL,
  location VARCHAR(255) NOT NULL,
  severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  status ENUM('pending', 'processing', 'resolved', 'closed') DEFAULT 'pending',
  image_url VARCHAR(255),
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_severity (severity),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Smart City Feature 1: Real-time Traffic Monitoring
-- ========================================
DROP TABLE IF EXISTS traffic_monitoring;
CREATE TABLE traffic_monitoring (
  id INT PRIMARY KEY AUTO_INCREMENT,
  location_name VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  congestion_level ENUM('low', 'medium', 'high', 'critical') DEFAULT 'low',
  vehicle_count INT DEFAULT 0,
  average_speed DECIMAL(5, 2) DEFAULT 0,
  recorded_by INT NOT NULL,
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_location (location_name),
  INDEX idx_congestion (congestion_level),
  INDEX idx_recorded_at (recorded_at),
  INDEX idx_coordinates (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Smart City Feature 2: Emergency Alert System
-- ========================================
DROP TABLE IF EXISTS emergency_alerts;
CREATE TABLE emergency_alerts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  alert_type ENUM('accident', 'hazard', 'emergency_vehicle', 'air_quality', 'natural_disaster') NOT NULL,
  severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  location_name VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  description TEXT,
  status ENUM('active', 'resolved', 'cancelled') DEFAULT 'active',
  created_by INT NOT NULL,
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_alert_type (alert_type),
  INDEX idx_severity (severity),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  INDEX idx_coordinates (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Smart City Feature 3: Air Quality Monitoring
-- ========================================
DROP TABLE IF EXISTS air_quality_monitoring;
CREATE TABLE air_quality_monitoring (
  id INT PRIMARY KEY AUTO_INCREMENT,
  location_name VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  aqi INT NOT NULL COMMENT 'Air Quality Index (0-500)',
  pm2_5 DECIMAL(6, 2) COMMENT 'Particulate Matter 2.5 µg/m³',
  pm10 DECIMAL(6, 2) COMMENT 'Particulate Matter 10 µg/m³',
  o3 DECIMAL(6, 2) COMMENT 'Ozone ppb',
  no2 DECIMAL(6, 2) COMMENT 'Nitrogen Dioxide ppb',
  so2 DECIMAL(6, 2) COMMENT 'Sulfur Dioxide ppb',
  co DECIMAL(6, 2) COMMENT 'Carbon Monoxide ppm',
  quality_level ENUM('Good', 'Moderate', 'Unhealthy', 'Very Unhealthy', 'Hazardous') DEFAULT 'Moderate',
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_location (location_name),
  INDEX idx_quality_level (quality_level),
  INDEX idx_recorded_at (recorded_at),
  INDEX idx_aqi (aqi),
  INDEX idx_coordinates (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Smart City Feature 4: Public Transportation Management
-- ========================================
DROP TABLE IF EXISTS transportation_issues;
DROP TABLE IF EXISTS public_transportation;
CREATE TABLE public_transportation (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vehicle_type ENUM('bus', 'mrt', 'lrt', 'minibus', 'tram', 'taxi') NOT NULL,
  vehicle_number VARCHAR(50) UNIQUE NOT NULL,
  route_name VARCHAR(100) NOT NULL,
  current_location_lat DECIMAL(10, 8),
  current_location_lng DECIMAL(11, 8),
  occupancy_rate INT DEFAULT 0 COMMENT 'Persentase (0-100)',
  status ENUM('in_service', 'maintenance', 'waiting') DEFAULT 'in_service',
  operator_id INT NOT NULL,
  last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (operator_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_vehicle_type (vehicle_type),
  INDEX idx_vehicle_number (vehicle_number),
  INDEX idx_route (route_name),
  INDEX idx_status (status),
  INDEX idx_last_update (last_update),
  INDEX idx_coordinates (current_location_lat, current_location_lng)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE transportation_issues (
  id INT PRIMARY KEY AUTO_INCREMENT,
  transport_id INT NOT NULL,
  issue_type ENUM('delay', 'breakdown', 'accident', 'crowded', 'other') NOT NULL,
  description TEXT,
  reported_by INT NOT NULL,
  status ENUM('open', 'in_progress', 'resolved') DEFAULT 'open',
  reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  FOREIGN KEY (transport_id) REFERENCES public_transportation(id) ON DELETE CASCADE,
  FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_transport (transport_id),
  INDEX idx_issue_type (issue_type),
  INDEX idx_status (status),
  INDEX idx_reported_at (reported_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Smart City Feature 5: Citizen Feedback System
-- ========================================
DROP TABLE IF EXISTS feedback_responses;
DROP TABLE IF EXISTS citizen_feedback;
CREATE TABLE citizen_feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  feedback_type ENUM('complaint', 'suggestion', 'compliment', 'report') NOT NULL,
  category ENUM('traffic', 'transportation', 'air_quality', 'general') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location_name VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  submitted_by INT NOT NULL,
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  status ENUM('open', 'in_review', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  admin_notes TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_feedback_type (feedback_type),
  INDEX idx_category (category),
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_submitted_at (submitted_at),
  INDEX idx_submitted_by (submitted_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE feedback_responses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  feedback_id INT NOT NULL,
  response_text TEXT NOT NULL,
  responded_by INT NOT NULL,
  responded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (feedback_id) REFERENCES citizen_feedback(id) ON DELETE CASCADE,
  FOREIGN KEY (responded_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_feedback (feedback_id),
  INDEX idx_responded_at (responded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- System Audit & Logging
-- ========================================
CREATE TABLE IF NOT EXISTS system_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(50),
  resource_id INT,
  details JSON,
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at),
  INDEX idx_resource (resource_type, resource_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Session Management Table (untuk cookie-based sessions)
-- ========================================
CREATE TABLE IF NOT EXISTS sessions (
  session_id VARCHAR(128) PRIMARY KEY,
  user_id INT,
  data JSON,
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Performance Indexes
-- ========================================
CREATE INDEX idx_traffic_monitoring_datetime ON traffic_monitoring(location_name, recorded_at);
CREATE INDEX idx_air_quality_datetime ON air_quality_monitoring(location_name, recorded_at);
CREATE INDEX idx_alert_datetime ON emergency_alerts(alert_type, created_at);
CREATE INDEX idx_feedback_datetime ON citizen_feedback(submitted_by, submitted_at);

-- ========================================
-- Sample Data
-- ========================================

-- Sample Users (passwords are 'password' hashed with bcrypt)
INSERT INTO users (username, email, password, full_name, phone, role) VALUES
('superadmin', 'superadmin@smartcity.com', '$2a$12$cOGfbW1zCUWQdueYjk0GsuDX3Pcu18vq8YaMYU1gMV4MNmlwbVkYy', 'Super Admin User', '081234567890', 'superadmin'),
('admin', 'admin@smartcity.com', '$2a$12$cOGfbW1zCUWQdueYjk0GsuDX3Pcu18vq8YaMYU1gMV4MNmlwbVkYy', 'Admin User', '082345678901', 'admin'),
('operator', 'operator@smartcity.com', '$2a$12$cOGfbW1zCUWQdueYjk0GsuDX3Pcu18vq8YaMYU1gMV4MNmlwbVkYy', 'Operator User', '083456789012', 'user'),
('user1', 'user1@smartcity.com', '$2a$12$cOGfbW1zCUWQdueYjk0GsuDX3Pcu18vq8YaMYU1gMV4MNmlwbVkYy', 'Regular User', '084567890123', 'user');

-- Sample Traffic Lights
INSERT INTO traffic_lights (intersection_name, location, latitude, longitude, current_status, status_duration) VALUES
('Intersection HI - Sudirman', 'Jl. H.R Rasuna Said', -6.2087, 106.7968, 'red', 30),
('Intersection Semanggi', 'Jl. Jendral Sudirman', -6.2131, 106.8000, 'green', 45),
('Intersection Blok M', 'Jl. Melawai', -6.2755, 106.7958, 'red', 30),
('Intersection Bundaran HI', 'Jl. Gatot Subroto', -6.2093, 106.8010, 'yellow', 15);

-- Sample Pedestrian Crossings
INSERT INTO pedestrian_crossings (location_name, street_name, latitude, longitude, current_signal, wait_time_estimate) VALUES
('Zebra Crossing HI', 'Jl. H.R Rasuna Said', -6.2087, 106.7968, 'wait', 45),
('Zebra Crossing Semanggi', 'Jl. Jendral Sudirman', -6.2131, 106.8000, 'walk', 0),
('Zebra Crossing Blok M', 'Jl. Melawai', -6.2755, 106.7958, 'wait', 30),
('Zebra Crossing Bundaran', 'Jl. Gatot Subroto', -6.2093, 106.8010, 'walk', 0);

-- Sample Traffic Monitoring Data
INSERT INTO traffic_monitoring (location_name, latitude, longitude, congestion_level, vehicle_count, average_speed, recorded_by) VALUES
('Jl. H.R Rasuna Said', -6.2087, 106.7968, 'high', 245, 15.5, 1),
('Jl. Jendral Sudirman', -6.2131, 106.8000, 'medium', 180, 25.3, 1),
('Jl. Melawai', -6.2755, 106.7958, 'low', 95, 35.8, 1);

-- Sample Air Quality Data
INSERT INTO air_quality_monitoring (location_name, latitude, longitude, aqi, pm2_5, pm10, o3, no2, so2, co, quality_level) VALUES
('Jl. H.R Rasuna Said', -6.2087, 106.7968, 125, 28.5, 45.2, 25.3, 18.5, 12.3, 2.1, 'Unhealthy'),
('Jl. Jendral Sudirman', -6.2131, 106.8000, 85, 18.2, 32.1, 18.5, 12.1, 8.5, 1.5, 'Moderate'),
('Jl. Melawai', -6.2755, 106.7958, 55, 12.1, 20.5, 12.3, 8.2, 5.1, 0.8, 'Moderate');

-- Sample Public Transportation
INSERT INTO public_transportation (vehicle_type, vehicle_number, route_name, current_location_lat, current_location_lng, occupancy_rate, status, operator_id) VALUES
('bus', 'BUS-001', 'Route A: Downtown - Airport', -6.2087, 106.7968, 85, 'in_service', 3),
('mrt', 'MRT-005', 'Route B: North - South', -6.2131, 106.8000, 72, 'in_service', 3),
('bus', 'BUS-002', 'Route C: East - West', -6.2755, 106.7958, 65, 'in_service', 3),
('minibus', 'MB-010', 'Route D: City Circle', -6.2093, 106.8010, 90, 'in_service', 3);

