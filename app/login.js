import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

// Define colors
const Colors = {
  primary: '#00a77e',
  secondary: '#f4a261',
  white: '#FFFFFF',
  lightGreen: '#e6f7d9',
  darkGray: '#333333',
  lightGray: '#f5f5f5',
  gray: '#888888',
  error: '#ff3b30',
};

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [age, setAge] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Go back to previous screen
  const handleGoBack = () => {
    router.back();
  };
  
  // Handle login attempt
  const handleLogin = () => {
    // Reset error state
    setError('');
    
    // Validate age input
    if (!age.trim()) {
      setError('Por favor, ingresa tu edad');
      return;
    }
    
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setError('Por favor, ingresa una edad válida (entre 1 y 120)');
      return;
    }
    
    // Show verifying state briefly
    setIsVerifying(true);
    
    // Simulate login process
    setTimeout(() => {
      setIsVerifying(false);
      // Navigate to home after successful login
      router.replace('/home');
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleGoBack}
              >
                <Ionicons name="arrow-back" size={24} color={Colors.darkGray} />
              </TouchableOpacity>
            </View>
            
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/logo.png')}
                style={styles.logo}
                defaultSource={require('../assets/logo.png')}
              />
              <Text style={styles.appName}>VisuMed</Text>
              <Text style={styles.tagline}>Visualiza y comprende tus estudios médicos</Text>
            </View>
            
            {/* Simple age form */}
            <View style={styles.formContainer}>
              <Text style={styles.welcomeText}>Bienvenido a VisuMed</Text>
              <Text style={styles.subtitle}>Para comenzar, por favor ingresa tu edad</Text>
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Edad"
                  placeholderTextColor={Colors.gray}
                  keyboardType="number-pad"
                  maxLength={3}
                  value={age}
                  onChangeText={setAge}
                />
                {age.length > 0 && (
                  <TouchableOpacity 
                    style={styles.clearButton}
                    onPress={() => setAge('')}
                  >
                    <Ionicons name="close-circle" size={20} color={Colors.gray} />
                  </TouchableOpacity>
                )}
              </View>
              
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  (!age || isVerifying) && styles.loginButtonDisabled,
                ]}
                onPress={handleLogin}
                disabled={!age || isVerifying}
              >
                {isVerifying ? (
                  <Text style={styles.loginButtonText}>Verificando...</Text>
                ) : (
                  <Text style={styles.loginButtonText}>Continuar</Text>
                )}
              </TouchableOpacity>
              
              <Text style={styles.privacyText}>
                Al continuar, aceptas nuestros <Text style={styles.linkText}>Términos y Condiciones</Text> y <Text style={styles.linkText}>Política de Privacidad</Text>
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.lightGreen,
    marginBottom: 15,
  },
  appName: {
    fontSize: 30,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 5,
  },
  tagline: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.darkGray,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 12,
    height: 55,
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: Colors.darkGray,
  },
  clearButton: {
    padding: 5,
  },
  errorText: {
    color: Colors.error,
    marginBottom: 15,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    backgroundColor: Colors.primary + '80', // Add opacity
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  privacyText: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
  linkText: {
    color: Colors.primary,
    fontWeight: '500',
  },
});