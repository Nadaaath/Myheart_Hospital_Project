# MyHeart — Healthcare Management Platform Based on a Microservices Architecture

## Academic Context

**MyHeart** was developed as part of an academic mini-project in **Service-Oriented Architecture (SOA)** and **Microservices**.  
The purpose of the project is to design, implement, and deploy a healthcare management platform using a distributed architecture, where each core business capability is managed by an independent microservice.

The project focuses on the practical application of key distributed-systems principles, including:

- business-oriented service decomposition
- clear separation of concerns
- service-specific persistence
- REST-based inter-service communication
- API Gateway integration
- frontend/backend interaction in a distributed architecture
- containerized deployment with Docker and Docker Compose

Beyond the academic requirement, the project was progressively extended to simulate a more realistic healthcare platform with role-based workflows for **admins, doctors, and patients**.

---

## Project Overview

**MyHeart** is a healthcare management platform built with a **microservices architecture**.  
It models several essential clinical and administrative workflows in a modular, maintainable, and extensible way.

The platform supports:

- secure authentication and role-based access control
- patient and doctor management
- appointment booking and scheduling
- consultation and medical record management
- billing and invoice generation
- catalog-based medical service browsing
- lab request and result handling
- admin-side operational management interfaces
- role-specific dashboards for key actors

The main architectural objective is to replace a tightly coupled monolithic structure with a set of **collaborating services**, each responsible for a well-defined business domain.

---

## Project Objective

Traditional healthcare applications often become difficult to evolve when authentication, appointments, billing, records, and user management are all implemented inside one monolithic codebase.

As requirements grow, such systems typically become:

- harder to maintain
- harder to debug
- harder to scale
- harder to test
- harder to deploy safely

The objective of **MyHeart** is to provide a modular alternative by decomposing the application into **independent microservices**, where each service owns:

- its own business responsibility
- its own API
- its own persistence layer
- its own deployment boundary

This makes the platform:

- easier to understand
- easier to evolve
- easier to test
- easier to containerize
- better aligned with modern distributed backend design

---

## Main Actors

The application currently supports three main actors.

### 1. Admin

The administrator is responsible for system-level management tasks, including:

- creating patient accounts
- creating doctor accounts
- reviewing patient records
- reviewing doctor activity
- managing lab result publication
- supervising platform data through admin dashboards

### 2. Patient

The patient can:

- log in securely
- browse available medical services
- book appointments
- view appointment history
- access appointment details
- consult prescriptions
- access lab results
- open downloadable lab reports when available
- view medical and billing-related information connected to appointments

### 3. Doctor

The doctor can:

- log in securely
- view assigned appointments
- access appointment details
- create or update consultation records
- add diagnosis and notes
- prescribe treatments / medications
- request lab tests
- review lab results associated with patient appointments

---

## Functional Scope

The system implements a realistic healthcare workflow distributed across multiple backend services.

### Patient-side features

- secure login
- service catalog browsing
- appointment booking
- appointment history access
- appointment details page
- prescription access
- lab result access
- downloadable lab report access when provided
- consultation-related information access
- billing-related information access

### Doctor-side features

- secure login
- doctor appointment dashboard
- consultation page access
- diagnosis and clinical notes entry
- prescription management
- lab request creation
- appointment-linked workflow handling

### Admin-side features

- admin authentication and protected routing
- patient account creation and management
- doctor account creation and management
- lab result administration
- admin dashboard with operational summaries
- patient record access from admin view
- doctor activity record access from admin view

### Backend features

- JWT-based authentication
- role-based authorization
- patient management
- doctor management
- appointment lifecycle management
- prevention of double-booking for the same doctor/time slot
- consultation record creation and update
- invoice creation linked to appointment booking
- service pricing retrieval through the catalog service
- lab request and result workflow
- file-based lab report access through the gateway

---

## Architecture

The system follows a **microservices architecture** with an **API Gateway** acting as the main entry point for frontend requests.

