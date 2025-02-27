/**
 * Truncate a string to a specified length and add ellipsis if needed
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length of returned string including ellipsis
 * @returns {string} Truncated string
 */
export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    
    if (text.length <= maxLength) {
      return text;
    }
    
    return text.substring(0, maxLength - 3) + '...';
  };
  
  /**
   * Extract hashtags from text
   * @param {string} text - Text to extract hashtags from
   * @returns {string[]} Array of hashtags (without # symbol)
   */
  export const extractHashtags = (text) => {
    if (!text) return [];
    
    // Match hashtags (word characters following a # character)
    const matches = text.match(/#(\w+)/g) || [];
    
    // Remove # symbol and return unique tags
    return [...new Set(matches.map(tag => tag.substring(1)))];
  };
  
  /**
   * Count words in text
   * @param {string} text - Text to count words in
   * @returns {number} Word count
   */
  export const countWords = (text) => {
    if (!text) return 0;
    
    // Split by whitespace and filter out empty strings
    const words = text.trim().split(/\s+/).filter(Boolean);
    return words.length;
  };
  
  /**
   * Count characters in text
   * @param {string} text - Text to count characters in
   * @param {boolean} includeSpaces - Whether to include whitespace in the count
   * @returns {number} Character count
   */
  export const countCharacters = (text, includeSpaces = true) => {
    if (!text) return 0;
    
    return includeSpaces ? text.length : text.replace(/\s/g, '').length;
  };
  
  /**
   * Detect the language of the text (very simple implementation)
   * @param {string} text - Text to detect language of
   * @returns {string} Detected language code
   */
  export const detectLanguage = (text) => {
    if (!text || text.length < 10) return 'unknown';
    
    // This is a very simplistic approach based on character frequency
    // In a real app, you should use a proper language detection library
    
    // Count character frequencies
    const charFreq = {};
    const normalizedText = text.toLowerCase();
    
    for (let i = 0; i < normalizedText.length; i++) {
      const char = normalizedText[i];
      if (/[a-z]/.test(char)) {
        charFreq[char] = (charFreq[char] || 0) + 1;
      }
    }
    
    // Check for presence of characteristic letters in different languages
    const hasSpanishChars = /[áéíóúñ]/.test(normalizedText);
    const hasFrenchChars = /[àâçéèêëîïôùûü]/.test(normalizedText);
    const hasGermanChars = /[äöüß]/.test(normalizedText);
    
    if (hasSpanishChars) return 'es';
    if (hasFrenchChars) return 'fr';
    if (hasGermanChars) return 'de';
    
    // Default to English
    return 'en';
  };
  
  /**
   * Extract email addresses from text
   * @param {string} text - Text to extract emails from
   * @returns {string[]} Array of email addresses
   */
  export const extractEmails = (text) => {
    if (!text) return [];
    
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
    return text.match(emailRegex) || [];
  };
  
  /**
   * Extract phone numbers from text (simple implementation)
   * @param {string} text - Text to extract phone numbers from
   * @returns {string[]} Array of phone numbers
   */
  export const extractPhoneNumbers = (text) => {
    if (!text) return [];
    
    // This is a simplified regex for phone numbers
    const phoneRegex = /(\+\d{1,3}[\s.-]?)?(\(\d{1,4}\)[\s.-]?)?\d{3}[\s.-]?\d{3}[\s.-]?\d{4}/g;
    return text.match(phoneRegex) || [];
  };
  
  /**
   * Calculate estimated reading time
   * @param {string} text - Text to calculate reading time for
   * @param {number} wpm - Words per minute reading speed (default: 200)
   * @returns {number} Reading time in minutes
   */
  export const calculateReadingTime = (text, wpm = 200) => {
    const wordCount = countWords(text);
    const minutes = wordCount / wpm;
    
    return Math.max(1, Math.ceil(minutes));
  };