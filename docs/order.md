# Orders

## Create Order
Cria um pedido de gás para um fornecedor.

- Method: `POST`
- URL: `/api/orders`
- Auth: `CLIENT`

### Body
```json
{
  "supplier_id": "UUID_DO_SUPPLIER",
  "delivery_type": "PICKUP",
  "address_id": "UUID_DO_ADDRESS (opcional)",
  "notes": "mensagem opcional"
}
```

## Rules

- O `client_id` é extraído do token (JWT).

- status inicial sempre será `PENDING` (aguardando confirmação).

- Fornecedor deve existir, ter role `SUPPLIER` e estar ativo (`supplier_info.is_active = true`).

- `DELIVERY`: exige `address_id` válido do cliente ou um endereço default.

- `PICKUP`: `address_id` pode ser `null`.

### Success Response (201)
```json
{
  "message": "Pedido criado com sucesso.",
  "order": {
    "order_id": "uuid",
    "client_id": "uuid",
    "supplier_id": "uuid",
    "address_id": null,
    "delivery_type": "PICKUP",
    "status": "PENDING",
    "notes": "Quero retirar hoje",
    "price": null,
    "created_at": "2026-01-17T20:22:10.093Z",
    "updated_at": "2026-01-17T20:22:10.093Z",
    "delivered_at": null
  },
  "status_label": "aguardando confirmação"
}
```

## Accept Order

Fornecedor aceita o pedido (opcionalmente informando preço).

- Method: `PATCH`

- URL: `/api/orders/:order_id/accept`

- Auth: `SUPPLIER`

### Body (opcional)
```json
{
  "price": 120.50
}
```
## Rules

- Apenas SUPPLIER.

- Pedido precisa existir e pertencer ao fornecedor logado.

- Só aceita se status atual for PENDING.

- Atualiza status para ACCEPTED.

### Success Response (200)
```json
{
  "message": "Pedido aceito com sucesso.",
  "order": { "...": "..." }
}
```
## List Orders

Lista pedidos do usuário logado.

- Method: `GET`

- URL: `/api/orders`

- Auth: `CLIENT` ou `SUPPLIER`

### Behavior

- `CLIENT`: retorna pedidos onde `client_id = user_id do token`

- `SUPPLIER`: retorna pedidos onde `supplier_id = user_id do token`

### Query Params (opcionais)

- `status`: `PENDING|ACCEPTED|IN_TRANSIT|DELIVERED|CANCELLED`

- `take`: número de itens (default 20, max 50)

- `skip`: offset (default 0)

Exemplo:

- `/api/orders?status=PENDING&take=10&skip=0`

### Success Response (200)
```json
{
  "orders": [],
  "pagination": { "take": 20, "skip": 0 }
}
```

## Update Order Status

Atualiza status do pedido (fluxo do fornecedor).

- Method: `PATCH`

- URL: `/api/orders/:order_id/status`

- Auth: `SUPPLIER`

### Body
```json
{ "status": "IN_TRANSIT" }
```
ou
```json
{ "status": "DELIVERED" }
```
### Rules (transições permitidas)

- ´ACCEPTED -> IN_TRANSIT`

- `IN_TRANSIT -> DELIVERED` (define `delivered_at`)

Qualquer outra transição deve retornar erro.

### Success Response (200)
```json
{
  "message": "Status atualizado com sucesso.",
  "order": { "...": "..." }
}
```
## Cancel Order

Cancela um pedido de acordo com o papel do usuário.

- Method: `PATCH`

- URL: `/api/orders/:order_id/cancel`

- Auth: `CLIENT` ou `SUPPLIER`

### Rules

`CLIENT` pode cancelar apenas se `status === PENDING` e se o pedido for dele.

`SUPPLIER` pode cancelar apenas se `status === ACCEPTED` e se o pedido for dele.

Atualiza status para `CANCELLED`.

### Success Response (200)
```json
{
  "message": "Pedido cancelado com sucesso.",
  "order": { "...": "..." }
}
```