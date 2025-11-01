-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert questions
INSERT INTO questions (question_text, question_type, sort_order) VALUES
('Tell us about the time someone helped you in this place.', 'story', 1),
('Tell us about the biggest obstacle you had to overcome in this place.', 'story', 2),
('Tell us about the time you felt deeply sad in this place.', 'story', 3),
('Tell us about the thing that made you laugh so hard you couldn''t stop in this place.', 'story', 4),
('Tell us about how you make and spend your money in this place.', 'story', 5),
('Tell us where you would take a stranger who doesn''t know your village/city.', 'poi', 6),
('Tell us something about this place not many people know.', 'poi', 7),
('Tell us about the place you go when you feel like you need to talk to someone.', 'poi', 8)
ON CONFLICT DO NOTHING;

-- Insert sample places (optional for testing)
INSERT INTO places (name, slug, lat, lng, country, continent) VALUES
('London', 'london', 51.5074, -0.1278, 'United Kingdom', 'Europe'),
('Paris', 'paris', 48.8566, 2.3522, 'France', 'Europe'),
('New York', 'new-york', 40.7128, -74.0060, 'United States', 'North America'),
('Tokyo', 'tokyo', 35.6762, 139.6503, 'Japan', 'Asia')
ON CONFLICT (slug) DO NOTHING;

-- Insert admin user (update with real data)
INSERT INTO users (email, username, role, first_name, last_name) VALUES
('admin@example.com', 'admin', 'admin', 'Admin', 'User')
ON CONFLICT (email) DO NOTHING;
