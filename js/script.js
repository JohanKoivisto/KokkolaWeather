// AUTHOR: Johan Koivisto
// Weather API by Meteorologisk Institutt

//// RENDER STUFFS ////
///////////////////////
const WeatherNow = (weather) => {
    const weatherDiv = document.getElementById("weather-main")
    weatherDiv.innerHTML += `
    <img src="img/${weather.next_1_hours.summary.symbol_code}.svg" alt="kokkola weather symbol" width="100">
    <h3> Lämpötila: ${weather.instant.details.air_temperature}&#176</h3>
    <h3> Ilmankosteus: ${weather.instant.details.relative_humidity}%</h3>
    <h3> Tuuli: ${weather.instant.details.wind_speed} m/s</h3>
    <h3> Tuulen suunta: ${weather.instant.details.wind_from_direction}</h3>
    ` // TODO: WIND DIRECTION ARROW, on compass would be good
}

const sunriseSunset = (sunrise, sunset) => {
    const sunInfoDiv = document.getElementById("weather-main")
    const sunriseHMM = `${sunrise.toTimeString().substr(0,5)}`
    const sunsetHMM = `${sunset.toTimeString().substr(0,5)}`
    sunInfoDiv.innerHTML += `
    <h3>Aurinko nousee: ${sunriseHMM}</h3>
    <h3>Aurinko laskee: ${sunsetHMM}</h3>
    `
}

const dailyForecast = (weather) => {
    const dailyDiv = document.getElementById("daily-forecast")
    for (let i = 1; i < 25; i++) {
        const date = new Date(`${weather[i].time}`)
        const hours = date.getHours()
        dailyDiv.innerHTML += `<div class="daily">
        <h3>${hours}:00</h3>
        <img src="img/${weather[i].data.next_1_hours.summary.symbol_code}.svg" alt="kokkola weather symbol" width="50">
        <p>${weather[i].data.instant.details.air_temperature}&#176</p>
        </div>`
    }
}

const weeklyForecast = (warmest, coldest, icon, weekday) => {
    const weeklyDiv = document.getElementById("weekly-forecast")
    weeklyDiv.innerHTML += `
    <div class="weekly">
        <h3>${weekday}
        <div><img src="img/${icon}.svg" alt="kokkola weather symbol" width="50"></div>
        <p>${coldest}&#176/${warmest}&#176</p>
    </div>`
}



///// GET AND HANDLE DATA /////
///////////////////////////////
const getWeather = async () => {
    try {
        const resWeather = await fetch("https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=63.83&lon=23.13")
        const weatherData = await resWeather.json()
        const currentWeather = weatherData.properties.timeseries[0].data
        const hoursForecast = weatherData.properties.timeseries
        console.log(weatherData.properties.timeseries)
        WeatherNow(currentWeather)
        dailyForecast(hoursForecast)
        weeklyForecastSort(hoursForecast)
    } catch {
        console.log("something went wrong");
    }
}

const getSunset = async () => {
    try {
        const date = new Date();
        // get correct timezone and format to yyyy-mm-dd format
        const today = new Date(date.getTime() - (date.getTimezoneOffset() * 60000 ))
                    .toISOString()
                    .split("T")[0];
        const resSunset = await fetch(`https://api.met.no/weatherapi/sunrise/2.0/.json?lat=63.83&lon=23.13&date=${today}&offset=+02:00`)
        const sunsetData = await resSunset.json()
        const sunrise = new Date(sunsetData.location.time[0].sunrise.time)
        const sunset = new Date(sunsetData.location.time[0].sunset.time)
        sunriseSunset(sunrise, sunset)
        
    } catch {
        console.log("something went wrong");
    }
}

const weeklyForecastSort = (weather) => {
    let arr = []
    weather.forEach(el => {
        const time = new Date(el.time).getHours()
        arr.push(el.data.instant.details.air_temperature)
            if (time === 14) {
                let warmestTemp = Math.max(...arr);
                let coldestTemp = Math.min(...arr)
                console.log(arr);
                arr = []
                const day = new Date(el.time)
                const weekday = day.toLocaleString("fi-FI", { weekday: "short" })
                icon = el.data.next_12_hours.summary.symbol_code
                weeklyForecast(warmestTemp, coldestTemp, icon, weekday)
            }
            
    })
}



getWeather()
getSunset();

