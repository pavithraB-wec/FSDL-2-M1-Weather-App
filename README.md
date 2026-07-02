# SkyCast — Weather Forecast

SkyCast is a weather dashboard built with plain HTML, CSS, JavaScript, and Node.js.

## Overview

This app fetches weather and air-quality data from Open-Meteo and displays:

- Current temperature, feels-like, humidity, wind, and pressure
- UV index, visibility, precipitation, and air quality
- Hourly forecast cards
- 7-day forecast list
- Weather detail cards including sunrise, sunset, cloud cover, and timezone
- City search powered by Open-Meteo geocoding

## Project structure

- `index.html` — app UI and layout
- `styles.css` — dashboard styling
- `app.js` — browser logic for search and rendering
- `server.js` — Node.js server proxying weather API requests

## Requirements

- Node.js 18+ recommended
- npm

## Setup

```bash
npm install
```

## Run locally

```bash
npm start
```

The server listens on `http://localhost:3000` by default. If port `3000` is in use, it will automatically try the next available port.

## Notes

- The app uses Open-Meteo public APIs, so no API key is required.
- The Node server proxies requests to avoid CORS issues and to simplify browser requests.
- If the app reports missing hourly or daily data, try refreshing or searching again for a different city.

## License

MIT
