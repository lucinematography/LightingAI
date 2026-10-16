-- Included only by staging-step20-migrate.psql on the separately approved test database.
-- Never run on production. Runtime is not permitted to create this schema.
CREATE SCHEMA lightingai_stage17;
REVOKE ALL ON SCHEMA lightingai_stage17 FROM PUBLIC;
CREATE TABLE lightingai_stage17.ai_test_attempt (
  test_id text PRIMARY KEY CHECK (test_id ~ '^[A-Za-z0-9_-]{8,100}$'),
  payload_sha256 text NOT NULL CHECK (payload_sha256 ~ '^[a-f0-9]{64}$'),
  state text NOT NULL DEFAULT 'approved' CHECK (state IN ('approved','spent')),
  approved_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  spent_at timestamptz,
  CHECK ((state = 'approved' AND spent_at IS NULL) OR (state = 'spent' AND spent_at IS NOT NULL))
);
CREATE FUNCTION lightingai_stage17.prevent_rearm() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.state <> 'approved' OR NEW.state <> 'spent'
     OR NEW.test_id IS DISTINCT FROM OLD.test_id
     OR NEW.payload_sha256 IS DISTINCT FROM OLD.payload_sha256
     OR NEW.approved_at IS DISTINCT FROM OLD.approved_at
     OR NEW.spent_at IS NULL THEN
    RAISE EXCEPTION 'Attempt is immutable except approved -> spent';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER ai_attempt_no_rearm BEFORE UPDATE ON lightingai_stage17.ai_test_attempt
FOR EACH ROW EXECUTE FUNCTION lightingai_stage17.prevent_rearm();
REVOKE ALL ON lightingai_stage17.ai_test_attempt FROM PUBLIC;
REVOKE ALL ON FUNCTION lightingai_stage17.prevent_rearm() FROM PUBLIC;

CREATE TABLE lightingai_stage17.schema_migration (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT clock_timestamp());
INSERT INTO lightingai_stage17.schema_migration (version) VALUES ('step20-v1');
