-- =====================================================
-- TRIGGERS
-- =====================================================

-- Updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_places_updated_at ON places;
CREATE TRIGGER update_places_updated_at 
    BEFORE UPDATE ON places 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
CREATE TRIGGER update_questions_updated_at 
    BEFORE UPDATE ON questions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stories_updated_at ON stories;
CREATE TRIGGER update_stories_updated_at 
    BEFORE UPDATE ON stories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_traces_updated_at ON traces;
CREATE TRIGGER update_traces_updated_at 
    BEFORE UPDATE ON traces 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_story_votes_updated_at ON story_votes;
CREATE TRIGGER update_story_votes_updated_at 
    BEFORE UPDATE ON story_votes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vote count triggers
DROP TRIGGER IF EXISTS update_story_votes_trigger ON story_votes;
CREATE TRIGGER update_story_votes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON story_votes
    FOR EACH ROW EXECUTE FUNCTION update_story_vote_counts();

-- Moderation logging triggers
DROP TRIGGER IF EXISTS log_story_moderation ON stories;
CREATE TRIGGER log_story_moderation
    AFTER UPDATE ON stories
    FOR EACH ROW EXECUTE FUNCTION log_moderation_action();

DROP TRIGGER IF EXISTS log_trace_moderation ON traces;
CREATE TRIGGER log_trace_moderation
    AFTER UPDATE ON traces
    FOR EACH ROW EXECUTE FUNCTION log_moderation_action();
