# 🚀 Quick Start - Deploy no Kubernetes

## ✅ Pré-requisitos Verificados

Você já tem:
- ✅ Docker Desktop instalado e rodando
- ✅ Kubernetes habilitado no Docker Desktop
- ✅ Cluster `docker-desktop` ativo

## 🎯 Deploy em 3 Passos

### 1️⃣ Instalar Dependências (se ainda não fez)

```powershell
npm install
```

### 2️⃣ Fazer Deploy no Kubernetes

```powershell
npm run k8s:deploy
```

Este comando vai:
- ✅ Verificar cluster
- ✅ Compilar TypeScript
- ✅ Construir imagem Docker
- ✅ Fazer deploy dos 3 pods
- ✅ Aguardar pods ficarem prontos

**Aguarde 1-2 minutos** para o deploy completar.

### 3️⃣ Testar a Aplicação

```powershell
npm run k8s:test
```

## 📊 Comandos Úteis

```powershell
# Ver status dos pods
kubectl get pods -l app=multicast-api

# Ver logs em tempo real
kubectl logs -f multicast-api-0
kubectl logs -f multicast-api-1
kubectl logs -f multicast-api-2

# Ver todos os logs de uma vez (em janelas separadas)
npm run k8s:logs

# Testar manualmente
curl http://localhost:30000/health
curl http://localhost:30001/health
curl http://localhost:30002/health

# Enviar mensagem
curl -X POST http://localhost:30000/multicast/send -H "Content-Type: application/json" -d "{\"content\": \"Hello K8s\"}"

# Iniciar eleição
curl -X POST http://localhost:30000/election/start

# Ver quem é o líder
curl http://localhost:30000/election/status
curl http://localhost:30001/election/status
curl http://localhost:30002/election/status

# Limpar recursos
npm run k8s:cleanup
```

## 🎥 Para o Vídeo

```powershell
# 1. Mostrar cluster
kubectl get nodes
kubectl get all

# 2. Deploy
npm run k8s:deploy

# 3. Mostrar pods rodando
kubectl get pods -l app=multicast-api -o wide

# 4. Testar algoritmos
npm run k8s:test

# 5. Mostrar logs
start cmd /k "kubectl logs -f multicast-api-0"
start cmd /k "kubectl logs -f multicast-api-1"
start cmd /k "kubectl logs -f multicast-api-2"

# 6. Testar manualmente cada algoritmo
curl -X POST http://localhost:30000/multicast/send -H "Content-Type: application/json" -d "{\"content\": \"Demo Message\"}"
curl -X POST http://localhost:30000/election/start
```

## ❓ Solução de Problemas

### Pods não ficam prontos

```powershell
# Ver descrição do pod
kubectl describe pod multicast-api-0

# Ver logs de erro
kubectl logs multicast-api-0

# Verificar eventos
kubectl get events --sort-by=.metadata.creationTimestamp
```

### Imagem não é encontrada

```powershell
# Reconstruir imagem
docker build -t multicast-api:latest .

# Verificar imagens
docker images | findstr multicast-api

# Refazer deploy
npm run k8s:cleanup
npm run k8s:deploy
```

### Portas não respondem

```powershell
# Verificar services
kubectl get services

# Verificar port-forward (alternativa)
kubectl port-forward multicast-api-0 3000:3000
kubectl port-forward multicast-api-1 3001:3000
kubectl port-forward multicast-api-2 3002:3000
```

## 🎯 URLs Principais

- **Process 0**: http://localhost:30000
- **Process 1**: http://localhost:30001
- **Process 2**: http://localhost:30002

Endpoints disponíveis:
- `GET /health` - Status do processo
- `POST /multicast/send` - Enviar mensagem
- `GET /multicast/queue` - Ver fila
- `POST /election/start` - Iniciar eleição
- `GET /election/status` - Ver líder
- `POST /mutex/request-access` - Solicitar mutex
- `POST /mutex/release` - Liberar mutex

**Pronto para usar! 🚀**
