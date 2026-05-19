# Issues

## Sensors

### Office Sensor

- ESP heating up causing inaccurate readings on DHT22.
  - causes:
    - Small enclosure with minimal venting.
    - ESP using constant power- not utilizing sleep or disconnection from wifi.
  - potential fixes:
    - put ESP to sleep when not sending data.
    - disconnect from wifi to reduce power usage.
    - make enclosure larger and with maximum venting.
      - helped but didn't remove the heating issue enough.
    - wire dht to gpio pin and turn pin off when not in use rather than wired directly to 3v3.
    - implement ESPNOW to communicate between esp devices.
