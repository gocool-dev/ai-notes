import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import NoteEditScreen from '../screens/NoteEditScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AIHubScreen from '../screens/AIHubScreen';

// Import theme
import theme from '../config/theme';

// Create stack navigators
const HomeStack = createStackNavigator();
const SettingsStack = createStackNavigator();
const AIHubStack = createStackNavigator();

// Create bottom tab navigator
const Tab = createBottomTabNavigator();

// Home Stack Navigator
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <HomeStack.Screen 
        name="Notes" 
        component={HomeScreen} 
        options={{ title: 'My Notes' }}
      />
      <HomeStack.Screen 
        name="NoteEdit" 
        component={NoteEditScreen} 
        options={({ route }) => ({ 
          title: route.params?.isNewNote ? 'New Note' : 'Edit Note' 
        })}
      />
    </HomeStack.Navigator>
  );
};

// Settings Stack Navigator
const SettingsStackNavigator = () => {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <SettingsStack.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }}
      />
    </SettingsStack.Navigator>
  );
};

// AI Hub Stack Navigator
const AIHubStackNavigator = () => {
  return (
    <AIHubStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <AIHubStack.Screen 
        name="AIHub" 
        component={AIHubScreen} 
        options={{ title: 'AI Tools' }}
      />
    </AIHubStack.Navigator>
  );
};

// Main Tab Navigator
const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'HomeStack') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'AIHubStack') {
            iconName = focused ? 'flask' : 'flask-outline';
          } else if (route.name === 'SettingsStack') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="HomeStack" 
        component={HomeStackNavigator} 
        options={{ title: 'Notes' }}
      />
      <Tab.Screen 
        name="AIHubStack" 
        component={AIHubStackNavigator} 
        options={{ title: 'AI Tools' }}
      />
      <Tab.Screen 
        name="SettingsStack" 
        component={SettingsStackNavigator} 
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;