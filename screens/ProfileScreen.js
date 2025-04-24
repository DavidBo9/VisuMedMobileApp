import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import BottomNavigation from '../components/BottomNavigation';

const ProfileScreen = ({ navigation }) => {
  const handleTabPress = (tab) => {
    if (tab === 'home') {
      navigation.navigate('MriViewer');
    }
    // Other tabs would be handled in a full implementation
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
        </View>

        <ScrollView style={styles.content}>
          {/* User info section */}
          <View style={styles.userSection}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle" size={80} color={Colors.primary} />
            </View>
            <Text style={styles.userName}>Juan Pérez</Text>
            <Text style={styles.userInfo}>ID: 123456789</Text>
          </View>

          {/* Options list */}
          <View style={styles.optionsContainer}>
            <TouchableOpacity style={styles.optionItem}>
              <Ionicons name="document-text" size={24} color={Colors.primary} />
              <Text style={styles.optionText}>Mis Estudios</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.lightGray} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem}>
              <Ionicons name="notifications" size={24} color={Colors.primary} />
              <Text style={styles.optionText}>Notificaciones</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.lightGray} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem}>
              <Ionicons name="calendar" size={24} color={Colors.primary} />
              <Text style={styles.optionText}>Mis Citas</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.lightGray} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem}>
              <Ionicons name="settings" size={24} color={Colors.primary} />
              <Text style={styles.optionText}>Configuración</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.lightGray} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem}>
              <Ionicons name="help-circle" size={24} color={Colors.primary} />
              <Text style={styles.optionText}>Ayuda</Text>
              <Ionicons name="chevron-forward" size={20} color={Colors.lightGray} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.logoutButton}>
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Bottom navigation */}
        <BottomNavigation 
          activeTab="profile"
          onTabPress={handleTabPress}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === 'ios' ? 0 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  content: {
    flex: 1,
    paddingBottom: 70, // Space for bottom navigation
  },
  userSection: {
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingVertical: 30,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.darkGray,
    marginBottom: 5,
  },
  userInfo: {
    fontSize: 16,
    color: Colors.lightGray,
  },
  optionsContainer: {
    backgroundColor: Colors.white,
    paddingVertical: 10,
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.darkGray,
    marginLeft: 15,
  },
  logoutButton: {
    backgroundColor: Colors.white,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 30,
  },
  logoutText: {
    fontSize: 16,
    color: 'red',
    fontWeight: 'bold',
  },
});

export default ProfileScreen;