"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _map = require("../../util/map");

var STYLES = {};
/* STYLES.segments = {

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
} */

/** style overrides for places (i.e. the start and end icons) **/

STYLES.places = {
  display: function display(_display, place) {
    if (!(0, _map.isBikeshareStation)(place)) return 'none';
  },
  fill: '#f00',
  stroke: '#fff',
  'stroke-width': 2,
  r: 7
  /* function getIconSize (data) {
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
  } */

  /* STYLES.segments_halo = {
    'stroke-width': function (display, data, index, utils) {
      return data.computeLineWidth(display) + 7
    },
    opacity: 0.75
  } */

};
STYLES.stops_merged = {
  r: function r(display, data, index, utils) {
    return 6;
  }
};
var _default = STYLES;
exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=transitive-styles.js