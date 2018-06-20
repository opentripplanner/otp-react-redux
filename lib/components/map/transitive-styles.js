import { isBikeshareStation } from '../../util/map'

const fromSvg = '<?xml version="1.0" encoding="utf-8"?><svg width="1792" height="1792" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1728 647q0 22-26 48l-363 354 86 500q1 7 1 20 0 21-10.5 35.5t-30.5 14.5q-19 0-40-12l-449-236-449 236q-22 12-40 12-21 0-31.5-14.5t-10.5-35.5q0-6 2-20l86-500-364-354q-25-27-25-48 0-37 56-46l502-73 225-455q19-41 49-41t49 41l225 455 502 73q56 9 56 46z"/></svg>'
const toSvg = '<?xml version="1.0" encoding="utf-8"?><svg width="1792" height="1792" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1152 640q0-106-75-181t-181-75-181 75-75 181 75 181 181 75 181-75 75-181zm256 0q0 109-33 179l-364 774q-16 33-47.5 52t-67.5 19-67.5-19-46.5-52l-365-774q-33-70-33-179 0-212 150-362t362-150 362 150 150 362z"/></svg>'
const bikeSvg = '<?xml version="1.0" encoding="utf-8"?><svg width="2304" height="1792" viewBox="0 0 2304 1792" xmlns="http://www.w3.org/2000/svg"><path d="M762 1152h-314q-40 0-57.5-35t6.5-67l188-251q-65-31-137-31-132 0-226 94t-94 226 94 226 226 94q115 0 203-72.5t111-183.5zm-186-128h186q-18-85-75-148zm480 0l288-384h-480l-99 132q105 103 126 252h165zm1120 64q0-132-94-226t-226-94q-60 0-121 24l174 260q15 23 10 49t-27 40q-15 11-36 11-35 0-53-29l-174-260q-93 95-93 225 0 132 94 226t226 94 226-94 94-226zm128 0q0 185-131.5 316.5t-316.5 131.5-316.5-131.5-131.5-316.5q0-97 39.5-183.5t109.5-149.5l-65-98-353 469q-18 26-51 26h-197q-23 164-149 274t-294 110q-185 0-316.5-131.5t-131.5-316.5 131.5-316.5 316.5-131.5q114 0 215 55l137-183h-224q-26 0-45-19t-19-45 19-45 45-19h384v128h435l-85-128h-222q-26 0-45-19t-19-45 19-45 45-19h256q33 0 53 28l267 400q91-44 192-44 185 0 316.5 131.5t131.5 316.5z" fill="#fff"/></svg>'

var STYLES = {}

/*STYLES.segments = {

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
}*/

/** style overrides for places (i.e. the start and end icons) **/

STYLES.places = {
  display: function (display, place) {
    if (!isBikeshareStation(place)) return 'none'
  },
  fill: '#f00',
  stroke: '#fff',
  'stroke-width': 2,
  r: 7
}

/*function getIconSize (data) {
  return isBikeshareStation(data.owner) ? 14 : 30
}

STYLES.places_icon = {
  display: function (display, data) {
    if (!isBikeshareStation(data.owner)) return 'none'
  },

  // center the icon by offsetting by half the width/height
  x: function (display, data) {
    return -getIconSize(data) / 2
  },
  y: function (display, data) {
    return -getIconSize(data) / 2
  },
  width: function (display, data) {
    return getIconSize(data)
  },
  height: function (display, data) {
    return getIconSize(data)
  },
  'xlink:href': function (display, data) {
    const place = data.owner
    if (place.getId() === 'from') return `data:image/svg+xml;utf8,${fromSvg}`
    if (place.getId() === 'to') return `data:image/svg+xml;utf8,${toSvg}`
    if (isBikeshareStation(place)) return `data:image/svg+xml;utf8,${bikeSvg}`
  },
  stroke: 0
}*/

/*STYLES.segments_halo = {
  'stroke-width': function (display, data, index, utils) {
    return data.computeLineWidth(display) + 7
  },
  opacity: 0.75
}*/

STYLES.stops_merged = {
  r: function (display, data, index, utils) {
    return 6
  }
}

export default STYLES
