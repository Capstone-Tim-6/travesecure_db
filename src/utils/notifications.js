const pool = require('../config/db');
const transporter = require('../config/nodemailer');

const sendNotifications = async (incident_type, destination_id) => {
  try {
    const destinationResult = await pool.query('SELECT surabaya_area FROM destinations WHERE destination_id = $1', [destination_id]);
    if (destinationResult.rows.length === 0) {
      return; // Destination not found
    }
    const { surabaya_area } = destinationResult.rows[0];

    const subscribersResult = await pool.query(
      `SELECT u.email FROM users u
       JOIN notification_subscriptions ns ON u.user_id = ns.user_id
       WHERE ns.surabaya_area = $1 AND ns.incident_type = $2`,
      [surabaya_area, incident_type]
    );

    if (subscribersResult.rows.length > 0) {
      const subject = `New Incident Alert: ${incident_type} in ${surabaya_area}`;
      const text = `A new incident of type "${incident_type}" has been reported in the ${surabaya_area} area. Please log in to TravSecure for more details.`;
      
      const mailOptions = {
        from: process.env.NODEMAILER_USER,
        subject: subject,
        text: text,
      };

      for (const subscriber of subscribersResult.rows) {
        transporter.sendMail({ ...mailOptions, to: subscriber.email }).catch(err => console.error(`Failed to send email to ${subscriber.email}`, err));
      }
    }
  } catch (err) {
    console.error('Error sending notifications:', err.message);
  }
};

module.exports = {
  sendNotifications,
};
