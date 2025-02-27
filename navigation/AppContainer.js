import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

// Import navigators
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';

// Import auth service
import authService from '../services/authService';

// Import theme
import theme from '../config/theme';

const AppContainer = () => {
  // Auth state
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  // Check authentication state on load
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Check if user data exists in AsyncStorage
        const userData = await authService.getCurrentUserData();
        
        // Update auth state
        setUserToken(userData ? userData.uid : null);
      } catch (error) {
        console.error('Failed to check authentication state:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth state listener
    const unsubscribe = authService.setupAuthStateListener((user) => {
      setUserToken(user ? user.uid : null);
    });

    bootstrapAsync();

    // Clean up auth state listener
    return unsubscribe;
  }, []);

  // Show loading screen while checking auth state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userToken ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default AppContainer;