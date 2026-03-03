/* eslint-disable no-useless-escape */
/* eslint-disable sort-keys */

export interface CustomWalkLeg
  extends Omit<
    typeof STADIUM_TO_ZONE_WALK_LEG,
    'accessibilityScore' | 'steps' | 'from' | 'to'
  > {
  accessibilityScore: number | null
  from: FromOrTo
  steps: Step[]
  to: FromOrTo
}

interface Step
  extends Omit<typeof STADIUM_TO_ZONE_WALK_LEG.steps[0], 'absoluteDirection'> {
  absoluteDirection: string | null
}

interface FromOrTo
  extends Omit<
    typeof STADIUM_TO_ZONE_WALK_LEG.from,
    'stopCode' | 'stopId' | 'stop'
  > {
  stop: typeof STADIUM_TO_ZONE_WALK_LEG.from.stop | null
  stopCode?: null
  stopId?: string
}

export const STADIUM_TO_ZONE_WALK_LEG = {
  accessibilityScore: null,
  agency: null,
  alerts: [],
  arrivalDelay: 0,
  departureDelay: 0,
  distance: 503.56,
  dropOffBookingInfo: {
    latestBookingTime: null
  },
  dropoffType: 'SCHEDULED',
  duration: 493,
  endTime: 0,
  fareProducts: [],
  from: {
    lat: 47.592285,
    lon: -122.326988,
    name: 'Stadium',
    rentalVehicle: null,
    stop: {
      alerts: [],
      code: null,
      gtfsId: '40:99260',
      id: 'U3RvcDo0MDo5OTI2MA',
      lat: 47.592285,
      lon: -122.326988
    },
    stopCode: null,
    stopId: '40:99260',
    vertexType: 'TRANSIT'
  },
  headsign: null,
  id: null,
  interlineWithPreviousLeg: false,
  intermediateStops: null,
  legGeometry: {
    length: 67,
    points:
      // eslint-disable-next-line prettier/prettier
      'wjnaHt~riV@??D?L?B?D?H?J?B?D?F?H?B?F?\?@@BC@C@?D?D?jA?fC@FBFBD@??BCXAPA\ZrADNFFHFDDFDH@D?DE@ABG?GCGEMW]GCKAI@IBGDIJEHCLCL?J?~C?T?@?n@BD?LSBE@?nAMCWG'
  },
  mode: 'WALK',
  pickupBookingInfo: null,
  pickupType: 'SCHEDULED',
  alightRule: 'scheduled',
  realTime: false,
  boardRule: 'scheduled',
  realtimeState: null,
  bookingRuleInfo: {
    dropOff: {},
    pickUp: {}
  },
  rentedBike: false,
  rideHailingEstimate: null,
  routeColor: '333333',
  routeTextColor: '',
  startTime: 0,
  steps: [
    {
      absoluteDirection: 'WEST',
      alerts: [],
      area: false,
      distance: 6.91,
      elevationProfile: [],
      lat: 47.5922729,
      lon: -122.3269878,
      relativeDirection: 'DEPART',
      stayOn: false,
      streetName: 'SODO Trail'
    },
    {
      absoluteDirection: 'WEST',
      alerts: [],
      area: false,
      distance: 131.37,
      elevationProfile: [],
      lat: 47.5922724,
      lon: -122.32708,
      relativeDirection: 'CONTINUE',
      stayOn: false,
      streetName: 'path'
    },
    {
      absoluteDirection: 'SOUTHWEST',
      alerts: [],
      area: false,
      distance: 8.14,
      elevationProfile: [],
      lat: 47.5922964,
      lon: -122.3288022,
      relativeDirection: 'LEFT',
      stayOn: false,
      streetName: '4th Avenue South'
    },
    {
      absoluteDirection: 'WEST',
      alerts: [],
      area: false,
      distance: 29.35,
      elevationProfile: [],
      lat: 47.5922467,
      lon: -122.3288776,
      relativeDirection: 'RIGHT',
      stayOn: false,
      streetName: 'sidewalk'
    },
    {
      absoluteDirection: 'SOUTHWEST',
      alerts: [],
      area: true,
      distance: 261.64,
      elevationProfile: [],
      lat: 47.5922872,
      lon: -122.3292643,
      relativeDirection: 'SLIGHTLY_LEFT',
      stayOn: true,
      streetName: 'open area'
    },
    {
      absoluteDirection: 'NORTH',
      alerts: [],
      area: false,
      distance: 10.64,
      elevationProfile: [],
      lat: 47.5923255,
      lon: -122.3311355,
      relativeDirection: 'RIGHT',
      stayOn: false,
      streetName: 'South Royal Brougham Way'
    },
    {
      absoluteDirection: 'WEST',
      alerts: [],
      area: false,
      distance: 34,
      elevationProfile: [],
      lat: 47.5924202,
      lon: -122.3311558,
      relativeDirection: 'LEFT',
      stayOn: true,
      streetName: 'South Royal Brougham Way'
    },
    {
      absoluteDirection: 'NORTH',
      alerts: [],
      area: false,
      distance: 21.53,
      elevationProfile: [],
      lat: 47.5924575,
      lon: -122.3315618,
      relativeDirection: 'RIGHT',
      stayOn: false,
      streetName: 'service road'
    }
  ],
  stopCalls: [],
  to: {
    lat: 47.5927964,
    lon: -122.3317254,
    name: 'Freeway Park, Seattle, WA, USA',
    rentalVehicle: null,
    stop: null,
    vertexType: 'NORMAL'
  },
  transitLeg: false,
  trip: null
}

