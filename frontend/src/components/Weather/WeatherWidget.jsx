import classes from "../../assets/views/Weather.module.css";
import widgetStyles from "../../assets/views/Widget.module.css";
import { useState, useEffect, useCallback, useContext } from "react";
import { focusComponent } from "../../utils/focusComponent";
import { AppContext } from "../../contexts/AppContext";
import { formatTemp } from "./Weather";

import { WEATHER_URL } from "./Weather";

export const WeatherWidget = ({
  apiUrl = WEATHER_URL,
  refreshInterval = 1 * 60 * 60 * 1000,
  setWidgetComponentName,
}) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { weatherData, setWeatherData, theme, setTheme } =
    useContext(AppContext);

  const handleTheme = (sunrise, sunset) => {
    const formatTime = (timeStr) => parseInt(timeStr.slice(0, 2));
    sunrise = formatTime(sunrise);
    // weather api uses 12 hour clock
    sunset = formatTime(sunset) + 12;
    setTheme("midnight");
    const hour = new Date().getHours();
    if (hour >= sunrise && hour <= 11) {
      setTheme("sunrise");
    } else if (hour > 11 && hour <= 16) {
      setTheme("goldenhour");
    } else if (hour >= sunset && hour < 21) {
      setTheme("sunset");
    } else if (hour <= 6 || hour >= 21) {
      setTheme("midnight");
    } else {
      setTheme("sunrise");
    }
  };
  const fetchWeather = useCallback(async () => {
    try {
      const response = await fetch(apiUrl);
      if (response.status >= 400) throw new Error("Server error");
      const data = await response.json();
      data.lastFetch = new Date().toLocaleTimeString();
      const { sunrise, sunset } = data.forecast.forecastday[0].astro;
      setWeatherData(data);
      handleTheme(sunrise, sunset);
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchWeather();
    const intervalId = setInterval(fetchWeather, refreshInterval);
    return () => clearInterval(intervalId);
  }, [fetchWeather]);

  if (loading) {
    return (
      <div
        className={`${widgetStyles.widget} ${widgetStyles.circle}`}
        data-testid="weather"
      >
        <div className={classes.loading}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${widgetStyles.widget} ${widgetStyles.circle}`}>
        <div className={classes.error}>Network Error</div>
      </div>
    );
  }

  return (
    <div
      className={`${widgetStyles.widget} ${widgetStyles.circle}`}
      onClick={() => {
        focusComponent(setWidgetComponentName, "Weather");
      }}
    >
      <div className={classes.currentTemp}>
        <strong>{formatTemp(weatherData.current.temp_c)}</strong>
      </div>
      <div className={classes.updateTime}>{weatherData.lastFetch}</div>
      <div className={classes.otherData}>
        <div className={classes.feelsLike}>
          Feels like:{" "}
          <strong>{formatTemp(weatherData.current.feelslike_c)}</strong>
        </div>
        <div className={classes.highLow}>
          <div>
            H:{" "}
            <strong>
              {formatTemp(weatherData.forecast.forecastday[0].day.maxtemp_c)}
            </strong>
          </div>
          <div>
            L:{" "}
            <strong>
              {formatTemp(weatherData.forecast.forecastday[0].day.mintemp_c)}
            </strong>
          </div>
        </div>
        <div className={classes.pressure}>
          Pres:{" "}
          <strong>{Math.round(weatherData.current.pressure_mb)} hPa</strong>
        </div>
      </div>
    </div>
  );
};
