# 📋 Requirements - Multicast API

## 🎯 Requisitos do Projeto (AV2 Parte 1)

### Algoritmos Implementados

1. ✅ **Multicast com Ordenação Total (2.0 pontos)**
   - Relógio Lógico de Lamport
   - Fila de prioridade para ordenação
   - Sistema de ACKs
   - Demonstração com e sem atraso

2. ✅ **Exclusão Mútua Distribuída (2.0 pontos)**
   - Algoritmo de Ricart-Agrawala (baseado em timestamps)
   - Controle de acesso à região crítica
   - Sistema de respostas adiadas (deferred replies)

3. ✅ **Eleição de Líder (2.0 pontos)**
   - Algoritmo do Valentão (Bully)
   - Processo com maior ID se torna líder
   - Anúncio de coordenador

### Requisitos Técnicos

- ✅ 3 processos instanciados
- ✅ Execução no Kubernetes
- ✅ Comunicação via API REST
- ✅ Demonstração em vídeo (máximo 5 minutos)

---

## 💻 Requisitos de Sistema

### Software Necessário

#### Obrigatório:
- **Node.js** 18.x ou superior
- **npm** 9.x ou superior
- **Docker Desktop** (com Kubernetes habilitado)
- **Git** (para controle de versão)

#### Opcional:
- **Visual Studio Code** (IDE recomendada)
- **Postman** ou **Thunder Client** (para testar APIs)
- **curl** (para testes via linha de comando)

### Sistema Operacional

- ✅ Windows 10/11 (testado)
- ✅ macOS 10.15+ (compatível)
- ✅ Linux Ubuntu 20.04+ (compatível)

---

## 📦 Dependências do Projeto

### Dependências de Produção (`dependencies`)

```json
{
  "express": "^4.18.2",      // Framework web para API REST
  "axios": "^1.6.0",         // Cliente HTTP para comunicação entre processos
  "cors": "^2.8.5"           // Middleware para habilitar CORS
}
```

**Justificativa:**
- **express**: Servidor HTTP leve e eficiente para endpoints REST
- **axios**: Facilita chamadas HTTP entre processos com suporte a Promises
- **cors**: Necessário para permitir requisições cross-origin

### Dependências de Desenvolvimento (`devDependencies`)

```json
{
  "@types/express": "^4.17.21",    // Tipos TypeScript para Express
  "@types/node": "^20.10.0",       // Tipos TypeScript para Node.js
  "@types/cors": "^2.8.17",        // Tipos TypeScript para CORS
  "typescript": "^5.3.3",          // Compilador TypeScript
  "ts-node-dev": "^2.0.0",         // Execução TypeScript com hot-reload
  "ts-node": "^10.9.2",            // Execução TypeScript para scripts
  "cross-env": "^7.0.3",           // Variáveis de ambiente cross-platform
  "concurrently": "^8.2.2"         // Executar múltiplos processos simultaneamente
}
```

**Justificativa:**
- **TypeScript**: Tipagem estática para prevenir erros
- **ts-node-dev**: Hot-reload durante desenvolvimento
- **cross-env**: Compatibilidade de variáveis de ambiente entre Windows/Linux/Mac
- **concurrently**: Facilita executar os 3 processos ao mesmo tempo

---

## 🐳 Requisitos Docker/Kubernetes

### Imagem Base
```dockerfile
FROM node:18-alpine
```
- **Node.js 18**: Versão LTS estável
- **Alpine**: Imagem mínima (~40MB) para containers leves

### Recursos Kubernetes

#### Por Pod:
```yaml
resources:
  requests:
    memory: "128Mi"    # Mínimo de memória
    cpu: "100m"        # Mínimo de CPU (0.1 core)
  limits:
    memory: "512Mi"    # Máximo de memória
    cpu: "500m"        # Máximo de CPU (0.5 core)
```

#### Total (3 pods):
- **Memória**: 384Mi (mínimo) - 1.5Gi (máximo)
- **CPU**: 300m (mínimo) - 1.5 cores (máximo)

### Portas Necessárias

#### Desenvolvimento Local:
- `3000` - Process 0
- `3001` - Process 1
- `3002` - Process 2

#### Kubernetes (NodePort):
- `30000` - Process 0
- `30001` - Process 1
- `30002` - Process 2

---

## 🔧 Variáveis de Ambiente

### Obrigatórias:
```bash
PROCESS_ID         # ID do processo (0, 1 ou 2)
TOTAL_PROCESSES    # Total de processos (3)
PORT               # Porta do servidor (3000)
```

### Opcionais:
```bash
NODE_ENV           # Ambiente (development/production)
POD_NAME           # Nome do pod (apenas Kubernetes)
```

### Exemplo de Configuração:
```bash
# Process 0
PROCESS_ID=0
TOTAL_PROCESSES=3
PORT=3000

# Process 1
PROCESS_ID=1
TOTAL_PROCESSES=3
PORT=3001

# Process 2
PROCESS_ID=2
TOTAL_PROCESSES=3
PORT=3002
```

---

## 📊 Requisitos de Comunicação

### Protocolo
- **HTTP REST** sobre TCP/IP
- **JSON** para serialização de dados

### Endpoints Necessários por Processo:

#### Multicast:
- `POST /multicast/send` - Enviar mensagem
- `POST /multicast/receive` - Receber mensagem
- `POST /multicast/ack` - Receber ACK
- `GET /multicast/queue` - Ver fila
- `GET /multicast/status` - Ver status

#### Exclusão Mútua:
- `POST /mutex/request-access` - Solicitar acesso
- `POST /mutex/request` - Receber requisição
- `POST /mutex/reply` - Receber resposta
- `POST /mutex/release` - Liberar acesso
- `GET /mutex/status` - Ver status

