// ZoomSystem.js
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, PanResponder } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
// Add at the top with other imports
import { Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  runOnJS
} from 'react-native-reanimated';

const Colors = {
  primary: '#00a77e',
  white: '#FFFFFF',
};

export const useZoomGestures = (onUpdate, resetImage) => {
    const scale = useSharedValue(0.8); // Start slightly zoomed out
    const savedScale = useSharedValue(0.8);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);
  
  const updateExternalState = (x, y, s) => {
    if (onUpdate) {
      onUpdate(x, y, s);
    }
  };
  
  const resetValues = () => {
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedScale.value = 1;
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
    runOnJS(updateExternalState)(0, 0, 1);
  };
  
  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onUpdate((event) => {
      let newScale = savedScale.value * event.scale;
      // Clamp scale between 0.5 and 3
      newScale = Math.max(0.5, Math.min(3, newScale));
      scale.value = newScale;
      runOnJS(updateExternalState)(translateX.value, translateY.value, newScale);
    });
    
    const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      // Calculate maximum allowed pan based on current scale
      const maxPanX = (scale.value - 1) * (width * 0.45); // Using the width now available
      const maxPanY = (scale.value - 1) * (height * 0.45);
      
      // Apply pan with limits
      translateX.value = Math.max(-maxPanX, Math.min(maxPanX, savedTranslateX.value + event.translationX));
      translateY.value = Math.max(-maxPanY, Math.min(maxPanY, savedTranslateY.value + event.translationY));
      
      runOnJS(updateExternalState)(translateX.value, translateY.value, scale.value);
    });
    
  const combinedGestures = Gesture.Simultaneous(pinchGesture, panGesture);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });
  
  return {
    gesture: combinedGestures,
    animatedStyle,
    resetZoom: resetValues,
    getCurrentValues: () => ({ x: translateX.value, y: translateY.value, scale: scale.value })
  };
};

export const ZoomInstructions = ({ resetImage }) => {
  return (
    <View style={styles.instructionsContainer}>
      <Text style={styles.instructionsText}>
        • Pinch with two fingers to zoom{"\n"}
        • Drag to pan the image{"\n"}
        • Tap "Reset" to return to original
      </Text>
      <TouchableOpacity style={styles.resetButton} onPress={resetImage}>
        <Text style={styles.resetButtonText}>Reset</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  instructionsContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    padding: 15,
    zIndex: 6,
  },
  instructionsText: {
    color: Colors.white,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 15,
  },
  resetButton: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 10, 
    alignItems: 'center',
    marginTop: 10,
  },
  resetButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});