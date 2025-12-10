/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('notification_subscriptions', {
    subscription_id: 'id',
    user_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'cascade',
    },
    surabaya_area: { type: 'varchar(50)', notNull: true },
    incident_type: { type: 'varchar(50)', notNull: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.addConstraint('notification_subscriptions', 'notification_subscriptions_user_area_incident_key', {
    unique: ['user_id', 'surabaya_area', 'incident_type']
  });
};

exports.down = pgm => {
  pgm.dropTable('notification_subscriptions');
};