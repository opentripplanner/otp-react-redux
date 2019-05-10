export function filterProfileOptions (response) {
  // Filter out similar options. TODO: handle on server?
  const optStrs = []
  const filteredIndices = []

  const filteredProfile = response.otp.profile.filter((option, i) => {
    let optStr = option.access.map(a => a.mode).join('/')
    if (option.transit) {
      optStr += ' to ' + option.transit.map(transit => {
        return transit.routes.map(route => route.id).join('/')
      }).join(',')
    }
    if (optStrs.indexOf(optStr) !== -1) return false
    optStrs.push(optStr)
    filteredIndices.push(i)
    return true
  })

  const filteredJourneys = response.otp.journeys.filter((journey, i) => filteredIndices.indexOf(i) !== -1)

  response.otp.profile = filteredProfile
  response.otp.journeys = filteredJourneys
  return response
}

/** profileOptionsToItineraries **/

export function profileOptionsToItineraries (options, query) {
  return options.map(option => optionToItinerary(option, query))
}

// helper functions for profileOptionsToItineraries:

function optionToItinerary (option, query) {
  const itin = {
    duration: option.time,
    legs: [],
    walkTime: 0,
    waitingTime: 0
  }

  // access leg
  if (option.access && option.access.length > 0) {
    if (option.access[0].mode === 'BICYCLE_RENT') {
      let status = 'WALK_ON'
      const walkOnEdges = []
      const bikeEdges = []
      const walkOffEdges = []
      let onStationName
      let walkOnTime = 0
      let offStationName
      let walkOffTime = 0
      option.access[0].streetEdges.forEach(edge => {
        // check if we're returning the bike
        if (edge.bikeRentalOffStation) {
          status = 'WALK_OFF'
          offStationName = edge.bikeRentalOffStation.name
        }

        if (status === 'WALK_ON') {
          walkOnEdges.push(edge)
          walkOnTime += edge.distance
        } else if (status === 'BIKE') {
          bikeEdges.push(edge)
        } else if (status === 'WALK_OFF') {
          walkOffEdges.push(edge)
          walkOffTime += edge.distance
        }

        // check if we're picking up the bike
        if (edge.bikeRentalOnStation) {
          status = 'BIKE'
          onStationName = edge.bikeRentalOnStation.name
        }
      })

      itin.walkTime += (walkOnTime + walkOffTime)

      // create the 'on' walk leg
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
      })

      // create the bike leg
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
      })

      // create the 'off' walk leg
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
      })
    } else {
      itin.legs.push(accessToLeg(option.access[0], query && query.from.name, option.transit ? null : query && query.to.name))
      if (option.access[0].mode === 'WALK') itin.walkTime += option.access[0].time
    }
  }

  // transit legs
  if (option.transit) {
    option.transit.forEach(transit => {
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
      })
      itin.waitingTime += transit.waitStats.avg
    })
  }

  // egress leg
  if (option.egress && option.egress.length > 0) {
    // find the origin name, for transit trips
    const origin = option.transit ? option.transit[option.transit.length - 1].toName : null

    itin.legs.push(accessToLeg(option.egress[0], origin, query && query.to.name))
    if (option.egress[0].mode === 'WALK') itin.walkTime += option.egress[0].time
  }

  // construct summary
  if (option.transit) {
    itin.summary = 'Transit'
  } else {
    if (option.modes.length === 1 && option.modes[0] === 'bicycle') itin.summary = 'Bicycle'
    else if (option.modes.length === 1 && option.modes[0] === 'walk') itin.summary = 'Walk'
    else if (option.modes.indexOf('bicycle_rent') !== -1) itin.summary = 'Bikeshare'
  }

  return itin
}

function accessToLeg (access, origin, destination) {
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
  }
}

function locationString (str, defaultStr) {
  return str ? str.split(',')[0] : defaultStr
}
