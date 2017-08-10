/* Initially, we set the default bg colour to black */
// var red = 0;	
// var green = 0;
// var blue = 0;
var pi = Math.PI;
var lat = 0;
var lng = 0;
var Coords = ''
var date = new Date();
var alpha = 1;
var hue = 0;
var sat = 100;
var light = 0; // midnight
var font_light = 75;
// We also set the temperature to 0˚C
var degree = 'c';
var tempC = 0;
var tempF = (9/5)*tempC + 32;

function reset_vars(){
	lat = 0;
	lng = 0;
	Coords = ""
	date = new Date();
	alpha = 1;
	hue = 0;
	sat = 100;
	light = 0; // midnight
	font_light = 75;
	// We also set the temperature to 0˚C
	degree = 'c';
	tempC = 0;
	tempF = (9/5)*tempC + 32;
}

// var locationName = 'Toronto, CA';

// Once the page loads
$(document).ready(function(){
	reset_vars();
	Coords = randomCoords();

	if (navigator.geolocation){
		reset_vars();
		setLoadingUI();
		if (navigator.geolocation.getCurrentPosition(getLocation)){
			// Use geolocation
		}
		else {
			useIPLocation();
		}
	}
	else {
		useIPLocation();
	}

	// Reload the data when user presses the Shuffle button
	$('.shuffle').click(function(){
		Coords = randomCoords();
		reset_vars();
		getTemp(Coords);
	});

	$('.geolocate').click(function(){
		useIPLocation();
	})

	$('#location').on('focus', function() {
		// $(this).text('');
		$(this).on('keydown', function(e) {  
			// console.log(e.keyCode);
		    if(e.keyCode == 13) // If pressed ENTER key
		    {
		        e.preventDefault();
		        $(this).blur();
		        reset_vars();
		        getTemp($(this).text());
		    }
		});
	});

});

// DEBUGING FUNCTION --------------------------------//
// $(document).click(function(){
// 		hue = 0;
// 		light = 40;
// 		font_light = 90;
// 		degree = 'c';
// 		timeToLight();
// 		locationName = chance.country({full : true});
// 		console.log(locationName);
// 		if (navigator.geolocation){
// 			if (navigator.geolocation.getCurrentPosition(getLocation)){
// 				console.log(locationName);
// 				//
// 			}
// 			else {
// 				getTemp(locationName);
// 				getForecast(locationName);
// 			}
// 		}
// 		else {
// 			getTemp(locationName);
// 			getForecast(locationName);
// 		}
// });
 // ------------------------------------------------- //

function useIPLocation(){
	reset_vars();
	setLoadingUI();
	$.getJSON('//freegeoip.net/json/?callback=?', function(data) {
		console.log(JSON.stringify(data, null, 2));
		if (data)
			var currentLocation = JSON.stringify(data.latitude) + "," + JSON.stringify(data.longitude)
		else
			var currentLocation = randomCoords(); // Fallback to random coords
		getTemp(currentLocation)
	});
	// getTemp(Coords);
}

function randomCoords() {
	ll = chance.coordinates();
	console.log(ll);
	return ll
}

// Converts lat, long doubles to single string, then calls getTemp/getForecast
function getLocation(data){
	reset_vars();
	lat = data.coords.latitude;
	lng = data.coords.longitude;
	locationName = lat + ', ' + lng;

	degree= 'c';
	getTemp(locationName);
}

