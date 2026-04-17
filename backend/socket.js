const { Server } = require("socket.io");
const { server } = require("./app");

const io = new Server(server, { cors: { origin: "*" } });

module.exports = io;
