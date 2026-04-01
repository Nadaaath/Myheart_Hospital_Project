# Myheart_Hospital_Project
Projet SOA Microservices
# MyHeart — Healthcare Management System Based on a Microservices Architecture

## Overview

**MyHeart** is a healthcare management system developed using a **microservices architecture**.  
The project was designed to model core hospital and clinic workflows in a modular, scalable, and maintainable way.

The system supports several essential healthcare operations, including:

- secure authentication and role-based access
- patient and doctor management
- appointment booking and scheduling
- consultation and medical record management
- billing and invoice generation
- catalog-based medical service browsing
- lab test requests and results handling

This project was developed in the context of an academic mini-project on **Service-Oriented Architecture (SOA)** and **Microservices**, with emphasis on:

- identifying business capabilities and decomposing them into services
- designing inter-service communication
- separating databases by responsibility
- integrating an API Gateway
- deploying the application with Docker

---

## Project Context and Objective

Healthcare systems often become difficult to maintain when all business logic is grouped into one monolithic application.  
As the number of users, features, and workflows grows, such systems become harder to evolve, scale, debug, and deploy.

The objective of **MyHeart** is to provide a more modular alternative by decomposing the application into **independent microservices**, where each service owns:

- a clear business responsibility
- its own API
- its own data storage

This allows the system to be:

- easier to understand
- easier to maintain
- easier to extend
- better aligned with modern distributed system design

---

## Main Actors

The application currently supports the following actors:

### 1. Admin
The administrator is responsible for:
- creating patient accounts
- creating doctor accounts
- managing access to the system

### 2. Patient
The patient can:
- log in securely
- browse available healthcare services
- book appointments
- view appointment history
- access appointment details
- see consultation information
- see billing/invoice information
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
- write diagnosis / notes
- add prescription-related information
- request lab tests

### Backend features
- role-based authentication
- appointment management
- prevention of doctor double-booking
- invoice generation linked to appointment flow
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
