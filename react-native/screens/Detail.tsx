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
  Form,
} from 'native-base';
import Auth from '@aws-amplify/auth';
import { DataStore } from '@aws-amplify/datastore';
import { Room, Message, MessageStatus } from './../models';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  Detail: { roomId: string };
};
type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>;

export default function Detail() {
  const navigation = useNavigation();
  const route = useRoute<DetailScreenRouteProp>();
  const roomId = route ? route.params.roomId : 'error';
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [room, setRoom] = useState<Room>();
  const [messages, setMessages] = useState<Message[]>();

  useEffect(() => {
    checkAuth();
    console.log('useEffect checkAuth');
  }, []);

  useEffect(() => {
    if (user) {
      getRoom(roomId);
      getMessages(roomId);
      console.log('useEffect get*');

      const subscription = DataStore.observe(Message).subscribe((msg) => {
        console.log(msg.model, msg.opType, msg.element);
        getMessages(roomId);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [roomId, user]);

  const getRoom = async (roomId: string) => {
    const result = await DataStore.query(Room, roomId);
    if (result) {
      setRoom(result);
    }
  };

  async function getMessages(room_id: string) {
    const result = (
      await DataStore.query(Message, (msg) =>
        msg.status('eq', MessageStatus.UNANSWERED)
      )
    ).filter((m) => m.room && m.room.id === room_id);
    setMessages(result);
  }

  const deleteMessage = async (message_id: string) => {
    await DataStore.delete(Message, message_id);
  };

  const addMessage = async () => {
    if (message.length > 0) {
      await DataStore.save(
        new Message({
          content: message,
          status: MessageStatus.UNANSWERED,
          room,
        })
      );
      setMessage('');
    } else {
      alert('Please enter something in the qn...');
    }
  };

  const removeRoom = async () => {
    if (room) {
      await DataStore.delete(Room, roomId);
      navigation.goBack();
    }
  };

  async function checkAuth() {
    await Auth.currentAuthenticatedUser()
      .then((user) => {
        setUser(user);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const renderMessages = () => {
    if (!user || !messages || messages.length === 0)
      return <Text>No questions yet</Text>;
    return messages.map((msg) => (
      <Item key={msg.id}>
        <Text>{msg.content} </Text>
        {msg.owner === user.username && (
          <Button danger onPress={() => deleteMessage(msg.id)}>
            <Text>Delete Qn</Text>
          </Button>
        )}
      </Item>
    ));
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
          <Text>{room ? room.title : 'Loading...'}</Text>
        </Body>
        <Right />
      </Header>
      <Content>
        <Text>Request Topic ID: {roomId}</Text>
        {renderMessages()}
        <Form>
          <Item last rounded>
            <Input
              placeholder='Add Your Question'
              value={message}
              onChangeText={(newMessage) => setMessage(newMessage)}
            />
          </Item>
          <Button onPress={addMessage}>
            <Text>Enter Question</Text>
          </Button>
        </Form>
        {room && user && room.owner === user.username && (
          <Button danger block onPress={removeRoom}>
            <Text>Delete Room</Text>
          </Button>
        )}
      </Content>
    </Container>
  );
}
