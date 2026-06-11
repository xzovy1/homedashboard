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

DHT dht(DHT_PIN, DHTTYPE);
WiFiClient espClient;
PubSubClient client(espClient);

//MQTT
const char* topic = "home/office/sensors";
const char* willTopic = "home/office/sensors/lastwill";
const char* willMsg = "offline";

void espSleep();

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
  //specify sleep timer
  esp_sleep_enable_timer_wakeup(TIME_TO_SLEEP * uS_TO_S_FACTOR);

  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("\nWiFi Connection Failed. Going back to sleep.");
    // turn yellow on, orange off if connection failed 
    digitalWrite(yellowLed, HIGH);
    espSleep();
  }else{
    digitalWrite(yellowLed, LOW);
  }
  
  Serial.println("\nWiFi Connected.");

  // 2. Configure MQTT and Connect
  client.setServer(BROKER_IP, MQTT_PORT);
  Serial.print("Connecting to MQTT Broker...");
  
  String clientId = "ESP32Client-" + String(random(0, 0xffff), HEX);
  if (client.connect(clientId.c_str(), NULL, NULL, willTopic, 1, true, willMsg)) {
    Serial.println("Connected.");
    digitalWrite(yellowLed, LOW);
  } else {
    // turn yellow on if connection failed 
    digitalWrite(yellowLed, HIGH);
    Serial.print("Failed, rc=");
    Serial.print(client.state());
    espSleep();
  }

  // 3. Read Sensor (Takes about 250 milliseconds)
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Failed to read from DHT sensor!");
    //turn on orange led on sensor fail.
    digitalWrite(orangeLed, HIGH);
  } else {
    // 4. Publish Payload to MQTT
    String payload = "{\"temperature\":" + String(temperature, 2) + 
                     ",\"humidity\":" + String(humidity, 2) + "}";
    
    Serial.print("Publishing payload: ");
    Serial.println(payload);
    
    client.publish(topic, payload.c_str());
    digitalWrite(orangeLed, LOW);
  }

  // Small delay to ensure MQTT buffer
  delay(500); 
  
  // 5. Start Deep Sleep
  espSleep();
}

void loop() {

}

void espSleep(){
  Serial.println(" Going back to sleep.");
  gpio_hold_en((gpio_num_t)orangeLed);
  gpio_hold_en((gpio_num_t)yellowLed);
  gpio_deep_sleep_hold_en();
  esp_deep_sleep_start();
}