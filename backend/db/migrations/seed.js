#! /usr/bin/env node
//this file is only meant to be run once to populate the db.

const { Client } = require("pg");
require("dotenv").config();

const fs = require("node:fs");
const path = require("node:path");
const grocerySeed = fs.readFileSync(
  path.join(__dirname, "../migrations/grocerySeed.sql"),
  { encoding: "utf-8" },
);
const sensorSeed = fs.readFileSync(
  path.join(__dirname, "../migrations/sensorSeed.sql"),
  { encoding: "utf-8" },
);

const todoSeed = fs.readFileSync(
  path.join(__dirname, "../migrations/todoSeed.sql"),
  { encoding: "utf-8" },
);

const Seed = async () => {
  const client = new Client({
    connectionString: databaseUrl,
  });
  await client.connect();
  await client.query(grocerySeed);
  await client.query(todoSeed);
  await client.query(sensorSeed);
  await client.end();
};

const databaseUrl =
  process.env.NODE_ENV === "test"
    ? process.env.TEST_DB_URL
    : process.env.DATABASE_URL;
async function main() {
  console.log(process.env.NODE_ENV);
  console.log("seeding...");
  await seed();
  console.log("done");
}

main();
