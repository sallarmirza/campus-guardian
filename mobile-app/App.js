import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/context/AuthContext';
import { CameraProvider } from './src/context/CameraContext';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';
import IncidentsScreen from './src/screens/IncidentsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CameraProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <Stack.Navigator 
              initialRouteName="Login"
              screenOptions={{
                headerStyle: {
                  backgroundColor: '#3B82F6',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            >
              <Stack.Screen 
                name="Login" 
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="Home" 
                component={HomeScreen}
                options={{ title: 'Campus Guardian' }}
              />
              <Stack.Screen 
                name="Camera" 
                component={CameraScreen}
                options={{ title: 'Camera Monitor' }}
              />
              <Stack.Screen 
                name="Incidents" 
                component={IncidentsScreen}
                options={{ title: 'My Reports' }}
              />
              <Stack.Screen 
                name="Settings" 
                component={SettingsScreen}
                options={{ title: 'Settings' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </CameraProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}