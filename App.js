import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

// Import theme
import theme from './config/theme';

// Import navigation container
import AppContainer from './navigation/AppContainer';

// Import Firebase configuration
import { initializeFirebase } from './services/firebase';

// Keep splash screen visible while loading resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize Firebase
        initializeFirebase();

        // Pre-load fonts
        await Font.loadAsync({
          ...Ionicons.font,
          'space-mono': require('./assets/fonts/SpaceMono-Regular.ttf'),
        });
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = React.useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <PaperProvider theme={theme}>
        <AppContainer />
        <StatusBar style="auto" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}