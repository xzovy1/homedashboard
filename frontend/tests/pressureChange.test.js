import { describe, test, expect } from "vitest";
import { calculatePressureChange } from "../src/utils/pressureChange";

const makeData = (todayPressures, tomorrowPressures) => ({
  forecast: {
    forecastday: [
      { hour: todayPressures.map((p) => ({ pressure_mb: p })) },
      { hour: tomorrowPressures.map((p) => ({ pressure_mb: p })) },
    ],
  },
});

describe("calculatePressureChange", () => {
  test("returns false when daily average difference is 0", () => {
    expect(calculatePressureChange(makeData([1010, 1010], [1010, 1010]))).toBe(
      false,
    );
  });

  test("returns false when daily average difference is exactly 5 hPa", () => {
    expect(calculatePressureChange(makeData([1010, 1010], [1015, 1015]))).toBe(
      false,
    );
  });

  test("returns true when daily average difference is exactly 6 hPa", () => {
    expect(calculatePressureChange(makeData([1010, 1010], [1016, 1016]))).toBe(
      true,
    );
  });

  test("returns true when daily average difference is greater than 6 hPa", () => {
    expect(calculatePressureChange(makeData([1000, 1000], [1020, 1020]))).toBe(
      true,
    );
  });

  test("returns true when pressure drops by 6 or more (today higher than tomorrow)", () => {
    expect(calculatePressureChange(makeData([1020, 1020], [1010, 1010]))).toBe(
      true,
    );
  });

  test("correctly averages multiple hourly readings before comparing", () => {
    // today avg: (1000 + 1020) / 2 = 1010
    // tomorrow avg: (1016 + 1020) / 2 = 1018 → diff = 8 → true
    expect(calculatePressureChange(makeData([1000, 1020], [1016, 1020]))).toBe(
      true,
    );
  });
});
