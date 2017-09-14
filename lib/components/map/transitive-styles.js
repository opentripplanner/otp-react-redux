var STYLES = {}

STYLES.segments = {

  // override the default stroke color
  stroke: (display, segment) => {
    if (!segment.focused) return

    switch (segment.type) {
      case 'CAR':
        return '#888'
      case 'WALK':
        return '#86cdf9'
      case 'BICYCLE':
      case 'BICYCLE_RENT':
        return '#f00'
    }
  },

  // override the default stroke width
  'stroke-width': (display, segment, index, utils) => {
    switch (segment.type) {
      case 'CAR':
        return utils.pixels(display.zoom.scale(), 2, 4, 6) + 'px'
      case 'WALK':
        return '5px'
      case 'BICYCLE':
      case 'BICYCLE_RENT':
        return '4px'
      case 'TRANSIT':
        // bus segments:
        if (segment.mode === 3) {
          return utils.pixels(display.zoom.scale(), 2, 4, 8) + 'px'
        }
        // all others:
        return utils.pixels(display.zoom.scale(), 4, 8, 12) + 'px'
    }
  },

  // specify the dash-array
  'stroke-dasharray': (display, segment) => {
    switch (segment.type) {
      case 'CAR':
        return '3,2'
      case 'WALK':
        return '0.01,7'
      case 'BICYCLE':
      case 'BICYCLE_RENT':
        return '6,3'
    }
  },

  // specify the line cap type
  'stroke-linecap': (display, segment) => {
    switch (segment.type) {
      case 'WALK':
        return 'round'
      case 'CAR':
      case 'BICYCLE':
      case 'BICYCLE_RENT':
        return 'butt'
    }
  }
}

/** style overrides for places (i.e. the start and end icons) **/

function isBikeshareStation (place) {
  return place.place_id.lastIndexOf('bicycle_rent_station') !== -1
}

STYLES.places = {
  display: function (d, data) {
    var place = data.owner
    if (place.getId() === 'from' || place.getId() === 'to' ||
        (isBikeshareStation(place) && !place.focused)) {
      return 'none'
    }
  },

  fill: function (display, data) {
    var place = data.owner
    if (isBikeshareStation(place)) {
      return 'fd4d1d'
    } else {
      return '#fff'
    }
  },

  stroke: function (display, data) {
    var place = data.owner
    return isBikeshareStation(place) ? '#fff' : '#000'
  },

  'stroke-width': function (display, data) {
    var place = data.owner
    return isBikeshareStation(place) ? '2px' : '0px'
  },

  r: function (display, data) {
    var place = data.owner
    return isBikeshareStation(place) ? '10px' : '15px'
  }

}

STYLES.segments_halo = {
  'stroke-width': function (display, data, index, utils) {
    return data.computeLineWidth(display) + 7
  },
  opacity: 0.75
}

STYLES.stops_merged = {
  r: function (display, data, index, utils) {
    //return utils.pixels(display.zoom.scale(), 4, 6, 8)
    return 6
  }
}

export default STYLES
