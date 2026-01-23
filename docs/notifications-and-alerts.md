# Sistema de Notificações e Alertas

## Visão Geral

O sistema implementa um mecanismo interno de **notificações** e **alertas automáticos**
baseados em eventos de negócio, como consumo de gás e ciclo de vida de pedidos.

O backend já está totalmente preparado para integração futura com serviços externos
(WhatsApp, Push Notification), porém no MVP essas integrações são simuladas (mock).

O fluxo é **reativo**: o sistema **observa dados reais**, interpreta padrões e
gera alertas/notificações sem interferir diretamente no sensor.

---

## Arquitetura Geral

Fluxo principal:
```bash
FakeSensor
↓
POST /consumption/sensor-readings
↓
ConsumptionService
↓
(consumption_current / hourly / daily / events)
↓
AlertService
↓
NotificationService
```
Fluxo de pedidos:
```bash
OrderService
↓
(order create / status update / cancel)
↓
NotificationService
```
### Princípios adotados
- Services concentram regras de negócio
- Controllers apenas expõem endpoints HTTP
- Notificações não bloqueiam operações críticas
- Falhas de envio não interrompem o fluxo principal

---

## NotificationService

### Objetivo
Centralizar o envio de notificações para usuários, permitindo múltiplos canais
e facilitando integrações futuras.

### Canais Suportados (MVP)
- WhatsApp (mock)
- Push Notification (mock)

### Estrutura do Payload
```json
{
  "user_id": "uuid",
  "channel": "WHATSAPP | PUSH",
  "template": "TEMPLATE_NAME",
  "title": "Opcional (Push)",
  "message": "Texto da notificação",
  "payload": {
    "key": "value"
  }
}
```
### Características

- Totalmente desacoplado do domínio

- Chamado por AlertService e OrderService

- Integrações reais podem ser adicionadas sem refatoração estrutural
## Alertas de Consumo

Os alertas são gerados automaticamente a partir de dados históricos de consumo,
sem necessidade de sensores avançados no MVP.

Todos os alertas são registrados na tabela alert com:

- tipo

- mensagem

- metadados explicativos

- status de tratamento
## Alerta de Consumo Excessivo (HIGH_CONSUMPTION)
### Descrição

Detecta quando o consumo diário atual está significativamente acima do padrão
histórico do usuário.

### Objetivo

- Alertar sobre desperdício

- Antecipar custos elevados

- Incentivar uso consciente

### Regra de Negócio

- Calcular a média diária de consumo dos últimos dias

- Comparar com o consumo do dia atual

- Se exceder o multiplicador configurado, gerar alerta

### Fórmula
```bash
consumo_hoje > média_diária × multiplicador
```
### Configurações via .env
```env
HIGH_CONSUMPTION_MULTIPLIER=2
HIGH_CONSUMPTION_COOLDOWN_MIN=360
```
### Anti-Spam

Após um alerta, novos alertas do mesmo tipo só são permitidos
após o período de cooldown.

### Ações Executadas

- Registro em alert

- Envio de notificação (WhatsApp + Push)

## Alerta de Possível Vazamento (LEAK)
### Descrição

Detecta padrões de consumo incompatíveis com o uso normal de GLP,
indicando possível vazamento.

### Objetivo

- Alertar rapidamente o usuário

- Permitir ação preventiva

- Reduzir riscos de segurança

### Estratégia de Detecção

O sistema utiliza duas regras independentes.
Se qualquer uma for satisfeita, o alerta é gerado.

### Regra 1 — Queda Brusca

- Analisa leituras consecutivas do sensor

- Detecta queda anormal de peso em curto intervalo de tempo

### Regra 2 — Consumo Elevado na Hora

- Avalia o consumo acumulado da hora atual

- Compara com um limite configurável

### Configurações via .env
```env
LEAK_COOLDOWN_MIN=120
LEAK_DROP_KG=0.35
LEAK_DROP_MAX_MINUTES=5
LEAK_HOURLY_THRESHOLD_KG=3.8
```
## Metadados

Cada alerta registra no banco:

- regra que foi acionada

- valores medidos

- thresholds utilizados

- janela temporal analisada

### Observações Importantes

- O sistema não controla o sensor

- O alerta é apenas informativo no MVP

- Não há intervenção automática no fornecimento de gás
## Notificações de Pedido
### Visão Geral

O sistema envia notificações automáticas relacionadas ao ciclo de vida dos pedidos,
mantendo clientes e fornecedores informados.

Essas notificações são disparadas dentro do OrderService, após a persistência
das mudanças no banco de dados.

## Eventos Notificados
### Pedido Criado

- Cliente recebe confirmação de criação

- Fornecedor recebe aviso de novo pedido

### Pedido Aceito

- Cliente é informado quando o fornecedor aceita

### Pedido em Trânsito

- Cliente recebe aviso de envio

### Pedido Entregue

- Cliente recebe confirmação de entrega

### Pedido Cancelado

- Cliente recebe aviso de cancelamento
---
### Templates Utilizados

- ORDER_CREATED

- SUPPLIER_NEW_ORDER

