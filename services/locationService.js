import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the background task for location tracking
const LOCATION_TRACKING = 'location-tracking';

// Function to get current location
export const getCurrentLocation = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Allow location access to use location-based reminders',
        [{ text: 'OK' }]
      );
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

// Function to get address from coordinates
export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    const response = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (response.length > 0) {
      const address = response[0];
      return {
        name: address.name,
        street: address.street,
        city: address.city,
        region: address.region,
        country: address.country,
        postalCode: address.postalCode,
        formattedAddress: [
          address.name,
          address.street,
          address.city,
          address.region,
          address.country,
        ]
          .filter(Boolean)
          .join(', '),
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting address:', error);
    return null;
  }
};

// Function to search for places (POIs)
export const searchPlaces = async (searchTerm) => {
  try {
    // Note: This is a placeholder. In a real app, you would integrate with a places API 
    // like Google Places API for comprehensive search results
    
    // For demo purposes, mock some results
    // In a real app, replace with actual API call
    return [
      { id: '1', name: 'Coffee Shop', address: '123 Main St', latitude: 37.78825, longitude: -122.4324 },
      { id: '2', name: 'Grocery Store', address: '456 Market St', latitude: 37.79025, longitude: -122.4344 },
      { id: '3', name: 'Library', address: '789 Park Ave', latitude: 37.78525, longitude: -122.4304 },
    ].filter(place => place.name.toLowerCase().includes(searchTerm.toLowerCase()));
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
};

// Save a location-based reminder
export const saveLocationReminder = async (reminder) => {
  try {
    // Get existing reminders
    const existingRemindersJson = await AsyncStorage.getItem('locationReminders');
    const existingReminders = existingRemindersJson ? JSON.parse(existingRemindersJson) : [];
    
    // Add new reminder with unique ID
    const newReminder = {
      ...reminder,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    const updatedReminders = [...existingReminders, newReminder];
    
    // Save updated reminders
    await AsyncStorage.setItem('locationReminders', JSON.stringify(updatedReminders));
    
    // Start location tracking if not already started
    startLocationTracking();
    
    return newReminder;
  } catch (error) {
    console.error('Error saving location reminder:', error);
    throw new Error('Failed to save reminder');
  }
};

// Get all location-based reminders
export const getLocationReminders = async () => {
  try {
    const remindersJson = await AsyncStorage.getItem('locationReminders');
    return remindersJson ? JSON.parse(remindersJson) : [];
  } catch (error) {
    console.error('Error getting location reminders:', error);
    return [];
  }
};

// Delete a location-based reminder
export const deleteLocationReminder = async (reminderId) => {
  try {
    const remindersJson = await AsyncStorage.getItem('locationReminders');
    const reminders = remindersJson ? JSON.parse(remindersJson) : [];
    
    const updatedReminders = reminders.filter(reminder => reminder.id !== reminderId);
    
    await AsyncStorage.setItem('locationReminders', JSON.stringify(updatedReminders));
    
    // If no more reminders, stop location tracking
    if (updatedReminders.length === 0) {
      stopLocationTracking();
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting location reminder:', error);
    return false;
  }
};

// Start background location tracking
export const startLocationTracking = async () => {
  try {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Denied',
        'Background location permission is required for location-based reminders',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    // Define the task
    TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
      if (error) {
        console.error('Location tracking error:', error);
        return;
      }
      
      if (data) {
        const { locations } = data;
        const currentLocation = locations[0];
        
        // Check if we're near any of our reminders
        await checkNearbyReminders(currentLocation.coords);
      }
    });
    
    // Start location updates
    await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 60000, // Update every minute
      distanceInterval: 100, // or when we've moved 100 meters
      foregroundService: {
        notificationTitle: 'Location Tracking',
        notificationBody: 'Tracking location for reminders',
      },
    });
    
    return true;
  } catch (error) {
    console.error('Error starting location tracking:', error);
    return false;
  }
};

// Stop background location tracking
export const stopLocationTracking = async () => {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING);
    
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
    }
    
    return true;
  } catch (error) {
    console.error('Error stopping location tracking:', error);
    return false;
  }
};

// Check if user is near any reminders
const checkNearbyReminders = async (currentCoords) => {
  try {
    const remindersJson = await AsyncStorage.getItem('locationReminders');
    const reminders = remindersJson ? JSON.parse(remindersJson) : [];
    
    reminders.forEach(reminder => {
      const distance = calculateDistance(
        currentCoords.latitude,
        currentCoords.longitude,
        reminder.latitude,
        reminder.longitude
      );
      
      // If within the specified radius (default to 200 meters if not set)
      const radius = reminder.radius || 200;
      
      if (distance <= radius) {
        // Check if already triggered
        if (!reminder.triggered) {
          // Trigger notification for this reminder
          triggerReminderNotification(reminder);
          
          // Mark as triggered
          updateReminderTriggered(reminder.id, true);
        }
      } else {
        // Reset trigger state when moving away
        if (reminder.triggered) {
          updateReminderTriggered(reminder.id, false);
        }
      }
    });
  } catch (error) {
    console.error('Error checking nearby reminders:', error);
  }
};

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c * 1000; // Distance in meters
  
  return distance;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

// Mark a reminder as triggered or not
const updateReminderTriggered = async (reminderId, triggered) => {
  try {
    const remindersJson = await AsyncStorage.getItem('locationReminders');
    const reminders = remindersJson ? JSON.parse(remindersJson) : [];
    
    const updatedReminders = reminders.map(reminder => {
      if (reminder.id === reminderId) {
        return { ...reminder, triggered };
      }
      return reminder;
    });
    
    await AsyncStorage.setItem('locationReminders', JSON.stringify(updatedReminders));
  } catch (error) {
    console.error('Error updating reminder triggered state:', error);
  }
};

// Trigger notification for a reminder
const triggerReminderNotification = (reminder) => {
  // This function will use the Notifications API
  // For placeholder purposes, we just log it
  console.log('Triggered reminder notification:', reminder);
  
  // In a real implementation, you would import and use expo-notifications:
  /*
  import * as Notifications from 'expo-notifications';
  
  Notifications.scheduleNotificationAsync({
    content: {
      title: reminder.title,
      body: reminder.note || 'Location-based reminder',
      data: { reminderData: reminder },
    },
    trigger: null, // Immediate notification
  });
  */
};

export default {
  getCurrentLocation,
  getAddressFromCoordinates,
  searchPlaces,
  saveLocationReminder,
  getLocationReminders,
  deleteLocationReminder,
  startLocationTracking,
  stopLocationTracking,
};