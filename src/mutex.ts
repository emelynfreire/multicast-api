import axios from 'axios';
import { MutexRequest } from './types';

export class MutexService {
  private processId: number;
  private logicalClock: number;
  private requestQueue: MutexRequest[];
  private peers: string[];
  private inCriticalSection: boolean;
  private waitingForReplies: number;
  private totalProcesses: number;
  private deferredReplies: Set<number>; // Adiciona controle de respostas adiadas

  constructor(processId: number, totalProcesses: number, peers: string[]) {
    this.processId = processId;
    this.logicalClock = 0;
    this.requestQueue = [];
    this.peers = peers;
    this.inCriticalSection = false;
    this.waitingForReplies = 0;
    this.totalProcesses = totalProcesses;
    this.deferredReplies = new Set();
  }

  async requestAccess(): Promise<void> {
    this.logicalClock++;
    
    const request: MutexRequest = {
      processId: this.processId,
      timestamp: this.logicalClock
    };

    this.requestQueue.push(request);
    this.requestQueue.sort((a, b) => 
      a.timestamp !== b.timestamp ? a.timestamp - b.timestamp : a.processId - b.processId
    );

    console.log(`[Process ${this.processId}] Requesting mutex access at timestamp ${this.logicalClock}`);

    this.waitingForReplies = this.totalProcesses - 1;

    // Envia requisição para todos os peers
    const promises = this.peers.map(peer =>
      axios.post(`${peer}/mutex/request`, request).catch(err =>
        console.error(`Error sending mutex request to ${peer}:`, err.message)
      )
    );

    await Promise.all(promises);
  }

  receiveRequest(request: MutexRequest): void {
    this.logicalClock = Math.max(this.logicalClock, request.timestamp) + 1;
    
    this.requestQueue.push(request);
    this.requestQueue.sort((a, b) => 
      a.timestamp !== b.timestamp ? a.timestamp - b.timestamp : a.processId - b.processId
    );

    console.log(`[Process ${this.processId}] Received mutex request from Process ${request.processId} with timestamp ${request.timestamp}`);

    // Decide se envia resposta imediatamente ou adia
    const myRequest = this.requestQueue.find(r => r.processId === this.processId);
    
    if (!this.inCriticalSection && (!myRequest || this.hasHigherPriority(request))) {
      // Envia resposta imediatamente
      this.sendReply(request.processId);
    } else {
      // Adia resposta
      console.log(`[Process ${this.processId}] Deferring reply to Process ${request.processId}`);
      this.deferredReplies.add(request.processId);
    }
  }

  private hasHigherPriority(request: MutexRequest): boolean {
    const myRequest = this.requestQueue.find(r => r.processId === this.processId);
    if (!myRequest) return true;
    
    return request.timestamp < myRequest.timestamp ||
           (request.timestamp === myRequest.timestamp && request.processId < this.processId);
  }

  private async sendReply(targetProcessId: number): Promise<void> {
    const targetPeer = this.peers[targetProcessId];
    if (targetPeer) {
      console.log(`[Process ${this.processId}] Sending REPLY to Process ${targetProcessId}`);
      await axios.post(`${targetPeer}/mutex/reply`, { from: this.processId }).catch(err =>
        console.error(`[Process ${this.processId}] Error sending mutex reply to ${targetProcessId}:`, err.message)
      );
    }
  }

  receiveReply(): void {
    this.waitingForReplies--;
    console.log(`[Process ${this.processId}] Received reply. Waiting for ${this.waitingForReplies} more`);

    if (this.waitingForReplies === 0 && this.requestQueue[0]?.processId === this.processId) {
      this.enterCriticalSection();
    }
  }

  private enterCriticalSection(): void {
    this.inCriticalSection = true;
    console.log(`\n🔒 [Process ${this.processId}] ENTERED CRITICAL SECTION\n`);
  }

  async releaseAccess(): Promise<void> {
    this.inCriticalSection = false;
    this.requestQueue.shift(); // Remove própria requisição
    
    console.log(`\n🔓 [Process ${this.processId}] LEFT CRITICAL SECTION\n`);

    // Envia respostas adiadas
    const promises = Array.from(this.deferredReplies).map(processId =>
      this.sendReply(processId)
    );
    
    this.deferredReplies.clear();
    await Promise.all(promises);
  }

  getStatus(): any {
    return {
      processId: this.processId,
      inCriticalSection: this.inCriticalSection,
      queueLength: this.requestQueue.length,
      waitingForReplies: this.waitingForReplies,
      deferredReplies: Array.from(this.deferredReplies),
      logicalClock: this.logicalClock
    };
  }
}
