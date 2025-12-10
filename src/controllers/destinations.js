const pool = require('../config/db');
const { sendNotifications } = require('../utils/notifications');

const getAllDestinations = async (req, res) => {
  const { search, incident_type, affected_area, severity_level } = req.query;

  let params = [];
  let conditions = [];
  
  // Subquery to filter incidents
  let incidentFilterConditions = [];
  if (incident_type) {
    params.push(incident_type);
    incidentFilterConditions.push(`i.incident_type = $${params.length}`);
  }
  if (affected_area) {
    params.push(affected_area);
    incidentFilterConditions.push(`i.affected_area = $${params.length}`);
  }
  if (severity_level) {
    params.push(severity_level);
    incidentFilterConditions.push(`i.severity_level = $${params.length}`);
  }
  
  // Main destination search
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(d.name ILIKE $${params.length} OR d.surabaya_area ILIKE $${params.length})`);
  }

  // If there are incident filters, we need to ensure we only get destinations that have matching incidents
  if (incidentFilterConditions.length > 0) {
    conditions.push(`d.destination_id IN (SELECT destination_id FROM incidents i WHERE ${incidentFilterConditions.join(' AND ')})`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT 
      d.*,
      COALESCE(
        (SELECT json_agg(inc)
         FROM (
           SELECT i.* FROM incidents i
           WHERE i.destination_id = d.destination_id
           ${incidentFilterConditions.length > 0 ? 'AND ' + incidentFilterConditions.join(' AND ') : ''}
         ) AS inc
        ), '[]'::json
      ) AS incidents,
      COALESCE(
        (SELECT json_agg(rev)
         FROM (
           SELECT r.* FROM reviews r
           WHERE r.destination_id = d.destination_id
         ) AS rev
        ), '[]'::json
      ) AS reviews,
      COALESCE(
        (SELECT json_agg(gal)
         FROM (
           SELECT g.* FROM gallery g
           WHERE g.destination_id = d.destination_id
         ) AS gal
        ), '[]'::json
      ) AS gallery,
      GREATEST(
        0,
        COALESCE((SELECT AVG(r.security_rating) FROM reviews r WHERE r.destination_id = d.destination_id), 0) -
        COALESCE((SELECT AVG(i.incident_rating) FROM incidents i WHERE i.destination_id = d.destination_id), 0)
      ) AS avg_security_score
    FROM 
      destinations d
    ${whereClause}
    GROUP BY 
      d.destination_id
  `;

  try {
    const allDestinations = await pool.query(query, params);
    res.json(allDestinations.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const getDestinationById = async (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT 
      d.*,
      COALESCE(
        (SELECT json_agg(inc)
         FROM (
           SELECT i.* FROM incidents i
           WHERE i.destination_id = d.destination_id
         ) AS inc
        ), '[]'::json
      ) AS incidents,
      COALESCE(
        (SELECT json_agg(rev)
         FROM (
           SELECT r.* FROM reviews r
           WHERE r.destination_id = d.destination_id
         ) AS rev
        ), '[]'::json
      ) AS reviews,
      COALESCE(
        (SELECT json_agg(gal)
         FROM (
           SELECT g.* FROM gallery g
           WHERE g.destination_id = d.destination_id
         ) AS gal
        ), '[]'::json
      ) AS gallery,
      GREATEST(
        0,
        COALESCE((SELECT AVG(r.security_rating) FROM reviews r WHERE r.destination_id = d.destination_id), 0) -
        COALESCE((SELECT AVG(i.incident_rating) FROM incidents i WHERE i.destination_id = d.destination_id), 0)
      ) AS avg_security_score
    FROM 
      destinations d
    WHERE d.destination_id = $1
    GROUP BY 
      d.destination_id
  `;
  try {
    const destination = await pool.query(query, [id]);
    if (destination.rows.length === 0) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    res.json(destination.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const createDestination = async (req, res) => {
  const { userId } = req.user;
  const { name, address, description, coordinate_lat, coordinate_lon, surabaya_area, incidents } = req.body;
  const galleryFiles = req.files;
  
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const newDestinationResult = await client.query(
      'INSERT INTO destinations (name, address, description, coordinate_lat, coordinate_lon, surabaya_area) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, address, description, coordinate_lat, coordinate_lon, surabaya_area]
    );
    const destinationId = newDestinationResult.rows[0].destination_id;

    if (galleryFiles && galleryFiles.length > 0) {
      for (const file of galleryFiles) {
        const media_url = file.path;
        const media_type = file.mimetype.startsWith('image') ? 'Photo' : 'Video';
        await client.query(
          'INSERT INTO gallery (destination_id, media_url, media_type) VALUES ($1, $2, $3)',
          [destinationId, media_url, media_type]
        );
      }
    }

    const createdIncidentsInfo = [];
    if (incidents) {
      const incidentObjects = JSON.parse(incidents);
      if (Array.isArray(incidentObjects)) {
        for (const incident of incidentObjects) {
          const { incident_type, severity_level, affected_area, detail_description, incident_date, incident_rating } = incident;
          const newIncidentResult = await client.query(
            'INSERT INTO incidents (user_id, destination_id, incident_type, severity_level, affected_area, detail_description, incident_date, incident_rating) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING incident_type, destination_id',
            [userId, destinationId, incident_type, severity_level, affected_area, detail_description, incident_date, incident_rating]
          );
          createdIncidentsInfo.push(newIncidentResult.rows[0]);
        }
      }
    }

    const finalQuery = `
      SELECT 
        d.*,
        COALESCE((SELECT json_agg(inc) FROM (SELECT i.* FROM incidents i WHERE i.destination_id = d.destination_id) AS inc), '[]'::json) AS incidents,
        COALESCE((SELECT json_agg(gal) FROM (SELECT g.* FROM gallery g WHERE g.destination_id = d.destination_id) AS gal), '[]'::json) AS gallery
      FROM 
        destinations d
      WHERE d.destination_id = $1
      GROUP BY d.destination_id
    `;
    const finalDestinationResult = await client.query(finalQuery, [destinationId]);
    const responseData = finalDestinationResult.rows[0];

    await client.query('COMMIT');
    
    // Send notifications after commit
    for (const info of createdIncidentsInfo) {
      sendNotifications(info.incident_type, info.destination_id);
    }

    res.status(201).json(responseData);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server error');
  } finally {
    client.release();
  }
};

const updateDestination = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.user;
  const { name, address, description, coordinate_lat, coordinate_lon, surabaya_area, incidents } = req.body;
  const galleryFiles = req.files;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const updatedDestinationResult = await client.query(
      'UPDATE destinations SET name = $1, address = $2, description = $3, coordinate_lat = $4, coordinate_lon = $5, surabaya_area = $6 WHERE destination_id = $7 RETURNING *',
      [name, address, description, coordinate_lat, coordinate_lon, surabaya_area, id]
    );

    if (updatedDestinationResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Destination not found' });
    }

    if (galleryFiles && galleryFiles.length > 0) {
      for (const file of galleryFiles) {
        const media_url = file.path;
        const media_type = file.mimetype.startsWith('image') ? 'Photo' : 'Video';
        await client.query(
          'INSERT INTO gallery (destination_id, media_url, media_type) VALUES ($1, $2, $3)',
          [id, media_url, media_type]
        );
      }
    }

    const createdIncidentsInfo = [];
    if (incidents) {
      const incidentObjects = JSON.parse(incidents);
      if (Array.isArray(incidentObjects)) {
        for (const incident of incidentObjects) {
          const { incident_type, severity_level, affected_area, detail_description, incident_date, incident_rating } = incident;
          const newIncidentResult = await client.query(
            'INSERT INTO incidents (user_id, destination_id, incident_type, severity_level, affected_area, detail_description, incident_date, incident_rating) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING incident_type, destination_id',
            [userId, id, incident_type, severity_level, affected_area, detail_description, incident_date, incident_rating]
          );
          createdIncidentsInfo.push(newIncidentResult.rows[0]);
        }
      }
    }

    const finalQuery = `
      SELECT 
        d.*,
        COALESCE((SELECT json_agg(inc) FROM (SELECT i.* FROM incidents i WHERE i.destination_id = d.destination_id) AS inc), '[]'::json) AS incidents,
        COALESCE((SELECT json_agg(gal) FROM (SELECT g.* FROM gallery g WHERE g.destination_id = d.destination_id) AS gal), '[]'::json) AS gallery
      FROM 
        destinations d
      WHERE d.destination_id = $1
      GROUP BY d.destination_id
    `;
    const finalDestinationResult = await client.query(finalQuery, [id]);
    const responseData = finalDestinationResult.rows[0];

    await client.query('COMMIT');

    // Send notifications after commit
    for (const info of createdIncidentsInfo) {
      sendNotifications(info.incident_type, info.destination_id);
    }

    res.json(responseData);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server error');
  } finally {
    client.release();
  }
};

const deleteDestination = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteOp = await pool.query('DELETE FROM destinations WHERE destination_id = $1 RETURNING *', [id]);
    if (deleteOp.rowCount === 0) {
      return res.status(404).json({ message: 'Destination not found' });
    }
    res.json({ message: 'Destination deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getAllDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
};
