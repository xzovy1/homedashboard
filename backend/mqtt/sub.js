const client = require("./mqtt");
const io = require("../socket");
const pool = require("../db/pool.js");

client.on("connect", () => {
  client.subscribe("home/office/#", (err) => {
    if (!err) console.log("Subscribed to office topic");
  });
  client.subscribe("home/bedroom/#", (err) => {
    if (!err) console.log("Subscribed to bedroom topic");
  });
  client.subscribe("home/living-room/#", (err) => {
    if (!err) console.log("Subscribed to living room topic");
  });
});

client.on("message", async (topic, message) => {
  try {
    if (topic.includes("lastwill")) {
      console.log(topic, message.toString());
      const data = {
        topic,
        temperature: null,
        humidity: null,
        air_quality: null,
        time_stamp: new Date(),
      };
      io.emit("sensor-data", data);
      return;
    }
    const payload = JSON.parse(message.toString());
    console.log("payload", payload);
    const { temperature, humidity, air_quality } = payload;
    //format temp data to have 1 decimal place.
    const formattedTemperature = temperature.toFixed(1);

    const data = {
      topic,
      temperature: formattedTemperature,
      humidity,
      air_quality,
      time_stamp: new Date(),
    };
    console.log(data);
    // Broadcast to everyone with the offset
    io.emit("sensor-data", data);
  } catch (error) {
    console.error("MQTT Processing Error:", error);
  }
});
