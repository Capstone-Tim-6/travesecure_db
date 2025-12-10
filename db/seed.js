const pool = require("../src/config/db");
const bcrypt = require("bcrypt");

const seed = async () => {
  try {
    // Clear existing data
    await pool.query("DELETE FROM gallery");
    await pool.query("DELETE FROM reviews");
    await pool.query("DELETE FROM incident_media");
    await pool.query("DELETE FROM incidents");
    await pool.query("DELETE FROM destination_security_factors");
    await pool.query("DELETE FROM security_factors");
    await pool.query("DELETE FROM destinations");
    await pool.query("DELETE FROM users");

    // Seed users
    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10);

    const admin = await pool.query(
      "INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES ('Admin', 'User', 'admin@travsecure.com', $1, 'admin') RETURNING user_id",
      [adminPassword]
    );
    const user = await pool.query(
      "INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES ('Regular', 'User', 'user@travsecure.com', $1, 'user') RETURNING user_id",
      [userPassword]
    );
    const adminId = admin.rows[0].user_id;
    const userId = user.rows[0].user_id;

    // Seed destinations
    const dest1 = await pool.query(
      "INSERT INTO destinations (name, address, description, coordinate_lat, coordinate_lon, surabaya_area) VALUES ('Taman Bungkul', 'Jl. Taman Bungkul, Darmo, Kec. Wonokromo', 'Taman kota yang populer di Surabaya', -7.289, 112.739, 'Surabaya Pusat') RETURNING destination_id"
    );
    const dest2 = await pool.query(
      "INSERT INTO destinations (name, address, description, coordinate_lat, coordinate_lon, surabaya_area) VALUES ('Kenjeran Park', 'Jl. Raya Pantai Lama, Kenjeran', 'Taman hiburan dengan pemandangan laut', -7.25, 112.79, 'Surabaya Timur') RETURNING destination_id"
    );
    const dest1Id = dest1.rows[0].destination_id;
    const dest2Id = dest2.rows[0].destination_id;

    // Seed security factors
    const factor1 = await pool.query(
      "INSERT INTO security_factors (factor_type, risk_level, factor_description) VALUES ('Insiden Kriminal', 'Rendah', 'Area ini umumnya aman dengan patroli rutin.') RETURNING factor_id"
    );
    const factor2 = await pool.query(
      "INSERT INTO security_factors (factor_type, risk_level, factor_description) VALUES ('Bencana Alam', 'Rendah', 'Risiko banjir rendah.') RETURNING factor_id"
    );
    const factor3 = await pool.query(
      "INSERT INTO security_factors (factor_type, risk_level, factor_description) VALUES ('Insiden Kriminal', 'Sedang', 'Waspada terhadap pencopetan di area ramai.') RETURNING factor_id"
    );
    const factor1Id = factor1.rows[0].factor_id;
    const factor2Id = factor2.rows[0].factor_id;
    const factor3Id = factor3.rows[0].factor_id;

    await pool.query(
      "INSERT INTO destination_security_factors (destination_id, factor_id) VALUES ($1, $2)",
      [dest1Id, factor1Id]
    );
    await pool.query(
      "INSERT INTO destination_security_factors (destination_id, factor_id) VALUES ($1, $2)",
      [dest1Id, factor2Id]
    );
    await pool.query(
      "INSERT INTO destination_security_factors (destination_id, factor_id) VALUES ($1, $2)",
      [dest2Id, factor3Id]
    );

    // Seed incidents
    await pool.query(
      "INSERT INTO incidents (user_id, destination_id, incident_type, severity_level, affected_area, detail_description, incident_date) VALUES ($1, $2, 'Pencopetan', 'Sedang', 'Area Patung Buddha', 'Dompet hilang saat berfoto', '2025-11-20 15:00:00')",
      [userId, dest2Id]
    );

    // Seed reviews
    await pool.query(
      "INSERT INTO reviews (user_id, destination_id, security_rating, comment, is_like) VALUES ($1, $2, 3, 'Tempatnya bagus, tapi harus lebih waspada.', true)",
      [userId, dest2Id]
    );
    await pool.query(
      "INSERT INTO reviews (user_id, destination_id, security_rating, comment, is_like) VALUES ($1, $2, 5, 'Sangat menikmati waktu di sini, aman dan nyaman.', true)",
      [adminId, dest1Id]
    );

    console.log("Database seeded successfully");
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    pool.end();
  }
};

seed();
