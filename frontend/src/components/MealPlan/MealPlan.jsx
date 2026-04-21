import { useState, useEffect, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDeleteLeft,
  faPlus,
  faPen,
  faCheck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import heroClasses from "../../assets/views/Hero.module.css";
import mealClasses from "../../assets/views/MealPlan.module.css";

import ErrorComponent from "../Error";
import { AppContext } from "../../contexts/AppContext";

export const URL = import.meta.env.VITE_API_URL + "/meals";

const MealPlan = () => {
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
  }, [setMeals]);

  if (error) return <ErrorComponent error={error} />;

  return (
    <>
      <NewMeal meals={meals} setMeals={setMeals} />
      <Meals meals={meals} setMeals={setMeals} />
    </>
  );
};

const NewMeal = ({ meals, setMeals }) => {
  const addMeal = async (formData) => {
    const plainObject = Object.fromEntries(formData.entries());
    await fetch(URL, {
      method: "post",
      mode: "cors",
      body: JSON.stringify(plainObject),
      headers: { "content-type": "application/json" },
    })
      .then((response) => {
        if (response.status >= 400) throw new Error("server error");
        return response.json();
      })
      .then((response) => setMeals([...meals, { ...response }]));
  };

  return (
    <form action={addMeal} className={heroClasses.header}>
      <div className={mealClasses.newMeal}>
        <label htmlFor="mealName">Meal: </label>
        <input
          type="text"
          name="name"
          id="mealName"
          required
          autoComplete="off"
        />
      </div>
      <button className={mealClasses.button}>
        <FontAwesomeIcon icon={faPlus} />
      </button>
    </form>
  );
};

const Meals = ({ meals, setMeals }) => {
  const removeMeal = async (id) => {
    await fetch(`${URL}/${id}`, { method: "delete", mode: "cors" })
      .then((response) => response.json())
      .then(() => setMeals(meals.filter((m) => m.id !== id)));
  };

  const renameMeal = async (id, name) => {
    await fetch(`${URL}/${id}`, {
      method: "put",
      mode: "cors",
      body: JSON.stringify({ name }),
      headers: { "content-type": "application/json" },
    })
      .then((response) => {
        if (response.status >= 400) throw new Error("server error");
        return response.json();
      })
      .then((updated) =>
        setMeals(meals.map((m) => (m.id === id ? updated : m))),
      );
  };

  if (meals.length > 0) {
    return (
      <div className={heroClasses.body}>
        {meals.map((meal) => (
          <MealItem
            key={meal.id}
            meal={meal}
            removeMeal={removeMeal}
            renameMeal={renameMeal}
          />
        ))}
      </div>
    );
  }
  return <div>No meals added yet</div>;
};

const MealItem = ({ meal, removeMeal, renameMeal }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(meal.name);

  const handleConfirm = async () => {
    if (name.trim() && name.trim() !== meal.name) {
      await renameMeal(meal.id, name.trim());
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setName(meal.name);
    setEditing(false);
  };

  return (
    <div className={mealClasses.mealItem}>
      {editing ? (
        <input
          className={mealClasses.editInput}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
      ) : (
        <div className={mealClasses.mealName}>{meal.name}</div>
      )}
      <div className={mealClasses.actions}>
        {editing ? (
          <>
            <FontAwesomeIcon
              icon={faCheck}
              onClick={handleConfirm}
              className={mealClasses.fontAwesome}
            />
            <FontAwesomeIcon
              icon={faXmark}
              onClick={handleCancel}
              className={mealClasses.fontAwesome}
            />
          </>
        ) : (
          <>
            <FontAwesomeIcon
              icon={faPen}
              onClick={() => setEditing(true)}
              className={mealClasses.fontAwesome}
            />
            <FontAwesomeIcon
              icon={faDeleteLeft}
              onClick={() => removeMeal(meal.id)}
              className={mealClasses.fontAwesome}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MealPlan;
