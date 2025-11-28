function fetchWeatherData(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,windspeed_10m&timezone=Atlantic/Canary`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const locationUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=Atlantic/Canary`;

      return fetch(locationUrl);
    })
    .then((response) => response.json())
    .then((locationData) => {
      updateWeatherData(locationData);
    })
    .catch((error) => {
      console.error("Error al obtener los datos:", error);
      document.getElementById("weather").innerText =
        "No se pudo obtener los datos del clima.";
    });
}

function updateWeatherData(locationData) {
  const currentTime = new Date(
    locationData.current_weather.time
  ).toLocaleString("es-ES", { timeZone: "Atlantic/Canary" });
  const weatherDiv = document.getElementById("weather");
  const temperature = locationData.current_weather.temperature;
  const windspeed = locationData.current_weather.windspeed;

  weatherDiv.innerHTML = `
        <p>Origen: Planeta Tierra, Canarias</p>
        <p>Fecha actual: ${currentTime}</p>
        <p>Temperatura actual: ${temperature} °C</p>
        <p>Velocidad del viento: ${windspeed} km/h</p>
    `;
}
