const cityInput = document.getElementById("city-input");
const searchButton = document.getElementById("search-button");
const statusEl = document.getElementById("status");
const locationEl = document.getElementById("location");
const localTimeEl = document.getElementById("local-time");
const descriptionEl = document.getElementById("description");
const temperatureEl = document.getElementById("temperature");
const tempRangeEl = document.getElementById("temp-range");
const feelsLikeEl = document.getElementById("feels-like");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const pressureEl = document.getElementById("pressure");
const uvIndexEl = document.getElementById("uv-index");
const visibilityEl = document.getElementById("visibility");
const precipitationEl = document.getElementById("precipitation");
const aqiEl = document.getElementById("aqi");
const hourlyList = document.getElementById("hourly-list");
const dailyList = document.getElementById("daily-list");
const windDirectionEl = document.getElementById("wind-direction");
const dewPointEl = document.getElementById("dew-point");
const sunriseEl = document.getElementById("sunrise");
const sunsetEl = document.getElementById("sunset");
const cloudCoverEl = document.getElementById("cloud-cover");
const timezoneEl = document.getElementById("timezone");

const API_BASE = "/weather";

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#b91c1c" : "#334155";
}

function formatDate(value, options = {}) {
  return new Intl.DateTimeFormat("en-US", options).format(new Date(value));
}

function getWeatherDescription(code) {
  const map = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Freezing drizzle",
    57: "Heavy freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Heavy rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
  };
  return map[code] || "Current conditions";
}

function toDirection(deg) {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return directions[Math.round(deg / 22.5) % 16];
}

function renderHourly(hours) {
  if (!Array.isArray(hours) || hours.length === 0) {
    hourlyList.innerHTML = `<div class="empty-card">Hourly forecast is unavailable.</div>`;
    return;
  }

  hourlyList.innerHTML = hours
    .slice(0, 12)
    .map(
      (hour) => `
      <div class="hourly-card">
        <div>${formatDate(hour.time, { hour: "numeric", hour12: true })}</div>
        <strong>${Math.round(hour.temperature)}°</strong>
        <small>${getWeatherDescription(hour.weatherCode)}</small>
        <span>${Math.round(hour.precipProbability ?? 0)}% rain</span>
      </div>`
    )
    .join("");
}

function renderDaily(days) {
  if (!Array.isArray(days) || days.length === 0) {
    dailyList.innerHTML = `<div class="empty-card">7-day forecast is unavailable.</div>`;
    return;
  }

  dailyList.innerHTML = days
    .map(
      (day) => `
      <div class="daily-card">
        <div>
          <strong>${formatDate(day.date, { weekday: "short", month: "short", day: "numeric" })}</strong>
          <span>${getWeatherDescription(day.weatherCode)}</span>
        </div>
        <div>${Math.round(day.tempMin)}° / ${Math.round(day.tempMax)}°</div>
        <div>${Math.round(day.precipitation ?? 0)}% rain</div>
      </div>`
    )
    .join("");
}

function showWeather(data) {
  document.querySelectorAll(".hidden").forEach((el) => el.classList.remove("hidden"));

  locationEl.textContent = `${data.city}, ${data.country}`;
  localTimeEl.textContent = `Updated ${formatDate(data.current.time ?? new Date(), { hour: "numeric", minute: "2-digit", hour12: true })}`;
  descriptionEl.textContent = getWeatherDescription(data.current.weatherCode);
  temperatureEl.textContent = `${Math.round(data.current.temperature ?? 0)}°C`;

  const firstDay = Array.isArray(data.daily) && data.daily.length ? data.daily[0] : null;
  tempRangeEl.textContent = firstDay ? `${Math.round(firstDay.tempMin)}° / ${Math.round(firstDay.tempMax)}°` : "--";

  feelsLikeEl.textContent = `${Math.round(data.current.feelsLike ?? data.current.temperature ?? 0)}°C`;
  humidityEl.textContent = `${data.current.humidity ?? 0}%`;
  windEl.textContent = `${data.current.windSpeed ?? 0} km/h`;
  pressureEl.textContent = `${data.current.pressure ?? 0} hPa`;
  uvIndexEl.textContent = `${data.current.uvIndex ?? "--"}`;
  visibilityEl.textContent = `${data.current.visibility ?? 0} km`;
  precipitationEl.textContent = `${data.current.precipProbability ?? 0}%`;
  aqiEl.textContent = data.air?.usAqi ? `${data.air.usAqi} AQI` : "N/A";

  windDirectionEl.textContent = data.current.windDirection ? toDirection(data.current.windDirection) : "--";
  dewPointEl.textContent = `${Math.round(data.current.dewPoint ?? 0)}°C`;
  sunriseEl.textContent = firstDay?.sunrise ?? "--";
  sunsetEl.textContent = firstDay?.sunset ?? "--";
  cloudCoverEl.textContent = `${data.current.cloudCover ?? 0}%`;
  timezoneEl.textContent = data.timezone ?? "--";

  renderHourly(data.hourly);
  renderDaily(data.daily);
}

async function fetchWeather(city) {
  try {
    setStatus("Loading weather...");
    const response = await fetch(`${API_BASE}?city=${encodeURIComponent(city)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to fetch weather.");
    }

    showWeather(data);
    setStatus(`Weather loaded for ${data.city}, ${data.country}.`);
  } catch (error) {
    setStatus(error.message, true);
  }
}

function onSearch() {
  const city = cityInput.value.trim();
  if (!city) {
    setStatus("Please enter a city name.", true);
    return;
  }
  fetchWeather(city);
}

searchButton.addEventListener("click", onSearch);
cityInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    onSearch();
  }
});
