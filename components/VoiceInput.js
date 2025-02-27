import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

// Import theme
import theme from '../config/theme';

const VoiceInput = ({ visible }) => {
  // Animation value for the recording indicator
  const [animatedValue] = useState(new Animated.Value(1));
  
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
    } else {
      // Reset animation when not visible
      animatedValue.setValue(1);
    }
  }, [visible, animatedValue]);

  // If not visible, don't render anything
  if (!visible) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View style={styles.modalContainer}>
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
          
          <Text style={styles.listeningText}>Listening...</Text>
          <Text style={styles.instructionText}>Speak clearly. Tap to cancel.</Text>
        </View>
      </View>
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    elevation: 5,
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
  instructionText: {
    fontSize: 14,
    color: '#666',
  },
});

export default VoiceInput;