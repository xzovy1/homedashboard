import { http, HttpResponse } from "msw";

import { WEATHER_URL } from "../components/Weather";
import { GROCERIES_URL } from "../components/Grocery/Groceries";

import { mockedWeather } from "./weatherData";
export const handlers = [
  // Weather Widget
  http.get(WEATHER_URL, () => HttpResponse.json(mockedWeather)),
  http.get("http://mock-api/weather", () => {
    HttpResponse.json(mockedWeather);
  }),

  //Categories
  http.get(GROCERIES_URL + "/categories", () => {
    return HttpResponse.json(["aisles", "bakery"]);
  }),

  //Groceries
  http.post(GROCERIES_URL + "/searchItem", async () => {
    return HttpResponse.json({ query: "test item" });
  }),
  http.post(GROCERIES_URL + "/searchItem/test", async ({ request }) => {
    const { method, url, mode } = request;
    return HttpResponse.json({ method, url, mode });
  }),
  http.post(GROCERIES_URL + "/list", async () => {
    return HttpResponse.json({ query: "test item" });
  }),
  http.post(GROCERIES_URL + "/createItem", async () => {
    return HttpResponse.json({ query: "test item" });
  }),
];
