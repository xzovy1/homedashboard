const client = require("./mqtt");
const io = require("../socket");
const pool = require("../db/pool.js");

async function sendDiscordWebhook(str = "this is a test"){
  console.log(str)
  const message = JSON.stringify({"content": str})
  try{
    const response = await fetch(process.env.DISCORD_WEBHOOK, {method: "POST", headers: {
      'Content-Type': 'application/json'
    }, body: message})

    if(!response.ok){
      console.log(response)
      throw new Error(response.status)
    }
    
  }catch(err){
    console.error(err);
  }
}
//bool value to ensure notification isn't being spammed every 15 minutes.
let alarmNotificationSent = false;
const highTempAlarm = 24;
const lowTempAlarm = 17;

client.on("connect", () => {
  client.subscribe("home/office/#", (err) => {
    if (!err) console.log("Subscribed to office topic");
  });
  client.subscribe("home/bedroom/#", (err) => {
    if (!err) console.log("Subscribed to bedroom topic");
  });
  client.subscribe("home/living-room/#", (err) => {
    if (!err) console.log("Subscribed to living room topic");
  });
});

client.on("message", async (topic, message) => {
  try {
    if (topic.includes("lastwill")) {
      console.log(topic, message.toString());
      const data = {
        topic,
        temperature: null,
        humidity: null,
        air_quality: null,
        time_stamp: new Date(),
      };
      io.emit("sensor-data", data);
      return;
    }
    const payload = JSON.parse(message.toString());
    console.log("payload", payload);
    const { temperature, humidity, air_quality } = payload;
    //format temp data to have 1 decimal place.
    const formattedTemperature = temperature.toFixed(1);

    const data = {
      topic,
      temperature: parseFloat(formattedTemperature),
      humidity,
      air_quality,
      timestamp: new Date(),
    };
    // temp is at alarm levels send discord message if alarmCondition hasn't previously been triggered
    if(temperature >= highTempAlarm || temperature <= lowTempAlarm){
      if(!alarmNotificationSent){
        // mqtt: home/<room>/sensors
        const location = data.topic.split('/')[1]
        sendDiscordWebhook(`Heads up! ${location} temperature is ${temperature}`)
      }
      alarmNotificationSent = true;
    }else{
      alarmNotificationSent = false;
    }
    // Broadcast to everyone with the offset
    io.emit("sensor-data", data);
  } catch (error) {
    console.error("MQTT Processing Error:", error);
  }
});