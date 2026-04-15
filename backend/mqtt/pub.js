const client = require("./mqtt");

client.on("connect", () => {
  client.subscribe("presence", (err) => {
    if (!err) {
      //   client.publish("presence", "Hello mqtt");
    }
  });
});
