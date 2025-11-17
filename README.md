# 🔥 BugBusters Gas API

API REST desenvolvida em **Node.js + TypeScript** utilizando arquitetura em camadas e princípios de Programação Orientada a Objetos (POO).  
O objetivo da aplicação é monitorar o consumo de gás GLP por meio de sensores (simulados no MVP), gerenciar cilindros dos usuários, permitir contratação de recarga de gás, gerenciar fornecedores e disponibilizar dados para um aplicativo mobile.

Este projeto foi desenvolvido pela equipe **BugBusters** para a disciplina de Desenvolvimento Web Back-End (Softex — Node.js + TypeScript).

---

# 📦 Objetivo do Projeto

Criar uma API completa capaz de:

- Registrar usuários e seus cilindros de gás  
- Receber e processar leituras de consumo  
- Gerar alertas sobre nível baixo de gás  
- Disponibilizar histórico de uso  
- Simular um sensor real para testes  
- Listar e gerenciar **fornecedores de gás**  
- Expor endpoints para o aplicativo mobile consumir  

---

# 🚀 MVP – Funcionalidades Principais

## 👤 Usuários
- Cadastro de usuário  
- Login e autenticação com JWT  
- Consulta de dados do usuário  

## 🧯 Cilindros (Gás)
- Cadastro de cilindro por usuário  
- Atualização do peso atual  
- Consulta de cilindros do usuário  
- Registro automático de consumo enviado pelo sensor  

## ⚡ Consumo
- Receber leituras do sensor  
- Calcular percentual restante de gás  
- Registrar histórico de consumo  
- Expor histórico para o usuário via API  

## 🚨 Alertas
- Gerar alertas automáticos:  
  - ⚠️ 20% → Alerta amarelo  
  - 🔥 5% → Alerta vermelho   

## 🛠 Sensor Simulado
- Classe `FakeSensor` que:
  - Simula o consumo real de gás  
  - Envia leituras automáticas em intervalo configurado  
- Agendamento automático com `node-cron`

## 🏪 Fornecedores (Gas Providers)
Funcionalidade incluída no projeto:

- Cadastro de fornecedores com CNPJ  
- Endereço e dados de contato  
- Listagem de fornecedores  
- Filtro por cidade ou bairro  
- Endpoint para solicitar compra de GLP ao fornecedor  
