import axios from 'axios';
import { Message, Ack, QueuedMessage } from './types';

export class MulticastService {
  private processId: number;
  private logicalClock: number;
  private messageQueue: Map<string, QueuedMessage>;
  private totalProcesses: number;
  private peers: string[];
  private delayedAck: { messageId: string; delay: number } | null = null;

  constructor(processId: number, totalProcesses: number, peers: string[]) {
    this.processId = processId;
    this.logicalClock = Math.floor(Math.random() * 11); // 0-10
    this.messageQueue = new Map();
    this.totalProcesses = totalProcesses;
    this.peers = peers;
    console.log(`[Process ${this.processId}] Initialized with clock: ${this.logicalClock}`);
  }

  incrementClock(): void {
    this.logicalClock++;
  }

  updateClock(receivedTimestamp: number): void {
    this.logicalClock = Math.max(this.logicalClock, receivedTimestamp) + 1;
  }

  async sendMessage(content: string): Promise<Message> {
    this.incrementClock();
    
    const message: Message = {
      id: `msg-${this.processId}-${Date.now()}`,
      processId: this.processId,
      timestamp: this.logicalClock,
      content
    };

    console.log(`[Process ${this.processId}] Sending message: ${message.id} with timestamp ${message.timestamp}`);

    // Adiciona à própria fila
    this.addToQueue(message);

    // Envia para todos os outros processos (exclui a si mesmo)
    const promises = this.peers
      .filter((_, idx) => idx !== this.processId)
      .map(peer =>
        axios.post(`${peer}/multicast/receive`, message).catch(err => 
          console.error(`[Process ${this.processId}] Error sending to ${peer}:`, err.message)
        )
      );

    await Promise.all(promises);
    return message;
  }

  receiveMessage(message: Message): void {
    this.updateClock(message.timestamp);
    console.log(`[Process ${this.processId}] Received message: ${message.id} from Process ${message.processId}`);
    
    this.addToQueue(message);
    this.sendAck(message);
  }

  private addToQueue(message: Message): void {
    if (!this.messageQueue.has(message.id)) {
      this.messageQueue.set(message.id, {
        message,
        acks: new Set([message.processId]), // O remetente já conta como ACK
        canDeliver: false
      });
    }
  }

  private async sendAck(message: Message): Promise<void> {
    this.incrementClock();

    const ack: Ack = {
      messageId: message.id,
      processId: this.processId,
      timestamp: this.logicalClock
    };

    // Simula atraso se configurado
    if (this.delayedAck?.messageId === message.id) {
      console.log(`[Process ${this.processId}] ⏰ DELAYING ACK for ${message.id} by ${this.delayedAck.delay}ms`);
      await new Promise(resolve => setTimeout(resolve, this.delayedAck!.delay));
      console.log(`[Process ${this.processId}] ⏰ Delay finished, sending ACK now`);
    }

    console.log(`[Process ${this.processId}] Sending ACK for message ${message.id}`);

    // Envia ACK para todos os processos (incluindo o remetente e a si mesmo)
    const promises = this.peers.map(peer =>
      axios.post(`${peer}/multicast/ack`, ack).catch(err =>
        console.error(`[Process ${this.processId}] Error sending ACK to ${peer}:`, err.message)
      )
    );

    await Promise.all(promises);
  }

  receiveAck(ack: Ack): void {
    this.updateClock(ack.timestamp);
    
    const queuedMsg = this.messageQueue.get(ack.messageId);
    if (queuedMsg) {
      queuedMsg.acks.add(ack.processId);
      console.log(`[Process ${this.processId}] ACK received from ${ack.processId} for ${ack.messageId}. Total ACKs: ${queuedMsg.acks.size}/${this.totalProcesses}`);
      
      this.tryDeliver();
    }
  }

  private tryDeliver(): void {
    // Ordena mensagens por timestamp (e processId como desempate)
    const sortedMessages = Array.from(this.messageQueue.entries())
      .sort(([, a], [, b]) => {
        if (a.message.timestamp !== b.message.timestamp) {
          return a.message.timestamp - b.message.timestamp;
        }
        return a.message.processId - b.message.processId;
      });

    for (const [id, queuedMsg] of sortedMessages) {
      if (!queuedMsg.canDeliver && queuedMsg.acks.size === this.totalProcesses) {
        this.deliverMessage(queuedMsg.message);
        queuedMsg.canDeliver = true;
      }
    }
  }

  private deliverMessage(message: Message): void {
    console.log(`\n🎯 [Process ${this.processId}] DELIVERING MESSAGE:`);
    console.log(`   ID: ${message.id}`);
    console.log(`   From: Process ${message.processId}`);
    console.log(`   Timestamp: ${message.timestamp}`);
    console.log(`   Content: "${message.content}"`);
    console.log(`   Clock: ${this.logicalClock}\n`);
  }

  setDelayedAck(messageId: string, delay: number): void {
    this.delayedAck = { messageId, delay };
    console.log(`[Process ${this.processId}] Configured to delay ACK for ${messageId} by ${delay}ms`);
  }

  getQueue(): any[] {
    return Array.from(this.messageQueue.entries()).map(([id, q]) => ({
      id,
      message: q.message,
      acksReceived: q.acks.size,
      acksNeeded: this.totalProcesses,
      delivered: q.canDeliver
    }));
  }

  getStatus(): any {
    return {
      processId: this.processId,
      logicalClock: this.logicalClock,
      queueSize: this.messageQueue.size,
      totalProcesses: this.totalProcesses,
      delayedAck: this.delayedAck
    };
  }
}
