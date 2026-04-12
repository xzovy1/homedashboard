const { Router } = require("express");
const mealsController = require("../controllers/mealController");
const upcomingMealsController = require("../controllers/upcomingMealsController");

const router = Router();

// Meals
router.get("/meals", mealsController.getAllMeals);
router.get("/meals/:id", mealsController.getMealById);
router.post("/meals", mealsController.createMeal);
router.put("/meals/:id", mealsController.updateMeal);
router.delete("/meals/:id", mealsController.deleteMeal);

// Upcoming Meals
router.get("/upcoming-meals", upcomingMealsController.getAllUpcomingMeals);
router.get("/upcoming-meals/:id", upcomingMealsController.getUpcomingMealById);
router.post("/upcoming-meals", upcomingMealsController.createUpcomingMeal);
router.put("/upcoming-meals/:id", upcomingMealsController.updateUpcomingMeal);
router.delete(
  "/upcoming-meals/:id",
  upcomingMealsController.deleteUpcomingMeal,
);

module.exports = router;
