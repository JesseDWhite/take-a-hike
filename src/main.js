import $ from 'jquery';
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/styles.css';

import NpsMainService from './js/nps-main-api.js';
import WeatherService from './js/weather-api';

function getStateParks(response) {
  $(".parkInfoOutput").hide();
  let parkListHTML = ``;
  if (response.data[0]) {
    response.data.forEach((object, index) => {
      parkListHTML += (`<p><button id=${index} class="park-names">${object.fullName}</button></p>`);
    });
    $(".park-list").html(parkListHTML);
  } else {
    $(".park-list").html(`<br><h1><em><strong>🍃 Oops! I can't beleaf it! That state doesn't exist 🍃</em></strong></h1>`);
  }
}

function getWeatherElements(response) {
  const description = response.weather[0].description;
  String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  };
  if (response.main) {
    $("#current-temp").text(`Current Temp: ${response.main.temp} ℉`);

    $("#weather-description").text(`Weather Overview: ${description.capitalize()}`);
    $("#high-temp").text(`High: ${response.main.temp_max} ℉`);

    $("#low-temp").text(`Low: ${response.main.temp_min} ℉`);
    $("#wind-speed").text(`Wind Speed: ${response.wind.speed} mph`);
    if (response.rain) {
      $("#rain-total").text(`${response.rain["1h"]} inches have been recorded in the last hour.`);
    } else {
      $("#rain-total").text(`There has been no measurable rainfall for the past hour`);
    }
    if (response.snow) {
      $("#snow-total").text(`${response.snow["1h"]} inches have been recorded in the last hour.`);
    } else {
      $("#snow-total").text(`There has been no measurable snowfall for the past hour`);
    }
  } else {
    $("#show-weather").text(response);
  }
  $(".output").text("Oops, sorry, we didnt find anything. Please try again.");
}

function parksInfo(response) {
  $(".park-names").click(function () {
    $(".park-names").fadeOut();
    $("#main-page").fadeOut();
    const clickedPark = this.id;
    const parkName = `<h2>${response.data[clickedPark].fullName}</h2>`;
    const parkDescription = `<h3>Description:</h3>  <ol>${response.data[clickedPark].description}</ol>`;
    const parkFees = `<h3>Fee: ${response.data[clickedPark].entranceFees[0].cost}</h3>`;
    const parkZip = response.data[clickedPark].addresses[0].postalCode;
    const formattedZip = parkZip.slice(0, 5);
    const weatherHTML = `<section id="show-weather" class="container">
    <div id="current-temp"></div>
    <div id="weather-description"></div>
    <div id="high-temp"></div>
    <div id="low-temp"></div>
    <div id="wind-speed"></div>
    <div id="rain-total"></div>
    <div id="snow-total"></div>
    </section>`;
    const backButton = `<button id="back-button" class="btn btn-success">Back to Results</button>`;
    const parkImage = `<img src=${response.data[clickedPark].images[0].url} alt=${response.data[clickedPark].images[0].altText} id="park-image-header">`;

    let parkActivities = ``;
    response.data[clickedPark].activities.forEach((activity) => {
      parkActivities += `<li>${activity.name}</li>`;
    });

    const parkCode = response.data[clickedPark].parkCode;
    NpsMainService.getAlert(parkCode)
      .then(function (response) {
        let parkAlerts = ``;
        if (!response.data[0]) {
          parkAlerts = "None";
        } else {
          response.data.forEach((alert) => {
            if (alert.url === "") {
              parkAlerts += `<li>${alert.category} <p>${alert.description}</p>`;
            } else {
              parkAlerts += `<li>${alert.category} <p>${alert.description} <br> <a href="${alert.url}" target="_blank">READ MORE HERE</a></li></p>`;
            }
          });
        }
        $(".parkInfoOutput").html(`${parkImage} <br> <br> ${parkName} <br> ${parkDescription} <br> <h3>Alerts/Warnings:</h3><ol>${parkAlerts}</ol> <br> <h3>Weather</h3>${weatherHTML}<br> ${parkFees} <br> <h3>Park Activities:</h3> <ul>${parkActivities}</ul> ${backButton}`);
        WeatherService.getWeather(formattedZip)
          .then(function (response) {
            getWeatherElements(response);
            $(".parkInfoOutput").slideDown();
            $("#back-button").click(function (event) {
              event.preventDefault();
              $(".parkInfoOutput").fadeOut();
              $(".park-names").fadeIn();
              $("#main-page").fadeIn();
            });
          });
      });
  });
}


$(document).ready(function () {
  $("#main-page").submit(function (event) {
    event.preventDefault();

    const selectedState = $("#state-select").val();

    NpsMainService.getPark(selectedState)
      .then(function (response) {

        getStateParks(response);
        parksInfo(response);
      });
  });
});