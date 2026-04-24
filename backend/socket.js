const { Server } = require("socket.io");
const { server } = require("./app");
const pool = require("./db/pool.js");

const io = new Server(server, {
  cors: { origin: "*" },
  connectionStateRecovery: {},
});

io.on("connection", async (socket) => {
  console.log("Client connected:", socket.id);

  // Get the offset sent by the client in the auth object
  const clientOffset = socket.handshake.auth.serverOffset || 0;

  // If Socket.IO couldn't recover the state automatically (e.g., long downtime)
  if (!socket.recovered) {
    try {
      // Fetch missed readings from the DB
      const result = await pool.query(
        "SELECT * FROM sensor_data WHERE id > $1 ORDER BY id ASC",
        [clientOffset],
      );

      result.rows.forEach((row) => {
        // Emit missed data ONLY to this specific socket
        socket.emit(
          "sensor-data",
          {
            topic: row.topic,
            temperature: row.temperature,
            humidity: row.humidity,
            air_quality: row.air_quality,
            time_stamp: row.time_stamp,
          },
          row.id,
        );
      });
    } catch (e) {
      console.error("Recovery query failed:", e);
    }
  }
});

module.exports = io;
