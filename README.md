<div align="center">

# BugBusters Gas Control API

> API REST para monitoramento e gestão de GLP com alertas inteligentes

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-purple.svg)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

##  Sobre o Projeto

API REST desenvolvida em **Node.js + TypeScript** utilizando arquitetura em camadas e princípios de Programação Orientada a Objetos (POO).  
O objetivo da aplicação é monitorar o consumo de gás GLP por meio de sensores (simulados no MVP), gerenciar cilindros dos usuários, permitir contratação de recarga de gás, gerenciar fornecedores e disponibilizar dados para um aplicativo mobile.

Este projeto foi desenvolvido pela equipe **BugBusters** para a disciplina de Desenvolvimento Web Back-End (Softex — Node.js + TypeScript).

---

##  Funcionalidades Principais

###  Autenticação & Usuários
-  Autenticação via OTP (código por telefone)
-  Cadastro de clientes e fornecedores
-  Multiplos endereços por usuário

###  Monitoramento Inteligente
-  Sensor simulado com consumo realista
-  Detecção de vazamentos e consumo excessivo
-  Alertas automáticos via WhatsApp
-  Histórico de consumo com exportação PDF

###  Gestão de Pedidos
-  Solicitação de GLP com entrega/retirada
-  Listagem de fornecedores com filtros
-  Status do pedido em tempo real

###  Relatórios & Análise
-  Histórico diário de consumo
-  Gráficos simplificados
-  Relatórios completos em PDF
---

##  Vamos lá?

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone https://github.com/WirllySilva/bugbusters-gas-api
cd bugbusters-gas-api

# Instale dependências
npm install

# Configure ambiente
cp .env.example .env
# Edite .env com suas credenciais

# Configure o banco
npx prisma migrate dev --name init
npx prisma generate

# Inicie o servidor
npm run dev
```
### Variáveis de Ambiente (.env)
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/gas_control"
WHATSAPP_API_KEY="sua-chave-whatsapp"
PORT=3000
```

## Testando API

### Health Check
```bash
curl http://localhost:3000/health
```

### Autenticação (Exemplo)
```bash
# 1. Solicitar OTP
curl -X POST http://localhost:3000/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+5511999999999"}'

# 2. Verificar OTP (use o código recebido)
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+5511999999999", "otp": "123456"}'
```
---
##  Arquitetura
```mermaid
flowchart TB
  A[Mobile App / Client] --> B[API REST - Express]
  B --> R[Routes src/routes]
  R --> C[Controllers src/controllers]
  C --> S[Services src/services]
  S --> Repo[Repositories src/repositories]
  Repo --> P[Prisma Client src/database + prisma/]
  P --> DB[(PostgreSQL)]

  subgraph Integrations
    W[WhatsApp API]
    F[Fake Sensor src/fake-sensor]
  end

  S -. sends notifications .-> W
  F -. simulates readings .-> B
  ``` 

---
## Estrutura do Projeto
```text
src/             
 ├─ controllers/          
 ├─ repositories/                         
 ├─ services/               
 ├─ utils/
 ├─ database/             
 ├─ dtos/                 
 ├─ fake-sensor/ 
 ├─ routes/          
```
---
## Gostaria de contribuir?

### Siga nosso fluxo de trabalho Git:

1 - Atualize local: git pull origin main

2 - Crie branch: git checkout -b feature/nome-da-feature

3 - Desenvolva e teste

4 - Commit: git commit -m "feat: descrição"

5 - Push: git push origin feature/nome-da-feature

6 - Abra Pull Request no GitHub

---
## Licença

Distribuído sob a licença MIT. Veja LICENSE para mais informações.

---

## Equipe BugBusters

- Lucas Henrique - [GitHub](https://github.com/lurikke)
- Wirlly Silva - [GitHub](https://github.com/WirllySilva)
- Bárbara Paranhos - [GitHub](https://github.com/barbpsouza)
- Maria Clara - [GitHub](https://github.com/clrasdev)
- Paulo Fraga - [GitHub](https://github.com/pauloffraga)
---

## Mais algumas informações

- Contato: wirlly.silva@gmail.com
- Reportar Bug: GitHub Issues
- Documentação: docs/
---

# Thank U!