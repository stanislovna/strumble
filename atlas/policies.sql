-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE trace_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PUBLIC READ POLICIES (anyone can view approved content)
-- =====================================================

-- Places are public
CREATE POLICY "Anyone can view places" ON places
FOR SELECT USING (true);

-- Questions are public
CREATE POLICY "Anyone can view questions" ON questions
FOR SELECT USING (true);

-- Approved stories are public
CREATE POLICY "Anyone can view approved stories" ON stories
FOR SELECT USING (status = 'approved');

-- Story-place links for approved stories
CREATE POLICY "Anyone can view story-place links" ON story_places
FOR SELECT USING (
  story_id IN (SELECT id FROM stories WHERE status = 'approved')
);

-- Approved traces are public
CREATE POLICY "Anyone can view approved traces" ON traces
FOR SELECT USING (status = 'approved');

-- Trace-place links for approved traces
CREATE POLICY "Anyone can view trace-place links" ON trace_places
FOR SELECT USING (
  trace_id IN (SELECT id FROM traces WHERE status = 'approved')
);

-- Poll responses are public
CREATE POLICY "Anyone can view poll responses" ON poll_responses
FOR SELECT USING (true);

-- =====================================================
-- SUBMISSION POLICIES (anyone can submit, pending approval)
-- =====================================================

-- Anyone can submit stories
CREATE POLICY "Anyone can submit stories" ON stories
FOR INSERT WITH CHECK (status = 'pending');

-- Anyone can link their submitted story to places
CREATE POLICY "Anyone can link stories to places" ON story_places
FOR INSERT WITH CHECK (true);

-- Anyone can submit traces
CREATE POLICY "Anyone can submit traces" ON traces
FOR INSERT WITH CHECK (status = 'pending');

-- Anyone can link their submitted trace to places
CREATE POLICY "Anyone can link traces to places" ON trace_places
FOR INSERT WITH CHECK (true);

-- Anyone can submit poll responses
CREATE POLICY "Anyone can submit poll responses" ON poll_responses
FOR INSERT WITH CHECK (true);

-- =====================================================
-- VOTING POLICIES
-- =====================================================

-- Authenticated users can vote
CREATE POLICY "Authenticated users can vote" ON story_votes
FOR INSERT TO authenticated
WITH CHECK (true);

-- Users can view all votes
CREATE POLICY "Anyone can view votes" ON story_votes
FOR SELECT USING (true);

-- Users can update their own votes
CREATE POLICY "Users can update their own votes" ON story_votes
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "Users can delete their own votes" ON story_votes
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- =====================================================
-- MODERATOR POLICIES
-- =====================================================

-- Moderators can see all stories
CREATE POLICY "Moderators can see all stories" ON stories
FOR SELECT TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role IN ('moderator', 'admin')
  )
);

-- Moderators can update stories (approve/reject/claim)
CREATE POLICY "Moderators can update stories" ON stories
FOR UPDATE TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role IN ('moderator', 'admin')
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM users WHERE role IN ('moderator', 'admin')
  )
);

-- Moderators can see all traces
CREATE POLICY "Moderators can see all traces" ON traces
FOR SELECT TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role IN ('moderator', 'admin')
  )
);

-- Moderators can update traces
CREATE POLICY "Moderators can update traces" ON traces
FOR UPDATE TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role IN ('moderator', 'admin')
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM users WHERE role IN ('moderator', 'admin')
  )
);

-- Moderators can view moderation log
CREATE POLICY "Moderators can view moderation log" ON moderation_log
FOR SELECT TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role IN ('moderator', 'admin')
  )
);

-- =====================================================
-- ADMIN POLICIES
-- =====================================================

-- Admins can manage users
CREATE POLICY "Admins can view all users" ON users
FOR SELECT TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can update users" ON users
FOR UPDATE TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM users WHERE role = 'admin'
  )
);

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
FOR SELECT TO authenticated
USING (auth.uid() = id);
