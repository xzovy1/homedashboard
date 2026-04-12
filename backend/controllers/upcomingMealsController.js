const db = require("../db/queries/upcomingMealsQueries");

const getAllUpcomingMeals = async (req, res) => {
  try {
    const meals = await db.getAllUpcomingMeals();
    res.status(200).json(meals);
  } catch (err) {
    console.error("getAllUpcomingMeals error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUpcomingMealById = async (req, res) => {
  const { id } = req.params;
  try {
    const meal = await db.getUpcomingMealById(id);
    if (!meal)
      return res.status(404).json({ error: "Upcoming meal not found" });
    res.status(200).json(meal);
  } catch (err) {
    console.error("getUpcomingMealById error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createUpcomingMeal = async (req, res) => {
  const { dish } = req.body;
  if (!dish)
    return res.status(400).json({ error: "dish (meal id) is required" });
  try {
    const meal = await db.createUpcomingMeal(dish);
    res.status(201).json(meal);
  } catch (err) {
    if (err.code === "23505")
      return res
        .status(409)
        .json({ error: "This meal is already scheduled as an upcoming meal" });
    if (err.code === "23503")
      return res.status(400).json({ error: "Referenced meal does not exist" });
    console.error("createUpcomingMeal error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateUpcomingMeal = async (req, res) => {
  const { id } = req.params;
  const { dish } = req.body;
  if (!dish)
    return res.status(400).json({ error: "dish (meal id) is required" });
  try {
    const meal = await db.updateUpcomingMeal(id, dish);
    if (!meal)
      return res.status(404).json({ error: "Upcoming meal not found" });
    res.status(200).json(meal);
  } catch (err) {
    if (err.code === "23505")
      return res
        .status(409)
        .json({ error: "This meal is already scheduled as an upcoming meal" });
    if (err.code === "23503")
      return res.status(400).json({ error: "Referenced meal does not exist" });
    console.error("updateUpcomingMeal error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteUpcomingMeal = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await db.deleteUpcomingMeal(id);
    if (!deleted)
      return res.status(404).json({ error: "Upcoming meal not found" });
    res.status(200).json({ message: "Upcoming meal removed", deleted });
  } catch (err) {
    console.error("deleteUpcomingMeal error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getAllUpcomingMeals,
  getUpcomingMealById,
  createUpcomingMeal,
  updateUpcomingMeal,
  deleteUpcomingMeal,
};
