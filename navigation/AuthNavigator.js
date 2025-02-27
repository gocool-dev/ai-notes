import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import authentication screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import PhoneVerificationScreen from '../screens/PhoneVerificationScreen';

// Import theme
import theme from '../config/theme';

// Create authentication stack navigator
const AuthStack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false,
      }}
    >
      <AuthStack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ headerShown: false }}
      />
      <AuthStack.Screen 
        name="Signup" 
        component={SignupScreen} 
        options={{ title: 'Create Account' }}
      />
      <AuthStack.Screen 
        name="PhoneVerification" 
        component={PhoneVerificationScreen} 
        options={{ title: 'Verify Phone' }}
      />
    </AuthStack.Navigator>
  );
};

export default AuthNavigator;