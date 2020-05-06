import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppLoading } from 'expo';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

import Main from './screens/Main';

import Amplify from '@aws-amplify/core';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

const loadFonts = async () => {
  // for native-base
  await Font.loadAsync({
    Roboto: require('native-base/Fonts/Roboto.ttf'),
    Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
    ...Ionicons.font,
  });
};

export default function App() {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(!isLoading);
    loadFonts();
  }, []);

  if (!isLoading) return <AppLoading />;
  return (
    <NavigationContainer>
      <Main />
    </NavigationContainer>
  );
}