// Calls for the current temp
function getTemp(myLocation){
	// Make an AJAX call to Yahoo, (or other) and assign it to temperature
	var dfd = $.Deferred;
	reset_vars();
	setLoadingUI();
	$.simpleWeather({
		location: myLocation,
		unit: degree,
		success: function(weather){
			unsetLoadingUI();
			tempC = weather.temp;
			console.log(weather);
			// Set temperature numbers in HTML
			if (weather.country == 'United States') {
				tempF = parseInt((9/5)*tempC + 32);
				$('#localTemp #temp').html(tempF);
				degree = 'f';
				weather.country = "USA";
			}
			else {
				degree = 'c';
				$('#localTemp #temp').html(tempC);
			}
			if (weather.country == "United Kingdom") {
				weather.country = "UK";
			}
			if (weather.country == "United Arab Emirates") {
				weather.country = "UAE";
			}
			$('#localTemp #deg').html('&deg;' + degree.toUpperCase());
			$('#localTemp #location').html(weather.city + ', ' + weather.country);

			idxt = weather.title.search(/\d/) // Index of local time in title + 9
			var localTime = weather.title.slice(idxt, idxt + 8);
			
			hue = tempToColor(tempC);
			light = timeToLight(localTime);
			sat = vizToSat(weather.visibility)
			// console.log("saturation: " + sat)
			setCondition(weather.currently)

			setLocalColor(hue,sat,light,alpha);

			getForecast(weather)

			//dfd.resolve();
		},
		error: function(){
			reset_vars();
			Coords = randomCoords()
			getTemp(Coords);
		}
	});
	//return dfd.promise();
	// var t = $('#temp_slider').val();
	// $('#again').html(t);
	// $('#localTemp #temp').html(t);
	// tempC = parseFloat(t);
}

// Calls for the 5 day forecast
function getForecast(weather){
	hueCast = []
	for (var i = weather.forecast.length - 1; i >= 0; i--) {
		hueCast[i] = tempToColor(avg(weather.forecast[i].high, weather.forecast[i].low));
	}
	
	setForecastVertical(hueCast,sat,light,alpha);
	setForecastText(weather);
}

// Converts a temp value to a hue value. returns int.
function tempToColor(temp){
	// USE HSLA //
	var maxColor = 180;
	var tempRange = 80; // -50 -> 50
	var center = 0;
	var minTemp = center - tempRange/2;
	var maxTemp = center + tempRange/2;

	var minHue = 270;
	var maxHue = 20;
	var hueRange = minHue - maxHue;

	//hue = Math

	hue = minHue - (temp - minTemp)*hueRange/tempRange;
	return parseInt(hue);
	//console.log(hue);
}

function timeToLight(t){
	if (typeof t === 'undefined') {
		t = date.getHours();
		if (date.getMinutes() > 30)
			t++
	} else {
		// console.log(typeof h)
		h = parseFloat(t.slice(0,2));
		m = parseFloat(t.slice(3,5));

		if ((t.slice(6,8) == 'PM' && h < 12) || (t.slice(6,8) == 'AM' && h == 12.)) {
			h += 12;
		}

		t = h + m/60.
	}
	
	var l = -Math.cos(pi/12*t)/2 + 0.5;
	var minL = 22
	var maxL = 44
	var lght = minL + l*(maxL-minL); // Range 16% - 40% lightness
	return lght;
}

function vizToSat(viz) {
	var coef = 4;
	var offs = 20
	var hueOffset = -0.5*Math.cos(pi*(hue) / (2*(50)) );
	hueOffset = 1+Math.max(0, hueOffset);
	coef *= hueOffset;

	console.log(hueOffset)
	return Math.min(coef*viz, 100);
}

function setCondition(condition){
	if (condition == 'Snow' || condition =='Snowy') {
		$('.conditions').addClass('snow');
	}
}

// Sets the #local div to the current temp 
// And sets Divider color
function setLocalColor(h,s,l,a) {
	var colorString = 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
	 // console.log(colorString);
 	$('#localTemp').css('background-color', colorString);
 	$('.shuffle').css('background-color', colorString);

 	setTextColor(h,s,l,a);
 	setDividerColor(h,s,l,a);	
}

function setTextColor(h,s,l,a) {
	// var colorString = 'hsl(0,0%,' + (l + 55) + '%)'
	// $('.display-lrg').css('color', colorString);
	// document.querySelector(".svgClass").getSVGDocument().getElementById("svg").setAttribute("style", "fill: " + colorString)

}

