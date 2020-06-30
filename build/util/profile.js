"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.filterProfileOptions = filterProfileOptions;
exports.profileOptionsToItineraries = profileOptionsToItineraries;

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.function.name");

function filterProfileOptions(response) {
  // Filter out similar options. TODO: handle on server?
  var optStrs = [];
  var filteredIndices = [];
  var filteredProfile = response.otp.profile.filter(function (option, i) {
    var optStr = option.access.map(function (a) {
      return a.mode;
    }).join('/');

    if (option.transit) {
      optStr += ' to ' + option.transit.map(function (transit) {
        return transit.routes.map(function (route) {
          return route.id;
        }).join('/');
      }).join(',');
    }

    if (optStrs.indexOf(optStr) !== -1) return false;
    optStrs.push(optStr);
    filteredIndices.push(i);
    return true;
  });
  var filteredJourneys = response.otp.journeys.filter(function (journey, i) {
    return filteredIndices.indexOf(i) !== -1;
  });
  response.otp.profile = filteredProfile;
  response.otp.journeys = filteredJourneys;
  return response;
}
/** profileOptionsToItineraries **/


function profileOptionsToItineraries(options, query) {
  return options.map(function (option) {
    return optionToItinerary(option, query);
  });
} // helper functions for profileOptionsToItineraries:


function optionToItinerary(option, query) {
  var itin = {
    duration: option.time,
    legs: [],
    walkTime: 0,
    waitingTime: 0 // access leg

  };

  if (option.access && option.access.length > 0) {
    if (option.access[0].mode === 'BICYCLE_RENT') {
      var status = 'WALK_ON';
      var walkOnEdges = [];
      var bikeEdges = [];
      var walkOffEdges = [];
      var onStationName;
      var walkOnTime = 0;
      var offStationName;
      var walkOffTime = 0;
      option.access[0].streetEdges.forEach(function (edge) {
        // check if we're returning the bike
        if (edge.bikeRentalOffStation) {
          status = 'WALK_OFF';
          offStationName = edge.bikeRentalOffStation.name;
        }

        if (status === 'WALK_ON') {
          walkOnEdges.push(edge);
          walkOnTime += edge.distance;
        } else if (status === 'BIKE') {
          bikeEdges.push(edge);
        } else if (status === 'WALK_OFF') {
          walkOffEdges.push(edge);
          walkOffTime += edge.distance;
        } // check if we're picking up the bike


        if (edge.bikeRentalOnStation) {
          status = 'BIKE';
          onStationName = edge.bikeRentalOnStation.name;
        }
      });
      itin.walkTime += walkOnTime + walkOffTime; // create the 'on' walk leg

      itin.legs.push({
        mode: 'WALK',
        duration: walkOnTime,
        transitLeg: false,
        from: {
          name: locationString(query && query.from.name, 'Destination')
        },
        to: {
          name: onStationName
        }
      }); // create the bike leg

      itin.legs.push({
        mode: 'BICYCLE_RENT',
        duration: option.time - walkOnTime - walkOffTime,
        transitLeg: false,
        from: {
          name: onStationName
        },
        to: {
          name: offStationName
        }
      }); // create the 'off' walk leg

      itin.legs.push({
        mode: 'WALK',
        duration: walkOffTime,
        transitLeg: false,
        from: {
          name: offStationName
        },
        to: {
          name: locationString(query && query.to.name, 'Destination')
        }
      });
    } else {
      itin.legs.push(accessToLeg(option.access[0], query && query.from.name, option.transit ? null : query && query.to.name));
      if (option.access[0].mode === 'WALK') itin.walkTime += option.access[0].time;
    }
  } // transit legs


  if (option.transit) {
    option.transit.forEach(function (transit) {
      itin.legs.push({
        transitLeg: true,
        mode: transit.mode,
        from: {
          name: transit.fromName
        },
        to: {
          name: transit.toName
        },
        routes: transit.routes,
        duration: transit.rideStats.avg,
        averageWait: transit.waitStats.avg
      });
      itin.waitingTime += transit.waitStats.avg;
    });
  } // egress leg


  if (option.egress && option.egress.length > 0) {
    // find the origin name, for transit trips
    var origin = option.transit ? option.transit[option.transit.length - 1].toName : null;
    itin.legs.push(accessToLeg(option.egress[0], origin, query && query.to.name));
    if (option.egress[0].mode === 'WALK') itin.walkTime += option.egress[0].time;
  } // construct summary


  if (option.transit) {
    itin.summary = 'Transit';
  } else {
    if (option.modes.length === 1 && option.modes[0] === 'bicycle') itin.summary = 'Bicycle';else if (option.modes.length === 1 && option.modes[0] === 'walk') itin.summary = 'Walk';else if (option.modes.indexOf('bicycle_rent') !== -1) itin.summary = 'Bikeshare';
  }

  return itin;
}

function accessToLeg(access, origin, destination) {
  return {
    mode: access.mode,
    duration: access.time,
    transitLeg: false,
    from: {
      name: locationString(origin, 'Origin')
    },
    to: {
      name: locationString(destination, 'Destination')
    }
  };
}

function locationString(str, defaultStr) {
  return str ? str.split(',')[0] : defaultStr;
}

//# sourceMappingURL=profile.js