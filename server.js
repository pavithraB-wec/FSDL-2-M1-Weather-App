import http from "http";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.resolve(__dirname);

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
};

const GEO_API = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_API = "https://api.open-meteo.com/v1/forecast";
const AIR_API = "https://air-quality-api.open-meteo.com/v1/air-quality";

function jsonResponse(res, data, status = 200) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function errorResponse(res, message, status = 400) {
  jsonResponse(res, { error: message }, status);
}

async function handleWeatherRequest(url, res) {
  const city = url.searchParams.get("city")?.trim();
  if (!city) return errorResponse(res, "Please provide a city name.", 400);

  try {
    const geoRes = await fetch(`${GEO_API}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    if (!geoRes.ok) return errorResponse(res, "Unable to lookup city.", 502);

    const geoData = await geoRes.json();
    const place = geoData.results?.[0];
    if (!place) return errorResponse(res, "City not found.", 404);

    const params = new URLSearchParams({
      latitude: String(place.latitude),
      longitude: String(place.longitude),
      current_weather: "true",
      hourly: "temperature_2m,apparent_temperature,relative_humidity_2m,pressure_msl,wind_speed_10m,wind_direction_10m,cloud_cover,precipitation,precipitation_probability,uv_index,visibility,dew_point_2m,weathercode",
      daily: "weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max",
      timezone: "auto",
      forecast_days: "7",
    });

    const [forecastRes, airRes] = await Promise.all([
      fetch(`${FORECAST_API}?${params}`),
      fetch(`${AIR_API}?latitude=${encodeURIComponent(place.latitude)}&longitude=${encodeURIComponent(place.longitude)}&current=us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide&timezone=auto`).catch(() => null),
    ]);

    if (!forecastRes.ok) return errorResponse(res, "Unable to fetch weather data.", 502);

    const weatherData = await forecastRes.json();
    let air = { usAqi: null, pm25: null, pm10: null, ozone: null, no2: null };
    if (airRes && airRes.ok) {
      try {
        const airData = await airRes.json();
        air = {
          usAqi: airData.current?.us_aqi ?? null,
          pm25: airData.current?.pm2_5 ?? null,
          pm10: airData.current?.pm10 ?? null,
          ozone: airData.current?.ozone ?? null,
          no2: airData.current?.nitrogen_dioxide ?? null,
        };
      } catch {
        air = air;
      }
    }

    const current = {
      temperature: weatherData.current_weather?.temperature ?? weatherData.hourly?.temperature_2m?.[0] ?? null,
      feelsLike: weatherData.hourly?.apparent_temperature?.[0] ?? null,
      humidity: weatherData.hourly?.relative_humidity_2m?.[0] ?? null,
      pressure: weatherData.hourly?.pressure_msl?.[0] ?? null,
      windSpeed: weatherData.hourly?.wind_speed_10m?.[0] ?? null,
      windDirection: weatherData.hourly?.wind_direction_10m?.[0] ?? null,
      precipitation: weatherData.hourly?.precipitation?.[0] ?? null,
      weatherCode: weatherData.current_weather?.weathercode ?? weatherData.hourly?.weathercode?.[0] ?? null,
      cloudCover: weatherData.hourly?.cloud_cover?.[0] ?? null,
      dewPoint: weatherData.hourly?.dew_point_2m?.[0] ?? null,
      precipProbability: weatherData.hourly?.precipitation_probability?.[0] ?? null,
      uvIndex: weatherData.hourly?.uv_index?.[0] ?? null,
      visibility: weatherData.hourly?.visibility?.[0] ?? null,
      time: weatherData.current_weather?.time ?? weatherData.hourly?.time?.[0] ?? null,
    };

    const hourly = (weatherData.hourly?.time ?? []).map((date, index) => ({
      time: date,
      temperature: weatherData.hourly.temperature_2m?.[index] ?? 0,
      weatherCode: weatherData.hourly.weathercode?.[index] ?? 0,
      precipProbability: weatherData.hourly.precipitation_probability?.[index] ?? 0,
    }));

    const daily = (weatherData.daily?.time ?? []).map((date, index) => ({
      date,
      weatherCode: weatherData.daily.weathercode?.[index] ?? 0,
      tempMax: weatherData.daily.temperature_2m_max?.[index] ?? 0,
      tempMin: weatherData.daily.temperature_2m_min?.[index] ?? 0,
      sunrise: weatherData.daily.sunrise?.[index] ?? "",
      sunset: weatherData.daily.sunset?.[index] ?? "",
      precipitation: weatherData.daily.precipitation_probability_max?.[index] ?? 0,
    }));

    jsonResponse(res, {
      city: place.name,
      region: place.admin1 ?? "",
      country: place.country ?? "",
      latitude: place.latitude,
      longitude: place.longitude,
      current,
      hourly,
      daily,
      air,
      timezone: weatherData.timezone,
    });
  } catch (error) {
    errorResponse(res, "Server error fetching weather.", 500);
  }
}

async function serveStaticFile(req, res) {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  let filePath = parsedUrl.pathname === "/" ? "/index.html" : parsedUrl.pathname;
  filePath = path.join(PUBLIC_DIR, filePath);

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found");
  }
}

function createServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === "/weather") {
      return handleWeatherRequest(url, res);
    }

    return serveStaticFile(req, res);
  });
}

function startServer(port) {
  const server = createServer();
  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      const nextPort = Number(port) + 1;
      console.warn(`Port ${port} is in use, trying ${nextPort}...`);
      startServer(nextPort);
    } else {
      console.error(error);
      process.exit(1);
    }
  });

  server.listen(port, () => {
    console.log(`SkyCast server running at http://localhost:${port}`);
  });
}

startServer(PORT);
