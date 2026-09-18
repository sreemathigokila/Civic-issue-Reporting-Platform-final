-- =============================================================================
-- Seed Data for Smart Civic Issue Reporting Platform
-- =============================================================================
SET DEFINE OFF;

-- 1. Insert Roles
INSERT INTO roles (name, created_at, soft_delete) VALUES ('ROLE_SUPER_ADMIN', CURRENT_TIMESTAMP, 0);
INSERT INTO roles (name, created_at, soft_delete) VALUES ('ROLE_DISTRICT_ADMIN', CURRENT_TIMESTAMP, 0);
INSERT INTO roles (name, created_at, soft_delete) VALUES ('ROLE_DEPARTMENT_HEAD', CURRENT_TIMESTAMP, 0);
INSERT INTO roles (name, created_at, soft_delete) VALUES ('ROLE_WORKER', CURRENT_TIMESTAMP, 0);
INSERT INTO roles (name, created_at, soft_delete) VALUES ('ROLE_CITIZEN', CURRENT_TIMESTAMP, 0);

-- 2. Insert Districts
INSERT INTO districts (name, code, state, created_at, soft_delete) VALUES ('Coimbatore', 'CBE', 'Tamil Nadu', CURRENT_TIMESTAMP, 0);
INSERT INTO districts (name, code, state, created_at, soft_delete) VALUES ('Chennai', 'MAA', 'Tamil Nadu', CURRENT_TIMESTAMP, 0);
INSERT INTO districts (name, code, state, created_at, soft_delete) VALUES ('Madurai', 'MDU', 'Tamil Nadu', CURRENT_TIMESTAMP, 0);
INSERT INTO districts (name, code, state, created_at, soft_delete) VALUES ('Trichy', 'TPJ', 'Tamil Nadu', CURRENT_TIMESTAMP, 0);

-- 3. Insert Departments
INSERT INTO departments (name, code, description, created_at, soft_delete) VALUES ('Road Maintenance', 'ROAD', 'Manages road repairs, potholes, and paving', CURRENT_TIMESTAMP, 0);
INSERT INTO departments (name, code, description, created_at, soft_delete) VALUES ('Water Board', 'WAT', 'Manages water supply pipelines and leakages', CURRENT_TIMESTAMP, 0);
INSERT INTO departments (name, code, description, created_at, soft_delete) VALUES ('Electricity Dept', 'ELEC', 'Manages electrical lines and power infrastructure', CURRENT_TIMESTAMP, 0);
INSERT INTO departments (name, code, description, created_at, soft_delete) VALUES ('Streetlight Dept', 'SL', 'Manages street lights and lighting grid', CURRENT_TIMESTAMP, 0);
INSERT INTO departments (name, code, description, created_at, soft_delete) VALUES ('Sanitation Dept', 'SAN', 'Manages waste collection, public bins, and cleanliness', CURRENT_TIMESTAMP, 0);

-- 4. Insert Super Admin & District Admins
-- Password is 'password123' BCrypt hashed: $2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07Xd0D1HPH6p5A8/B6
INSERT INTO users (full_name, email, password, mobile, role_id, district_id, created_at, soft_delete) 
VALUES ('Super Admin', 'admin@civicconnect.gov.in', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07Xd0D1HPH6p5A8/B6', '9876543210', 1, 1, CURRENT_TIMESTAMP, 0);

-- 5. Insert Coimbatore Department Heads
-- Coimbatore Roads Head
INSERT INTO users (full_name, email, password, mobile, role_id, district_id, department_id, designation, created_at, soft_delete) 
VALUES ('Ramesh Kumar', 'ramesh.cbe.roads@civicconnect.gov.in', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07Xd0D1HPH6p5A8/B6', '9876543211', 3, 1, 1, 'Roads Head', CURRENT_TIMESTAMP, 0);

INSERT INTO department_heads (user_id, district_id, department_id, created_at, soft_delete) VALUES (2, 1, 1, CURRENT_TIMESTAMP, 0);

-- Coimbatore Water Head
INSERT INTO users (full_name, email, password, mobile, role_id, district_id, department_id, designation, created_at, soft_delete) 
VALUES ('Senthil Nathan', 'senthil.cbe.water@civicconnect.gov.in', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07Xd0D1HPH6p5A8/B6', '9876543212', 3, 1, 2, 'Water Head', CURRENT_TIMESTAMP, 0);

INSERT INTO department_heads (user_id, district_id, department_id, created_at, soft_delete) VALUES (3, 1, 2, CURRENT_TIMESTAMP, 0);

-- 6. Insert Workers
INSERT INTO users (full_name, email, password, mobile, role_id, district_id, department_id, worker_id_code, designation, created_at, soft_delete) 
VALUES ('Venkatesan', 'venkatesan@civicconnect.gov.in', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07Xd0D1HPH6p5A8/B6', '9952012345', 4, 1, 1, 'W002', 'Senior Road Inspector', CURRENT_TIMESTAMP, 0);

INSERT INTO worker (user_id, worker_id_code, district_id, department_id, designation, aadhar_id, created_at, soft_delete) 
VALUES (4, 'W002', 1, 1, 'Senior Road Inspector', '123456789012', CURRENT_TIMESTAMP, 0);

-- 7. Insert Citizens
INSERT INTO users (full_name, email, password, mobile, role_id, district_id, created_at, soft_delete) 
VALUES ('Pradeepa', 'pradeepa@gmail.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07Xd0D1HPH6p5A8/B6', '8122671800', 5, 1, CURRENT_TIMESTAMP, 0);

INSERT INTO citizens (user_id, address, city, state, pincode, created_at, soft_delete) 
VALUES (5, 'Gandhipuram, Coimbatore', 'Coimbatore', 'Tamil Nadu', '641012', CURRENT_TIMESTAMP, 0);

-- 8. Insert Sample Complaint & AI Analysis
INSERT INTO complaints (complaint_code, citizen_id, district_id, department_id, department_head_id, worker_id, title, description, category, priority, urgency, status, location_address, created_at, soft_delete) 
VALUES ('C1023', 5, 1, 1, 1, 1, 'Pothole on main road', 'Large pothole on main road causing difficulty for vehicles near Gandhipuram bus stand.', 'Roads & Potholes', 'HIGH', 'HIGH', 'IN_PROGRESS', 'Gandhipuram, Coimbatore', CURRENT_TIMESTAMP, 0);

INSERT INTO ai_analysis (complaint_id, detected_issue, detected_department, summary, keywords, assigned_priority, urgency_level, recommended_category, confidence_score, created_at, soft_delete)
VALUES (1, 'Pothole on main road', 'Road Maintenance', 'AI detected road structural pothole hazard requiring immediate asphalt filling.', 'Pothole, Road, Gandhipuram, Safety', 'HIGH', 'HIGH', 'Roads & Potholes', 0.98, CURRENT_TIMESTAMP, 0);
