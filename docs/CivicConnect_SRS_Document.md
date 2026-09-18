# SYSTEM REQUIREMENTS SPECIFICATION (SRS v2.0)
**Full Stack Java (AI-Integrated) Training Programme | SIH 2025**

---

### 📋 **PROJECT IDENTIFICATION & METADATA**

| Parameter | Details |
| :--- | :--- |
| **Project Title** | **Crowdsourced Civic Issue Reporting, Smart Routing, and Resolution Tracking Platform** |
| **System Name** | **CivicConnect AI** |
| **SIH Problem Statement ID** | **FSJ28-INTERN-004** |
| **Ministry / Organisation** | **Urban Local Bodies / Municipal Corporation / Smart Cities Mission** |
| **Domain Category** | **Smart Cities / Civic Technology / Public Grievance Redressal** |
| **Team Name** | **NexaCity** |
| **Team Members** | **1. Perianayagi Divya S** (CSE II)<br>**2. Pradeepa T** (CSE II)<br>**3. Sreemathi V** (CSE II) |
| **Institution** | **Karpagam College of Engineering** |
| **Project Type** | **[✓] Software only** |
| **Document Version** | **v2.0** *(Post Internal & Mentor Review)* |
| **Document Date** | **September 2026** |
| **Faculty Mentors** | Dr. Arul Antran Vijay S / Dr. Jothi Prakash V / Mr. Jegathesh P / Mr. Navaneetha Krishnan M / Dr. Castro S. |

---

### 📝 **DOCUMENT REVISION HISTORY**

| Version | Date | Author | Description of Changes |
| :--- | :--- | :--- | :--- |
| **v1.0** | 14-Aug-2026 | NexaCity Team | Initial draft — SRS skeleton & architectural structure completed |
| **v1.1** | 21-Aug-2026 | NexaCity Team | Integrated SendGrid / Brevo / Twilio & backend microservice specs |
| **v2.0** | 02-Sep-2026 | NexaCity Team | **Post Internal Review**: Updated with Google OAuth2 Gmail API, simplified single-step Email OTP verification, updated Team NexaCity metadata, and finalized database schema. |

---

## 1. INTRODUCTION

### 1.1 Purpose
This System Requirements Specification (SRS) document describes the functional and non-functional requirements for **CivicConnect AI** (*Crowdsourced Civic Issue Reporting, Smart Routing, and Resolution Tracking Platform*), developed as part of the Smart India Hackathon 2025 submission under Problem Statement **[FSJ28-INTERN-004]**. It is prepared in accordance with **IEEE Std 830-1998** and serves as the primary agreement between Team **NexaCity** (Karpagam College of Engineering) and project evaluators.

### 1.2 Scope
- **System Name**: CivicConnect AI
- **System Purpose**: CivicConnect AI is a web-based, AI-integrated civic grievance reporting and resolution platform for citizens, municipal field officers, department administrators, and system administrators.
- **Key Functionality**:
  - Citizens can report public issues (potholes, garbage overflow, streetlight faults, drainage blockages, water leakages) by uploading geo-tagged photo/video proof, selecting locations, and describing the issue.
  - The system incorporates an **AI/ML Engine** (Python FastAPI) for automatic category classification, severity scoring, duplicate detection, and intelligent department routing.
  - Features real-time status tracking (*Submitted*, *Verified*, *Assigned*, *In Progress*, *Resolved*, *Citizen Verified*, *Closed*), automated SLA escalation, Google OAuth2 Email OTP verification, and administrative analytics dashboards.

### 1.3 Definitions, Acronyms & Abbreviations
- **SRS**: System Requirements Specification
- **SIH**: Smart India Hackathon 2025
- **JWT**: JSON Web Token (used for stateless RBAC authentication)
- **OTP**: One-Time Password (for email verification via Google OAuth2 Gmail API)
- **SLA**: Service Level Agreement (max time limit for complaint resolution)
- **FastAPI**: Python web framework for serving AI/ML model inference endpoints
- **RBAC**: Role-Based Access Control (Citizen, Field Officer, Dept Admin, Super Admin)

