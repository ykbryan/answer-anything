import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppLoading } from 'expo';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

import Amplify from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);
import Main from './screens/Main';
import Login from './screens/Login';

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
  const [user, setUser] = useState(null);

  function checkAuth() {
    Auth.currentAuthenticatedUser()
      .then((user) => {
        console.log('yes');
        console.log(user);
        setUser(user);
      })
      .catch((err) => {
        console.log(err);
        setUser(null);
      });
  }
  useEffect(() => {
    setIsLoading(!isLoading);
    loadFonts();
    checkAuth();
  }, []);

  if (!isLoading) return <AppLoading />;
  return (
    <NavigationContainer>{user ? <Main /> : <Login />}</NavigationContainer>
  );
}
