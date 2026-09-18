-- =============================================================================
-- Oracle DBMS 21c DDL Schema for Smart Civic Issue Reporting Platform
-- =============================================================================

-- 1. ROLES TABLE
CREATE TABLE roles (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    soft_delete NUMBER(1) DEFAULT 0 NOT NULL
);

-- 2. DISTRICTS TABLE
CREATE TABLE districts (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(100) NOT NULL UNIQUE,
    code VARCHAR2(20),
    state VARCHAR2(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    soft_delete NUMBER(1) DEFAULT 0 NOT NULL
);

-- 3. DEPARTMENTS TABLE
CREATE TABLE departments (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(100) NOT NULL UNIQUE,
    code VARCHAR2(20),
    description VARCHAR2(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    soft_delete NUMBER(1) DEFAULT 0 NOT NULL
);

-- 4. USERS TABLE
CREATE TABLE users (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name VARCHAR2(150) NOT NULL,
    email VARCHAR2(150) NOT NULL UNIQUE,
    password VARCHAR2(255) NOT NULL,
    mobile VARCHAR2(20),
    role_id NUMBER(19) REFERENCES roles(id),
    district_id NUMBER(19) REFERENCES districts(id),
    department_id NUMBER(19) REFERENCES departments(id),
    worker_id_code VARCHAR2(50),
    aadhar_id VARCHAR2(20),
    designation VARCHAR2(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    soft_delete NUMBER(1) DEFAULT 0 NOT NULL
);

-- 5. DEPARTMENT HEADS TABLE (DISTRICT WISE DEPARTMENT HEAD CONSTRAINT)
CREATE TABLE department_heads (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER(19) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    district_id NUMBER(19) NOT NULL REFERENCES districts(id),
    department_id NUMBER(19) NOT NULL REFERENCES departments(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    soft_delete NUMBER(1) DEFAULT 0 NOT NULL,
    CONSTRAINT uk_district_department UNIQUE (district_id, department_id)
);

-- 6. WORKER TABLE
CREATE TABLE worker (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER(19) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    worker_id_code VARCHAR2(50) NOT NULL UNIQUE,
    district_id NUMBER(19) REFERENCES districts(id),
    department_id NUMBER(19) REFERENCES departments(id),
    designation VARCHAR2(100),
    aadhar_id VARCHAR2(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    soft_delete NUMBER(1) DEFAULT 0 NOT NULL
);

-- 7. CITIZENS TABLE
CREATE TABLE citizens (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER(19) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address VARCHAR2(250),
    city VARCHAR2(100),
    state VARCHAR2(100),
    pincode VARCHAR2(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    soft_delete NUMBER(1) DEFAULT 0 NOT NULL
);

-- 8. COMPLAINTS TABLE
CREATE TABLE complaints (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    complaint_code VARCHAR2(50) NOT NULL UNIQUE,
    citizen_id NUMBER(19) NOT NULL REFERENCES users(id),
    district_id NUMBER(19) REFERENCES districts(id),
    department_id NUMBER(19) REFERENCES departments(id),
    department_head_id NUMBER(19) REFERENCES department_heads(id),
    worker_id NUMBER(19) REFERENCES worker(id),
    title VARCHAR2(200) NOT NULL,
    description CLOB,
    voice_url VARCHAR2(500),
    category VARCHAR2(100),
    priority VARCHAR2(50),
    urgency VARCHAR2(50),
    status VARCHAR2(50) NOT NULL,
    location_address VARCHAR2(300),
    latitude NUMBER(10, 6),
    longitude NUMBER(10, 6),
    before_image_url VARCHAR2(500),
    after_image_url VARCHAR2(500),
    final_remarks VARCHAR2(500),
    worker_remarks VARCHAR2(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    soft_delete NUMBER(1) DEFAULT 0 NOT NULL
);

-- 9. COMPLAINT IMAGES TABLE
CREATE TABLE complaint_images (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    complaint_id NUMBER(19) NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    image_url VARCHAR2(500) NOT NULL,
    image_type VARCHAR2(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    soft_delete NUMBER(1) DEFAULT 0 NOT NULL
);

-- 10. COMPLAINT HISTORY TABLE
CREATE TABLE complaint_history (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    complaint_id NUMBER(19) NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    action VARCHAR2(100) NOT NULL,
    status VARCHAR2(50),
    changed_by_id NUMBER(19) REFERENCES users(id),
    remarks VARCHAR2(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    soft_delete NUMBER(1) DEFAULT 0 NOT NULL
);

-- 11. AI ANALYSIS TABLE
CREATE TABLE ai_analysis (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    complaint_id NUMBER(19) NOT NULL UNIQUE REFERENCES complaints(id) ON DELETE CASCADE,
    detected_issue VARCHAR2(200),
    detected_department VARCHAR2(100),
    summary CLOB,
    keywords VARCHAR2(300),
    assigned_priority VARCHAR2(50),
    urgency_level VARCHAR2(50),
    recommended_category VARCHAR2(100),
    confidence_score NUMBER(5, 2),
    raw_response CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    soft_delete NUMBER(1) DEFAULT 0 NOT NULL
);

-- 12. NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER(19) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR2(150) NOT NULL,
    message VARCHAR2(500) NOT NULL,
    type VARCHAR2(50),
    read_status NUMBER(1) DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    soft_delete NUMBER(1) DEFAULT 0 NOT NULL
);

-- 13. FEEDBACK TABLE
CREATE TABLE feedback (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    complaint_id NUMBER(19) NOT NULL UNIQUE REFERENCES complaints(id) ON DELETE CASCADE,
    citizen_id NUMBER(19) NOT NULL REFERENCES users(id),
    rating NUMBER(1) NOT NULL,
    comments VARCHAR2(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    soft_delete NUMBER(1) DEFAULT 0 NOT NULL
);

-- 14. AUDIT LOGS TABLE
CREATE TABLE audit_logs (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER(19) REFERENCES users(id),
    action VARCHAR2(100) NOT NULL,
    entity_name VARCHAR2(100),
    entity_id NUMBER(19),
    details CLOB,
    ip_address VARCHAR2(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    soft_delete NUMBER(1) DEFAULT 0 NOT NULL
);

-- 15. ACTIVITY LOGS TABLE
CREATE TABLE activity_logs (
    id NUMBER(19) GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id NUMBER(19) REFERENCES users(id),
    description VARCHAR2(300) NOT NULL,
    activity_type VARCHAR2(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    soft_delete NUMBER(1) DEFAULT 0 NOT NULL
);
