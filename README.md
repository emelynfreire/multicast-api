# multicast-api

API REST para demonstração de algoritmos de coordenação distribuída no Kubernetes.

## 🎯 Algoritmos Implementados

1. **Multicast com Ordenação Total (2.0 pts)** - Relógio de Lamport
2. **Exclusão Mútua Distribuída (2.0 pts)** - Algoritmo Centralizado
3. **Eleição de Líder (2.0 pts)** - Algoritmo Bully

## 🚀 Execução Rápida

### Local (3 terminais)

```powershell
# Terminal 1
.\.venv\Scripts\Activate.ps1
$env:PROCESS_ID="0"
python -m uvicorn src.main:app --host 127.0.0.1 --port 3000 --reload

# Terminal 2
.\.venv\Scripts\Activate.ps1
$env:PROCESS_ID="1"
python -m uvicorn src.main:app --host 127.0.0.1 --port 3001 --reload

# Terminal 3
.\.venv\Scripts\Activate.ps1
$env:PROCESS_ID="2"
python -m uvicorn src.main:app --host 127.0.0.1 --port 3002 --reload
```

```

## 🐳 Kubernetes

```powershell
# Build
docker build -t multicast-api:latest .

# Deploy
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Ver pods
kubectl get pods -n multicast-system
```

## 📊 Endpoints

- `POST /election/start` - Iniciar eleição
- `POST /multicast/send` - Enviar mensagem
- `POST /mutex/request-access` - Solicitar acesso
- `GET /multicast/status` - Status do multicast
- `GET /election/status` - Status da eleição
- `GET /mutex/status` - Status do mutex

Acesse http://localhost:3000/docs para documentação interativa.


### Kubernetes com Docker Desktop (portas 30000-30002):

```powershell
curl http://localhost:30000/health
curl -X POST http://localhost:30000/multicast/send -H "Content-Type: application/json" -d "{\"content\": \"Hello K8s\"}"
curl -X POST http://localhost:30000/election/start
```

### Kubernetes com Minikube:

```powershell
# Obter IP
minikube ip  # Ex: 192.168.49.2

# Testar (substitua o IP)
curl http://192.168.49.2:30000/health
```

## 📊 Endpoints Disponíveis

### Multicast
- `POST /multicast/send` - Enviar mensagem para todos
- `GET /multicast/queue` - Ver fila de mensagens
- `GET /multicast/status` - Ver status do processo
- `POST /multicast/delay-ack` - Configurar atraso de ACK (para testes)

### Exclusão Mútua
- `POST /mutex/request-access` - Solicitar acesso à região crítica
- `POST /mutex/release` - Liberar região crítica
- `GET /mutex/status` - Ver status

### Eleição
- `POST /election/start` - Iniciar eleição
- `GET /election/status` - Ver coordenador atual

### Health
- `GET /health` - Status geral do processo



## 📁 Estrutura do Projeto

```
multicast-api/
├── src/
│   ├── index.ts          # Servidor principal
│   ├── multicast.ts      # Algoritmo de multicast
│   ├── mutex.ts          # Exclusão mútua
│   ├── election.ts       # Eleição de líder
│   └── types.ts          # Tipos TypeScript
├── k8s/
│   ├── statefulset.yaml  # StatefulSet Kubernetes
│   └── services.yaml     # Services NodePort
├── Dockerfile
├── package.json
├── README.md
└── KUBERNETES_EXPLICACAO.md
```

## 📝 Notas Importantes

- ✅ **Docker Desktop é suficiente** para este projeto
- Os processos são identificados por IDs: 0, 1, 2
- Comunicação via HTTP REST
- StatefulSet garante nomes previsíveis dos pods
- NodePort permite acesso externo
- Relógio lógico é inicializado aleatoriamente (0-10)
