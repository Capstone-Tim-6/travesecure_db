const pool = require('../config/db');

const createReview = async (req, res) => {
  const { userId } = req.user;
  const { destination_id } = req.params;
  const { security_rating, comment, is_like } = req.body;

  try {
    const existingReview = await pool.query(
      'SELECT * FROM reviews WHERE user_id = $1 AND destination_id = $2',
      [userId, destination_id]
    );

    if (existingReview.rows.length > 0) {
      return res.status(409).json({ message: 'You have already reviewed this destination.' });
    }

    const newReview = await pool.query(
      'INSERT INTO reviews (user_id, destination_id, security_rating, comment, is_like) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, destination_id, security_rating, comment, is_like]
    );
    res.status(201).json(newReview.rows[0]);
  } catch (err) {
    console.error(err.message);
    if (err.code === '23505') { // Unique violation
      return res.status(409).json({ message: 'You have already reviewed this destination.' });
    }
    res.status(500).send('Server error');
  }
};

const getReviewsByDestination = async (req, res) => {
  const { destination_id } = req.params;
  try {
    const reviews = await pool.query('SELECT * FROM reviews WHERE destination_id = $1', [destination_id]);
    res.json(reviews.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  createReview,
  getReviewsByDestination,
};
