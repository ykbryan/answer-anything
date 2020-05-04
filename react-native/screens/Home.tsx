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
import Auth from '@aws-amplify/auth';
import { DataStore } from '@aws-amplify/datastore';
import { Room, RoomStatus } from './../models';

export default function Home() {
  let [username, setUsername] = useState('');
  let [user, setUser] = useState('');
  let [otp, setOtp] = useState('');
  let [state, setState] = useState('notLogin');
  let [message, setMessage] = useState(
    'Use your phone number & +65 (country code) to login'
  );
  const [rooms, setRooms] = useState<Room[]>([]);
  const [room, setRoom] = useState('');

  const password = Math.random().toString(10) + 'Abc#';

  useEffect(() => {
    // checkAuth();

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

  const handleButton = () => {
    console.log('here');
    switch (state) {
      case 'notLogin':
        signIn();
        break;
      case 'otpLogin':
        sendChallenge();
        break;
      default:
        break;
    }
  };

  function signIn() {
    console.log(username);

    Auth.signIn(username)
      .then((user) => {
        console.log(user);
        setUser(user);
        setState('otpLogin');
      })
      .catch((e) => {
        if (e.code === 'UserNotFoundException') {
          console.log('go to sign up page', e);
          signUp(username);
        } else if (e.code === 'UserNotConfirmedException') {
          console.log('go to confirm', e);
          setMessage('user needs to confirm the account');
          setState('needConfirm');
          resendConfirmationCode(username);
        } else {
          console.log(e);
        }
      });
  }

  function signUp(username: string) {
    Auth.signUp({
      username,
      password,
      attributes: {
        phone_number: username,
      },
    });
    setState('needConfirm');
  }

  function signOut() {
    Auth.signOut();
    setState('notLogin');
    setMessage('');
    console.log('signOut');
  }

  function checkAuth() {
    Auth.currentAuthenticatedUser()
      .then((user) => {
        console.log('yes');
        console.log(user);
        setState('loggedIn');
      })
      .catch((err) => {
        console.log(err);
        setState('notLogin');
      });
  }

  function sendChallenge() {
    console.log('sendChallenge');
    Auth.sendCustomChallengeAnswer(user, otp)
      .then((user) => {
        setState('loggedIn');
        setMessage('successfully logged in');
        console.log(user);
      })
      .catch((err) => {
        setState('notLogin');
        setMessage('error logging in');
        console.log(err);
      });
  }

  function verifyCode() {
    console.log(username);
    console.log(otp);
    Auth.confirmSignUp(username, otp, {
      forceAliasCreation: true,
    })
      .catch((e) => {
        setState('notLogin');
        setMessage('Oops, probably wrong otp code?');
        console.log(e);
      })
      .then(() => {
        setState('notLogin');
        signIn();
      });
  }

  async function resendConfirmationCode(username: string) {
    try {
      await Auth.resendSignUp(username);
      console.log('code resent succesfully');
    } catch (err) {
      console.log('error resending code: ', err);
    }
  }

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
      <Item key={r.id}>
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
          <Button transparent>
            <Icon name='md-add' />
          </Button>
        </Right>
      </Header>
      <Content>
        <Text>Open up App.js to start working on your app! {message}</Text>
        <Item regular>
          <Input
            placeholder='Phone Number'
            keyboardType='phone-pad'
            onChangeText={(num) => setUsername(num)}
          />
        </Item>
        <Item last>
          <Input placeholder={state} onChangeText={(num) => setOtp(num)} />
        </Item>
        <Button onPress={handleButton}>
          <Text>Click Me!</Text>
        </Button>
        {renderRooms()}
      </Content>
    </Container>
  );
}
