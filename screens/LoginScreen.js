import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  ActivityIndicator,
  Divider
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Import auth service
import authService from '../services/authService';

// Import theme
import theme from '../config/theme';

const LoginScreen = () => {
  const navigation = useNavigation();
  
  // State for form handling
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // State for Google Sign-In
  const { request, response, promptAsync } = authService.useGoogleAuth();
  
  // Handle Google Sign-In response
  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleLogin();
    } else if (response?.type === 'error') {
      Alert.alert('Error', 'Google sign-in failed. Please try again.');
    }
  }, [response]);
  
  // Validate email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };
  
  // Validate password
  const validatePassword = (password) => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  };
  
  // Handle regular login with email and password
  const handleEmailLogin = async () => {
    // Validate inputs
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await authService.signInWithEmailPassword(email, password);
      navigation.navigate('PhoneVerification');
    } catch (error) {
      // Handle specific errors
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        Alert.alert('Login Failed', 'Invalid email or password');
      } else if (error.code === 'auth/too-many-requests') {
        Alert.alert('Login Failed', 'Too many failed login attempts. Please try again later.');
      } else {
        Alert.alert('Login Failed', error.message || 'An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle Google login
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    
    try {
      await authService.handleGoogleSignIn(response);
      navigation.navigate('PhoneVerification');
    } catch (error) {
      Alert.alert('Google Login Failed', error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>AI Notes</Text>
          <Text style={styles.tagline}>Smart Note-Taking with AI</Text>
        </View>
        
        <Surface style={styles.formContainer}>
          <Text style={styles.formTitle}>Sign In</Text>
          
          <TextInput
            style={styles.input}
            label="Email"
            value={email}
            onChangeText={setEmail}
            onBlur={() => validateEmail(email)}
            error={!!emailError}
            autoCapitalize="none"
            keyboardType="email-address"
            left={<TextInput.Icon icon="email" />}
            mode="outlined"
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          
          <TextInput
            style={styles.input}
            label="Password"
            value={password}
            onChangeText={setPassword}
            onBlur={() => validatePassword(password)}
            error={!!passwordError}
            secureTextEntry
            left={<TextInput.Icon icon="lock" />}
            mode="outlined"
          />
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          
          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
          
          <Button
            mode="contained"
            onPress={handleEmailLogin}
            disabled={isLoading}
            loading={isLoading}
            style={styles.signInButton}
          >
            Sign In
          </Button>
          
          <View style={styles.dividerContainer}>
            <Divider style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <Divider style={styles.divider} />
          </View>
          
          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => promptAsync()}
            disabled={isLoading || !request}
          >
            <Image
              source={require('../assets/google-logo.png')}
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </TouchableOpacity>
        </Surface>
        
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.l,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: theme.spacing.s,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  tagline: {
    fontSize: 16,
    color: '#555',
  },
  formContainer: {
    width: '100%',
    padding: theme.spacing.m,
    borderRadius: theme.roundness,
    elevation: 4,
    marginBottom: theme.spacing.m,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  input: {
    marginBottom: theme.spacing.s,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: -theme.spacing.s,
    marginBottom: theme.spacing.s,
    marginLeft: theme.spacing.s,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.m,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: 14,
  },
  signInButton: {
    marginBottom: theme.spacing.m,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: theme.spacing.s,
    color: '#888',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: theme.roundness,
    padding: theme.spacing.m,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: theme.spacing.s,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: theme.spacing.m,
  },
  signupText: {
    fontSize: 14,
    color: '#555',
    marginRight: theme.spacing.xs,
  },
  signupLink: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoginScreen;