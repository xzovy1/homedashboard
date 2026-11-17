#include <Arduino.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>
#include <WiFi.h>
#include "secrets.h"
// https://pubsubclient.knolleary.net/api
#include <PubSubClient.h>


//DHT22
#define DHTPIN 21
#define DHTTYPE    DHT22 
DHT dht(DHTPIN, DHTTYPE);
unsigned long dhtTimer = 0;
const unsigned long dhtInterval = 1000 * 5;


//MQTT
unsigned long mqttTimer = 0;
const unsigned long mqttInterval = 1000 * 60 * 15;
unsigned long lastReconnectAttempt = 0;
WiFiClient espClient;
PubSubClient client(espClient);

const char* topic = "home/living-room/sensors";
const char* willTopic = "home/living-room/sensors/lastwill";
const char* willMsg = "living room offline";
String payload = "";
String clientId = "ESP32Client-LivingRoom";


bool readDht();
bool publishMQTT();
bool reconnectMQTT();

void setup(){
  Serial.begin(9600);

  dht.begin();

  Serial.print("Connecting to wifi");
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) {
    attempts++;
    delay(1000);
    Serial.print(".");
  }
  Serial.println(" CONNECTED");

  delay(2000);
  // Configure & connect MQTT
  client.setServer(BROKER_IP, MQTT_PORT);
  if(client.connect(clientId.c_str(), willTopic, 1, true, willMsg)){
    client.publish(willTopic, "bedroom online", true);
  }
  delay(2000);
  if(readDht() && reconnectMQTT()){
    publishMQTT();
  }

}

void loop(){
  unsigned long currentMillis = millis();
    //read dht based on the interval
  // if(((currentMillis - dhtTimer) >= dhtInterval)){
  //   dhtTimer = currentMillis;
  //   readDht();
  // }



  //publish MQTT every 15 min
  if(((currentMillis - mqttTimer) >= mqttInterval)){
    mqttTimer = currentMillis;
    //read & publish sensors
    readDht();
    if(client.connected()){
      publishMQTT();
    }else{
      reconnectMQTT();
    }
  }

}

bool readDht(){
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Failed to read from DHT sensor!");
    // sensorError = true;
    //bad reading, return false
    return false;
  }
  // sensorError = false;
  payload = "{\"temperature\":" + String(temperature, 2) + 
                  ",\"humidity\":" + String(humidity, 2) + "}";
  return true;
}

bool publishMQTT(){
  if (client.connect(clientId.c_str(), willTopic, 1, true, willMsg)) {
    if(client.connected()){
      Serial.print("Publishing payload: ");
      Serial.println(payload);
      client.publish(topic, (const uint8_t*)payload.c_str(), payload.length(), true);
      delay(500);
      client.disconnect();
      return true;
    }
  }
  return false;
}

bool reconnectMQTT(){
  if(client.connect(clientId.c_str(), willTopic, 1, true, willMsg)){
    return true;
  }
  Serial.print(client.state());
  return false;
}
