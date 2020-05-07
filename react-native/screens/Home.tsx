import React, { useState, useEffect } from 'react';
import {
  Container,
  Header,
  Left,
  Body,
  Right,
  Icon,
  Content,
  List,
  ListItem,
  Text,
  Button,
} from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { Hub } from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import { DataStore } from '@aws-amplify/datastore';
import { Room, RoomStatus } from './../models';

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [room, setRoom] = useState('');
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    checkAuth();
    Hub.listen('auth', (data) => {
      const { payload } = data;
      // console.log(
      //   'A new auth event has happened: ',
      //   payload.event,
      //   payload.message
      // );
      if (!user && payload.event === 'signIn') {
        setUser(payload.data);
      } else if (user && payload.event === 'signOut') {
        setUser(null);
      }
    });
    console.log('useEffect checkAuth');
  }, []);

  useEffect(() => {
    if (user) {
      getAvailableRooms();
      const subscription = DataStore.observe(Room).subscribe(() => {
        getAvailableRooms();
      });
      console.log('useEffect subscription');
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  async function checkAuth() {
    await Auth.currentAuthenticatedUser()
      .then((user) => {
        setUser(user);
      })
      .catch((err) => {
        console.log(err);
        setUser(null);
        navigation.navigate('Login');
      });
  }

  const getAvailableRooms = async () => {
    if (user) {
      const result = await DataStore.query(Room, (rm) => rm.title('ne', ''), {
        page: 0,
        limit: 10,
      });
      // console.log(result);
      if (result) {
        // const arrangedRooms = result.sort((a, b) => {
        //   if (b.rating) {
        //     const aRating = parseInt(a.rating);
        //     const aRating = parseInt(a.rating);
        //     return parseInt(b.rating) - parseInt(a.rating);
        //   } else {
        //     return -1;
        //   }
        // });
        setRooms(result);
      }
    }
  };

  const addRoom = async () => {
    const title = room;
    await DataStore.save(
      new Room({
        title: title,
        rating: 0,
        status: RoomStatus.ACTIVE,
      })
    );
    setRoom('');
  };

  const renderRooms = () => {
    if (!rooms || rooms.length === 0) return <Text>No rooms</Text>;
    return rooms.map((r) => (
      <ListItem
        key={r.id}
        onPress={() => navigation.navigate('Detail', { roomId: r.id })}
      >
        <Text>{r.title}</Text>
      </ListItem>
    ));
  };

  return (
    <Container>
      <Header>
        <Left />
        <Body>
          <Text>Q&A Rooms</Text>
        </Body>
        <Right>
          <Button transparent onPress={() => navigation.navigate('Add')}>
            <Icon name='md-add' />
          </Button>
        </Right>
      </Header>
      <Content>
        <List>{renderRooms()}</List>
      </Content>
    </Container>
  );
}
