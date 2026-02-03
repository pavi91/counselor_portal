USE counselor_portal;

INSERT INTO roles (name) VALUES
  ('admin'),
  ('staff'),
  ('counselor'),
  ('student')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Users (password_hash uses plain text for dev; replace with bcrypt hashes in production)
INSERT INTO users (email, password_hash, role_id, name, index_number, full_name, name_with_initials, permanent_address, resident_phone, mobile_phone, gender)
VALUES
  ('admin@uom.local', '123', (SELECT id FROM roles WHERE name='admin'), 'Saman Perera', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('counselor@uom.local', '123', (SELECT id FROM roles WHERE name='counselor'), 'Dr. Nirosha Bandara', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('staff@uom.local', '123', (SELECT id FROM roles WHERE name='staff'), 'Sunil Jayasinghe', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('student@uom.local', '123', (SELECT id FROM roles WHERE name='student'), 'Kasun Wijeratne', 'ST-2024-004', 'Kasun Chathuranga Wijeratne', 'K. C. Wijeratne', 'No. 45, Temple Road, Kandy', '0812233445', '0777123456', 'male')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO hostels (name) VALUES
  ("Men's Hostel A"),
  ("Women's Hostel B")
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO rooms (hostel_id, number, floor, capacity, type)
VALUES
  ((SELECT id FROM hostels WHERE name = "Men's Hostel A"), '101', 1, 2, 'Double'),
  ((SELECT id FROM hostels WHERE name = "Men's Hostel A"), '102', 1, 2, 'Double'),
  ((SELECT id FROM hostels WHERE name = "Men's Hostel A"), '201', 2, 1, 'Single'),
  ((SELECT id FROM hostels WHERE name = "Women's Hostel B"), '101', 1, 2, 'Double'),
  ((SELECT id FROM hostels WHERE name = "Women's Hostel B"), '102', 1, 4, 'Dorm')
ON DUPLICATE KEY UPDATE capacity = VALUES(capacity);
