const client = require("./mqtt");
const io = require("../socket");
const { json } = require("express");

client.on("connect", () => {
  client.subscribe("home/#", (err) => {});
  client.on("message", (topic, message) => {
    const jsonData = JSON.parse(message.toString());
    jsonData.timestamp = new Date().toISOString();
    io.emit("sensor-data", {
      topic,
      data: jsonData,
    });
  });
});
