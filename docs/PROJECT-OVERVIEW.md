```markdown
#  Visão Geral do Projeto

##  Objetivo

O **Gas Control API** é uma solução backend completa para monitoramento e gestão de GLP (Gás Liquefeito de Petróleo). O sistema permite que usuários monitorem seu consumo de gás em tempo real, recebam alertas inteligentes e solicitem recargas de forma prática.

##  Contexto do Projeto

Desenvolvido pela equipe **BugBusters** para a disciplina de **Desenvolvimento Web Back-End** (Softex — Node.js + TypeScript), este projeto demonstra habilidades em:

- Arquitetura de APIs RESTful
- Banco de dados com PostgreSQL e Prisma
- Autenticação segura
- Sistemas de monitoramento em tempo real
- Integração com serviços externos (WhatsApp API)

##  Stack Tecnológico

| Componente       | Tecnologia  | Versão |
|------------------|-------------|--------|
| Runtime          | Node.js     | 18+    |
| Linguagem        | TypeScript  | 5.0+   |
| Banco de Dados   | PostgreSQL  | 14+    |
| ORM              | Prisma      | 5.x    |
| Autenticação     | OTP         | -      |
| Agendamento      | node-cron   | -      |
| HTTP Client      | Axios       | -      |


##  Público-Alvo

### 1. Clientes Finais
- Usuários residenciais de GLP
- Pequenos comerciantes (restaurantes, padarias)

### 2. Fornecedores
- Empresas distribuidoras de GLP
- Revendedores autorizados

##  Escopo do MVP

###  Incluído
- [x] Autenticação via OTP (telefone)
- [x] Cadastro de clientes e fornecedores
- [x] Sensor simulado de consumo
- [x] Detecção de vazamentos
- [x] Alertas via WhatsApp
- [x] Histórico de consumo
- [x] Solicitação de GLP
- [x] Gestão de fornecedores

###  Futuras Melhorias
- Dashboard analítico avançado
- Integração com sensores reais
- Sistema de pagamento
- Recomendações inteligentes
- App mobile nativo

##  Metas de Negócio

### Segurança
- Reduzir acidentes por vazamentos
- Alertar sobre consumo anormal

### Conveniência
- Facilitar pedido de recarga
- Centralizar informações de fornecedores

### Economia
- Otimizar consumo de gás
- Comparar preços entre fornecedores

##  Diagramas do Sistema

### Diagrama de Casos de Uso
[![Use Case](docs/architecture.png)](docs/diagrams/usecase-diagram-gascontrol-api.png)

---

## Para Desenvolvedores

### Filosofia do Código
Clean Code - Código limpo e legível

SOLID - Princípios de design

Type Safety - TypeScript em todo projeto


### Padrões Adotados
MVC + Services - Separação de responsabilidades

Repository Pattern - Isolamento do banco

DTO/Validation - Validação de dados



### Diferenciais
Sensor Simulado - Testes completos sem hardware

OTP Simples - Autenticação sem senhas

WhatsApp Integration - Notificações diretas

PDF Export - Histórico offline

---
