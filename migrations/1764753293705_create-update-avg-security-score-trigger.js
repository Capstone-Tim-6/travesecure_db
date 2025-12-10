/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.sql(`
    CREATE FUNCTION update_avg_security_score()
    RETURNS TRIGGER AS $$
    BEGIN
      UPDATE destinations
      SET avg_security_score = (
        (
          COALESCE((SELECT AVG(security_rating) FROM reviews WHERE destination_id = NEW.destination_id), 0) +
          COALESCE((SELECT AVG(incident_rating) FROM incidents WHERE destination_id = NEW.destination_id), 0)
        ) /
        (
          CASE
            WHEN (SELECT COUNT(*) FROM reviews WHERE destination_id = NEW.destination_id) > 0 AND
                 (SELECT COUNT(*) FROM incidents WHERE destination_id = NEW.destination_id) > 0 THEN 2
            WHEN (SELECT COUNT(*) FROM reviews WHERE destination_id = NEW.destination_id) > 0 OR
                 (SELECT COUNT(*) FROM incidents WHERE destination_id = NEW.destination_id) > 0 THEN 1
            ELSE 1
          END
        )
      )
      WHERE destination_id = NEW.destination_id;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  pgm.createTrigger('reviews', 'on_new_review', {
    when: 'AFTER',
    operation: 'INSERT',
    function: 'update_avg_security_score',
  });

  pgm.createTrigger('reviews', 'on_update_review', {
    when: 'AFTER',
    operation: 'UPDATE',
    function: 'update_avg_security_score',
  });

  pgm.createTrigger('incidents', 'on_new_incident', {
    when: 'AFTER',
    operation: 'INSERT',
    function: 'update_avg_security_score',
  });

  pgm.createTrigger('incidents', 'on_update_incident', {
    when: 'AFTER',
    operation: 'UPDATE',
    function: 'update_avg_security_score',
  });
};

exports.down = pgm => {
  pgm.dropTrigger('reviews', 'on_new_review');
  pgm.dropTrigger('reviews', 'on_update_review');
  pgm.dropTrigger('incidents', 'on_new_incident');
  pgm.dropTrigger('incidents', 'on_update_incident');
  pgm.dropFunction('update_avg_security_score');
};