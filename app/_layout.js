import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

// Define colors directly in this file to avoid import issues
const Colors = {
  background: '#f9f6e8', // Light cream background to match the screenshots
  primary: '#00a77e',
  white: '#FFFFFF'
};

export default function Layout() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <StatusBar style="dark-content" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'fade',
        }}
      />
    </View>
  );
}