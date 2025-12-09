import express from 'express';
import cors from 'cors';
import process from 'process';
import { MulticastService } from './multicast';
import { MutexService } from './mutex';
import { ElectionService } from './election';

const app = express();
app.use(cors());
app.use(express.json());

const PROCESS_ID = parseInt(process.env.PROCESS_ID || '0');
const TOTAL_PROCESSES = parseInt(process.env.TOTAL_PROCESSES || '3');
const PORT = parseInt(process.env.PORT || '3000');

// Detecta se está rodando no Kubernetes
const IS_K8S = process.env.KUBERNETES_SERVICE_HOST !== undefined;

// Configura peers baseado no ambiente
const peers: string[] = [];
for (let i = 0; i < TOTAL_PROCESSES; i++) {
  if (IS_K8S) {
    // No Kubernetes, usa os nomes dos services
    peers[i] = `http://multicast-api-${i}.multicast-api.default.svc.cluster.local:3000`;
  } else {
    // Local, usa localhost com portas diferentes
    peers[i] = `http://localhost:${3000 + i}`;
  }
}

const multicast = new MulticastService(PROCESS_ID, TOTAL_PROCESSES, peers);
const mutex = new MutexService(PROCESS_ID, TOTAL_PROCESSES, peers);
const election = new ElectionService(PROCESS_ID, TOTAL_PROCESSES, peers);

// ===== MULTICAST ENDPOINTS =====
app.post('/multicast/send', async (req, res) => {
  try {
    const { content } = req.body;
    const message = await multicast.sendMessage(content);
    res.json({ success: true, message });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/multicast/delay-ack', (req, res) => {
  try {
    const { messageId, delay } = req.body;
    multicast.setDelayedAck(messageId, delay);
    res.json({ success: true, message: `ACK for ${messageId} will be delayed by ${delay}ms` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/multicast/receive', (req, res) => {
  try {
    multicast.receiveMessage(req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/multicast/ack', (req, res) => {
  try {
    multicast.receiveAck(req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/multicast/queue', (req, res) => {
  res.json(multicast.getQueue());
});

app.get('/multicast/status', (req, res) => {
  res.json(multicast.getStatus());
});

// ===== MUTEX ENDPOINTS =====
app.post('/mutex/request-access', async (req, res) => {
  try {
    await mutex.requestAccess();
    res.json({ success: true, message: 'Mutex access requested' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/mutex/request', (req, res) => {
  try {
    mutex.receiveRequest(req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/mutex/reply', (req, res) => {
  try {
    mutex.receiveReply();
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/mutex/release', async (req, res) => {
  try {
    await mutex.releaseAccess();
    res.json({ success: true, message: 'Mutex released' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/mutex/status', (req, res) => {
  res.json(mutex.getStatus());
});

// ===== ELECTION ENDPOINTS =====
app.post('/election/start', async (req, res) => {
  try {
    await election.startElection();
    res.json({ success: true, message: 'Election started' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/election/message', async (req, res) => {
  try {
    const shouldReply = await election.receiveElectionMessage(req.body);
    res.json({ success: true, reply: shouldReply });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/election/status', (req, res) => {
  res.json(election.getStatus());
});

// ===== HEALTH CHECK =====
app.get('/health', (req, res) => {
  res.json({ 
    processId: PROCESS_ID,
    status: 'running',
    environment: IS_K8S ? 'kubernetes' : 'local',
    multicast: multicast.getStatus(),
    mutex: mutex.getStatus(),
    election: election.getStatus()
  });
});

app.get('/', (req, res) => {
  res.json({
    service: 'Multicast API - Distributed Algorithms',
    processId: PROCESS_ID,
    endpoints: {
      multicast: ['/multicast/send', '/multicast/queue', '/multicast/status', '/multicast/delay-ack'],
      mutex: ['/mutex/request-access', '/mutex/release', '/mutex/status'],
      election: ['/election/start', '/election/status'],
      health: ['/health']
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Process ${PROCESS_ID} running on port ${PORT}`);
  console.log(`   Environment: ${IS_K8S ? 'Kubernetes' : 'Local'}`);
  console.log(`   Total processes: ${TOTAL_PROCESSES}`);
  console.log(`   Peers: ${peers.filter((_, i) => i !== PROCESS_ID).length} configured\n`);
  
  if (IS_K8S) {
    console.log(`   Service URLs:`);
    peers.forEach((peer, i) => {
      if (i !== PROCESS_ID) {
        console.log(`   - Process ${i}: ${peer}`);
      }
    });
    console.log();
  }
});
