const pool = require("../pool");

const getAllUpcomingMeals = async () => {
  const result = await pool.query(`
    SELECT um.id, um.dish, m.name AS meal_name, m.ingredients
    FROM upcoming_meals um
    JOIN meals m ON um.dish = m.id
    ORDER BY um.id ASC
  `);
  return result.rows;
};

const getUpcomingMealById = async (id) => {
  const result = await pool.query(
    `SELECT um.id, um.dish, m.name AS meal_name, m.ingredients
     FROM upcoming_meals um
     JOIN meals m ON um.dish = m.id
     WHERE um.id = $1`,
    [id],
  );
  return result.rows[0] || null;
};

const createUpcomingMeal = async (dish) => {
  const result = await pool.query(
    "INSERT INTO upcoming_meals (dish) VALUES ($1) RETURNING *",
    [dish],
  );
  return result.rows[0];
};

const updateUpcomingMeal = async (id, dish) => {
  const result = await pool.query(
    "UPDATE upcoming_meals SET dish = $1 WHERE id = $2 RETURNING *",
    [dish, id],
  );
  return result.rows[0] || null;
};

const deleteUpcomingMeal = async (id) => {
  const result = await pool.query(
    "DELETE FROM upcoming_meals WHERE id = $1 RETURNING *",
    [id],
  );
  return result.rows[0] || null;
};

module.exports = {
  getAllUpcomingMeals,
  getUpcomingMealById,
  createUpcomingMeal,
  updateUpcomingMeal,
  deleteUpcomingMeal,
};
