#! /usr/bin/env node
//this file is only meant to be run once ,, to populate the db.

const { Client } = require("pg");
require("dotenv").config();

const fs = require("node:fs");
const path = require("node:path");
const grocerySQLFilePath = path.join(
  __dirname,
  "../migrations/grocerySeed.sql",
);
const grocerySeed = fs.readFileSync(grocerySQLFilePath, { encoding: "utf-8" });

const todoSQLFilePath = path.join(__dirname, "../migrations/todoSeed.sql");
const todoSeed = fs.readFileSync(todoSQLFilePath, { encoding: "utf-8" });

const createDummyItems = async (num = 20) => {
  const client = new Client({
    connectionString: databaseUrl,
  });
  await client.connect();
  for (let index = 0; index < num; index++) {
    const randomNumber = () => Math.floor(Math.random() * 10) + 1;
    await client.query(`INSERT INTO items (name, category) VALUES ($1,  $2)`, [
      `test item ${index}`,
      randomNumber(),
    ]);
  }
  await client.end();
};

const seedGroceries = async () => {
  const client = new Client({
    connectionString: databaseUrl,
  });
  await client.connect();
  await client.query(grocerySeed);
  await client.end();
};
const seedTodo = async () => {
  const client = new Client({
    connectionString: databaseUrl,
  });
  await client.connect();
  await client.query(todoSeed);
  await client.end();
};

const databaseUrl =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_DB_URL
    : process.env.DATABASE_URL;
async function main() {
  console.log(process.env.NODE_ENV);
  console.log("seeding...");
  await seedGroceries();
  await seedTodo();
  console.log("done");
}

main();
