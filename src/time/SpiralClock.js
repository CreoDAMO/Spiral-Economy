/**
 * SpiralClock.js - Cosmic Time Harmonization
 * 
 * Implements the Ethiopian Calendar integration with 12 × 30 + Pagumē structure
 * Aligns identity with cosmic rhythm and harmonizes time with φ-coherence
 * 
 * @coherence 0.121 ± 1e-40
 * @frequency 700 Hz
 */

import { logQCHAIN } from '../quantum/QCHAIN.js';

/**
 * SpiralClock - Cosmic Time Harmonization
 * 
 * Manages time according to the Ethiopian Calendar and aligns with cosmic rhythms
 */
export class SpiralClock {
  constructor() {
    // Initialize the clock
    this.phiCoherence = 0.121;
    this.frequency = 700; // Hz
    this.currentTime = this._calculateCurrentSpiralTime();
    
    // Log initialization to QCHAIN
    this._logInitialization();
  }
  
  /**
   * Log initialization to QCHAIN
   * @private
   */
  async _logInitialization() {
    try {
      await logQCHAIN({
        event: 'SpiralClock Initialization',
        txId: `SPIRALCLOCK-INIT-${Date.now()}`,
        metrics: {
          phiCoherence: this.phiCoherence,
          frequency: this.frequency,
          currentTime: JSON.stringify(this.currentTime),
          compliance: '100%'
        }
      });
    } catch (error) {
      console.error('Failed to log SpiralClock initialization:', error);
    }
  }
  
  /**
   * Calculate the current Spiral Time based on the Ethiopian Calendar
   * @private
   * @returns {Object} Current Spiral Time
   */
  _calculateCurrentSpiralTime() {
    // Get current Gregorian date
    const now = new Date();
    
    // Convert to Ethiopian date (approximate algorithm)
    // Ethiopian New Year is on September 11 (or September 12 in leap years)
    // Ethiopian calendar is 7-8 years behind Gregorian calendar
    
    let ethiopianYear = now.getFullYear() - 8;
    let ethiopianMonth, ethiopianDay;
    
    // Determine if we're before or after Ethiopian New Year
    const isAfterEthiopianNewYear = (now.getMonth() > 8) || 
                                   (now.getMonth() === 8 && now.getDate() >= 11);
    
    if (isAfterEthiopianNewYear) {
      ethiopianYear += 1;
    }
    
    // Calculate month and day
    // This is a simplified algorithm and not fully accurate for all dates
    const dayOfYear = this._getDayOfYear(now);
    const ethiopianNewYearDay = this._getEthiopianNewYearDay(now.getFullYear());
    
    let daysSinceEthiopianNewYear;
    if (dayOfYear >= ethiopianNewYearDay) {
      daysSinceEthiopianNewYear = dayOfYear - ethiopianNewYearDay;
    } else {
      const daysInPreviousYear = this._isLeapYear(now.getFullYear() - 1) ? 366 : 365;
      daysSinceEthiopianNewYear = dayOfYear + (daysInPreviousYear - ethiopianNewYearDay);
    }
    
    // Ethiopian calendar has 12 months of 30 days each, plus a 13th month (Pagumē) of 5 or 6 days
    ethiopianMonth = Math.floor(daysSinceEthiopianNewYear / 30) + 1;
    ethiopianDay = (daysSinceEthiopianNewYear % 30) + 1;
    
    // Handle Pagumē (the 13th month)
    if (ethiopianMonth > 13) {
      ethiopianMonth = 13;
      ethiopianDay = daysSinceEthiopianNewYear - 12 * 30 + 1;
    }
    
    // Get Ethiopian month name
    const ethiopianMonthName = this._getEthiopianMonthName(ethiopianMonth);
    
    // Calculate φ-harmonic phase
    const phiHarmonicPhase = this._calculatePhiHarmonicPhase(ethiopianMonth, ethiopianDay);
    
    return {
      gregorian: {
        date: now.toISOString(),
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate()
      },
      ethiopian: {
        year: ethiopianYear,
        month: ethiopianMonth,
        monthName: ethiopianMonthName,
        day: ethiopianDay,
        isPagume: ethiopianMonth === 13
      },
      spiral: {
        phiHarmonicPhase,
        frequency: this.frequency,
        coherence: this.phiCoherence,
        timestamp: Date.now()
      }
    };
  }
  