### Global Architecture Diagram

```text
Frontend
   |
   v
API Gateway
   |
   +--------------------------------------------------------------------------------------+
   |            |            |            |                    |            |             |
   v            v            v            v                    v            v             v
Auth        Patient       Doctor     Appointment     Consultation       Billing       Catalog
Service     Service       Service     Service         Records Service   Service       Service
                                                                                       |
                                                                                       |
                                                                                       v
                                                                                  Lab Service

Databases:
- MySQL: auth, patient, doctor, appointment, consultation-records, billing, catalog
- MongoDB: lab
````

### Main Architectural Choices

The platform applies the following microservices principles:

* **separation of concerns**: each service handles one business capability
* **database per service**: each service owns its own persistence layer
* **REST communication**: services communicate synchronously through HTTP APIs
* **API Gateway pattern**: frontend/backend communication is centralized
* **containerized deployment**: services and databases run through Docker Compose
* **role-based workflow design**: UI and backend behavior differ depending on the actor

---

## Microservices Description

### 1. API Gateway

The API Gateway is the unique entry point for frontend requests.

Responsibilities:

* receive frontend requests
* route requests to the correct backend service
* simplify frontend/backend integration
* centralize access to backend APIs
* expose uploaded lab report files through proxied routes

### 2. Auth Service

Responsible for authentication and role management.

Responsibilities:

* login
* JWT generation
* user role handling
* authentication validation
* internal account creation for other services

Supported roles:

* `ADMIN`
* `DOCTOR`
* `PATIENT`

### 3. Patient Service

Responsible for patient data management.

Responsibilities:

* patient profile creation
* patient information retrieval
* patient profile updates
* patient-related administrative data management

### 4. Doctor Service

Responsible for doctor data management.

Responsibilities:

* doctor profile creation
* doctor retrieval
* department-based doctor filtering
* doctor directory management

### 5. Appointment Service

Responsible for appointment lifecycle management.

Responsibilities:

* appointment booking
* appointment retrieval
* appointment cancellation
* appointment status updates
* appointment rescheduling
* detailed appointment aggregation
* doctor schedule conflict prevention

### 6. Consultation Records Service

Responsible for consultation and medical information.

Responsibilities:

* diagnosis storage
* clinical notes storage
* prescription storage
* appointment-linked medical record management
* patient medical history retrieval

### 7. Billing Service

Responsible for invoice creation and billing logic.

Responsibilities:

* invoice generation
* invoice retrieval by appointment
* billing amount persistence
* invoice state tracking

### 8. Catalog Service

Responsible for bookable medical services and pricing information.

Responsibilities:

* exposing medical services
* storing service descriptions
* storing prices
* serving as pricing reference for billing
* exposing lab test catalog information

### 9. Lab Service

Responsible for lab-related workflows.

Responsibilities:

* lab test request creation
* lab result publication
* lab result storage
* PDF lab report association
* appointment- and patient-linked lab retrieval

---

## Current Implemented Business Flows

The system already supports several complete end-to-end flows.

### Workflow A — Patient books an appointment

1. Patient logs in
2. Patient browses the medical services catalog
3. Patient selects a service
4. Patient chooses the appointment information
5. Appointment Service creates the appointment
6. Catalog Service provides pricing information
7. Billing Service generates an invoice
8. Patient can later consult appointment details and linked information

### Workflow B — Doctor consultation

1. Doctor logs in
2. Doctor opens assigned appointments
3. Doctor accesses appointment details
4. Doctor writes diagnosis and notes
5. Doctor adds prescription information
6. Consultation Records Service stores or updates the consultation record

### Workflow C — Lab request and result flow

1. Doctor opens an appointment
2. Doctor requests a lab test
3. Admin accesses the lab administration area
4. Admin publishes the lab result
5. Admin can attach a PDF lab report
6. Doctor can later open the result and the PDF
7. Patient can also access the result and downloadable report

### Workflow D — Appointment details aggregation

1. User opens an appointment details page
2. Frontend sends request through the API Gateway
3. The relevant backend service aggregates appointment-related data
4. Related information is fetched as needed from doctor, consultation, billing, and lab services
5. The frontend displays a more complete appointment context

### Workflow E — Admin patient record consultation

1. Admin opens the patients management page
2. Admin selects a patient
3. Admin accesses a dedicated patient record page
4. The page displays:

   * patient identity and administrative data
   * medical history
   * appointments
   * lab information
   * related healthcare context

### Workflow F — Admin doctor activity consultation

1. Admin opens the doctors management page
2. Admin selects a doctor
3. Admin accesses a dedicated doctor activity page
4. The page displays:

   * doctor profile
   * department and contact data
   * appointments handled
   * assigned patients
   * written consultation records
   * requested lab tests

---

## Role-Based Frontend Structure

The frontend is progressively organized by role and responsibility, to make it easier to maintain and extend.

Current structure includes folders such as:

```text
src/
├── api/
├── components/
│   ├── common/
│   ├── layouts/
│   ├── sidebars/
│   └── ...
├── pages/
│   ├── admin/
│   ├── doctor/
│   ├── patient/
│   ├── auth/
│   └── ...
├── utils/
└── App.jsx
```

This reflects the role-specific nature of the platform and improves maintainability compared to a flat page structure.

---

## Technology Stack

### Backend

* **Node.js**
* **Express.js**
* **Prisma ORM**
* **Axios**

### Frontend

* **React**
* **React Router**
* custom admin / doctor / patient interfaces

### Databases

* **MySQL**
* **MongoDB**

### DevOps / Deployment

* **Docker**
* **Docker Compose**

---

## Databases

The system follows the **database-per-service** principle.

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

MySQL is used for structured domains requiring clear relational consistency:

* authentication
* doctors
* patients
* appointments
* consultation records
* billing
* service catalog

### Why MongoDB?

MongoDB is used for the lab service because lab-related data can benefit from document-oriented storage and more flexible schema handling.

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

Contains the React frontend application.

#### `db-init/mysql/`

Contains SQL files used to initialize MySQL databases when Docker volumes are recreated.

#### `docker-compose.yml`

Defines the complete multi-container environment:

* backend microservices
* API Gateway
* MySQL
* MongoDB
* frontend

---

## Docker Deployment

The project is designed to run through Docker Compose.

### Prerequisites

Before running the project, make sure you have:

* **Docker Desktop**
* **Git**
* optional: **Node.js** if you want to inspect or run parts locally outside Docker

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
| Frontend                     | 4173  |
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

* backend containers communicate internally using Docker service names
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
  * `PATIENT_SERVICE_URL`
  * `CONSULTATION_SERVICE_URL`
  * `BILLING_SERVICE_URL`
  * `CATALOG_SERVICE_URL`

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

## API Access Pattern

The frontend accesses backend services **through the API Gateway**.

### Example

Frontend request:

```text
http://localhost:5000/api/appointments/24/details
```

The gateway then forwards the request internally to the correct service.

This keeps the frontend simpler and closer to how real distributed systems are exposed.

---

## Lab Report File Access

The lab workflow supports file-backed reports.

Uploaded PDF reports are stored and then exposed through the gateway using proxied routes such as:

```text
http://localhost:5000/api/labs/uploads/<filename>.pdf
```

This allows both doctor and patient interfaces to access downloadable lab reports through the same platform entry point.

---

## Data Persistence and Initialization

The MySQL databases are initialized from SQL dump files stored in:

```text
db-init/mysql/
```

This allows the project to be restored with a known working database state.

### Persistence strategy

* during normal development, data is preserved through Docker volumes
* for clean reset or recovery, SQL dumps are stored in `db-init/mysql`
* if the Docker database state changes and must become the new default state, SQL dump files should be regenerated

This approach supports:

* normal development persistence
* controlled reset
* reproducible environment setup for demonstration or evaluation

---

## Main Frontend Views Implemented

### Admin views

* admin dashboard
* patients management
* patient record details
* doctors management
* doctor activity details
* lab management

### Doctor views

* doctor dashboard
* appointments list
* appointment details
* patient-related consultation workflow
* doctor lab access

### Patient views

* patient dashboard
* service browsing
* appointment booking
* appointment history
* appointment details
* prescriptions view
* lab results view

---

## Demo / Test Accounts

Replace passwords with the exact values you want to provide in the repository.

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

If preferred, demo passwords can be shared separately in the report instead of remaining inside the repository.

---

## How to Demonstrate the Project

A good demonstration scenario can be:

1. Start the system with Docker Compose
2. Open the frontend
3. Log in as patient
4. Browse the service catalog
5. Book an appointment
6. Open the patient appointments list
7. Open appointment details
8. Log in as doctor
9. Open assigned appointments
10. Write consultation information
11. Request a lab test
12. Log in as admin
13. Open lab management
14. Publish a result and attach a PDF report
15. Return to patient or doctor views to show result access

This demonstrates both business logic and inter-service integration.

---

## Troubleshooting

### 1. One service cannot reach another

Check that backend services use Docker service names, not `localhost`.

Correct:

* `http://doctor-service:5003`

