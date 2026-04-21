import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { formatTemp } from './Weather';
import classes from "../../assets/views/Weather.module.css";

const socket = io('http://localhost:5500');

export default function MQTT({location, generalTopic}) {
  const defaultData = {data: "null", timestamp: 'null'}
  const [humidity, setHumidity] = useState(defaultData);
  const [temperature, setTemperature] = useState(defaultData);

  useEffect(() => {
    socket.on('sensor-data', (payload) => {
      const {topic} = payload;
      if(topic.includes(generalTopic)){
      
        if(topic.includes("hum")){
          setHumidity(payload);
        }
        if(topic.includes("temp")){
          setTemperature(payload);
        };
      }
    });
    return () => socket.off('sensor-data');
  }, []);

  return (
    <div>
      <strong>{location}</strong>
      <div><strong>Temperature:</strong> {formatTemp(temperature.data)}</div>
      <div className={classes.updateTime}>Last fetch: {new Date(temperature.timestamp).toLocaleTimeString()}</div>
      <div><strong>Humidity:</strong> {humidity.data}%</div>
      <div className={classes.updateTime}>Last fetch: {new Date(humidity.timestamp).toLocaleTimeString()}</div>
    </div>
  );
};
