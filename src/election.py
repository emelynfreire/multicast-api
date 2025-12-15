"""
Serviço de Eleição de Líder usando Algoritmo do Valentão (Bully)
Q3 - Processo com maior ID vira líder
"""
import asyncio
from typing import List, Optional
import requests
from .models import ElectionMessage, ElectionStatus


class ElectionService:
    """Implementa eleição de líder usando o algoritmo Bully"""
    
    def __init__(self, process_id: int, total_processes: int, peers: List[str]):
        self.process_id = process_id
        self.coordinator_id: Optional[int] = None
        self.peers = peers
        self.is_in_election = False
        self.total_processes = total_processes
    
    async def start_election(self) -> None:
        """Inicia o processo de eleição (algoritmo Bully)"""
        if self.is_in_election:
            print(f"[Process {self.process_id}] ⚠️ Já está em processo de eleição")
            return
        
        self.is_in_election = True
        print(f"\n[Process {self.process_id}] 🗳️ Iniciando eleição Bully")
        
        # Envia mensagem ELECTION para processos com ID maior
        higher_process_ids = list(range(self.process_id + 1, self.total_processes))
        
        if not higher_process_ids:
            # Sou o processo com maior ID, me torno coordenador imediatamente
            print(f"[Process {self.process_id}] 👑 Maior ID, me tornando coordenador")
            await self.become_coordinator()
            return
        
        print(f"[Process {self.process_id}] 📨 Enviando ELECTION para processos: {higher_process_ids}")
        
        received_ok = False
        
        # Envia ELECTION para todos os processos com ID maior
        tasks = []
        for process_id in higher_process_ids:
            tasks.append(self._send_election_to_peer(process_id))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Verifica se alguém respondeu OK
        for result in results:
            if result is True:
                received_ok = True
                break
        
        if not received_ok:
            # Ninguém respondeu, me torno coordenador
            print(f"[Process {self.process_id}] ✅ Nenhum processo maior respondeu")
            await self.become_coordinator()
        else:
            # Alguém respondeu, aguardo anúncio de coordenador
            print(f"[Process {self.process_id}] ⏳ Processo maior respondeu, aguardando anúncio")
            self.is_in_election = False
    
    async def _send_election_to_peer(self, peer_id: int) -> bool:
        """Envia mensagem ELECTION para um peer via endpoint /eleicao"""
        try:
            peer = self.peers[peer_id]
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: requests.post(
                    f"{peer}/eleicao",
                    json={'sender_id': self.process_id},
                    timeout=2
                )
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get('ok', False)
            return False
            
        except Exception as e:
            print(f"[Process {self.process_id}] ❌ Processo {peer_id} não respondeu (OK)")
            return False
    
    def receive_election(self, sender_id: int) -> bool:
        """Recebe mensagem ELECTION via endpoint /eleicao
        Retorna True (OK) se tiver ID maior que o sender"""
        
        print(f"\n[Process {self.process_id}] 📩 Recebeu ELECTION de Processo {sender_id}")
        
        if self.process_id > sender_id:
            # Tenho ID maior, respondo OK e inicio minha própria eleição
            print(f"[Process {self.process_id}] ✅ Respondendo OK (tenho ID maior)")
            
            # Inicia eleição assíncrona
            asyncio.create_task(self._delayed_start_election())
            return True
        else:
            # ID menor, não respondo
            print(f"[Process {self.process_id}] ⛔ Ignorando (ID menor)")
            return False
    
    async def _delayed_start_election(self) -> None:
        """Inicia eleição após pequeno atraso"""
        await asyncio.sleep(0.5)
        await self.start_election()
    
    async def become_coordinator(self) -> None:
        """Torna-se o coordenador e anuncia para todos"""
        self.coordinator_id = self.process_id
        self.is_in_election = False
        
        print(f"\n[Process {self.process_id}] 👑 SOU O COORDENADOR!")
        
        # Anuncia via endpoint /coordenador para todos os processos
        tasks = []
        for idx, peer in enumerate(self.peers):
            if idx != self.process_id:
                tasks.append(self._announce_coordinator(peer))
        
        await asyncio.gather(*tasks, return_exceptions=True)
    
    async def _announce_coordinator(self, peer: str) -> None:
        """Anuncia que é o coordenador via endpoint /coordenador"""
        try:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: requests.post(
                    f"{peer}/coordenador",
                    json={'coordinator_id': self.process_id},
                    timeout=3
                )
            )
        except Exception as e:
            print(f"[Process {self.process_id}] ❌ Erro anunciando para {peer}: {str(e)}")
    
    def receive_coordinator(self, coordinator_id: int) -> None:
        """Recebe anúncio de novo coordenador via endpoint /coordenador"""
        print(f"\n[Process {self.process_id}] 👑 Processo {coordinator_id} é o coordenador")
        
        self.coordinator_id = coordinator_id
        self.is_in_election = False
    
    def get_status(self) -> ElectionStatus:
        """Retorna o status da eleição"""
        return ElectionStatus(
            processId=self.process_id,
            coordinatorId=self.coordinator_id,
            isCoordinator=(self.coordinator_id == self.process_id),
            electionInProgress=self.is_in_election
        )
"""Arquivo removido. Toda a lógica está em src/main.py"""

