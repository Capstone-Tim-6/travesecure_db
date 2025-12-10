/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.addConstraint('reviews', 'reviews_user_id_destination_id_key', {
    unique: ['user_id', 'destination_id']
  });
};

exports.down = pgm => {
  pgm.dropConstraint('reviews', 'reviews_user_id_destination_id_key');
};