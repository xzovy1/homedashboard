const pool = require("../pool");

exports.getAllTasks = async () => {
  const { rows } = await pool.query(
    "SELECT * FROM todo_list ORDER BY current_priority DESC",
  );
  return rows;
};

exports.createTask = async (title, priority, dueDate, details) => {
  const { rows } = await pool.query(
    "INSERT INTO todo_list (title, current_priority, due_date, details) VALUES ($1, $2, $3, $4) RETURNING *",
    [title, priority, dueDate, details],
  );
  return rows[0];
};

exports.deleteTask = async (id) => {
  const { rows } = await pool.query("DELETE FROM todo_list WHERE id = $1", [
    id,
  ]);
  return rows[0];
};
