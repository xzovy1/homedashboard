const calculatePressureChange = (data) => {
  const dailyPressureAverages = [];

  const days = data.forecast.forecastday;
  for (let i = 0; i < days.length; i++) {
    let hours = days[i].hour;
    let avg = 0;
    for (let j = 0; j < hours.length; j++) {
      avg += hours[j].pressure_mb;
    }
    dailyPressureAverages.push(Math.round((avg /= hours.length)));
  }
  const pressureDifference = Math.abs(
    dailyPressureAverages[1] - dailyPressureAverages[0],
  );

  if (pressureDifference >= 6) {
    return true;
  } else return false;
};

export { calculatePressureChange };
