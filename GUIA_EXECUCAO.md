# 🚀 Guia de Execução - Multicast API

## ⚡ EXECUÇÃO LOCAL (RECOMENDADO PARA DESENVOLVIMENTO)

### 1️⃣ Instalar Dependências

```powershell
npm install
```

### 2️⃣ Executar os 3 Processos

**Opção A - Todos de uma vez (Recomendado):**

```powershell
npm run start:all
```

Isso abrirá 3 terminais coloridos automaticamente, um para cada processo.

**Opção B - Terminal por terminal (Manual):**

Terminal 1:
```powershell
npm run start:0
```

Terminal 2 (novo terminal):
```powershell
npm run start:1
```

Terminal 3 (novo terminal):
```powershell
npm run start:2
```

**Opção C - Debugger do VSCode:**

1. Pressione `F5`
2. Selecione "All Processes"
3. Isso abrirá 3 terminais de debug

### 3️⃣ Testar os Algoritmos

Abra um **NOVO terminal** e execute:

```powershell
# Testar Multicast
npm run test:multicast

# Testar Exclusão Mútua
npm run test:mutex

# Testar Eleição de Líder
npm run test:election
```

### 4️⃣ Testar Manualmente com curl

```powershell
# Health check
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:3002/health

# Enviar mensagem multicast
curl -X POST http://localhost:3000/multicast/send -H "Content-Type: application/json" -d "{\"content\": \"Hello World\"}"

# Ver fila de mensagens
curl http://localhost:3000/multicast/queue

# Iniciar eleição
curl -X POST http://localhost:3000/election/start

# Ver quem é o líder
curl http://localhost:3000/election/status
curl http://localhost:3001/election/status
curl http://localhost:3002/election/status
```

---

## 🐳 EXECUÇÃO NO KUBERNETES (PARA DEMONSTRAÇÃO)

### Pré-requisitos

1. **Docker Desktop** instalado e rodando
2. **Kubernetes** habilitado no Docker Desktop

### Como Habilitar Kubernetes no Docker Desktop:

1. Abra Docker Desktop
2. Vá em Settings (⚙️)
3. Clique em "Kubernetes"
4. Marque "Enable Kubernetes"
5. Clique "Apply & Restart"
6. Aguarde alguns minutos até aparecer "Kubernetes is running"

### Passos para Deploy:

#### 1️⃣ Verificar se Kubernetes está rodando

```powershell
kubectl cluster-info
kubectl get nodes
```

Se aparecer erro, o Kubernetes não está configurado!

#### 2️⃣ Build da Imagem Docker

```powershell
npm run docker:build
```

Ou manualmente:
```powershell
docker build -t multicast-api:latest .
```

#### 3️⃣ Deploy no Kubernetes

```powershell
npm run k8s:deploy
```

Ou manualmente:
```powershell
kubectl apply -f k8s/statefulset.yaml
kubectl apply -f k8s/services.yaml
```

#### 4️⃣ Verificar Status

```powershell
# Ver pods
kubectl get pods -l app=multicast-api

# Ver logs
kubectl logs -f multicast-api-0
kubectl logs -f multicast-api-1
kubectl logs -f multicast-api-2

# Ver services
kubectl get services | findstr multicast-api
```

#### 5️⃣ Acessar os Processos

```powershell
# Health checks
curl http://localhost:30000/health
curl http://localhost:30001/health
curl http://localhost:30002/health

# Enviar mensagem
curl -X POST http://localhost:30000/multicast/send -H "Content-Type: application/json" -d "{\"content\": \"Hello from K8s\"}"

# Iniciar eleição
curl -X POST http://localhost:30000/election/start
```

#### 6️⃣ Limpar Recursos

```powershell
npm run k8s:delete
```

Ou manualmente:
```powershell
kubectl delete -f k8s/statefulset.yaml
kubectl delete -f k8s/services.yaml
```

---

## 🎥 Para o Vídeo de Demonstração

### Roteiro Sugerido:

1. **Mostrar código** (30 segundos)
   - Abrir VSCode
   - Mostrar estrutura do projeto

2. **Executar localmente** (1 minuto)
   ```powershell
   npm run start:all
   ```
   - Mostrar 3 terminais rodando

3. **Demonstrar Multicast** (1 minuto)
   ```powershell
   npm run test:multicast
   ```
   - Mostrar logs nos 3 processos
   - Destacar ordenação total

4. **Demonstrar Mutex** (1 minuto)
   ```powershell
   npm run test:mutex
   ```
   - Mostrar exclusão mútua funcionando

5. **Demonstrar Eleição** (1 minuto)
   ```powershell
   npm run test:election
   ```
   - Mostrar processo 2 se tornando líder

6. **Mostrar no Kubernetes** (1 minuto)
   ```powershell
   kubectl get pods
   kubectl logs multicast-api-0
   curl http://localhost:30000/election/start
   ```

---

## ❓ Problemas Comuns

### "npm run start:all não funciona"
**Solução:**
```powershell
npm install -g concurrently
npm install
npm run start:all
```

### "Error: EADDRINUSE"
**Solução:** As portas 3000, 3001, 3002 já estão em uso.
```powershell
# Windows - Matar processos nas portas
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### "kubectl: command not found"
**Solução:** Kubernetes não está habilitado no Docker Desktop. Siga as instruções acima.

### "Error: listen EACCES: permission denied"
**Solução:** Execute PowerShell como Administrador

---

## 📁 Estrutura de Pastas

```
multicast-api/
├── src/                  # Código TypeScript
│   ├── index.ts         # Servidor principal
│   ├── multicast.ts     # Algoritmo multicast
│   ├── mutex.ts         # Exclusão mútua
│   ├── election.ts      # Eleição de líder
│   └── types.ts         # Tipos
├── scripts/             # Scripts de teste
│   ├── test-multicast.js
│   ├── test-mutex.js
│   └── test-election.js
├── k8s/                 # Manifests Kubernetes
│   ├── statefulset.yaml
│   └── services.yaml
├── package.json
├── tsconfig.json
└── Dockerfile
```

---

## 🎯 Resumo Rápido

```powershell
# 1. Instalar
npm install

# 2. Rodar localmente
npm run start:all

# 3. Testar (em outro terminal)
npm run test:multicast
npm run test:mutex
npm run test:election

# 4. Para Kubernetes (opcional)
npm run docker:build
npm run k8s:deploy
kubectl get pods
```

**PRONTO! 🚀**
