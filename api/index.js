// api/index.js
const app = require('../src/app');

// Vercel butuh 1 fungsi sebagai export utama
module.exports = (req, res) => {
  return app(req, res);
};
export default function handler(req, res) {
  res.status(200).json({ message: "API Vercel Route Works!" });
}
