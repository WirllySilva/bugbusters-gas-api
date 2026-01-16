# Autenticação e Cadastro (OTP + JWT)

Este projeto utiliza autenticação baseada em OTP (One-Time Password) enviado por “notificação” (mock) e geração de JWT para acesso a rotas protegidas.

- OTP: código de 6 dígitos com expiração  5 minutos.

- JWT: token de acesso com expiração (ex.: 1d), usado como `Bearer Token` no header `Authorization`.

---

## Conceitos e Regras Gerais

### OTP

- O OTP é armazenado na tabela `otp_code` por `phone` (único).

- Sempre que um OTP novo é solicitado, ele é criado/atualizado via `upsert`.

- Ao validar com sucesso, o OTP é apagado (`delete`) para evitar reutilização.

- Se estiver expirado, o OTP é apagado e retorna erro.

### JWT

- O JWT é gerado após verificação bem-sucedida do OTP (login ou cadastro).

- Deve ser enviado em rotas protegidas:

```http
Authorization: Bearer <token>
```

## Roles

Os usuários possuem o campo `role`, que define o tipo de acesso e comportamento no sistema:

- `**CLIENT**`
- `**SUPPLIER**`
- `**ADMIN**` *(reservado)*

> O cadastro e o login sempre consideram o `role` informado.

---

## Flags de Completação

Durante o login (`verify`), o backend informa se ainda existem dados essenciais pendentes no cadastro do usuário.

- **`needs_profile_completion`**  
  Retorna `true` quando o usuário ainda não completou o perfil, por exemplo:
  - Campo `name` nulo ou ausente

- **`needs_supplier_info_completion`**  
  Retorna `true` quando:
  - O usuário possui `role = SUPPLIER`
  - **E** não existe registro correspondente em `supplier_info`

> Para usuários com `role = CLIENT`, o campo  
> `needs_supplier_info_completion` deve ser sempre `false`.


## Base URL

Assumindo que o servidor monta as rotas em:
```text
/api
```
---

## Cadastro (Register)

### Fluxo Geral (CLIENT e SUPPLIER)

1. **Enviar OTP de cadastro**
2. **Verificar OTP de cadastro**
   - Cria ou reativa o usuário
   - Gera o token de autenticação (JWT)
3. **Completar perfil**
   - Campos obrigatórios: `name`, `email`
   - Campos opcionais: endereço
4. **(Somente SUPPLIER) Completar `supplier_info`**

## 1) Enviar OTP de Cadastro

### Endpoint

**POST** `/auth/register/send-otp`

---

### Body

```json
{
  "phone": "11999999999",
  "role": "CLIENT"
}
```

### Regras

- Se `phone` já existe em `user` (e não está soft-deleted): `409` Telefone já cadastrado

- Se ok:

    - gera OTP

    - salva em `otp_code` (upsert)

    - envia notificação mock

    - retorna `dev_otp` (somente desenvolvimento)

### Response (200)
```json
{
  "message": "Código OTP enviado com sucesso.",
  "dev_otp": "123456"
}
```

### Erros

- `400` Telefone/Role ausentes ou inválidos

- `409` Telefone já cadastrado

## 2) Verificar OTP de cadastro

**POST** `/auth/register/verify-otp`

### Body
```json
{
  "phone": "11999999999",
  "otp_code": "123456",
  "role": "CLIENT"
}
```

### Regras

- Se `otp_code` inválido: 401 Código inválido

- Se expirado: `401` Código expirado e remove `otp_code`

- Se válido:

    - cria ou reativa user com phone, role e `is_verified=true`

    - gera JWT

    - apaga `otp_code`

### Response (200)
```json
{
  "message": "OTP verificado com sucesso.",
  "token": "<jwt>",
  "user": {
    "user_id": "...",
    "phone": "11999999999",
    "role": "CLIENT",
    "is_verified": true,
    "name": null,
    "email": null
  }
}
```
### Erros

- `400` parâmetros ausentes

- `401` Código inválido / expirado

- `409` Telefone já cadastrado (se ocorrer corrida)

## 3) Completar perfil (CLIENT e SUPPLIER)

**PUT** `/auth/register/complete-profile` (rota protegida)

### Header
```h
Authorization: Bearer <token>
```
### Body (mínimo)
```json
{
  "name": "Wirlly",
  "email": "wirlly@email.com"
}
```
### Body (com endereço)
```json
{
  "name": "Wirlly",
  "email": "wirlly@email.com",
  "address": {
    "street": "Rua Central",
    "number": "123",
    "neighborhood": "Centro",
    "city": "Araçoiaba",
    "state": "PE",
    "zip_code": "00000-000",
    "label": "Casa",
    "is_default": true
  }
}
```
### Regras

- Requer JWT válido

- Atualiza `user.name` e `user.email`

- Se `address` for informado:

    - cria endereço do usuário (conforme regra implementada)

    - o schema exige campos obrigatórios (`street`, `number`, `neighborhood`, `city`, `state`, `zip_code`)

### Response (200)
```json
{
  "message": "Cadastro atualizado com sucesso.",
  "user": {
    "user_id": "...",
    "phone": "11999999999",
    "role": "CLIENT",
    "name": "Wirlly",
    "email": "wirlly@email.com"
  }
}
```
### Erros

