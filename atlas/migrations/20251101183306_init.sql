-- Create enum type "user_role"
CREATE TYPE "user_role" AS ENUM ('user', 'moderator', 'admin');
-- Create "users" table
CREATE TABLE "users" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "username" character varying(100) NULL,
  "email" character varying(255) NULL,
  "avatar_url" text NULL,
  "role" "user_role" NULL DEFAULT 'user',
  "first_name" character varying(100) NULL,
  "last_name" character varying(100) NULL,
  "created_at" timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
  "is_active" boolean NULL DEFAULT true,
  PRIMARY KEY ("id"),
  CONSTRAINT "users_email_key" UNIQUE ("email")
);
-- Create index "idx_users_email" to table: "users"
CREATE INDEX "idx_users_email" ON "users" ("email");
-- Create index "idx_users_role" to table: "users"
CREATE INDEX "idx_users_role" ON "users" ("role");
-- Create enum type "content_status"
CREATE TYPE "content_status" AS ENUM ('pending', 'approved', 'rejected');
-- Create enum type "story_tag"
CREATE TYPE "story_tag" AS ENUM ('Funny', 'Sad', 'Inspirational', 'Everyday', 'Shocking', 'Moving', 'Weird', 'Nostalgic');
-- Create enum type "poll_user_role"
CREATE TYPE "poll_user_role" AS ENUM ('local', 'traveler');
-- Create enum type "gender"
CREATE TYPE "gender" AS ENUM ('female', 'male', 'other', 'prefer_not_to_say');
-- Create enum type "duration_unit"
CREATE TYPE "duration_unit" AS ENUM ('days', 'months', 'years');
-- Create "moderation_log" table
CREATE TABLE "moderation_log" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "content_type" character varying(20) NOT NULL,
  "content_id" uuid NOT NULL,
  "moderator_id" uuid NULL,
  "action" character varying(20) NOT NULL,
  "content_snapshot" jsonb NULL,
  "notes" text NULL,
  "created_at" timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  CONSTRAINT "moderation_log_moderator_id_fkey" FOREIGN KEY ("moderator_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE SET NULL,
  CONSTRAINT "moderation_log_action_check" CHECK ((action)::text = ANY ((ARRAY['claimed'::character varying, 'released'::character varying, 'approved'::character varying, 'rejected'::character varying])::text[])),
  CONSTRAINT "moderation_log_content_type_check" CHECK ((content_type)::text = ANY ((ARRAY['story'::character varying, 'trace'::character varying])::text[]))
);
-- Create index "idx_moderation_log_action" to table: "moderation_log"
CREATE INDEX "idx_moderation_log_action" ON "moderation_log" ("action");
-- Create index "idx_moderation_log_content" to table: "moderation_log"
CREATE INDEX "idx_moderation_log_content" ON "moderation_log" ("content_type", "content_id");
-- Create index "idx_moderation_log_created_at" to table: "moderation_log"
CREATE INDEX "idx_moderation_log_created_at" ON "moderation_log" ("created_at" DESC);
-- Create index "idx_moderation_log_moderator_id" to table: "moderation_log"
CREATE INDEX "idx_moderation_log_moderator_id" ON "moderation_log" ("moderator_id");
-- Create "places" table
CREATE TABLE "places" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "name" character varying(255) NOT NULL,
  "lat" numeric(10,8) NOT NULL,
  "lng" numeric(11,8) NOT NULL,
  "slug" character varying(255) NOT NULL,
  "country" character varying(100) NULL,
  "continent" character varying(50) NULL,
  "description" text NULL,
  "created_at" timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  CONSTRAINT "places_slug_key" UNIQUE ("slug"),
  CONSTRAINT "valid_latitude" CHECK ((lat >= ('-90'::integer)::numeric) AND (lat <= (90)::numeric)),
  CONSTRAINT "valid_longitude" CHECK ((lng >= ('-180'::integer)::numeric) AND (lng <= (180)::numeric))
);
-- Create index "idx_places_continent" to table: "places"
CREATE INDEX "idx_places_continent" ON "places" ("continent");
-- Create index "idx_places_country" to table: "places"
CREATE INDEX "idx_places_country" ON "places" ("country");
-- Create index "idx_places_slug" to table: "places"
CREATE INDEX "idx_places_slug" ON "places" ("slug");
-- Create "poll_responses" table
CREATE TABLE "poll_responses" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "place_id" uuid NOT NULL,
  "user_id" uuid NULL,
  "user_role" "poll_user_role" NOT NULL,
  "gender" "gender" NULL,
  "duration_value" integer NULL,
  "duration_unit" "duration_unit" NULL,
  "excitement" integer NULL,
  "helpfulness" integer NULL,
  "safety" integer NULL,
  "english_proficiency" integer NULL,
  "best_month" integer NULL,
  "openness" integer NULL,
  "tradition_modern" integer NULL,
  "pace" integer NULL,
  "individualism_community" integer NULL,
  "hospitality" integer NULL,
  "equality_hierarchy" integer NULL,
  "religiosity" integer NULL,
  "trust" integer NULL,
  "created_at" timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  CONSTRAINT "poll_responses_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places" ("id") ON UPDATE NO ACTION ON DELETE CASCADE,
  CONSTRAINT "poll_responses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE SET NULL,
  CONSTRAINT "poll_responses_best_month_check" CHECK ((best_month >= 1) AND (best_month <= 12)),
  CONSTRAINT "poll_responses_english_proficiency_check" CHECK ((english_proficiency >= 1) AND (english_proficiency <= 7)),
  CONSTRAINT "poll_responses_equality_hierarchy_check" CHECK ((equality_hierarchy >= 1) AND (equality_hierarchy <= 7)),
  CONSTRAINT "poll_responses_excitement_check" CHECK ((excitement >= 1) AND (excitement <= 7)),
  CONSTRAINT "poll_responses_helpfulness_check" CHECK ((helpfulness >= 1) AND (helpfulness <= 7)),
  CONSTRAINT "poll_responses_hospitality_check" CHECK ((hospitality >= 1) AND (hospitality <= 7)),
  CONSTRAINT "poll_responses_individualism_community_check" CHECK ((individualism_community >= 1) AND (individualism_community <= 7)),
  CONSTRAINT "poll_responses_openness_check" CHECK ((openness >= 1) AND (openness <= 7)),
  CONSTRAINT "poll_responses_pace_check" CHECK ((pace >= 1) AND (pace <= 7)),
  CONSTRAINT "poll_responses_religiosity_check" CHECK ((religiosity >= 1) AND (religiosity <= 7)),
  CONSTRAINT "poll_responses_safety_check" CHECK ((safety >= 1) AND (safety <= 7)),
  CONSTRAINT "poll_responses_tradition_modern_check" CHECK ((tradition_modern >= 1) AND (tradition_modern <= 7)),
  CONSTRAINT "poll_responses_trust_check" CHECK ((trust >= 1) AND (trust <= 7)),
  CONSTRAINT "valid_duration" CHECK (((duration_value IS NULL) AND (duration_unit IS NULL)) OR ((duration_value IS NOT NULL) AND (duration_unit IS NOT NULL) AND (duration_value > 0)))
);
-- Create index "idx_poll_responses_created_at" to table: "poll_responses"
CREATE INDEX "idx_poll_responses_created_at" ON "poll_responses" ("created_at" DESC);
-- Create index "idx_poll_responses_gender" to table: "poll_responses"
CREATE INDEX "idx_poll_responses_gender" ON "poll_responses" ("gender");
-- Create index "idx_poll_responses_place_id" to table: "poll_responses"
CREATE INDEX "idx_poll_responses_place_id" ON "poll_responses" ("place_id");
-- Create index "idx_poll_responses_user_role" to table: "poll_responses"
CREATE INDEX "idx_poll_responses_user_role" ON "poll_responses" ("user_role");
-- Create "questions" table
CREATE TABLE "questions" (
  "id" serial NOT NULL,
  "question_text" text NOT NULL,
  "question_type" character varying(20) NULL DEFAULT 'story',
  "sort_order" integer NULL,
  "is_active" boolean NULL DEFAULT true,
  "created_at" timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  CONSTRAINT "questions_question_type_check" CHECK ((question_type)::text = ANY ((ARRAY['story'::character varying, 'poi'::character varying])::text[]))
);
-- Create index "idx_questions_type_active" to table: "questions"
CREATE INDEX "idx_questions_type_active" ON "questions" ("question_type", "is_active");
-- Create "stories" table
CREATE TABLE "stories" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "user_id" uuid NULL,
  "submitter_email" character varying(255) NULL,
  "question_id" integer NULL,
  "answer_text" text NOT NULL,
  "tags" "story_tag"[] NULL DEFAULT '{}',
  "photos" text[] NULL DEFAULT '{}',
  "audio_url" text NULL,
  "upvotes_count" integer NULL DEFAULT 0,
  "downvotes_count" integer NULL DEFAULT 0,
  "votes_score" integer NULL DEFAULT 0,
  "status" "content_status" NULL DEFAULT 'pending',
  "claimed_by_moderator_id" uuid NULL,
  "claimed_at" timestamptz NULL,
  "moderated_by_moderator_id" uuid NULL,
  "moderated_at" timestamptz NULL,
  "rejection_reason" text NULL,
  "created_at" timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
  "published_at" timestamptz NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "stories_claimed_by_moderator_id_fkey" FOREIGN KEY ("claimed_by_moderator_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE SET NULL,
  CONSTRAINT "stories_moderated_by_moderator_id_fkey" FOREIGN KEY ("moderated_by_moderator_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE SET NULL,
  CONSTRAINT "stories_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions" ("id") ON UPDATE NO ACTION ON DELETE SET NULL,
  CONSTRAINT "stories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE SET NULL,
  CONSTRAINT "answer_not_empty" CHECK (char_length(TRIM(BOTH FROM answer_text)) > 0),
  CONSTRAINT "max_photos" CHECK (array_length(photos, 1) <= 3),
  CONSTRAINT "stories_downvotes_count_check" CHECK (downvotes_count >= 0),
  CONSTRAINT "stories_upvotes_count_check" CHECK (upvotes_count >= 0)
);
-- Create index "idx_stories_claimed_by" to table: "stories"
CREATE INDEX "idx_stories_claimed_by" ON "stories" ("claimed_by_moderator_id") WHERE (claimed_by_moderator_id IS NOT NULL);
-- Create index "idx_stories_created_at" to table: "stories"
CREATE INDEX "idx_stories_created_at" ON "stories" ("created_at" DESC);
-- Create index "idx_stories_pending_unclaimed" to table: "stories"
CREATE INDEX "idx_stories_pending_unclaimed" ON "stories" ("created_at") WHERE ((status = 'pending'::content_status) AND (claimed_by_moderator_id IS NULL));
-- Create index "idx_stories_published_at" to table: "stories"
CREATE INDEX "idx_stories_published_at" ON "stories" ("published_at" DESC) WHERE (published_at IS NOT NULL);
-- Create index "idx_stories_question_id" to table: "stories"
CREATE INDEX "idx_stories_question_id" ON "stories" ("question_id");
-- Create index "idx_stories_status" to table: "stories"
CREATE INDEX "idx_stories_status" ON "stories" ("status");
-- Create index "idx_stories_tags" to table: "stories"
CREATE INDEX "idx_stories_tags" ON "stories" USING gin ("tags");
-- Create index "idx_stories_user_id" to table: "stories"
CREATE INDEX "idx_stories_user_id" ON "stories" ("user_id") WHERE (user_id IS NOT NULL);
-- Create index "idx_stories_votes_score" to table: "stories"
CREATE INDEX "idx_stories_votes_score" ON "stories" ("votes_score" DESC);
-- Create "story_places" table
CREATE TABLE "story_places" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "story_id" uuid NOT NULL,
  "place_id" uuid NOT NULL,
  "created_at" timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  CONSTRAINT "story_places_story_id_place_id_key" UNIQUE ("story_id", "place_id"),
  CONSTRAINT "story_places_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places" ("id") ON UPDATE NO ACTION ON DELETE CASCADE,
  CONSTRAINT "story_places_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "stories" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);
-- Create index "idx_story_places_place_id" to table: "story_places"
CREATE INDEX "idx_story_places_place_id" ON "story_places" ("place_id");
-- Create index "idx_story_places_story_id" to table: "story_places"
CREATE INDEX "idx_story_places_story_id" ON "story_places" ("story_id");
-- Create "story_votes" table
CREATE TABLE "story_votes" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "story_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "value" smallint NOT NULL,
  "created_at" timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  CONSTRAINT "story_votes_story_id_user_id_key" UNIQUE ("story_id", "user_id"),
  CONSTRAINT "story_votes_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "stories" ("id") ON UPDATE NO ACTION ON DELETE CASCADE,
  CONSTRAINT "story_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE CASCADE,
  CONSTRAINT "story_votes_value_check" CHECK (value = ANY (ARRAY['-1'::integer, 1]))
);
-- Create index "idx_story_votes_story_id" to table: "story_votes"
CREATE INDEX "idx_story_votes_story_id" ON "story_votes" ("story_id");
-- Create index "idx_story_votes_user_id" to table: "story_votes"
CREATE INDEX "idx_story_votes_user_id" ON "story_votes" ("user_id");
-- Create "traces" table
CREATE TABLE "traces" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "user_id" uuid NULL,
  "submitter_email" character varying(255) NULL,
  "url" text NOT NULL,
  "og_title" text NULL,
  "og_description" text NULL,
  "og_image_url" text NULL,
  "source_domain" character varying(255) NULL,
  "user_note" text NULL,
  "status" "content_status" NULL DEFAULT 'pending',
  "claimed_by_moderator_id" uuid NULL,
  "claimed_at" timestamptz NULL,
  "moderated_by_moderator_id" uuid NULL,
  "moderated_at" timestamptz NULL,
  "rejection_reason" text NULL,
  "created_at" timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
  "published_at" timestamptz NULL,
  PRIMARY KEY ("id"),
  CONSTRAINT "traces_claimed_by_moderator_id_fkey" FOREIGN KEY ("claimed_by_moderator_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE SET NULL,
  CONSTRAINT "traces_moderated_by_moderator_id_fkey" FOREIGN KEY ("moderated_by_moderator_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE SET NULL,
  CONSTRAINT "traces_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON UPDATE NO ACTION ON DELETE SET NULL
);
-- Create index "idx_traces_claimed_by" to table: "traces"
CREATE INDEX "idx_traces_claimed_by" ON "traces" ("claimed_by_moderator_id") WHERE (claimed_by_moderator_id IS NOT NULL);
-- Create index "idx_traces_created_at" to table: "traces"
CREATE INDEX "idx_traces_created_at" ON "traces" ("created_at" DESC);
-- Create index "idx_traces_pending_unclaimed" to table: "traces"
CREATE INDEX "idx_traces_pending_unclaimed" ON "traces" ("created_at") WHERE ((status = 'pending'::content_status) AND (claimed_by_moderator_id IS NULL));
-- Create index "idx_traces_published_at" to table: "traces"
CREATE INDEX "idx_traces_published_at" ON "traces" ("published_at" DESC) WHERE (published_at IS NOT NULL);
-- Create index "idx_traces_source_domain" to table: "traces"
CREATE INDEX "idx_traces_source_domain" ON "traces" ("source_domain");
-- Create index "idx_traces_status" to table: "traces"
CREATE INDEX "idx_traces_status" ON "traces" ("status");
-- Create index "idx_traces_user_id" to table: "traces"
CREATE INDEX "idx_traces_user_id" ON "traces" ("user_id") WHERE (user_id IS NOT NULL);
-- Create "trace_places" table
CREATE TABLE "trace_places" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "trace_id" uuid NOT NULL,
  "place_id" uuid NOT NULL,
  "created_at" timestamptz NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  CONSTRAINT "trace_places_trace_id_place_id_key" UNIQUE ("trace_id", "place_id"),
  CONSTRAINT "trace_places_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places" ("id") ON UPDATE NO ACTION ON DELETE CASCADE,
  CONSTRAINT "trace_places_trace_id_fkey" FOREIGN KEY ("trace_id") REFERENCES "traces" ("id") ON UPDATE NO ACTION ON DELETE CASCADE
);
-- Create index "idx_trace_places_place_id" to table: "trace_places"
CREATE INDEX "idx_trace_places_place_id" ON "trace_places" ("place_id");
-- Create index "idx_trace_places_trace_id" to table: "trace_places"
CREATE INDEX "idx_trace_places_trace_id" ON "trace_places" ("trace_id");
