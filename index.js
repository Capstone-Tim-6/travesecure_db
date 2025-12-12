console.log("INDEX.JS MULAI DIJALANKAN..."); // debug

require('dotenv').config();
const app = require('./src/app');

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`SERVER BERHASIL JALAN DI PORT ${port}`);
});
