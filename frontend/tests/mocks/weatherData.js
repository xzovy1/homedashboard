export const mockedWeather = {
  current: {
    feelslike_c: 3,
    temp_c: 1,
  },
  forecast: {
    forecastday: [
      {
        day: {
          mintemp_c: 1,
          maxtemp_c: 5,
          condition: {
            icon: "/iconImage",
          },
        },
        hour: [
          {
            pressure_mb: 1000,
          },
          {
            pressure_mb: 1001,
          },
        ],
        astro: {
          sunrise: "05:00:00",
          sunset: "18:00:00",
        },
      },
      {
        day: {
          mintemp_c: 1,
          maxtemp_c: 5,
          condition: {
            icon: "/iconImage",
          },
        },
        hour: [
          {
            pressure_mb: 1000,
          },
        ],
        astro: {
          sunrise: "05:03:00",
          sunset: "18:02:00",
        },
      },
      {
        day: {
          mintemp_c: 1,
          maxtemp_c: 5,
          condition: {
            icon: "/iconImage",
          },
        },
        hour: [
          {
            pressure_mb: 1000,
          },
        ],
        astro: {
          sunrise: "05:03:00",
          sunset: "18:02:00",
        },
      },
    ],
  },
};

export const mockedWeatherPressureDrop = {
  current: {
    feelslike_c: 3,
    temp_c: 1,
  },
  forecast: {
    forecastday: [
      {
        day: { mintemp_c: 1, maxtemp_c: 5, condition: { icon: "/iconImage" } },
        hour: [{ pressure_mb: 1020 }, { pressure_mb: 1020 }], // day 0 avg: 1020
        astro: { sunrise: "05:00:00", sunset: "18:00:00" },
      },
      {
        day: { mintemp_c: 1, maxtemp_c: 5, condition: { icon: "/iconImage" } },
        hour: [{ pressure_mb: 1014 }], // day 1 avg: 1014 (diff of 6 ✅)
        astro: { sunrise: "05:03:00", sunset: "18:02:00" },
      },
      {
        day: { mintemp_c: 1, maxtemp_c: 5, condition: { icon: "/iconImage" } },
        hour: [{ pressure_mb: 1010 }], // day 2 avg: 1010 (< day 0 ✅)
        astro: { sunrise: "05:06:00", sunset: "18:04:00" },
      },
    ],
  },
};
