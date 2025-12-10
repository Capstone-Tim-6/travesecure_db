/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.addColumns('incidents', {
    incident_rating: { type: 'integer' }
  });
};

exports.down = pgm => {
  pgm.dropColumns('incidents', ['incident_rating']);
};