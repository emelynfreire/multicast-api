# Usar Python 3.11 slim para produção
FROM python:3.11-slim

WORKDIR /app

# Copiar requirements
COPY requirements.txt ./

# Instalar dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código fonte
COPY src/ ./src/

# Expor porta
EXPOSE 3000

# Variáveis de ambiente padrão
ENV PROCESS_ID=0
ENV TOTAL_PROCESSES=3
ENV PORT=3000

# Comando para iniciar com uvicorn
CMD ["python", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "3000"]
