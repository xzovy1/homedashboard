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
    const payload = JSON.parse(message.toString());
    const { temperature, humidity, air_quality } = payload;
    //format temp data since it being coerced to have trailing decimal places
    const formattedTemperature = temperature.toFixed(2);
    // Save to DB and get the unique ID (the offset)
    const result = await pool.query(
      `INSERT INTO sensor_data (topic, temperature, humidity, air_quality) 
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [topic, temperature, humidity, air_quality],
    );
    const serverOffset = result.rows[0].id;

    const data = {
      topic,
      formattedTemperature,
      humidity,
      air_quality,
      time_stamp: new Date(),
    };
    console.log(data);
    // Broadcast to everyone with the offset
    io.emit("sensor-data", data, serverOffset);
  } catch (error) {
    console.error("MQTT Processing Error:", error);
  }
});
