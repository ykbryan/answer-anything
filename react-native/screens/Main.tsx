import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './Home';
import LoginScreen from './Login';
import DetailScreen from './Detail';
import AddroomScreen from './Addroom';
import SettingsScreen from './Settings';

const Stack = createStackNavigator();
const HomeStack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name == 'Home') iconName = 'ios-home';
          else if (route.name == 'History') iconName = 'ios-globe';
          else if (route.name == 'Settings') iconName = 'ios-settings';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        options={() => ({
          title: 'Home',
        })}
        name='Home'
        component={HomeScreen}
      />
      <Tab.Screen
        options={() => ({
          title: 'Settings',
        })}
        name='Settings'
        component={SettingsScreen}
      />
    </Tab.Navigator>
  );
};

const StackNavigator = () => {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        options={() => ({
          title: 'Settings',
          headerShown: false,
        })}
        name='HomeTabNavigator'
        component={TabNavigator}
      />
      <HomeStack.Screen
        options={() => ({
          headerShown: false,
        })}
        name='Detail'
        component={DetailScreen}
      />
      <HomeStack.Screen
        options={() => ({
          headerShown: false,
        })}
        name='Add'
        component={AddroomScreen}
      />
    </HomeStack.Navigator>
  );
};

export default function Main() {
  return (
    <Stack.Navigator
      screenOptions={{ gestureEnabled: true, gestureDirection: 'horizontal' }}
      headerMode='float'
      mode='modal'
    >
      <Stack.Screen
        options={({ route }) => ({
          headerShown: false,
        })}
        name='HomeStack'
        component={StackNavigator}
      />
      <Stack.Screen
        options={() => ({
          headerShown: false,
        })}
        name='Login'
        component={LoginScreen}
      />
    </Stack.Navigator>
  );
}
