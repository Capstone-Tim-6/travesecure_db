const pool = require('../config/db');

const getAllSecurityFactors = async (req, res) => {
  try {
    const allSecurityFactors = await pool.query('SELECT * FROM security_factors');
    res.json(allSecurityFactors.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const getSecurityFactorById = async (req, res) => {
  const { id } = req.params;
  try {
    const securityFactor = await pool.query('SELECT * FROM security_factors WHERE factor_id = $1', [id]);
    if (securityFactor.rows.length === 0) {
      return res.status(404).json({ message: 'Security factor not found' });
    }
    res.json(securityFactor.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const createSecurityFactor = async (req, res) => {
  const { factor_type, risk_level, factor_description } = req.body;
  try {
    const newSecurityFactor = await pool.query(
      'INSERT INTO security_factors (factor_type, risk_level, factor_description, updated_date) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [factor_type, risk_level, factor_description]
    );
    res.status(201).json(newSecurityFactor.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const updateSecurityFactor = async (req, res) => {
  const { id } = req.params;
  const { factor_type, risk_level, factor_description } = req.body;
  try {
    const updatedSecurityFactor = await pool.query(
      'UPDATE security_factors SET factor_type = $1, risk_level = $2, factor_description = $3, updated_date = NOW() WHERE factor_id = $4 RETURNING *',
      [factor_type, risk_level, factor_description, id]
    );
    if (updatedSecurityFactor.rows.length === 0) {
      return res.status(404).json({ message: 'Security factor not found' });
    }
    res.json(updatedSecurityFactor.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const deleteSecurityFactor = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteOp = await pool.query('DELETE FROM security_factors WHERE factor_id = $1 RETURNING *', [id]);
    if (deleteOp.rowCount === 0) {
      return res.status(404).json({ message: 'Security factor not found' });
    }
    res.json({ message: 'Security factor deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getAllSecurityFactors,
  getSecurityFactorById,
  createSecurityFactor,
  updateSecurityFactor,
  deleteSecurityFactor,
};
