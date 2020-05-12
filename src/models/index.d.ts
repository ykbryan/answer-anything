import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";

export enum RoomStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE"
}

export enum MessageStatus {
  ANSWERED = "ANSWERED",
  UNANSWERED = "UNANSWERED"
}

export declare class Post {
  readonly id: string;
  readonly title: string;
  readonly comments?: Comment[];
  constructor(init: ModelInit<Post>);
}

export declare class Comment {
  readonly postId: string;
  readonly content?: string;
  constructor(init: ModelInit<Comment>);
}

export declare class Room {
  readonly id: string;
  readonly title: string;
  readonly owner?: string;
  readonly status: RoomStatus | keyof typeof RoomStatus;
  readonly rating?: number;
  readonly messages?: Message[];
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<Room>);
  static copyOf(source: Room, mutator: (draft: MutableModel<Room>) => MutableModel<Room> | void): Room;
}

export declare class Message {
  readonly id: string;
  readonly content: string;
  readonly owner?: string;
  readonly room?: Room;
  readonly status: MessageStatus | keyof typeof MessageStatus;
  readonly rates?: Rate[];
  constructor(init: ModelInit<Message>);
  static copyOf(source: Message, mutator: (draft: MutableModel<Message>) => MutableModel<Message> | void): Message;
}

export declare class Rate {
  readonly id: string;
  readonly owner?: string;
  readonly message?: Message;
  constructor(init: ModelInit<Rate>);
  static copyOf(source: Rate, mutator: (draft: MutableModel<Rate>) => MutableModel<Rate> | void): Rate;
}