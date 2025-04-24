import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    // Navigate to the MRI viewer screen after 2 seconds
    const timer = setTimeout(() => {
      navigation.replace('MriViewer');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Ionicons name="medical-outline" size={40} color="#1a5276" />
        </View>
        <Text style={styles.logoText}>VisuMed</Text>
      </View>
      <Text style={styles.subtitle}>
        Visualiza y comprende tus estudios médicos
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#b3e0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#1a5276',
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.white,
    marginTop: 20,
    textAlign: 'center',
  },
});

export default SplashScreen;