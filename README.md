# MyHeart — Healthcare Management Platform Based on a Microservices Architecture

## At a Glance

**MyHeart** is a healthcare management platform built with a **microservices architecture** to model realistic hospital workflows for **admins, doctors, and patients**.

### Key capabilities

* secure authentication and role-based access control
* patient and doctor management
* appointment booking and scheduling
* consultation and prescription management
* billing and invoice generation
* lab request and result handling
* admin operational dashboards

### Engineering highlights

* API Gateway architecture
* database-per-service design
* Docker Compose deployment
* Prometheus + Grafana observability
* GitHub Actions CI

---

## Academic Context

**MyHeart** was developed as part of an academic mini-project in **Service-Oriented Architecture (SOA)** and **Microservices**.
The objective was to design, implement, and deploy a healthcare platform using a distributed architecture where each major business capability is managed by an independent service.

The project applies several important distributed-systems principles, including:

* business-oriented service decomposition
* clear separation of concerns
* service-specific persistence
* REST-based inter-service communication
* API Gateway integration
* frontend/backend interaction in a distributed architecture
* containerized deployment with Docker and Docker Compose
* Prometheus metrics exposed by key services
* Grafana dashboard visualization
* GitHub Actions CI for automated validation

Beyond the academic requirement, the project was progressively extended to simulate a more realistic healthcare platform with role-based workflows for **admins, doctors, and patients**.

---

## Project Overview

**MyHeart** is a modular healthcare management platform built with a **microservices architecture**.
It models several important clinical and administrative workflows in a maintainable and extensible way.

The platform supports:

* secure authentication and role-based access control
* patient and doctor management
* appointment booking and scheduling
* consultation and medical record management
* billing and invoice generation
* catalog-based medical service browsing
* lab request and result handling
* admin-side operational management interfaces
* role-specific dashboards for key actors

The main architectural goal is to replace a tightly coupled monolithic structure with a set of **collaborating microservices**, each responsible for a well-defined business domain.

---

## Main Actors

### Admin

The administrator is responsible for system-level management tasks, including:

* creating patient accounts
* creating doctor accounts
* reviewing patient records
* reviewing doctor activity
* managing lab result publication
* supervising platform data through admin dashboards

### Patient

The patient can:

* log in securely
* browse available medical services
* book appointments
* view appointment history
* access appointment details
* consult prescriptions
* access lab results
* open downloadable lab reports when available
* view medical and billing-related information connected to appointments

### Doctor

The doctor can:

* log in securely
* view assigned appointments
* access appointment details
* create or update consultation records
* add diagnosis and notes
* prescribe treatments / medications
* request lab tests
* review lab results associated with patient appointments

---

## Functional Scope

### Patient-side features

* secure login
* service catalog browsing
* appointment booking
* appointment history access
* appointment details page
* prescription access
* lab result access
* downloadable lab report access when provided
* consultation-related information access
* billing-related information access

### Doctor-side features

* secure login
* doctor appointment dashboard
* consultation page access
* diagnosis and clinical notes entry
* prescription management
* lab request creation
* appointment-linked workflow handling

### Admin-side features

* admin authentication and protected routing
* patient account creation and management
* doctor account creation and management
* lab result administration
* admin dashboard with operational summaries
* patient record access from admin view
* doctor activity record access from admin view

### Backend features

