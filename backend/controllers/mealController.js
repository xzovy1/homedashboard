const db = require("../db/queries/mealQueries"); // adjust path as needed

const getAllMeals = async (req, res) => {
  try {
    const meals = await db.getAllMeals();
    res.status(200).json(meals);
  } catch (err) {
    console.error("getAllMeals error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMealById = async (req, res) => {
  const { id } = req.params;
  try {
    const meal = await db.getMealById(id);
    if (!meal) return res.status(404).json({ error: "Meal not found" });
    res.status(200).json(meal);
  } catch (err) {
    console.error("getMealById error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createMeal = async (req, res) => {
  const { name, ingredients } = req.body;
  if (!name) {
    return res.status(400).json({ error: "name and ingredients are required" });
  }
  try {
    const meal = await db.createMeal(name);
    res.status(201).json(meal);
  } catch (err) {
    if (err.code === "23505")
      return res
        .status(409)
        .json({ error: "A meal with that name or ingredient already exists" });
    if (err.code === "23503")
      return res.status(400).json({ error: "Referenced item does not exist" });
    console.error("createMeal error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateMeal = async (req, res) => {
  const { id } = req.params;
  const { name, ingredients } = req.body;
  if (!name && !ingredients) {
    return res
      .status(400)
      .json({ error: "At least one field (name, ingredients) is required" });
  }
  try {
    const meal = await db.updateMeal(id, { name, ingredients });
    if (!meal) return res.status(404).json({ error: "Meal not found" });
    res.status(200).json(meal);
  } catch (err) {
    if (err.code === "23505")
      return res
        .status(409)
        .json({ error: "A meal with that name or ingredient already exists" });
    if (err.code === "23503")
      return res.status(400).json({ error: "Referenced item does not exist" });
    console.error("updateMeal error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteMeal = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await db.deleteMeal(id);
    if (!deleted) return res.status(404).json({ error: "Meal not found" });
    res.status(200).json({ message: "Meal deleted", deleted });
  } catch (err) {
    console.error("deleteMeal error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllMeals,
  getMealById,
  createMeal,
  updateMeal,
  deleteMeal,
};
