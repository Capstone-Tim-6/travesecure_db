const pool = require('../config/db');

const addGalleryItem = async (req, res) => {
  const { destination_id } = req.params;
  const media_url = req.file ? req.file.path : null;
  const media_type = req.file ? (req.file.mimetype.startsWith('image') ? 'Photo' : 'Video') : null;

  if (!media_url) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  try {
    const newGalleryItem = await pool.query(
      'INSERT INTO gallery (destination_id, media_url, media_type) VALUES ($1, $2, $3) RETURNING *',
      [destination_id, media_url, media_type]
    );
    res.status(201).json(newGalleryItem.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const getGalleryForDestination = async (req, res) => {
  const { destination_id } = req.params;
  try {
    const gallery = await pool.query('SELECT * FROM gallery WHERE destination_id = $1', [destination_id]);
    res.json(gallery.rows);
  } catch (err)
    {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const deleteGalleryItem = async (req, res) => {
  const { gallery_id } = req.params;
  try {
    const deleteOp = await pool.query('DELETE FROM gallery WHERE gallery_id = $1 RETURNING *', [gallery_id]);
    if (deleteOp.rowCount === 0) {
      return res.status(404).json({ message: 'Gallery item not found' });
    }
    res.json({ message: 'Gallery item deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  addGalleryItem,
  getGalleryForDestination,
  deleteGalleryItem,
};
