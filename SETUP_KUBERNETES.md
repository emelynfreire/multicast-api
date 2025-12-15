# 🚀 Setup Kubernetes - Guia Rápido

## Opção 1: Docker Desktop (Recomendado para Windows)

### 1. Habilitar Kubernetes
1. Abrir Docker Desktop
2. Settings (⚙️) → Kubernetes
3. ☑️ Enable Kubernetes
4. Apply & Restart
5. Aguardar ~3 minutos

### 2. Verificar
```powershell
kubectl get nodes
```

### 3. Fazer Deploy
```powershell
# Build da imagem
docker build -t multicast-api:latest .

# Deploy no Kubernetes
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Verificar pods
kubectl get pods -n multicast-system
```

### 4. Testar
```powershell
# Health check
curl http://localhost:30000/health
curl http://localhost:30001/health
curl http://localhost:30002/health

# Testar algoritmos
python scripts/test_election.py
python scripts/test_multicast.py
python scripts/test_mutex.py
```

---

## Opção 2: Minikube

### 1. Instalar Minikube (se não tiver)
```powershell
# Via Chocolatey
choco install minikube

# OU baixar de: https://minikube.sigs.k8s.io/docs/start/
```

### 2. Iniciar Minikube
```powershell
minikube start --driver=docker
```

### 3. Configurar Docker para usar Minikube
```powershell
# Apontar Docker para Minikube
minikube docker-env | Invoke-Expression

# Build da imagem DENTRO do Minikube
docker build -t multicast-api:latest .
```

### 4. Deploy
```powershell
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Verificar
kubectl get pods -n multicast-system
```

### 5. Testar com Minikube
```powershell
# Obter IP do Minikube
$MINIKUBE_IP = minikube ip
echo $MINIKUBE_IP

# Testar (substitua o IP)
curl http://${MINIKUBE_IP}:30000/health

# OU use port-forward
kubectl port-forward -n multicast-system svc/multicast-api-0 30000:3000
# Em outro terminal:
curl http://localhost:30000/health
```

---

## 📊 Comandos Úteis

### Ver Logs dos Pods
```powershell
# Listar pods
kubectl get pods -n multicast-system

# Ver logs de um pod específico
kubectl logs -n multicast-system <pod-name> -f

# Exemplo:
kubectl logs -n multicast-system multicast-api-0-xxxxxxxx-xxxxx -f
```

### Deletar e Recriar
```powershell
# Deletar tudo
kubectl delete namespace multicast-system

# Recriar
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

### Debug
```powershell
# Ver detalhes de um pod
kubectl describe pod -n multicast-system <pod-name>

# Executar comando dentro do pod
kubectl exec -n multicast-system <pod-name> -it -- /bin/bash
```

---

## 🎬 Para Gravação do Vídeo

### Setup Recomendado:
1. **Terminal 1**: Logs do processo 0
   ```powershell
   kubectl logs -n multicast-system -l process=0 -f
   ```

2. **Terminal 2**: Logs do processo 1
   ```powershell
   kubectl logs -n multicast-system -l process=1 -f
   ```

3. **Terminal 3**: Logs do processo 2
   ```powershell
   kubectl logs -n multicast-system -l process=2 -f
   ```

4. **Terminal 4**: Executar testes
   ```powershell
   python scripts/test_election.py
   python scripts/test_multicast.py
   python scripts/test_mutex.py
   ```

### Dica:
Use **Windows Terminal** com split screens para mostrar todos os logs simultaneamente!

---

## ⚠️ Troubleshooting

### Pods não iniciam (ImagePullBackOff)
```powershell
# Rebuildar imagem
docker build -t multicast-api:latest .

# Verificar que está no repositório local
docker images | grep multicast-api
```

### Erro de conexão entre pods
```powershell
# Verificar serviços
kubectl get svc -n multicast-system

# Testar DNS interno
kubectl exec -n multicast-system <pod-name> -- nslookup multicast-api-0.multicast-api.multicast-system.svc.cluster.local
```

### Portas não acessíveis
```powershell
# Usar port-forward
kubectl port-forward -n multicast-system svc/multicast-api-0 30000:3000
```
