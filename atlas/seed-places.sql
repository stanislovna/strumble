-- Seed some example places for testing the map

-- Major Cities
INSERT INTO places (name, lat, lng, slug, country, continent, description) VALUES
('New York', 40.7128, -74.0060, 'new-york', 'United States', 'North America', 'The Big Apple - largest city in the United States'),
('London', 51.5074, -0.1278, 'london', 'United Kingdom', 'Europe', 'Capital of England and the United Kingdom'),
('Tokyo', 35.6762, 139.6503, 'tokyo', 'Japan', 'Asia', 'Capital of Japan, the most populous metropolitan area'),
('Paris', 48.8566, 2.3522, 'paris', 'France', 'Europe', 'The City of Light - capital of France'),
('Sydney', -33.8688, 151.2093, 'sydney', 'Australia', 'Oceania', 'Most populous city in Australia'),
('Rio de Janeiro', -22.9068, -43.1729, 'rio-de-janeiro', 'Brazil', 'South America', 'Marvelous City - known for Copacabana beach'),
('Cairo', 30.0444, 31.2357, 'cairo', 'Egypt', 'Africa', 'Capital of Egypt, one of the oldest cities'),
('Moscow', 55.7558, 37.6173, 'moscow', 'Russia', 'Europe', 'Capital of Russia'),
('Mumbai', 19.0760, 72.8777, 'mumbai', 'India', 'Asia', 'Financial capital of India'),
('Mexico City', 19.4326, -99.1332, 'mexico-city', 'Mexico', 'North America', 'Capital and largest city of Mexico');

-- European Cities
INSERT INTO places (name, lat, lng, slug, country, continent, description) VALUES
('Barcelona', 41.3874, 2.1686, 'barcelona', 'Spain', 'Europe', 'Cosmopolitan capital of Catalonia region'),
('Amsterdam', 52.3676, 4.9041, 'amsterdam', 'Netherlands', 'Europe', 'Capital of the Netherlands'),
('Berlin', 52.5200, 13.4050, 'berlin', 'Germany', 'Europe', 'Capital of Germany'),
('Prague', 50.0755, 14.4378, 'prague', 'Czech Republic', 'Europe', 'Capital of the Czech Republic'),
('Rome', 41.9028, 12.4964, 'rome', 'Italy', 'Europe', 'The Eternal City - capital of Italy'),
('Vienna', 48.2082, 16.3738, 'vienna', 'Austria', 'Europe', 'Capital of Austria'),
('Stockholm', 59.3293, 18.0686, 'stockholm', 'Sweden', 'Europe', 'Capital of Sweden'),
('Copenhagen', 55.6761, 12.5683, 'copenhagen', 'Denmark', 'Europe', 'Capital of Denmark'),
('Dublin', 53.3498, -6.2603, 'dublin', 'Ireland', 'Europe', 'Capital of Ireland'),
('Lisbon', 38.7223, -9.1393, 'lisbon', 'Portugal', 'Europe', 'Capital of Portugal');

-- Asian Cities
INSERT INTO places (name, lat, lng, slug, country, continent, description) VALUES
('Bangkok', 13.7563, 100.5018, 'bangkok', 'Thailand', 'Asia', 'Capital of Thailand'),
('Singapore', 1.3521, 103.8198, 'singapore', 'Singapore', 'Asia', 'City-state in Southeast Asia'),
('Hong Kong', 22.3193, 114.1694, 'hong-kong', 'China', 'Asia', 'Special Administrative Region of China'),
('Seoul', 37.5665, 126.9780, 'seoul', 'South Korea', 'Asia', 'Capital of South Korea'),
('Dubai', 25.2048, 55.2708, 'dubai', 'UAE', 'Asia', 'Most populous city in the UAE'),
('Istanbul', 41.0082, 28.9784, 'istanbul', 'Turkey', 'Asia/Europe', 'Transcontinental city in Turkey'),
('Beijing', 39.9042, 116.4074, 'beijing', 'China', 'Asia', 'Capital of China'),
('Kuala Lumpur', 3.1390, 101.6869, 'kuala-lumpur', 'Malaysia', 'Asia', 'Capital of Malaysia'),
('Jakarta', -6.2088, 106.8456, 'jakarta', 'Indonesia', 'Asia', 'Capital of Indonesia'),
('Manila', 14.5995, 120.9842, 'manila', 'Philippines', 'Asia', 'Capital of the Philippines');

