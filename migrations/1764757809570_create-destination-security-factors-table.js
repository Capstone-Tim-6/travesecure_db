/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // 1. Create the new join table
  pgm.createTable('destination_security_factors', {
    destination_id: {
      type: 'integer',
      notNull: true,
      references: '"destinations"',
      onDelete: 'cascade',
    },
    factor_id: {
      type: 'integer',
      notNull: true,
      references: '"security_factors"',
      onDelete: 'cascade',
    },
  });

  // 2. Add a primary key to the join table
  pgm.addConstraint('destination_security_factors', 'destination_security_factors_pkey', {
    primaryKey: ['destination_id', 'factor_id'],
  });

  // 3. Remove the old foreign key column from security_factors
  pgm.dropColumn('security_factors', 'destination_id');
};

exports.down = pgm => {
  // 1. Add the old column back to security_factors
  pgm.addColumn('security_factors', 'destination_id', {
    type: 'integer',
    references: '"destinations"',
    onDelete: 'cascade',
  });

  // 2. Drop the join table
  pgm.dropTable('destination_security_factors');
};