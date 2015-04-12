/* Initially, we set the default bg colour to black */
// var red = 0;	
// var green = 0;
// var blue = 0;
var pi = Math.PI;
var date = new Date();
var alpha = 1;
var hue = 0;
var sat = 100;
var light = 40;
var font_light = 90;
// We also set the temperature to 0˚C
var degree = 'c';
var tempC = 0;
var tempF = (9/5)*tempC + 32;

var locationName = 'Sydney, AU';



$(document).ready(function(){
		timeToLight();
		locationName = chance.country({full : true});
		console.log(locationName);
		if (navigator.geolocation){
			if (navigator.geolocation.getCurrentPosition(getLocation)){
				//
			}
			else {
				//Reset the units
				degree = 'c'

				getTemp(locationName);
				getForecast(locationName);
			}
		}
		else {
			//Reset the units
			degree = 'c'
			getTemp(locationName);
			getForecast(locationName);
		}
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

function timeToLight(){
	
	var h = date.getHours();
	if (date.getMinutes() > 30) {h++}

	var l = -Math.cos(pi/12*h)*5;
	light += l;
	font_light = light + 55;
	$('.display-lrg').css('color', 'hsl(0,0%,' + font_light + '%)');
}

function getLocation(data){
	var lat = data.coords.latitude;
	var lng = data.coords.longitude;
	locationName = lat + ', ' + lng;
	degree= 'c';
	getTemp(locationName);
	getForecast(locationName);
}
// Calls for the current temp
function getTemp(myLocation){
	// Make an AJAX call to Yahoo, (or other) and assign it to temperature
	var dfd = $.Deferred;
	$.simpleWeather({
		location: myLocation,
		unit: degree,
		success: function(weather){
			tempC = weather.temp;
			console.log(weather);

			if (weather.country == 'United States') {
				tempF = parseInt((9/5)*tempC + 32);
				$('#localTemp #temp').html(tempF);
				degree = 'f';
			}
			else {
				degree = 'c';
				$('#localTemp #temp').html(tempC);
			}

			$('#localTemp #deg').html('&deg;' + degree.toUpperCase());

			if (weather.region) {
				var region = ', ' + weather.region;
			}
			else
				var region = '';


			$('#localTemp #location').html(weather.city + region);

			hue = tempToColor(tempC);
			setLocalColor(hue,sat,light,alpha);

			console.log(weather.currently);
			setCondition(weather.currently);
			//dfd.resolve();
		},
		error: function(){
			locationName = chance.country({full : true});
			console.log(locationName);
			getTemp(locationName);
			getForecast(locationName);
		}
	});
	//return dfd.promise();

	// var t = $('#temp_slider').val();
	// $('#again').html(t);
	// $('#localTemp #temp').html(t);
	// tempC = parseFloat(t);
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

 	setDividerColor(h,s,l,a);
 	
}
function setDividerColor(h,s,l,a) {
	// Set Divider Color
 	var t = date.getTime();
 	var x = (t%2) ? -1 : 1;
 	//x = 1;
 	//var y = 360/(t%2 + 2); // half or 1/3 away
 	var y = (x>0) ? 120 : 180; //1/3 or half away
 	console.log(x*y);
 	$('.divider').css('background-color', 'hsl('+ (h + x*y)%360 +','+ s/3 +'%,' + l*1.2 + '%)');
}

// Calls for the 5 day forecast
function getForecast(myLocation){
	$.simpleWeather({
		location: myLocation,
		unit: 'c',
		success: function(weather){
			tempC = weather.temp;
			var hueCast = [];
			for (var i = weather.forecast.length - 1; i >= 0; i--) {
				hueCast[i] = tempToColor(avg(weather.forecast[i].high, weather.forecast[i].low));
			}
			
			setForecastVertical(hueCast,sat,light,alpha);
			setForecastText(weather);
			//dfd.resolve();
		},
		error: function(){
			//dfd.reject();
		}
	});
}

// Sets the #forecast div to the forecast gradient
function setForecastGradient(h,s,v,a) {
	var cs = [];//'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
	for (var i = h.length - 1; i >= 0; i--) {
		cs[i] = 'hsl(' + h[i].toString() + ',' + s.toString() + '%,' + v.toString() + '%)';
	}

	// var gradString_moz
	var gs_webkit = "-webkit-gradient(linear, left top, right top, color-stop(10%," + cs[0] +"), color-stop(30%," + cs[1] + "), color-stop(50%," + cs[2]+ "), color-stop(70%," +cs[3] +"), color-stop(90%, "+cs[4] + "))"; /* Chrome,Safari4+ */
	var gs_webkit_linear = "-webkit-linear-gradient(left,  " + cs[0] +" 10%," + cs[1] + " 30%," + cs[2]+ " 50%," +cs[3] +" 70%, "+cs[4] + " 90%)"; /* Chrome10+,Safari5.1+ */
	var gs = "linear-gradient(to right,  " + cs[0] +" 10%," + cs[1] + " 30%," + cs[2]+ " 50%," +cs[3] +" 70%, "+cs[4] + " 90%)"; /* W3C */
	var gs_moz = "-moz-linear-gradient(left,  " + cs[0] +" 10%, " + cs[1] + " 30%, " + cs[2]+ " 50%, " +cs[3] +" 70%,  "+cs[4] + " 90%)";
	var gs_o = "-o-linear-gradient(left,  " + cs[0] +" 10%," + cs[1] + " 30%," + cs[2]+ " 50%," +cs[3] +" 70%, "+cs[4] + " 90%)";
	var gs_ms = "-ms-linear-gradient(left,  " + cs[0] +" 10%," + cs[1] + " 30%," + cs[2]+ " 50%," +cs[3] +" 70%, "+cs[4] + " 90%)";
	//console.log(gs);

	$('#forecast').css({
		background: gs_moz,
 		background: gs_webkit,
 		background: gs_webkit_linear,
 		background: gs_o,
 		background: gs_ms,
 		background: gs,
 	});
}
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

function avg (a,b) {
	c = (parseInt(a) + parseInt(b));
	return parseInt(c/2);
}



// #214739