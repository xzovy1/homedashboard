const pool = require("../pool");

const test = async () => {
  const { rows } = await pool.query("SELECT * FROM categories");
  console.log(rows);
  return rows;
};

const main = async () => {
  test();
};

main();
