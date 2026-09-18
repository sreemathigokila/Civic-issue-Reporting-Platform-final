# CivicConnect AI — Smart Civic Issue Reporting & Resolution Platform
> **Smart India Hackathon (SIH 2025) Submission**  
> **Problem Statement ID**: FSJ28-INTERN-004  
> **Team Name**: NexaCity | **Institution**: Karpagam College of Engineering  
> **Team Members**: Perianayagi Divya S (CSE II), Pradeepa T (CSE II), Sreemathi V (CSE II)

---

## 📌 Project Overview

**CivicConnect AI** is a production-ready, full-stack enterprise civic grievance redressal platform. It enables citizens to report public infrastructure issues (potholes, garbage overflow, streetlight faults, water leakages, drainage blockages) with geo-tagged images, GPS coordinates, and descriptions. 

The system leverages an **AI/ML inference model** (Python FastAPI) to automatically classify complaint categories, calculate priority/severity scores, detect duplicate issues, and route complaints to the appropriate municipal department.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Redux Toolkit, Tailwind CSS, Lucide Icons, Axios
- **Backend Framework**: Spring Boot 3.2.4 (Java 21), Spring Security (JWT), Spring Data JPA / Hibernate
- **Database**: Oracle Database 21c XE / MySQL 8.0 / H2 Database
- **AI / ML Service**: Python 3.11, FastAPI, scikit-learn, HuggingFace Transformers
- **Email Service**: Google OAuth2 Gmail API (`google-oauth-client.json`)
- **DevOps & Build**: Apache Maven (`mvnw`), Node.js, Docker, Git

---

## 🚀 How to Run locally

### 1. Run Backend (Spring Boot 3)

In Windows Command Prompt (`cmd.exe`) or Terminal:
```cmd
cd backend
mvnw.cmd spring-boot:run
```

The Spring Boot backend will start at: `http://localhost:8080`.

---

### 2. Run Frontend (React 18 + Vite)

In a new terminal at the project root:
```cmd
npm install
npm run dev
```

The React frontend will start at: `http://localhost:5173`.

---

### 3. Build Production Bundles

- **Frontend Production Build**:
  ```cmd
  npm run build
  ```
- **Backend Maven Build**:
  ```cmd
  cd backend
  mvnw.cmd clean install -DskipTests
  ```

---

## 👥 Team NexaCity & Role Ownership

| Member Name | Branch & Year | Primary Responsibilities |
| :--- | :---: | :--- |
| **Perianayagi Divya S** | CSE II | **Frontend Lead**: React UI components, responsive layout, citizen & admin dashboard view. |
| **Pradeepa T** | CSE II | **Backend & Database Lead**: Spring Boot microservices (`complaint-service`), REST API design, JPA entities, database management. |
| **Sreemathi V** | CSE II | **AI Integration & Security Lead**: Python FastAPI AI engine, Google OAuth2 Gmail API integration, Email OTP verification flow, JWT security. |

---

## 📄 Documentation

- **System Requirements Specification (SRS v2.0)**: [`docs/CivicConnect_SRS_Document.md`](file:///c:/Users/Srimathi/Downloads/Civic-issue-Reporting-Platform-main/Civic-issue-Reporting-Platform-main/docs/CivicConnect_SRS_Document.md)
- **Entity Relationship Diagram (ERD)**: [`docs/er_diagram.md`](file:///c:/Users/Srimathi/Downloads/Civic-issue-Reporting-Platform-main/Civic-issue-Reporting-Platform-main/docs/er_diagram.md)
- **Postman API Collection**: [`docs/postman_collection.json`](file:///c:/Users/Srimathi/Downloads/Civic-issue-Reporting-Platform-main/Civic-issue-Reporting-Platform-main/docs/postman_collection.json)

---

## 📜 License & Disclaimer

*Confidential — For Training & SIH Evaluation Use Only | Karpagam College of Engineering*
