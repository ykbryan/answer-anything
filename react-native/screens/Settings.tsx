import React, { useState, useEffect } from 'react';
import {
  Container,
  Header,
  Left,
  Body,
  Right,
  Icon,
  Content,
  Input,
  List,
  ListItem,
  Text,
  Button,
} from 'native-base';
import { DataStore } from '@aws-amplify/datastore';
import Auth from '@aws-amplify/auth';
import { useNavigation } from '@react-navigation/native';

export default function Settings() {
  const navigation = useNavigation();
  const signout = async () => {
    await Auth.signOut();
    await DataStore.clear();
    navigation.navigate('Login');
  };
  return (
    <Container>
      <Header>
        <Left />
        <Body>
          <Text>Settings</Text>
        </Body>
        <Right />
      </Header>
      <Content>
        <List>
          <ListItem onPress={signout}>
            <Text>Sign Out</Text>
          </ListItem>
        </List>
      </Content>
    </Container>
  );
}