* JWT-based authentication
* role-based authorization
* patient management
* doctor management
* appointment lifecycle management
* prevention of double-booking for the same doctor/time slot
* consultation record creation and update
* invoice creation linked to appointment booking
* service pricing retrieval through the catalog service
* lab request and result workflow
* file-based lab report access through the gateway

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
```

### Main Architectural Choices

* **separation of concerns**: each service handles one business capability
* **database per service**: each service owns its own persistence layer
* **REST communication**: services communicate synchronously through HTTP APIs
* **API Gateway pattern**: frontend/backend communication is centralized
* **containerized deployment**: services and databases run through Docker Compose
* **role-based workflow design**: UI and backend behavior differ depending on the actor

---

## Microservices Description

### 1. API Gateway

Responsibilities:

* receive frontend requests
* route requests to the correct backend service
* simplify frontend/backend integration
* centralize access to backend APIs
* expose uploaded lab report files through proxied routes

### 2. Auth Service

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

Responsibilities:

* patient profile creation
* patient information retrieval
* patient profile updates
* patient-related administrative data management

### 4. Doctor Service

Responsibilities:

* doctor profile creation
* doctor retrieval
* department-based doctor filtering
* doctor directory management

### 5. Appointment Service

Responsibilities:

* appointment booking
* appointment retrieval
* appointment cancellation
* appointment status updates
* appointment rescheduling
* detailed appointment aggregation
* doctor schedule conflict prevention

### 6. Consultation Records Service

Responsibilities:

* diagnosis storage
* clinical notes storage
* prescription storage
* appointment-linked medical record management
* patient medical history retrieval

### 7. Billing Service

Responsibilities:

* invoice generation
* invoice retrieval by appointment
* billing amount persistence
* invoice state tracking

### 8. Catalog Service

Responsibilities:

* exposing medical services
* storing service descriptions
* storing prices
* serving as pricing reference for billing
* exposing lab test catalog information

### 9. Lab Service

Responsibilities:

* lab test request creation
* lab result publication
* lab result storage
* PDF lab report association
* appointment- and patient-linked lab retrieval

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
* **Prometheus**
* **Grafana**
* **GitHub Actions**

---

## Observability

To improve the engineering maturity of the project, an observability layer was added using **Prometheus**, **Grafana**, and **prom-client**.

### Monitored services

The following services currently expose Prometheus metrics:

* `api-gateway`
* `auth-service`
* `appointment-service`
* `billing-service`

### Implemented metrics

Each monitored service exposes:

* total HTTP requests
* HTTP request duration
* default Node.js process metrics

### Main metrics endpoint

Each instrumented service exposes a `/metrics` endpoint used by Prometheus for scraping.

### Access

* Prometheus: `http://localhost:9090`
* Grafana: `http://localhost:3001`

### Example dashboard panels

* **Requests by Service**
* **Requests by Service and Route**
* **Average Latency by Service**
* **Billing Service Requests**

This makes it possible to monitor both edge traffic through the API Gateway and traffic inside important business services.

---

## Continuous Integration

A GitHub Actions pipeline is configured to improve reliability and automate checks on every push and pull request.

### CI pipeline includes

* frontend build
* auth-service light tests
* Docker Compose validation
* Docker image build
* smoke tests on the running stack

### Current CI goals

The CI pipeline verifies that:

* the frontend builds successfully
* the auth-service basic tests pass
* the Docker Compose configuration is valid
* service images can be built
* the main gateway routes are reachable after startup

This setup provides a first level of automated quality assurance for the platform.
Add this section to your README, ideally **after “Observability / Continuous Integration” and before “How to Demonstrate the Project”**.

````md
## Kubernetes Deployment

In addition to the Docker Compose setup, the project also includes a Kubernetes deployment configuration for the main microservices.

### Kubernetes resources used
The Kubernetes setup includes:

- **Deployments** for service execution
- **Services** for internal/external exposure
- **ConfigMaps** for non-sensitive configuration
- **Secrets** for sensitive values such as JWT secrets
- **Readiness probes** to verify when a service is ready to receive traffic
- **Liveness probes** to detect unhealthy containers and restart them automatically

### Covered services
The Kubernetes manifests currently cover the main backend services, including:

- `api-gateway`
- `auth-service`
- `patient-service`
- `doctor-service`
- `appointment-service`
- `consultation-records-service`
- `billing-service`
- `catalog-service`
- `lab-service`

### Deployment structure
The manifests are stored in the `k8s/` folder and are organized by service.

Typical manifest types include:
- `*-deployment.yaml`
- `*-service.yaml`
- `*-configmap.yaml`
- `*-secret.yaml`