export const PIONEER_SQUARE_TO_ZONE_WALK_LEG = {
  accessibilityScore: null,
  agency: null,
  alerts: [],
  arrivalDelay: 0,
  departureDelay: 0,
  distance: 745.26,
  dropOffBookingInfo: {
    latestBookingTime: null
  },
  dropoffType: 'SCHEDULED',
  duration: 692,
  endTime: 0,
  fareProducts: [],
  from: {
    lat: 47.60256,
    lon: -122.331216,
    name: 'Pioneer Square (Sound Transit)',
    rentalVehicle: null,
    stop: null,
    vertexType: 'NORMAL'
  },
  headsign: null,
  id: null,
  interlineWithPreviousLeg: false,
  intermediateStops: null,
  legGeometry: {
    length: 76,
    points:
      '}jpaHdysiV`A{@HIHGDL@DBC^hABHDLJ@@?B?FBHB@?B??t@?@?F?D?P?`@?BnAgAd@?P?F?F?LA@B@?vB?L??FB?H?@AJA@?@C@?~B?B?DEF?@?B?H?DD@?lC?@@BAJ@N@B??CdC@@MPADAR@B?D?T?B?D?T?B?D?F?F@F??M?E'
  },
  mode: 'WALK',
  pickupBookingInfo: null,
  pickupType: 'SCHEDULED',
  alightRule: 'scheduled',
  realTime: false,
  boardRule: 'scheduled',
  realtimeState: null,
  bookingRuleInfo: {
    dropOff: {},
    pickUp: {}
  },
  rentedBike: false,
  rideHailingEstimate: null,
  routeColor: '333333',
  routeTextColor: '',
  startTime: 0,
  steps: [
    {
      absoluteDirection: 'SOUTHEAST',
      alerts: [],
      area: false,
      distance: 67.67,
      elevationProfile: [],
      lat: 47.6025566,
      lon: -122.3312243,
      relativeDirection: 'DEPART',
      stayOn: false,
      streetName: '3rd Avenue'
    },
    {
      absoluteDirection: 'SOUTHWEST',
      alerts: [],
      area: false,
      distance: 67.23,
      elevationProfile: [],
      lat: 47.6020628,
      lon: -122.330919,
      relativeDirection: 'RIGHT',
      stayOn: false,
      streetName: 'sidewalk'
    },
    {
      absoluteDirection: 'WEST',
      alerts: [],
      area: false,
      distance: 19.78,
      elevationProfile: [],
      lat: 47.6016432,
      lon: -122.3314587,
      relativeDirection: 'RIGHT',
      stayOn: false,
      streetName: 'Yesler Way Cycletrack'
    },
    {
      absoluteDirection: 'WEST',
      alerts: [],
      area: false,
      distance: 4.19,
      elevationProfile: [],
      lat: 47.6016435,
      lon: -122.3317225,
      relativeDirection: 'CONTINUE',
      stayOn: false,
      streetName: '2nd Avenue Cycletrack'
    },
    {
      absoluteDirection: 'WEST',
      alerts: [],
      area: false,
      distance: 21.76,
      elevationProfile: [],
      lat: 47.6016407,
      lon: -122.3317781,
      relativeDirection: 'CONTINUE',
      stayOn: false,
      streetName: 'path'
    },
    {
      absoluteDirection: 'SOUTHWEST',
      alerts: [],
      area: false,
      distance: 1.83,
      elevationProfile: [],
      lat: 47.6016489,
      lon: -122.3320681,
      relativeDirection: 'SLIGHTLY_LEFT',
      stayOn: false,
      streetName: 'Yesler Way Cycletrack'
    },
    {
      absoluteDirection: 'SOUTHEAST',
      alerts: [],
      area: false,
      distance: 72.6,
      elevationProfile: [],
      lat: 47.6016401,
      lon: -122.3320888,
      relativeDirection: 'LEFT',
      stayOn: false,
      streetName: '2nd Avenue Extension South'
    },
    {
      absoluteDirection: 'SOUTH',
      alerts: [],
      area: false,
      distance: 28.66,
      elevationProfile: [],
      lat: 47.6010566,
      lon: -122.3317253,
      relativeDirection: 'CONTINUE',
      stayOn: false,
      streetName: '2nd Avenue South'
    },
    {
      absoluteDirection: 'SOUTH',
      alerts: [],
      area: false,
      distance: 274.69,
      elevationProfile: [],
      lat: 47.600806,
      lon: -122.3317388,
      relativeDirection: 'LEFT',
      stayOn: true,
      streetName: '2nd Avenue South'
    },
    {
      absoluteDirection: 'SOUTHEAST',
      alerts: [],
      area: false,
      distance: 2.07,
      elevationProfile: [],
      lat: 47.5983823,
      lon: -122.3317495,
      relativeDirection: 'SLIGHTLY_LEFT',
      stayOn: false,
      streetName: 'South King Street'
    },
    {
      absoluteDirection: 'SOUTH',
      alerts: [],
      area: false,
      distance: 15.82,
      elevationProfile: [],
      lat: 47.5983677,
      lon: -122.3317323,
      relativeDirection: 'RIGHT',
      stayOn: false,
      streetName: 'path'
    },
    {
      absoluteDirection: 'SOUTH',
      alerts: [],
      area: false,
      distance: 78.21,
      elevationProfile: [],
      lat: 47.5982265,
      lon: -122.3317585,
      relativeDirection: 'CONTINUE',
      stayOn: false,
      streetName: 'Stadium Place South'
    },
    {
      absoluteDirection: 'EAST',
      alerts: [],
      area: false,
      distance: 5.09,
      elevationProfile: [],
      lat: 47.5975354,
      lon: -122.3317431,
      relativeDirection: 'LEFT',
      stayOn: true,
      streetName: 'Stadium Place South'
    },
    {
      absoluteDirection: 'SOUTH',
      alerts: [],
      area: false,
      distance: 78.53,
      elevationProfile: [],
      lat: 47.5975208,
      lon: -122.3316787,
      relativeDirection: 'RIGHT',
      stayOn: false,
      streetName: 'path'
    },
    {
      absoluteDirection: 'EAST',
      alerts: [],
      area: false,
      distance: 7.17,
      elevationProfile: [],
      lat: 47.5968155,
      lon: -122.331671,
      relativeDirection: 'LEFT',
      stayOn: true,
      streetName: 'parking aisle'
    }
  ],
  stopCalls: [],
  to: {
    lat: 47.5968293,
    lon: -122.3315754,
    name: 'Muckleshoot Heritage Plaza, Seattle, WA, USA',
    rentalVehicle: null,
    stop: null,
    vertexType: 'NORMAL'
  },
  transitLeg: false,
  trip: null
}

