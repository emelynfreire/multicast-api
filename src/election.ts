import axios from 'axios';
import { ElectionMessage } from './types';

export class ElectionService {
  private processId: number;
  private coordinatorId: number | null;
  private peers: string[];
  private isInElection: boolean;
  private totalProcesses: number;

  constructor(processId: number, totalProcesses: number, peers: string[]) {
    this.processId = processId;
    this.coordinatorId = null;
    this.peers = peers;
    this.isInElection = false;
    this.totalProcesses = totalProcesses;
  }

  async startElection(): Promise<void> {
    if (this.isInElection) {
      console.log(`[Process ${this.processId}] Already in election`);
      return;
    }

    this.isInElection = true;
    console.log(`\n🗳️ [Process ${this.processId}] Starting ELECTION (Bully Algorithm)\n`);

    // Envia ELECTION para processos com ID maior
    const higherProcessIds = [];
    for (let i = this.processId + 1; i < this.totalProcesses; i++) {
      higherProcessIds.push(i);
    }

    if (higherProcessIds.length === 0) {
      // Sou o processo com maior ID, me torno coordenador
      await this.becomeCoordinator();
      return;
    }

    const message: ElectionMessage = {
      processId: this.processId,
      type: 'ELECTION'
    };

    let receivedOk = false;

    const promises = higherProcessIds.map(async (id) => {
      try {
        const peer = this.peers[id];
        await axios.post(`${peer}/election/message`, message, { timeout: 2000 });
        receivedOk = true;
        console.log(`[Process ${this.processId}] Received OK from Process ${id}`);
      } catch (err) {
        console.log(`[Process ${this.processId}] No response from Process ${id}`);
      }
    });

    await Promise.all(promises);

    // Se ninguém respondeu, me torno coordenador
    if (!receivedOk) {
      await this.becomeCoordinator();
    } else {
      console.log(`[Process ${this.processId}] Received OK, waiting for coordinator announcement`);
      this.isInElection = false;
    }
  }

  async receiveElectionMessage(message: ElectionMessage): Promise<boolean> {
    console.log(`[Process ${this.processId}] Received ${message.type} from Process ${message.processId}`);

    if (message.type === 'ELECTION') {
      // Responde OK se tiver ID maior
      if (this.processId > message.processId) {
        console.log(`[Process ${this.processId}] Sending OK to Process ${message.processId}`);
        // Inicia própria eleição
        setTimeout(() => this.startElection(), 100);
        return true;
      }
    } else if (message.type === 'COORDINATOR') {
      this.coordinatorId = message.processId;
      this.isInElection = false;
      console.log(`\n👑 [Process ${this.processId}] New COORDINATOR is Process ${message.processId}\n`);
    }

    return false;
  }

  private async becomeCoordinator(): Promise<void> {
    this.coordinatorId = this.processId;
    this.isInElection = false;
    
    console.log(`\n👑 [Process ${this.processId}] I am the new COORDINATOR\n`);

    const message: ElectionMessage = {
      processId: this.processId,
      type: 'COORDINATOR'
    };

    // Anuncia para todos os processos com ID menor
    const promises = [];
    for (let i = 0; i < this.processId; i++) {
      const peer = this.peers[i];
      promises.push(
        axios.post(`${peer}/election/message`, message).catch(err =>
          console.error(`[Process ${this.processId}] Error announcing coordinator to Process ${i}:`, err.message)
        )
      );
    }

    await Promise.all(promises);
  }

  getStatus(): any {
    return {
      processId: this.processId,
      coordinatorId: this.coordinatorId,
      isCoordinator: this.coordinatorId === this.processId,
      isInElection: this.isInElection
    };
  }
}
