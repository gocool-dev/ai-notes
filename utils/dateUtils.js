/**
 * Format a date object or timestamp to a readable string
 * @param {Date|string|number} date - Date to format
 * @param {string} format - Format type: 'relative', 'time', 'date', 'datetime' (default: 'relative')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'relative') => {
    if (!date) return 'Unknown date';
    
    // Convert to Date object if string or number
    const dateObj = typeof date === 'string' || typeof date === 'number'
      ? new Date(date)
      : date;
    
    // Check if valid date
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    
    // Format based on requested format
    switch (format) {
      case 'relative':
        return getRelativeTimeString(dateObj);
        
      case 'time':
        return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
      case 'date':
        return dateObj.toLocaleDateString([], { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
        
      case 'datetime':
        return dateObj.toLocaleString([], {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
      default:
        return dateObj.toLocaleString();
    }
  };
  
  /**
   * Get a relative time string (e.g., "2 hours ago", "Yesterday", "Last week")
   * @param {Date} date - Date to compare to now
   * @returns {string} Relative time string
   */
  const getRelativeTimeString = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    
    // Future dates
    if (diffMs < 0) {
      return formatDate(date, 'datetime');
    }
    
    // Within the last minute
    if (diffMin < 1) {
      return 'Just now';
    }
    
    // Within the last hour
    if (diffHr < 1) {
      return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    // Within the last day
    if (diffDays < 1) {
      return `${diffHr} ${diffHr === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // Yesterday
    if (diffDays === 1) {
      return 'Yesterday';
    }
    
    // Within the last week
    if (diffWeeks < 1) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }
    
    // Within the last month
    if (diffMonths < 1) {
      return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
    }
    
    // Within the last year
    if (diffYears < 1) {
      return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
    }
    
    // More than a year ago
    return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
  };
  
  /**
   * Format a date in ISO format (YYYY-MM-DD)
   * @param {Date|string|number} date - Date to format
   * @returns {string} ISO formatted date
   */
  export const formatIsoDate = (date) => {
    const dateObj = typeof date === 'string' || typeof date === 'number'
      ? new Date(date)
      : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return dateObj.toISOString().split('T')[0];
  };
  
  /**
   * Check if a date is today
   * @param {Date|string|number} date - Date to check
   * @returns {boolean} True if date is today
   */
  export const isToday = (date) => {
    const dateObj = typeof date === 'string' || typeof date === 'number'
      ? new Date(date)
      : date;
    
    const today = new Date();
    return (
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear()
    );
  };
  
  /**
   * Add specified number of days to a date
   * @param {Date} date - Starting date
   * @param {number} days - Number of days to add
   * @returns {Date} New date with days added
   */
  export const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };