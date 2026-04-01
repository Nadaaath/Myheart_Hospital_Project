
# MyHeart — Healthcare Management System Based on a Microservices Architecture

## Academic Context

This project was developed as part of a mini-project in **Service-Oriented Architecture (SOA)** and **Microservices**.  
Its objective is to design, implement, and deploy a healthcare management system using a distributed architecture where each core business capability is handled by an independent microservice.

The project emphasizes:

- identification of business-oriented microservices
- REST-based communication between services
- separation of data storage by service
- integration through an API Gateway
- frontend/backend interaction in a distributed system
- deployment with Docker and Docker Compose

---

## Project Overview

**MyHeart** is a healthcare management system developed using a **microservices architecture**.  
It models core hospital and clinic workflows in a modular, scalable, and maintainable way.

The system supports several essential healthcare operations, including:

- secure authentication and role-based access
- patient and doctor management
- appointment booking and scheduling
- consultation and medical record management
- billing and invoice generation
- catalog-based medical service browsing
- lab test requests and results handling

The main goal of this project is to replace a tightly coupled monolithic approach with a more flexible architecture where services can evolve independently while still collaborating through well-defined APIs.

---

## Project Objective

Healthcare systems often become difficult to maintain when all business logic is grouped into a single monolithic application.  
As the number of users, features, and workflows grows, these systems become harder to scale, debug, extend, and deploy.

The objective of **MyHeart** is to provide a modular alternative by decomposing the system into **independent microservices**, where each service owns:

- a clear business responsibility
- its own API
- its own persistence layer

This makes the application:

- easier to understand
- easier to maintain
- easier to test
- easier to extend
- more aligned with modern distributed system design principles

---

## Main Actors

The application currently supports the following actors:

### 1. Admin
The administrator is responsible for:
- creating patient accounts
- creating doctor accounts
- managing system access

### 2. Patient
The patient can:
- log in securely
- browse available healthcare services
- book appointments
- view appointment history
- access appointment details
- see consultation information
- see billing and invoice information
- see lab-related information

### 3. Doctor
The doctor can:
- log in securely
- view assigned appointments
- open appointment details
- add consultation notes
- add medical observations / prescriptions
- request lab tests

---

## Functional Scope

The system implements a realistic healthcare workflow across multiple services.

### Patient-side features
- secure login
- browse medical service catalog
- choose a service and book an appointment
- view upcoming and past appointments
- open appointment details
- consult billing and medical information

### Doctor-side features
- secure login
- see doctor appointment list
- open consultation pages
- write diagnosis and notes
- add prescription-related information
- request lab tests

### Backend features
- role-based authentication
- appointment management
- prevention of doctor double-booking
- invoice generation linked to appointment creation
- consultation storage
- catalog-based service pricing
- lab request integration

---

## Architecture

The system follows a **microservices architecture** and uses an **API Gateway** as the main entry point for frontend requests.

### Global Architecture Diagram

```text
Frontend
   |
   v
API Gateway
   |
   +-----------------------------------------------------------------------+
   |            |            |            |            |         |         |
   v            v            v            v            v         v         v
Auth        Patient       Doctor     Appointment   Consultation Billing  Catalog
Service     Service       Service     Service       Records     Service  Service
                                                 Service
                                                                    |
                                                                    v
                                                                Lab Service

Databases:
- MySQL: auth, patient, doctor, appointment, medical, billing, catalog
- MongoDB: lab
````

### Main Architectural Choices

The project applies the following microservices principles:

* **separation of concerns**: each service is responsible for one business capability
* **database per service**: each service owns its own persistence layer
* **REST communication**: services communicate synchronously through HTTP APIs
* **API Gateway pattern**: frontend requests are centralized through one entry point
* **containerized deployment**: services and databases run through Docker Compose

---

## Microservices Description

### 1. API Gateway

The API Gateway is the unique entry point for frontend requests.

Responsibilities:

* receive frontend requests
* route them to the appropriate backend service
* simplify frontend-backend communication
* centralize access to backend microservices

### 2. Auth Service

Responsible for authentication and authorization logic.

Responsibilities:

* login
* JWT generation
* user role handling
* account authentication

Main roles:

* `ADMIN`
* `DOCTOR`
* `PATIENT`

### 3. Patient Service

Responsible for patient data management.

Responsibilities:

* patient profile creation
* patient data retrieval
* patient-related data management

### 4. Doctor Service

Responsible for doctor data management.

Responsibilities:

* doctor profile creation
* doctor retrieval
* doctor filtering by department
* doctor directory management

### 5. Appointment Service

Responsible for appointment lifecycle management.

Responsibilities:

* appointment booking
* appointment retrieval
* appointment cancellation
* appointment detail aggregation
* prevention of doctor schedule conflicts

### 6. Consultation Records Service

Responsible for consultation and medical information.

Responsibilities:

* storing diagnosis
* storing medical notes
* storing consultation information
* managing medical records associated with appointments

### 7. Billing Service

Responsible for invoices and billing logic.

Responsibilities:

* invoice generation
* invoice retrieval by appointment
* invoice status tracking

### 8. Catalog Service

Responsible for the catalog of medical services and prices.

Responsibilities:

* exposing bookable medical services
* storing service descriptions
* storing and serving pricing information
* acting as the pricing reference for billing

### 9. Lab Service

Responsible for lab workflows.

Responsibilities:

* lab test requests
* lab data storage
* lab-related results integration

---

## Service Communication

The services communicate using **REST APIs**.

### Example 1 — Appointment booking flow

1. Patient selects a medical service
2. Patient books an appointment
3. Appointment Service creates the appointment
4. Billing Service is triggered
5. Catalog Service provides pricing/service information
6. Invoice is generated

### Example 2 — Appointment details flow

1. Patient opens an appointment details page
2. Frontend calls the API Gateway
3. API Gateway routes the request to the Appointment Service
4. Appointment Service retrieves appointment information
5. Related data is fetched from other services as needed
6. Frontend displays aggregated information

### Example 3 — Doctor consultation flow

1. Doctor opens an appointment
2. Doctor adds consultation information
3. Consultation Records Service stores the data
4. Doctor may request a lab test
5. Lab workflow is linked to the appointment context

---

## Technology Stack

### Backend

* **Node.js**
* **Express.js**
* **Prisma ORM**
* **Axios**

### Frontend

* **React**

### Databases

* **MySQL**
* **MongoDB**

### DevOps / Deployment

* **Docker**
* **Docker Compose**

---

## Databases

The system uses **database separation per service**, which is a core microservices design principle.

### MySQL Databases

The following MySQL databases are used:

* `myheart_auth`
* `myheart_patient`
* `myheart_doctor`
* `myheart_appointment`
* `myheart_medical`
* `myheart_billing`
* `myheart_catalog`

### MongoDB Database

* `myheart_lab`

### Why MySQL?

MySQL is used for strongly structured business domains that require relational consistency:

* authentication
* appointments
* billing
* medical records
* doctors and patients
* catalog

### Why MongoDB?

MongoDB is used for the lab service because lab-related records are a good candidate for document-oriented and more flexible storage.

---

## Project Structure

```text
myheart/
├── services/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── patient-service/
│   ├── doctor-service/
│   ├── appointment-service/
│   ├── consultation-records-service/
│   ├── billing-service/
│   ├── catalog-service/
│   └── lab-service/
│
├── frontend/
│
├── db-init/
│   └── mysql/
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

### Important folders

#### `services/`

Contains all backend microservices.

#### `frontend/`

Contains the frontend application.

#### `db-init/mysql/`

Contains SQL dump files used to initialize MySQL databases when Docker volumes are recreated.

#### `docker-compose.yml`

Defines the complete multi-container environment:

* backend microservices
* API Gateway
* MySQL
* MongoDB

---

## Docker Deployment

The project is designed to run through Docker Compose.

### Prerequisites

Before running the project, make sure you have:

* **Docker Desktop**
* **Git**
* optional: **Node.js** if you also want to inspect or run parts locally outside Docker

---

## Running the Project

### Start all services

```bash
docker compose up --build
```

### Stop containers without deleting data volumes

```bash
docker compose down
```

### Stop containers and delete volumes

```bash
docker compose down -v
```

### Important note about `down -v`

Using:

```bash
docker compose down -v
```

deletes Docker volumes.

For this project, MySQL will then be restored from the SQL files in:

```text
db-init/mysql/
```

This means:

* normal runtime data stays preserved if you use `docker compose down`
* if you use `docker compose down -v`, the system returns to the snapshot stored in the SQL dump files

---

## Ports

| Component                    | Port  |
| ---------------------------- | ----- |
| API Gateway                  | 5000  |
| Auth Service                 | 5001  |
| Patient Service              | 5002  |
| Doctor Service               | 5003  |
| Appointment Service          | 5004  |
| Consultation Records Service | 5005  |
| Lab Service                  | 5006  |
| Billing Service              | 5007  |
| Catalog Service              | 5008  |
| MySQL (host)                 | 3307  |
| MongoDB                      | 27017 |

### Notes

* backend containers communicate internally through Docker service names
* MySQL is exposed on host port `3307`
* MongoDB is exposed on host port `27017`

---

## Environment Configuration

Each service uses environment variables.

Typical environment variables include:

* `DATABASE_URL`
* `PORT`
* `JWT_SECRET`
* service URLs such as:

  * `DOCTOR_SERVICE_URL`
  * `CONSULTATION_SERVICE_URL`
  * `BILLING_SERVICE_URL`
  * `CATALOG_SERVICE_URL`
  * `PATIENT_SERVICE_URL`

### Important Docker Note

Inside Docker, services must communicate using **Docker service names**, not `localhost`.

Correct examples:

