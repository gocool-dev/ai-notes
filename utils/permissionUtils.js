import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as Camera from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Platform, Alert, Linking } from 'react-native';
import Constants from 'expo-constants';

/**
 * Request location permissions
 * @param {boolean} background - Whether to request background location permission
 * @returns {Promise<boolean>} Whether permission was granted
 */
export const requestLocationPermission = async (background = false) => {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      showPermissionAlert('Location');
      return false;
    }
    
    if (background) {
      let { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      
      if (backgroundStatus !== 'granted') {
        Alert.alert(
          'Background Location',
          'Background location permission is needed for location-based reminders to work properly.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};

/**
 * Request notification permissions
 * @returns {Promise<boolean>} Whether permission was granted
 */
export const requestNotificationPermission = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    if (existingStatus === 'granted') {
      return true;
    }
    
    const { status } = await Notifications.requestPermissionsAsync();
    
    if (status !== 'granted') {
      showPermissionAlert('Notifications');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Request camera permissions
 * @returns {Promise<boolean>} Whether permission was granted
 */
export const requestCameraPermission = async () => {
  try {
    const { status } = await Camera.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      showPermissionAlert('Camera');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return false;
  }
};

/**
 * Request media library permissions
 * @param {boolean} writeOnly - Whether to request write-only permission
 * @returns {Promise<boolean>} Whether permission was granted
 */
export const requestMediaLibraryPermission = async (writeOnly = false) => {
  try {
    const { status } = writeOnly
      ? await MediaLibrary.requestPermissionsAsync(true)
      : await MediaLibrary.requestPermissionsAsync();
    
    if (status !== 'granted') {
      showPermissionAlert('Media Library');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting media library permission:', error);
    return false;
  }
};

/**
 * Check if a permission has been granted
 * @param {string} permissionType - Type of permission (location, camera, etc.)
 * @returns {Promise<boolean>} Whether permission is granted
 */
export const checkPermission = async (permissionType) => {
  try {
    switch (permissionType.toLowerCase()) {
      case 'location':
        const { status: locationStatus } = await Location.getForegroundPermissionsAsync();
        return locationStatus === 'granted';
        
      case 'background_location':
        const { status: bgLocationStatus } = await Location.getBackgroundPermissionsAsync();
        return bgLocationStatus === 'granted';
        
      case 'camera':
        const { status: cameraStatus } = await Camera.getCameraPermissionsAsync();
        return cameraStatus === 'granted';
        
      case 'media_library':
        const { status: mediaStatus } = await MediaLibrary.getPermissionsAsync();
        return mediaStatus === 'granted';
        
      case 'notifications':
        const { status: notifStatus } = await Notifications.getPermissionsAsync();
        return notifStatus === 'granted';
        
      default:
        console.warn(`Unknown permission type: ${permissionType}`);
        return false;
    }
  } catch (error) {
    console.error(`Error checking ${permissionType} permission:`, error);
    return false;
  }
};

/**
 * Open app settings
 */
export const openAppSettings = () => {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
};

/**
 * Show permission alert with option to open settings
 * @param {string} permissionName - Name of the permission
 */
const showPermissionAlert = (permissionName) => {
  Alert.alert(
    `${permissionName} Permission Required`,
    `This feature requires ${permissionName.toLowerCase()} permission. Please enable it in your device settings.`,
    [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Open Settings', 
        onPress: openAppSettings
      }
    ]
  );
};

export default {
  requestLocationPermission,
  requestNotificationPermission,
  requestCameraPermission,
  requestMediaLibraryPermission,
  checkPermission,
  openAppSettings,
};