from typing import List, Dict, Any
from .models import Message, MulticastStatus
import asyncio

class MulticastService:
    def __init__(self, process_id: int, total_processes: int, peers: List[str]):
        self.process_id = process_id
        self.total_processes = total_processes
        self.peers = peers
        self.logical_clock = 0
        self.message_queue = []
        self.delivered_count = 0

    async def send_message(self, content: str) -> Message:
        self.logical_clock += 1
        msg = Message(
            id=f"msg-{self.process_id}-{self.logical_clock}",
            processId=self.process_id,
            timestamp=self.logical_clock,
            content=content
        )
        self.message_queue.append(msg)
        self.delivered_count += 1
        return msg

    def receive_message(self, data: Dict[str, Any]):
        # Simula recebimento de mensagem
        pass

    def receive_ack(self, data: Dict[str, Any]):
        # Simula recebimento de ACK
        pass

    def set_delay_for_message(self, message_id: str):
        # Simula atraso
        pass

    def get_status(self) -> MulticastStatus:
        return MulticastStatus(
            processId=self.process_id,
            logicalClock=self.logical_clock,
            messageQueueSize=len(self.message_queue),
            deliveredCount=self.delivered_count
        )

    def get_queue(self):
        return [msg.__dict__ for msg in self.message_queue]
