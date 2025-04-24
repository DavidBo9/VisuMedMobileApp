import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  SafeAreaView,
  Platform,
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
  darkGreen: '#4b8b6e',
  yellow: '#fffde7',
  orange: '#f4a261',
  tan: '#e9c49f',
  darkGray: '#333333',
  lightGray: '#f5f5f5',
  gray: '#888888',
};

// Sample news data
const newsData = [
  {
    id: '1',
    title: '¡Descuento Especial en Resonancia Magnética Cerebral por Aniversario!',
    date: '25-04-2025',
    content: 'Celebramos nuestro aniversario con un 20% de descuento en todos los estudios de Resonancia Magnética Cerebral durante el mes de mayo. ¡Agenda tu cita hoy mismo!'
  },
  {
    id: '2',
    title: 'Nueva Tecnología de Tomografía Computarizada de Baja Dosis Disponible',
    date: '12-03-2025',
    content: 'Incorporamos un nuevo equipo de TC de última generación que reduce significativamente la exposición a la radiación sin comprometer la calidad de las imágenes.'
  },
  {
    id: '3',
    title: 'Jornada de Electroencefalografía Gratuita',
    date: '24-02-2025',
    content: 'Ofrecemos una jornada especial con electroencefalogramas gratuitos para niños menores de 12 años durante la última semana de febrero. Cupos limitados.'
  },
];

// News card component
const NewsCard = ({ item }) => {
  return (
    <View style={styles.newsCard}>
      <View style={styles.newsCardHeader}>
        <Text style={styles.newsCardTitle}>{item.title}</Text>
      </View>
      <View style={styles.dateContainer}>
        <Text style={styles.dateText}>{item.date}</Text>
      </View>
      <View style={styles.newsCardContent}>
        <Text style={styles.newsCardText}>{item.content}</Text>
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  
  // Navigate to MRI viewer
  const navigateToMriViewer = () => {
    router.push('/mri-viewer');
  };
  
  // Navigate to login screen
  const navigateToLogin = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top || 20 }]}>
        <View style={styles.headerLogoContainer}>
          <Image 
            source={require('../assets/logo.png')} 
            style={styles.headerLogo}
            defaultSource={require('../assets/logo.png')}
          />
          <Text style={styles.headerTitle}>VisuMed</Text>
        </View>
        <TouchableOpacity style={styles.loginButton} onPress={navigateToLogin}>
          <Text style={styles.loginButtonText}>Ingresar</Text>
        </TouchableOpacity>
      </View>
      
      {/* News section */}
      <ScrollView style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Noticias y Promociones</Text>
        </View>
        
        {newsData.map(item => (
          <NewsCard key={item.id} item={item} />
        ))}
        
        {/* Features section */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresSectionTitle}>Nuestros Servicios</Text>
          
          <View style={styles.featuresGrid}>
            <TouchableOpacity style={styles.featureCard} onPress={navigateToMriViewer}>
              <Ionicons name="medical" size={32} color={Colors.primary} />
              <Text style={styles.featureTitle}>MRI Cerebral</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.featureCard}>
              <Ionicons name="pulse" size={32} color={Colors.primary} />
              <Text style={styles.featureTitle}>Tomografía</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.featureCard}>
              <Ionicons name="fitness" size={32} color={Colors.primary} />
              <Text style={styles.featureTitle}>Rayos X</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.featureCard}>
              <Ionicons name="heart" size={32} color={Colors.primary} />
              <Text style={styles.featureTitle}>Ultrasonido</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* About section */}
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>SaludDigna</Text>
          <Text style={styles.aboutText}>
            Ofrecemos servicios de diagnóstico médico de alta calidad a precios accesibles. 
            Nuestra misión es hacer que los servicios de salud sean accesibles para todos.
          </Text>
          <TouchableOpacity style={styles.learnMoreButton}>
            <Text style={styles.learnMoreText}>Conocer más</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Bottom navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="home" size={24} color={Colors.primary} />
          <Text style={styles.navTextActive}>Inicio</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton} onPress={navigateToMriViewer}>
          <Ionicons name="folder-open-outline" size={24} color={Colors.gray} />
          <Text style={styles.navText}>Estudios</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="calendar-outline" size={24} color={Colors.gray} />
          <Text style={styles.navText}>Citas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="person-outline" size={24} color={Colors.gray} />
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: Colors.primary,
  },
  headerLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    backgroundColor: '#b3e0ff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  loginButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  loginButtonText: {
    color: Colors.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    backgroundColor: Colors.lightGreen,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.darkGray,
  },
  newsCard: {
    margin: 10,
    backgroundColor: Colors.tan,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  newsCardHeader: {
    backgroundColor: Colors.orange,
    padding: 15,
  },
  newsCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  dateContainer: {
    position: 'absolute',
    top: 70,
    left: 15,
    backgroundColor: Colors.yellow,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    zIndex: 1,
  },
  dateText: {
    fontSize: 14,
    color: Colors.darkGray,
    fontWeight: '500',
  },
  newsCardContent: {
    padding: 15,
    paddingTop: 25,
  },
  newsCardText: {
    fontSize: 16,
    color: Colors.darkGray,
    lineHeight: 22,
  },
  featuresSection: {
    padding: 20,
    backgroundColor: Colors.white,
    marginTop: 20,
  },
  featuresSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.darkGray,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: Colors.lightGray,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  featureTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.darkGray,
    textAlign: 'center',
  },
  aboutSection: {
    padding: 20,
    backgroundColor: Colors.primary,
    marginVertical: 20,
  },
  aboutTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 16,
    color: Colors.white,
    lineHeight: 24,
    marginBottom: 20,
  },
  learnMoreButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  learnMoreText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.bottomNavBackground,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    borderTopWidth: 0,
    position: 'absolute',  // Add this
    bottom: 0,            // Add this
    left: 0,              // Add this
    right: 0,             // Add this
    zIndex: 10,           // Add this
  },
  navButton: {
    alignItems: 'center',
    padding: 8,
  },
  navText: {
    color: Colors.gray,
    fontSize: 12,
    marginTop: 2,
  },
  scrollViewContent: {
    paddingTop: 20,
    paddingBottom: 80, // Increase this value to ensure content isn't hidden behind the navbar
  },
  navTextActive: {
    color: Colors.primary,
    fontSize: 12,
    marginTop: 2,
    fontWeight: 'bold',
  },
});