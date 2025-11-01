-- =====================================================
-- EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
CREATE TYPE content_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE story_tag AS ENUM (
    'Funny', 
    'Sad', 
    'Inspirational', 
    'Everyday', 
    'Shocking', 
    'Moving', 
    'Weird', 
    'Nostalgic'
);
CREATE TYPE poll_user_role AS ENUM ('local', 'traveler');
CREATE TYPE gender AS ENUM ('female', 'male', 'other', 'prefer_not_to_say');
CREATE TYPE duration_unit AS ENUM ('days', 'months', 'years');

-- =====================================================
-- TABLES
-- =====================================================

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Places
CREATE TABLE places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    country VARCHAR(100),
    continent VARCHAR(50),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_latitude CHECK (lat >= -90 AND lat <= 90),
    CONSTRAINT valid_longitude CHECK (lng >= -180 AND lng <= 180)
);

CREATE INDEX idx_places_slug ON places(slug);
CREATE INDEX idx_places_country ON places(country);
CREATE INDEX idx_places_continent ON places(continent);

-- Questions
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) DEFAULT 'story' CHECK (question_type IN ('story', 'poi')),
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_type_active ON questions(question_type, is_active);

-- Stories
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    submitter_email VARCHAR(255),
    question_id INTEGER REFERENCES questions(id) ON DELETE SET NULL,
    answer_text TEXT NOT NULL,
    tags story_tag[] DEFAULT '{}',
    photos TEXT[] DEFAULT '{}',
    audio_url TEXT,
    upvotes_count INTEGER DEFAULT 0 CHECK (upvotes_count >= 0),
    downvotes_count INTEGER DEFAULT 0 CHECK (downvotes_count >= 0),
    votes_score INTEGER DEFAULT 0,
    status content_status DEFAULT 'pending',
    claimed_by_moderator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    claimed_at TIMESTAMPTZ,
    moderated_by_moderator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    moderated_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMPTZ,
    
    CONSTRAINT max_photos CHECK (array_length(photos, 1) <= 3),
    CONSTRAINT answer_not_empty CHECK (char_length(trim(answer_text)) > 0)
);

CREATE INDEX idx_stories_status ON stories(status);
CREATE INDEX idx_stories_user_id ON stories(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_stories_question_id ON stories(question_id);
CREATE INDEX idx_stories_claimed_by ON stories(claimed_by_moderator_id) WHERE claimed_by_moderator_id IS NOT NULL;
CREATE INDEX idx_stories_created_at ON stories(created_at DESC);
CREATE INDEX idx_stories_published_at ON stories(published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX idx_stories_votes_score ON stories(votes_score DESC);
CREATE INDEX idx_stories_tags ON stories USING GIN(tags);
CREATE INDEX idx_stories_pending_unclaimed ON stories(created_at) 
    WHERE status = 'pending' AND claimed_by_moderator_id IS NULL;

-- Story-Place relationship
CREATE TABLE story_places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(story_id, place_id)
);

CREATE INDEX idx_story_places_story_id ON story_places(story_id);
CREATE INDEX idx_story_places_place_id ON story_places(place_id);

-- Story votes
CREATE TABLE story_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    value SMALLINT NOT NULL CHECK (value IN (-1, 1)),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(story_id, user_id)
);

CREATE INDEX idx_story_votes_story_id ON story_votes(story_id);
CREATE INDEX idx_story_votes_user_id ON story_votes(user_id);

-- Traces
CREATE TABLE traces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    submitter_email VARCHAR(255),
    url TEXT NOT NULL,
    og_title TEXT,
    og_description TEXT,
    og_image_url TEXT,
    source_domain VARCHAR(255),
    user_note TEXT,
    status content_status DEFAULT 'pending',
    claimed_by_moderator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    claimed_at TIMESTAMPTZ,
    moderated_by_moderator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    moderated_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMPTZ
);

CREATE INDEX idx_traces_status ON traces(status);
CREATE INDEX idx_traces_user_id ON traces(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_traces_claimed_by ON traces(claimed_by_moderator_id) WHERE claimed_by_moderator_id IS NOT NULL;
CREATE INDEX idx_traces_created_at ON traces(created_at DESC);
CREATE INDEX idx_traces_published_at ON traces(published_at DESC) WHERE published_at IS NOT NULL;
CREATE INDEX idx_traces_source_domain ON traces(source_domain);
CREATE INDEX idx_traces_pending_unclaimed ON traces(created_at) 
    WHERE status = 'pending' AND claimed_by_moderator_id IS NULL;

-- Trace-Place relationship
CREATE TABLE trace_places (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trace_id UUID NOT NULL REFERENCES traces(id) ON DELETE CASCADE,
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(trace_id, place_id)
);

CREATE INDEX idx_trace_places_trace_id ON trace_places(trace_id);
CREATE INDEX idx_trace_places_place_id ON trace_places(place_id);

-- Poll responses
CREATE TABLE poll_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_role poll_user_role NOT NULL,
    gender gender,
    duration_value INTEGER,
    duration_unit duration_unit,
    excitement INTEGER CHECK (excitement BETWEEN 1 AND 7),
    helpfulness INTEGER CHECK (helpfulness BETWEEN 1 AND 7),
    safety INTEGER CHECK (safety BETWEEN 1 AND 7),
    english_proficiency INTEGER CHECK (english_proficiency BETWEEN 1 AND 7),
    best_month INTEGER CHECK (best_month BETWEEN 1 AND 12),
    openness INTEGER CHECK (openness BETWEEN 1 AND 7),
    tradition_modern INTEGER CHECK (tradition_modern BETWEEN 1 AND 7),
    pace INTEGER CHECK (pace BETWEEN 1 AND 7),
    individualism_community INTEGER CHECK (individualism_community BETWEEN 1 AND 7),
    hospitality INTEGER CHECK (hospitality BETWEEN 1 AND 7),
    equality_hierarchy INTEGER CHECK (equality_hierarchy BETWEEN 1 AND 7),
    religiosity INTEGER CHECK (religiosity BETWEEN 1 AND 7),
    trust INTEGER CHECK (trust BETWEEN 1 AND 7),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_duration CHECK (
        (duration_value IS NULL AND duration_unit IS NULL) OR
        (duration_value IS NOT NULL AND duration_unit IS NOT NULL AND duration_value > 0)
    )
);

CREATE INDEX idx_poll_responses_place_id ON poll_responses(place_id);
CREATE INDEX idx_poll_responses_user_role ON poll_responses(user_role);
CREATE INDEX idx_poll_responses_gender ON poll_responses(gender);
CREATE INDEX idx_poll_responses_created_at ON poll_responses(created_at DESC);

-- Moderation log
CREATE TABLE moderation_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('story', 'trace')),
    content_id UUID NOT NULL,
    moderator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('claimed', 'released', 'approved', 'rejected')),
    content_snapshot JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_moderation_log_content ON moderation_log(content_type, content_id);
CREATE INDEX idx_moderation_log_moderator_id ON moderation_log(moderator_id);
CREATE INDEX idx_moderation_log_created_at ON moderation_log(created_at DESC);
CREATE INDEX idx_moderation_log_action ON moderation_log(action);
