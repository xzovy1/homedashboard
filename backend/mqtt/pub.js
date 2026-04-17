const client = require("./mqtt");
const io = require("../socket");

client.on("connect", () => {
  client.subscribe("home/#", (err) => {
    if (!err) {
      //   client.publish("presence", "Hello mqtt");
    }
  });
  client.on("message", (topic, message) => {
    const payload = message.toString();

    io.emit("sensor-data", {
      topic,
      data: payload,
      timestamp: new Date().toISOString(),
    });
  });
});
