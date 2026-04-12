const express = require("express");
const todoRouter = express.Router();
const todoController = require("../controllers/todoController");

todoRouter.get("/tasks", todoController.getAllTasks);
todoRouter.post("/tasks", todoController.createTask);
todoRouter.delete("/tasks/:id", todoController.deleteTask);

module.exports = todoRouter;
