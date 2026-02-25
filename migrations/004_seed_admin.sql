-- Seed default admin user for dev-bypass (optional; ON CONFLICT DO NOTHING)
-- Default credentials: admin / password (change in production)
INSERT INTO users (username, email, password_hash, full_name, active)
VALUES (
    'admin',
    'admin@localhost',
    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'Admin',
    true
)
ON CONFLICT (username) DO NOTHING;
