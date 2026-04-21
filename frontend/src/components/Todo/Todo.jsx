import { useState, useEffect, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDeleteLeft,
  faPlus,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import todoClasses from "../../assets/views/Todo.module.css";
import heroClasses from "../../assets/views/Hero.module.css";

import ErrorComponent from "../Error";
import { AppContext } from "../../contexts/AppContext";
export const URL = import.meta.env.VITE_API_URL + "/todo";

const Todo = () => {
  const { tasks, setTasks } = useContext(AppContext);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch(URL + "/tasks")
      .then((response) => {
        if (response.status > 400) {
          throw new Error("server error");
        }
        return response.json();
      })
      .then((data) => {
        setTasks(data);
      })
      .catch((error) => setError(error));
  }, [setTasks]);

  if (error) {
    return <ErrorComponent error={error} />;
  }

  return (
    <>
      <Tasks tasks={tasks} setTasks={setTasks} />

      {/* Floating action button */}
      <button
        className={todoClasses.fab}
        onClick={() => setIsModalOpen(true)}
        aria-label="Add new task"
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div
          className={todoClasses.modalOverlay}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className={todoClasses.modal}>
            <div className={todoClasses.modalHeader}>
              <h2 className={todoClasses.modalTitle}>New Task</h2>
              <button
                className={todoClasses.modalClose}
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <NewTask
              tasks={tasks}
              setTasks={setTasks}
              onSuccess={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

const NewTask = ({ setTasks, tasks, onSuccess }) => {
  const addTask = async (formData) => {
    const plainObject = Object.fromEntries(formData.entries());
    const jsonString = JSON.stringify(plainObject);
    await fetch(URL + "/tasks", {
      method: "post",
      mode: "cors",
      body: jsonString,
      headers: { "content-type": "application/json" },
    })
      .then((response) => {
        if (response.status >= 400) {
          throw new Error("server error");
        }
        return response.json();
      })
      .then((response) => {
        setTasks([...tasks, { ...response }]);
        if (onSuccess) onSuccess();
      });
  };

  return (
    <form action={addTask} className={todoClasses.modalForm}>
      <div className={todoClasses.newTask}>
        <label htmlFor="taskItem">Task: </label>
        <input type="text" name="title" id="taskItem" required />

        <label htmlFor="priority">Priority: </label>
        <select name="priority" id="priority">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <label htmlFor="dueDate">Expires: </label>
        <input type="date" name="dueDate" id="dueDate" />

        <label htmlFor="details">Details: </label>
        <input type="text" name="details" id="details" />
      </div>
      <button className={todoClasses.button} type="submit">
        <FontAwesomeIcon icon={faPlus} /> Add Task
      </button>
    </form>
  );
};

const Tasks = ({ tasks, setTasks }) => {
  const removeItem = async (id) => {
    await fetch(URL + `/tasks/${id}`, {
      method: "delete",
      mode: "cors",
    })
      .then((response) => response.json())
      .then(() => setTasks(tasks.filter((i) => i.id != id)));
  };

  if (tasks.length > 0) {
    return (
      <div className={heroClasses.body}>
        {tasks.map((task) => (
          <TaskItem key={task.id} removeItem={removeItem} task={task} />
        ))}
      </div>
    );
  }
  return <div>No items in to-do list</div>;
};

const TaskItem = ({ task, removeItem }) => {
  return (
    <div className={todoClasses.todoItem}>
      <div className={todoClasses.todoInfo}>
        <div>{task.title}</div>
        <div>Priority: {task.current_priority}</div>
        <div>Due: {task.due_date ? task.due_date.split("T")[0] : "N/A"}</div>
        <div>Added: {task.created_at.split("T")[0]}</div>
        {task.details ? <div>{task.details}</div> : null}
      </div>
      <FontAwesomeIcon
        icon={faDeleteLeft}
        onClick={() => removeItem(task.id)}
        className={todoClasses.fontAwesome}
      />
    </div>
  );
};

export default Todo;
