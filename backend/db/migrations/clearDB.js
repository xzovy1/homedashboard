#! /usr/bin/env node
//this file is only meant to be run once ,, to populate the db.

const { Client } = require("pg");
require("dotenv").config();

const GROCERYSQL = `
    DROP TABLE items CASCADE;
    DROP TABLE cart_items CASCADE;
    DROP TABLE shopping_list CASCADE;
    DROP TABLE categories CASCADE;
    DROP TABLE stores CASCADE;
    DROP TABLE item_history CASCADE;
    DROP TABLE upcoming_meals CASCADE;
    DROP TABLE meals CASCADE;
`;

const TODOSQL = `
  DROP TABLE todo_list;
`;
const databaseUrl =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_DB_URL
    : process.env.DB_URL;
async function main() {
  console.log(process.env.NODE_ENV);
  console.log("seeding...");
  const client = new Client({
    connectionString: databaseUrl,
  });
  await client.connect();
  console.log("connected...");
  await client.query(GROCERYSQL);
  await client.end();
  console.log("done");
}

main();
