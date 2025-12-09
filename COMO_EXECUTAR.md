# 🚀 Como Executar o Projeto

## Opção 1️⃣: Execução LOCAL (Mais Simples)

### Passo 1: Instalar dependências
```powershell
npm install
```

### Passo 2: Executar os 3 processos
```powershell
npm run start:all
```

✅ Isso abrirá 3 terminais automaticamente, um para cada processo!

### Passo 3: Testar (em outro terminal)
```powershell
# Testar Multicast
npm run test:multicast

# Testar Mutex
npm run test:mutex

# Testar Eleição
npm run test:election
```

---

## Opção 2️⃣: Execução no KUBERNETES

### Passo 1: Verificar cluster
```powershell
kubectl get nodes
```

Deve mostrar: `docker-desktop   Ready`

### Passo 2: Fazer deploy
```powershell
npm run k8s:deploy
```

⏳ Aguarde 1-2 minutos...

### Passo 3: Verificar se está rodando
```powershell
kubectl get pods -l app=multicast-api
```

Deve mostrar 3 pods com status `Running`

### Passo 4: Testar
```powershell
npm run k8s:test
```

### Passo 5: Ver logs
```powershell
npm run k8s:logs
```

---

## 📱 Testar Manualmente

### Local (portas 3000, 3001, 3002):
```powershell
# Health check
curl http://localhost:3000/health

# Enviar mensagem
curl -X POST http://localhost:3000/multicast/send -H "Content-Type: application/json" -d "{\"content\":\"Hello\"}"

# Iniciar eleição
curl -X POST http://localhost:3000/election/start

# Ver quem é o líder
curl http://localhost:3000/election/status
```

### Kubernetes (portas 30000, 30001, 30002):
```powershell
# Health check
curl http://localhost:30000/health

# Enviar mensagem
curl -X POST http://localhost:30000/multicast/send -H "Content-Type: application/json" -d "{\"content\":\"Hello K8s\"}"

# Iniciar eleição
curl -X POST http://localhost:30000/election/start

# Ver quem é o líder
curl http://localhost:30000/election/status
```

---

## ❓ Problemas?

### "npm run start:all não funciona"
```powershell
# Execute manualmente em 3 terminais diferentes:
# Terminal 1:
npm run start:0

# Terminal 2:
npm run start:1

# Terminal 3:
npm run start:2
```

### "Pods não ficam prontos"
```powershell
# Ver o que está acontecendo
kubectl describe pod multicast-api-0
kubectl logs multicast-api-0

# Refazer deploy
npm run k8s:cleanup
npm run k8s:deploy
```

### "curl não funciona"
Instale curl ou use PowerShell:
```powershell
Invoke-WebRequest -Uri http://localhost:3000/health
```

---

## 🎯 Resumo Rápido

**Para desenvolvimento local:**
```powershell
npm install
npm run start:all
npm run test:multicast
```

**Para Kubernetes:**
```powershell
npm install
npm run k8s:deploy
npm run k8s:test
npm run k8s:logs
```

**Pronto! 🚀**
