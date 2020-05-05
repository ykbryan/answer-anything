import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Modal from 'react-bootstrap/Modal';

import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Detail from './pages/Detail';
import Login from './pages/Login';
import Main from './pages/Main';

import Amplify from '@aws-amplify/core';
import Auth from '@aws-amplify/auth';
import { DataStore } from '@aws-amplify/datastore';
import { Room, RoomStatus } from './models';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

export default function App() {
  const [user, setUser] = useState(null);
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    await Auth.currentAuthenticatedUser()
      .then((user) => {
        console.log('yes');
        setUser(user);
      })
      .catch((err) => {
        console.log(err);
        setUser(null);
        if (!window.location.href.toString().includes('/login'))
          window.location.href = '/login';
      });
  }

  async function signOut() {
    await Auth.signOut();
    window.location.href = '/login';
  }

  const handleRoomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const addRoom = async () => {
    const title = inputText;
    await DataStore.save(
      new Room({
        title: title,
        rating: 0,
        status: RoomStatus.ACTIVE,
      })
    );
    setInputText('');
    handleClose();
  };

  return (
    <Router>
      <div className='App'>
        <header className='App-header'>
          <img src={logo} className='App-logo' alt='logo' />
          <h1>Q&A Rooms</h1>
          <p>
            <Button variant='outline-primary' href='/'>
              Home
            </Button>
            {user && (
              <Button variant='outline-primary' onClick={handleShow}>
                Add Room
              </Button>
            )}
            {!user ? (
              <Button variant='outline-danger' href='/login'>
                Login
              </Button>
            ) : (
              <Button variant='outline-danger' onClick={signOut}>
                Sign Out
              </Button>
            )}
          </p>
          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Modal heading</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <InputGroup className='mb-3'>
                <FormControl
                  placeholder='Add Room'
                  aria-label='Add Room'
                  aria-describedby='basic-addon2'
                  onChange={handleRoomInput}
                  value={inputText}
                />
              </InputGroup>
            </Modal.Body>
            <Modal.Footer>
              <Button variant='secondary' onClick={handleClose}>
                Close
              </Button>
              <Button variant='primary' onClick={addRoom}>
                Save Changes
              </Button>
            </Modal.Footer>
          </Modal>
        </header>
      </div>
      <div>
        <Switch>
          <Route path='/login'>
            <Login />
          </Route>
          <Route path={`/room/:topicId`}>
            <Detail />
          </Route>
          <Route path='/'>
            <Main />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}
