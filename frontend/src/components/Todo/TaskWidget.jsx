import widgetStyles from "../../assets/views/Widget.module.css";
import { useEffect, useState, useContext } from "react";
import { AppContext } from "../../contexts/AppContext";
import { focusComponent } from "../../utils/focusComponent";

import { URL } from "./Todo";

export const TaskWidget = ({ setWidgetComponentName }) => {
  const { tasks, setTasks } = useContext(AppContext);
  const [error, setError] = useState(null);

  useEffect(() => {
    //fetch tasks
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
  }, []);

  return (
    <div
      className={`${widgetStyles.widget} ${widgetStyles.box}`}
      onClick={() => {
        focusComponent(setWidgetComponentName, "To Do");
      }}
    >
      <h4 className={widgetStyles.heading}>Todos ({tasks.length})</h4>
      <hr className={widgetStyles.breakTag} />
      <Tasks tasks={tasks} />
    </div>
  );
};

const Tasks = ({ tasks }) => {
  console.log(tasks);
  if (tasks.length > 3) {
    return (
      <div>
        {tasks.map((task) => {
          if (task.current_priority === "high") {
            return (
              <li style={{ fontSize: "smaller" }} key={task.id}>
                {task.title}
              </li>
            );
          }
        })}
      </div>
    );
  }
  return tasks.length > 0 ? (
    <ul className={widgetStyles.list}>
      {tasks.map((task) => (
        <li style={{ fontSize: "smaller" }} key={task.id}>
          {task.title}
        </li>
      ))}
    </ul>
  ) : (
    <div style={{ fontSize: "smaller" }}>No items in todo list</div>
  );
};
