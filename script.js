$(document).ready(function () {
    var apiKey = 'bc8bffadcdca6a14d021d093eac22797';

    var cities = $('#cities');
    var todaysDate = $('#date');
    var symbols = $('#symbols');
    var temp = $('#temp');
    var humid = $('#humidity');
    var windSpeed = $('#wind');
    var uv = $('span#uv-index');
    var allCities = $('div.cityList');

  
   var cityData = $('#city-input');


   var searchedCities = [];

   function compare(one, two) {
    
       var one = one.city.toUpperCase();
       var two = two.city.toUpperCase();

       var comparison = 0;
       if (one > two) {
           comparison = 1;
       } else if (one < two) {
           comparison = -1;
       }
   }
    function dataForCitiy() {
        var savedCities = JSON.parse(localStorage.getItem('searchedCities'));
        if (savedCities) {
            searchedCities = savedCities;
        }
    }

    function saveCities() {
        localStorage.setItem('searchedCities', JSON.stringify(searchedCities));
    }

    function buildURLFromInputs(city) {
        if (city) {
            return `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
        }
    }

    function buildURLFromId(id) {
        return `https://api.openweathermap.org/data/2.5/weather?id=${id}&appid=${apiKey}`;
    }

     function showCities(searchedCities) {
        allCities.empty();
        searchedCities.splice(5);
        var organized = [...searchedCities];
        organized.sort(compare);
        organized.forEach(function (location) {
        });
    }

    function conditions(queryURL) {

        $.ajax({
            url: queryURL,
            method: 'GET'
        }).then(function (response) {

            var city = response.name;
            var id = response.id;
            if (searchedCities[0]) {
                searchedCities = $.grep(searchedCities, function (storedCity) {
                    return id !== storedCity.id;
                })
            
            cities.text(response.name);
            var format = moment.unix(response.dt).format('L');
            todaysDate.text(format);
            var icons = response.weather[0].icon;
            symbols.attr('src', `http://openweathermap.org/img/wn/${icons}.png`).attr('alt', response.weather[0].description);
            temp.html(((response.main.temp - 273.15) * 1.8 + 32).toFixed(1));
            humid.text(response.main.humidity);
            windSpeed.text((response.wind.speed * 2.237).toFixed(1));

    
            var lat = response.coord.lat;
            var lon = response.coord.lon;
            var queryURLAll = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`;
            $.ajax({
                url: queryURLAll,
                method: 'GET'
            }).then(function (response) {
                var uvIndex = response.current.uvi;
                uv.text(response.current.uvi);
                var cast = response.daily;
                for (var i = 0; i <= 5; i++) {
                    var current = cast[i];
                    $(`div.day-${i} .card-title`).text(moment.unix(current.dt).format('L'));
                    $(`div.day-${i} .cast-img`).attr(
                        'src',
                        `http://openweathermap.org/img/wn/${current.weather[0].icon}.png`
                    ).attr('alt', current.weather[0].description);
                    $(`div.day-${i} .cast-temp`).text(((current.temp.day - 273.15) * 1.8 + 32).toFixed(1));
                    $(`div.day-${i} .cast-humid`).text(current.humidity);
                }
            });
        });
    }

     function showLast() {
        if (searchedCities[0]) {
            var queryURL = buildURLFromId(searchedCities[0].id);
            conditions(queryURL);
        } 
    }
 
    $('#search-btn').on('click', function (event) {
        event.preventDefault();
        var city = cityData.val().trim();
        city = city.replace(' ', '%30');

       
        cityData.val('');
        if (city) {
            var queryURL = buildURLFromInputs(city);
            conditions(queryURL);
        }
    }); 
    
    $(document).on("click", "button.city-btn", function (event) {
        var clicked = $(this).text();
        var foundCity = $.grep(searchedCities, function (storedCity) {
            return clicked === storedCity.city;
        })
        var queryURL = buildURLFromId(foundCity[0].id)
        conditions(queryURL);
    });


    dataForCitiy();
    showCities(searchedCities);
    showLast();

});