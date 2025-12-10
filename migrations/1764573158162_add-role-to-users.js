/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.addColumns('users', {
    role: { type: 'varchar(50)', notNull: true, default: 'user' }
  });
};

exports.down = pgm => {
  pgm.dropColumns('users', ['role']);
};