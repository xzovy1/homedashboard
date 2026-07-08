#include <Arduino.h>
#include <WiFi.h>
#include <DHT.h>
#include <PubSubClient.h>
#include <time.h>
#include <esp_sntp.h>
#include <TM1640.h>
#include "secrets.h"

const char* ntpServer1 = "pool.ntp.org";
const char* ntpServer2 = "time.nist.gov";

// GMT -7 = -7 * 3600
const long  gmtOffset_sec = -25200;
const int   daylightOffset_sec = 3600;

//TM1640 LED driver
TM1640 module(22, 23, 4);

// DHT22
#define DHTTYPE DHT22
#define DHT_PIN 21
DHT dht(DHT_PIN, DHTTYPE);
unsigned long dhtTimer = 0;
const unsigned long dhtInterval = 1000 * 60 * 15;

WiFiClient espClient;
PubSubClient client(espClient);

//MQTT
const char* topic = "home/bedroom/sensors";
const char* willTopic = "home/bedroom/sensors/lastwill";
const char* willMsg = "offline";


void setup(){
  Serial.begin(115200);
  module.setDisplayToString("INIT");
  delay(500);

  //begin DHT  
  dht.begin();

  // Serial.println("Connecting to %s ", WIFI_SSID);
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println(" CONNECTED");

    //Init & sync time from NTP server.
    configTime(gmtOffset_sec, daylightOffset_sec, ntpServer1, ntpServer2);
    Serial.println("Waiting for NTP time sync...");

    // Configure & connect MQTT
    client.setServer(BROKER_IP, MQTT_PORT);
    String clientId = "ESP32Client-" + String(random(0, 0xffff), HEX);
    client.connect(clientId.c_str(), NULL, NULL, willTopic, 1, true, willMsg);
}

void loop(){
  
  unsigned long currentMillis = millis();
  if((currentMillis - dhtTimer) >= dhtInterval || currentMillis < 10000){
    dhtTimer = currentMillis;
    //read sensors
    delay(200);
    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();

    if (isnan(humidity) || isnan(temperature)) {
      Serial.println("Failed to read from DHT sensor!");
      module.setDisplayToString("FAIL");
    } else {
      String payload = "{\"temperature\":" + String(temperature, 2) + 
                      ",\"humidity\":" + String(humidity, 2) + "}";
      
      Serial.print("Publishing payload: ");
      Serial.println(payload);
      
      client.publish(topic, (const uint8_t*)payload.c_str(), payload.length(), true);
      client.disconnect();
    }
  }

  struct tm timeinfo;
  if(!getLocalTime(&timeinfo)){
    Serial.println("Failed to obtain time");
    return;
  }
  int nTime = ((timeinfo.tm_hour)) * 100 + (timeinfo.tm_min);

  static bool blink = false;
  // blink colon;
  if(blink){
    module.setDisplayToDecNumber(nTime, 0xFF);
  }else{
    module.setDisplayToDecNumber(nTime, _BV(4));
  }
  blink = !blink;
  delay(1000);
}