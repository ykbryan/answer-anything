import React, { useState, useEffect } from 'react';
import {
  Container,
  Header,
  Left,
  Body,
  Right,
  Icon,
  Content,
  Item,
  Text,
  Button,
} from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { DataStore } from '@aws-amplify/datastore';
import { Room, RoomStatus } from './../models';

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [room, setRoom] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    getAvailableRooms();
    const subscription = DataStore.observe(Room).subscribe((rm) => {
      console.log('subscription');
      console.log(rm.model, rm.opType, rm.element);
      getAvailableRooms();
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getAvailableRooms = async () => {
    const result = await DataStore.query(Room, (rm) => rm.title('ne', ''), {
      page: 0,
      limit: 10,
    });

    console.log('getAvailableRooms');
    console.log(result);
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

  const removeRoom = async (roomId: string) => {
    await DataStore.delete(Room, roomId);
  };

  const renderRooms = () => {
    if (!rooms || rooms.length === 0) return <Text>No rooms</Text>;
    return rooms.map((r) => (
      <Item key={r.id} onPress={() => alert('enter')}>
        <Text>{r.title}</Text>
        <Button onPress={() => removeRoom(r.id)}>
          <Text>Remove</Text>
        </Button>
      </Item>
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
      <Content>{renderRooms()}</Content>
    </Container>
  );
}
