import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image,
  StatusBar,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
  SafeAreaView,
  Modal,
  Animated,
  Alert,
  Platform,
  PanResponder,
  ScrollView
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import ChatScreen from './chat';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import ViewShot from 'react-native-view-shot';
import Svg, { Path } from 'react-native-svg';
import axios from 'axios'; // Import axios for API requests

const { width, height } = Dimensions.get('window');

const Colors = {
  primary: '#00a77e',
  secondary: '#e74c3c',
  white: '#FFFFFF',
  black: '#000000',
  darkGray: '#333333',
  lightGray: '#cccccc',
  menuBackground: 'rgba(0,0,0,0.5)',
  bottomNavBackground: '#212121',
  sliderThumb: '#00a77e',
  sliderTrack: '#FFFFFF',
};

export default function MriViewerScreen() {
  // State management
  const [showChat, setShowChat] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentMriType] = useState('Ax T2 Flair');
  const [currentTool, setCurrentTool] = useState(null);
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [strokeColor, setStrokeColor] = useState('#ff0000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  
  // MRI Frame Navigation - Updated for dynamic loading
  const [mriFrames, setMriFrames] = useState([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Refs
  const menuAnimation = useRef(new Animated.Value(0)).current;
  const buttonRotation = useRef(new Animated.Value(0)).current;
  const viewShotRef = useRef(null);
  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);
  const currentToolRef = useRef(currentTool);
  const initialDistance = useRef(null);
  const scrollViewRef = useRef(null);
  const lastScrollY = useRef(0);
  const scrollThreshold = useRef(10); // Threshold to prevent accidental navigation
  const lastScrollTime = useRef(0);
  const scrollCooldown = useRef(150); // Milliseconds to wait between frame changes

  // Update current tool ref when state changes
  useEffect(() => {
    currentToolRef.current = currentTool;
  }, [currentTool]);

  // Fetch MRI frames from API
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(
          "https://backendhackaton-production.up.railway.app/api/studies/ee44d1f7-6fd75bcb-ae051007-677351ca-759382ea/images"
        );
        setMriFrames(response.data.images.map((img) => img.imageUrl));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching images:", error);
        setLoading(false);
        // Fallback to sample images if API fails
        setMriFrames([
          'https://orthancpinguland-production.up.railway.app/instances/005af106-9fe89706-b75d9012-19f710d8-effe0a36/frames/0/rendered?quality=90',
          'https://orthancpinguland-production.up.railway.app/instances/005af106-9fe89706-b75d9012-19f710d8-effe0a36/frames/1/rendered?quality=90',
          'https://orthancpinguland-production.up.railway.app/instances/005af106-9fe89706-b75d9012-19f710d8-effe0a36/frames/2/rendered?quality=90',
          'https://orthancpinguland-production.up.railway.app/instances/005af106-9fe89706-b75d9012-19f710d8-effe0a36/frames/3/rendered?quality=90',
          'https://orthancpinguland-production.up.railway.app/instances/005af106-9fe89706-b75d9012-19f710d8-effe0a36/frames/4/rendered?quality=90',
        ]);
      }
    };
    fetchImages();
  }, []);

  // Request media permissions
  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'We need access to save images.');
      }
    })();
  }, []);

  // Enhanced PanResponder for gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => 
        currentToolRef.current === 'zoom' || currentToolRef.current === 'annotate',
      onMoveShouldSetPanResponder: () => 
        currentToolRef.current === 'zoom' || currentToolRef.current === 'annotate',
      
      onPanResponderGrant: (evt) => {
        if (currentToolRef.current === 'annotate') {
          const { locationX, locationY } = evt.nativeEvent;
          setCurrentPath([{ x: locationX, y: locationY }]);
        } else if (currentToolRef.current === 'zoom') {
          lastTranslateX.current = translateX;
          lastTranslateY.current = translateY;
          lastScale.current = scale;
          
          if (evt.nativeEvent.touches.length === 2) {
            const touch1 = evt.nativeEvent.touches[0];
            const touch2 = evt.nativeEvent.touches[1];
            const dx = touch1.pageX - touch2.pageX;
            const dy = touch1.pageY - touch2.pageY;
            initialDistance.current = Math.sqrt(dx * dx + dy * dy);
          }
        }
      },
      
      onPanResponderMove: (evt, gestureState) => {
        if (currentToolRef.current === 'annotate') {
          const { locationX, locationY } = evt.nativeEvent;
          setCurrentPath(prev => [...prev, { x: locationX, y: locationY }]);
        } 
        else if (currentToolRef.current === 'zoom') {
          if (evt.nativeEvent.touches.length === 2) {
            const touch1 = evt.nativeEvent.touches[0];
            const touch2 = evt.nativeEvent.touches[1];
            const dx = touch1.pageX - touch2.pageX;
            const dy = touch1.pageY - touch2.pageY;
            const currentDistance = Math.sqrt(dx * dx + dy * dy);
            
            if (initialDistance.current) {
              const newScale = Math.max(1, Math.min(3, lastScale.current * (currentDistance / initialDistance.current)));
              setScale(newScale);
            }
          } else {
            setTranslateX(lastTranslateX.current + gestureState.dx / scale);
            setTranslateY(lastTranslateY.current + gestureState.dy / scale);
          }
        }
      },
      
      onPanResponderRelease: () => {
        if (currentToolRef.current === 'annotate' && currentPath.length > 1) {
          setPaths(prev => [...prev, { 
            points: currentPath, 
            color: strokeColor, 
            width: strokeWidth 
          }]);
          setCurrentPath([]);
        }
        initialDistance.current = null;
      }
    })
  ).current;

  // Helper functions
  const createPath = (points) => {
    if (!points || points.length < 2) return '';
    let path = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x},${points[i].y}`;
    }
    return path;
  };

  const toggleMenu = (onCloseCallback) => {
    if (!menuVisible) {
      setMenuVisible(true);
      Animated.parallel([
        Animated.spring(menuAnimation, {
          toValue: 1,
          friction: 7,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(buttonRotation, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(menuAnimation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(buttonRotation, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start(() => {
        setMenuVisible(false);
        onCloseCallback?.();
      });
    }
  };

  const handleToolPress = (tool) => {
    setCurrentTool(tool);
    toggleMenu();
  };

  const handleChatPress = () => {
    toggleMenu(() => setShowChat(true));
  };

  const resetImage = () => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
    lastScale.current = 1;
    lastTranslateX.current = 0;
    lastTranslateY.current = 0;
  };

  const clearDrawing = () => {
    setPaths([]);
    setCurrentPath([]);
  };

  const handleExport = async () => {
    try {
      if (!viewShotRef.current) {
        Alert.alert('Error', 'Could not capture image.');
        return;
      }
      
      const uri = await viewShotRef.current.capture();
      
      Alert.alert(
        'Export Image',
        'How would you like to save this image?',
        [
          { text: 'Share', onPress: () => handleShare(uri) },
          { text: 'Save to Gallery', onPress: () => handleSave(uri) },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to export image.');
    }
  };

  const handleShare = async (uri) => {
    try {
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert('Error', 'Sharing failed.');
    }
  };

  const handleSave = async (uri) => {
    try {
      const asset = await MediaLibrary.createAssetAsync(uri);
      const album = await MediaLibrary.getAlbumAsync('VisuMed');
      if (album) {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album.id, false);
      } else {
        await MediaLibrary.createAlbumAsync('VisuMed', asset, false);
      }
      Alert.alert('Success', 'Image saved to gallery!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save image.');
    }
  };

  const handleGoBack = () => {
    router.replace('/home-news');
  };

  // Improved Frame Navigation with Smooth Scrolling
  const handleScroll = (event) => {
    const now = Date.now();
    if (now - lastScrollTime.current < scrollCooldown.current) {
      return; // Prevent too frequent frame changes
    }
    
    const offsetY = event.nativeEvent.contentOffset.y;
    const direction = offsetY > lastScrollY.current ? 'down' : 'up';
    
    // Only change frames if the scroll is significant
    if (Math.abs(offsetY - lastScrollY.current) > scrollThreshold.current) {
      if (direction === 'down' && currentFrameIndex < mriFrames.length - 1) {
        setCurrentFrameIndex(prevIndex => prevIndex + 1);
        lastScrollTime.current = now;
      } else if (direction === 'up' && currentFrameIndex > 0) {
        setCurrentFrameIndex(prevIndex => prevIndex - 1);
        lastScrollTime.current = now;
      }
    }
    
    lastScrollY.current = offsetY;
  };

  // Handle manual frame navigation
  const changeFrame = (direction) => {
    if (direction === 'next' && currentFrameIndex < mriFrames.length - 1) {
      setCurrentFrameIndex(prevIndex => prevIndex + 1);
    } else if (direction === 'prev' && currentFrameIndex > 0) {
      setCurrentFrameIndex(prevIndex => prevIndex - 1);
    }
  };

  const rotateInterpolation = buttonRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg']
  });

  // Tool Components
  const AnnotateTool = () => (
    <View style={styles.toolContainer} pointerEvents="none">
      <Text style={styles.toolTitle}>Annotation Tool</Text>
      <View style={styles.colorOptions}>
        {['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ffffff'].map(color => (
          <TouchableOpacity 
            key={color}
            style={[
              styles.colorOption, 
              { backgroundColor: color },
              strokeColor === color && styles.selectedColor
            ]}
            onPress={() => setStrokeColor(color)}
          />
        ))}
      </View>
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Width:</Text>
        {/* Slider component would go here */}
      </View>
      <TouchableOpacity style={styles.resetButton} onPress={clearDrawing}>
        <Text style={styles.resetButtonText}>Clear All</Text>
      </TouchableOpacity>
    </View>
  );

  const ZoomInstructions = () => (
    <View style={styles.instructionsContainer} pointerEvents="none">
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

  const NavigationInstructions = () => (
    <View style={styles.instructionsContainer} pointerEvents="none">
      <Text style={styles.instructionsText}>
        • Scroll up/down to navigate between frames{"\n"}
        • Current frame: {currentFrameIndex + 1} of {mriFrames.length}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Loading MRI frames...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={styles.mainTitle}>Brain MRI</Text>
          <Text style={styles.subtitle}>{currentMriType}</Text>
        </View>
        
        <View style={styles.placeholderButton} />
      </View>
      
      {/* Frame Navigation Info */}
      <NavigationInstructions />
      
      {/* Main Image Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <ViewShot 
          ref={viewShotRef} 
          style={styles.imageContainer}
          options={{ format: 'jpg', quality: 0.9 }}
        >
          <View 
            style={styles.imageWrapper}
            {...panResponder.panHandlers}
          >
            <Animated.View
              style={[
                styles.imageAnimationContainer,
                {
                  transform: [
                    { translateX },
                    { translateY },
                    { scale }
                  ]
                }
              ]}
            >
              {mriFrames.length > 0 && (
                <Image 
                  source={{ uri: mriFrames[currentFrameIndex] }}
                  style={styles.image}
                  resizeMode="contain"
                />
              )}
              
              {/* Drawing overlay */}
              <View style={styles.drawingContainer}>
                <Svg height="100%" width="100%">
                  {paths.map((path, index) => (
                    <Path
                      key={`path-${index}`}
                      d={createPath(path.points)}
                      stroke={path.color}
                      strokeWidth={path.width}
                      fill="none"
                    />
                  ))}
                  {currentPath.length > 1 && (
                    <Path
                      d={createPath(currentPath)}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      fill="none"
                    />
                  )}
                </Svg>
              </View>
            </Animated.View>
          </View>
          
          {/* Tool UI Overlays */}
          {currentTool === 'annotate' && <AnnotateTool />}
          {currentTool === 'zoom' && <ZoomInstructions />}
        </ViewShot>
        
        {/* Add extra content for scrolling */}
        <View style={styles.scrollPadding} />
      </ScrollView>
      
      {/* Frame Navigation Controls */}
      <View style={styles.frameNavigation}>
        <TouchableOpacity 
          style={[styles.frameButton, currentFrameIndex === 0 && styles.disabledButton]}
          onPress={() => changeFrame('prev')}
          disabled={currentFrameIndex === 0}
        >
          <Ionicons name="arrow-up" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.frameText}>
          {currentFrameIndex + 1}/{mriFrames.length}
        </Text>
        <TouchableOpacity 
          style={[styles.frameButton, currentFrameIndex === mriFrames.length - 1 && styles.disabledButton]}
          onPress={() => changeFrame('next')}
          disabled={currentFrameIndex === mriFrames.length - 1}
        >
          <Ionicons name="arrow-down" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>
      
      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => router.replace('/home-news')}
        >
          <Ionicons name="home-outline" size={24} color={Colors.white} />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="folder" size={24} color={Colors.primary} />
          <Text style={styles.navTextActive}>Studies</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="person-outline" size={24} color={Colors.white} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Floating Action Button */}
      <Animated.View style={[styles.fabContainer, { transform: [{ rotate: rotateInterpolation }] }]}>
        <TouchableOpacity 
          style={styles.fabButton}
          onPress={toggleMenu}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={Colors.white} />
        </TouchableOpacity>
      </Animated.View>

      {/* Menu Modal */}
      {menuVisible && (
        <Modal transparent animationType="none" onRequestClose={toggleMenu}>
          <TouchableWithoutFeedback onPress={toggleMenu}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <Animated.View 
                  style={[
                    styles.menuContainer,
                    {
                      opacity: menuAnimation,
                      transform: [
                        { 
                          translateY: menuAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0]
                          })
                        }
                      ]
                    }
                  ]}
                >
                  <MenuOption 
                    icon="magnify" 
                    label="Zoom" 
                    onPress={() => handleToolPress('zoom')} 
                    active={currentTool === 'zoom'}
                  />
                  <MenuOption 
                    icon="pencil" 
                    label="Annotate" 
                    onPress={() => handleToolPress('annotate')} 
                    active={currentTool === 'annotate'}
                  />
                  <MenuOption 
                    icon="share-variant" 
                    label="Export" 
                    onPress={handleExport} 
                  />
                  <MenuOption 
                    icon="chat-processing" 
                    label="Consult" 
                    onPress={handleChatPress} 
                  />
                </Animated.View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      {/* Chat Modal */}
      <Modal visible={showChat} animationType="slide">
        <ChatScreen 
          currentMriType={currentMriType}
          onClose={() => setShowChat(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

// Menu Option Component
const MenuOption = ({ icon, label, onPress, active = false }) => (
  <TouchableOpacity style={styles.menuOption} onPress={onPress}>
    <View style={styles.labelContainer}>
      <Text style={styles.menuOptionText}>{label}</Text>
    </View>
    <View style={[styles.menuIconContainer, active && styles.activeIconContainer]}>
      <MaterialCommunityIcons name={icon} size={22} color={Colors.white} />
    </View>
  </TouchableOpacity>
);

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.white,
    fontSize: 18,
  },
  header: {
    backgroundColor: Colors.black,
    paddingTop: Platform.OS === 'android' ? 15 : 0,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderButton: {
    width: 40,
    height: 40,
  },
  titleContainer: {
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.primary,
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100, // Add padding for scrolling
  },
  scrollPadding: {
    height: 500, // Extra padding for scrolling
  },
  imageContainer: {
    width: '100%',
    height: height * 0.6,
    backgroundColor: Colors.black,
  },
  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imageAnimationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: width * 0.9,
    height: height * 0.5,
  },
  drawingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  toolContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    padding: 15,
    zIndex: 6,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 15,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sliderLabel: {
    width: 70,
    fontSize: 14,
    color: Colors.white,
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
  colorOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  selectedColor: {
    borderColor: Colors.white,
    borderWidth: 3,
  },
  instructionsContainer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    zIndex: 6,
    alignItems: 'center',
  },
  instructionsText: {
    color: Colors.white,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  frameNavigation: {
    position: 'absolute',
    right: 20,
    top: height / 2 - 60,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 25,
    padding: 10,
    alignItems: 'center',
    zIndex: 8,
  },
  frameButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  disabledButton: {
    backgroundColor: Colors.darkGray,
    opacity: 0.5,
  },
  frameText: {
    color: Colors.white,
    marginVertical: 5,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.bottomNavBackground,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 5,
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
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 120 : 100,
    zIndex: 10,
  },
  fabButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.menuBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    position: 'absolute',
    right: 20,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  labelContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  menuIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconContainer: {
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  menuOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
});