- ORDER_ACCEPTED

- ORDER_IN_TRANSIT

- ORDER_DELIVERED

- ORDER_CANCELLED

### Canais

- WhatsApp (mock)

- Push Notification (mock)

### Garantias

- Falhas de notificação não impedem criação ou atualização de pedidos

- Sistema preparado para integrações reais futuras

## Testes de Endpoints (Postman e cURL)

Esta seção descreve como testar os endpoints relacionados a **pedidos**, **consumo** e **alertas/notificações**.

> Observação: as notificações (WhatsApp/Push) no MVP são mock. O resultado esperado é:
> - logs no console
> - e/ou registros na tabela de notificações (se existir no projeto)

---

### Pré-requisitos

- API rodando em: `http://localhost:3000`
- Banco conectado e migrations aplicadas
- Pelo menos:
  - 1 usuário `CLIENT`
  - 1 usuário `SUPPLIER` (ativo)
  - CLIENT com endereço padrão (se usar DELIVERY)
  - CLIENT com `has_sensor=true` (para consumo)

---

## 1) Pedidos (Orders)

### 1.1 Criar pedido (CLIENT)

**POST** `/api/orders`

**Headers**
- `Authorization: Bearer <TOKEN_CLIENT>`

**Body (JSON)**
```json
{
  "supplier_id": "UUID_DO_FORNECEDOR",
  "delivery_type": "DELIVERY",
  "address_id": "UUID_DO_ENDERECO_DO_CLIENTE",
  "notes": "Entrega no portão."
}
```
### Resultado esperado

- Status: 201

- Mensagem: Pedido criado com sucesso.

- Notificações:

    - CLIENT recebe: pedido criado

    - SUPPLIER recebe: novo pedido
---
## 1.2 Aceitar pedido (SUPPLIER)

**PATCH** `/api/orders/:order_id/accept`

### Headers

- `Authorization: Bearer <TOKEN_SUPPLIER>`

### Body (JSON)
```json
{
  "price": 120.00
}
```
### Resultado esperado

- Status: `200`

- Mensagem: Pedido aceito com sucesso.

- Notificação:

    - CLIENT recebe: pedido aceito
---
### 1.3 Atualizar status para IN_TRANSIT (SUPPLIER)

**PATCH** `/api/orders/:order_id/status`

### Headers

- `Authorization: Bearer <TOKEN_SUPPLIER>`

### Body (JSON)
```json
{
  "status": "IN_TRANSIT"
}
```
### Resultado esperado

- Status: `200`

- Notificação:

    - CLIENT recebe: pedido em trânsito
---
### 1.4 Atualizar status para DELIVERED (SUPPLIER)

**PATCH** `/api/orders/:order_id/status`

### Headers

- `Authorization: Bearer <TOKEN_SUPPLIER>`

### Body (JSON)
```json
{
  "status": "DELIVERED"
}
```
### Resultado esperado

- Status: `200`

- Notificação:

    - CLIENT recebe: pedido entregue
---
### 1.5 Cancelar pedido (CLIENT em PENDING) ou (SUPPLIER em ACCEPTED)

**PATCH** `/api/orders/:order_id/cancel`

### Headers

- `Authorization: Bearer <TOKEN_CLIENT ou TOKEN_SUPPLIER>`

### Resultado esperado

- Status: `200`

- Notificação:

    - CLIENT recebe: pedido cancelado
---
## 2) Consumo (Sensor Readings)
### 2.1 Enviar leitura do sensor (FakeSensor → API)

**POST** `/api/consumption/sensor-readings`

### Headers

- `x-sensor-key: <SENSOR_API_KEY>`

### Body (JSON)
```json
{
  "user_id": "UUID_DO_CLIENTE",
  "weight_kg": 12.950,
  "percent": 99.62,
  "created_at": "2026-01-22T12:00:00.000Z"
}
```
### Resultado esperado

- Status: `200` ou `201` (depende do seu controller)

- Atualiza:

    - `consumption_current`

    - `consumption_hourly`

    - `consumption_daily`

- Pode registrar eventos em `consumption_event`

- Dispara checks:

    - `checkHighConsumption()`

    - `checkPossibleLeak()`
---
## 3) Alertas
### 3.1 Listar todos os alertas do usuário

**GET** `/api/alerts`

### Headers

- `Authorization: Bearer <TOKEN_CLIENT>`

### Resultado esperado

- Status: `200`

- Lista alertas com `type`, `message`, `metadata`, `handled`, `created_at`
---
### 3.2 Listar alertas de consumo excessivo

**GET** `/api/alerts/consumption`

### Headers

- `Authorization: Bearer <TOKEN_CLIENT>`

### Resultado esperado

- Status: `200`

- Lista apenas `AlertType.HIGH_CONSUMPTION`
---
### 3.3 Marcar alerta como tratado

**PATCH** `/api/alerts/:alert_id/handled`

### Headers

- `Authorization: Bearer <TOKEN_CLIENT>`

### Body (JSON)
```json
{
  "handled": true
}
```
### Resultado esperado

- Status: 200

- handled passa para `true`
---