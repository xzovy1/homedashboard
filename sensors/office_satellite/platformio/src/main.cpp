#include <Arduino.h>
#include "stdlib.h"
#include "EspMQTTClient.h"
#include <Arduino_JSON.h>
#include <assert.h>
#include <math.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>
#include "secrets.h"


unsigned long deviceTime = 0;

//LED's green and yellow for indicators. 
// solid yellow: network fault
// blinking yellow: sensor fault
// solid green: normal operation
typedef enum {
  OPERATIONAL,   
  SENSOR_FAULT,  
  NETWORK_FAULT, 
  STARTING   
} LED_STATE;
LED_STATE ledState = STARTING;

const int yellowPin = 12;
const int greenPin = 14;

//JSON
JSONVar sensorData;

//DHT22
#define DHTTYPE    DHT22  
#define DHT_PIN 13

//variable to track the time passed.
const unsigned long dhtInterval = 5000;
unsigned long dhtTimer = 0;

float hum; //humidity
char humBuffer[10];
float temp; //temperature
char tempBuffer[10];

bool tempFault = false;
bool humFault = false;

DHT_Unified dht(DHT_PIN, DHTTYPE);

//MQTT
//on the router set to a static ip to speed up connection time.
const unsigned long mqttInterval = 1000 * 60 * 15;
unsigned long mqttTimer = 0;

const char* ssid = WIFI_SSID;
const char* password = WIFI_PASS;
const char* broker = BROKER_IP;
const char* clientName = "office";

const char* topic = "home/office/sensors";


EspMQTTClient client(
  ssid,
  password,
  broker,
  clientName
);
void readDht();
void readLedState();
void onConnectionEstablished();
void readFaults();

void setup() {
  Serial.begin(115200);
  pinMode(greenPin, OUTPUT);
  pinMode(yellowPin, OUTPUT);
  readLedState();

  Serial.println(WIFI_SSID);
  Serial.println(WIFI_PASS);
  Serial.println(BROKER_IP);
  //add delay for starting leds to display.
  delay(2000);
  //read DHT before connecting to wifi.
  dht.begin();
  readDht();
  //send poll duration to backend for timeout validation.
  sensorData["pollInterval"] = mqttInterval;
}

void loop() {
  deviceTime = millis();
  client.loop();

  readFaults();
  readLedState();
  
  if((deviceTime - dhtTimer) > dhtInterval){
    dhtTimer = deviceTime;
    readDht();
  }
  
  if((deviceTime - mqttTimer) > mqttInterval){
    mqttTimer = deviceTime;
    client.publish(topic, JSON.stringify(sensorData));
  }
  
}

void readDht() {
  // delay(2000); //Collecting period should be >1.7seconds
  sensors_event_t event;
  // Get temperature event and print its value.
  dht.temperature().getEvent(&event);
  // locks up program if pin is set incorrectly after upload
  if (isnan(event.temperature)) {
    Serial.println(F("Error reading temperature!"));
    ledState = SENSOR_FAULT;
    sensorData["temperature"] = null;
    tempFault = true;
  }
  else {
    //offset to compensate for board heat in enclosure
    float offset = 5.4f;
    float reading = event.temperature - offset;
    Serial.print(F("Temperature: "));
    Serial.print(reading);
    Serial.println(F("°C"));
    float rounded = round(reading * 10) / 10.0;
    sensorData["temperature"] = rounded;
    tempFault = false;
  }
  // Get humidity event and print its value.
  dht.humidity().getEvent(&event);
  if (isnan(event.relative_humidity)) {
    Serial.println(F("Error reading humidity!"));
    sensorData["humidity"] = null;
    ledState = SENSOR_FAULT;
    humFault = true;
  }
  else {
    Serial.print(F("Humidity: "));
    Serial.print(event.relative_humidity);
    Serial.println(F("%"));
    sensorData["humidity"] = round(event.relative_humidity * 10) / 10.0;
    humFault = false;
  }
}

void readLedState (){
  switch(ledState){
    case OPERATIONAL:
      digitalWrite(yellowPin, LOW);
      digitalWrite(greenPin, HIGH);
      break;
    case NETWORK_FAULT:
      digitalWrite(yellowPin, HIGH);
      digitalWrite(greenPin, LOW);
      break;
    case SENSOR_FAULT:
      digitalWrite(greenPin, LOW);
      digitalWrite(yellowPin,millis()%500>250);
      break;
    case STARTING:
      digitalWrite(yellowPin, HIGH);
      digitalWrite(greenPin, HIGH);
      break;
  }
}

void readFaults(){
  
  if(humFault || tempFault){
     ledState = SENSOR_FAULT;
  }else if(!client.isConnected()){
     ledState = NETWORK_FAULT;
  }else{
    ledState = OPERATIONAL;
  }

}
void onConnectionEstablished()
{
  readDht();
  delay(1000);
  client.publish(topic, JSON.stringify(sensorData));
  delay(100);
  ledState = OPERATIONAL;
}