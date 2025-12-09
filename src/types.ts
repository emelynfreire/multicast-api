export interface Message {
  id: string;
  processId: number;
  timestamp: number;
  content: string;
}

export interface Ack {
  messageId: string;
  processId: number;
  timestamp: number;
}

export interface QueuedMessage {
  message: Message;
  acks: Set<number>;
  canDeliver: boolean;
}

export interface MutexRequest {
  processId: number;
  timestamp: number;
}

export interface ElectionMessage {
  processId: number;
  type: 'ELECTION' | 'OK' | 'COORDINATOR';
}
