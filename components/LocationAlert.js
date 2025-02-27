import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Button, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

// Import theme
import theme from '../config/theme';

const LocationAlert = ({ reminder, onPress, onDismiss }) => {
  // Animation for sliding in the alert (for future implementation)
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    // Show the alert with a slight delay for better UX
    const timer = setTimeout(() => {
      setVisible(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // If not visible yet, don't render
  if (!visible) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.headerContainer}>
            <Ionicons name="location" size={24} color={theme.colors.primary} />
            <Title style={styles.title}>Location Reminder</Title>
            <IconButton
              icon="close"
              size={20}
              onPress={onDismiss}
              style={styles.closeButton}
            />
          </View>
          
          <Paragraph style={styles.locationText}>
            You're near: {reminder.locationName}
          </Paragraph>
          
          <Paragraph style={styles.noteText} numberOfLines={3}>
            {reminder.note || 'No note content'}
          </Paragraph>
          
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={onPress}
              style={styles.viewButton}
            >
              View Note
            </Button>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  card: {
    elevation: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  title: {
    marginLeft: theme.spacing.s,
    flex: 1,
  },
  closeButton: {
    margin: 0,
    padding: 0,
  },
  locationText: {
    fontWeight: 'bold',
    marginBottom: theme.spacing.s,
  },
  noteText: {
    marginBottom: theme.spacing.m,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  viewButton: {
    borderRadius: 20,
  },
});

export default LocationAlert;