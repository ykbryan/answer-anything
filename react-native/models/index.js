// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const RoomStatus = {
  "ACTIVE": "ACTIVE",
  "INACTIVE": "INACTIVE"
};

const MessageStatus = {
  "ANSWERED": "ANSWERED",
  "UNANSWERED": "UNANSWERED"
};

const { Room, Message, Rate } = initSchema(schema);

export {
  Room,
  Message,
  Rate,
  RoomStatus,
  MessageStatus
};