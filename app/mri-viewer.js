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
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import ChatScreen from './chat';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import ViewShot from 'react-native-view-shot';
import Svg, { Path } from 'react-native-svg';
import axios from 'axios';

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
  const [chatError, setChatError] = useState(null);
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
  
  // MRI Frame Navigation
  const [mriFrames, setMriFrames] = useState([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isChangingFrame, setIsChangingFrame] = useState(false);
  
  // Export states
  const [exportLoading, setExportLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportType, setExportType] = useState(null);

  // Refs
  const menuAnimation = useRef(new Animated.Value(0)).current;
  const buttonRotation = useRef(new Animated.Value(0)).current;
  const viewShotRef = useRef(null);
  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);
  const currentToolRef = useRef(currentTool);
  const initialDistance = useRef(null);
  const lastTouchTime = useRef(0);
  const frameOpacity = useRef(new Animated.Value(1)).current;
  const mriFrameRefs = useRef([]);
  
  // Update current tool ref when state changes
  useEffect(() => {
    currentToolRef.current = currentTool;
  }, [currentTool]);

  // Fetch MRI frames from API
  useEffect(() => {
    const fetchImages = async () => {
      try {
        console.log("Fetching images from API...");
        const response = await axios.get(
          "https://backendhackaton-production.up.railway.app/api/studies/ee44d1f7-6fd75bcb-ae051007-677351ca-759382ea/images"
        );
        
        if (response.data && response.data.images) {
          const frames = response.data.images.map(img => img.imageUrl);
          setMriFrames(frames);
          setLoading(false);
        } else {
          throw new Error("Invalid API response format");
        }
      } catch (error) {
        console.error("Error fetching images:", error);
        // Fallback to sample images if API fails
        const fallbackFrames = Array(5).fill().map((_, index) => 
          `https://orthancpinguland-production.up.railway.app/instances/005af106-9fe89706-b75d9012-19f710d8-effe0a36/frames/${index}/rendered?quality=90`
        );
        setMriFrames(fallbackFrames);
        setLoading(false);
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

  // Custom pan responder for swiping between frames
  const imagePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const { dx, dy } = gestureState;
        
        if (currentToolRef.current === 'annotate' || currentToolRef.current === 'zoom') {
          return true;
        }
        
        // Only handle vertical swipes if no tool is active
        return Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx);
      },
      
      onPanResponderGrant: (evt, gestureState) => {
        if (isChangingFrame) return;
        
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
        } else {
          // For frame navigation, store the start time
          lastTouchTime.current = Date.now();
        }
      },
      
      onPanResponderMove: (evt, gestureState) => {
        if (isChangingFrame) return;
        
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
      
      onPanResponderRelease: (_, gestureState) => {
        if (isChangingFrame) return;
        
        if (currentToolRef.current === 'annotate' && currentPath.length > 1) {
          setPaths(prev => [...prev, { 
            points: currentPath, 
            color: strokeColor, 
            width: strokeWidth 
          }]);
          setCurrentPath([]);
        } else if (!currentToolRef.current || currentToolRef.current === '') {
          // Handle frame navigation with vertical swipe
          const now = Date.now();
          const timeDiff = now - lastTouchTime.current;
          const { dy } = gestureState;
          
          // Detect swipe velocity
          const isQuickSwipe = timeDiff < 300 && Math.abs(dy) > 50;
          const isLongSwipe = Math.abs(dy) > 100;
          
          if (isQuickSwipe || isLongSwipe) {
            if (dy > 0 && currentFrameIndex > 0) {
              // Swipe down - go to previous frame
              changeFrame('prev');
            } else if (dy < 0 && currentFrameIndex < mriFrames.length - 1) {
              // Swipe up - go to next frame
              changeFrame('next');
            }
          }
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

  const toggleMenu = () => {
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
      });
    }
  };

  const handleToolPress = (tool) => {
    setCurrentTool(tool);
    toggleMenu();
  };

  const handleChatPress = () => {
    console.log("Botón de chat presionado");
    try {
      // Cerrar el menú primero
      toggleMenu();
      
      // Retrasar la apertura del chat
      setTimeout(() => {
        try {
          console.log("Intentando abrir chat");
          setShowChat(true);
        } catch (error) {
          console.error("Error al abrir chat:", error);
          setChatError(error.message);
          
          // Mostrar alerta al usuario
          Alert.alert(
            "Error",
            "No se pudo abrir el chat. Por favor, intenta de nuevo.",
            [{ text: "OK" }]
          );
        }
      }, 300);
    } catch (error) {
      console.error("Error en handleChatPress:", error);
    }
  };
  
  const handleCloseChat = () => {
    console.log("Cerrando chat");
    try {
      setShowChat(false);
      setChatError(null);
    } catch (error) {
      console.error("Error al cerrar chat:", error);
    }
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

  // New export functionality
  const handleExport = async () => {
    if (!viewShotRef.current) {
      Alert.alert('Error', 'Could not capture image.');
      return;
    }
    
    Alert.alert(
      'Export Options',
      'What would you like to export?',
      [
        { text: 'Current Frame', onPress: () => exportCurrentFrame() },
        { text: 'All Frames as Sequence', onPress: () => exportAsSequence() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const exportCurrentFrame = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      
      Alert.alert(
        'Export Current Frame',
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

  // Helper function to capture a single frame
  const captureFrame = async (index) => {
    try {
      // Save current index to restore later
      const originalIndex = currentFrameIndex;
      
      // Temporarily change to the frame we want to capture
      setCurrentFrameIndex(index);
      
      // Wait for render
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Capture the frame with explicit options for better reliability
      const uri = await viewShotRef.current.capture({
        format: 'jpg',
        quality: 0.9,
        result: 'data-uri'
      });
      
      // Restore original frame
      if (originalIndex !== index) {
        setCurrentFrameIndex(originalIndex);
      }
      
      return uri;
    } catch (error) {
      console.error(`Error capturing frame ${index}:`, error);
      return null;
    }
  };

  // Export all frames as a sequence of images
  const exportAsSequence = async () => {
    try {
      setExportLoading(true);
      setExportType('sequence');
      setExportProgress(0);
      
      // Create directory for frames - use a direct path without parent directories
      const tempDir = `${FileSystem.cacheDirectory}mri_frames/`;
      
      // Make sure the directory exists, create if needed
      const dirInfo = await FileSystem.getInfoAsync(tempDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });
      }
      
      // Capture all frames
      const frameUris = [];
      for (let i = 0; i < mriFrames.length; i++) {
        setExportProgress((i / mriFrames.length) * 90); // First 90% progress
        const uri = await captureFrame(i);
        if (uri) {
          // Instead of moving, copy the file to avoid permission issues
          const filename = `${tempDir}frame_${i.toString().padStart(3, '0')}.jpg`;
          
          // Read the file data and write it to the new location
          try {
            const fileContent = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
            await FileSystem.writeAsStringAsync(filename, fileContent, { encoding: FileSystem.EncodingType.Base64 });
            frameUris.push(filename);
          } catch (copyError) {
            console.error(`Error copying frame ${i}:`, copyError);
            // If copy fails, just use the original URI
            frameUris.push(uri);
          }
        }
      }
      
      setExportProgress(100);
      
      // Create a zip-like structure for sharing multiple files
      // Since we can't create a zip file in Expo without native modules,
      // we'll offer to save all frames to gallery or share them individually
      
      Alert.alert(
        'Frames Captured',
        `Successfully captured ${frameUris.length} frames. What would you like to do?`,
        [
          { 
            text: 'Save All to Gallery', 
            onPress: () => saveAllFramesToGallery(frameUris)
          },
          { 
            text: 'Share First Frame', 
            onPress: () => handleShare(frameUris[0])
          },
          { 
            text: 'Cancel', 
            style: 'cancel',
            onPress: () => cleanupTempFiles(tempDir)
          },
        ]
      );
    } catch (error) {
      console.error('Error creating sequence:', error);
      Alert.alert('Error', 'Failed to export frames.');
    } finally {
      setExportLoading(false);
      setExportType(null);
    }
  };
  
  // Save all frames to gallery
  const saveAllFramesToGallery = async (frameUris) => {
    try {
      const assets = [];
      let savedCount = 0;
      
      for (let i = 0; i < frameUris.length; i++) {
        try {
          const asset = await MediaLibrary.createAssetAsync(frameUris[i]);
          if (asset) {
            assets.push(asset);
            savedCount++;
          }
        } catch (err) {
          console.error(`Error saving frame ${i}:`, err);
          // Continue with other frames
        }
      }
      
      if (assets.length > 0) {
        // Create or get album
        try {
          const album = await MediaLibrary.getAlbumAsync('VisuMed');
          if (album) {
            await MediaLibrary.addAssetsToAlbumAsync(assets, album.id, false);
          } else {
            await MediaLibrary.createAlbumAsync('VisuMed', assets[0], false);
          }
          
          Alert.alert('Success', `${savedCount} of ${frameUris.length} frames saved to gallery!`);
        } catch (albumErr) {
          console.error('Error creating album:', albumErr);
          Alert.alert('Partial Success', `${savedCount} frames saved, but couldn't create album.`);
        }
      } else {
        Alert.alert('Error', 'Could not save any frames to gallery.');
      }
      
      // Clean up temp files
      cleanupTempFiles();
    } catch (error) {
      console.error('Error saving to gallery:', error);
      Alert.alert('Error', 'Failed to save frames to gallery.');
    }
  };
  
  // Clean up temporary files
  const cleanupTempFiles = async (tempDir) => {
    if (tempDir) {
      try {
        await FileSystem.deleteAsync(tempDir, { idempotent: true });
      } catch (error) {
        console.error('Error cleaning up temp files:', error);
      }
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
      Alert.alert('Success', `${exportType ? exportType.toUpperCase() : 'Image'} saved to gallery!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to save media.');
    }
  };

  const handleGoBack = () => {
    router.replace('/home-news');
  };

  const changeFrame = (direction) => {
    if (isChangingFrame) return;
    
    let newIndex = currentFrameIndex;
    
    if (direction === 'next' && currentFrameIndex < mriFrames.length - 1) {
      newIndex = currentFrameIndex + 1;
    } else if (direction === 'prev' && currentFrameIndex > 0) {
      newIndex = currentFrameIndex - 1;
    } else {
      return; // No change needed
    }
    
    setIsChangingFrame(true);
    
    // Animate the transition
    Animated.sequence([
      Animated.timing(frameOpacity, {
        toValue: 0.5,
        duration: 80,
        useNativeDriver: true
      }),
      Animated.timing(frameOpacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true
      })
    ]).start(() => {
      setIsChangingFrame(false);
    });
    
    // Update frame index
    setCurrentFrameIndex(newIndex);
  };

  const rotateInterpolation = buttonRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg']
  });

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
        • Swipe up/down to navigate between frames{"\n"}
        • Current frame: {currentFrameIndex + 1} of {mriFrames.length}
      </Text>
    </View>
  );

  // Export Progress Modal
  const ExportProgressModal = () => (
    <Modal transparent visible={exportLoading} animationType="fade">
      <View style={styles.progressModalOverlay}>
        <View style={styles.progressModalContent}>
          <Text style={styles.progressModalTitle}>
            {exportType === 'sequence' ? 'Exporting Frames' : 'Exporting Image'}
          </Text>
          <ActivityIndicator size="large" color={Colors.primary} style={styles.progressSpinner} />
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${exportProgress}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(exportProgress)}%</Text>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Cargando frames...</Text>
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
          <Text style={styles.mainTitle}>Scan Cerebro</Text>
          <Text style={styles.subtitle}>{currentMriType}</Text>
        </View>
        
        <View style={styles.placeholderButton} />
      </View>
      
      {/* Frame Navigation Info */}
      <NavigationInstructions />
      
      {/* Main Image Display Area */}
      <View 
        style={styles.mainImageContainer}
        {...imagePanResponder.panHandlers}
      >
        <ViewShot 
          ref={viewShotRef} 
          style={styles.imageContainer}
          options={{ format: 'jpg', quality: 0.9 }}
        >
          <Animated.View
            style={[
              styles.imageAnimationContainer,
              {
                transform: [
                  { translateX },
                  { translateY },
                  { scale }
                ],
                opacity: frameOpacity
              }
            ]}
          >
            {/* Current MRI Frame */}
            {mriFrames.length > 0 && (
              <View style={styles.imageWrapper}>
                <Image 
                  source={{ uri: mriFrames[currentFrameIndex] }}
                  style={styles.image}
                  resizeMode="contain"
                />
              </View>
            )}
            
            {/* Drawing overlay */}
            <View style={styles.drawingContainer}>
              <Svg height="100%" width="100%">
                {paths.map((path, pathIndex) => (
                  <Path
                    key={`path-${pathIndex}`}
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
        </ViewShot>
      </View>
      
      {/* Tool UI Overlays */}
      {currentTool === 'annotate' && <AnnotateTool />}
      {currentTool === 'zoom' && <ZoomInstructions />}
      
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
          <Text style={styles.navText}>Inicio</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="folder" size={24} color={Colors.primary} />
          <Text style={styles.navTextActive}>Estudios</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="person-outline" size={24} color={Colors.white} />
          <Text style={styles.navText}>Perfil</Text>
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
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
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
                    label="Anotar" 
                    onPress={() => handleToolPress('annotate')} 
                    active={currentTool === 'annotate'}
                  />
                  <MenuOption 
                    icon="share-variant" 
                    label="Exportar" 
                    onPress={handleExport} 
                  />
                  <MenuOption 
                    icon="chat-processing" 
                    label="Consultar" 
                    onPress={handleChatPress} 
                  />
                </Animated.View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

{/* Chat Modal - Versión mejorada */}
<Modal 
  visible={showChat} 
  animationType="slide"
  onRequestClose={handleCloseChat}
  transparent={false}
  hardwareAccelerated={true}
>
  {showChat && (
    <View style={{flex: 1, backgroundColor: Colors.black}}>
      {chatError ? (
        <SafeAreaView style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{color: Colors.white, fontSize: 18, textAlign: 'center', marginHorizontal: 20}}>
            Ocurrió un error al cargar el chat.
          </Text>
          <TouchableOpacity 
            style={{
              marginTop: 20,
              backgroundColor: Colors.primary,
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 20
            }}
            onPress={handleCloseChat}
          >
            <Text style={{color: Colors.white, fontSize: 16}}>Cerrar</Text>
          </TouchableOpacity>
        </SafeAreaView>
      ) : (
        <ChatScreen 
          currentMriType={currentMriType}
          onClose={handleCloseChat}
        />
      )}
    </View>
  )}
</Modal>

      {/* Export Progress Modal */}
      <ExportProgressModal />
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
    marginTop: 10,
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
  mainImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageAnimationContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 0.9,
    height: width * 0.9,
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
  // New styles for export progress modal
  progressModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressModalContent: {
    width: width * 0.8,
    backgroundColor: Colors.darkGray,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  progressModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 15,
  },
  progressSpinner: {
    marginBottom: 15,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  progressText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: 'bold',
  },
});