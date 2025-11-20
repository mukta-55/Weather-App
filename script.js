const getWeatherBtn = document.getElementById("getWeatherBtn");
const cityInput = document.getElementById("cityInput");
const weatherResult = document.getElementById("weatherResult");
const errorMsg = document.getElementById("errorMsg");

getWeatherBtn.addEventListener("click", async () => {
  const city = cityInput.value.trim();
  if (!city) {
    alert("Please enter a city name");
    return;
  }

  weatherResult.classList.add("hidden");
  errorMsg.classList.add("hidden");

  try {
    const response = await fetch(`/api/weather?city=${city}`);
    const data = await response.json();

    if (response.ok) {
      document.getElementById(
        "cityName"
      ).textContent = `${data.name}, ${data.sys.country}`;
      document.getElementById(
        "temperature"
      ).textContent = `Temperature: ${data.main.temp} °C`;
      document.getElementById(
        "description"
      ).textContent = `Weather: ${data.weather[0].description}`;
      document.getElementById(
        "humidity"
      ).textContent = `Humidity: ${data.main.humidity}%`;
      document.getElementById(
        "wind"
      ).textContent = `Wind Speed: ${data.wind.speed} m/s`;
      weatherResult.classList.remove("hidden");
    } else {
      errorMsg.textContent = data.error || "City not found";
      errorMsg.classList.remove("hidden");
    }
  } catch (error) {
    errorMsg.textContent = "Something went wrong. Try again.";
    errorMsg.classList.remove("hidden");
  }
});
