-- 002_seed.sql
-- Seed fake development data for local testing

BEGIN;

-- 1. Fake Users (matches your schema: username, email, password, avatar_url, status)
INSERT INTO users (username, email, password, avatar_url, status)
VALUES
  ('alice', 'alice@example.com', 'dev_password_hash_1', 'https://api.dicebear.com/9.x/avataaars/svg?seed=alice', 'Streaming live!'),
  ('bob',   'bob@example.com',   'dev_password_hash_2', 'https://api.dicebear.com/9.x/avataaars/svg?seed=bob',   'Chilling in chat'),
  ('charlie', 'charlie@example.com', 'dev_password_hash_3', NULL, 'AFK')
ON CONFLICT (username) DO NOTHING;

-- 2. Fake Livestream Rooms (owned by alice and bob)
INSERT INTO rooms (room_code, title, host_id, is_live, stream_key)
VALUES
  ('ROOM01', 'Late Night Coding & Music', (SELECT id FROM users WHERE username = 'alice'), TRUE,  'sk_live_alice_001'),
  ('ROOM02', 'Weekend Watch Party',       (SELECT id FROM users WHERE username = 'bob'),   FALSE, 'sk_live_bob_002')
ON CONFLICT (room_code) DO NOTHING;

-- 3. Fake Room Participants
INSERT INTO room_participants (room_id, user_id, role)
VALUES
  ((SELECT id FROM rooms WHERE room_code = 'ROOM01'), (SELECT id FROM users WHERE username = 'alice'),   'host'),
  ((SELECT id FROM rooms WHERE room_code = 'ROOM01'), (SELECT id FROM users WHERE username = 'bob'),     'viewer'),
  ((SELECT id FROM rooms WHERE room_code = 'ROOM01'), (SELECT id FROM users WHERE username = 'charlie'), 'viewer')
ON CONFLICT (room_id, user_id) DO NOTHING;

-- 4. Fake Chat Messages
INSERT INTO chat_messages (room_id, user_id, content)
VALUES
  ((SELECT id FROM rooms WHERE room_code = 'ROOM01'), (SELECT id FROM users WHERE username = 'alice'),   'Welcome to the stream everyone!'),
  ((SELECT id FROM rooms WHERE room_code = 'ROOM01'), (SELECT id FROM users WHERE username = 'bob'),     'Audio and video look super clean.'),
  ((SELECT id FROM rooms WHERE room_code = 'ROOM01'), (SELECT id FROM users WHERE username = 'charlie'), 'Hyped for tonight!');

COMMIT;