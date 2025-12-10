const pool = require('../config/db');

const getSecurityFactorsByDestinationId = async (req, res) => {
  const { id } = req.params;
  try {
    const securityFactors = await pool.query(
      `SELECT sf.*
       FROM security_factors sf
       JOIN destination_security_factors dsf ON sf.factor_id = dsf.factor_id
       WHERE dsf.destination_id = $1`,
      [id]
    );
    res.json(securityFactors.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const addSecurityFactorToDestination = async (req, res) => {
  const { id, factor_id } = req.params;
  try {
    await pool.query(
      'INSERT INTO destination_security_factors (destination_id, factor_id) VALUES ($1, $2)',
      [id, factor_id]
    );
    res.status(201).json({ message: 'Security factor added to destination successfully.' });
  } catch (err) {
    console.error(err.message);
    if (err.code === '23505') { // Unique violation
      return res.status(409).json({ message: 'Security factor already exists for this destination.' });
    }
    res.status(500).send('Server error');
  }
};

const removeSecurityFactorFromDestination = async (req, res) => {
  const { id, factor_id } = req.params;
  try {
    await pool.query(
      'DELETE FROM destination_security_factors WHERE destination_id = $1 AND factor_id = $2',
      [id, factor_id]
    );
    res.json({ message: 'Security factor removed from destination successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getSecurityFactorsByDestinationId,
  addSecurityFactorToDestination,
  removeSecurityFactorFromDestination,
};