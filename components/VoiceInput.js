import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, Animated, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';

// Import theme
import theme from '../config/theme';

// Import the speech recognition HTML
import { speechRecognitionHTML } from '../services/voiceService';

const VoiceInput = ({ visible, onClose, onResult }) => {
  // Animation value for the recording indicator
  const [animatedValue] = useState(new Animated.Value(1));
  
  // State for voice recognition
  const [isListening, setIsListening] = useState(false);
  const [interimResult, setInterimResult] = useState('');
  const [finalResult, setFinalResult] = useState('');
  const [error, setError] = useState('');
  
  // WebView reference
  const webViewRef = useRef(null);
  const [webViewReady, setWebViewReady] = useState(false);
  
  // Create the pulse animation
  useEffect(() => {
    if (visible) {
      // Start the pulsing animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
      
      // Start voice recognition when WebView is ready
      if (webViewReady) {
        startListening();
      }
    } else {
      // Reset animation when not visible
      animatedValue.setValue(1);
      
      // Stop voice recognition
      stopListening();
    }
    
    return () => {
      // Cleanup
      stopListening();
    };
  }, [visible, animatedValue, webViewReady]);
  
  // Handle WebView messages
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'STATUS':
          if (data.message === 'READY') {
            setWebViewReady(true);
            if (visible) {
              startListening();
            }
          }
          break;
          
        case 'START':
          setIsListening(true);
          break;
          
        case 'END':
          setIsListening(false);
          break;
          
        case 'INTERIM':
          setInterimResult(data.message);
          break;
          
        case 'FINAL':
          setFinalResult(data.message);
          setIsListening(false);
          
          // Pass the result to the parent component
          if (onResult) {
            onResult(data.message);
          }
          
          // Close the modal after a short delay
          setTimeout(() => {
            onClose();
          }, 500);
          break;
          
        case 'ERROR':
          setError(data.message);
          setIsListening(false);
          
          // Close the modal after a longer delay if there's an error
          setTimeout(() => {
            onClose();
          }, 1500);
          break;
      }
    } catch (e) {
      console.error('Error parsing WebView message:', e);
      setError('Failed to process speech recognition result');
      setIsListening(false);
      
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };
  
  // Start listening
  const startListening = () => {
    if (webViewRef.current && webViewReady) {
      setFinalResult('');
      setInterimResult('');
      setError('');
      webViewRef.current.injectJavaScript('window.startListening(); true;');
    }
  };
  
  // Stop listening
  const stopListening = () => {
    if (webViewRef.current && webViewReady) {
      webViewRef.current.injectJavaScript('window.stopListening(); true;');
    }
  };
  
  // Handle manual cancel
  const handleCancel = () => {
    stopListening();
    onClose();
  };

  // If not visible, don't render anything
  if (!visible) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <TouchableOpacity 
        style={styles.modalContainer}
        activeOpacity={1}
        onPress={handleCancel}
      >
        {/* WebView for speech recognition - hidden but functional */}
        <View style={{ height: 1, width: 1, opacity: 0 }}>
          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: speechRecognitionHTML }}
            onMessage={handleMessage}
            javaScriptEnabled={true}
          />
        </View>
        
        <View style={styles.voiceInputContainer}>
          <Animated.View
            style={[
              styles.pulseContainer,
              {
                transform: [{ scale: animatedValue }],
              },
            ]}
          >
            <Ionicons name="mic" size={40} color="white" />
          </Animated.View>
          
          <Text style={styles.listeningText}>
            {isListening ? 'Listening...' : finalResult ? 'Got it!' : 'Initializing...'}
          </Text>
          
          {interimResult && isListening && (
            <Text style={styles.interimText} numberOfLines={2}>
              "{interimResult}"
            </Text>
          )}
          
          {finalResult && (
            <Text style={styles.resultText} numberOfLines={2}>
              "{finalResult}"
            </Text>
          )}
          
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <Text style={styles.instructionText}>Tap anywhere to cancel</Text>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  voiceInputContainer: {
    alignItems: 'center',
    padding: theme.spacing.l,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    elevation: 5,
    width: '80%',
    maxWidth: 300,
  },
  pulseContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  listeningText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: theme.spacing.s,
  },
  interimText: {
    fontSize: 16,
    color: '#777',
    marginBottom: theme.spacing.s,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  resultText: {
    fontSize: 16,
    color: '#333',
    marginBottom: theme.spacing.m,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
});

export default VoiceInput;