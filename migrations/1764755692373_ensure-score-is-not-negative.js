/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_avg_security_score()
    RETURNS TRIGGER AS $$
    DECLARE
      dest_id INT;
    BEGIN
      IF (TG_OP = 'DELETE') THEN
        dest_id := OLD.destination_id;
      ELSE
        dest_id := NEW.destination_id;
      END IF;

      UPDATE destinations
      SET avg_security_score = GREATEST(
        0,
        COALESCE((SELECT AVG(security_rating) FROM reviews WHERE destination_id = dest_id), 0) -
        COALESCE((SELECT AVG(incident_rating) FROM incidents WHERE destination_id = dest_id), 0)
      )
      WHERE destination_id = dest_id;

      IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
      ELSE
        RETURN NEW;
      END IF;
    END;
    $$ LANGUAGE plpgsql;
  `);
};

exports.down = pgm => {
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_avg_security_score()
    RETURNS TRIGGER AS $$
    DECLARE
      dest_id INT;
    BEGIN
      IF (TG_OP = 'DELETE') THEN
        dest_id := OLD.destination_id;
      ELSE
        dest_id := NEW.destination_id;
      END IF;

      UPDATE destinations
      SET avg_security_score = (
        COALESCE((SELECT AVG(security_rating) FROM reviews WHERE destination_id = dest_id), 0) -
        COALESCE((SELECT AVG(incident_rating) FROM incidents WHERE destination_id = dest_id), 0)
      )
      WHERE destination_id = dest_id;

      IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
      ELSE
        RETURN NEW;
      END IF;
    END;
    $$ LANGUAGE plpgsql;
  `);
};