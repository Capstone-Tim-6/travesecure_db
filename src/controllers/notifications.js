const pool = require('../config/db');

const subscribe = async (req, res) => {
  const { userId } = req.user; // Assuming auth middleware adds user to req
  const { surabaya_area, incident_type } = req.body;

  if (!surabaya_area || !incident_type) {
    return res.status(400).json({ message: 'surabaya_area and incident_type are required.' });
  }

  try {
    const newSubscription = await pool.query(
      'INSERT INTO notification_subscriptions (user_id, surabaya_area, incident_type) VALUES ($1, $2, $3) RETURNING *',
      [userId, surabaya_area, incident_type]
    );
    res.status(201).json(newSubscription.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Unique constraint violation
      return res.status(409).json({ message: 'You are already subscribed to this notification.' });
    }
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  subscribe,
};
