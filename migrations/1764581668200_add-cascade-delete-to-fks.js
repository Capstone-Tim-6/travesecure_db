/* eslint-disable camelcase */

exports.shorthands = undefined;

const tables = ['gallery', 'reviews', 'incidents', 'security_factors'];

exports.up = pgm => {
  tables.forEach(table => {
    // Drop the existing constraint if it exists
    // The default constraint name is ${tableName}_${columnName}_fkey
    pgm.dropConstraint(table, `${table}_destination_id_fkey`, { ifExists: true });

    // Add the constraint back with ON DELETE CASCADE
    pgm.addConstraint(table, `${table}_destination_id_fkey`, {
      foreignKeys: {
        columns: 'destination_id',
        references: 'destinations(destination_id)',
        onDelete: 'CASCADE',
      },
    });
  });
};

exports.down = pgm => {
  tables.forEach(table => {
    pgm.dropConstraint(table, `${table}_destination_id_fkey`, { ifExists: true });

    // Revert to the (potentially incorrect) previous state without cascade
    pgm.addConstraint(table, `${table}_destination_id_fkey`, {
      foreignKeys: {
        columns: 'destination_id',
        references: 'destinations(destination_id)',
      },
    });
  });
};