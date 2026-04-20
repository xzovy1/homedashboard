import classes from "../../assets/views/Weather.module.css";
import { AppContext } from "../../contexts/AppContext";
import { LinePlot } from "./LinePlot";
import MQTT from "./MQTT";
import { useState, useContext } from "react";

export const WEATHER_URL = `${import.meta.env.VITE_API_URL}/externalWeather`;

export const DEFAULT_WEATHER = {
    currentTemp: null,
    dailyLow: null,
    dailyHigh: null,
    feelLike: null,
    backgroundImg: null,
    sunrise: null,
    sunset: null,
    pressureWarning: false,
    pressure: null,
    updateTime: null,
};
const roundValue = (value) => Math.round(value);
export const formatTemp = (temp) => `${roundValue(temp)}\u00B0C`;
const Weather = () => {
  const [sensorData, setSensorData] = useState({})
    const {weatherData, setWeatherData} = useContext(AppContext)
    return (
        <div>
            <h3>Weather</h3>
            <div className={classes.weatherApp}>
                <div className={classes.weatherCard}>
                        <strong>Outside Temperature:</strong>
                    <div className={classes.temperatures}>
                        <TemperatureCard title={"Today"} data={weatherData.forecast.forecastday[0].day}/>
                        <TemperatureCard title={"Tomorrow"} data={weatherData.forecast.forecastday[1].day}/>
                    </div>
                </div>
                <div className={classes.weatherCard}>
                        <strong>Inside Conditions:</strong>
                    <div className={classes.temperatures}>
                        <MQTT location={"Office"} generalTopic={'home/office/sensors'} setSensorData={setSensorData} sensorData={sensorData}/>
                        <MQTT location={"Bedroom"} generalTopic={null} setSensorData={setSensorData} sensorData={sensorData}/>
                        <MQTT location={"Living Room"} generalTopic={null} setSensorData={setSensorData} sensorData={sensorData}/>
                    </div>
                </div>
                <Graph title={"Temperature (\u00B0C)"} data={weatherData.forecast.forecastday[0].hour.map(({temp_c}) => Math.round(temp_c))} />
                <Graph title={"Barometric Pressure (mb)"} data={weatherData.forecast.forecastday[0].hour.map(({pressure_mb}) => Math.round(pressure_mb))} />
            </div>
        </div>
    )
}

const TemperatureCard = ({title, data}) => {
    return (
        <div>
            <strong>{title}:</strong>
            <div>High: {formatTemp(data.maxtemp_c)}</div>
            <div>Low: {formatTemp(data.mintemp_c)}</div>
        </div>
    )
}

const Graph = ({title, data}) => {
    return (
        <div className={classes.weatherCard}> 
            <div>
                <div><strong>{title}</strong></div>
                <LinePlot data={data}/>
            </div>
        </div> 
    )
}


export default Weather;