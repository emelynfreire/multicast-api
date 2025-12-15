import asyncio
import time
from typing import List, Optional
import requests
from .models import MutexStatus


class MutexService:
    """Implementa exclusão mútua usando Token Ring"""
    
    def __init__(self, process_id: int, total_processes: int, peers: List[str]):
        self.process_id = process_id
        self.total_processes = total_processes
        self.peers = peers
        self.has_token = (process_id == 0)  # Processo 0 começa com o token
        self.in_critical_section = False
        self.wants_access = False
        self.critical_section_counter = 0
    
    def has_token_status(self) -> bool:
        """Verifica se este processo tem o token"""
        return self.has_token
    
    async def request_access(self) -> None:
        """Solicita acesso à seção crítica"""
        self.wants_access = True
        print(f"\n[Process {self.process_id}] 🔐 Solicitando acesso à região crítica")
        
        # Se já tem o token, entra imediatamente
        if self.has_token:
            await self._enter_critical_section()
        else:
            print(f"[Process {self.process_id}] ⏳ Aguardando token...")
    
    async def _enter_critical_section(self) -> None:
        """Entra na seção crítica"""
        if not self.has_token:
            return
        
        self.in_critical_section = True
        self.critical_section_counter += 1
        
        print(f"\n[Process {self.process_id}] ✅ ENTROU NA REGIÃO CRÍTICA (#{self.critical_section_counter})")
        print(f"[Process {self.process_id}] 🔧 Executando operação crítica...")
        
        # Simula trabalho na região crítica
        await asyncio.sleep(2)
        
        print(f"[Process {self.process_id}] ✔️ Saiu da região crítica")
        
        self.in_critical_section = False
        self.wants_access = False
        
        # Passa o token para o próximo processo
        await self._pass_token()
    
    async def _pass_token(self) -> None:
        """Passa o token para o próximo processo no anel"""
        if not self.has_token:
            return
        
        # Libera o token
        self.has_token = False
        
        # Calcula o próximo processo no anel
        next_process = (self.process_id + 1) % self.total_processes
        next_peer = self.peers[next_process]
        
        print(f"[Process {self.process_id}] 🎫 Passando token para Processo {next_process}")
        
        try:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                lambda: requests.post(
                    f"{next_peer}/mutex/token",
                    json={'from_process': self.process_id},
                    timeout=5
                )
            )
        except Exception as e:
            print(f"[Process {self.process_id}] ❌ Erro passando token: {str(e)}")
            # Se falhou, recupera o token
            self.has_token = True
    
    def receive_token(self, token_data: dict) -> None:
        """Recebe o token de outro processo"""
        from_process = token_data.get('from_process', -1)
        
        print(f"\n[Process {self.process_id}] 🎫 Recebeu token de Processo {from_process}")
        
        self.has_token = True
        
        # Se quer acesso, entra na região crítica
        if self.wants_access and not self.in_critical_section:
            asyncio.create_task(self._enter_critical_section())
        else:
            # Não precisa do token, passa adiante
            print(f"[Process {self.process_id}] ➡️ Não precisa do token, passando adiante")
            asyncio.create_task(self._pass_token())
    
    async def release_access(self) -> None:
        """Libera explicitamente a seção crítica (se estiver nela)"""
        if self.in_critical_section:
            print(f"[Process {self.process_id}] 🔓 Liberando região crítica")
            self.in_critical_section = False
            self.wants_access = False
            await self._pass_token()
        elif self.has_token and not self.wants_access:
            # Tem token mas não quer usar, passa adiante
            await self._pass_token()
    
    def get_status(self) -> MutexStatus:
        """Retorna o status do mutex"""
        return MutexStatus(
            processId=self.process_id,
            coordinatorId=None,  # Token Ring não tem coordenador
            isCoordinator=False,
            inCriticalSection=self.in_critical_section,
            hasAccessGranted=self.has_token,
            queueSize=0  # Token Ring não usa fila
        )
