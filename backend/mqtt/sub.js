const client = require("./mqtt");
const io = require("../socket");
const pool = require("../db/pool.js");

client.on("connect", () => {
  client.subscribe("home/office/#", (err) => {
    if (!err) console.log("Subscribed to office topic");
  });
});

client.on("message", async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());
    const { temperature, humidity, air_quality } = payload;
    console.log(payload);
    // Save to DB and get the unique ID (the offset)
    const result = await pool.query(
      `INSERT INTO sensor_data (topic, temperature, humidity, air_quality) 
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [topic, temperature, humidity, air_quality],
    );
    const serverOffset = result.rows[0].id;
    console.log(result.rows[0]);
    const data = {
      topic,
      temperature,
      humidity,
      air_quality,
      time_stamp: new Date(),
    };
    // Broadcast to everyone with the offset
    io.emit("sensor-data", data, serverOffset);
  } catch (error) {
    console.error("MQTT Processing Error:", error);
  }
});