function setDividerColor(h,s,l,a) {
	// Set Divider Color
 	var t = date.getTime();
 	var x = (t%2) ? -1 : 1;
 	//x = 1;
 	//var y = 360/(t%2 + 2); // half or 1/3 away
 	// var y = (x>0) ? 120 : 240; //1/3 or half away
 	var y = 120; // Always a third away
 	// console.log(x*y);
 	$('.divider').css('background-color', 'hsl('+ (h + x*y)%360 +','+ s/3 +'%,' + l*1.2 + '%)');
}

// Sets the #forecast div to the appropriate colours
// function setForecastGradient(h,s,v,a) {
// 	var cs = [];//'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
// 	for (var i = h.length - 1; i >= 0; i--) {
// 		cs[i] = 'hsl(' + h[i].toString() + ',' + s.toString() + '%,' + v.toString() + '%)';
// 	}

// 	// var gradString_moz
// 	var gs_webkit = "-webkit-gradient(linear, left top, right top, color-stop(10%," + cs[0] +"), color-stop(30%," + cs[1] + "), color-stop(50%," + cs[2]+ "), color-stop(70%," +cs[3] +"), color-stop(90%, "+cs[4] + "))"; /* Chrome,Safari4+ */
// 	var gs_webkit_linear = "-webkit-linear-gradient(left,  " + cs[0] +" 10%," + cs[1] + " 30%," + cs[2]+ " 50%," +cs[3] +" 70%, "+cs[4] + " 90%)"; /* Chrome10+,Safari5.1+ */
// 	var gs = "linear-gradient(to right,  " + cs[0] +" 10%," + cs[1] + " 30%," + cs[2]+ " 50%," +cs[3] +" 70%, "+cs[4] + " 90%)"; /* W3C */
// 	var gs_moz = "-moz-linear-gradient(left,  " + cs[0] +" 10%, " + cs[1] + " 30%, " + cs[2]+ " 50%, " +cs[3] +" 70%,  "+cs[4] + " 90%)";
// 	var gs_o = "-o-linear-gradient(left,  " + cs[0] +" 10%," + cs[1] + " 30%," + cs[2]+ " 50%," +cs[3] +" 70%, "+cs[4] + " 90%)";
// 	var gs_ms = "-ms-linear-gradient(left,  " + cs[0] +" 10%," + cs[1] + " 30%," + cs[2]+ " 50%," +cs[3] +" 70%, "+cs[4] + " 90%)";
// 	//console.log(gs);

// 	$('#forecast').css({
// 		background: gs_moz,
//  		background: gs_webkit,
//  		background: gs_webkit_linear,
//  		background: gs_o,
//  		background: gs_ms,
//  		background: gs,
//  	});
// }
function setForecastVertical(h,s,v,a) {
	var cs = [];//'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
	for (var i = h.length - 1; i >= 0; i--) {
		cs[i] = 'hsl(' + h[i].toString() + ',' + s.toString() + '%,' + v.toString() + '%)';
		var j = i + 1;
		$('#forecast li#day'+ j).css({
			backgroundColor: cs[i]
		});
	}
}

function setForecastText(w) {
	for (var i = w.forecast.length - 1; i >= 0; i--) {
		var day = w.forecast[i].day;
		var temp = avg(w.forecast[i].high,w.forecast[i].low);
		//console.log(temp);
		if (w.country == 'United States') {
				temp = parseInt((9/5)*temp + 32);
				degree = 'f';
			}
		else {
			degree = 'c';
		}
		$('#forecast #day' + (i+1)).html(day + "<br/>" + temp + "&deg;" + degree.toUpperCase());
		
	}
}

function setLoadingUI(){
	$('.shuffle').addClass('loading');
	$('.shuffle').text('Loading...');
}

function unsetLoadingUI(){
	$('.shuffle').removeClass('loading');
	$('.shuffle').text('I\'m Feeling Lucky!');	
	// $('.shuffle').text('');	
}

function avg (a,b) {
	c = (parseInt(a) + parseInt(b));
	return parseInt(c/2);
}

function goTo(manual_location) {
	reset_vars();
	getTemp(manual_location);
}


// #214739