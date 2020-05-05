import React, { useState } from 'react';
import Auth from '@aws-amplify/auth';

import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export default function Login() {
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

  async function sendChallenge() {
    console.log('sendChallenge', user, otp);
    await Auth.sendCustomChallengeAnswer(user, otp)
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

  async function verifyCode() {
    console.log('verifyCode', username, otp);
    await Auth.confirmSignUp(username, otp, {
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

  function renderEntireOtpInputForm() {
    if (state === 'otpLogin' || state === 'needConfirm')
      return (
        <InputGroup className='mb-3'>
          <FormControl
            placeholder='Your OTP'
            aria-label='Your OTP'
            aria-describedby='form-otp-login'
            onChange={handleOtp}
          />
          <InputGroup.Append>
            {state !== 'needConfirm' ? (
              <Button variant='outline-secondary' onClick={sendChallenge}>
                OTP Login
              </Button>
            ) : (
              <Button variant='outline-secondary' onClick={verifyCode}>
                OTP Confirm
              </Button>
            )}
          </InputGroup.Append>
        </InputGroup>
      );
  }

  function renderEntireLoginInputForm() {
    if (state !== 'loggedIn') {
      return (
        <InputGroup className='mb-3'>
          <FormControl
            placeholder='Your Phone Number (+65)'
            aria-label='Your Phone Number (+65)'
            aria-describedby='form-phone-number'
            onChange={handleUsername}
          />
          <InputGroup.Append>
            <Button variant='outline-secondary' onClick={signIn}>
              Login
            </Button>
          </InputGroup.Append>
        </InputGroup>
      );
    }
  }
  return (
    <Container>
      <Row>
        <Col>
          <h1>Q&A Rooms</h1>
          <p>{message}</p>
          {renderEntireLoginInputForm()}
          {renderEntireOtpInputForm()}
        </Col>
      </Row>
    </Container>
  );
}
