import React, { useState, useEffect } from 'react';
import Auth from '@aws-amplify/auth';
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

export default function Login() {
  const navigation = useNavigation();
  let [username, setUsername] = useState('');
  let [user, setUser] = useState('');
  let [otp, setOtp] = useState('');
  let [state, setState] = useState('notLogin');
  let [message, setMessage] = useState(
    'Use your phone number & +65 (country code) to login'
  );

  const password = Math.random().toString(10) + 'Abc#';

  const handleButton = () => {
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
    Auth.signIn(username)
      .then((user) => {
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
      .then(() => {
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
      .then(() => {
        setState('loggedIn');
        setMessage('successfully logged in');
        navigation.navigate('Home');
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

  return (
    <Container>
      <Header />
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
      </Content>
    </Container>
  );
}