Incorrect:

* `http://localhost:5003`

### 2. Frontend loads but backend requests fail

Check:

* API Gateway logs
* target service logs
* Docker internal URLs
* role authorization middleware
* container startup order and health

### 3. Uploaded lab PDF cannot be opened

Check:

* lab-service static file serving
* API Gateway proxy configuration for `/api/labs/uploads/...`
* stored `file_url` values in lab documents

### 4. A route returns 404 through the gateway

Check:

* whether the backend route actually exists
* whether the gateway proxy path matches the service route prefix
* whether the request is being tested on the correct port/path

### 5. Prisma reports missing tables or schema issues

Check:

* the real table names in MySQL
* Prisma model mappings
* the correct database connection
* migration / initialization consistency

### 6. Data disappears after reset

If you used:

```bash
docker compose down -v
```

then Docker volumes were removed and the database was reinitialized from the SQL files in `db-init/mysql`.

---

## Academic and Technical Value

This project demonstrates several important concepts in SOA and microservices:

* business-aligned service decomposition
* API Gateway usage
* distributed REST communication
* database-per-service design
* role-based backend architecture
* appointment/billing/catalog orchestration
* practical Dockerized deployment
* frontend integration with a distributed backend
* realistic actor-based healthcare workflows

It therefore goes beyond a simple CRUD application and models a more realistic distributed healthcare backend.

---

## Current Strengths of the Project

At its current stage, the project already demonstrates:

* multi-service backend decomposition
* real role-based user flows
* admin / doctor / patient separation
* appointment booking logic
* consultation workflow
* billing integration
* lab result publication with downloadable reports
* Dockerized local deployment
* API Gateway based architecture
* progressively improved frontend organization

---

## Possible Future Improvements

Possible future improvements include:

* global admin appointment dashboard
* admin billing dashboard
* richer catalog management
* monitoring and observability dashboards
* automated tests
* Swagger / OpenAPI documentation
* CI/CD automation
* stronger validation and security hardening
* cloud deployment
* asynchronous messaging for selected workflows
* richer notification features

---

## Repository Usage Notes

If you clone this repository for evaluation:

1. make sure Docker Desktop is running
2. run:

```bash
docker compose up --build
```

3. access the application through the frontend and API Gateway
4. use the provided demo accounts

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

This repository contains the implementation of **MyHeart**, a healthcare management platform built with a microservices architecture and deployed with Docker Compose.

The project was developed to explore the practical application of service-oriented and microservices design principles in a realistic healthcare scenario, while progressively evolving from an academic prototype toward a richer and more structured distributed system.

```
