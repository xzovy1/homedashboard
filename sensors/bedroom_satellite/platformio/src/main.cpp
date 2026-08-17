#include <Arduino.h>
#include <WiFi.h>
#include <DHT.h>
// https://pubsubclient.knolleary.net/api
#include <PubSubClient.h>
#include <time.h>
#include <esp_sntp.h>
//https://github.com/maxint-rd/TM16xx
#include <TM1640.h>
#include "secrets.h"
#include <ESP32Time.h>

// GMT -7 = -7 * 3600 = -25200
const long  gmtOffset_sec = -25200;
const int   daylightOffset_sec = 3600;

//ntp
unsigned long ntpTimer = 0;
const char* ntpServer1 = "pool.ntp.org";
const char* ntpServer2 = "time.nist.gov";

//rtc
ESP32Time rtc(0);
unsigned long rtcTimer = 0;
const unsigned long rtcInterval = 1000 * 60 * 60;
struct tm timeinfo;


//TM1640 LED driver
TM1640 module(22, 23, 4);  // data, clock, 4 digits
unsigned long ledTimer = 0;
const unsigned long ledInterval = 5000;
unsigned long blinkTimer = 0;
const unsigned long blinkInterval = 1000;

//photoresistor
#define PHOTO_PIN 34

// DHT22
#define DHTTYPE DHT22
#define DHT_PIN 21
DHT dht(DHT_PIN, DHTTYPE);
unsigned long dhtTimer = 0;
const unsigned long dhtInterval = 1000 * 60;
bool sensorError = false;

//MQTT
unsigned long mqttTimer = 0;
const unsigned long mqttInterval = 1000 * 60 * 15;
unsigned long lastReconnectAttempt = 0;
WiFiClient espClient;
PubSubClient client(espClient);

const char* topic = "home/bedroom/sensors";
const char* willTopic = "home/bedroom/sensors/lastwill";
const char* willMsg = "bedroom offline";
String payload = "";
String clientId = "ESP32Client-Bedroom";
bool networkError = false;


// function declarations
bool readDht();
bool publishMQTT();
bool reconnectMQTT();

void setup(){
  Serial.begin(115200);
  module.setDisplayToString("INIT");
  
  //begin DHT  
  dht.begin();
  delay(1000);

  Serial.print("Connecting to wifi");
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println(" CONNECTED");

    //Init & sync time from NTP server.
    configTime(gmtOffset_sec, daylightOffset_sec, ntpServer1, ntpServer2);
    Serial.println("Waiting for NTP time sync...");

    // set rtc with ntp
    if (getLocalTime(&timeinfo)){
      rtc.setTimeStruct(timeinfo); 
    }

    // Configure & connect MQTT
    client.setServer(BROKER_IP, MQTT_PORT);
    client.connect(clientId.c_str(), willTopic, 1, true, willMsg);
    
    delay(2000);
    if(readDht() && reconnectMQTT()){
      publishMQTT();
    }
}

void loop(){
  
  unsigned long currentMillis = millis();

  //maintain MQTT connection with broker
  if(((currentMillis - lastReconnectAttempt) >= 5000)){
    lastReconnectAttempt = currentMillis;
    if(!client.connected()){
      networkError = true;
      reconnectMQTT();
      }else{
        networkError = false;
    }
  }
  client.loop();

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

  //read dht based on the interval
  if(((currentMillis - dhtTimer) >= dhtInterval)){
    dhtTimer = currentMillis;
    readDht();
  }

  //set display brightness
  if(analogRead(PHOTO_PIN) < 1300){
    module.setupDisplay(true, 0);
  }else{
    module.setupDisplay(true, 2);
  }
  
  //set rtc with ntp
  if(((currentMillis - rtcTimer) >= rtcInterval)){
    rtcTimer = currentMillis;
    if (getLocalTime(&timeinfo)){
      rtc.setTimeStruct(timeinfo); 
    }
  }

  int nTime = ((rtc.getHour(true))) * 100 + (rtc.getMinute());

  static bool blink = false;
  // blink colon;
  if(blink){
    module.setDisplayToDecNumber(nTime, 0xFF);
  }else{
    if(sensorError){
      module.setDisplayToString("sErr");
    }else if(networkError){
      module.setDisplayToString("nErr");
    }else{
      module.setDisplayToDecNumber(nTime, _BV(4));
    }
  }
  if(((currentMillis - blinkTimer) >= blinkInterval)){
    blinkTimer = currentMillis;
    blink = !blink;
  }
}

bool readDht(){
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Failed to read from DHT sensor!");
    sensorError = true;
    //bad reading, return false
    return false;
  }
  sensorError = false;
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
    Serial.println("connected");
    client.publish(willTopic, "bedroom online", true);
    return true;
  Serial.print(client.state());
  return false;
}
