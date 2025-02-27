import React from 'react';
import { Platform, Alert } from 'react-native';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import { useRef, useState, useEffect } from 'react';

// Constants
const VOICE_SETTINGS_KEY = 'voice_settings';

// HTML for the web speech recognition
const speechRecognitionHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Speech Recognition</title>
  <style>
    body { background-color: transparent; color: white; font-family: system-ui; }
  </style>
</head>
<body>
  <div id="status">Initializing...</div>
  <script>
    // Check if SpeechRecognition is available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    
    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      // Start recognition when page loads
      window.onload = function() {
        document.getElementById('status').textContent = 'Ready';
        
        // Post ready message to React Native
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'STATUS',
          message: 'READY'
        }));
      };
      
      // Handle results
      recognition.onresult = function(event) {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        // Send interim results
        if (interimTranscript) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'INTERIM',
            message: interimTranscript
          }));
        }
        
        // Send final results
        if (finalTranscript) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'FINAL',
            message: finalTranscript
          }));
        }
      };
      
      // Handle end of speech
      recognition.onend = function() {
        document.getElementById('status').textContent = 'Stopped';
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'END',
          message: 'Recognition stopped'
        }));
      };
      
      // Handle start of speech
      recognition.onstart = function() {
        document.getElementById('status').textContent = 'Listening...';
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'START',
          message: 'Recognition started'
        }));
      };
      
      // Handle errors
      recognition.onerror = function(event) {
        document.getElementById('status').textContent = 'Error: ' + event.error;
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'ERROR',
          message: event.error
        }));
      };
      
      // Start listening when instructed
      window.startListening = function(locale) {
        try {
          if (locale) {
            recognition.lang = locale;
          }
          
          recognition.start();
          document.getElementById('status').textContent = 'Listening...';
        } catch (e) {
          document.getElementById('status').textContent = 'Error: ' + e.message;
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'ERROR',
            message: e.message
          }));
        }
      };
      
      // Stop listening when instructed
      window.stopListening = function() {
        try {
          recognition.stop();
          document.getElementById('status').textContent = 'Stopped';
        } catch (e) {
          document.getElementById('status').textContent = 'Error stopping: ' + e.message;
        }
      };
      
      // Abort listening
      window.abortListening = function() {
        try {
          recognition.abort();
          document.getElementById('status').textContent = 'Aborted';
        } catch (e) {
          document.getElementById('status').textContent = 'Error aborting: ' + e.message;
        }
      };
      
      // Set recognition language
      window.setLanguage = function(locale) {
        try {
          recognition.lang = locale;
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'LANGUAGE',
            message: 'Language set to ' + locale
          }));
        } catch (e) {
          document.getElementById('status').textContent = 'Error setting language: ' + e.message;
        }
      };
      
      // Check if recognition is supported
      window.isRecognitionSupported = function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'SUPPORTED',
          message: !!SpeechRecognition
        }));
      };
    } else {
      document.getElementById('status').textContent = 'Speech recognition not supported';
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'ERROR',
        message: 'Speech recognition not supported in this browser'
      }));
    }
  </script>
