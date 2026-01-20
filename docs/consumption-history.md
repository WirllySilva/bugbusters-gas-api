# Histórico de Consumo

Este conjunto de endpoints permite consultar o consumo de gás de um usuário por **dia**, por **mês** e gerar **relatórios mensais em PDF**.

Base URL (ambiente local): 
```bash
http://localhost:3000
```

Todos os endpoints descritos abaixo **exigem autenticação via JWT**.

---

## Autenticação

Antes de consumir qualquer endpoint de histórico, o cliente deve obter um token JWT através do fluxo de autenticação OTP.

O token é retornado pelo endpoint: 
```bash
`POST /api/auth/verify-otp`
```

Em todas as requisições protegidas, o token deve ser enviado no header: `Authorization: Bearer <JWT_TOKEN>`


---

## 1. Histórico de Consumo Diário

Retorna o consumo de gás de um usuário em um dia específico.  
O endpoint pode retornar apenas o total do dia ou incluir o detalhamento por hora.

### Endpoint

`GET /api/consumption/history`


### Parâmetros de Query

|    Parâmetro    |    Obrigatório    |             Descrição              |
|-----------------|-------------------|------------------------------------|
|      `date`     |        sim        |    Data no formato `YYYY-MM-DD`    |
|    `details`    |        não        | `true` ou `false` (padrão: `true`) |

- Quando `details=false`, o endpoint retorna **somente o consumo total do dia**
- Quando `details=true`, o endpoint retorna o total **mais o consumo por hora**

---

### Exemplo – consumo diário (sem detalhes)

```bash
curl -X GET "http://localhost:3000/api/consumption/history?date=2025-05-17&details=false" \
  -H "Authorization: Bearer <TOKEN>"
```
### Retorno
```json
{
  "date": "2025-05-17",
  "total_used_kg": 2.3
}
```
### Exemplo – com detalhes por hora
```bash
curl -X GET "http://localhost:3000/api/consumption/history?date=2025-05-17&details=true" \
  -H "Authorization: Bearer <TOKEN>"
```
### Retorno
```json
{
  "date": "2025-05-17",
  "total_used_kg": 2.3,
  "hours": [
    { "hour": "2025-05-17T01:00:00.000Z", "used_kg": 0.2 },
    { "hour": "2025-05-17T02:00:00.000Z", "used_kg": 0.1 }
  ]
}
```
---
## Possíveis erros
### - 400 Bad Request
```json
{"message": "date is required (YYY-MM-DD)" }
```
OU
```json
{ "message": "Invalid date. Use YYYY-MM-DD" }
```
### - 401 Unauthorized
```json
{ "message": "Token ausente" }
```
ou
```json
{ "message": "Token inválido" }
```
---
## 2. Histórico de Consumo Mensal
Retorna o consumo total do mês e o consumo de cada dia.

### Endpoint
```bash
GET /api/consumption/monthly
```
### Query Params
|Parâmetro	| Obrigatório	|          Descrição     |
|-----------|---------------|------------------------|
|  `month`	|     sim	    |Mês no formato `YYYY-MM`|
### Exemplo
```bash
curl -X GET "http://localhost:3000/api/consumption/monthly?month=2025-05" \
  -H "Authorization: Bearer <TOKEN>"
```
### Resposta
```json
{
  "month": "2025-05",
  "total_used_kg": 12.8,
  "days": [
    { "day": "2025-05-01T00:00:00.000Z", "used_kg": 1.0 },
    { "day": "2025-05-02T00:00:00.000Z", "used_kg": 0.5 }
  ]
}
```
### Possíveis erros
### - 400 Bad Request
```json
{ "message": "Invalid month. Use YYYY-MM" }
```
---
## 3. Relatório Mensal em PDF
Gera e retorna um PDF com o relatório mensal de consumo.

O relatório contém:

- identificação do usuário (nome ou telefone)

- mês de referência

- consumo total do mês

- consumo por dia

### Endpoint
```bash
GET /api/consumption/pdf
```
###Query Params
| Parâmetro |  Obrigatório	|        Descrição       |
|-----------|---------------|------------------------|
|  `month`	|       sim	    |Mês no formato `YYYY-MM`|
### Exemplo – download via terminal
```bash
curl -L -o consumption-2025-05.pdf \
  -H "Authorization: Bearer <TOKEN>" \
  "http://localhost:3000/api/consumption/pdf?month=2025-05"
```
### Headers da resposta
```bash
Content-Type: application/pdf
Content-Disposition: attachment; filename="consumption-2025-05.pdf"
```
## Testando no Postman
1. Criar uma request:

- Method: `GET`

- URL: `http://localhost:3000/api/consumption/pdf?month=2025-05`

2. Aba Authorization:

- Type: `Bearer Token`

- Cole apenas o token JWT

3. Clique em Send

- Use Send and Download ou Save Response para salvar o PDF

### Possíveis erros
- 400 Bad Request
```json
{ "message": "Invalid month. Use YYYY-MM" }
```
- 401 Unauthorized
---
## Observações Gerais
- Caso não existam registros de consumo para o período solicitado, o retorno será:

    - consumo total 0

    - listas vazias (days ou hours)

- O mesmo serviço é utilizado para:

    - listagem em JSON (uso em apps)

    - geração de PDF (relatórios)
---