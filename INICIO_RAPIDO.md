# ⚡ Início Rápido

## 🎯 3 Comandos Para Começar

### Local (Desenvolvimento):
```powershell
npm install
npm run start:all
npm run test:multicast
```

### Kubernetes (Demonstração):
```powershell
npm install
npm run k8s:deploy
npm run k8s:test
```

## 📋 Todos os Comandos Disponíveis

### Desenvolvimento Local:
```powershell
npm run start:all      # Inicia 3 processos (portas 3000-3002)
npm run start:0        # Inicia só processo 0
npm run start:1        # Inicia só processo 1
npm run start:2        # Inicia só processo 2

npm run test:multicast # Testa multicast
npm run test:mutex     # Testa exclusão mútua
npm run test:election  # Testa eleição
```

### Kubernetes:
```powershell
npm run k8s:deploy     # Build + Deploy completo
npm run k8s:test       # Testa todos algoritmos
npm run k8s:logs       # Mostra logs dos 3 pods
npm run k8s:cleanup    # Remove tudo do cluster
```

### Build:
```powershell
npm run build          # Compila TypeScript → JavaScript
npm start              # Roda versão compilada
```

## 🧪 Testar Manualmente

### Local:
```powershell
# Health Check
curl http://localhost:3000/health

# Multicast
curl -X POST http://localhost:3000/multicast/send -H "Content-Type: application/json" -d "{\"content\":\"Olá\"}"

# Ver fila
curl http://localhost:3000/multicast/queue

# Eleição
curl -X POST http://localhost:3000/election/start
curl http://localhost:3000/election/status

# Mutex
curl -X POST http://localhost:3000/mutex/request-access
curl -X POST http://localhost:3000/mutex/release
```

### Kubernetes:
```powershell
# Health Check (portas 30000, 30001, 30002)
curl http://localhost:30000/health
curl http://localhost:30001/health
curl http://localhost:30002/health

# Multicast
curl -X POST http://localhost:30000/multicast/send -H "Content-Type: application/json" -d "{\"content\":\"K8s Test\"}"

# Eleição
curl -X POST http://localhost:30000/election/start
curl http://localhost:30002/election/status
```

## 🔍 Ver o que está rodando

### Local:
```powershell
# Ver processos Node
tasklist | findstr node

# Matar processos (se necessário)
taskkill /IM node.exe /F
```

### Kubernetes:
```powershell
# Ver pods
kubectl get pods -l app=multicast-api

# Ver logs
kubectl logs -f multicast-api-0
kubectl logs -f multicast-api-1
kubectl logs -f multicast-api-2

# Ver services
kubectl get services | findstr multicast

# Ver tudo
kubectl get all
```

## ❓ Problemas?

### "npm run start:all falha"
```powershell
# Instalar concurrently globalmente
npm install -g concurrently

# Ou rodar manualmente em 3 terminais
npm run start:0  # Terminal 1
npm run start:1  # Terminal 2
npm run start:2  # Terminal 3
```

### "Pods não iniciam"
```powershell
# Ver o que está errado
kubectl describe pod multicast-api-0
kubectl logs multicast-api-0

# Refazer deploy
npm run k8s:cleanup
npm run k8s:deploy
```

### "Porta em uso"
```powershell
# Windows - Ver o que está usando a porta
netstat -ano | findstr :3000

# Matar processo
taskkill /PID <numero> /F
```

## 📺 Para Gravar o Vídeo

```powershell
# 1. Abrir 4 terminais no VSCode

# Terminal 1 - Deploy
npm run k8s:deploy

# Terminal 2 - Logs Process 0
kubectl logs -f multicast-api-0

# Terminal 3 - Logs Process 1
kubectl logs -f multicast-api-1

# Terminal 4 - Testes
npm run k8s:test
curl -X POST http://localhost:30000/election/start
kubectl get pods
```

## 🎯 Próximos Passos

1. ✅ Execute localmente primeiro: `npm run start:all`
2. ✅ Teste os algoritmos: `npm run test:multicast`
3. ✅ Depois faça deploy no K8s: `npm run k8s:deploy`
4. ✅ Grave o vídeo mostrando funcionando
5. ✅ Suba no GitHub e envie o link

---

**Dúvidas?** Veja [README.md](README.md) ou [REQUIREMENTS.md](REQUIREMENTS.md)
