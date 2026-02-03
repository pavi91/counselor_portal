USE counselor_portal;

-- Insert Roles
INSERT INTO roles (name, description) VALUES
  ('admin', 'Administrator with full system access'),
  ('staff', 'Staff member for managing applications and hostels'),
  ('counselor', 'Counselor for student support and guidance'),
  ('student', 'Student user')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Insert Permissions
INSERT INTO permissions (name, description, resource, action) VALUES
  -- User Management
  ('users.view_all', 'View all users', 'users', 'view'),
  ('users.create', 'Create new user', 'users', 'create'),
  ('users.edit', 'Edit user details', 'users', 'edit'),
  ('users.delete', 'Delete user', 'users', 'delete'),
  ('users.change_role', 'Change user role', 'users', 'change_role'),
  ('users.bulk_create', 'Bulk create users', 'users', 'bulk_create'),

  -- Application Management
  ('applications.view_all', 'View all applications', 'applications', 'view'),
  ('applications.view_own', 'View own application', 'applications', 'view'),
  ('applications.submit', 'Submit application', 'applications', 'submit'),
  ('applications.review', 'Review and approve/reject applications', 'applications', 'review'),
  ('applications.edit_own', 'Edit own application', 'applications', 'edit'),

  -- Hostel Management
  ('hostels.view', 'View hostels', 'hostels', 'view'),
  ('hostels.view_stats', 'View hostel statistics', 'hostels', 'view_stats'),
  ('hostels.manage', 'Manage hostels and rooms', 'hostels', 'manage'),
  ('hostels.assign', 'Assign rooms to students', 'hostels', 'assign'),
  ('hostels.view_allocation', 'View own hostel allocation', 'hostels', 'view_allocation'),

  -- Ticket Management
  ('tickets.create', 'Create support ticket', 'tickets', 'create'),
  ('tickets.view_own', 'View own tickets', 'tickets', 'view'),
  ('tickets.view_assigned', 'View assigned tickets', 'tickets', 'view'),
  ('tickets.reply', 'Reply to ticket', 'tickets', 'reply'),
  ('tickets.resolve', 'Resolve ticket', 'tickets', 'resolve'),

  -- Role Requests
  ('role_requests.view_all', 'View all role requests', 'role_requests', 'view'),
  ('role_requests.create', 'Create role request', 'role_requests', 'create'),
  ('role_requests.process', 'Approve/reject role requests', 'role_requests', 'process'),

  -- Authentication
  ('auth.login', 'Login to system', 'auth', 'login'),
  ('auth.verify', 'Verify authentication token', 'auth', 'verify')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Assign Permissions to Admin (full access)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'admin'
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- Assign Permissions to Staff
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'staff' AND p.name IN (
  'users.view_all', 'users.bulk_create',
  'applications.view_all', 'applications.review',
  'hostels.view', 'hostels.view_stats', 'hostels.manage', 'hostels.assign',
  'tickets.view_assigned', 'tickets.reply', 'tickets.resolve',
  'role_requests.view_all', 'role_requests.process',
  'auth.login', 'auth.verify'
)
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- Assign Permissions to Counselor
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'counselor' AND p.name IN (
  'users.view_all',
  'applications.view_all',
  'hostels.view', 'hostels.view_stats',
  'tickets.view_assigned', 'tickets.reply', 'tickets.resolve',
  'role_requests.create',
  'auth.login', 'auth.verify'
)
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- Assign Permissions to Student
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'student' AND p.name IN (
  'applications.view_own', 'applications.submit', 'applications.edit_own',
  'hostels.view', 'hostels.view_allocation',
  'tickets.create', 'tickets.view_own', 'tickets.reply',
  'role_requests.create',
  'auth.login', 'auth.verify'
)
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- Insert Users
INSERT INTO users (email, password_hash, role_id, name, index_number, full_name, name_with_initials, permanent_address, resident_phone, mobile_phone, gender)
VALUES
  ('admin@uom.local', '123', (SELECT id FROM roles WHERE name='admin'), 'Saman Perera', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('counselor@uom.local', '123', (SELECT id FROM roles WHERE name='counselor'), 'Dr. Nirosha Bandara', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('staff@uom.local', '123', (SELECT id FROM roles WHERE name='staff'), 'Sunil Jayasinghe', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('student@uom.local', '123', (SELECT id FROM roles WHERE name='student'), 'Kasun Wijeratne', 'ST-2024-004', 'Kasun Chathuranga Wijeratne', 'K. C. Wijeratne', 'No. 45, Temple Road, Kandy', '0812233445', '0777123456', 'male')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert Hostels
INSERT INTO hostels (name) VALUES
  ("Men's Hostel A"),
  ("Women's Hostel B")
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert Rooms
  ((SELECT id FROM hostels WHERE name = "Men's Hostel A"), '101', 1, 2, 'Double'),
  ((SELECT id FROM hostels WHERE name = "Men's Hostel A"), '102', 1, 2, 'Double'),
  ((SELECT id FROM hostels WHERE name = "Men's Hostel A"), '201', 2, 1, 'Single'),
  ((SELECT id FROM hostels WHERE name = "Women's Hostel B"), '101', 1, 2, 'Double'),
  ((SELECT id FROM hostels WHERE name = "Women's Hostel B"), '102', 1, 4, 'Dorm')
ON DUPLICATE KEY UPDATE capacity = VALUES(capacity);
