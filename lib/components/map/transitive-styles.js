var STYLES = {}

STYLES.segments = {

  // override the default stroke color
  stroke: (display, segment) => {
    if (!segment.focused) return

    switch (segment.type) {
      case 'CAR':
        return '#888'
      case 'WALK':
        return '#00f'
      case 'BICYCLE':
        return '#f00'
    }
  },

  // override the default stroke width
  'stroke-width': (display, segment, index, utils) => {
    switch (segment.type) {
      case 'CAR':
        return utils.pixels(display.zoom.scale(), 2, 4, 6) + 'px'
      case 'WALK':
      case 'BICYCLE':
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
      case 'BICYCLE':
        return '0.01,6'
    }
  },

  // specify the line cap type
  'stroke-linecap': (display, segment) => {
    switch (segment.type) {
      case 'CAR':
        return 'butt'
      case 'WALK':
      case 'BICYCLE':
        return 'round'
    }
  }
}

/** style overrides for places (i.e. the start and end icons) **/

STYLES.places_icon = {
  x: [-16],
  y: [-16],
  width: [
    32
  ],
  height: [
    32
  ],
  'xlink:href': [
    (display, data) => {
      // if (data.owner.getId() === 'from') return 'assets/img/star60.svg'
      // if (data.owner.getId() === 'to') return 'assets/img/map25.svg'
    }
  ],
  visibility: [
    'visible'
  ]
}

export default STYLES
