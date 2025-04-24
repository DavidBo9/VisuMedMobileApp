import React, { useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList,
  Dimensions,
  TouchableWithoutFeedback,
  Modal
} from 'react-native';
import ImageViewer from '../components/ImageViewer';
import Pagination from '../components/Pagination';
import BottomNavigation from '../components/BottomNavigation';
import Colors from '../constants/colors';
import { mriSequences } from '../constants/mriData';
import ChatScreen from './ChatScreen';

const { width } = Dimensions.get('window');

const MriViewerScreen = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('home');
  const [showChat, setShowChat] = useState(false);
  const flatListRef = useRef();

  // Handle pagination dot press
  const handleDotPress = (index) => {
    setActiveIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  // Handle bottom tab press
  const handleTabPress = (tab) => {
    setActiveTab(tab);
    // In a real app, you would navigate to different screens here
    // For this demo, we're just changing the active tab
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
  
  // Handle close button press
  const handleClose = () => {
    // In a real app, you might want to go back or close the viewer
    // For this demo, we'll just show the first MRI again
    setActiveIndex(0);
    flatListRef.current?.scrollToIndex({ index: 0, animated: true });
  };

  // Handle chat button press
  const handleChatPress = () => {
    // Primero cerramos el menú sin pasar callback
    toggleMenu();
    
    // Esperamos a que la animación termine antes de abrir el chat
    setTimeout(() => {
      setShowChat(true);
    }, 300);
  };

  // Handle viewable items changed
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <View style={styles.container}>
      {/* Main MRI viewer with horizontal paging */}
      <FlatList
        ref={flatListRef}
        data={mriSequences}
        renderItem={({ item }) => (
          <TouchableWithoutFeedback>
            <View style={styles.slide}>
              <ImageViewer 
                imageData={item} 
                onClose={handleClose}
                onChatPress={handleChatPress}
              />
            </View>
          </TouchableWithoutFeedback>
        )}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Pagination indicators */}
      <View style={styles.paginationContainer}>
        <Pagination 
          data={mriSequences} 
          activeIndex={activeIndex}
          onDotPress={handleDotPress}
        />
      </View>

      {/* Bottom navigation bar */}
      <BottomNavigation 
        activeTab={activeTab}
        onTabPress={handleTabPress}
      />

      {/* Chat modal */}
      <Modal 
  visible={showChat} 
  animationType="slide"
  onRequestClose={() => setShowChat(false)}
>
  {showChat && (
    <ChatScreen 
      currentMriType={currentMriType}
      onClose={() => setShowChat(false)}
    />
  )}
</Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  slide: {
    width,
    flex: 1,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 70,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});

export default MriViewerScreen;