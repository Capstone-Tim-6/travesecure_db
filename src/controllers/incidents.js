const pool = require('../config/db');
const { sendNotifications } = require('../utils/notifications');

const createIncident = async (req, res) => {
  const { userId } = req.user;
  const {
    destination_id,
    incident_type,
    severity_level,
    affected_area,
    detail_description,
    incident_date,
    incident_rating,
  } = req.body;
  
  const media_url = req.file ? req.file.path : null;
  const media_type = req.file ? (req.file.mimetype.startsWith('image') ? 'Photo' : 'Video') : null;

  try {
    await pool.query('BEGIN');

    const newIncidentResult = await pool.query(
      'INSERT INTO incidents (user_id, destination_id, incident_type, severity_level, affected_area, detail_description, incident_date, incident_rating) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [userId, destination_id, incident_type, severity_level, affected_area, detail_description, incident_date, incident_rating]
    );

    const newIncident = newIncidentResult.rows[0];
    const incidentId = newIncident.incident_id;

    if (media_url) {
      await pool.query(
        'INSERT INTO incident_media (incident_id, media_url, media_type) VALUES ($1, $2, $3)',
        [incidentId, media_url, media_type]
      );
    }

    await pool.query('COMMIT');

    // Send notifications in the background, don't block the response
    sendNotifications(newIncident.incident_type, newIncident.destination_id);

    res.status(201).json(newIncident);
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const updateIncident = async (req, res) => {
  const { id } = req.params;
  const {
    destination_id,
    incident_type,
    severity_level,
    affected_area,
    detail_description,
    incident_date,
    incident_rating,
    is_verified,
  } = req.body;

  try {
    const updatedIncidentResult = await pool.query(
      'UPDATE incidents SET destination_id = $1, incident_type = $2, severity_level = $3, affected_area = $4, detail_description = $5, incident_date = $6, incident_rating = $7, is_verified = $8 WHERE incident_id = $9 RETURNING *',
      [destination_id, incident_type, severity_level, affected_area, detail_description, incident_date, incident_rating, is_verified, id]
    );

    if (updatedIncidentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    
    const updatedIncident = updatedIncidentResult.rows[0];

    // Send notifications in the background, don't block the response
    sendNotifications(updatedIncident.incident_type, updatedIncident.destination_id);

    res.json(updatedIncident);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const deleteIncident = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteOp = await pool.query('DELETE FROM incidents WHERE incident_id = $1 RETURNING *', [id]);
    if (deleteOp.rowCount === 0) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    res.json({ message: 'Incident deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const getIncidentById = async (req, res) => {
  const { id } = req.params;
  try {
    const incident = await pool.query('SELECT * FROM incidents WHERE incident_id = $1', [id]);
    if (incident.rows.length === 0) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    res.json(incident.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const getAllIncidents = async (req, res) => {
  const { incident_type, affected_area, severity_level } = req.query;
  let query = 'SELECT * FROM incidents';
  const params = [];
  const conditions = [];

  if (incident_type) {
    params.push(incident_type);
    conditions.push(`incident_type = $${params.length}`);
  }
  if (affected_area) {
    params.push(affected_area);
    conditions.push(`affected_area = $${params.length}`);
  }
  if (severity_level) {
    params.push(severity_level);
    conditions.push(`severity_level = $${params.length}`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  try {
    const allIncidents = await pool.query(query, params);
    res.json(allIncidents.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const getIncidentsByDestination = async (req, res) => {
  const { id } = req.params;
  const { incident_type, affected_area, severity_level } = req.query;
  
  let query = 'SELECT * FROM incidents WHERE destination_id = $1';
  const params = [id];
  const conditions = [];

  if (incident_type) {
    params.push(incident_type);
    conditions.push(`incident_type = $${params.length}`);
  }
  if (affected_area) {
    params.push(affected_area);
    conditions.push(`affected_area = $${params.length}`);
  }
  if (severity_level) {
    params.push(severity_level);
    conditions.push(`severity_level = $${params.length}`);
  }

  if (conditions.length > 0) {
    query += ' AND ' + conditions.join(' AND ');
  }

  try {
    const incidents = await pool.query(query, params);
    res.json(incidents.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  createIncident,
  updateIncident,
  deleteIncident,
  getIncidentById,
  getAllIncidents,
  getIncidentsByDestination,
};
