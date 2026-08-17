CREATE TABLE IF NOT EXISTS sensor_data (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    topic VARCHAR ( 100 ),
    temperature NUMERIC (3, 1),
    humidity NUMERIC (3, 1),
    air_quality NUMERIC (3,1),
    time_stamp TIMESTAMPTZ USING time_stamp AT TIME ZONE 'America/Edmonton'
)