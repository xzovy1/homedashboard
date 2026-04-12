const pool = require("../pool");

const getAllMeals = async () => {
  const result = await pool.query("SELECT * FROM meals ORDER BY id ASC");
  return result.rows;
};

const getMealById = async (id) => {
  const result = await pool.query("SELECT * FROM meals WHERE id = $1", [id]);
  return result.rows[0] || null;
};

const createMeal = async (name, ingredients) => {
  const result = await pool.query(
    "INSERT INTO meals (name, ingredients) VALUES ($1, $2) RETURNING *",
    [name, ingredients],
  );
  return result.rows[0];
};

const updateMeal = async (id, fields) => {
  const keys = [];
  const values = [];
  let idx = 1;
  if (fields.name) {
    keys.push(`name = $${idx++}`);
    values.push(fields.name);
  }
  if (fields.ingredients) {
    keys.push(`ingredients = $${idx++}`);
    values.push(fields.ingredients);
  }
  values.push(id);

  const result = await pool.query(
    `UPDATE meals SET ${keys.join(", ")} WHERE id = $${idx} RETURNING *`,
    values,
  );
  return result.rows[0] || null;
};

const deleteMeal = async (id) => {
  const result = await pool.query(
    "DELETE FROM meals WHERE id = $1 RETURNING *",
    [id],
  );
  return result.rows[0] || null;
};

module.exports = {
  getAllMeals,
  getMealById,
  createMeal,
  updateMeal,
  deleteMeal,
};
