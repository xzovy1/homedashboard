const client = require("./mqtt");
const io = require("../socket");

io.on("connection", (socket) => {
  socket.on("device-control", (command) => {
    // Example: send a command to a specific device
    client.publish(`home/commands`, JSON.stringify(command));
  });
});
