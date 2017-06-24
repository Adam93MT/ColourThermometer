# ColourThermometer

A Colour based thermometer interface. 
The temperature, time and weather conditions are converted into a colour value using these colour definitions.

Temperature -> Hue: As the temperature gets warmer, the colour of the interface gets more red. Colder, it gets bluer.

Time -> Lightness: Given the time of the latest temperature reading (which might not be right now), the lightness of the interface changes to give a better perception of the lightness there

Conditions -> Saturation: The more visibility there is, the higher the saturation. (i.e. on a sunny day, the interface will be a brighter colour than on a cloudy day)

The Forecast section gives the average between the predicted high and low