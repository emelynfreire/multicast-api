# 📦 Instalação do Minikube no Windows

## Opção 1: Via Chocolatey (Recomendado)

1. Instalar Chocolatey (se não tiver):
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

2. Instalar Minikube:
```powershell
choco install minikube
```

3. Instalar kubectl:
```powershell
choco install kubernetes-cli
```

## Opção 2: Download Manual

1. Baixar o executável:
   - Acesse: https://minikube.sigs.k8s.io/docs/start/
   - Baixe o instalador para Windows

2. Adicionar ao PATH:
   - Mova o executável para `C:\minikube`
   - Adicione `C:\minikube` ao PATH do sistema

## Verificar Instalação

```powershell
minikube version
kubectl version --client
```

## Iniciar Minikube

```powershell
minikube start --driver=docker
```

## ⚠️ Nota
Se não tiver Docker instalado, instale primeiro:
```powershell
choco install docker-desktop
```
