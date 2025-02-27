import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Switch, TouchableOpacity } from 'react-native';
import { 
  List, 
  Divider,
  Text, 
  Button, 
  Dialog, 
  Portal, 
  TextInput,
  RadioButton  
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { signOut, getAuth } from 'firebase/auth';
import * as Application from 'expo-application';

// Import theme
import theme from '../config/theme';

// Import services
import locationService from '../services/locationService';

const SettingsScreen = () => {
  // Settings state
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationRemindersEnabled, setLocationRemindersEnabled] = useState(true);
  const [voiceInputEnabled, setVoiceInputEnabled] = useState(true);
  const [aiSuggestionsEnabled, setAiSuggestionsEnabled] = useState(true);
  const [fontSize, setFontSize] = useState('medium');
  
  // Dialog states
  const [fontSizeDialogVisible, setFontSizeDialogVisible] = useState(false);
  const [apiKeyDialogVisible, setApiKeyDialogVisible] = useState(false);
  const [apiKey, setApiKey] = useState('');
  
  // Version info
  const [version, setVersion] = useState('1.0.0');

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Load app settings
        const settings = await AsyncStorage.getItem('appSettings');
        if (settings) {
          const parsedSettings = JSON.parse(settings);
          setDarkMode(parsedSettings.darkMode || false);
          setNotificationsEnabled(parsedSettings.notificationsEnabled !== false);
          setLocationRemindersEnabled(parsedSettings.locationRemindersEnabled !== false);
          setVoiceInputEnabled(parsedSettings.voiceInputEnabled !== false);
          setAiSuggestionsEnabled(parsedSettings.aiSuggestionsEnabled !== false);
          setFontSize(parsedSettings.fontSize || 'medium');
        }
        
        // Load API key if exists
        const storedApiKey = await AsyncStorage.getItem('openaiApiKey');
        if (storedApiKey) {
          setApiKey(storedApiKey);
        }
        
        // Get app version
        const appVersion = Application.nativeApplicationVersion || '1.0.0';
        setVersion(appVersion);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    loadSettings();
  }, []);
  
  // Save settings function
  const saveSettings = async () => {
    try {
      const settings = {
        darkMode,
        notificationsEnabled,
        locationRemindersEnabled,
        voiceInputEnabled,
        aiSuggestionsEnabled,
        fontSize,
      };
      
      await AsyncStorage.setItem('appSettings', JSON.stringify(settings));
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };
  
  // Handle dark mode toggle
  const handleDarkModeToggle = (value) => {
    setDarkMode(value);
    setTimeout(() => saveSettings(), 100);
  };
  
  // Handle notifications toggle
  const handleNotificationsToggle = (value) => {
    setNotificationsEnabled(value);
    setTimeout(() => saveSettings(), 100);
  };
  
  // Handle location reminders toggle
  const handleLocationRemindersToggle = async (value) => {
    setLocationRemindersEnabled(value);
    
    if (value) {
      // Request location permissions and start tracking if enabled
      const success = await locationService.startLocationTracking();
      if (!success) {
        setLocationRemindersEnabled(false);
      }
    } else {
      // Stop location tracking if disabled
      await locationService.stopLocationTracking();
    }
    
    setTimeout(() => saveSettings(), 100);
  };
  
  // Handle voice input toggle
  const handleVoiceInputToggle = (value) => {
    setVoiceInputEnabled(value);
    setTimeout(() => saveSettings(), 100);
  };
  
  // Handle AI suggestions toggle
  const handleAiSuggestionsToggle = (value) => {
    setAiSuggestionsEnabled(value);
    setTimeout(() => saveSettings(), 100);
  };
  
  // Save API key function
  const saveApiKey = async () => {
    try {
      await AsyncStorage.setItem('openaiApiKey', apiKey);
      setApiKeyDialogVisible(false);
      Alert.alert('Success', 'API key saved successfully.');
    } catch (error) {
      console.error('Error saving API key:', error);
      Alert.alert('Error', 'Failed to save API key. Please try again.');
    }
  };
  
  // Sign out function
  const handleSignOut = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };
  
  // Clear data function
  const handleClearData = () => {
    Alert.alert(
      'Clear App Data',
      'Are you sure you want to clear all app data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Success', 'All app data has been cleared. The app will now restart.');
              // In a real app, you would need to reset the app state or trigger a reload
            } catch (error) {
              console.error('Error clearing app data:', error);
              Alert.alert('Error', 'Failed to clear app data. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <List.Section>
        <List.Subheader>Appearance</List.Subheader>
        <List.Item
          title="Dark Mode"
          description="Use dark theme throughout the app"
          left={(props) => <List.Icon {...props} icon="weather-night" />}
          right={() => (
            <Switch
              value={darkMode}
              onValueChange={handleDarkModeToggle}
              color={theme.colors.primary}
            />
          )}
        />
        <TouchableOpacity onPress={() => setFontSizeDialogVisible(true)}>
          <List.Item
            title="Font Size"
            description={fontSize.charAt(0).toUpperCase() + fontSize.slice(1)}
            left={(props) => <List.Icon {...props} icon="format-size" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
        </TouchableOpacity>
      </List.Section>
      
      <Divider />
      
      <List.Section>
        <List.Subheader>Notifications</List.Subheader>
        <List.Item
          title="Push Notifications"
          description="Receive reminders and alerts"
          left={(props) => <List.Icon {...props} icon="bell" />}
          right={() => (
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              color={theme.colors.primary}
            />
          )}
        />
        <List.Item
          title="Location Reminders"
          description="Get notified when you're near a saved location"
          left={(props) => <List.Icon {...props} icon="map-marker" />}
          right={() => (
            <Switch
              value={locationRemindersEnabled}
              onValueChange={handleLocationRemindersToggle}
              color={theme.colors.primary}
            />
          )}
        />
      </List.Section>
      
      <Divider />
      
      <List.Section>
        <List.Subheader>AI Features</List.Subheader>
        <List.Item
          title="Voice Input"
          description="Enable voice-to-text functionality"
          left={(props) => <List.Icon {...props} icon="microphone" />}
          right={() => (
            <Switch
              value={voiceInputEnabled}
              onValueChange={handleVoiceInputToggle}
              color={theme.colors.primary}
            />
          )}
        />
        <List.Item
          title="AI Suggestions"
          description="Get smart recommendations and summaries"
          left={(props) => <List.Icon {...props} icon="brain" />}
          right={() => (
            <Switch
              value={aiSuggestionsEnabled}
              onValueChange={handleAiSuggestionsToggle}
              color={theme.colors.primary}
            />
          )}
        />
        <TouchableOpacity onPress={() => setApiKeyDialogVisible(true)}>
          <List.Item
            title="OpenAI API Key"
            description={apiKey ? "API key is set" : "Set your own API key"}
            left={(props) => <List.Icon {...props} icon="key" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
          />
        </TouchableOpacity>
      </List.Section>
      
      <Divider />
      
      <List.Section>
        <List.Subheader>Account</List.Subheader>
        <TouchableOpacity onPress={handleSignOut}>
          <List.Item
            title="Sign Out"
            description="Log out from your account"
            left={(props) => <List.Icon {...props} icon="logout" />}
          />
        </TouchableOpacity>
      </List.Section>
      
      <Divider />
      
      <List.Section>
        <List.Subheader>Data Management</List.Subheader>
        <TouchableOpacity onPress={handleClearData}>
          <List.Item
            title="Clear App Data"
            description="Delete all local data and reset settings"
            left={(props) => <List.Icon {...props} icon="delete" color="#D32F2F" />}
          />
        </TouchableOpacity>
      </List.Section>
      
      <Divider />
      
      <List.Section>
        <List.Subheader>About</List.Subheader>
        <List.Item
          title="Version"
          description={`v${version}`}
          left={(props) => <List.Icon {...props} icon="information" />}
        />
        <List.Item
          title="Privacy Policy"
          left={(props) => <List.Icon {...props} icon="shield" />}
          onPress={() => {
            // Open privacy policy in browser or in-app webview
          }}
        />
        <List.Item
          title="Terms of Service"
          left={(props) => <List.Icon {...props} icon="file-document" />}
          onPress={() => {
            // Open terms of service in browser or in-app webview
          }}
        />
      </List.Section>
      
      {/* Font Size Dialog */}
      <Portal>
        <Dialog
          visible={fontSizeDialogVisible}
          onDismiss={() => setFontSizeDialogVisible(false)}
        >
          <Dialog.Title>Font Size</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={(value) => setFontSize(value)} value={fontSize}>
              <RadioButton.Item label="Small" value="small" />
              <RadioButton.Item label="Medium" value="medium" />
              <RadioButton.Item label="Large" value="large" />
              <RadioButton.Item label="Extra Large" value="xlarge" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setFontSizeDialogVisible(false)}>Cancel</Button>
            <Button
              onPress={() => {
                setFontSizeDialogVisible(false);
                saveSettings();
              }}
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* API Key Dialog */}
      <Portal>
        <Dialog
          visible={apiKeyDialogVisible}
          onDismiss={() => setApiKeyDialogVisible(false)}
        >
          <Dialog.Title>OpenAI API Key</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>
              Enter your personal OpenAI API key to use your own quota instead of the app's shared quota.
            </Text>
            <TextInput
              label="API Key"
              value={apiKey}
              onChangeText={setApiKey}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setApiKeyDialogVisible(false)}>Cancel</Button>
            <Button onPress={saveApiKey}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  dialogText: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
  },
});

export default SettingsScreen;