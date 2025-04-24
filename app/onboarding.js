import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Dimensions, 
  TouchableOpacity,
  Image,
  StatusBar,
  TextInput,
  SafeAreaView,
  Platform,
  Animated,
  ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Modern color palette
const Colors = {
  primary: '#00a77e',
  primaryDark: '#007e5c',
  secondary: '#60c6a8',
  accent: '#f39c12',
  white: '#FFFFFF',
  black: '#212121',
  background: '#f8f9fa',
  textDark: '#2c3e50',
  textLight: '#7f8c8d',
  lightGreen: '#e3f2eb',
  shadow: 'rgba(0,0,0,0.08)',
  inputBg: '#f1f3f5',
};

const { width, height } = Dimensions.get('window');

// Onboarding data with placeholder images
// In production, you would replace these with your actual images
const slides = [
  {
    id: '1',
    title: 'Tus estudios en la palma de tu mano',
    description: 'Accede a tus resultados médicos en cualquier momento y desde cualquier lugar.',
    image: require('../assets/placeholder.png'), // Use your placeholder for now
    icon: 'medical-outline',
  },
  {
    id: '2',
    title: 'Visualiza tus estudios y pregunta con confianza',
    description: 'Observa tus imágenes médicas y marca lo que no entiendes para consultarlo con nuestros especialistas.',
    image: require('../assets/placeholder.png'),
    icon: 'eye-outline',
  },
  {
    id: '3',
    title: 'Entiende el proceso con apoyo de nuestro chat',
    description: 'Nuestro asistente está disponible para resolver tus dudas sobre tus estudios médicos.',
    image: require('../assets/placeholder.png'),
    icon: 'chatbubbles-outline',
  },
];

// Custom animated button component
const AnimatedButton = ({ title, onPress, isPrimary = true, icon, disabled = false }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };
  
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View 
        style={[
          styles.button,
          isPrimary ? styles.primaryButton : styles.secondaryButton,
          disabled && styles.disabledButton,
          { transform: [{ scale: scaleAnim }] }
        ]}
      >
        <Text 
          style={[
            styles.buttonText, 
            isPrimary ? styles.primaryButtonText : styles.secondaryButtonText
          ]}
        >
          {title}
        </Text>
        
        {icon && (
          <Ionicons 
            name={icon} 
            size={20} 
            color={isPrimary ? Colors.white : Colors.primary} 
            style={{ marginLeft: 6 }}
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Custom dot indicator component
const CustomDotIndicator = ({ totalDots, activeDotIndex }) => {
  return (
    <View style={styles.paginationContainer}>
      {Array.from({ length: totalDots }).map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.paginationDot,
            index === activeDotIndex ? styles.paginationDotActive : null,
          ]}
        />
      ))}
    </View>
  );
};

const OnboardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLogin, setShowLogin] = useState(false);
  const [age, setAge] = useState('');
  const [animateLogin, setAnimateLogin] = useState(false);
  const slideRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const loginFadeAnim = useRef(new Animated.Value(0)).current;
  const loginScaleAnim = useRef(new Animated.Value(0.9)).current;

  // Handle fade transition to login
  useEffect(() => {
    if (showLogin) {
      // Fade out onboarding
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
      
      // Fade in login
      Animated.parallel([
        Animated.timing(loginFadeAnim, {
          toValue: 1,
          duration: 600,
          delay: 300,
          useNativeDriver: true,
        }),
        Animated.spring(loginScaleAnim, {
          toValue: 1,
          friction: 7,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [showLogin]);
  
  // ADD THIS NEW useEffect for animation cleanup
  useEffect(() => {
    // Clean up animations when component unmounts
    return () => {
      fadeAnim.stopAnimation();
      loginFadeAnim.stopAnimation();
      loginScaleAnim.stopAnimation();
    };
  }, []);

  // Handle slide change
  const updateCurrentSlideIndex = (e) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentIndex(currentIndex);
  };
  
  // Move to next slide
  const goToNextSlide = () => {
    const nextSlideIndex = currentIndex + 1;
    if (nextSlideIndex < slides.length) {
      slideRef.current.scrollToIndex({ index: nextSlideIndex });
      setCurrentIndex(nextSlideIndex);
    } else {
      // Start fade animation to login screen
      setShowLogin(true);
    }
  };
  
  // Skip onboarding
  const skip = () => {
    setShowLogin(true);
  };
  
  // Handle login
  const handleLogin = async () => {
    try {
      // Store onboarding completed
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      
      // In a real app, you would validate the age
      // For now, we just check if they entered something
      if (age.trim()) {
        // Store age
        await AsyncStorage.setItem('userAge', age);
        
        // Navigate to home
        router.replace('/home-news');
      } else {
        // Show some validation error in a real app
        console.log('Please enter your age');
      }
    } catch (error) {
      console.log('Error saving onboarding status:', error);
    }
  };
  
  // Render slide item with animations
  const renderItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];
    
    const translateY = fadeAnim.interpolate({
      inputRange,
      outputRange: [100, 0, 100],
      extrapolate: 'clamp',
    });
    
    const opacity = fadeAnim.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: 'clamp',
    });
    
    const scale = fadeAnim.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    return (
        <View style={[styles.slide, { width }]}>
          <View style={styles.slideContentContainer}>
            {/* Image section with icon */}
            <View style={styles.imageContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name={item.icon} size={36} color={Colors.white} />
              </View>
              <Image
                source={item.image}
                style={styles.image}
                resizeMode="contain"
              />
            </View>
            
            {/* Text content */}
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        </View>
      );
    };
  
  // Render login screen
  const renderLoginScreen = () => {
    return (
      <Animated.View 
        style={[
          styles.loginContainer,
          { 
            opacity: loginFadeAnim,
            transform: [{ scale: loginScaleAnim }]
          }
        ]}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="medical-outline" size={40} color={Colors.white} />
          </View>
          <Text style={styles.logoText}>VisuMed</Text>
        </View>
        
        <Text style={styles.welcomeText}>
          Bienvenido a VisuMed
        </Text>
        
        <Text style={styles.loginDescription}>
          Para ofrecerte un mejor servicio, por favor ingresa tu edad:
        </Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu edad"
            keyboardType="number-pad"
            maxLength={3}
            value={age}
            onChangeText={setAge}
          />
          <View style={styles.inputIcon}>
            <Ionicons name="calendar-outline" size={20} color={Colors.textLight} />
          </View>
        </View>
        
        <View style={styles.loginButtonContainer}>
          <AnimatedButton 
            title="Continuar" 
            onPress={handleLogin}
            icon="arrow-forward"
            disabled={!age.trim()}
          />
        </View>
        
        <Text style={styles.termsText}>
          Al continuar, aceptas nuestros <Text style={styles.linkText}>Términos y Condiciones</Text> y <Text style={styles.linkText}>Política de Privacidad</Text>
        </Text>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {!showLogin ? (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
            <FlatList
            ref={slideRef}
            data={slides}
            renderItem={renderItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            bounces={false}
            scrollEventThrottle={16}
            decelerationRate="fast"
            keyExtractor={(item) => item.id}
            onMomentumScrollEnd={updateCurrentSlideIndex}
            snapToInterval={width}
            snapToAlignment="center"
            initialNumToRender={1}
            removeClippedSubviews={false}
            />
          
          <View style={styles.footer}>
            <CustomDotIndicator 
              totalDots={slides.length} 
              activeDotIndex={currentIndex} 
            />
            
            <View style={styles.buttonContainer}>
              <AnimatedButton 
                title="Saltar" 
                onPress={skip} 
                isPrimary={false}
              />
              
              <AnimatedButton 
                title={currentIndex === slides.length - 1 ? "Empezar" : "Siguiente"} 
                onPress={goToNextSlide}
                icon="arrow-forward"
              />
            </View>
          </View>
        </Animated.View>
      ) : (
        renderLoginScreen()
      )}
      
      {/* Beautiful gradient background */}
      <View style={styles.gradientBackground} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradientBackground: {
    position: 'absolute',
    width: width * 2,
    height: width * 2,
    borderRadius: width,
    backgroundColor: Colors.lightGreen,
    bottom: -width,
    left: -width / 2,
    zIndex: -1,
    opacity: 0.6,
  },
  slide: {
    width: width,
    flex: 1,
    backgroundColor: Colors.background,
  },
  slideContentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    backgroundColor: Colors.background,
  },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  imageContainer: {
    width: width * 0.8,
    height: height * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  iconCircle: {
    position: 'absolute',
    top: 10,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 1,
  },
  imageContainer: {
    width: width * 0.8,
    height: height * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    color: Colors.textDark,
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: Colors.textLight,
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    paddingHorizontal: 30,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 167, 126, 0.3)',
    marginHorizontal: 5,
  },
  paginationDotActive: {
    backgroundColor: Colors.primary,
    width: 20,
    borderRadius: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 25,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledButton: {
    backgroundColor: Colors.textLight,
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: Colors.white,
  },
  secondaryButtonText: {
    color: Colors.primary,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 15,
    textAlign: 'center',
  },
  loginDescription: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 167, 126, 0.2)',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textDark,
  },
  inputIcon: {
    padding: 10,
  },
  loginButtonContainer: {
    width: '100%',
    marginBottom: 30,
  },
  termsText: {
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    color: Colors.primary,
    fontWeight: '500',
  },
});

export default OnboardingScreen;