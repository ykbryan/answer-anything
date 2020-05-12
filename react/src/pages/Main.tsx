import React, { useState, useEffect } from 'react';
import ListGroup from 'react-bootstrap/ListGroup';

import { DataStore } from '@aws-amplify/datastore';
import { Room, RoomStatus, Post } from './../models';

export default function Main() {
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    getAvailableRooms();
    const subscription = DataStore.observe(Room).subscribe((rm) => {
      console.log(rm.model, rm.opType, rm.element);
      getAvailableRooms();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const renderRooms = () => {
    if (!rooms || rooms.length === 0) return <div>No rooms</div>;
    return rooms.map((r) => (
      <ListGroup.Item key={r.id} action href={'/room/' + r.id}>
        {r.title}
      </ListGroup.Item>
    ));
  };

  const getPosts = async () => {
    const result = await DataStore.query(Post, (p) => p.title('ne', ''), {
      page: 0,
      limit: 10,
    });
    console.log(result);
  };

  const getAvailableRooms = async () => {
    const result = await DataStore.query(
      Room,
      (rm) => rm.title('ne', '').status('eq', RoomStatus.ACTIVE),
      {
        page: 0,
        limit: 10,
      }
    );

    if (result) {
      const arrangedRooms = result.sort((a, b) => {
        return (b.rating ? b.rating : 0) - (a.rating ? a.rating : 0);
      });
      setRooms(arrangedRooms);
    }
  };

  return <ListGroup>{renderRooms()}</ListGroup>;
}
