const express = require("express");
const { createServer } = require("node:http");

const app = express();
//create server for socket io.
const server = createServer(app);

const cors = require("cors");
const path = require("path");

require("dotenv").config();
const corsOptions = {
  //Access-Control-Allow-Origin
  origin: "*",
};
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.get("/api/externalWeather", async (req, res) => {
  const response = await fetch(
    `https://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_KEY}&q=Edmonton&days=3&aqi=no&alerts=no`,
  ).then((r) => {
    if (r.status >= 400) {
      throw new Error("Weather API Error");
    }
    return r.json();
  });

  res.json(response);
});

const groceryRouter = require("./routes/groceryRouter");
app.use("/api/groceries", groceryRouter);

const todoRouter = require("./routes/todoRouter");
app.use("/api/todo", todoRouter);

const mealRouter = require("./routes/mealRouter");
app.use("/api", mealRouter);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("/{*path}", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

app.use((err, req, res, next) => {
  console.error(" ERROR MIDDLEWARE", err);
  res.status(err.statusCode || 500).json({ message: err.message });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON format" });
  }
  next(err);
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    error: err.message,
  });
});

module.exports = { app, server, corsOptions };
