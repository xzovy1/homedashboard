const client = require("./mqtt");

client.on("connect", () => {
  client.subscribe("home/sensors/#", (err) => {
    if (!err) console.log("Subscribed to sensors topic");
  });
});

client.on("message", (topic, message) => {
  const payload = message.toString();

  console.log(
    `Update from ${topic}: ${payload}, ${new Date().toLocaleTimeString()}`,
  );
});
