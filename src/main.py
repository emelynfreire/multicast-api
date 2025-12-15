"""
Servidor FastAPI com endpoints REST para coordenação distribuída
"""
import os
import sys
from typing import List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Importa o serviço de multicast
from .multicast import MulticastService
from .election import ElectionService
from .mutex import MutexService

# Configuração do processo
PROCESS_ID = int(os.getenv('PROCESS_ID', '0'))
TOTAL_PROCESSES = int(os.getenv('TOTAL_PROCESSES', '3'))
PORT = int(os.getenv('PORT', 3000 + PROCESS_ID))

# Detecta se está rodando no Kubernetes
IS_KUBERNETES = os.getenv('KUBERNETES_SERVICE_HOST') is not None

# Define URLs dos peers
if IS_KUBERNETES:
    # No Kubernetes: usa DNS interno
    PEERS = [
        f'http://multicast-api-{i}.multicast-api.default.svc.cluster.local:3000'
        for i in range(TOTAL_PROCESSES)
    ]
else:
    # Local: usa localhost com portas diferentes
    PEERS = [f'http://localhost:{3000 + i}' for i in range(TOTAL_PROCESSES)]

# Instancia os serviços globais
multicast_service = MulticastService(PROCESS_ID, TOTAL_PROCESSES, PEERS)
election_service = ElectionService(PROCESS_ID, TOTAL_PROCESSES, PEERS)
mutex_service = MutexService(PROCESS_ID, TOTAL_PROCESSES, PEERS)


# Inicializa FastAPI
app = FastAPI(
    title="Multicast API - Distributed Coordination",
    description="API REST para Multicast, Exclusão Mútua e Eleição de Líder",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== MODELOS PYDANTIC ====================

class SendMessageRequest(BaseModel):
    content: str

class MessageRequest(BaseModel):
    id_processo: int
    timestamp: int
    conteudo: str
    message_id: str

class AckRequest(BaseModel):
    message_id: str
    process_id: int
    timestamp: int

class ElectionRequest(BaseModel):
    sender_id: int

class CoordinatorRequest(BaseModel):
    coordinator_id: int

class TokenRequest(BaseModel):
    from_process: int

class DelayAckRequest(BaseModel):
    message_id: str


# ==================== ENDPOINTS ====================

@app.get("/")
def read_root():
    """Informações básicas do processo"""
    return {
        "processId": PROCESS_ID,
        "totalProcesses": TOTAL_PROCESSES,
        "port": PORT,
        "environment": "kubernetes" if IS_KUBERNETES else "local",
        "message": f"Process {PROCESS_ID} is running"
    }

@app.get("/health")
def health_check():
    """Health check para Kubernetes"""
    return {"status": "healthy", "processId": PROCESS_ID}


# ==================== MULTICAST ENDPOINTS ====================

@app.post("/multicast/send")
async def send_message(request: SendMessageRequest):
    """Envia mensagem via multicast"""
    message = await multicast_service.send_message(request.content)
    return {
        "id": message.id,
        "processId": message.processId,
        "timestamp": message.timestamp,
        "content": message.content
    }

@app.post("/msg")
def receive_message(request: MessageRequest):
    """Q1 - Endpoint /msg para receber mensagem de outro processo"""
    multicast_service.receive_message(request.dict())
    return {"status": "received"}

@app.post("/ack")
def receive_ack(request: AckRequest):
    """Q1 - Endpoint /ack para receber ACK de outro processo"""
    multicast_service.receive_ack(request.dict())
    return {"status": "ack_received"}

@app.post("/multicast/delay-ack")
def set_delay_ack(request: DelayAckRequest):
    """Define uma mensagem para atrasar o ACK (teste)"""
    multicast_service.set_delay_for_message(request.message_id)
    return {"status": "delay_set", "message_id": request.message_id}

@app.get("/multicast/status")
def get_multicast_status():
    """Retorna o status do serviço de multicast"""
    status = multicast_service.get_status()
    return {
        "processId": status.processId,
        "logicalClock": status.logicalClock,
        "messageQueueSize": status.messageQueueSize,
        "deliveredCount": status.deliveredCount
    }

@app.get("/multicast/queue")
def get_multicast_queue():
    """Retorna o estado da fila de mensagens"""
    return {"queue": multicast_service.get_queue()}

@app.post("/election/start")
async def start_election():
    """Inicia processo de eleição Bully"""
    await election_service.start_election()
    status = election_service.get_status()
    return {
        "processId": status.processId,
        "coordinatorId": status.coordinatorId,
        "isCoordinator": status.isCoordinator,
        "electionInProgress": status.electionInProgress
    }

@app.post("/eleicao")
def receive_election(request: ElectionRequest):
    """Q3 - Endpoint /eleicao para receber mensagem de eleição"""
    should_respond_ok = election_service.receive_election(request.sender_id)
    return {"ok": should_respond_ok}

@app.post("/coordenador")
def receive_coordinator(request: CoordinatorRequest):
    """Q3 - Endpoint /coordenador para receber anúncio de coordenador"""
    election_service.receive_coordinator(request.coordinator_id)
    return {"status": "coordinator_received"}

@app.get("/election/status")
def get_election_status():
    """Retorna o status da eleição"""
    status = election_service.get_status()
    return {
        "processId": status.processId,
        "coordinatorId": status.coordinatorId,
        "isCoordinator": status.isCoordinator,
        "electionInProgress": status.electionInProgress
    }


# ==================== MUTEX ENDPOINTS ====================

@app.post("/mutex/request-access")
async def request_mutex_access():
    """Q2 - Solicita acesso à seção crítica (Token Ring)"""
    await mutex_service.request_access()
    return {"status": "request_sent"}

@app.post("/mutex/token")
def receive_token(request: TokenRequest):
    """Q2 - Recebe o token de outro processo"""
    mutex_service.receive_token(request.dict())
    return {"status": "token_received"}

@app.post("/mutex/release")
async def release_mutex():
    """Libera a seção crítica"""
    await mutex_service.release_access()
    return {"status": "released"}

@app.get("/mutex/status")
def get_mutex_status():
    """Retorna o status do mutex"""
    status = mutex_service.get_status()
    return {
        "processId": status.processId,
        "hasToken": mutex_service.has_token,
        "inCriticalSection": status.inCriticalSection,
        "wantsAccess": mutex_service.wants_access
    }


# ==================== STARTUP ====================

if __name__ == "__main__":
    print(f"Starting Process {PROCESS_ID} on port {PORT}")
    uvicorn.run(app, host="0.0.0.0", port=PORT, log_level="info")
