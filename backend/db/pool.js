const { Pool } = require("pg");
require("dotenv").config();

// const databaseUrl =
//   process.env.NODE_ENV === "test"
//     ? process.env.TEST_DB_URL
//     : process.env.DB_URL;
module.exports = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
