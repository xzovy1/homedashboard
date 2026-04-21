import { createContext } from "react";

export const AppContext = createContext({
  tasks: [],
  setTasks: () => {},
  meals: [],
  setMeals: () => {},
  weatherData: {},
  setWeatherData: () => {},
  sensorData: {},
  setSensorData: () => {},
});
