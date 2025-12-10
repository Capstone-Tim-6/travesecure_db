const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const transporter = require('../config/nodemailer');

const generateOtp = () => {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
};

const signUp = async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      'INSERT INTO users (first_name, last_name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING *',
      [first_name, last_name, email, hashedPassword]
    );
    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const logIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);

    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.rows[0].user_id, role: user.rows[0].role }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (user.rows.length > 0) {
      const otp = generateOtp();
      const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
      const tokenExpiry = Date.now() + 600000; // 10 minutes

      await pool.query(
        'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3',
        [hashedOtp, new Date(tokenExpiry), email]
      );

      const mailOptions = {
        to: user.rows[0].email,
        from: process.env.NODEMAILER_USER,
        subject: 'Your Password Reset OTP',
        text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
               Your One-Time Password (OTP) is: ${otp}\n\n
               This OTP is valid for 10 minutes.\n\n
               If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      };

      await transporter.sendMail(mailOptions);
    }

    res.json({ message: 'If a user with that email exists, a password reset OTP has been sent.' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND reset_password_token = $2 AND reset_password_expires > NOW()',
      [email, hashedOtp]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'OTP is invalid or has expired.' });
    }

    res.json({ message: 'OTP verified successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;

  try {
    // Re-verify OTP to ensure this request is legitimate
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND reset_password_token = $2 AND reset_password_expires > NOW()',
      [email, hashedOtp]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'OTP is invalid or has expired. Please try again.' });
    }

    const user = userResult.rows[0];
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'UPDATE users SET password_hash = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE user_id = $2',
      [hashedPassword, user.user_id]
    );

    res.json({ message: 'Password has been reset successfully.' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


module.exports = {
  signUp,
  logIn,
  forgotPassword,
  verifyOtp,
  resetPassword,
};
