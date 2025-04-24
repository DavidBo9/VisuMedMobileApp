import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated from 'react-native-reanimated';

const ProcessedImage = ({ source, brightness, contrast, style, onLoad }) => {
  // Clamp values for safety
  const safeBrightness = Math.max(0.5, Math.min(1.5, brightness));
  const safeContrast = Math.max(0.5, Math.min(1.5, contrast));
  
  // Calculate the filter style
  const imageFilters = {
    // For brightness, we use opacity combined with background color
    // Black background decreases brightness, white background increases it
    backgroundColor: safeBrightness > 1 ? '#FFFFFF' : '#000000',
    opacity: safeBrightness > 1 ? 
      2 - safeBrightness : // When brightening (1.0 - 1.5)
      safeBrightness,     // When darkening (0.5 - 1.0)
  };
  
  // For contrast, we adjust the tint color
  const contrastOverlay = (
    <View 
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: safeContrast < 1 ? 
            'rgba(128, 128, 128, ' + (1 - safeContrast) + ')' : // Lower contrast (more gray)
            'transparent',
          mixBlendMode: 'multiply'
        }
      ]} 
      pointerEvents="none"
    />
  );
  
  // For higher contrast, we use a different approach
  const highContrastOverlay = safeContrast > 1 ? (
    <BlurView
      style={StyleSheet.absoluteFill}
      tint="dark"
      intensity={(safeContrast - 1) * 50}
      pointerEvents="none"
    />
  ) : null;

  return (
    <View style={style}>
      <Animated.Image
        source={source}
        style={[
          StyleSheet.absoluteFill,
          imageFilters
        ]}
        resizeMode="contain"
        onLoad={onLoad}
      />
      {contrastOverlay}
      {highContrastOverlay}
    </View>
  );
};

export default ProcessedImage;