### 1.4 References
- IEEE Std 830-1998: IEEE Recommended Practice for Software Requirements Specifications
- SIH 2025 Problem Statement **[FSJ28-INTERN-004]**
- Spring Boot 3.2.4 Documentation: `https://docs.spring.io/spring-boot/`
- React 18 & Vite Documentation: `https://react.dev/`

---

## 2. OVERALL DESCRIPTION

### 2.1 Product Perspective
CivicConnect AI is a standalone civic technology platform designed to modernize manual municipal grievance redressal. It eliminates duplicate complaints, manual misrouting, and opaque resolution processes by introducing AI classification, automated department routing, GPS geo-tagging, and SLA escalation rules.

### 2.2 Feature Summary

| # | Feature Name | Description |
| :-: | :--- | :--- |
| **1** | **Citizen Registration & Login** | Email OTP verification using Google OAuth2 Gmail API, JWT token generation, and secure BCrypt password hashing. |
| **2** | **Geo-Tagged Issue Submission** | Submit complaints with title, description, category, photo/video proof, address, landmark, pincode, and exact GPS coordinates. |
| **3** | **AI Complaint Classification** | NLP/Vision model analyzes complaint description and images to predict category (Roads, Waste, Electrical, Water, Sanitation). |
| **4** | **Image-Based Issue Verification** | Computer Vision / ML model checks photo authenticity and estimates severity level. |
| **5** | **Smart Department Routing** | Automatic mapping of complaints to specific departments (e.g., Public Works, Health & Sanitation, TNEB/Electricity) based on location and category. |
| **6** | **Priority & Severity Scoring** | Assigns *Low*, *Medium*, *High*, or *Critical* priority based on issue risk, public impact, and duplicate frequency. |
| **7** | **Field Officer Assignment** | Department Admins assign complaints to field officers with target completion dates, instructions, and workload balancing. |
| **8** | **Real-Time Status Tracking** | Citizens and officers track stages: *Submitted*, *Verified*, *Assigned*, *In Progress*, *Resolved*, *Citizen Verified*, *Closed*. |
| **9** | **SLA Monitoring & Escalation** | Overdue complaints trigger automatic escalation to higher municipal authorities. |
| **10** | **Notification System** | Automated transactional email notifications for registration OTP, complaint status changes, and resolution updates. |
| **11** | **Feedback & Citizen Verification** | Citizens inspect resolution proof photos and submit 1–5 star ratings and comments before final closure. |
| **12** | **Analytics Dashboard** | Municipal admins view complaint trends, ward-level heatmaps, resolution time metrics, and officer performance. |

### 2.3 User Classes & Roles

| User Role | Description | Access Level | Primary Actions |
| :--- | :--- | :--- | :--- |
| **Citizen** | General public user | Read + Submit + Feedback | Register/login via Email OTP, report issues, upload photos/GPS, track status, rate resolution. |
| **Field Officer / Operator** | Municipal ground staff | Read + Write assigned data | View assigned tasks, update progress status, upload resolution proof photos, mark completed. |
| **Department Admin** | Departmental authority | Department Admin | Review incoming complaints, assign field officers, monitor SLA timers, approve/reject resolution proofs. |
| **System Admin** | Platform administrator | Full Admin | Manage users, roles, departments, system configuration, SLA rules, view system audit logs. |
| **AI/ML Service** | Internal system actor | Internal Service Access | Receive text/image data, return predicted category, confidence score, duplicate probability, and priority score. |

### 2.4 Operating Environment
- **Backend Runtime**: Java 21 / Spring Boot 3.2.4
- **Frontend Runtime**: React 18+ / Vite / Tailwind CSS
- **Databases**: Oracle Database XE / MySQL 8.0 (Relational Data)
- **AI Engine**: Python 3.11 / FastAPI / scikit-learn / HuggingFace Transformers
- **Browser Compatibility**: Chrome 100+, Firefox 100+, Safari 15+, Edge 100+

---

## 3. SYSTEM ARCHITECTURE

### 3.1 Architecture Layers

