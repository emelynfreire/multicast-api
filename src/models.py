# Definição de tipos e estruturas de dados para o sistema distribuído
from dataclasses import dataclass, field
from typing import Literal, Optional, Set


@dataclass
class Message:
    """Mensagem do sistema de multicast"""
    id: str
    processId: int
    timestamp: int
    content: str
    acks: Set[int] = field(default_factory=set)


@dataclass
class ElectionMessage:
    """Mensagem do sistema de eleição"""
    type: Literal['ELECTION', 'OK', 'COORDINATOR']
    senderId: int


@dataclass
class MutexRequest:
    """Requisição de acesso à seção crítica"""
    processId: int
    timestamp: Optional[int] = None


@dataclass
class MutexGrant:
    """Concessão de acesso à seção crítica"""
    coordinatorId: int


@dataclass
class MulticastStatus:
    """Status do serviço de multicast"""
    processId: int
    logicalClock: int
    messageQueueSize: int
    deliveredCount: int


@dataclass
class ElectionStatus:
    """Status do serviço de eleição"""
    processId: int
    coordinatorId: Optional[int]
    isCoordinator: bool
    electionInProgress: bool


@dataclass
class MutexStatus:
    """Status do serviço de mutex"""
    processId: int
    coordinatorId: Optional[int]
    isCoordinator: bool
    inCriticalSection: bool
    hasAccessGranted: bool
    queueSize: int
# Arquivo removido. Toda a lógica está em src/main.py
