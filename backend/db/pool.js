const { Pool } = require("pg");
require("dotenv").config();

const testPool = new Pool({
  port: process.env.TEST_DB_PORT,
  user: process.env.TEST_DB_USER,
  password: process.env.TEST_DB_PASSWORD,
  database: process.env.TEST_DB_NAME,
});

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports =
  process.env.NODE_ENV === "test" || process.env.NODE_ENV === "dev"
    ? testPool
    : pool;
