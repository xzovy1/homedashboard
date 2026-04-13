import classes from "../../assets/views/Weather.module.css";
import widgetStyles from "../../assets/views/Widget.module.css";
import { useState, useEffect, useCallback,useContext } from "react";
import { focusComponent } from "../../utils/focusComponent";
import { AppContext } from "../../contexts/AppContext";
import { formatTemp } from "./Weather";

import { WEATHER_URL } from "./Weather";



export const WeatherWidget = ({ apiUrl = WEATHER_URL, refreshInterval = 1 * 60 * 60 * 1000, setWidgetComponentName }) => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { weatherData, setWeatherData, theme, setTheme } = useContext(AppContext);

    const calculateTime = (data) => {
        const sunset = data.forecast.forecastday[0].astro.sunset.slice(0, 2);
        if(new Date().getHours() - parseInt(sunset[0] + 12) >= 0){
            setTheme('dark');
        }else {
            setTheme('light');
        }
    }

    const fetchWeather = useCallback(async () => {
        try {
            const response = await fetch(apiUrl);
            if (response.status >= 400) throw new Error("Server error");
            const data = await response.json();
            data.lastFetch = new Date().toLocaleTimeString()
            setWeatherData(data);
            calculateTime(data);
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

    const backgroundStyle = weatherData.backgroundImg
        ? { backgroundImage: `url(${weatherData.backgroundImg})` }
        : undefined;

    if (loading) {
        return (
            <div className={`${widgetStyles.widget} ${widgetStyles.circle}`} data-testid='weather'>
                <div className={classes.loading}>Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`${widgetStyles.widget} ${widgetStyles.circle}`} style={backgroundStyle}>
                <div className={classes.error}>Network Error</div>
            </div>
        );
    }

    return (
        <div className={`${widgetStyles.widget} ${widgetStyles.circle}`} style={backgroundStyle} onClick={()=>{ focusComponent(setWidgetComponentName, 'Weather') }}>
            <div className={classes.currentTemp}>
                <strong>{formatTemp(weatherData.current.temp_c)}</strong>
            </div>
            <div className={classes.updateTime}>{weatherData.lastFetch}</div>
            <div className={classes.otherData}>
                <div className={classes.feelsLike}>
                    Feels like: <strong>{formatTemp(weatherData.current.feelslike_c)}</strong>
                </div>
                <div className={classes.highLow}>
                    <div>H: <strong>{formatTemp(weatherData.forecast.forecastday[0].day.maxtemp_c)}</strong></div>
                    <div>L: <strong>{formatTemp(weatherData.forecast.forecastday[0].day.mintemp_c)}</strong></div>
                </div>
                <div className={classes.pressure}>
                    Pres: <strong>{Math.round(weatherData.current.pressure_mb)} hPa</strong>
                </div>
            </div>
        </div>
    );
};