### Example commands

Apply all manifests:

```bash
kubectl apply -f k8s/
````

Check running pods:

```bash
kubectl get pods
```

Check services:

```bash
kubectl get svc
```

Check deployments:

```bash
kubectl get deployments
```

### Example verification

The Kubernetes deployment was validated by checking:

* pod status (`Running`, `Ready`)
* service exposure
* successful gateway-based access to the application
* readiness/liveness probe integration on services

### Notes

* the current working deployment is running in the **default** namespace
* service communication relies on Kubernetes service discovery
* this Kubernetes setup complements the Docker Compose deployment 

```md
## Engineering Improvements

Compared to a basic academic CRUD microservices project, MyHeart was extended with:

- Dockerized multi-service deployment
- Kubernetes manifests for core microservices
- API Gateway-based routing
- Prometheus metrics for key services
- Grafana dashboards for traffic and latency visualization
- GitHub Actions CI
- smoke testing through the running stack

These additions make the platform closer to a production-oriented microservices system.

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
├── myheart-frontend/
│
├── db-init/
│   └── mysql/
│
├── monitoring/
│   └── prometheus/
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

### Important folders

#### `services/`

Contains all backend microservices.

#### `myheart-frontend/`

Contains the React frontend application.

#### `db-init/mysql/`

Contains SQL files used to initialize MySQL databases when Docker volumes are recreated.

#### `monitoring/prometheus/`

Contains Prometheus scraping configuration.

#### `docker-compose.yml`

Defines the complete multi-container environment:

* backend microservices
* API Gateway
* MySQL
* MongoDB
* frontend
* Prometheus
* Grafana

---

## Running the Project

### Prerequisites

Before running the project, make sure you have:

* **Docker Desktop**
* **Git**
* optional: **Node.js** if you want to inspect or run parts locally outside Docker

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

Using `docker compose down -v` deletes Docker volumes.
For this project, MySQL will then be restored from the SQL files in `db-init/mysql/`.

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
| Prometheus                   | 9090  |
| Grafana                      | 3001  |

### Notes

* backend containers communicate internally using Docker service names
* MySQL is exposed on host port `3307`
* MongoDB is exposed on host port `27017`

---

## Current Implemented Business Flows

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

---

## Role-Based Frontend Structure

The frontend is progressively organized by role and responsibility, to make it easier to maintain and extend.

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

## Demo / Test Accounts

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

## Screenshots
### Docker Containers Running
<img width="1634" height="1052" alt="Screenshot 2026-04-23 164418" src="https://github.com/user-attachments/assets/909eb561-969e-435d-981b-cb805aa54672" />


### Prometheus Targets
<img width="1902" height="749" alt="image" src="https://github.com/user-attachments/assets/e5d8f61e-8349-46c8-b4e2-13f48cf7a848" />


### Grafana Dashboard

<img width="1905" height="883" alt="Screenshot 2026-04-24 142556" src="https://github.com/user-attachments/assets/a32dff71-3126-4ca8-81a2-05c40b0b6b95" />


### GitHub Actions CI

<img width="1900" height="983" alt="Screenshot 2026-04-23 164317" src="https://github.com/user-attachments/assets/25bcfc4b-f143-4e3f-8b54-de3218a93e78" />

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

## Engineering Maturity

Compared to a basic academic CRUD microservices project, MyHeart was extended with:

* Dockerized multi-service deployment
* API Gateway-based routing
* Prometheus metrics for key services
* Grafana dashboards for traffic and latency visualization
* GitHub Actions CI
* smoke testing through the running stack

These additions make the platform closer to a production-oriented microservices system.

---

## Future Improvements

* extend observability to additional services
* expand backend API test coverage
* enrich Grafana dashboards with more business metrics
* strengthen CI with broader automated validation
* add Swagger / OpenAPI documentation
* deploy to a cloud environment
* introduce asynchronous messaging for selected workflows
* improve admin reporting and analytics

---

## Author

**Tahiri Alaoui Nada**
