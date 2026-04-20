import { useState, useEffect } from 'react'
import { AppContext } from './contexts/AppContext';
import { DEFAULT_WEATHER } from './components/Weather/Weather';
import { socket } from './socket';

import './App.css'

import Hero from './components/Hero';
import Spending from './components/Spending';
import Todo from "./components/Todo/Todo"
import MealPlan from './components/MealPlan/MealPlan'
import Weather from './components/Weather/Weather';
import WidgetBar from './components/WidgetBar';
import Toolbox from './components/Toolbox';
import Groceries from './components/Grocery/Groceries';
import Calendar from "./components/Calendar"


import { ConnectionState } from './components/Socket/ConnectionState';
import { ConnectionManager } from './components/Socket/ConnectionManager';
import { Events } from "./components/Socket/Events";
import { Form } from './components/Socket/Form';

function App() {
  //use component references which maps component names to their function references. 
  // components are instantiated dynamically in the render method
   const widgetComponentMap = {
    Spending: Spending,
    "To Do": Todo,
    "Meal Plan": MealPlan,
    Weather: Weather,
    "Toolbox": Toolbox,
    Groceries: Groceries
  };
  
  const [widgetComponentName, setWidgetComponentName] = useState("Groceries");
  const FocusedComponent = widgetComponentMap[widgetComponentName];
  
  const [tasks, setTasks] = useState([]);
  const [meals, setMeals] = useState([]);
  const [weatherData, setWeatherData] = useState(DEFAULT_WEATHER);
  const [theme, setTheme] = useState("sunrise");

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [sensorData, setSensorData] = useState([]);

  const colorSchemes = {
    sunrise: "linear-gradient(140deg, rgba(255, 197, 167, 1) 0%, rgb(255 193 192) 50%, rgb(255 248 184) 100%)",
    middayClear: "inear-gradient(140deg, #82C3FF 0%, #BFE2FF 50%, #E0F4FF 100%)",
    goldenHour: "linear-gradient(140deg, #FF9E6A 0%, #FFD07F 50%, #FEE89E 100%)",
    sunset: "linear-gradient(140deg, #6248FF 0%, #CF5C78 50%, #FF9E75 100%)",
    midnight: "linear-gradient(180deg, #0e0252 0%, #3e1245 50%, #390722 100%)",
  }
  
  useEffect(() => {
    // document.body.dataset.theme = theme;
    // document.body.style.background = colorSchemes[`${theme}`];
  }, [theme]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onSensorData(value) {
      setSensorData(previous => [...previous, value]);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('sensor-data', onSensorData);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('sensor-data', onSensorData);
    };
  }, []);

  const [widgetBarStatus, setWidgetBar] = useState(true);
  
  useEffect(()=>{
    //local storage
    const widgetBarLS = JSON.parse(localStorage.getItem("widgetBarStatus"))  
    //check localStorage for status
    widgetBarLS ? setWidgetBar(true) : setWidgetBar(false);

    const secondaryComponentLS = JSON.parse(localStorage.getItem("secondaryComponent"));
    secondaryComponentLS ? setSecondaryComponentName(secondaryComponentLS) : null;
    
  },[widgetBarStatus])
  
  return (  
      <AppContext value={{tasks, setTasks, meals, setMeals, weatherData, setWeatherData, theme, setTheme}}>
        <WidgetBar widgetBarStatus={widgetBarStatus} setWidgetBar={setWidgetBar} setWidgetComponentName={setWidgetComponentName}/>
        {/* <Hero>
          <FocusedComponent />
          <Calendar />
        </Hero> */}
        <div>
            <ConnectionState isConnected={ isConnected } />
            <Events events={ sensorData } />
            <ConnectionManager />
            {/* <MyForm /> */}
        </div>
      </AppContext>
  )
}

export default App