```
[ PRESENTATION LAYER ] React 18 SPA (Vite + Tailwind CSS + Lucide Icons)
         │
         ▼ (HTTPS / REST APIs with JWT Bearer Token)
[ GATEWAY & AUTH LAYER ] Spring Security + JWT Filter + CORS Policy (Port 8080)
         │
         ▼
[ SERVICE LAYER ] Spring Boot Microservices
   ├── AuthService (Registration, Email OTP via Google OAuth2 Gmail API, JWT)
   ├── ComplaintService (Geo-tagged submission, tracking, resolution proof)
   ├── DepartmentService & UserService (Role management, officer dispatch)
   └── NotificationService (Transactional emails)
         │
         ├──► [ AI/ML SERVICE ] Python FastAPI (Port 8000) — NLP & Vision Models
         │
         ▼
[ DATA LAYER ] Oracle Database / MySQL (Users, Complaints, Departments, Proofs)
```

### 3.2 Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Axios | Responsive Single Page Application (SPA) |
| **Backend Framework** | Spring Boot 3.2.4, Spring Security, Spring Data JPA | REST APIs, business logic, security |
| **Database** | Oracle Database 21c XE / MySQL 8.0 | Relational data persistence |
| **AI / ML Framework** | Python 3.11, FastAPI, scikit-learn, HuggingFace | NLP category prediction & severity scoring |
| **Email Service** | Google OAuth2 Gmail API (`google-oauth-client.json`) | Secure transactional email & OTP dispatch |
| **Build & DevOps** | Apache Maven (`mvnw`), Node.js / npm, Docker, Git | Dependency management, build automation |

---

## 4. DATABASE DESIGN & ENTITY RELATIONSHIPS

### 4.1 Primary Entities & Relationships
- **User (1) ───< Complaint (M)**: One citizen can raise multiple complaints.
- **Department (1) ───< Worker (M)**: One department contains multiple field officers/workers.
- **Department (1) ───< Complaint (M)**: Complaints are routed to specific departments.
- **Complaint (1) ───< ResolutionProof (1)**: Each resolved complaint has an associated resolution proof photo and timestamp.

### 4.2 Core Database Schema (`users`, `complaints`, `departments`)

#### Entity: `users`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique user ID |
| `full_name` | VARCHAR(100) | NOT NULL | User's full name |
| `email` | VARCHAR(150) | UNIQUE, NOT NULL | Verified login email address |
| `mobile` | VARCHAR(15) | NOT NULL | 10-digit mobile number |
| `password` | VARCHAR(255) | NOT NULL | BCrypt hashed password |
| `role` | VARCHAR(20) | NOT NULL | Role (`CITIZEN`, `FIELD_OFFICER`, `DEPT_ADMIN`, `ADMIN`) |
| `email_verified` | BOOLEAN | DEFAULT TRUE | Email OTP verification status |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Registration timestamp |

#### Entity: `complaints`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Complaint reference ID |
| `title` | VARCHAR(200) | NOT NULL | Issue short summary |
| `description` | TEXT | NOT NULL | Detailed issue description |
| `category` | VARCHAR(50) | NOT NULL | Roads, Garbage, Water, Electricity, Drainage |
| `priority` | VARCHAR(20) | DEFAULT 'MEDIUM' | Low, Medium, High, Critical |
| `status` | VARCHAR(30) | DEFAULT 'SUBMITTED' | Submitted, Assigned, In Progress, Resolved, Closed |
| `pincode` | VARCHAR(10) | NOT NULL | Location pincode |
| `district` | VARCHAR(100) | NOT NULL | District / City |
| `latitude` | DOUBLE | NULLABLE | GPS Latitude |
| `longitude` | DOUBLE | NULLABLE | GPS Longitude |
| `image_url` | VARCHAR(500) | NULLABLE | Uploaded complaint proof photo |
| `citizen_id` | BIGINT | FOREIGN KEY | References `users(id)` |
| `assigned_worker_id` | BIGINT | FOREIGN KEY | References `users(id)` |

---

## 5. AI / ML MODULE SPECIFICATIONS

