const API_KEY = "YOUR_OPENWEATHER_API_KEY"; // replace with your key

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const geoBtn = document.getElementById("geoBtn");
const weatherDisplay = document.getElementById("weatherDisplay");
const cityBtns = document.querySelectorAll(".cityBtn");
const unitToggle = document.getElementById("unitToggle");

let currentUnit = "metric"; // metric = °C, imperial = °F

async function fetchWeather(city) {
  weatherDisplay.innerHTML = "<p>Loading...</p>";
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${Nairobi}&units=metric&appid=${a855fdf3492437631d353952b05d3212}`
    );
    const data = await res.json();

    if (data.cod !== 200) {
      weatherDisplay.innerHTML = `<p>${data.message}</p>`;
      return;
    }

    displayWeather(data);
  } catch {
    weatherDisplay.innerHTML = "<p>Error fetching weather</p>";
  }
}

function displayWeather(data) {
  let temp = data.main.temp;
  if (currentUnit === "imperial") temp = (temp * 9) / 5 + 32;

  weatherDisplay.innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <p>🌡️ ${temp.toFixed(1)}°${currentUnit === "metric" ? "C" : "F"}</p>
        <p>Weather: ${data.weather[0].description}</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind: ${data.wind.speed} m/s</p>
    `;

  setBackground(data.weather[0].main);
}

function setBackground(weather) {
  const body = document.body;
  switch (weather.toLowerCase()) {
    case "clear":
      body.style.background = "linear-gradient(to top, #fddb92, #d1fdff)";
      break;
    case "clouds":
      body.style.background = "linear-gradient(to top, #d7d2cc, #304352)";
      break;
    case "rain":
    case "drizzle":
      body.style.background = "linear-gradient(to top, #4e54c8, #8f94fb)";
      break;
    case "snow":
      body.style.background = "linear-gradient(to top, #e6e9f0, #eef1f5)";
      break;
    default:
      body.style.background = "linear-gradient(to top, #74ebd5, #acb6e5)";
  }
}

// Event listeners
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) fetchWeather(city);
});

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const city = cityInput.value.trim();
    if (city) fetchWeather(city);
  }
});

geoBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported");
    return;
  }
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords;
    weatherDisplay.innerHTML = "<p>Loading...</p>";
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
      );
      const data = await res.json();
      displayWeather(data);
    } catch {
      weatherDisplay.innerHTML = "<p>Error fetching weather</p>";
    }
  });
});

cityBtns.forEach((btn) =>
  btn.addEventListener("click", () => fetchWeather(btn.textContent))
);

unitToggle.addEventListener("change", () => {
  currentUnit = unitToggle.checked ? "imperial" : "metric";
  const city = cityInput.value.trim();
  if (city) fetchWeather(city);
});
