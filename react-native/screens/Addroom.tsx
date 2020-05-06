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
  Item,
  Text,
  Button,
} from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { DataStore } from '@aws-amplify/datastore';
import { Room, RoomStatus } from './../models';

export default function Addroom() {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const addRoom = async () => {
    if (title.length > 0) {
      await DataStore.save(
        new Room({
          title: title,
          rating: 0,
          status: RoomStatus.ACTIVE,
        })
      );
      navigation.goBack();
    } else {
      alert('Enter something pls..');
    }
  };
  return (
    <Container>
      <Header>
        <Left>
          <Button transparent onPress={navigation.goBack}>
            <Icon name='ios-arrow-back' />
          </Button>
        </Left>
        <Body>
          <Text>New Room</Text>
        </Body>
        <Right />
      </Header>
      <Content>
        <Item>
          <Input
            placeholder='Add New Room'
            value={title}
            onChangeText={(newTitle) => setTitle(newTitle)}
          />
        </Item>
        <Button block onPress={addRoom}>
          <Text>Add Room</Text>
        </Button>
      </Content>
    </Container>
  );
}