-- African Cities
INSERT INTO places (name, lat, lng, slug, country, continent, description) VALUES
('Cape Town', -33.9249, 18.4241, 'cape-town', 'South Africa', 'Africa', 'Legislative capital of South Africa'),
('Nairobi', -1.2864, 36.8172, 'nairobi', 'Kenya', 'Africa', 'Capital of Kenya'),
('Lagos', 6.5244, 3.3792, 'lagos', 'Nigeria', 'Africa', 'Most populous city in Nigeria'),
('Marrakech', 31.6295, -7.9811, 'marrakech', 'Morocco', 'Africa', 'Major city in Morocco'),
('Addis Ababa', 9.0320, 38.7469, 'addis-ababa', 'Ethiopia', 'Africa', 'Capital of Ethiopia');

-- North American Cities
INSERT INTO places (name, lat, lng, slug, country, continent, description) VALUES
('Los Angeles', 34.0522, -118.2437, 'los-angeles', 'United States', 'North America', 'City of Angels'),
('Chicago', 41.8781, -87.6298, 'chicago', 'United States', 'North America', 'The Windy City'),
('Toronto', 43.6532, -79.3832, 'toronto', 'Canada', 'North America', 'Largest city in Canada'),
('Vancouver', 49.2827, -123.1207, 'vancouver', 'Canada', 'North America', 'Coastal seaport city in Canada'),
('San Francisco', 37.7749, -122.4194, 'san-francisco', 'United States', 'North America', 'City by the Bay');

-- South American Cities
INSERT INTO places (name, lat, lng, slug, country, continent, description) VALUES
('Buenos Aires', -34.6037, -58.3816, 'buenos-aires', 'Argentina', 'South America', 'Capital of Argentina'),
('Lima', -12.0464, -77.0428, 'lima', 'Peru', 'South America', 'Capital of Peru'),
('Bogotá', 4.7110, -74.0721, 'bogota', 'Colombia', 'South America', 'Capital of Colombia'),
('Santiago', -33.4489, -70.6693, 'santiago', 'Chile', 'South America', 'Capital of Chile');

-- Smaller cities and villages (examples)
INSERT INTO places (name, lat, lng, slug, country, continent, description) VALUES
('Hallstatt', 47.5622, 13.6493, 'hallstatt', 'Austria', 'Europe', 'Picturesque village in Austrian Alps'),
('Santorini', 36.3932, 25.4615, 'santorini', 'Greece', 'Europe', 'Greek island in the Aegean Sea'),
('Cinque Terre', 44.1287, 9.7224, 'cinque-terre', 'Italy', 'Europe', 'Five coastal villages in Italy'),
('Chefchaouen', 35.1689, -5.2636, 'chefchaouen', 'Morocco', 'Africa', 'The Blue Pearl of Morocco'),
('Luang Prabang', 19.8845, 102.1350, 'luang-prabang', 'Laos', 'Asia', 'Ancient town in northern Laos'),
('Hoi An', 15.8801, 108.3380, 'hoi-an', 'Vietnam', 'Asia', 'Ancient town on Vietnam''s central coast'),
('Queenstown', -45.0312, 168.6626, 'queenstown', 'New Zealand', 'Oceania', 'Resort town in New Zealand'),
('Reykjavik', 64.1466, -21.9426, 'reykjavik', 'Iceland', 'Europe', 'Capital of Iceland');

-- Note: After inserting these places, you can create stories for them
-- Example: Visit /place/{place-id} and click "Add Story"
