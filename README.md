# 🔥 BugBusters Gas Control API

> API REST para monitoramento e gestão de GLP com alertas inteligentes

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-purple.svg)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Sobre o Projeto

API REST desenvolvida em **Node.js + TypeScript** utilizando arquitetura em camadas e princípios de Programação Orientada a Objetos (POO).  
O objetivo da aplicação é monitorar o consumo de gás GLP por meio de sensores (simulados no MVP), gerenciar cilindros dos usuários, permitir contratação de recarga de gás, gerenciar fornecedores e disponibilizar dados para um aplicativo mobile.

Este projeto foi desenvolvido pela equipe **BugBusters** para a disciplina de Desenvolvimento Web Back-End (Softex — Node.js + TypeScript).

---

## 🎯 Funcionalidades Principais

### 👤 Autenticação & Usuários
- ✅ Autenticação via OTP (código por telefone)
- ✅ Cadastro de clientes e fornecedores
- ✅ Multiplos endereços por usuário

### 📡 Monitoramento Inteligente
- ✅ Sensor simulado com consumo realista
- ✅ Detecção de vazamentos e consumo excessivo
- ✅ Alertas automáticos via WhatsApp
- ✅ Histórico de consumo com exportação PDF

### 🛒 Gestão de Pedidos
- ✅ Solicitação de GLP com entrega/retirada
- ✅ Listagem de fornecedores com filtros
- ✅ Status do pedido em tempo real

### 📊 Relatórios & Análise
- ✅ Histórico diário de consumo
- ✅ Gráficos simplificados
- ✅ Relatórios completos em PDF

## 🚀 Vamos lá?

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