### 5.1 AI Module 1 — Category Classification & Priority Scoring (Primary AI Feature)
- **Module Name**: Civic Issue Classifier & Urgency Predictor
- **Problem AI Solves**: Replaces manual inspection of complaint text to automatically categorize issues (Roads, Waste, Water, Electrical) and assign urgency priority scores (*Low*, *Medium*, *High*, *Critical*).
- **Input Data**: Text string (`description` + `title`) and optional image metadata.
- **Output / Prediction**: JSON response containing predicted category, confidence score (0.0 to 1.0), and calculated priority score.
- **Model Architecture**: Python FastAPI endpoint wrapping a TF-IDF + Logistic Regression / DistilBERT classifier.
- **Integration Point**: `POST http://localhost:8000/predict/module1` called by Spring Boot backend upon complaint submission.

---

## 6. NON-FUNCTIONAL REQUIREMENTS (NFRs)

| NFR ID | Category | NFR Name | Target Metric / Requirement |
| :--- | :--- | :--- | :--- |
| **NFR-PERF-001** | Performance | API Response Time | Standard REST endpoints return responses in < 1.5 seconds. |
| **NFR-SEC-001** | Security | Password Hashing | All passwords hashed using BCrypt (cost factor 10+). |
| **NFR-SEC-002** | Security | Token Security | JWT tokens issued with 24-hour expiration and signed via secret key. |
| **NFR-SEC-003** | Security | Email Authorization | Transactional emails dispatched via Google OAuth2 Gmail API using `google-oauth-client.json` refresh tokens. |
| **NFR-USE-001** | Usability | Mobile Responsiveness | Clean responsive UI optimized for desktop and mobile viewports (>= 375px width). |
| **NFR-REL-001** | Reliability | Error Handling | Standardized API JSON error responses without exposing raw stack traces. |

---

## 7. TEAM COMPOSITION & OWNERSHIP MATRIX (Team NexaCity)

### 7.1 Team Composition (Karpagam College of Engineering)

| Member Name | Branch | Year | Primary Role & Area of Ownership |
| :--- | :---: | :---: | :--- |
| **Perianayagi Divya S** | CSE | II | **Frontend Development Lead**: React 18 UI components, registration/login forms, responsive layout, citizen & admin dashboard views. |
| **Pradeepa T** | CSE | II | **Backend & Database Lead**: Spring Boot microservices (`complaint-service`), REST API design, JPA entity models, Oracle/MySQL database management. |
| **Sreemathi V** | CSE | II | **AI Integration & Security Lead**: Python FastAPI AI inference service, Google OAuth2 Gmail API integration, Email OTP verification flow, JWT authentication security. |

### 7.2 Ownership Matrix

| Project Component | Primary Owner | Support Member |
| :--- | :--- | :--- |
| **Frontend UI (React 18 / Tailwind)** | **Perianayagi Divya S** | Pradeepa T |
| **Spring Boot Backend APIs** | **Pradeepa T** | Sreemathi V |
| **Google OAuth2 & Email OTP** | **Sreemathi V** | Pradeepa T |
| **Python FastAPI AI Classification** | **Sreemathi V** | Perianayagi Divya S |
| **Database Design & ORM** | **Pradeepa T** | Perianayagi Divya S |
| **SRS & Project Documentation** | **All Team Members** | All Team Members |

---

## 8. RISK REGISTER & MITIGATION STRATEGIES

| ID | Risk Description | Impact | Probability | Mitigation Strategy |
| :-: | :--- | :-: | :-: | :--- |
| **R01** | Google OAuth2 refresh token expiration or invalidation. | High | Low | Token caching with automatic refresh handling in `GmailOAuth2Service.java`. |
| **R02** | AI inference model latency during peak complaint submissions. | Medium | Medium | Rule-based fallback classifier when FastAPI response exceeds timeout. |
| **R03** | Database connection failure or invalid credentials. | High | Low | Spring Boot connection pooling with clear health checks. |
| **R04** | Invalid / expired OTP entry by citizen during registration. | Medium | Medium | Clear frontend error feedback with a 30-second OTP resend cooldown timer. |

---

## 9. CONCLUSION & SIGN-OFF

This **System Requirements Specification (SRS v2.0)** accurately reflects the completed technical architecture, feature set, team responsibilities, and AI integration for **CivicConnect AI** (*Crowdsourced Civic Issue Reporting, Smart Routing, and Resolution Tracking Platform*).

- **Team Name**: NexaCity
- **Institution**: Karpagam College of Engineering
- **Date**: September 2026

---
*End of SRS Document — Version 2.0*
