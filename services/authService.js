import {
    GoogleAuthProvider,
    signInWithCredential,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
  } from 'firebase/auth';
  import * as Google from 'expo-auth-session/providers/google';
  import * as WebBrowser from 'expo-web-browser';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { Alert } from 'react-native';
  
  // Import Firebase auth
  import { auth } from './firebase';
  
  // Register for the authentication callback
  WebBrowser.maybeCompleteAuthSession();
  
  // Constants for AsyncStorage
  const USER_STORAGE_KEY = 'user_data';
  const DEVICE_STORAGE_KEY = 'device_id';
  
  /**
   * Initialize Google Sign-In
   * @returns {Object} Google Auth hooks and request function
   */
  export const useGoogleAuth = () => {
    // Your Google Web Client ID - replace with your actual client ID from Google Cloud Console
    const webClientId = 'YOUR_WEB_CLIENT_ID';
    // Your iOS Client ID - replace with your actual client ID for iOS
    const iosClientId = '742639918057-4afcfli5ijk2q81k8rnvdo4hndpq638o.apps.googleusercontent.com';
    // Your Android Client ID - replace with your actual client ID for Android
    const androidClientId = '742639918057-aeaoav3llnopl2ptfc8a2g1cmg1sv6se.apps.googleusercontent.com';
  
    const [request, response, promptAsync] = Google.useAuthRequest({
      expoClientId: webClientId,
      iosClientId: iosClientId,
      androidClientId: androidClientId,
      webClientId: webClientId,
      scopes: ['profile', 'email']
    });
  
    return { request, response, promptAsync };
  };
  
  /**
   * Handle Google Sign-In response and authenticate with Firebase
   * @param {Object} response - Response from Google Sign-In
   * @returns {Promise<Object>} Firebase user object or error
   */
  export const handleGoogleSignIn = async (response) => {
    try {
      if (response?.type === 'success') {
        const { id_token } = response.params;
        
        // Create a Google credential with the token
        const credential = GoogleAuthProvider.credential(id_token);
        
        // Sign in with Firebase using the Google credential
        const userCredential = await signInWithCredential(auth, credential);
        
        // Save user data to AsyncStorage
        await saveUserData(userCredential.user);
        
        return userCredential.user;
      } else {
        throw new Error('Google sign-in was cancelled or failed');
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };
  
  /**
   * Sign up with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Firebase user object
   */
  export const signUpWithEmailPassword = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Save user data to AsyncStorage
      await saveUserData(userCredential.user);
      
      return userCredential.user;
    } catch (error) {
      console.error('Error signing up with email/password:', error);
      throw error;
    }
  };
  
  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Firebase user object
   */
  export const signInWithEmailPassword = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Save user data to AsyncStorage
      await saveUserData(userCredential.user);
      
      return userCredential.user;
    } catch (error) {
      console.error('Error signing in with email/password:', error);
      throw error;
    }
  };
  
  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  export const signOutUser = async () => {
    try {
      await signOut(auth);
      
      // Clear user data from AsyncStorage
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };
  
  /**
   * Save user data to AsyncStorage
   * @param {Object} user - Firebase user object
   * @returns {Promise<void>}
   */
  export const saveUserData = async (user) => {
    try {
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  };
  
  /**
   * Link device with user account
   * @param {string} phoneNumber - User's phone number
   * @returns {Promise<boolean>} Success status
   */
  export const linkDeviceWithPhone = async (phoneNumber) => {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('No authenticated user found');
      }
      
      // In a real implementation, you would use Firebase Auth phone number verification
      // For this demo, we'll just store the phone number
      const deviceData = {
        userId: user.uid,
        phoneNumber,
        deviceId: await getOrCreateDeviceId(),
        linkedAt: new Date().toISOString(),
      };
      
      await AsyncStorage.setItem(DEVICE_STORAGE_KEY, JSON.stringify(deviceData));
      
      return true;
    } catch (error) {
      console.error('Error linking device with phone:', error);
      return false;
    }
  };
  
  /**
   * Get or create a unique device ID
   * @returns {Promise<string>} Device ID
   */
  export const getOrCreateDeviceId = async () => {
    try {
      const storedData = await AsyncStorage.getItem(DEVICE_STORAGE_KEY);
      
      if (storedData) {
        const data = JSON.parse(storedData);
        if (data.deviceId) {
          return data.deviceId;
        }
      }
      
      // Create a new device ID
      const deviceId = 'device_' + Math.random().toString(36).substring(2, 15);
      return deviceId;
    } catch (error) {
      console.error('Error getting/creating device ID:', error);
      // Fallback device ID
      return 'device_' + Math.random().toString(36).substring(2, 15);
    }
  };
  
  /**
   * Get current user data from AsyncStorage
   * @returns {Promise<Object|null>} User data or null if not logged in
   */
  export const getCurrentUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user data:', error);
      return null;
    }
  };
  
  /**
   * Set up auth state listener
   * @param {Function} onAuthStateChange - Callback for auth state changes
   * @returns {Function} Unsubscribe function
   */
  export const setupAuthStateListener = (onAuthStateChange) => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        };
        
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
        onAuthStateChange(userData);
      } else {
        // User is signed out
        await AsyncStorage.removeItem(USER_STORAGE_KEY);
        onAuthStateChange(null);
      }
    });
  };
  
  export default {
    useGoogleAuth,
    handleGoogleSignIn,
    signUpWithEmailPassword,
    signInWithEmailPassword,
    signOutUser,
    saveUserData,
    linkDeviceWithPhone,
    getCurrentUserData,
    setupAuthStateListener,
  };