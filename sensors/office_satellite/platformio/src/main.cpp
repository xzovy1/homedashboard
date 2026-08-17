#include <Arduino.h>
#include <WiFi.h>
#include <DHT.h>
#include <PubSubClient.h>
#include "secrets.h"


//LED's
const int yellowLed = 12; // indicates network fault
const int orangeLed = 14; // indicates sensor fault

//DHT22
#define DHTTYPE DHT22  
#define DHT_PIN 13

// Deep Sleep
#define TIME_TO_SLEEP   20 * 60     // Time ESP32 will sleep (in seconds)
#define uS_TO_S_FACTOR  1000000ULL  // Conversion factor for micro seconds
#define SLEEP_DURATION TIME_TO_SLEEP * uS_TO_S_FACTOR

DHT dht(DHT_PIN, DHTTYPE);
WiFiClient espClient;
PubSubClient client(espClient);

//MQTT
const char* topic = "home/office/sensors";
const char* willTopic = "home/office/sensors/lastwill";
const char* willMsg = "office offline";

void espSleep(unsigned long duration);

void setup() {
  Serial.begin(115200);

  //remove pin hold for sleep
  gpio_hold_dis((gpio_num_t)yellowLed);
  gpio_hold_dis((gpio_num_t)orangeLed);

  pinMode(orangeLed, OUTPUT);
  pinMode(yellowLed, OUTPUT);

  //add delay for starting leds to display.
  delay(2000);

  dht.begin();

  Serial.print("Connecting to WiFi...");
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 40) { // 20 second timeout
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("\nWiFi Connection Failed. Going back to sleep.");
    // turn yellow on, orange off if connection failed 
    digitalWrite(yellowLed, HIGH);
    //specify sleep timer
    //shorter sleep for wifi fail
    espSleep(SLEEP_DURATION / 5);
  }else{
    digitalWrite(yellowLed, LOW);
  }

  Serial.println("\nWiFi Connected.");

  // Configure & Connect MQTT
  client.setServer(BROKER_IP, MQTT_PORT);
  Serial.print("Connecting to MQTT Broker...");
  
  String clientId = "ESP32Client-Office";
  if (client.connect(clientId.c_str(), willTopic, 1, true, willMsg)) {
    client.publish(willTopic, "office online", true);
    Serial.println("Connected.");
    digitalWrite(yellowLed, LOW);

    //delay for sensors
    delay(2000);
    // Read Sensor 
    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();

    if (isnan(humidity) || isnan(temperature)) {
      Serial.println("Failed to read from DHT sensor!");
      //turn on orange led if sensor failed.
      digitalWrite(orangeLed, HIGH);
    } else {
      // Publish Payload to MQTT
      String payload = "{\"temperature\":" + String(temperature, 2) + 
                      ",\"humidity\":" + String(humidity, 2) + "}";
      
      Serial.print("Publishing payload: ");
      Serial.println(payload);
      //cast payload string to uint8 to read the payload length
      client.publish(topic, (const uint8_t*)payload.c_str(), payload.length(), true);
      delay(500);
      client.disconnect();
      digitalWrite(orangeLed, LOW);
    }
  } else {
    // turn yellow led on if connection failed 
    digitalWrite(yellowLed, HIGH);
    Serial.print("Failed, rc=");
    Serial.print(client.state());
    // shorter sleep for mqtt fail
    espSleep(SLEEP_DURATION / 5);
  }
  
  // Start Deep Sleep
  espSleep(SLEEP_DURATION);
}

void loop() {

}

void espSleep(unsigned long duration){
  Serial.println(" Going back to sleep.");
  esp_sleep_enable_timer_wakeup(duration);
  gpio_hold_en((gpio_num_t)orangeLed);
  gpio_hold_en((gpio_num_t)yellowLed);
  gpio_deep_sleep_hold_en();
  delay(500);
  esp_deep_sleep_start();
}