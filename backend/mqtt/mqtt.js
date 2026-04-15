const mqtt = require("mqtt");
const client = mqtt.connect(process.env.MQTT_BROKER);

module.exports = client;

require("./sub.js");
require("./pub.js");
