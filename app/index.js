import React, { useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  Animated, 
  Dimensions,
  StatusBar,
  SafeAreaView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Define colors
const Colors = {
  primary: '#00a77e',      // Green color
  secondary: '#f4a261',    // Orange color
  lightGreen: '#e6f7d9',   // Light green background 
  white: '#FFFFFF',
  background: '#f9f6e8',   // Light cream background
};

export default function SplashScreen() {
  // Animation values
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const wavePosition = useRef(new Animated.Value(height)).current;
  const secondWavePosition = useRef(new Animated.Value(height)).current;
  
  useEffect(() => {
    // Reset onboarding for demo purposes
    const resetOnboarding = async () => {
      try {
        await AsyncStorage.removeItem('onboardingCompleted');
        console.log('Onboarding reset for demo');
      } catch (error) {
        console.log('Error resetting onboarding:', error);
      }
    };
    
    resetOnboarding();
    
    // Start animation sequence
    Animated.sequence([
      // Fade in logo
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      
      // Scale up logo
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      
      // Bring in waves
      Animated.stagger(200, [
        Animated.timing(wavePosition, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(secondWavePosition, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    
    // Navigate after the animation completes
    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Logo and Title with Animation */}
      <Animated.View 
        style={[
          styles.contentContainer, 
          { 
            opacity: logoOpacity,
            transform: [{ scale: logoScale }]
          }
        ]}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="medical-outline" size={40} color="#1a5276" />
          </View>
          <Text style={styles.logoText}>VisuMed</Text>
        </View>
        
        <Text style={styles.subtitle}>
          Visualiza y comprende tus estudios médicos
        </Text>
      </Animated.View>
      
      {/* Bottom wave decorations with animation */}
      <Animated.View 
        style={[
          styles.orangeWave, 
          { transform: [{ translateY: wavePosition }] }
        ]}
      />
      
      <Animated.View 
        style={[
          styles.greenWave, 
          { transform: [{ translateY: secondWavePosition }] }
        ]}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGreen,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#b3e0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#1a5276',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.primary,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#547038',
    marginTop: 10,
    textAlign: 'center',
    maxWidth: '80%',
    fontWeight: '500',
  },
  orangeWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.25,
    backgroundColor: Colors.secondary,
    borderTopRightRadius: width * 0.5,
  },
  greenWave: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: width * 0.5,
    height: height * 0.15,
    backgroundColor: Colors.lightGreen,
    borderTopLeftRadius: width * 0.25,
  },
});