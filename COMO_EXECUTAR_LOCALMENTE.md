# 🚀 Como Executar o Projeto Localmente

## ✅ Dependências já instaladas!

As dependências foram instaladas com sucesso no ambiente virtual Python 3.14.

---

## 📝 Opção 1: Executar 3 Processos em Terminais Separados (Recomendado)

### Terminal 1 - Processo 0
```powershell
cd C:\Users\emely\Documents\multicast-api
.\.venv\Scripts\Activate.ps1
$env:PROCESS_ID="0"
$env:TOTAL_PROCESSES="3"
python -m uvicorn src.main:app --host 127.0.0.1 --port 3000 --reload
```

### Terminal 2 - Processo 1
```powershell
cd C:\Users\emely\Documents\multicast-api
.\.venv\Scripts\Activate.ps1
$env:PROCESS_ID="1"
$env:TOTAL_PROCESSES="3"
python -m uvicorn src.main:app --host 127.0.0.1 --port 3001 --reload
```

### Terminal 3 - Processo 2
```powershell
cd C:\Users\emely\Documents\multicast-api
.\.venv\Scripts\Activate.ps1
$env:PROCESS_ID="2"
$env:TOTAL_PROCESSES="3"
python -m uvicorn src.main:app --host 127.0.0.1 --port 3002 --reload
```

---

## 🧪 Opção 2: Testar os Algoritmos

Depois de iniciar os 3 processos, abra um 4º terminal:

### Testar Eleição de Líder
```powershell
cd C:\Users\emely\Documents\multicast-api
.\.venv\Scripts\Activate.ps1
python scripts/test_election.py
```

### Testar Multicast
```powershell
python scripts/test_multicast.py
```

### Testar Exclusão Mútua
```powershell
python scripts/test_mutex.py
```

---

## 🌐 Acessar as APIs

Com os 3 processos rodando, você pode acessar:

- **Processo 0:** http://127.0.0.1:3000
- **Processo 1:** http://127.0.0.1:3001
- **Processo 2:** http://127.0.0.1:3002

### Documentação Interativa (Swagger)

- http://127.0.0.1:3000/docs
- http://127.0.0.1:3001/docs
- http://127.0.0.1:3002/docs

---

## 🐳 Opção 3: Executar com Docker + Kubernetes

### ⚙️ ANTES DE COMEÇAR: Escolha uma opção

**Opção A: Docker Desktop (RECOMENDADO - Mais simples)**
**Opção B: Minikube (Alternativa)**

---

### 📦 OPÇÃO A: Docker Desktop Kubernetes (RECOMENDADO)

#### A.1. Instalar Docker Desktop
Se ainda não tem instalado:
1. Baixe: https://www.docker.com/products/docker-desktop/
2. Instale e reinicie o computador
3. Abra Docker Desktop

#### A.2. Habilitar Kubernetes no Docker Desktop
1. Abra Docker Desktop
2. Clique em **Settings** (ícone da engrenagem)
3. Vá em **Kubernetes** no menu lateral
4. Marque ✅ **Enable Kubernetes**
5. Clique **Apply & Restart**
6. Aguarde até aparecer "Kubernetes is running" (pode demorar 3-5 minutos)

#### A.3. Verificar se está funcionando
```powershell
kubectl get nodes
```

Deve mostrar:
```
NAME             STATUS   ROLES           AGE   VERSION
docker-desktop   Ready    control-plane   1m    v1.x.x
```

#### A.4. Build da imagem
```powershell
docker build -t multicast-api:latest .
```

#### A.5. Deploy no Kubernetes
```powershell
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

✅ **Pronto! Pule para o passo 5 abaixo.**

---

### 📦 OPÇÃO B: Minikube (Alternativa)

#### B.1. Instalar Minikube
```powershell
# Opção 1: Com Chocolatey
choco install minikube

# OU Opção 2: Download manual
# Baixe de: https://minikube.sigs.k8s.io/docs/start/
# Coloque o minikube.exe em C:\Windows\System32\
```

#### B.2. Iniciar Minikube
```powershell
minikube start
```

#### B.3. Build da imagem
```powershell
docker build -t multicast-api:latest .
```

#### B.4. Carregar imagem no Minikube
```powershell
minikube image load multicast-api:latest
```

#### B.5. Deploy no Kubernetes
```powershell
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

---

### 5. Verificar pods
```powershell
kubectl get pods -n multicast-system
```

### 5. Verificar pods (aguarde STATUS = Running)
```powershell
kubectl get pods -n multicast-system
```

