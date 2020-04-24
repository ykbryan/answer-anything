import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';

import Amplify from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

function App() {
  let [username, setUsername] = useState('');
  let [user, setUser] = useState('');
  let [otp, setOtp] = useState('');
  let [state, setState] = useState('notLogin');
  let [message, setMessage] = useState(
    'Use your phone number & +65 (country code) to login'
  );

  const password = Math.random().toString(10) + 'Abc#';

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

  function handleUsername(e: React.ChangeEvent<HTMLInputElement>) {
    setUsername(e.target.value);
  }

  function handleOtp(e: React.ChangeEvent<HTMLInputElement>) {
    setOtp(e.target.value);
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

  function renderOtpButton() {
    if (state === 'otpLogin') {
      return (
        <Button variant='outline-secondary' onClick={sendChallenge}>
          OTP Login
        </Button>
      );
    }
  }

  function renderConfirmButton() {
    if (state === 'needConfirm') {
      return (
        <Button variant='outline-secondary' onClick={verifyCode}>
          Confirm
        </Button>
      );
    }
  }

  function renderSignOutButton() {
    if (state === 'loggedIn') {
      return (
        <p>
          <Button variant='outline-danger' onClick={signOut}>
            Sign Out
          </Button>
        </p>
      );
    }
  }

  function renderEntireOtpInputForm() {
    if (state === 'otpLogin' || state === 'needConfirm')
      return (
        <div>
          <InputGroup className='mb-3'>
            <FormControl
              placeholder='Your OTP'
              aria-label='Your OTP'
              aria-describedby='basic-addon2'
              onChange={handleOtp}
            />
            <InputGroup.Append>
              {renderOtpButton()}
              {renderConfirmButton()}
            </InputGroup.Append>
          </InputGroup>
        </div>
      );
  }

  function renderEntireLoginInputForm() {
    if (state !== 'loggedIn') {
      return (
        <div>
          <InputGroup className='mb-3'>
            <FormControl
              placeholder='Your Phone Number'
              aria-label='Your Phone Number'
              aria-describedby='basic-addon2'
              onChange={handleUsername}
            />
            <InputGroup.Append>
              <Button variant='outline-secondary' onClick={signIn}>
                Login
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </div>
      );
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <div className='App'>
      <header className='App-header'>
        <img src={logo} className='App-logo' alt='logo' />
        <h1>Custom OTP Auth Flow</h1>
        <p>{message}</p>
        {renderEntireLoginInputForm()}
        {renderEntireOtpInputForm()}
        <p>
          <Button variant='outline-primary' onClick={checkAuth}>
            Am I sign in?
          </Button>
        </p>
        {renderSignOutButton()}
      </header>
    </div>
  );
}

export default App;
