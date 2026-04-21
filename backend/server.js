require("dotenv").config();
require("./mqtt/mqtt.js");
const { server } = require("./app");

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Listening on port ${PORT}`);
});
