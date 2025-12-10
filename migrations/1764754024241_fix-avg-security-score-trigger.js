/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Drop the old triggers and function
  pgm.dropTrigger('reviews', 'on_new_review');
  pgm.dropTrigger('reviews', 'on_update_review');
  pgm.dropTrigger('incidents', 'on_new_incident');
  pgm.dropTrigger('incidents', 'on_update_incident');
  pgm.dropFunction('update_avg_security_score');

  // Re-create the function and triggers correctly
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
        (
          COALESCE((SELECT AVG(security_rating) FROM reviews WHERE destination_id = dest_id), 0) +
          COALESCE((SELECT AVG(incident_rating) FROM incidents WHERE destination_id = dest_id), 0)
        ) /
        (
          CASE
            WHEN (SELECT COUNT(*) FROM reviews WHERE destination_id = dest_id) > 0 AND
                 (SELECT COUNT(*) FROM incidents WHERE destination_id = dest_id) > 0 THEN 2
            WHEN (SELECT COUNT(*) FROM reviews WHERE destination_id = dest_id) > 0 OR
                 (SELECT COUNT(*) FROM incidents WHERE destination_id = dest_id) > 0 THEN 1
            ELSE 1
          END
        )
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

  pgm.createTrigger('reviews', 'on_review_change', {
    when: 'AFTER',
    operation: ['INSERT', 'UPDATE', 'DELETE'],
    level: 'ROW',
    function: 'update_avg_security_score',
  });

  pgm.createTrigger('incidents', 'on_incident_change', {
    when: 'AFTER',
    operation: ['INSERT', 'UPDATE', 'DELETE'],
    level: 'ROW',
    function: 'update_avg_security_score',
  });
};

exports.down = pgm => {
  pgm.dropTrigger('reviews', 'on_review_change');
  pgm.dropTrigger('incidents', 'on_incident_change');
  pgm.dropFunction('update_avg_security_score');
};