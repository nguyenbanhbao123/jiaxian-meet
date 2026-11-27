BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- Enables gen_random_uuid()

-- Reusable trigger function for automatic updated_at timestamps
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id              BIGSERIAL PRIMARY KEY,
  username        VARCHAR(32)  NOT NULL UNIQUE,
  email           VARCHAR(255) NOT NULL UNIQUE,
  password        TEXT         NOT NULL,
  avatar_url      TEXT,
  status          TEXT         DEFAULT NULL,           
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  DEFAULT NULL,
  deleted_at      TIMESTAMPTZ  DEFAULT NULL,
  
  CONSTRAINT chk_username_not_blank CHECK (char_length(trim(username)) >= 2)
);

DROP TRIGGER IF EXISTS set_users_updated_at ON users;
CREATE TRIGGER set_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();

-- Auth Sessions / Refresh Tokens
CREATE TABLE IF NOT EXISTS user_sessions (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT         NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ  NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Watch / Livestream Rooms
CREATE TABLE IF NOT EXISTS rooms (
  id          BIGSERIAL    PRIMARY KEY,
  room_code   VARCHAR(16)  NOT NULL UNIQUE,
  title       VARCHAR(100) NOT NULL DEFAULT 'Watch Room',
  host_id     BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_live     BOOLEAN      NOT NULL DEFAULT TRUE,
  stream_key  TEXT         UNIQUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rooms_host_id ON rooms(host_id);

-- Room Participants
CREATE TABLE IF NOT EXISTS room_participants (
  room_id    BIGINT      NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id    BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       VARCHAR(16) NOT NULL DEFAULT 'viewer' CHECK (role IN ('host', 'moderator', 'viewer')),
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  PRIMARY KEY (room_id, user_id)
);

-- Room Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id          BIGSERIAL   PRIMARY KEY,
  room_id     BIGINT      NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id     BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NULL,
  deleted_at  TIMESTAMPTZ DEFAULT NULL,

  CONSTRAINT chk_message_not_empty CHECK (char_length(trim(content)) > 0)
);

DROP TRIGGER IF EXISTS set_chat_messages_updated_at ON chat_messages;
CREATE TRIGGER set_chat_messages_updated_at
BEFORE UPDATE ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION trigger_set_updated_at();

CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created
ON chat_messages(room_id, created_at DESC);

COMMIT;