```env
DOCTOR_SERVICE_URL=http://doctor-service:5003
CATALOG_SERVICE_URL=http://catalog-service:5008
CONSULTATION_SERVICE_URL=http://consultation-records-service:5005
```

Incorrect examples:

```env
DOCTOR_SERVICE_URL=http://localhost:5003
CATALOG_SERVICE_URL=http://127.0.0.1:5008
```

---

## Database Initialization and Persistence

The MySQL databases are initialized from SQL dump files stored in:

```text
db-init/mysql/
```

This allows the project to be restored with a known working database state.

### Data persistence strategy used in the project

* during normal development, data is preserved through Docker volumes
* for long-term reset/recovery, SQL dumps are kept in `db-init/mysql`
* if the current Docker database state changes and must become the new default state, the SQL dump files should be regenerated

This approach allows:

* normal persistent work
* controlled reset
* reproducible project setup for evaluation and submission

---

## Main Workflows Implemented

### Workflow A — Patient books an appointment

1. Patient logs in
2. Patient browses services from the catalog
3. Patient selects a service
4. Patient chooses appointment information
5. Appointment is created
6. Billing is generated
7. Patient can later consult appointment details

### Workflow B — Patient views appointment details

1. Patient logs in
2. Patient opens appointments page
3. Patient selects one appointment
4. The system retrieves:

   * appointment data
   * doctor information
   * consultation information
   * billing information
   * lab-related data if available

### Workflow C — Doctor consultation

1. Doctor logs in
2. Doctor opens appointment details
3. Doctor adds diagnosis and notes
4. Doctor may add prescription data
5. Doctor may request lab tests

### Workflow D — Billing integration

1. Appointment is created
2. Billing Service is called
3. Catalog Service provides service/pricing data
4. Invoice is stored
5. Invoice can be consulted later by appointment

---

## API Access Pattern

The frontend accesses the backend **only through the API Gateway**.

### Example

Frontend request:

```text
http://localhost:5000/api/appointments/24/details
```

The gateway then routes the request to the correct backend service internally.

This keeps the frontend simpler and closer to how real distributed systems are exposed.

---

## Test / Demo Accounts

Replace passwords with the exact demo values you want to provide.

### Admin

* Email: `admin@hospital.com`
* Password: `123456`

### Patient

* Email: `samia.cherif@email.com`
* Password: `123456`

### Doctor

* Email: `nadia.toumi@hopital.com`
* Password: `123456`

* Email: `mehdi.kaci@hopital.com`
* Password: `123456`

If preferred, passwords can be shared separately in the report instead of being publicly written in the repository.

---

## How to Demonstrate the Project

A simple demonstration sequence can be:

1. Start the project with Docker
2. Open the frontend
3. Log in as patient
4. Browse medical services
5. Show appointment booking
6. Open appointment list
7. Open appointment details
8. Log in as doctor
9. Show consultation and lab request flow
10. Show billing and invoice linkage to appointments

This provides a clear demonstration of both business logic and microservices integration.

---

## Troubleshooting

### 1. A service cannot reach another service

Check that backend services use Docker service names, not `localhost`.

Example:

* correct: `http://doctor-service:5003`
* wrong: `http://localhost:5003`

### 2. Data disappears after a reset

If you used:

```bash
docker compose down -v
```

then Docker volumes were deleted and the database was restored from the SQL dump files in `db-init/mysql`.

### 3. A Prisma table is reported as missing

Check:

* the real table name in MySQL
* Prisma model mapping using `@@map(...)`
* whether the correct database is being used

### 4. Frontend loads but backend requests fail

Check:

* API Gateway logs
* service logs
* Docker internal URLs
* container health and startup

---

## Academic Value of the Project

This project demonstrates several important concepts in SOA and Microservices:

* identification of business-aligned microservices
* service decomposition
* inter-service REST communication
* separate persistence per service
* API Gateway usage
* Dockerized multi-service deployment
* role-based system design
* workflow orchestration between multiple services

It therefore goes beyond a simple CRUD application and models a more realistic distributed backend architecture.

---

## Future Improvements

Possible future improvements include:

* asynchronous communication with message brokers
* stronger error handling and observability
* better frontend UX/UI polishing
* monitoring and logging dashboards
* cloud deployment
* notification workflows
* richer lab result handling
* stricter security hardening for production use

---

## Repository Usage Notes

If you clone this repository for evaluation:

1. make sure Docker Desktop is running
2. run:

```bash
docker compose up --build
```

3. access the application through the frontend and API Gateway
4. use the provided test accounts

If a full clean reset is required:

```bash
docker compose down -v
docker compose up --build
```

---

## Author

**Tahiri Alaoui Nada**

---

## Final Note

This repository contains the full implementation of **MyHeartHospital**, a healthcare management system built on a microservices architecture and deployed with Docker.
The project was developed to explore the practical application of microservices design principles in a realistic healthcare scenario.