export const ZONE_TO_PIONEER_SQUARE_WALK_LEG = {
  accessibilityScore: null,
  agency: null,
  alerts: [],
  arrivalDelay: 0,
  departureDelay: 0,
  distance: 728.27,
  dropOffBookingInfo: {
    latestBookingTime: null
  },
  dropoffType: 'SCHEDULED',
  duration: 712,
  endTime: 0,
  fareProducts: [],
  from: {
    lat: 47.5974375,
    lon: -122.3315949,
    name: 'Stadium Place South, Seattle, WA, USA',
    rentalVehicle: null,
    stop: null,
    vertexType: 'NORMAL'
  },
  headsign: null,
  id: null,
  interlineWithPreviousLeg: false,
  intermediateStops: null,
  legGeometry: {
    length: 61,
    points:
      // eslint-disable-next-line prettier/prettier
      '}joaHn{siVM?kA?_A?C?O?G?K?iCCS?C?A?O@mA?c@@Q?O?A?M?EAkB@MBI?MAIGGECAGE?AEGGKWTOPa@^a@\ONGFEB_@^A@MJUTUPKHKLEOAA?CAAc@yAGO??EDAEGSAC_@iAEMOLKHYT'
  },
  mode: 'WALK',
  pickupBookingInfo: null,
  pickupType: 'SCHEDULED',
  alightRule: 'scheduled',
  realTime: false,
  boardRule: 'scheduled',
  realtimeState: null,
  bookingRuleInfo: {
    dropOff: {},
    pickUp: {}
  },
  rentedBike: false,
  rideHailingEstimate: null,
  routeColor: '333333',
  routeTextColor: '',
  startTime: 0,
  steps: [
    {
      absoluteDirection: 'NORTH',
      alerts: [],
      area: false,
      distance: 96.21,
      elevationProfile: [],
      lat: 47.5974375,
      lon: -122.3315951,
      relativeDirection: 'DEPART',
      stayOn: false,
      streetName: 'Stadium Place South'
    },
    {
      absoluteDirection: 'NORTH',
      alerts: [],
      area: false,
      distance: 316.98,
      elevationProfile: [],
      lat: 47.5983027,
      lon: -122.3315944,
      relativeDirection: 'CONTINUE',
      stayOn: false,
      streetName: '2nd Avenue South'
    },
    {
      absoluteDirection: 'NORTHWEST',
      alerts: [],
      area: false,
      distance: 82.45,
      elevationProfile: [],
      lat: 47.6011028,
      lon: -122.331387,
      relativeDirection: 'LEFT',
      stayOn: false,
      streetName: '2nd Avenue Extension South'
    },
    {
      absoluteDirection: 'NORTHWEST',
      alerts: [],
      area: false,
      distance: 85.19,
      elevationProfile: [],
      lat: 47.6017285,
      lon: -122.3319771,
      relativeDirection: 'CONTINUE',
      stayOn: false,
      streetName: '2nd Avenue'
    },
    {
      absoluteDirection: 'NORTHEAST',
      alerts: [],
      area: false,
      distance: 7.43,
      elevationProfile: [],
      lat: 47.6023772,
      lon: -122.3325817,
      relativeDirection: 'RIGHT',
      stayOn: false,
      streetName: 'path'
    },
    {
      absoluteDirection: 'NORTHEAST',
      alerts: [],
      area: false,
      distance: 49.51,
      elevationProfile: [],
      lat: 47.60241,
      lon: -122.3324953,
      relativeDirection: 'CONTINUE',
      stayOn: false,
      streetName: 'James Street'
    },
    {
      absoluteDirection: 'NORTHWEST',
      alerts: [],
      area: false,
      distance: 16.79,
      elevationProfile: [],
      lat: 47.6026449,
      lon: -122.3319343,
      relativeDirection: 'LEFT',
      stayOn: false,
      streetName: 'path'
    },
    {
      absoluteDirection: 'NORTHEAST',
      alerts: [],
      area: false,
      distance: 49.59,
      elevationProfile: [],
      lat: 47.602735,
      lon: -122.3318172,
      relativeDirection: 'CONTINUE',
      stayOn: false,
      streetName: 'Pioneer Square Station Mezzanine'
    },
    {
      absoluteDirection: 'NORTHWEST',
      alerts: [],
      area: false,
      distance: 24.11,
      elevationProfile: [],
      lat: 47.6030025,
      lon: -122.3314431,
      relativeDirection: 'CONTINUE',
      stayOn: false,
      streetName: 'underpass'
    }
  ],
  stopCalls: [],
  to: {
    lat: 47.6031876,
    lon: -122.3316084,
    name: 'Pioneer Square, Seattle, WA, USA',
    rentalVehicle: null,
    stop: null,
    vertexType: 'NORMAL'
  },
  transitLeg: false,
  trip: null
}

