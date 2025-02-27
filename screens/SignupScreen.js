import React, { useState } from 'react';
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
  Checkbox
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Import auth service
import authService from '../services/authService';

// Import theme
import theme from '../config/theme';

const SignupScreen = () => {
  const navigation = useNavigation();
  
  // State for form handling
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // State for validation
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  // Terms and privacy policy
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState('');
  
  // Validate name
  const validateName = (name) => {
    if (!name) {
      setNameError('Name is required');
      return false;
    } else {
      setNameError('');
      return true;
    }
  };
  
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
  
  // Validate confirm password
  const validateConfirmPassword = (confirmPassword) => {
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    } else {
      setConfirmPasswordError('');
      return true;
    }
  };
  
  // Validate terms acceptance
  const validateTerms = () => {
    if (!acceptedTerms) {
      setTermsError('You must accept the Terms of Service and Privacy Policy');
      return false;
    } else {
      setTermsError('');
      return true;
    }
  };
  
  // Handle signup
  const handleSignup = async () => {
    // Validate all inputs
    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
    const isTermsAccepted = validateTerms();
    
    if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid || !isTermsAccepted) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Sign up with email and password
      await authService.signUpWithEmailPassword(email, password);
      
      // Navigate to phone verification screen
      navigation.navigate('PhoneVerification');
    } catch (error) {
      // Handle specific errors
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Signup Failed', 'Email is already in use by another account');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Signup Failed', 'The email address is not valid');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('Signup Failed', 'The password is too weak');
      } else {
        Alert.alert('Signup Failed', error.message || 'An unexpected error occurred');
      }
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
        </View>
        
        <Surface style={styles.formContainer}>
          <Text style={styles.formTitle}>Create Account</Text>
          
          <TextInput
            style={styles.input}
            label="Full Name"
            value={name}
            onChangeText={setName}
            onBlur={() => validateName(name)}
            error={!!nameError}
            left={<TextInput.Icon icon="account" />}
            mode="outlined"
          />
          {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
          
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
          
          <TextInput
            style={styles.input}
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            onBlur={() => validateConfirmPassword(confirmPassword)}
            error={!!confirmPasswordError}
            secureTextEntry
            left={<TextInput.Icon icon="lock-check" />}
            mode="outlined"
          />
          {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
          
          <View style={styles.termsContainer}>
            <Checkbox
              status={acceptedTerms ? 'checked' : 'unchecked'}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              color={theme.colors.primary}
            />
            <View style={styles.termsTextContainer}>
              <Text style={styles.termsText}>
                I accept the 
                <Text style={styles.termsLink}> Terms of Service </Text>
                and
                <Text style={styles.termsLink}> Privacy Policy</Text>
              </Text>
            </View>
          </View>
          {termsError ? <Text style={styles.errorText}>{termsError}</Text> : null}
          
          <Button
            mode="contained"
            onPress={handleSignup}
            disabled={isLoading}
            loading={isLoading}
            style={styles.signUpButton}
          >
            Create Account
          </Button>
        </Surface>
        
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign In</Text>
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
    marginBottom: theme.spacing.m,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: theme.spacing.s,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
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
    marginTop: -theme.spacing.xs,
    marginBottom: theme.spacing.s,
    marginLeft: theme.spacing.s,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  termsTextContainer: {
    flex: 1,
    marginLeft: theme.spacing.xs,
  },
  termsText: {
    fontSize: 14,
    color: '#555',
  },
  termsLink: {
    color: theme.colors.primary,
  },
  signUpButton: {
    marginBottom: theme.spacing.m,
  },
  loginContainer: {
    flexDirection: 'row',
    marginVertical: theme.spacing.m,
  },
  loginText: {
    fontSize: 14,
    color: '#555',
    marginRight: theme.spacing.xs,
  },
  loginLink: {
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

export default SignupScreen;