# multicast-api

API REST para demonstração de algoritmos de coordenação distribuída rodando no Kubernetes.

## 🎯 Funcionalidades

1. **Multicast com Ordenação Total** - Usa relógio lógico de Lamport e fila de prioridade
2. **Exclusão Mútua Distribuída** - Algoritmo baseado em timestamps (Ricart-Agrawala)
3. **Eleição de Líder** - Algoritmo do Valentão (Bully)

## 📋 Pré-requisitos

- **Docker Desktop** (com Kubernetes habilitado) ✅ Recomendado
  - OU -
- Minikube + kubectl + Docker (alternativa)
- Node.js 18+ (para desenvolvimento local)

## 🚀 Execução

### Opção 1: Local (Desenvolvimento)

```powershell
# Instalar dependências
npm install

# Executar 3 processos
npm run start:all

# Testar (em outro terminal)
npm run test:multicast
npm run test:mutex
npm run test:election
```

### Opção 2: Kubernetes (Demonstração)

```powershell
# Verificar cluster (Docker Desktop ou Minikube)
kubectl get nodes

# Deploy completo
npm run k8s:deploy

# Testar
npm run k8s:test

# Ver logs
npm run k8s:logs

# Limpar
npm run k8s:cleanup
```

## 🐳 Setup do Kubernetes

### Com Docker Desktop (Recomendado):

1. Abra Docker Desktop
2. Settings ⚙️ → Kubernetes
3. ✅ Enable Kubernetes
4. Apply & Restart
5. Aguarde aparecer "Kubernetes is running" ✅

```powershell
# Verificar
kubectl cluster-info
# Deve mostrar: docker-desktop
```

### Com Minikube (Alternativa):

```powershell
# Instalar
choco install minikube

# Iniciar
minikube start --driver=docker

# Verificar
kubectl get nodes
```

**💡 Veja mais detalhes em:** [KUBERNETES_EXPLICACAO.md](KUBERNETES_EXPLICACAO.md)

## 🧪 Testes

### Local (portas 3000-3002):

```powershell
# Health check
curl http://localhost:3000/health

# Enviar mensagem multicast
curl -X POST http://localhost:3000/multicast/send -H "Content-Type: application/json" -d "{\"content\": \"Hello World\"}"

# Iniciar eleição
curl -X POST http://localhost:3000/election/start

# Ver líder
curl http://localhost:3000/election/status
```

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

## 🎥 Para o Vídeo de Demonstração

```powershell
# 1. Mostrar ambiente
kubectl get nodes
kubectl cluster-info

# 2. Deploy
npm run k8s:deploy

# 3. Verificar pods
kubectl get pods -l app=multicast-api -o wide

# 4. Testar algoritmos
npm run k8s:test

# 5. Mostrar logs em tempo real
npm run k8s:logs

# 6. Demonstrar cada algoritmo manualmente
curl -X POST http://localhost:30000/multicast/send -H "Content-Type: application/json" -d "{\"content\": \"Demo\"}"
curl -X POST http://localhost:30000/election/start
curl http://localhost:30000/election/status
```

## 🔧 Comandos Úteis

```powershell
# Ver logs em tempo real
kubectl logs -f multicast-api-0
kubectl logs -f multicast-api-1
kubectl logs -f multicast-api-2

# Executar comando dentro do pod
kubectl exec -it multicast-api-0 -- /bin/sh

# Ver todos os recursos
kubectl get all

# Deletar tudo
npm run k8s:cleanup

# Reconstruir e fazer deploy novamente
npm run k8s:deploy
```

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
├── scripts/
│   ├── deploy-k8s.bat    # Deploy automatizado
│   ├── test-k8s.bat      # Testes automatizados
│   ├── logs-k8s.bat      # Ver logs
│   └── cleanup-k8s.bat   # Limpar recursos
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

## 🎯 Resumo Rápido

**Desenvolvimento local:**
```powershell
npm install && npm run start:all
```

**Deploy Kubernetes:**
```powershell
npm run k8s:deploy
```

**Pronto! 🚀**