export const ZONE_TO_STADIUM_WALK_LEG = {
  accessibilityScore: null,
  agency: null,
  alerts: [],
  arrivalDelay: 0,
  departureDelay: 0,
  distance: 621.33,
  dropOffBookingInfo: {
    latestBookingTime: null
  },
  dropoffType: 'SCHEDULED',
  duration: 582,
  endTime: 0,
  fareProducts: [],
  from: {
    lat: 47.5925996,
    lon: -122.3317687,
    name: 'South Royal Brougham Way, Seattle, WA, USA',
    rentalVehicle: null,
    stop: null,
    vertexType: 'NORMAL'
  },
  headsign: null,
  id: null,
  interlineWithPreviousLeg: false,
  intermediateStops: null,
  legGeometry: {
    length: 65,
    points:
      // eslint-disable-next-line prettier/prettier
      'glnaHp|siV?k@?cA?[R?D?L?CE?o@?W?_D?KBMBMDIHKFEHCHAJ@FBV\DLBF?FCFA@EDE?IAGEEEIGGGEO[sA@]@QBY?CA?CECGAG?sE?E?EBABAAE?]?G?C?I?G?E?C?K\?p@?H??\`@'
  },
  mode: 'WALK',
  pickupBookingInfo: null,
  pickupType: 'SCHEDULED',
  alightRule: 'scheduled',
  realTime: false,
  boardRule: 'scheduled',
  realtimeState: null,
  bookingRuleInfo: {
    dropOff: {},
    pickUp: {}
  },
  rentedBike: false,
  rideHailingEstimate: null,
  routeColor: '333333',
  routeTextColor: '',
  startTime: 0,
  steps: [
    {
      absoluteDirection: 'EAST',
      alerts: [],
      area: false,
      distance: 220.12,
      elevationProfile: [],
      lat: 47.592526,
      lon: -122.3317679,
      relativeDirection: 'DEPART',
      stayOn: false,
      streetName: 'sidewalk'
    },
    {
      absoluteDirection: 'SOUTHWEST',
      alerts: [],
      area: true,
      distance: 140.26,
      elevationProfile: [],
      lat: 47.591983,
      lon: -122.3295327,
      relativeDirection: 'SLIGHTLY_RIGHT',
      stayOn: true,
      streetName: 'open area'
    },
    {
      absoluteDirection: 'NORTHEAST',
      alerts: [],
      area: false,
      distance: 8.14,
      elevationProfile: [],
      lat: 47.5922467,
      lon: -122.3288776,
      relativeDirection: 'LEFT',
      stayOn: false,
      streetName: '4th Avenue South'
    },
    {
      absoluteDirection: 'EAST',
      alerts: [],
      area: false,
      distance: 123.29,
      elevationProfile: [],
      lat: 47.5922964,
      lon: -122.3288022,
      relativeDirection: 'RIGHT',
      stayOn: false,
      streetName: 'sidewalk'
    },
    {
      absoluteDirection: 'SOUTH',
      alerts: [],
      area: false,
      distance: 71.21,
      elevationProfile: [],
      lat: 47.5922728,
      lon: -122.3271879,
      relativeDirection: 'RIGHT',
      stayOn: false,
      streetName: 'SODO Trail'
    },
    {
      absoluteDirection: 'SOUTH',
      alerts: [],
      area: true,
      distance: 58.31,
      elevationProfile: [],
      lat: 47.5916323,
      lon: -122.3271875,
      relativeDirection: 'CONTINUE',
      stayOn: false,
      streetName: 'Stadium'
    }
  ],
  stopCalls: [],
  to: {
    lat: 47.591108,
    lon: -122.327172,
    name: 'Stadium (Sound Transit)',
    rentalVehicle: null,
    stop: null,
    vertexType: 'NORMAL'
  },
  transitLeg: false,
  trip: null
}

