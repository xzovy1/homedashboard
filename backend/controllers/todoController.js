const db = require("../db/queries/todoQueries.js");

const todoController = {};

todoController.createTask = async (req, res) => {
  const { title, priority, details } = req.body;
  let dueDate;
  if (!req.body.dueDate) {
    dueDate = null;
  } else {
    dueDate = req.body.dueDate;
  }
  const createdTask = await db.createTask(title, priority, dueDate, details);
  res.status(200).json(createdTask);
};

todoController.deleteTask = async (req, res) => {
  const { id } = req.params;
  await db.deleteTask(id);
  res.status(200).json(id);
};

todoController.getAllTasks = async (req, res) => {
  const tasks = await db.getAllTasks();
  res.status(200).json(tasks);
};

module.exports = todoController;
