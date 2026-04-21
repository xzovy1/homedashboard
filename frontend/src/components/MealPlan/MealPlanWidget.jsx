import { useEffect, useState, useContext } from "react";
import widgetStyles from "../../assets/views/Widget.module.css";
import { AppContext } from "../../contexts/AppContext";
import { focusComponent } from "../../utils/focusComponent";

import { URL } from "./MealPlan";

export const MealPlanWidget = ({ setWidgetComponentName }) => {
  const { meals, setMeals } = useContext(AppContext);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(URL)
      .then((response) => {
        if (response.status > 400) throw new Error("server error");
        return response.json();
      })
      .then((data) => setMeals(data))
      .catch((error) => setError(error));
  }, []);

  return (
    <div
      className={`${widgetStyles.widget} ${widgetStyles.box}`}
      onClick={() => focusComponent(setWidgetComponentName, "Meal Plan")}
    >
      <h4 className={widgetStyles.heading}>Meal Plan</h4>
      <hr className={widgetStyles.breakTag} />
      <Meals meals={meals} />
    </div>
  );
};

const Meals = ({ meals }) => {
  if (meals.length > 3) {
    return (
      <div>
        <div>Total: {meals.length}</div>
      </div>
    );
  }
  return meals.length > 0 ? (
    <ul className={widgetStyles.list}>
      {meals.map((meal) => (
        <li style={{ fontSize: "smaller" }} key={meal.id}>
          {meal.name}
        </li>
      ))}
    </ul>
  ) : (
    <div style={{ fontSize: "smaller" }}>No meals added yet</div>
  );
};