- `401` Token inválido/ausente

- `400` Nome ausente (quando obrigatório)

- `500` Erros de validação do Prisma (se address incompleto)

## 4) Completar dados do fornecedor (somente SUPPLIER)

**PUT** `/auth/register/complete-supplier-info` (rota protegida)

## Header
```h
Authorization: Bearer <token>
```
### Body (exemplo)
```json
{
  "payment_methods": ["PIX", "CREDIT_CARD"],
  "open_time": "08:00",
  "close_time": "18:00",
  "open_days": ["MON", "TUE", "WED", "THU", "FRI"],
  "deliveryTimes": 60,
  "is_active": true
}
```
### Regras

- Requer JWT válido

- Usuário deve ser `role=SUPPLIER`, caso contrário:

    - `403` Apenas fornecedor pode completar `supplier_info`

- Faz `upsert` em `supplier_info` usando `user_id`

### Response (200)
```json
{
  "message": "Informações do fornecedor atualizadas com sucesso.",
  "supplier_info": {
    "user_id": "...",
    "payment_methods": ["PIX", "CREDIT_CARD"],
    "open_time": "08:00",
    "close_time": "18:00",
    "open_days": ["MON", "TUE", "WED", "THU", "FRI"],
    "deliveryTimes": 60,
    "is_active": true
  }
}
```

### Erros

- `401` Token inválido/ausente

- `403` Role inválida (não é SUPPLIER)

- `404` Usuário não encontrado

## Login (CLIENT e SUPPLIER)
### Fluxo geral

1. Enviar OTP de login

2. Verificar OTP de login (gera token + flags)

## 1) Enviar OTP de login

**POST** `/auth/login/send-otp`

### Body
```json
{
  "phone": "11999999999",
  "role": "CLIENT"
}
```
### Regras

- Se usuário não existe: `404` Usuário não cadastrado

- Se `role` não bate com o usuário: `403` Role inválida para este usuário

- Se ok:

    - gera OTP

    - salva em `otp_code` (upsert)

    - envia notificação mock

    - retorna `dev_otp` (somente dev)

### Response (200)
```json
{
  "message": "Código OTP enviado com sucesso.",
  "dev_otp": "123456"
}
```
## 2) Verificar OTP de login

**POST** `/auth/login/verify-otp`

### Body
```json
{
  "phone": "11999999999",
  "otp_code": "123456"
}
```
### Regras

- OTP inválido: `401` Código inválido

- OTP expirado: `401` Código expirado e remove `otp_code`

- Usuário inexistente: `404` Usuário não encontrado

- Se usuário não verificado, marca `is_verified=true`

- Gera JWT

- Remove `otp_code`

- Calcula flags:

    - `needs_profile_completion` = `!user.name`

    - `needs_supplier_info_completion` = (`role=SUPPLIER`) && `!supplier_info`

### Response (200)
```json
{
  "message": "Login bem-sucedido.",
  "token": "<jwt>",
  "user": {
    "user_id": "...",
    "phone": "11999999999",
    "role": "CLIENT",
    "name": "Wirlly",
    "email": "wirlly@email.com"
  },
  "needs_profile_completion": false,
  "needs_supplier_info_completion": false
}
```
Para `CLIENT`, `needs_supplier_info_completion` deve ser sempre `false`.

## Atualização de Perfil e Endereço (Usuário Logado)
### Atualizar perfil e criar/atualizar endereço default

**PUT** `/users/me/profile` (rota protegida)

### Header
```h
Authorization: Bearer <token>
```
### Body (exemplo)
```json
{
  "name": "Wirlly",
  "email": "wirlly@email.com",
  "address": {
    "street": "Rua Central",
    "number": "123",
    "neighborhood": "Centro",
    "city": "Araçoiaba",
    "state": "PE",
    "zip_code": "00000-000",
    "label": "Casa",
    "is_default": true
  }
}
```
### Regras

- Requer JWT

- Atualiza campos do user

- Se address enviado:

    - cria ou atualiza o endereço default (conforme implementação)

    - se `is_default=true`, pode (opcionalmente) marcar os demais como false

## Observações para Produção (MVP vs Produção)

- `dev_otp` deve ser removido em produção.

- JWT expira em 1 dia (`expiresIn: "1d"`). Em apps reais, é comum usar refresh tokens para manter sessão por mais tempo.

- OTP expirado pode ser limpo por job, mas não é obrigatório no MVP.

## Sugestão de Testes (Postman)
### Cadastro CLIENT

1. `POST /auth/register/send-otp`

2. `POST /auth/register/verify-otp` → copiar `token`

3. `PUT /auth/register/complete-profile` (Bearer token)

### Cadastro SUPPLIER

1. `POST /auth/register/send-otp `(`role=SUPPLIER`)

2. `POST /auth/register/verify-otp` → token

3. `PUT /auth/register/complete-profile`

4. `PUT /auth/register/complete-supplier-info`

### Login CLIENT / SUPPLIER

1. `POST /auth/login/send-otp`

2. `POST /auth/login/verify-otp` → validar flags