-- V1 seeded both demo users with a bcrypt hash that does not actually match
-- "demo123" (the password advertised in the README and the login screen).
-- This replaces it with a hash generated for the real value.
UPDATE users
SET password = '$2a$10$y8UrbtM/zHCVb6wNK..oYOEiO3TOSEb6p4xHXzlK.k1FdhZbwvgJW'
WHERE email IN ('dev@smartdocs.de', 'admin@smartdocs.de');
