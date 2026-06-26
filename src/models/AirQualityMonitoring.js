const BaseModel = require('./BaseModel');
const DatabaseUtil = require('../utils/database.util');

/**
 * Air Quality Monitoring Model
 * Melacak kualitas udara di berbagai lokasi kota
 */
class AirQualityMonitoring extends BaseModel {
  constructor() {
    super('air_quality_monitoring');
  }

  /**
   * Record air quality data
   */
  async recordAirQualityData(data) {
    const {
      location_name,
      latitude,
      longitude,
      aqi, // Air Quality Index (0-500)
      pm2_5, // Particulate Matter 2.5 µg/m³
      pm10, // Particulate Matter 10 µg/m³
      o3, // Ozone ppb
      no2, // Nitrogen Dioxide ppb
      so2, // Sulfur Dioxide ppb
      co, // Carbon Monoxide ppm
      quality_level // Good, Moderate, Unhealthy, Very Unhealthy, Hazardous
    } = data;

    const insertData = {
      location_name,
      latitude,
      longitude,
      aqi,
      pm2_5,
      pm10,
      o3,
      no2,
      so2,
      co,
      quality_level,
      recorded_at: new Date()
    };

    const { fields, placeholders, params } = DatabaseUtil.buildInsertClause(insertData);
    const query = `INSERT INTO ${this.tableName} (${fields}) VALUES (${placeholders})`;
    
    return await DatabaseUtil.executeInsert(query, params);
  }

  /**
   * Get latest air quality for all locations
   */
  async getLatestAirQuality() {
    const query = `
      SELECT 
        location_name,
        latitude,
        longitude,
        aqi,
        pm2_5,
        pm10,
        o3,
        no2,
        so2,
        co,
        quality_level,
        recorded_at
      FROM ${this.tableName}
      WHERE recorded_at = (
        SELECT MAX(recorded_at) FROM ${this.tableName} t2 
        WHERE t2.location_name = ${this.tableName}.location_name
      )
      ORDER BY location_name
    `;
    return await DatabaseUtil.executeSelect(query);
  }

  /**
   * Get unhealthy air quality locations
   */
  async getUnhealthyLocations() {
    const query = `
      SELECT 
        location_name,
        latitude,
        longitude,
        aqi,
        quality_level,
        pm2_5,
        recorded_at
      FROM ${this.tableName}
      WHERE quality_level IN ('Unhealthy', 'Very Unhealthy', 'Hazardous')
      AND recorded_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      ORDER BY aqi DESC
      LIMIT 20
    `;
    return await DatabaseUtil.executeSelect(query);
  }

  /**
   * Get air quality trend untuk lokasi
   */
  async getAirQualityTrend(locationName, days = 7) {
    const query = `
      SELECT 
        DATE(recorded_at) as date,
        AVG(aqi) as avg_aqi,
        MAX(aqi) as max_aqi,
        MIN(aqi) as min_aqi,
        AVG(pm2_5) as avg_pm2_5,
        AVG(pm10) as avg_pm10
      FROM ${this.tableName}
      WHERE location_name = ?
      AND recorded_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(recorded_at)
      ORDER BY date DESC
    `;
    return await DatabaseUtil.executeSelect(query, [locationName, days]);
  }

  /**
   * Analyze correlation antara traffic dan air quality
   */
  async analyzeTrafficAirCorrelation(days = 7) {
    const query = `
      SELECT 
        aqm.location_name,
        AVG(aqm.aqi) as avg_aqi,
        AVG(tm.vehicle_count) as avg_vehicles,
        CORR(aqm.aqi, tm.vehicle_count) as correlation
      FROM ${this.tableName} aqm
      LEFT JOIN traffic_monitoring tm 
        ON aqm.location_name = tm.location_name 
        AND DATE(aqm.recorded_at) = DATE(tm.recorded_at)
      WHERE aqm.recorded_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY aqm.location_name
      HAVING correlation IS NOT NULL
      ORDER BY correlation DESC
    `;
    return await DatabaseUtil.executeSelect(query, [days]);
  }

  /**
   * Get air quality statistics
   */
  async getAirQualityStatistics(days = 30) {
    const query = `
      SELECT 
        COUNT(DISTINCT location_name) as monitored_locations,
        AVG(aqi) as average_aqi,
        MAX(aqi) as max_aqi,
        MIN(aqi) as min_aqi,
        SUM(CASE WHEN quality_level = 'Good' THEN 1 ELSE 0 END) as good_readings,
        SUM(CASE WHEN quality_level = 'Moderate' THEN 1 ELSE 0 END) as moderate_readings,
        SUM(CASE WHEN quality_level IN ('Unhealthy', 'Very Unhealthy', 'Hazardous') THEN 1 ELSE 0 END) as unhealthy_readings
      FROM ${this.tableName}
      WHERE recorded_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `;
    return await DatabaseUtil.executeSelect(query, [days]);
  }

  /**
   * Trigger alert untuk lokasi dengan air quality buruk
   */
  async checkAndCreateAlerts() {
    const unhealthyLocations = await this.getUnhealthyLocations();
    const alerts = [];

    for (const location of unhealthyLocations) {
      // Check jika sudah ada alert untuk lokasi ini
      const existingAlert = await DatabaseUtil.executeSelectOne(`
        SELECT id FROM emergency_alerts 
        WHERE alert_type = 'air_quality'
        AND location_name = ?
        AND status = 'active'
        AND created_at >= DATE_SUB(NOW(), INTERVAL 6 HOUR)
      `, [location.location_name]);

      if (!existingAlert) {
        const alertData = {
          alert_type: 'air_quality',
          severity: location.aqi > 400 ? 'critical' : 'high',
          location_name: location.location_name,
          latitude: location.latitude,
          longitude: location.longitude,
          description: `Air Quality Alert: AQI ${location.aqi} (${location.quality_level})`,
          status: 'active',
          created_by: 1, // System alert
          created_at: new Date(),
          updated_at: new Date()
        };

        const { fields, placeholders, params } = DatabaseUtil.buildInsertClause(alertData);
        const query = `INSERT INTO emergency_alerts (${fields}) VALUES (${placeholders})`;
        const result = await DatabaseUtil.executeInsert(query, params);
        alerts.push(result);
      }
    }

    return alerts;
  }
}

module.exports = AirQualityMonitoring;
