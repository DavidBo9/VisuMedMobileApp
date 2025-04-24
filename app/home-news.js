import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

// Modern, elegant color palette
const Colors = {
  primary: '#00a77e',            // Main green color (kept from original)
  secondary: '#60c6a8',          // Lighter green for accents
  white: '#FFFFFF',
  lightBg: '#f7f9fc',            // Very light background
  cardBg: '#FFFFFF',             // White card background
  textDark: '#2c3e50',           // Dark text color
  textLight: '#7f8c8d',          // Light text color for descriptions
  accentOrange: '#f39c12',       // Soft orange for accents
  divider: '#ecf0f1',            // Light divider color
  shadow: 'rgba(0,0,0,0.08)',    // Subtle shadow
  bottomNavBackground: '#212121' // Kept from original
};

// Sample news data
const newsData = [
  {
    id: '1',
    title: '¡Descuento Especial en Resonancia Magnética Cerebral por Aniversario!',
    date: '25-04-2025',
    description: 'Celebramos nuestro aniversario con un 20% de descuento en todos los estudios de Resonancia Magnética Cerebral durante el mes de mayo. ¡Agenda tu cita hoy mismo!',
    icon: 'gift-outline'
  },
  {
    id: '2',
    title: 'Nueva Tecnología de Tomografía Computarizada de Baja Dosis Disponible',
    date: '12-03-2025',
    description: 'Incorporamos un nuevo equipo de TC de última generación que reduce significativamente la exposición a la radiación sin comprometer la calidad de las imágenes.',
    icon: 'pulse-outline'
  },
  {
    id: '3',
    title: 'Jornada de Electroencefalografía Gratuita',
    date: '24-02-2025',
    description: 'Ofrecemos una jornada especial con electroencefalografías gratuitas para pacientes referidos. Consulta requisitos y disponibilidad en nuestras sucursales.',
    icon: 'medkit-outline'
  },
  {
    id: '4',
    title: 'Ampliamos Horarios de Atención',
    date: '15-01-2025',
    description: 'Para tu comodidad, ahora atendemos en horario extendido de lunes a sábado de 7:00 AM a 9:00 PM. ¡Porque tu salud no espera!',
    icon: 'time-outline'
  },
];

// Modern News Card Component with sleek animations
const NewsCard = ({ title, date, description, icon, onPress, index }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 500,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });
  
  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  
  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <TouchableOpacity 
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.97}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={20} color={Colors.white} />
          </View>
          <Text style={styles.date}>{date}</Text>
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.divider} />
          <Text style={styles.description}>{description}</Text>
        </View>
        
        <View style={styles.cardFooter}>
          <Text style={styles.readMore}>Leer más</Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function HomeNewsScreen() {
  // Animation for header
  const headerAnimation = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(headerAnimation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const headerTranslateY = headerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0],
  });
  
  const headerOpacity = headerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  
  const navigateToMriViewer = () => {
    router.push('/mri-viewer');
  };
  
  const handleNewsPress = (item) => {
    // In a real app, this would navigate to a news detail page
    console.log('Pressed news item:', item.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Animated Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          }
        ]}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Noticias y Promociones</Text>
          <View style={styles.headerIndicator} />
        </View>
      </Animated.View>
      
      {/* News content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {newsData.map((item, index) => (
          <NewsCard
            key={item.id}
            title={item.title}
            date={item.date}
            description={item.description}
            icon={item.icon}
            onPress={() => handleNewsPress(item)}
            index={index}
          />
        ))}
        
        {/* Extra space at bottom for better scrolling - adjust based on bottom nav height */}
        <View style={{ height: 100 }} />
      </ScrollView>
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="home-outline" size={24} color={Colors.primary} />
          <Text style={styles.navTextActive}>Inicio</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navButton}
          onPress={navigateToMriViewer}
        >
          <Ionicons name="folder-outline" size={24} color={Colors.white} />
          <Text style={styles.navText}>Estudios</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="person-outline" size={24} color={Colors.white} />
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightBg,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 10 : 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  headerContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 8,
  },
  headerIndicator: {
    width: 40,
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: 15,
    paddingBottom: 80, // Ensure content is not hidden by bottom nav
  },
  cardContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 10,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  readMore: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
    marginRight: 4,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.bottomNavBackground,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    borderTopWidth: 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  navButton: {
    alignItems: 'center',
    padding: 8,
  },
  navText: {
    color: Colors.white,
    fontSize: 14,
    marginTop: 4,
  },
  navTextActive: {
    color: Colors.primary,
    fontSize: 14,
    marginTop: 4,
    fontWeight: 'bold',
  },
});