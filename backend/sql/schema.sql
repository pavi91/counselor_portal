CREATE DATABASE IF NOT EXISTS counselor_portal;
USE counselor_portal;

-- Roles
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Permissions
CREATE TABLE IF NOT EXISTS permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255),
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Role Permissions (Many-to-Many)
CREATE TABLE IF NOT EXISTS role_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_role_perm_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_role_perm_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
  UNIQUE KEY uq_role_permission (role_id, permission_id)
) ENGINE=InnoDB;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  index_number VARCHAR(100),
  full_name VARCHAR(255),
  name_with_initials VARCHAR(255),
  permanent_address VARCHAR(500),
  resident_phone VARCHAR(50),
  mobile_phone VARCHAR(50),
  gender VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB;

-- Role Requests
CREATE TABLE IF NOT EXISTS role_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  attachment VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at DATE NOT NULL,
  CONSTRAINT fk_role_requests_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- Hostels
CREATE TABLE IF NOT EXISTS hostels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Rooms
CREATE TABLE IF NOT EXISTS rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hostel_id INT NOT NULL,
  number VARCHAR(20) NOT NULL,
  floor INT NOT NULL,
  capacity INT NOT NULL,
  type VARCHAR(50) NOT NULL,
  CONSTRAINT fk_rooms_hostel FOREIGN KEY (hostel_id) REFERENCES hostels(id),
  UNIQUE KEY uq_room (hostel_id, number)
) ENGINE=InnoDB;

-- Allocations
CREATE TABLE IF NOT EXISTS allocations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  room_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  CONSTRAINT fk_allocations_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_allocations_room FOREIGN KEY (room_id) REFERENCES rooms(id)
) ENGINE=InnoDB;

-- Applications (1NF: atomic columns)
CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  status VARCHAR(20) NOT NULL,
  points DECIMAL(6,2) NOT NULL DEFAULT 0,
  submission_date DATE NOT NULL,

  full_name VARCHAR(255),
  index_number VARCHAR(100),
  permanent_address VARCHAR(500),
  email VARCHAR(255),
  gender VARCHAR(20),
  mobile_phone VARCHAR(50),
  district VARCHAR(100),
  closest_town VARCHAR(100),
  distance_to_town DECIMAL(8,2),
  distance DECIMAL(8,2),
  faculty VARCHAR(100),
  department VARCHAR(100),
  year VARCHAR(50),

  misconduct VARCHAR(10),
  is_mahapola_recipient VARCHAR(10),
  bursary_amount VARCHAR(50),
  income_range VARCHAR(50),
  is_samurdhi_recipient VARCHAR(10),

  mother_alive VARCHAR(10),
  father_alive VARCHAR(10),
  siblings_school INT,
  siblings_uni INT,

  is_captain VARCHAR(10),
  is_member VARCHAR(10),
  member_team VARCHAR(100),
  has_colours VARCHAR(10),

  hostel_pref VARCHAR(100),

  emergency_name VARCHAR(255),
  emergency_mobile VARCHAR(50),
  emergency_address VARCHAR(500),

  file_residence VARCHAR(255),
  file_income VARCHAR(255),
  file_siblings VARCHAR(255),
  file_samurdhi VARCHAR(255),
  file_sports VARCHAR(255),

  CONSTRAINT fk_applications_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- Tickets
CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  counselor_id INT NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open',
  created_at DATE NOT NULL,
  CONSTRAINT fk_tickets_student FOREIGN KEY (student_id) REFERENCES users(id),
  CONSTRAINT fk_tickets_counselor FOREIGN KEY (counselor_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- Ticket Messages (1NF: repeating groups normalized)
CREATE TABLE IF NOT EXISTS ticket_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  sender_id INT NOT NULL,
  text TEXT NOT NULL,
  attachment VARCHAR(255),
  created_at VARCHAR(50) NOT NULL,
  CONSTRAINT fk_ticket_messages_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id),
  CONSTRAINT fk_ticket_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id)
) ENGINE=InnoDB;
