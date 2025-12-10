/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('users', {
    user_id: 'id',
    first_name: { type: 'varchar(50)', notNull: true },
    last_name: { type: 'varchar(50)' },
    email: { type: 'varchar(100)', notNull: true, unique: true },
    password_hash: { type: 'varchar(255)', notNull: true },
    registration_date: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    is_active: { type: 'boolean', default: true },
  });

  pgm.createTable('destinations', {
    destination_id: 'id',
    name: { type: 'varchar(100)', notNull: true },
    address: { type: 'text' },
    description: { type: 'text' },
    coordinate_lat: { type: 'decimal(10, 7)' },
    coordinate_lon: { type: 'decimal(10, 7)' },
    surabaya_area: { type: 'varchar(50)' },
    avg_security_score: { type: 'decimal(3, 2)' },
  });

  pgm.createTable('security_factors', {
    factor_id: 'id',
    destination_id: {
      type: 'integer',
      notNull: true,
      references: '"destinations"',
      onDelete: 'cascade',
    },
    factor_type: { type: 'varchar(50)' },
    risk_level: { type: 'varchar(50)' },
    factor_description: { type: 'text' },
    updated_date: { type: 'date' },
  });

  pgm.createTable('incidents', {
    incident_id: 'id',
    user_id: {
      type: 'integer',
      references: '"users"',
      onDelete: 'cascade',
    },
    destination_id: {
      type: 'integer',
      references: '"destinations"',
      onDelete: 'cascade',
    },
    incident_type: { type: 'varchar(50)' },
    severity_level: { type: 'varchar(50)' },
    affected_area: { type: 'varchar(50)' },
    detail_description: { type: 'text' },
    incident_date: { type: 'timestamp' },
    report_date: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    is_verified: { type: 'boolean', default: false },
  });

  pgm.createTable('incident_media', {
    media_id: 'id',
    incident_id: {
      type: 'integer',
      notNull: true,
      references: '"incidents"',
      onDelete: 'cascade',
    },
    media_url: { type: 'varchar(255)' },
    media_type: { type: 'varchar(50)' },
  });

  pgm.createTable('reviews', {
    review_id: 'id',
    user_id: {
      type: 'integer',
      notNull: true,
      references: '"users"',
      onDelete: 'cascade',
    },
    destination_id: {
      type: 'integer',
      notNull: true,
      references: '"destinations"',
      onDelete: 'cascade',
    },
    security_rating: { type: 'integer' },
    comment: { type: 'text' },
    is_like: { type: 'boolean' },
    review_date: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createTable('gallery', {
    gallery_id: 'id',
    destination_id: {
      type: 'integer',
      notNull: true,
      references: '"destinations"',
      onDelete: 'cascade',
    },
    media_url: { type: 'varchar(255)' },
    media_type: { type: 'varchar(50)' },
    timestamp: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = pgm => {
  pgm.dropTable('gallery');
  pgm.dropTable('reviews');
  pgm.dropTable('incident_media');
  pgm.dropTable('incidents');
  pgm.dropTable('security_factors');
  pgm.dropTable('destinations');
  pgm.dropTable('users');
};