</body>
</html>
`;

// WebView Speech Recognition Component
export const WebSpeechRecognition = ({ onMessage, hidden = true }) => {
  const webViewRef = useRef(null);
  
  const handleMessage = (event) => {
    if (onMessage) {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        onMessage(data);
      } catch (e) {
        console.error('Error parsing WebView message:', e);
      }
    }
  };
  
  return (
    <WebView
      ref={webViewRef}
      originWhitelist={['*']}
      source={{ html: speechRecognitionHTML }}
      onMessage={handleMessage}
      javaScriptEnabled={true}
      style={{ 
        display: hidden ? 'none' : 'flex',
        width: hidden ? 1 : '100%', 
        height: hidden ? 1 : '100%', 
        opacity: hidden ? 0 : 1 
      }}
    />
  );
};

// WebView Speech Recognition Hook
export const useWebSpeechRecognition = () => {
  const webViewRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimResults, setInterimResults] = useState('');
  const [finalResults, setFinalResults] = useState([]);
  const [error, setError] = useState('');
  
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'STATUS':
          if (data.message === 'READY') {
            setIsReady(true);
          }
          break;
          
        case 'START':
          setIsListening(true);
          break;
          
        case 'END':
          setIsListening(false);
          break;
          
        case 'INTERIM':
          setInterimResults(data.message);
          break;
          
        case 'FINAL':
          setFinalResults(prevResults => [...prevResults, data.message]);
          setIsListening(false);
          break;
          
        case 'ERROR':
          setError(data.message);
          setIsListening(false);
          break;
          
        case 'SUPPORTED':
          // Handle supported status
          break;
      }
    } catch (e) {
      console.error('Error parsing WebView message:', e);
    }
  };
  
  const startListening = (locale = 'en-US') => {
    if (webViewRef.current && isReady) {
      setFinalResults([]);
      setInterimResults('');
      setError('');
      webViewRef.current.injectJavaScript(`window.startListening('${locale}'); true;`);
    }
  };
  
  const stopListening = () => {
    if (webViewRef.current && isReady) {
      webViewRef.current.injectJavaScript('window.stopListening(); true;');
    }
  };
  
  const abortListening = () => {
    if (webViewRef.current && isReady) {
      webViewRef.current.injectJavaScript('window.abortListening(); true;');
    }
  };
  
  const setLanguage = (locale) => {
    if (webViewRef.current && isReady) {
      webViewRef.current.injectJavaScript(`window.setLanguage('${locale}'); true;`);
    }
  };
  
  const checkSupport = () => {
    if (webViewRef.current && isReady) {
      webViewRef.current.injectJavaScript('window.isRecognitionSupported(); true;');
    }
  };
  
  return {
    webViewRef,
    isReady,
    isListening,
    interimResults,
    finalResults,
    error,
    handleMessage,
    startListening,
    stopListening,
    abortListening,
    setLanguage,
    checkSupport
  };
};

// Initialize voice recognition and set event handlers
export const initVoiceRecognition = async (webViewRef) => {
  try {
    if (webViewRef.current) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error initializing voice recognition:', error);
    return false;
  }
};

// Clean up voice recognition
export const destroyVoiceRecognition = async (webViewRef) => {
  try {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript('window.abortListening(); true;');
    }
    return true;
  } catch (error) {
    console.error('Error destroying Voice instance:', error);
    return false;
  }
};

// Start voice recognition
export const startVoiceRecognition = async (webViewRef, locale = 'en-US') => {
  try {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`window.startListening('${locale}'); true;`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error starting voice recognition:', error);
    Alert.alert('Voice Recognition Error', 'Failed to start voice recognition. Please try again.');
    return false;
  }
};

// Stop voice recognition
export const stopVoiceRecognition = async (webViewRef) => {
  try {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript('window.stopListening(); true;');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error stopping voice recognition:', error);
    return false;
  }
};

// Cancel voice recognition
export const cancelVoiceRecognition = async (webViewRef) => {
  try {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript('window.abortListening(); true;');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error canceling voice recognition:', error);
    return false;
  }
};

// Text to speech function - this can still use Expo's Speech API
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

// Save voice recognition settings
export const saveVoiceSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(VOICE_SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving voice settings:', error);
    return false;
  }
};

// Get voice recognition settings
export const getVoiceSettings = async () => {
  try {
    const settings = await AsyncStorage.getItem(VOICE_SETTINGS_KEY);
    return settings ? JSON.parse(settings) : {
      language: 'en-US',
      autoStopTimeout: 5000, // 5 seconds of silence to auto-stop
      continuousRecognition: false,
    };
  } catch (error) {
    console.error('Error getting voice settings:', error);
    return {
      language: 'en-US',
      autoStopTimeout: 5000,
      continuousRecognition: false,
    };
  }
};

// Wrapper function for performing voice search
export const performVoiceSearch = async (webViewRef, callback) => {
  try {
    if (!webViewRef.current) {
      callback({
        error: true,
        message: 'WebView not initialized',
        results: []
      });
      return false;
    }
    
    // Set up a message handler within the component that calls this function
    // The component should handle the messages and call the callback with results
    
    // Start voice recognition
    webViewRef.current.injectJavaScript('window.startListening(); true;');
    
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

// Higher-order component that provides voice recognition functionality
export const withVoiceRecognition = (WrappedComponent) => {
  return (props) => {
    const voice = useWebSpeechRecognition();
    
    return (
      <>
        <WebView
          ref={voice.webViewRef}
          originWhitelist={['*']}
          source={{ html: speechRecognitionHTML }}
          onMessage={voice.handleMessage}
          javaScriptEnabled={true}
          style={{ 
            position: 'absolute', 
            width: 1, 
            height: 1, 
            opacity: 0 
          }}
        />
        <WrappedComponent {...props} voice={voice} />
      </>
    );
  };
};

export default {
  WebSpeechRecognition,
  useWebSpeechRecognition,
  initVoiceRecognition,
  destroyVoiceRecognition,
  startVoiceRecognition,
  stopVoiceRecognition,
  cancelVoiceRecognition,
  speakText,
  getAvailableVoices,
  saveVoiceSettings,
  getVoiceSettings,
  performVoiceSearch,
  withVoiceRecognition
};