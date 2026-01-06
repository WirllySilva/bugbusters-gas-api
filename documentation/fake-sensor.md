# Fake Sensor – Gas Control API

This document describes the architecture and behavior of the FakeSensor and FakeSensorRunner modules.

---

## 1. Overview

The FakeSensor simulates a real gas cylinder weight sensor.  
It generates gradual gas consumption values and sends readings to the API, allowing the system to be fully tested without physical hardware.

---

## 2. Data Flow

FakeSensor → POST /consumption/readings → API → Service → Prisma → PostgreSQL → Alerts

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

## 7. Alerts

Percentage Remaining

<= 20%  →   Warning
<= 5%   →   Critical alert

---
## 8. Benefits

* Full system test without hardware
* Continuous data generation
* Enables MVP validation
* Supports academic demonstration


## 9. Use Case Diagram (portuguese)

![FakeSensor Use case diagram](/documentation/images/fakesensor-usecase-diagram.png)

## 10. PostMan test - POST (/sensor-readings)

![PostmanTest](/documentation/images/Postman-POSTsensor-readings.png)