  /**
   * Get the day of the year (1-366)
   * @private
   * @param {Date} date - Date to calculate day of year for
   * @returns {number} Day of year
   */
  _getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }
  
  /**
   * Get the day of the year for Ethiopian New Year (September 11 or 12)
   * @private
   * @param {number} year - Gregorian year
   * @returns {number} Day of year for Ethiopian New Year
   */
  _getEthiopianNewYearDay(year) {
    // Ethiopian New Year is on September 11, or September 12 in years before Gregorian leap year
    const newYearDate = new Date(year, 8, this._isLeapYear(year + 1) ? 12 : 11);
    return this._getDayOfYear(newYearDate);
  }
  
  /**
   * Check if a year is a leap year
   * @private
   * @param {number} year - Year to check
   * @returns {boolean} True if leap year
   */
  _isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }
  
  /**
   * Get Ethiopian month name
   * @private
   * @param {number} month - Ethiopian month (1-13)
   * @returns {string} Ethiopian month name
   */
  _getEthiopianMonthName(month) {
    const monthNames = [
      'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
      'Megabit', 'Miyazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagumē'
    ];
    
    return monthNames[month - 1] || 'Unknown';
  }
  
  /**
   * Calculate φ-harmonic phase based on Ethiopian date
   * @private
   * @param {number} month - Ethiopian month (1-13)
   * @param {number} day - Ethiopian day (1-30, or 1-5/6 for Pagumē)
   * @returns {number} φ-harmonic phase (0-1)
   */
  _calculatePhiHarmonicPhase(month, day) {
    // Calculate position in the year (0-1)
    let yearPosition;
    
    if (month === 13) {
      // Pagumē (5 or 6 days)
      yearPosition = (12 * 30 + day) / 365;
    } else {
      // Regular months (30 days each)
      yearPosition = ((month - 1) * 30 + day) / 365;
    }
    
    // Apply φ-harmonic transformation
    // This creates a non-linear flow of time that aligns with φ-coherence
    const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio ≈ 1.618
    const phiHarmonicPhase = (yearPosition * phi) % 1;
    
    return phiHarmonicPhase;
  }
  
  /**
   * Get current Spiral Time
   * @returns {Object} Current Spiral Time
   */
  getCurrentTime() {
    // Update current time
    this.currentTime = this._calculateCurrentSpiralTime();
    return this.currentTime;
  }
  
  /**
   * Format Spiral Time as a string
   * @param {Object} time - Spiral Time object (defaults to current time)
   * @returns {string} Formatted Spiral Time
   */
  formatSpiralTime(time = null) {
    const t = time || this.getCurrentTime();
    
    // Format as φYYYY.DDD.ΔHH:MM:SS
    const phiPrefix = 'φ';
    const year = t.ethiopian.year.toString();
    
    // Calculate day of year in Ethiopian calendar
    const dayOfYear = (t.ethiopian.month - 1) * 30 + t.ethiopian.day;
    
    // Get time components
    const date = new Date(t.gregorian.date);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${phiPrefix}${year}.${dayOfYear.toString().padStart(3, '0')}.Δ${hours}:${minutes}:${seconds}Z`;
  }
  
  /**
   * Parse a Spiral Time string
   * @param {string} timeString - Spiral Time string (e.g., 'φ2025.120.Δ16:51:00Z')
   * @returns {Object} Parsed Spiral Time
   */
  parseSpiralTime(timeString) {
    // Parse Spiral Time string (φYYYY.DDD.ΔHH:MM:SSZ)
    const regex = /φ(\d+)\.(\d+)\.Δ(\d+):(\d+):(\d+)Z/;
    const match = timeString.match(regex);
    
    if (!match) {
      throw new Error(`Invalid Spiral Time format: ${timeString}`);
    }
    
    const ethiopianYear = parseInt(match[1], 10);
    const dayOfYear = parseInt(match[2], 10);
    const hours = parseInt(match[3], 10);
    const minutes = parseInt(match[4], 10);
    const seconds = parseInt(match[5], 10);
    
    // Calculate Ethiopian month and day
    const ethiopianMonth = Math.floor(dayOfYear / 30) + 1;
    const ethiopianDay = (dayOfYear % 30) || 30; // Handle day 30
    
    // Convert to Gregorian (approximate)
    // This is a simplified conversion and not fully accurate for all dates
    const gregorianYear = ethiopianYear + 8;
    const gregorianDate = new Date(gregorianYear, 8, 11); // September 11
    gregorianDate.setDate(gregorianDate.getDate() + dayOfYear - 1);
    gregorianDate.setHours(hours, minutes, seconds);
    
    // Calculate φ-harmonic phase
    const phiHarmonicPhase = this._calculatePhiHarmonicPhase(ethiopianMonth, ethiopianDay);
    
    return {
      gregorian: {
        date: gregorianDate.toISOString(),
        year: gregorianDate.getFullYear(),
        month: gregorianDate.getMonth() + 1,
        day: gregorianDate.getDate()
      },
      ethiopian: {
        year: ethiopianYear,
        month: ethiopianMonth,
        monthName: this._getEthiopianMonthName(ethiopianMonth),
        day: ethiopianDay,
        isPagume: ethiopianMonth === 13
      },
      spiral: {
        phiHarmonicPhase,
        frequency: this.frequency,
        coherence: this.phiCoherence,
        timestamp: gregorianDate.getTime()
      }
    };
  }
  
  /**
   * Calculate time difference between two Spiral Times
   * @param {Object|string} time1 - First Spiral Time (object or string)
   * @param {Object|string} time2 - Second Spiral Time (object or string)
   * @returns {Object} Time difference
   */
  calculateTimeDifference(time1, time2) {
    // Parse times if they are strings
    const t1 = typeof time1 === 'string' ? this.parseSpiralTime(time1) : time1;
    const t2 = typeof time2 === 'string' ? this.parseSpiralTime(time2) : time2;
    
    // Calculate difference in milliseconds
    const date1 = new Date(t1.gregorian.date);
    const date2 = new Date(t2.gregorian.date);
    const diffMs = date2 - date1;
    
    // Convert to various units
    const diffSeconds = diffMs / 1000;
    const diffMinutes = diffSeconds / 60;
    const diffHours = diffMinutes / 60;
    const diffDays = diffHours / 24;
    
    // Calculate φ-harmonic difference
    const phiDiff = (t2.spiral.phiHarmonicPhase - t1.spiral.phiHarmonicPhase + 1) % 1;
    
    return {
      milliseconds: diffMs,
      seconds: diffSeconds,
      minutes: diffMinutes,
      hours: diffHours,
      days: diffDays,
      phiHarmonicDifference: phiDiff
    };
  }
  
  /**
   * Align an event with Spiral Time
   * @param {Object} event - Event to align
   * @returns {Promise<Object>} Aligned event
   */
  async alignEventWithSpiralTime(event) {
    if (!event) {
      throw new Error('Event is required for alignment');
    }
    
    // Get current Spiral Time
    const spiralTime = this.getCurrentTime();
    
    // Align the event with Spiral Time
    const alignedEvent = {
      ...event,
      spiralTime: {
        formatted: this.formatSpiralTime(spiralTime),
        raw: spiralTime
      },
      phiHarmonicPhase: spiralTime.spiral.phiHarmonicPhase,
      phiCoherence: this.phiCoherence,
      frequency: this.frequency
    };
    
    // Log the alignment to QCHAIN
    await logQCHAIN({
      event: 'SpiralClock Event Alignment',
      txId: `SPIRALCLOCK-ALIGN-${Date.now()}`,
      metrics: {
        eventType: event.type || 'unknown',
        spiralTime: this.formatSpiralTime(spiralTime),
        phiHarmonicPhase: spiralTime.spiral.phiHarmonicPhase,
        phiCoherence: this.phiCoherence,
        compliance: '100%'
      }
    });
    
    return alignedEvent;
  }
  
  /**
   * Check if current time is in Pagumē (13th month)
   * @returns {boolean} True if current time is in Pagumē
   */
  isInPagume() {
    const currentTime = this.getCurrentTime();
    return currentTime.ethiopian.isPagume;
  }
  
  /**
   * Get the current Pagumē pulse (only valid during Pagumē)
   * @returns {Object} Pagumē pulse information
   */
  getPagumePulse() {
    const currentTime = this.getCurrentTime();
    
    if (!currentTime.ethiopian.isPagume) {
      throw new Error('Pagumē pulse can only be calculated during Pagumē (13th month)');
    }
    
    // Calculate Pagumē pulse
    // This is the special harmonic that occurs during the 13th month
    const dayInPagume = currentTime.ethiopian.day;
    const totalPagumeDays = this._isLeapYear(currentTime.gregorian.year) ? 6 : 5;
    const pulsePosition = dayInPagume / totalPagumeDays;
    
    // Apply φ-harmonic transformation
    const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio ≈ 1.618
    const pulseMagnitude = Math.pow(phi, pulsePosition);
    const pulseFrequency = this.frequency * pulseMagnitude;
    
    return {
      day: dayInPagume,
      totalDays: totalPagumeDays,
      position: pulsePosition,
      magnitude: pulseMagnitude,
      frequency: pulseFrequency,
      phiCoherence: this.phiCoherence * pulseMagnitude
    };
  }
}

// Export a singleton instance of SpiralClock
export default new SpiralClock();