export const INTERNATIONAL_DISTRICT_TO_ZONE_WALK_LEG = {
  accessibilityScore: 1,
  agency: null,
  alerts: [],
  arrivalDelay: 0,
  departureDelay: 0,
  distance: 381.73,
  dropOffBookingInfo: {
    latestBookingTime: null
  },
  dropoffType: 'SCHEDULED',
  duration: 434,
  endTime: 0,
  fareProducts: [],
  from: {
    lat: 47.59766,
    lon: -122.328217,
    name: "Int'l Dist/Chinatown",
    rentalVehicle: null,
    stop: {
      alerts: [],
      code: null,
      gtfsId: '40:623',
      id: 'U3RvcDo0MDo2MjM',
      lat: 47.59766,
      lon: -122.328217
    },
    stopCode: null,
    stopId: '40:623',
    vertexType: 'TRANSIT'
  },
  headsign: null,
  id: null,
  interlineWithPreviousLeg: false,
  intermediateStops: null,
  legGeometry: {
    length: 36,
    points:
      'kloaHjfsiV?@P??D?dAAh@?HCB?D?V@^?DAD?D?X?HAxA?Z?j@?????BTRB@@?J?P?|A?JRFJ@??|DHH@@B?p@]'
  },
  mode: 'WALK',
  pickupBookingInfo: null,
  pickupType: 'SCHEDULED',
  alightRule: 'scheduled',
  realTime: false,
  boardRule: 'scheduled',
  realtimeState: null,
  bookingRuleInfo: {
    dropOff: {},
    pickUp: {}
  },
  rentedBike: false,
  rideHailingEstimate: null,
  routeColor: '333333',
  routeTextColor: '',
  startTime: 0,
  steps: [
    {
      absoluteDirection: 'SOUTH',
      alerts: [],
      area: false,
      distance: 9.38,
      elevationProfile: [],
      lat: 47.59766,
      lon: -122.3282229,
      relativeDirection: 'DEPART',
      stayOn: false,
      streetName: 'path'
    },
    {
      absoluteDirection: 'WEST',
      alerts: [],
      area: false,
      distance: 52.92,
      elevationProfile: [],
      lat: 47.5975757,
      lon: -122.3282238,
      relativeDirection: 'RIGHT',
      stayOn: false,
      streetName: 'South Weller Street'
    },
    {
      absoluteDirection: 'WEST',
      alerts: [],
      area: false,
      distance: 25.35,
      elevationProfile: [],
      lat: 47.5976022,
      lon: -122.3289176,
      relativeDirection: 'CONTINUE',
      stayOn: false,
      streetName: 'path'
    },
    {
      absoluteDirection: 'WEST',
      alerts: [],
      area: false,
      distance: 76.81,
      elevationProfile: [],
      lat: 47.5976091,
      lon: -122.3292521,
      relativeDirection: 'SLIGHTLY_LEFT',
      stayOn: false,
      streetName: 'South Weller Street Overpass'
    },
    {
      absoluteDirection: 'SOUTH',
      alerts: [],
      area: false,
      distance: 0,
      elevationProfile: [],
      lat: 47.5976152,
      lon: -122.3302764,
      relativeDirection: 'LEFT',
      stayOn: false,
      streetName: 'ElevatorBoardEdge'
    },
    {
      absoluteDirection: null,
      alerts: [],
      area: false,
      distance: 0,
      elevationProfile: [],
      lat: 47.5976152,
      lon: -122.3302764,
      relativeDirection: 'ELEVATOR',
      stayOn: false,
      streetName: 'elevator'
    },
    {
      absoluteDirection: 'WEST',
      alerts: [],
      area: false,
      distance: 1.51,
      elevationProfile: [],
      lat: 47.5976152,
      lon: -122.3302764,
      relativeDirection: 'RIGHT',
      stayOn: false,
      streetName: 'South Weller Street'
    },
    {
      absoluteDirection: 'SOUTHWEST',
      alerts: [],
      area: true,
      distance: 86.24,
      elevationProfile: [],
      lat: 47.5976151,
      lon: -122.3302966,
      relativeDirection: 'LEFT',
      stayOn: false,
      streetName: 'open area'
    },
    {
      absoluteDirection: 'SOUTHWEST',
      alerts: [],
      area: false,
      distance: 16.6,
      elevationProfile: [],
      lat: 47.5968581,
      lon: -122.3304073,
      relativeDirection: 'RIGHT',
      stayOn: true,
      streetName: 'path'
    },
    {
      absoluteDirection: 'SOUTH',
      alerts: [],
      area: false,
      distance: 72.93,
      elevationProfile: [],
      lat: 47.5967558,
      lon: -122.3305686,
      relativeDirection: 'LEFT',
      stayOn: true,
      streetName: 'sidewalk'
    },
    {
      absoluteDirection: 'SOUTHWEST',
      alerts: [],
      area: false,
      distance: 10.07,
      elevationProfile: [],
      lat: 47.5967422,
      lon: -122.3315199,
      relativeDirection: 'LEFT',
      stayOn: true,
      streetName: 'path'
    },
    {
      absoluteDirection: 'SOUTH',
      alerts: [],
      area: true,
      distance: 29.94,
      elevationProfile: [],
      lat: 47.5966617,
      lon: -122.3315757,
      relativeDirection: 'SLIGHTLY_LEFT',
      stayOn: false,
      streetName: 'Muckleshoot Heritage Plaza'
    }
  ],
  stopCalls: [],
  to: {
    lat: 47.596411,
    lon: -122.33143,
    name: 'Muckleshoot Heritage Plaza, Pioneer Square, Seattle, WA',
    rentalVehicle: null,
    stop: null,
    vertexType: 'NORMAL'
  },
  transitLeg: false,
  trip: null
}

