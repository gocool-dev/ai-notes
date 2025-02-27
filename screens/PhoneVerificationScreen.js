import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput as RNTextInput
} from 'react-native';
import {
  Text,
  Button,
  Surface,
  ActivityIndicator,
  TextInput
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

// Import auth service
import authService from '../services/authService';

// Import theme
import theme from '../config/theme';

const PhoneVerificationScreen = () => {
  const navigation = useNavigation();
  
  // State for phone number and input validation
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // OTP verification state
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  
  // References for OTP inputs
  const otpInputs = useRef([]);
  
  // Check if a user is already logged in
  useEffect(() => {
    const checkCurrentUser = async () => {
      const userData = await authService.getCurrentUserData();
      if (userData) {
        // User is already logged in and verified
        // Note: In a real app, you'd check if phone is already verified
      }
    };
    
    checkCurrentUser();
  }, []);
  
  // Validate phone number
  const validatePhoneNumber = (number) => {
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!number) {
      setPhoneError('Phone number is required');
      return false;
    } else if (!phoneRegex.test(number.replace(/[^0-9]/g, ''))) {
      setPhoneError('Please enter a valid phone number');
      return false;
    } else {
      setPhoneError('');
      return true;
    }
  };
  
  // Handle phone number changes
  const handlePhoneChange = (text) => {
    // Format phone number
    const formattedNumber = text.replace(/[^0-9]/g, '');
    setPhoneNumber(formattedNumber);
  };
  
  // Send verification code
  const sendVerificationCode = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, you would use Firebase Auth phone authentication
      // For this demo, we'll simulate OTP verification
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show OTP input
      setShowOtp(true);
      
      // Focus on first OTP input
      setTimeout(() => {
        if (otpInputs.current[0]) {
          otpInputs.current[0].focus();
        }
      }, 500);
      
      Alert.alert(
        'Verification Code Sent',
        'For this demo, use code: 123456'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle OTP input
  const handleOtpChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    
    // Auto focus next input
    if (text && index < 5) {
      otpInputs.current[index + 1].focus();
    }
  };
  
  // Handle OTP paste
  const handleOtpPaste = (text) => {
    if (text.length === 6 && /^\d+$/.test(text)) {
      const digits = text.split('');
      setOtp(digits);
      otpInputs.current[5].focus();
    }
  };
  
  // Verify OTP
  const verifyOtp = async () => {
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setOtpError('Please enter all 6 digits');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, you would verify the OTP with Firebase Auth
      // For this demo, we'll just check if it's "123456"
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (otpValue === '123456') {
        // Link device with phone
        await authService.linkDeviceWithPhone(phoneNumber);
        
        // Navigate to main app
        navigation.reset({
          index: 0,
          routes: [{ name: 'HomeStack' }],
        });
      } else {
        setOtpError('Invalid verification code');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Resend verification code
  const resendCode = () => {
    setOtp(['', '', '', '', '', '']);
    sendVerificationCode();
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {showOtp ? 'Enter Verification Code' : 'Verify Your Phone'}
          </Text>
          
          {!showOtp ? (
            <>
              <Text style={styles.instructions}>
                Enter your phone number to receive a verification code
              </Text>
              
              <TextInput
                style={styles.input}
                label="Phone Number"
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                error={!!phoneError}
                keyboardType="phone-pad"
                left={<TextInput.Icon icon="phone" />}
                mode="outlined"
                placeholder="e.g. 1234567890"
              />
              {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
              
              <Button
                mode="contained"
                onPress={sendVerificationCode}
                disabled={isLoading}
                loading={isLoading}
                style={styles.button}
              >
                Send Verification Code
              </Button>
            </>
          ) : (
            <>
              <Text style={styles.instructions}>
                Enter the 6-digit verification code sent to your phone
              </Text>
              
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <RNTextInput
                    key={index}
                    style={styles.otpInput}
                    maxLength={1}
                    keyboardType="number-pad"
                    onChangeText={(text) => handleOtpChange(text, index)}
                    value={digit}
                    ref={(input) => {
                      otpInputs.current[index] = input;
                    }}
                    onKeyPress={({ nativeEvent }) => {
                      if (nativeEvent.key === 'Backspace' && !digit && index > 0) {
                        otpInputs.current[index - 1].focus();
                      }
                    }}
                    onPaste={handleOtpPaste}
                  />
                ))}
              </View>
              {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}
              
              <Button
                mode="contained"
                onPress={verifyOtp}
                disabled={isLoading}
                loading={isLoading}
                style={styles.button}
              >
                Verify Code
              </Button>
              
              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Didn't receive the code?</Text>
                <TouchableOpacity onPress={resendCode} disabled={isLoading}>
                  <Text style={styles.resendLink}>Resend Code</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </Surface>
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
    justifyContent: 'center',
  },
  formContainer: {
    width: '100%',
    padding: theme.spacing.m,
    borderRadius: theme.roundness,
    elevation: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: theme.spacing.m,
    textAlign: 'center',
  },
  instructions: {
    textAlign: 'center',
    marginBottom: theme.spacing.m,
    color: '#555',
  },
  input: {
    marginBottom: theme.spacing.s,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginBottom: theme.spacing.s,
    marginLeft: theme.spacing.s,
  },
  button: {
    marginTop: theme.spacing.m,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.m,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: '#fff',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.m,
  },
  resendText: {
    color: '#555',
    marginRight: theme.spacing.xs,
  },
  resendLink: {
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

export default PhoneVerificationScreen;