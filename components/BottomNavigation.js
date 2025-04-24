import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';

const BottomNavigation = ({ activeTab, onTabPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onTabPress('home')}
      >
        <Ionicons
          name="home"
          size={24}
          color={activeTab === 'home' ? Colors.primary : Colors.lightGray}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onTabPress('profile')}
      >
        <Ionicons
          name="person"
          size={24}
          color={activeTab === 'profile' ? Colors.primary : Colors.lightGray}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => onTabPress('messages')}
      >
        <Ionicons
          name="mail"
          size={24}
          color={activeTab === 'messages' ? Colors.primary : Colors.lightGray}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.mediumGray,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BottomNavigation;