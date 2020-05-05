import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Auth from '@aws-amplify/auth';
import { DataStore } from '@aws-amplify/datastore';
import { Room, Message, MessageStatus } from './../models';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import Modal from 'react-bootstrap/Modal';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';

export default function Detail() {
  let { topicId } = useParams();
  const [room, setRoom] = useState<Room>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState(null);
  const [show, setShow] = useState(false);
  const [inputText, setInputText] = useState('');
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    getRoom(topicId);
    getMessages(topicId);
    checkAuth();

    const subscription = DataStore.observe(Message).subscribe((msg) => {
      console.log(msg.model, msg.opType, msg.element);
      getMessages(topicId);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [topicId]);

  async function checkAuth() {
    await Auth.currentAuthenticatedUser()
      .then((user) => {
        setUser(user);
      })
      .catch((err) => {
        console.log(err);
        setUser(null);
      });
  }

  async function getRoom(roomId: string) {
    const result = await DataStore.query(Room, roomId);
    if (result) {
      setRoom(result);
    }
  }

  const removeRoom = async (roomId: string) => {
    await DataStore.delete(Room, roomId);
  };

  const handleRemoveRoom = () => {
    if (room) {
      removeRoom(room.id);
      window.location.href = '/';
    }
  };

  const renderMessages = () => {
    if (!messages) return <div></div>;
    return messages.map((msg) => (
      <ListGroup.Item key={msg.id}>
        {msg.content}{' '}
        {msg.owner === user.username && (
          <Button variant='danger' onClick={() => deleteQuestion(msg.id)}>
            Delete Qn
          </Button>
        )}
      </ListGroup.Item>
    ));
  };

  async function getMessages(room_id: string) {
    const result = (
      await DataStore.query(Message, (msg) =>
        msg.status('eq', MessageStatus.UNANSWERED)
      )
    ).filter((m) => m.room && m.room.id === room_id);
    setMessages(result);
  }

  async function deleteQuestion(message_id: string) {
    await DataStore.delete(Message, (m) => m.id('eq', message_id));
  }

  // function renderAnsweredButton(msg) {
  //   if (room.owner === user)
  //     return (
  //       <span>
  //         <Button
  //           type='primary'
  //           onClick={() => handleQuestion(MessageStatus.UNANSWERED, msg.id)}
  //         >
  //           Answered
  //         </Button>
  //       </span>
  //     );
  // }

  // function renderDeleteButton(msg) {
  //   let isDisabled = true;
  //   if (msg.owner === user) isDisabled = false;
  //   return (
  //     <span>
  //       <Button
  //         type='danger'
  //         disabled={isDisabled}
  //         onClick={() => handleQuestion(null, msg.id)}
  //       >
  //         Delete
  //       </Button>
  //     </span>
  //   );
  // }

  // function renderVoteButton(message_id) {
  //   let isVoted = isThisQuestionVoted(message_id);
  //   return (
  //     <Button
  //       disabled={isVoted}
  //       shape='circle'
  //       onClick={() => voteQuestion(message_id)}
  //     >
  //       +1
  //     </Button>
  //   );
  // }

  // async function handleQuestion(mark, id) {
  //   const original = await DataStore.query(Message, id);
  //   if (mark === MessageStatus.UNANSWERED) {
  //     await DataStore.save(
  //       Message.copyOf(original, (updated) => {
  //         updated.status = MessageStatus.ANSWERED;
  //       })
  //     );
  //   } else {
  //     await DataStore.delete(original);
  //   }
  // }

  // async function voteQuestion(message_id) {
  //   const message = await DataStore.query(Message, message_id);
  //   await DataStore.save(
  //     new Rate({
  //       message,
  //     })
  //   );
  // }

  // function isThisQuestionVoted(message_id) {
  //   const result = rates.filter(
  //     (m) => m.message && m.message.id === message_id && m.owner === user
  //   );
  //   if (result.length) return true;
  //   return false;
  // }

  const handleQnInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  async function addMessage() {
    await DataStore.save(
      new Message({
        content: inputText,
        status: MessageStatus.UNANSWERED,
        room,
      })
    );
    handleClose();
  }

  return (
    <div className='App'>
      {room && <h2>{room.title}</h2>}
      <h3>Requested topic ID: {topicId}</h3>
      {room && (
        <Button variant='danger' onClick={handleRemoveRoom}>
          Delete Room
        </Button>
      )}
      <Button variant='dark' onClick={handleShow}>
        Add Question
      </Button>
      <ListGroup>{renderMessages()}</ListGroup>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup className='mb-3'>
            <FormControl
              placeholder='Add Question'
              aria-label='Add Question'
              aria-describedby='basic-addon2'
              onChange={handleQnInput}
              value={inputText}
            />
          </InputGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={handleClose}>
            Close
          </Button>
          <Button variant='primary' onClick={addMessage}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
