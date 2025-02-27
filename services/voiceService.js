import Voice from '@react-native-voice/voice';
import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

// Initialize voice recognition
export const initVoiceRecognition = () => {
  Voice.onSpeechStart = onSpeechStart;
  Voice.onSpeechRecognized = onSpeechRecognized;
  Voice.onSpeechEnd = onSpeechEnd;
  Voice.onSpeechError = onSpeechError;
  Voice.onSpeechResults = onSpeechResults;
  Voice.onSpeechPartialResults = onSpeechPartialResults;
  Voice.onSpeechVolumeChanged = onSpeechVolumeChanged;
};

// Clean up voice recognition
export const destroyVoiceRecognition = async () => {
  try {
    await Voice.destroy();
  } catch (error) {
    console.error('Error destroying Voice instance:', error);
  }
};

// Start voice recognition
export const startVoiceRecognition = async (locale = 'en-US') => {
  try {
    await Voice.start(locale);
    return true;
  } catch (error) {
    console.error('Error starting voice recognition:', error);
    return false;
  }
};

// Stop voice recognition
export const stopVoiceRecognition = async () => {
  try {
    await Voice.stop();
    return true;
  } catch (error) {
    console.error('Error stopping voice recognition:', error);
    return false;
  }
};

// Cancel voice recognition
export const cancelVoiceRecognition = async () => {
  try {
    await Voice.cancel();
    return true;
  } catch (error) {
    console.error('Error canceling voice recognition:', error);
    return false;
  }
};

// Check if voice recognition is available
export const isVoiceRecognitionAvailable = async () => {
  try {
    const isAvailable = await Voice.isAvailable();
    return isAvailable;
  } catch (error) {
    console.error('Error checking voice recognition availability:', error);
    return false;
  }
};

// Text to speech function
export const speakText = async (text, options = {}) => {
  try {
    // Default options
    const defaultOptions = {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.9,
      volume: 1.0,
    };

    // Merge default options with provided options
    const mergedOptions = { ...defaultOptions, ...options };

    // Stop any ongoing speech
    Speech.stop();

    // Start speaking
    Speech.speak(text, mergedOptions);
    
    return true;
  } catch (error) {
    console.error('Error with text-to-speech:', error);
    return false;
  }
};

// Get available voice languages
export const getAvailableVoices = async () => {
  if (Platform.OS === 'ios') {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices;
    } catch (error) {
      console.error('Error getting available voices:', error);
      return [];
    }
  }
  // Android doesn't have a direct API for getting voice list through Expo Speech
  return [];
};

// Event handlers for voice recognition
const onSpeechStart = (e) => {
  console.log('Speech started');
};

const onSpeechRecognized = (e) => {
  console.log('Speech recognized');
};

const onSpeechEnd = (e) => {
  console.log('Speech ended');
};

const onSpeechError = (e) => {
  console.error('Speech error:', e);
};

const onSpeechResults = (e) => {
  console.log('Speech results:', e);
  // The actual results are in e.value, which is an array of possible transcriptions
};

const onSpeechPartialResults = (e) => {
  console.log('Speech partial results:', e);
  // Similar to onSpeechResults, but called more frequently with partial results
};

const onSpeechVolumeChanged = (e) => {
  console.log('Speech volume changed:', e);
};

// Wrapper function for performing voice search
export const performVoiceSearch = async (callback) => {
  try {
    const isAvailable = await isVoiceRecognitionAvailable();
    
    if (!isAvailable) {
      callback({
        error: true,
        message: 'Voice recognition is not available on this device',
        results: []
      });
      return;
    }
    
    // Set up result handling
    Voice.onSpeechResults = (e) => {
      if (e.value && e.value.length > 0) {
        callback({
          error: false,
          message: 'Speech recognized successfully',
          results: e.value
        });
      } else {
        callback({
          error: true,
          message: 'No speech detected',
          results: []
        });
      }
    };
    
    Voice.onSpeechError = (e) => {
      callback({
        error: true,
        message: 'Error recognizing speech',
        results: []
      });
    };
    
    // Start voice recognition
    await startVoiceRecognition();
    
    // Return true to indicate successful start
    return true;
  } catch (error) {
    console.error('Error with voice search:', error);
    callback({
      error: true,
      message: 'Error starting voice recognition',
      results: []
    });
    return false;
  }
};

export default {
  initVoiceRecognition,
  destroyVoiceRecognition,
  startVoiceRecognition,
  stopVoiceRecognition,
  cancelVoiceRecognition,
  isVoiceRecognitionAvailable,
  speakText,
  getAvailableVoices,
  performVoiceSearch
};