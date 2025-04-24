import React, { useState, useRef } from 'react';
import { 
  View, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Animated,
  PanResponder,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Define colors locally to avoid import issues
const Colors = {
  primary: '#00a77e',
  background: '#000000',
  white: '#FFFFFF',
  lightGray: '#666666',
  darkGray: '#121212',
  toolButtonBg: '#FFFFFF',
};

const { width, height } = Dimensions.get('window');

const ImageViewer = ({ imageData, hideControls = false }) => {
  // Image manipulation state
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [lastScale, setLastScale] = useState(1);
  const [lastTranslateX, setLastTranslateX] = useState(0);
  const [lastTranslateY, setLastTranslateY] = useState(0);
  
  // Animation values
  const imageScale = useRef(new Animated.Value(1)).current;
  const imageTranslateX = useRef(new Animated.Value(0)).current;
  const imageTranslateY = useRef(new Animated.Value(0)).current;
  
  // Handle pinch and pan gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setLastScale(scale);
        setLastTranslateX(translateX);
        setLastTranslateY(translateY);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Handle movement with one finger (panning)
        if (evt.nativeEvent.touches.length === 1) {
          const newTranslateX = lastTranslateX + gestureState.dx;
          const newTranslateY = lastTranslateY + gestureState.dy;
          
          // Limit panning based on scale
          const maxTranslateX = (scale - 1) * width / 2;
          const maxTranslateY = (scale - 1) * height / 2;
          
          const boundedTranslateX = Math.min(maxTranslateX, Math.max(-maxTranslateX, newTranslateX));
          const boundedTranslateY = Math.min(maxTranslateY, Math.max(-maxTranslateY, newTranslateY));
          
          setTranslateX(boundedTranslateX);
          setTranslateY(boundedTranslateY);
          
          imageTranslateX.setValue(boundedTranslateX);
          imageTranslateY.setValue(boundedTranslateY);
        }
        // Handle movement with two fingers (pinching)
        else if (evt.nativeEvent.touches.length === 2) {
          const touch1 = evt.nativeEvent.touches[0];
          const touch2 = evt.nativeEvent.touches[1];
          
          const distance = Math.sqrt(
            Math.pow(touch1.pageX - touch2.pageX, 2) +
            Math.pow(touch1.pageY - touch2.pageY, 2)
          );
          
          const initialTouchesDistance = 150; // Approximate starting distance
          const newScale = Math.max(1, Math.min(3, lastScale * (distance / initialTouchesDistance)));
          
          setScale(newScale);
          imageScale.setValue(newScale);
        }
      },
      onPanResponderRelease: () => {
        // If scale is very close to 1, snap back to 1
        if (scale < 1.1) {
          resetImage();
        }
      },
    })
  ).current;
  
  // Reset image to original position and scale
  const resetImage = () => {
    Animated.parallel([
      Animated.spring(imageScale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(imageTranslateX, {
        toValue: 0,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(imageTranslateY, {
        toValue: 0,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setScale(1);
      setTranslateX(0);
      setTranslateY(0);
    });
  };
  
  // Double tap to zoom
  const handleDoubleTap = () => {
    if (scale > 1.5) {
      resetImage();
    } else {
      const newScale = 2;
      setScale(newScale);
      setTranslateX(0);
      setTranslateY(0);
      
      Animated.parallel([
        Animated.spring(imageScale, {
          toValue: newScale,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(imageTranslateX, {
          toValue: 0,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(imageTranslateY, {
          toValue: 0,
          friction: 3,
          tension: A40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  // Track last tap time for double tap detection
  const lastTapRef = useRef(0);
  const handleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      handleDoubleTap();
    }
    lastTapRef.current = now;
  };

  return (
    <View style={styles.container}>
      {/* Main Image with gestures */}
      <Animated.View
        style={[
          styles.imageContainer,
          {
            transform: [
              { scale: imageScale },
              { translateX: imageTranslateX },
              { translateY: imageTranslateY },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleTap}
          style={styles.imageWrapper}
        >
          <Image
            source={imageData?.image || require('../assets/placeholder.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Animated.View>
      
      {/* Image controls - only shown if not hidden by parent */}
      {!hideControls && (
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={resetImage}>
            <Ionicons name="refresh" size={24} color={Colors.white} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="add" size={24} color={Colors.white} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="remove" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  image: {
    width: width * 0.9,
    height: height * 0.6,
    backgroundColor: Colors.background,
  },
  controls: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    alignItems: 'center',
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
});

export default ImageViewer;