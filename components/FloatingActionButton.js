import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Animated,
  Text,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Define colors locally
const Colors = {
  primary: '#00a77e',
  white: '#FFFFFF',
  background: '#000000',
  secondary: '#f4a261',
};

const FloatingActionButton = ({ onChatPress, onAnnotatePress, onMeasurePress, onContrastPress }) => {
  const [isOpen, setIsOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;
  
  // Animated values for each button
  const chatButtonAnimation = useRef(new Animated.Value(0)).current;
  const annotateButtonAnimation = useRef(new Animated.Value(0)).current;
  const measureButtonAnimation = useRef(new Animated.Value(0)).current;
  const contrastButtonAnimation = useRef(new Animated.Value(0)).current;
  
  // Handle opening and closing of the FAB menu
  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    
    // Animate the main button rotation
    Animated.spring(animation, {
      toValue,
      friction: 5,
      useNativeDriver: true,
    }).start();
    
    // Sequentially animate each tool button
    Animated.stagger(50, [
      Animated.spring(chatButtonAnimation, {
        toValue,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.spring(annotateButtonAnimation, {
        toValue,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.spring(measureButtonAnimation, {
        toValue,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.spring(contrastButtonAnimation, {
        toValue,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
    
    setIsOpen(!isOpen);
  };
  
  // Rotate the plus icon when the menu is opened
  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });
  
  // Translations for each button
  const chatTranslateY = chatButtonAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -60],
  });
  
  const annotateTranslateY = annotateButtonAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -120],
  });
  
  const measureTranslateY = measureButtonAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -180],
  });
  
  const contrastTranslateY = contrastButtonAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -240],
  });
  
  // Opacity for each button
  const opacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <View style={styles.container}>
      {/* Chat button */}
      <Animated.View 
        style={[
          styles.buttonContainer,
          { 
            opacity,
            transform: [{ translateY: chatTranslateY }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            toggleMenu();
            onChatPress();
          }}
        >
          <Ionicons name="chatbubble" size={20} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Consultar</Text>
        </View>
      </Animated.View>
      
      {/* Annotate button */}
      <Animated.View 
        style={[
          styles.buttonContainer,
          { 
            opacity,
            transform: [{ translateY: annotateTranslateY }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            toggleMenu();
            onAnnotatePress();
          }}
        >
          <Ionicons name="pencil" size={20} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Anotar</Text>
        </View>
      </Animated.View>
      
      {/* Measure button */}
      <Animated.View 
        style={[
          styles.buttonContainer,
          { 
            opacity,
            transform: [{ translateY: measureTranslateY }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            toggleMenu();
            onMeasurePress();
          }}
        >
          <Ionicons name="resize" size={20} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Medida</Text>
        </View>
      </Animated.View>
      
      {/* Contrast button */}
      <Animated.View 
        style={[
          styles.buttonContainer,
          { 
            opacity,
            transform: [{ translateY: contrastTranslateY }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            toggleMenu();
            onContrastPress();
          }}
        >
          <Ionicons name="contrast" size={20} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.labelContainer}>
          <Text style={styles.label}>Contraste</Text>
        </View>
      </Animated.View>
      
      {/* Main FAB button */}
      <TouchableOpacity 
        style={styles.mainButton}
        onPress={toggleMenu}
        activeOpacity={0.7}
      >
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Ionicons name="add" size={30} color={Colors.white} />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    alignItems: 'center',
    zIndex: 999,
  },
  mainButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    position: 'absolute',
    right: 55,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  label: {
    color: Colors.white,
    fontSize: 12,
  },
});

export default FloatingActionButton;