Aguarde até todos mostrarem **Running**:
```
NAME                               READY   STATUS    RESTARTS   AGE
multicast-api-0-xxxxxxxxxx-xxxxx   1/1     Running   0          30s
multicast-api-1-xxxxxxxxxx-xxxxx   1/1     Running   0          30s
multicast-api-2-xxxxxxxxxx-xxxxx   1/1     Running   0          30s
```

### 6. Ver logs dos pods
```powershell
# Copie o nome exato do pod do comando anterior
kubectl logs multicast-api-0-xxxxxxxxxx-xxxxx -n multicast-system
kubectl logs multicast-api-1-xxxxxxxxxx-xxxxx -n multicast-system
kubectl logs multicast-api-2-xxxxxxxxxx-xxxxx -n multicast-system
```

### 7. Acessar os serviços (Port Forward)

Abra **3 novos terminais** e execute em cada um:

**Terminal 1:**
```powershell
kubectl port-forward -n multicast-system deployment/multicast-api-0 3000:3000
```

**Terminal 2:**
```powershell
kubectl port-forward -n multicast-system deployment/multicast-api-1 3001:3000
```

**Terminal 3:**
```powershell
kubectl port-forward -n multicast-system deployment/multicast-api-2 3002:3000
```

### 8. Testar no Kubernetes

Abra um **4º terminal**:
```powershell
# Health check
curl http://127.0.0.1:3000/health

# Iniciar eleição
curl -X POST http://127.0.0.1:3000/election/start

# Ver coordenador eleito
curl http://127.0.0.1:3000/election/status
```

---

## 🔍 Testar Endpoints Manualmente

### Health Check
```powershell
curl http://127.0.0.1:3000/health
curl http://127.0.0.1:3001/health
curl http://127.0.0.1:3002/health
```

### Iniciar Eleição (processo 0)
```powershell
curl -X POST http://127.0.0.1:3000/election/start
```

### Ver Status da Eleição
```powershell
curl http://127.0.0.1:3000/election/status
curl http://127.0.0.1:3001/election/status
curl http://127.0.0.1:3002/election/status
```

### Enviar Mensagem Multicast
```powershell
curl -X POST http://127.0.0.1:3000/multicast/send -H "Content-Type: application/json" -d '{\"content\":\"Teste de multicast\"}'
```

### Solicitar Acesso ao Mutex
```powershell
curl -X POST http://127.0.0.1:3000/mutex/request-access
```

---

## ⚠️ Solução de Problemas

### Erro "Address already in use"
Se as portas 3000, 3001 ou 3002 já estiverem em uso:

```powershell
# Ver quem está usando a porta
netstat -ano | findstr :3000

# Matar o processo (substituir PID pelo número encontrado)
taskkill /PID <PID> /F
```

### Ambiente virtual não ativa
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\.venv\Scripts\Activate.ps1
```

### Erro: minikube não encontrado
```powershell
# Instalar com Chocolatey
choco install minikube

# OU use Docker Desktop Kubernetes (mais simples)
# Veja instruções na Opção A acima
```

### Kubernetes não responde (Docker Desktop)
1. Abra Docker Desktop
2. Settings → Kubernetes
3. Click "Reset Kubernetes Cluster"
4. Aguarde reiniciar

### Pods ficam em "ImagePullBackOff"
```powershell
# Se usando Docker Desktop: imagem já está disponível
# Se usando Minikube: precisa carregar
minikube image load multicast-api:latest
```

### Reimportar módulos após alterações
```powershell
# Use --reload para recarregar automaticamente
python -m uvicorn src.main:app --reload
```

---

## 📊 Ordem de Execução Recomendada

1. ✅ Abrir 3 terminais e iniciar os processos (Opção 1)
2. ✅ Aguardar todos os processos iniciarem (ver mensagem "Application startup complete")
3. ✅ Executar teste de eleição: `python scripts/test_election.py`
4. ✅ Verificar que o processo 2 foi eleito coordenador
5. ✅ Executar teste de multicast: `python scripts/test_multicast.py`
6. ✅ Executar teste de mutex: `python scripts/test_mutex.py`
7. ✅ Acessar http://127.0.0.1:3000/docs para ver a documentação interativa

---

## 🎥 Para Gravação do Vídeo

1. Mostre a estrutura do projeto (`tree` ou `dir`)
2. Inicie os 3 processos em terminais visíveis
3. Execute `python scripts/test_election.py` e mostre a eleição
4. Execute `python scripts/test_multicast.py` e mostre ordenação
5. Execute `python scripts/test_mutex.py` e mostre exclusão mútua
6. Mostre os logs de cada processo
7. Acesse a documentação Swagger em um navegador
8. (Opcional) Mostre o deploy no Kubernetes com `kubectl get pods`

---

**Pronto para executar! 🚀**