export const ZONE_TO_INTERNATIONAL_DISTRICT_WALK_LEG = {
  accessibilityScore: null,
  agency: null,
  alerts: [],
  arrivalDelay: 0,
  departureDelay: 0,
  distance: 289.3,
  dropOffBookingInfo: {
    latestBookingTime: null
  },
  dropoffType: 'SCHEDULED',
  duration: 365,
  endTime: 0,
  fareProducts: [],
  from: {
    lat: 47.5973546,
    lon: -122.331669,
    name: '47.59735, -122.33167',
    rentalVehicle: null,
    stop: null,
    vertexType: 'NORMAL'
  },
  headsign: null,
  id: null,
  interlineWithPreviousLeg: false,
  intermediateStops: null,
  legGeometry: {
    length: 31,
    points:
      'mjoaH|{siVIAE@?M?QK@ACCI?iD@WSc@?C?????k@?[@yA?I?_@@E?EA_@?W?EBC?I@i@?eA?EQ??A'
  },
  mode: 'WALK',
  pickupBookingInfo: null,
  pickupType: 'SCHEDULED',
  alightRule: 'scheduled',
  realTime: false,
  boardRule: 'scheduled',
  realtimeState: null,
  bookingRuleInfo: {
    dropOff: {},
    pickUp: {}
  },
  rentedBike: false,
  rideHailingEstimate: null,
  routeColor: '333333',
  routeTextColor: '',
  startTime: 0,
  steps: [
    {
      absoluteDirection: 'NORTH',
      alerts: [],
      area: false,
      distance: 27.22,
      elevationProfile: [],
      lat: 47.5973545,
      lon: -122.3316604,
      relativeDirection: 'DEPART',
      stayOn: false,
      streetName: 'path'
    },
    {
      absoluteDirection: 'NORTHEAST',
      alerts: [],
      area: false,
      distance: 5.87,
      elevationProfile: [],
      lat: 47.5974935,
      lon: -122.3315114,
      relativeDirection: 'RIGHT',
      stayOn: false,
      streetName: 'Stadium Place South'
    },
    {
      absoluteDirection: 'EAST',
      alerts: [],
      area: false,
      distance: 72.99,
      elevationProfile: [],
      lat: 47.5975255,
      lon: -122.3314491,
      relativeDirection: 'SLIGHTLY_RIGHT',
      stayOn: false,
      streetName: 'sidewalk'
    },
    {
      absoluteDirection: 'NORTHEAST',
      alerts: [],
      area: true,
      distance: 17.27,
      elevationProfile: [],
      lat: 47.597518,
      lon: -122.3304763,
      relativeDirection: 'LEFT',
      stayOn: true,
      streetName: 'open area'
    },
    {
      absoluteDirection: 'EAST',
      alerts: [],
      area: false,
      distance: 1.51,
      elevationProfile: [],
      lat: 47.5976151,
      lon: -122.3302966,
      relativeDirection: 'SLIGHTLY_RIGHT',
      stayOn: false,
      streetName: 'South Weller Street'
    },
    {
      absoluteDirection: 'SOUTH',
      alerts: [],
      area: false,
      distance: 0,
      elevationProfile: [],
      lat: 47.5976152,
      lon: -122.3302764,
      relativeDirection: 'RIGHT',
      stayOn: false,
      streetName: 'ElevatorBoardEdge'
    },
    {
      absoluteDirection: null,
      alerts: [],
      area: false,
      distance: 0,
      elevationProfile: [],
      lat: 47.5976152,
      lon: -122.3302764,
      relativeDirection: 'ELEVATOR',
      stayOn: false,
      streetName: 'elevator'
    },
    {
      absoluteDirection: 'EAST',
      alerts: [],
      area: false,
      distance: 76.81,
      elevationProfile: [],
      lat: 47.5976152,
      lon: -122.3302764,
      relativeDirection: 'LEFT',
      stayOn: false,
      streetName: 'South Weller Street Overpass'
    },
    {
      absoluteDirection: 'SOUTHEAST',
      alerts: [],
      area: false,
      distance: 29.78,
      elevationProfile: [],
      lat: 47.5976091,
      lon: -122.3292521,
      relativeDirection: 'SLIGHTLY_RIGHT',
      stayOn: false,
      streetName: 'sidewalk'
    },
    {
      absoluteDirection: 'EAST',
      alerts: [],
      area: false,
      distance: 48.49,
      elevationProfile: [],
      lat: 47.597589,
      lon: -122.3288691,
      relativeDirection: 'LEFT',
      stayOn: false,
      streetName: 'South Weller Street'
    },
    {
      absoluteDirection: 'NORTH',
      alerts: [],
      area: false,
      distance: 9.38,
      elevationProfile: [],
      lat: 47.5975757,
      lon: -122.3282238,
      relativeDirection: 'LEFT',
      stayOn: false,
      streetName: 'path'
    }
  ],
  stopCalls: [],
  to: {
    lat: 47.59766,
    lon: -122.328217,
    name: "Int'l Dist/Chinatown",
    rentalVehicle: null,
    stop: {
      alerts: [],
      code: null,
      gtfsId: '40:623',
      id: 'U3RvcDo0MDo2MjM',
      lat: 47.59766,
      lon: -122.328217
    },
    stopCode: null,
    stopId: '40:623',
    vertexType: 'TRANSIT'
  },
  transitLeg: false,
  trip: null
}