#### Eleição:
- `POST /election/start` - Iniciar eleição
- `POST /election/message` - Receber mensagem de eleição
- `GET /election/status` - Ver coordenador

#### Utilidade:
- `GET /health` - Health check
- `GET /` - Informações do serviço

### Timeout e Retry:
- Timeout de requisição: `2000ms` (eleição)
- Sem retry automático (fail-fast)

---

## 🧪 Requisitos de Teste

### Cenários de Teste Obrigatórios:

#### 1. Multicast com Ordenação Total
- ✅ Enviar 3 mensagens de processos diferentes
- ✅ Verificar ordem de entrega (mesmo timestamp = ordem por ID)
- ✅ Demonstrar com atraso de ACK
- ✅ Verificar que mensagem não é entregue até receber todos ACKs

#### 2. Exclusão Mútua
- ✅ 2+ processos solicitando acesso simultaneamente
- ✅ Apenas 1 processo entra na região crítica por vez
- ✅ Próximo processo aguarda liberação
- ✅ Ordem baseada em timestamp (FIFO)

#### 3. Eleição de Líder
- ✅ Processo inicia eleição
- ✅ Processo com maior ID vira coordenador
- ✅ Todos os processos reconhecem o líder
- ✅ Mensagens ELECTION → OK → COORDINATOR

### Ferramentas de Teste:
- Scripts automatizados (`.js` e `.bat`)
- `curl` para testes manuais
- Logs do Kubernetes para verificação

---

## 📹 Requisitos do Vídeo

### Duração:
- **Máximo**: 5 minutos
- **Recomendado**: 4-5 minutos

### Conteúdo Obrigatório:
1. Explicação breve da implementação (30s)
2. Mostrar código-fonte (30s)
3. Demonstração no Kubernetes (3-4min):
   - Mostrar pods rodando
   - Demonstrar Multicast
   - Demonstrar Mutex
   - Demonstrar Eleição
   - Mostrar logs

### Formato:
- **Resolução**: 1080p ou 720p
- **Formato**: MP4, AVI ou MOV
- **Áudio**: Claro e audível
- **Legenda**: Opcional mas recomendado

---

## 🔐 Requisitos de Segurança

### Desenvolvimento:
- ✅ CORS habilitado (apenas para desenvolvimento)
- ✅ Sem autenticação (projeto acadêmico)
- ✅ Logs não contêm informações sensíveis

### Produção (se aplicável):
- ⚠️ Desabilitar CORS ou configurar whitelist
- ⚠️ Adicionar autenticação (JWT, API Key)
- ⚠️ Rate limiting
- ⚠️ HTTPS/TLS

---

## 📝 Requisitos de Documentação

### Obrigatório:
- ✅ README.md com instruções de execução
- ✅ Comentários no código explicando algoritmos
- ✅ Estrutura clara de pastas

### Recomendado:
- ✅ Documentação de endpoints (este arquivo)
- ✅ Diagramas de arquitetura
- ✅ Exemplos de uso

---

## ✅ Checklist de Entrega

### Código:
- [ ] Repositório no GitHub (público ou privado com acesso)
- [ ] README.md completo
- [ ] Código TypeScript compilável
- [ ] Dockerfile funcional
- [ ] Manifestos Kubernetes válidos

### Demonstração:
- [ ] Vídeo de até 5 minutos
- [ ] Explicação da implementação
- [ ] Execução no Kubernetes
- [ ] Demonstração dos 3 algoritmos
- [ ] Logs visíveis

### Testes:
- [ ] Multicast funciona com ordenação total
- [ ] Mutex garante exclusão
- [ ] Eleição elege processo correto
- [ ] Todos os 3 processos se comunicam

---

## 🎓 Critérios de Avaliação

### Multicast (2.0 pontos):
- Implementação correta do relógio lógico
- Fila de prioridade funcionando
- ACKs sendo enviados e recebidos
- Ordenação total garantida

### Mutex (2.0 pontos):
- Algoritmo distribuído (não centralizado)
- Apenas 1 processo por vez na região crítica
- Respeita ordem de requisições (timestamp)
- Sem deadlock

### Eleição (2.0 pontos):
- Algoritmo do Valentão implementado
- Processo com maior ID eleito
- Todos reconhecem o coordenador
- Mensagens corretas (ELECTION, OK, COORDINATOR)

### Kubernetes (4.0 pontos total):
- Pods rodando corretamente
- Comunicação entre pods funcionando
- Logs demonstrando funcionamento
- Vídeo mostrando execução

---

## 🆘 Suporte e Troubleshooting

### Problemas Comuns:

#### "Pods não iniciam"
```bash
kubectl describe pod multicast-api-0
kubectl logs multicast-api-0
```

#### "Comunicação falha entre pods"
- Verificar nomes dos services
- Verificar DNS do Kubernetes
- Testar com `kubectl exec`

#### "Port conflict (EADDRINUSE)"
- Verificar portas em uso
- Matar processos antigos
- Usar portas diferentes

### Recursos:
- Documentação: README.md
- Logs: `kubectl logs -f <pod>`
- Describe: `kubectl describe pod <pod>`
- Exec: `kubectl exec -it <pod> -- sh`

---

## 📚 Referências

### Algoritmos:
- Lamport, L. (1978). "Time, clocks, and the ordering of events"
- Ricart, G., & Agrawala, A. K. (1981). "An optimal algorithm for mutual exclusion"
- Garcia-Molina, H. (1982). "Elections in a distributed computing system"

### Tecnologias:
- Node.js: https://nodejs.org/
- TypeScript: https://www.typescriptlang.org/
- Kubernetes: https://kubernetes.io/
- Docker: https://www.docker.com/

---

**Última atualização**: Dezembro 2024
**Versão**: 1.0.0
