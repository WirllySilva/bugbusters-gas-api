# Fake Sensor – Gas Control API

This document describes the architecture and behavior of the FakeSensor and FakeSensorRunner modules.

---

## 1. Overview

The FakeSensor simulates a real gas cylinder weight sensor.  
It generates gradual gas consumption values and sends readings to the API, allowing the system to be fully tested without physical hardware.

---

## 2. Data Flow

FakeSensor → ConsumptionController → ConsumptionService → 
  ├─ ConsumptionEventRepository
  ├─ ConsumptionCurrentRepository
  ├─ ConsumptionHourlyRepository
  └─ ConsumptionDailyRepository
→ PostgreSQL → NotificationService (WhatsApp / Push)

---

## 3. FakeSensor Responsibilities

Feature and Description

Weight simulation: 
    Reduces gas weight gradually using random values

Percentage calculation: 
    Converts weight to remaining percentage

Data packaging: 
    Converts internal state into a SensorReading DTO

API communication: 
    Sends readings using Axios

Logging: 
    Logs all readings and errors

---

## 4. FakeSensor Structure

Attribute and Description

user_id: 
    Gas cylinder owner

initialWeight: 
    Initial cylinder weight

currentWeight: 
    Current gas weight

minConsumptionPerCycle: 
    Minimum consumption per reading

maxConsumptionPerCycle: 
    Maximum consumption per reading

---

## 5. SensorReading Interface

```ts
interface SensorReading {
  userId: string;
  weightKg: number;
  percent: number;
  createdAt: Date;
}
```

---
## 6. FakeSensorRunner

The FakeSensorRunner is responsible for executing the FakeSensor at fixed intervals using ```node-cron```

Exemple:

Time and Action

12:00 / FakeSensor sends reading
12:01 / FakeSensor sends reading
12:02 / It sends reading

---
## 7. Benefits

* Full system test without hardware
* Continuous data generation
* Enables MVP validation
* Supports academic demonstration



## 8. Autenticação do Sensor (API Key)

Para simular um dispositivo físico real, o FakeSensor não utiliza autenticação via JWT.

Em vez disso, a API disponibiliza um mecanismo seguro de ingestão de dados que aceita duas formas de autenticação:

- **JWT** válido – utilizado pelos usuários da aplicação.

- **API Key do sensor** – utilizada por dispositivos ou simuladores de sensores.

Esse comportamento é implementado por meio de um middleware personalizado chamado `sensorOrAuthMiddleware`.

### Como funciona

- O FakeSensor envia um header HTTP contendo a chave do sensor:
```bash
x-sensor-key: <SENSOR_API_KEY>
```

- Se a chave enviada for igual ao valor definido no arquivo .env, a requisição ignora a autenticação JWT.

- Caso o header não exista ou seja inválido, a rota exige autenticação padrão via JWT.

### Variável de ambiente
```bash
SENSOR_API_KEY=super-secret-key-123
```

### Comportamento do middleware (conceitual)

- Se `x-sensor-key` for válido → requisição autorizada.

- Caso contrário → autenticação JWT obrigatória.

## 9. Use Case Diagram (portuguese)

![FakeSensor Use case diagram](/documentation/diagrams/fakesensor-usecase-diagram.png)

## 10. PostMan test - POST (/sensor-readings)

![PostmanTest](/documentation/images/postman-POSTsensor-readings.png)