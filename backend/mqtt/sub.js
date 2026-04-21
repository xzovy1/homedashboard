const client = require("./mqtt");

client.on("connect", () => {
  client.subscribe("home/office/*", (err) => {
    if (!err) console.log("Subscribed to office topic");
  });
});

client.on("message", (topic, message) => {
  const payload = message.toString();

  console.log(
    `Update from ${topic}: ${payload}, ${new Date().toLocaleTimeString()}`,
  );
});
