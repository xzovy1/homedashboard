const client = require("./mqtt");

let activeRouterId = null;

client.on("connect", () => {
  // 1. Subscribe to the discovery topic
  client.subscribe("router/id", (err) => {
    if (!err) console.log("Subscribed to discovery topic");
  });
  client.subscribe("home/sensors/#", (err) => {
    if (!err) console.log("Subscribed to sensors topic");
  });
});

client.on("message", (topic, message) => {
  const payload = message.toString();

  // 2. Handle ID discovery
  if (topic === "router/id") {
    if (activeRouterId !== payload) {
      handleNewRouter(payload);
    }
    return; // Exit early
  }
  console.log(`Update from ${topic}: ${payload}, ${new Date()}`);
});

function handleNewRouter(id) {
  console.log(`New Router Detected: ${id}`);
  activeRouterId = id;

  // Subscribe using wildcards to save code and resources
  // This covers /wan, /uptime, /name, etc. in one go
  client.subscribe(`router/${id}/+`, (err) => {
    if (!err) console.log(`Subscribed to all updates for router ${id}`);
  });
}
