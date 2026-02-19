import { Leg, Place, Stop } from '@opentripplanner/types'

import {
  getFirstTransitLeg,
  getLastTransitLeg,
  ItineraryWithIndex
} from './itinerary'

/* eslint-disable complexity */
export interface CustomRoutingZone {
  bbox: number[]
  destinationRouteExclusionRules?: RouteExclusionRule[]
  destinationStopAdjustmentRules: StopAdjustmentRule[]
  name: string
  originRouteExclusionRules?: RouteExclusionRule[]
  originStopAdjustmentRules: StopAdjustmentRule[]
  times: { end: number; start: number }[]
}

export interface StopAdjustment {
  duration: number
  endTime: number
  intermediateStopsToAdd?: NewStop[]
  intermediateStopsToRemove?: number
  legGeometry: {
    length: number
    pointsToAdd: string
    pointsToCut: string[]
  }
  newStop: NewStop
}

interface NewStop extends Omit<Stop, 'lat' | 'lon'> {
  lat: number
  lon: number
}

export interface StopAdjustmentRule {
  accessibleStopToUse: string
  customWalkLegGeometry: (timeToAdjust: number) => string
  stopAdjustments: { adjustment: StopAdjustment; originalStop: string }[]
  trips: { accessible: boolean; headsigns: string[]; route: string }[]
}

interface RouteExclusionRule {
  headsigns: string[]
  prohibitedRoutes: string[]
  route: string
}

/**
 * Note that the legGeometry.points string may contain double-escaped characters when copied from the OTP response (for example, "sdaf\\sdaf" would evaluate to "sdafsdaf").
 * These double-escaped characters need to be escaped again. So, in the example, "sdaf\\sdaf" would need to be updated to "sdaf\\\\sdaf".
 *
 * Explain duration adjustment better
 */
const STADIUM_TO_ZONE_WALK_LEG = (timeToAdjust: number): string =>
  `{"accessibilityScore":null,"agency":null,"alerts":[],"arrivalDelay":0,"departureDelay":0,"distance":503.56,"dropOffBookingInfo":{"latestBookingTime":null},"dropoffType":"SCHEDULED","duration":493,"endTime":${
    timeToAdjust + 493000
  },"fareProducts":[],"from":{"lat":47.592285,"lon":-122.326988,"name":"Stadium","rentalVehicle":null,"stop":{"alerts":[],"code":null,"gtfsId":"40:99260","id":"U3RvcDo0MDo5OTI2MA","lat":47.592285,"lon":-122.326988},"vertexType":"TRANSIT","stopCode":null,"stopId":"40:99260"},"headsign":null,"id":null,"interlineWithPreviousLeg":false,"intermediateStops":null,"legGeometry":{"length":67,"points":"wjnaHt~riV@??D?L?B?D?H?J?B?D?F?H?B?F?\\\\?@@BC@C@?D?D?jA?fC@FBFBD@??BCXAPA\\\\ZrADNFFHFDDFDH@D?DE@ABG?GCGEMW]GCKAI@IBGDIJEHCLCL?J?~C?T?@?n@BD?LSBE@?nAMCWG"},"mode":"WALK","pickupBookingInfo":null,"pickupType":"SCHEDULED","realTime":false,"realtimeState":null,"rentedBike":false,"rideHailingEstimate":null,"startTime":${timeToAdjust},"steps":[{"absoluteDirection":"WEST","alerts":[],"area":false,"distance":6.91,"elevationProfile":[],"lat":47.5922729,"lon":-122.3269878,"relativeDirection":"DEPART","stayOn":false,"streetName":"SODO Trail"},{"absoluteDirection":"WEST","alerts":[],"area":false,"distance":131.37,"elevationProfile":[],"lat":47.5922724,"lon":-122.32708,"relativeDirection":"CONTINUE","stayOn":false,"streetName":"path"},{"absoluteDirection":"SOUTHWEST","alerts":[],"area":false,"distance":8.14,"elevationProfile":[],"lat":47.5922964,"lon":-122.3288022,"relativeDirection":"LEFT","stayOn":false,"streetName":"4th Avenue South"},{"absoluteDirection":"WEST","alerts":[],"area":false,"distance":29.35,"elevationProfile":[],"lat":47.5922467,"lon":-122.3288776,"relativeDirection":"RIGHT","stayOn":false,"streetName":"sidewalk"},{"absoluteDirection":"SOUTHWEST","alerts":[],"area":true,"distance":261.64,"elevationProfile":[],"lat":47.5922872,"lon":-122.3292643,"relativeDirection":"SLIGHTLY_LEFT","stayOn":true,"streetName":"open area"},{"absoluteDirection":"NORTH","alerts":[],"area":false,"distance":10.64,"elevationProfile":[],"lat":47.5923255,"lon":-122.3311355,"relativeDirection":"RIGHT","stayOn":false,"streetName":"South Royal Brougham Way"},{"absoluteDirection":"WEST","alerts":[],"area":false,"distance":34,"elevationProfile":[],"lat":47.5924202,"lon":-122.3311558,"relativeDirection":"LEFT","stayOn":true,"streetName":"South Royal Brougham Way"},{"absoluteDirection":"NORTH","alerts":[],"area":false,"distance":21.53,"elevationProfile":[],"lat":47.5924575,"lon":-122.3315618,"relativeDirection":"RIGHT","stayOn":false,"streetName":"service road"}],"stopCalls":[],"to":{"lat":47.5927964,"lon":-122.3317254,"name":"Freeway Park, Seattle, WA, USA","rentalVehicle":null,"stop":null,"vertexType":"NORMAL"},"transitLeg":false,"trip":null,"alightRule":"scheduled","boardRule":"scheduled","bookingRuleInfo":{"dropOff":{},"pickUp":{}},"routeColor":"333333","routeTextColor":""}`

const PIONEER_SQUARE_TO_ZONE_WALK_LEG = (timeToAdjust: number): string =>
  `{"accessibilityScore":null,"agency":null,"alerts":[],"arrivalDelay":0,"departureDelay":0,"distance":745.26,"dropOffBookingInfo":{"latestBookingTime":null},"dropoffType":"SCHEDULED","duration":692,"endTime":${
    timeToAdjust + 692000
  },"fareProducts":[],"from":{"lat":47.60256,"lon":-122.331216,"name":"Pioneer Square (Sound Transit)","rentalVehicle":null,"stop":null,"vertexType":"NORMAL"},"headsign":null,"id":null,"interlineWithPreviousLeg":false,"intermediateStops":null,"legGeometry":{"length":76,"points":"}jpaHdysiV\`A{@HIHGDL@DBC^hABHDLJ@@?B?FBHB@?B??t@?@?F?D?P?\`@?BnAgAd@?P?F?F?LA@B@?vB?L??FB?H?@AJA@?@C@?~B?B?DEF?@?B?H?DD@?lC?@@BAJ@N@B??CdC@@MPADAR@B?D?T?B?D?T?B?D?F?F@F??M?E"},"mode":"WALK","pickupBookingInfo":null,"pickupType":"SCHEDULED","realTime":false,"realtimeState":null,"rentedBike":false,"rideHailingEstimate":null,"startTime":${timeToAdjust},"steps":[{"absoluteDirection":"SOUTHEAST","alerts":[],"area":false,"distance":67.67,"elevationProfile":[],"lat":47.6025566,"lon":-122.3312243,"relativeDirection":"DEPART","stayOn":false,"streetName":"3rd Avenue"},{"absoluteDirection":"SOUTHWEST","alerts":[],"area":false,"distance":67.23,"elevationProfile":[],"lat":47.6020628,"lon":-122.330919,"relativeDirection":"RIGHT","stayOn":false,"streetName":"sidewalk"},{"absoluteDirection":"WEST","alerts":[],"area":false,"distance":19.78,"elevationProfile":[],"lat":47.6016432,"lon":-122.3314587,"relativeDirection":"RIGHT","stayOn":false,"streetName":"Yesler Way Cycletrack"},{"absoluteDirection":"WEST","alerts":[],"area":false,"distance":4.19,"elevationProfile":[],"lat":47.6016435,"lon":-122.3317225,"relativeDirection":"CONTINUE","stayOn":false,"streetName":"2nd Avenue Cycletrack"},{"absoluteDirection":"WEST","alerts":[],"area":false,"distance":21.76,"elevationProfile":[],"lat":47.6016407,"lon":-122.3317781,"relativeDirection":"CONTINUE","stayOn":false,"streetName":"path"},{"absoluteDirection":"SOUTHWEST","alerts":[],"area":false,"distance":1.83,"elevationProfile":[],"lat":47.6016489,"lon":-122.3320681,"relativeDirection":"SLIGHTLY_LEFT","stayOn":false,"streetName":"Yesler Way Cycletrack"},{"absoluteDirection":"SOUTHEAST","alerts":[],"area":false,"distance":72.6,"elevationProfile":[],"lat":47.6016401,"lon":-122.3320888,"relativeDirection":"LEFT","stayOn":false,"streetName":"2nd Avenue Extension South"},{"absoluteDirection":"SOUTH","alerts":[],"area":false,"distance":28.66,"elevationProfile":[],"lat":47.6010566,"lon":-122.3317253,"relativeDirection":"CONTINUE","stayOn":false,"streetName":"2nd Avenue South"},{"absoluteDirection":"SOUTH","alerts":[],"area":false,"distance":274.69,"elevationProfile":[],"lat":47.600806,"lon":-122.3317388,"relativeDirection":"LEFT","stayOn":true,"streetName":"2nd Avenue South"},{"absoluteDirection":"SOUTHEAST","alerts":[],"area":false,"distance":2.07,"elevationProfile":[],"lat":47.5983823,"lon":-122.3317495,"relativeDirection":"SLIGHTLY_LEFT","stayOn":false,"streetName":"South King Street"},{"absoluteDirection":"SOUTH","alerts":[],"area":false,"distance":15.82,"elevationProfile":[],"lat":47.5983677,"lon":-122.3317323,"relativeDirection":"RIGHT","stayOn":false,"streetName":"path"},{"absoluteDirection":"SOUTH","alerts":[],"area":false,"distance":78.21,"elevationProfile":[],"lat":47.5982265,"lon":-122.3317585,"relativeDirection":"CONTINUE","stayOn":false,"streetName":"Stadium Place South"},{"absoluteDirection":"EAST","alerts":[],"area":false,"distance":5.09,"elevationProfile":[],"lat":47.5975354,"lon":-122.3317431,"relativeDirection":"LEFT","stayOn":true,"streetName":"Stadium Place South"},{"absoluteDirection":"SOUTH","alerts":[],"area":false,"distance":78.53,"elevationProfile":[],"lat":47.5975208,"lon":-122.3316787,"relativeDirection":"RIGHT","stayOn":false,"streetName":"path"},{"absoluteDirection":"EAST","alerts":[],"area":false,"distance":7.17,"elevationProfile":[],"lat":47.5968155,"lon":-122.331671,"relativeDirection":"LEFT","stayOn":true,"streetName":"parking aisle"}],"stopCalls":[],"to":{"lat":47.5968293,"lon":-122.3315754,"name":"Muckleshoot Heritage Plaza, Seattle, WA, USA","rentalVehicle":null,"stop":null,"vertexType":"NORMAL"},"transitLeg":false,"trip":null,"alightRule":"scheduled","boardRule":"scheduled","bookingRuleInfo":{"dropOff":{},"pickUp":{}},"routeColor":"333333","routeTextColor":""}`

const ZONE_TO_PIONEER_SQUARE_WALK_LEG = (timeToAdjust: number): string =>
  `{"accessibilityScore":null,"agency":null,"alerts":[],"arrivalDelay":0,"departureDelay":0,"distance":728.27,"dropOffBookingInfo":{"latestBookingTime":null},"dropoffType":"SCHEDULED","duration":712,"endTime":${
    timeToAdjust + 692000
  },"fareProducts":[],"from":{"lat":47.5974375,"lon":-122.3315949,"name":"Stadium Place South, Seattle, WA, USA","rentalVehicle":null,"stop":null,"vertexType":"NORMAL"},"headsign":null,"id":null,"interlineWithPreviousLeg":false,"intermediateStops":null,"legGeometry":{"length":61,"points":"}joaHn{siVM?kA?_A?C?O?G?K?iCCS?C?A?O@mA?c@@Q?O?A?M?EAkB@MBI?MAIGGECAGE?AEGGKWTOPa@^a@\\\\ONGFEB_@^A@MJUTUPKHKLEOAA?CAAc@yAGO??EDAEGSAC_@iAEMOLKHYT"},"mode":"WALK","pickupBookingInfo":null,"pickupType":"SCHEDULED","realTime":false,"realtimeState":null,"rentedBike":false,"rideHailingEstimate":null,"startTime":${timeToAdjust},"steps":[{"absoluteDirection":"NORTH","alerts":[],"area":false,"distance":96.21,"elevationProfile":[],"lat":47.5974375,"lon":-122.3315951,"relativeDirection":"DEPART","stayOn":false,"streetName":"Stadium Place South"},{"absoluteDirection":"NORTH","alerts":[],"area":false,"distance":316.98,"elevationProfile":[],"lat":47.5983027,"lon":-122.3315944,"relativeDirection":"CONTINUE","stayOn":false,"streetName":"2nd Avenue South"},{"absoluteDirection":"NORTHWEST","alerts":[],"area":false,"distance":82.45,"elevationProfile":[],"lat":47.6011028,"lon":-122.331387,"relativeDirection":"LEFT","stayOn":false,"streetName":"2nd Avenue Extension South"},{"absoluteDirection":"NORTHWEST","alerts":[],"area":false,"distance":85.19,"elevationProfile":[],"lat":47.6017285,"lon":-122.3319771,"relativeDirection":"CONTINUE","stayOn":false,"streetName":"2nd Avenue"},{"absoluteDirection":"NORTHEAST","alerts":[],"area":false,"distance":7.43,"elevationProfile":[],"lat":47.6023772,"lon":-122.3325817,"relativeDirection":"RIGHT","stayOn":false,"streetName":"path"},{"absoluteDirection":"NORTHEAST","alerts":[],"area":false,"distance":49.51,"elevationProfile":[],"lat":47.60241,"lon":-122.3324953,"relativeDirection":"CONTINUE","stayOn":false,"streetName":"James Street"},{"absoluteDirection":"NORTHWEST","alerts":[],"area":false,"distance":16.79,"elevationProfile":[],"lat":47.6026449,"lon":-122.3319343,"relativeDirection":"LEFT","stayOn":false,"streetName":"path"},{"absoluteDirection":"NORTHEAST","alerts":[],"area":false,"distance":49.59,"elevationProfile":[],"lat":47.602735,"lon":-122.3318172,"relativeDirection":"CONTINUE","stayOn":false,"streetName":"Pioneer Square Station Mezzanine"},{"absoluteDirection":"NORTHWEST","alerts":[],"area":false,"distance":24.11,"elevationProfile":[],"lat":47.6030025,"lon":-122.3314431,"relativeDirection":"CONTINUE","stayOn":false,"streetName":"underpass"}],"stopCalls":[],"to":{"lat":47.6031876,"lon":-122.3316084,"name":"Pioneer Square, Seattle, WA, USA","rentalVehicle":null,"stop":null,"vertexType":"NORMAL"},"transitLeg":false,"trip":null,"alightRule":"scheduled","boardRule":"scheduled","bookingRuleInfo":{"dropOff":{},"pickUp":{}},"routeColor":"333333","routeTextColor":""}`

const ZONE_TO_STADIUM_WALK_LEG = (timeToAdjust: number): string =>
  `{"accessibilityScore":null,"agency":null,"alerts":[],"arrivalDelay":0,"departureDelay":0,"distance":621.33,"dropOffBookingInfo":{"latestBookingTime":null},"dropoffType":"SCHEDULED","duration":582,"endTime":${
    timeToAdjust + 582000
  },"fareProducts":[],"from":{"lat":47.5925996,"lon":-122.3317687,"name":"South Royal Brougham Way, Seattle, WA, USA","rentalVehicle":null,"stop":null,"vertexType":"NORMAL"},"headsign":null,"id":null,"interlineWithPreviousLeg":false,"intermediateStops":null,"legGeometry":{"length":65,"points":"glnaHp|siV?k@?cA?[R?D?L?CE?o@?W?_D?KBMBMDIHKFEHCHAJ@FBV\\\\DLBF?FCFA@EDE?IAGEEEIGGGEO[sA@]@QBY?CA?CECGAG?sE?E?EBABAAE?]?G?C?I?G?E?C?K\\\\?p@?H??\`@"},"mode":"WALK","pickupBookingInfo":null,"pickupType":"SCHEDULED","realTime":false,"realtimeState":null,"rentedBike":false,"rideHailingEstimate":null,"startTime":${timeToAdjust},"steps":[{"absoluteDirection":"EAST","alerts":[],"area":false,"distance":220.12,"elevationProfile":[],"lat":47.592526,"lon":-122.3317679,"relativeDirection":"DEPART","stayOn":false,"streetName":"sidewalk"},{"absoluteDirection":"SOUTHWEST","alerts":[],"area":true,"distance":140.26,"elevationProfile":[],"lat":47.591983,"lon":-122.3295327,"relativeDirection":"SLIGHTLY_RIGHT","stayOn":true,"streetName":"open area"},{"absoluteDirection":"NORTHEAST","alerts":[],"area":false,"distance":8.14,"elevationProfile":[],"lat":47.5922467,"lon":-122.3288776,"relativeDirection":"LEFT","stayOn":false,"streetName":"4th Avenue South"},{"absoluteDirection":"EAST","alerts":[],"area":false,"distance":123.29,"elevationProfile":[],"lat":47.5922964,"lon":-122.3288022,"relativeDirection":"RIGHT","stayOn":false,"streetName":"sidewalk"},{"absoluteDirection":"SOUTH","alerts":[],"area":false,"distance":71.21,"elevationProfile":[],"lat":47.5922728,"lon":-122.3271879,"relativeDirection":"RIGHT","stayOn":false,"streetName":"SODO Trail"},{"absoluteDirection":"SOUTH","alerts":[],"area":true,"distance":58.31,"elevationProfile":[],"lat":47.5916323,"lon":-122.3271875,"relativeDirection":"CONTINUE","stayOn":false,"streetName":"Stadium"}],"stopCalls":[],"to":{"lat":47.591108,"lon":-122.327172,"name":"Stadium (Sound Transit)","rentalVehicle":null,"stop":null,"vertexType":"NORMAL"},"transitLeg":false,"trip":null,"alightRule":"scheduled","boardRule":"scheduled","bookingRuleInfo":{"dropOff":{},"pickUp":{}},"routeColor":"333333","routeTextColor":""}`

const INTERNATIONAL_DISTRICT_TO_ZONE_WALK_LEG = (
  timeToAdjust: number
): string =>
  `{"accessibilityScore":1,"agency":null,"alerts":[],"arrivalDelay":0,"departureDelay":0,"distance":381.73,"dropOffBookingInfo":{"latestBookingTime":null},"dropoffType":"SCHEDULED","duration":434,"endTime":${
    timeToAdjust + 434000
  },"fareProducts":[],"from":{"lat":47.59766,"lon":-122.328217,"name":"Int'l Dist/Chinatown","rentalVehicle":null,"stop":{"alerts":[],"code":null,"gtfsId":"40:623","id":"U3RvcDo0MDo2MjM","lat":47.59766,"lon":-122.328217},"vertexType":"TRANSIT","stopCode":null,"stopId":"40:623"},"headsign":null,"id":null,"interlineWithPreviousLeg":false,"intermediateStops":null,"legGeometry":{"length":36,"points":"kloaHjfsiV?@P??D?dAAh@?HCB?D?V@^?DAD?D?X?HAxA?Z?j@?????BTRB@@?J?P?|A?JRFJ@??|DHH@@B?p@]"},"mode":"WALK","pickupBookingInfo":null,"pickupType":"SCHEDULED","realTime":false,"realtimeState":null,"rentedBike":false,"rideHailingEstimate":null,"startTime":${timeToAdjust},"steps":[{"absoluteDirection":"SOUTH","alerts":[],"area":false,"distance":9.38,"elevationProfile":[],"lat":47.59766,"lon":-122.3282229,"relativeDirection":"DEPART","stayOn":false,"streetName":"path"},{"absoluteDirection":"WEST","alerts":[],"area":false,"distance":52.92,"elevationProfile":[],"lat":47.5975757,"lon":-122.3282238,"relativeDirection":"RIGHT","stayOn":false,"streetName":"South Weller Street"},{"absoluteDirection":"WEST","alerts":[],"area":false,"distance":25.35,"elevationProfile":[],"lat":47.5976022,"lon":-122.3289176,"relativeDirection":"CONTINUE","stayOn":false,"streetName":"path"},{"absoluteDirection":"WEST","alerts":[],"area":false,"distance":76.81,"elevationProfile":[],"lat":47.5976091,"lon":-122.3292521,"relativeDirection":"SLIGHTLY_LEFT","stayOn":false,"streetName":"South Weller Street Overpass"},{"absoluteDirection":"SOUTH","alerts":[],"area":false,"distance":0,"elevationProfile":[],"lat":47.5976152,"lon":-122.3302764,"relativeDirection":"LEFT","stayOn":false,"streetName":"ElevatorBoardEdge"},{"absoluteDirection":null,"alerts":[],"area":false,"distance":0,"elevationProfile":[],"lat":47.5976152,"lon":-122.3302764,"relativeDirection":"ELEVATOR","stayOn":false,"streetName":"elevator"},{"absoluteDirection":"WEST","alerts":[],"area":false,"distance":1.51,"elevationProfile":[],"lat":47.5976152,"lon":-122.3302764,"relativeDirection":"RIGHT","stayOn":false,"streetName":"South Weller Street"},{"absoluteDirection":"SOUTHWEST","alerts":[],"area":true,"distance":86.24,"elevationProfile":[],"lat":47.5976151,"lon":-122.3302966,"relativeDirection":"LEFT","stayOn":false,"streetName":"open area"},{"absoluteDirection":"SOUTHWEST","alerts":[],"area":false,"distance":16.6,"elevationProfile":[],"lat":47.5968581,"lon":-122.3304073,"relativeDirection":"RIGHT","stayOn":true,"streetName":"path"},{"absoluteDirection":"SOUTH","alerts":[],"area":false,"distance":72.93,"elevationProfile":[],"lat":47.5967558,"lon":-122.3305686,"relativeDirection":"LEFT","stayOn":true,"streetName":"sidewalk"},{"absoluteDirection":"SOUTHWEST","alerts":[],"area":false,"distance":10.07,"elevationProfile":[],"lat":47.5967422,"lon":-122.3315199,"relativeDirection":"LEFT","stayOn":true,"streetName":"path"},{"absoluteDirection":"SOUTH","alerts":[],"area":true,"distance":29.94,"elevationProfile":[],"lat":47.5966617,"lon":-122.3315757,"relativeDirection":"SLIGHTLY_LEFT","stayOn":false,"streetName":"Muckleshoot Heritage Plaza"}],"stopCalls":[],"to":{"lat":47.596411,"lon":-122.33143,"name":"Muckleshoot Heritage Plaza, Pioneer Square, Seattle, WA","rentalVehicle":null,"stop":null,"vertexType":"NORMAL"},"transitLeg":false,"trip":null,"alightRule":"scheduled","boardRule":"scheduled","bookingRuleInfo":{"dropOff":{},"pickUp":{}},"routeColor":"333333","routeTextColor":""}`

const ZONE_TO_INTERNATIONAL_DISTRICT_WALK_LEG = (
  timeToAdjust: number
): string =>
  `{"accessibilityScore":1,"agency":null,"alerts":[],"arrivalDelay":0,"departureDelay":0,"distance":442.55,"dropOffBookingInfo":{"latestBookingTime":null},"dropoffType":"SCHEDULED","duration":360,"endTime":${
    timeToAdjust + 360000
  },"fareProducts":[],"from":{"lat":47.703414,"lon":-122.328244,"name":"Northgate","rentalVehicle":null,"stop":{"alerts":[],"code":null,"gtfsId":"40:990006","id":"U3RvcDo0MDo5OTAwMDY","lat":47.703414,"lon":-122.328244},"vertexType":"TRANSIT","stopCode":null,"stopId":"40:990006"},"headsign":null,"id":null,"interlineWithPreviousLeg":false,"intermediateStops":null,"legGeometry":{"length":30,"points":"iadbHpfsiV?@jDN@B?bA@DP?d@Cd@Af@C\`ACJO?Q?WACC@m@@g@?O@Y?cA@i@@S?A?g@@A?AA?C?C?M"},"mode":"WALK","pickupBookingInfo":null,"pickupType":"SCHEDULED","realTime":false,"realtimeState":null,"rentedBike":false,"rideHailingEstimate":null,"startTime":${timeToAdjust},"steps":[{"absoluteDirection":"SOUTH","alerts":[],"area":true,"distance":97.62,"elevationProfile":[],"lat":47.7034139,"lon":-122.3282596,"relativeDirection":"DEPART","stayOn":false,"streetName":"Northgate"},{"absoluteDirection":"WEST","alerts":[],"area":false,"distance":140.19,"elevationProfile":[],"lat":47.7025446,"lon":-122.3283563,"relativeDirection":"SLIGHTLY_RIGHT","stayOn":false,"streetName":"John Lewis Memorial Bridge"},{"absoluteDirection":"SOUTHEAST","alerts":[],"area":true,"distance":8.29,"elevationProfile":[],"lat":47.7015304,"lon":-122.3286524,"relativeDirection":"LEFT","stayOn":false,"streetName":"open area"},{"absoluteDirection":"EAST","alerts":[],"area":false,"distance":15.68,"elevationProfile":[],"lat":47.701477,"lon":-122.3285751,"relativeDirection":"LEFT","stayOn":true,"streetName":"path"},{"absoluteDirection":"EAST","alerts":[],"area":false,"distance":1.33,"elevationProfile":[],"lat":47.7014782,"lon":-122.3283655,"relativeDirection":"CONTINUE","stayOn":false,"streetName":"Northeast 100th Street"},{"absoluteDirection":"NORTH","alerts":[],"area":false,"distance":171.51,"elevationProfile":[],"lat":47.7014808,"lon":-122.3283481,"relativeDirection":"LEFT","stayOn":false,"streetName":"1st Avenue Northeast"},{"absoluteDirection":"EAST","alerts":[],"area":false,"distance":7.92,"elevationProfile":[],"lat":47.7030211,"lon":-122.3283944,"relativeDirection":"RIGHT","stayOn":false,"streetName":"Northeast 103rd Street"}],"stopCalls":[],"to":{"lat":47.703028,"lon":-122.32829,"name":"Northgate (Sound Transit)","rentalVehicle":null,"stop":null,"vertexType":"NORMAL"},"transitLeg":false,"trip":null,"alightRule":"scheduled","boardRule":"scheduled","bookingRuleInfo":{"dropOff":{},"pickUp":{}},"routeColor":"333333","routeTextColor":""}`

const STOPS: Record<string, NewStop> = {
  INTERNATIONAL_DISTRICT_CHINATOWN: {
    gtfsId: '40:623',
    id: 'U3RvcDo0MDo2MjM',
    lat: 47.59766,
    lon: -122.328217,
    name: "Int'l Dist/Chinatown"
  },
  PIONEER_SQUARE: {
    gtfsId: '40:501',
    id: 'U3RvcDo0MDo1MDE',
    lat: 47.602139,
    lon: -122.331055,
    name: 'Pioneer Square'
  },
  STADIUM: {
    gtfsId: '40:99260',
    id: 'U3RvcDo0MDo5OTI2MA',
    lat: 47.592285,
    lon: -122.326988,
    name: 'Stadium'
  }
}

export const soundTransitCustomRoutingZones: CustomRoutingZone[] = [
  {
    // Seattle Stadium zone
    bbox: [47.592241, 47.597523, -122.333457, -122.329477],
    destinationRouteExclusionRules: [
      {
        // itineraries that end in the zone and use the 2 Line are prohibited from
        // using the 1 Line
        headsigns: ['Lynnwood City Center'],
        prohibitedRoutes: ['1 Line'],
        route: '2 Line'
      }
    ],
    destinationStopAdjustmentRules: [
      {
        // NORTHBOUND 1 Line trips TO Seattle Stadium
        accessibleStopToUse: 'CID_stop_id',
        customWalkLegGeometry: STADIUM_TO_ZONE_WALK_LEG,
        stopAdjustments: [
          {
            adjustment: {
              duration: -120,
              endTime: -120000,
              intermediateStopsToRemove: 1,
              legGeometry: {
                length: -24,
                pointsToAdd: '',
                pointsToCut: [
                  'uA?g@Be@H[JcBj@o@PsGfBc@H_@D]@]?YC{@Gc@A]?}ADQ?IAKCk@UKAOA_C?'
                ]
              },
              newStop: STOPS.STADIUM
            },
            originalStop: "Int'l Dist/Chinatown"
          }
        ],
        trips: [
          {
            accessible: false,
            headsigns: ['Lynnwood City Center'],
            route: '1 Line'
          }
        ]
      },
      {
        // SOUTHBOUND 1 & 2 Line trips TO Seattle Stadium
        accessibleStopToUse: 'CID_stop_id',
        customWalkLegGeometry: PIONEER_SQUARE_TO_ZONE_WALK_LEG,
        stopAdjustments: [
          {
            adjustment: {
              duration: -120,
              endTime: -120000,
              intermediateStopsToRemove: 1,
              legGeometry: {
                length: -19,
                pointsToAdd: '',
                pointsToCut: [
                  '??p@m@X[Xc@hEyHR]NQLQLO\\W^SPIPE`@If@AjI?N@J@HB',
                  '??p@m@X[Xc@hEyHR]NQLQLO\\W^SPIPE`@If@AlBBtEC'
                ]
              },
              newStop: STOPS.PIONEER_SQUARE
            },
            originalStop: "Int'l Dist/Chinatown"
          },
          {
            adjustment: {
              duration: -300,
              endTime: -300000,
              intermediateStopsToRemove: 2,
              legGeometry: {
                length: -34,
                pointsToAdd: '',
                pointsToCut: [
                  '??p@m@X[Xc@hEyHR]NQLQLO\\W^SPIPE`@If@AjI?N@J@HB??B@f@RJBJ@xGCt@CZCZEr@MnFyA|C{@b@Gd@CpD?'
                ]
              },
              newStop: STOPS.PIONEER_SQUARE
            },
            originalStop: 'Stadium'
          }
        ],
        trips: [
          {
            accessible: false,
            headsigns: ['Federal Way Downtown'],
            route: '1 Line'
          },
          {
            accessible: false,
            headsigns: ['Downtown Redmond', "Int'l Dist/Chinatown"],
            route: '2 Line'
          }
        ]
      },
      {
        // SOUTHBOUND ACCESSIBLE 1 Line trips TO Seattle Stadium
        accessibleStopToUse: 'CID_stop_id',
        customWalkLegGeometry: INTERNATIONAL_DISTRICT_TO_ZONE_WALK_LEG,
        stopAdjustments: [
          {
            adjustment: {
              duration: -180,
              endTime: -180000,
              intermediateStopsToRemove: 1,
              legGeometry: {
                length: -15,
                pointsToAdd: '',
                pointsToCut: ['??B@f@RJBJ@xGCt@CZCZEr@MnFyA|C{@b@Gd@CpD?']
              },
              newStop: STOPS.INTERNATIONAL_DISTRICT_CHINATOWN
            },
            originalStop: 'Stadium'
          }
        ],
        trips: [
          {
            accessible: true,
            headsigns: ['Federal Way Downtown'],
            route: '1 Line'
          }
        ]
      },
      {
        // WESTBOUND 2 Line trips TO Seattle Stadium
        accessibleStopToUse: 'CID_stop_id',
        customWalkLegGeometry: () => '',
        stopAdjustments: [],
        trips: [
          {
            accessible: false,
            headsigns: ['Lynnwood City Center'],
            route: '2 Line'
          }
        ]
      }
    ],
    name: 'Seattle Stadium FIFA Zone',
    originRouteExclusionRules: [
      {
        // itineraries that begin in the zone and use the 2 Line are prohibited from
        // also using the 1 Line
        headsigns: ['Downtown Redmond'],
        prohibitedRoutes: ['1 Line'],
        route: '2 Line'
      }
    ],
    originStopAdjustmentRules: [
      {
        // NORTHBOUND 1 & 2 Line trips FROM Seattle Stadium
        accessibleStopToUse: 'CID_stop_id',
        customWalkLegGeometry: ZONE_TO_PIONEER_SQUARE_WALK_LEG,
        stopAdjustments: [
          {
            adjustment: {
              duration: -120,
              endTime: -120000,
              intermediateStopsToRemove: 1,
              legGeometry: {
                length: -16,
                pointsToAdd: 'unpaHb|siVw@j@',
                pointsToCut: [
                  'eqoaHtdsiV_FAi@B_@FQFQF_@R]X[\\OTQZsEhI]f@YZoE|DIH??w@j@'
                ]
              },
              newStop: STOPS.PIONEER_SQUARE
            },
            originalStop: "Int'l Dist/Chinatown"
          }
        ],
        trips: [
          {
            accessible: false,
            headsigns: ['Lynnwood City Center'],
            route: '1 Line'
          },
          {
            accessible: false,
            headsigns: ['Lynnwood City Center'],
            route: '2 Line'
          }
        ]
      },
      {
        // SOUTHBOUND 1 Line trips FROM Seattle Stadium
        accessibleStopToUse: 'CID_stop_id',
        customWalkLegGeometry: ZONE_TO_STADIUM_WALK_LEG,
        stopAdjustments: [
          {
            adjustment: {
              duration: -180,
              endTime: -180000,
              intermediateStopsToRemove: 1,
              legGeometry: {
                length: -15,
                pointsToAdd: '{gnaHj`siV',
                pointsToCut: [
                  'eloaHpesiVB@f@RJBJ@xGCt@CZCZEr@MnFyA|C{@b@Gd@CpD???'
                ]
              },
              newStop: STOPS.STADIUM
            },
            originalStop: "Int'l Dist/Chinatown"
          }
        ],
        trips: [
          {
            accessible: false,
            headsigns: ['Federal Way Downtown'],
            route: '1 Line'
          }
        ]
      }
    ],
    times: [
      {
        end: 1798790399000, // end of 2026
        start: 1767254400000 // beginning of 2026
      },
      {
        // 6/15/26, 12pm Match
        end: 1781569800000, // 5:30pm
        start: 1781535600000 // 8am
      },
      {
        // 6/19/26, 12pm Match
        end: 1781915400000, // 5:30pm
        start: 1781881200000 // 8am
      },
      {
        // 6/24/26, 12pm Match
        end: 1782347400000, // 5:30pm
        start: 1782313200000 // 8am
      },
      {
        // 6/26/26, 8pm Match
        end: 1782549000000, // 1:30am (6/27)
        start: 1782514800000 // 4pm
      },
      {
        // 7/1/26, 1pm Match
        end: 1782955800000, // 6:30pm
        start: 1782921600000 // 9am
      },
      {
        // 7/6/26, 5pm Match
        end: 1783402200000, // 10:30pm
        start: 1783368000000 // 1pm
      }
    ]
  }
]

const isInBBox = (lat: number, lon: number, bbox: number[]) => {
  const [minLat, maxLat, minLon, maxLon] = bbox
  return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon
}

const legTriggersRule =
  (accessible: boolean, leg?: Leg) => (rule: StopAdjustmentRule) =>
    leg &&
    rule.trips.some(
      (trip) =>
        leg.headsign &&
        trip.headsigns.includes(leg.headsign) &&
        trip.route === leg.routeShortName &&
        trip.accessible === accessible
    )

const legUsesRuleRoute = (leg: Leg, rule: RouteExclusionRule) =>
  leg.headsign &&
  rule.headsigns.includes(leg.headsign) &&
  rule.route === leg.routeShortName

const legUsesProhibitedRoute = (leg: Leg, rule: RouteExclusionRule) =>
  leg.routeShortName && rule.prohibitedRoutes.includes(leg.routeShortName)

const adjustLeg = (
  adjustment: StopAdjustment,
  leg: Leg,
  type: 'destination' | 'origin'
): Leg => {
  // Attempt to cut and replace any matching parts of the leg geometry polyline
  let updatedPoints = leg.legGeometry.points
  if (!adjustment.legGeometry.pointsToCut.length) {
    // only add geometry points
    updatedPoints += adjustment.legGeometry.pointsToAdd
  } else {
    // cut and replace geometry points
    adjustment.legGeometry.pointsToCut.forEach(
      (ptc) =>
        (updatedPoints = updatedPoints.replace(
          ptc,
          adjustment.legGeometry.pointsToAdd
        ))
    )
  }

  // Update everything on the leg except for the from/to object, which will depend on
  // the type of adjustment
  const updatedLeg: Leg = {
    ...leg,
    duration: leg.duration + adjustment.duration,
    endTime: leg.endTime + adjustment.endTime,
    legGeometry: {
      ...leg.legGeometry,
      length: leg.legGeometry.length + adjustment.legGeometry.length,
      points: updatedPoints
    }
  }

  if (adjustment.intermediateStopsToRemove) {
    // For destination adjustments, remove stops from the end of the stop list
    // For origin adjustments, remove stops from the beginning of the stop list
    const sliceArgs = {
      end:
        type === 'destination'
          ? -1 * adjustment.intermediateStopsToRemove
          : undefined,
      start: type === 'destination' ? 0 : adjustment.intermediateStopsToRemove
    }

    updatedLeg.intermediateStops = leg.intermediateStops.slice(
      sliceArgs.start,
      sliceArgs.end
    )

    updatedLeg.stopCalls = leg.stopCalls?.slice(sliceArgs.start, sliceArgs.end)
  }

  if (adjustment.intermediateStopsToAdd) {
    // For destination adjustments, add stops to the end of the stop list
    // For origin adjustments, add stops to the beginning of the stop list
    const places: Place[] = adjustment.intermediateStopsToAdd.map((stop) => {
      return {
        lat: stop.lat,
        locationType: 'STOP',
        lon: stop.lon,
        name: stop.name,
        stopCode: undefined,
        stopId: stop.id,
        vertexType: 'TRANSIT'
      }
    })

    let updatedStops: Place[]

    if (type === 'destination') {
      updatedStops = [...updatedLeg.intermediateStops, ...places]
    } else {
      updatedStops = [...places, ...updatedLeg.intermediateStops]
    }

    updatedLeg.intermediateStops = updatedStops
    if (updatedLeg.stopCalls && updatedLeg.stopCalls.length)
      updatedLeg.stopCalls = updatedLeg.stopCalls.concat(
        updatedLeg.stopCalls[0]
      )
  }

  return updatedLeg
}

const updatePlaceWithNewStop = (previous: Place, newStop: NewStop): Place => {
  return {
    ...previous,
    lat: newStop.lat,
    lon: newStop.lon,
    name: newStop.name,
    stop: {
      ...previous.stop,
      gtfsId: newStop.gtfsId,
      id: newStop.id,
      lat: newStop.lat,
      lon: newStop.lon,
      name: newStop.name
    },
    stopId: newStop.gtfsId
  }
}

const itineraryIsInZoneTimeRange = (
  itin: ItineraryWithIndex,
  zone: CustomRoutingZone
) => {
  const startTime = itin.startTime
  return zone.times.some(
    (time) => startTime >= time.start && startTime <= time.end
  )
}

/**
 * Takes a set of custom routing zones and an itinerary and extracts the relevant origin and/or
 * destination rule and zone names
 */
const extractRulesFromZones = (
  accessible: boolean,
  itin: ItineraryWithIndex,
  zones: CustomRoutingZone[],
  firstTransitLeg?: Leg,
  lastTransitLeg?: Leg
) => {
  const origin = { lat: itin.legs[0].from.lat, lon: itin.legs[0].from.lon }
  const destination = {
    lat: itin.legs[itin.legs.length - 1].to.lat,
    lon: itin.legs[itin.legs.length - 1].to.lon
  }

  let originStopAdjustmentRule: StopAdjustmentRule | undefined
  let destinationStopAdjustmentRule: StopAdjustmentRule | undefined

  let originZoneName: string | undefined
  let destinationZoneName: string | undefined

  let originRouteExclusionRules: RouteExclusionRule[] = []
  let destinationRouteExclusionRules: RouteExclusionRule[] = []

  for (let i = 0; i < zones.length; i++) {
    const zone = zones[i]
    if (!itineraryIsInZoneTimeRange(itin, zone)) continue
    if (isInBBox(origin.lat, origin.lon, zone.bbox)) {
      originStopAdjustmentRule = zone.originStopAdjustmentRules.find(
        legTriggersRule(accessible, firstTransitLeg)
      )
      if (zone.originRouteExclusionRules)
        originRouteExclusionRules = [
          ...originRouteExclusionRules,
          ...zone.originRouteExclusionRules
        ]
      originZoneName = zone.name
    }

    if (isInBBox(destination.lat, destination.lon, zone.bbox)) {
      destinationStopAdjustmentRule = zone.destinationStopAdjustmentRules.find(
        legTriggersRule(accessible, lastTransitLeg)
      )
      if (zone.destinationRouteExclusionRules)
        destinationRouteExclusionRules = [
          ...destinationRouteExclusionRules,
          ...zone.destinationRouteExclusionRules
        ]
      destinationZoneName = zone.name
    }
  }

  return {
    destinationRouteExclusionRules,
    destinationStopAdjustmentRule,
    destinationZoneName,
    originRouteExclusionRules,
    originStopAdjustmentRule,
    originZoneName
  }
}

/**
 * Adjusts a given itinerary according to the origin and/or destination rules contained within the given
 * stop adjustment. If no adjustment is provided, the walk legs can still be updated using the provided
 * customWalkLegGeometry
 */
export const adjustItinerary = (
  customWalkLegGeometry: (timeToAdjust: number) => string,
  itinerary: ItineraryWithIndex,
  type: 'destination' | 'origin',
  adjustment?: StopAdjustment,
  zoneName?: string
): ItineraryWithIndex => {
  const relevantLeg =
    type === 'destination'
      ? getLastTransitLeg(itinerary)
      : getFirstTransitLeg(itinerary)

  if (!relevantLeg) return itinerary

  const updatedItinerary = { ...itinerary }

  const updatedLeg = adjustment
    ? adjustLeg(adjustment, relevantLeg, type)
    : relevantLeg

  if (type === 'origin') {
    if (adjustment) {
      updatedLeg.from = updatePlaceWithNewStop(
        updatedLeg.from,
        adjustment.newStop
      )

      // Replace the first transit leg with the updated leg
      for (let i = 0; i <= updatedItinerary.legs.length; i++) {
        const leg = updatedItinerary.legs[i]
        if (leg.transitLeg) {
          updatedItinerary.legs[i] = updatedLeg
          break
        }
      }
    }

    // Replace the first walk leg with the custom walk leg
    for (let i = 0; i < updatedItinerary.legs.length; i++) {
      const leg = updatedItinerary.legs[i]
      if (leg.mode === 'WALK') {
        let walkLegObject
        try {
          walkLegObject = JSON.parse(
            customWalkLegGeometry(updatedItinerary.startTime)
          )
        } catch (error) {
          console.error('unable to parse custom walk leg', error)
        }
        const updatedWalkLeg = walkLegObject ?? leg
        updatedItinerary.legs[i] = {
          ...updatedWalkLeg,
          from: {
            ...updatedWalkLeg.from,
            name: zoneName || updatedWalkLeg.from.name
          }
        }
        break
      }
    }
  }

  if (type === 'destination') {
    if (adjustment) {
      updatedLeg.to = updatePlaceWithNewStop(updatedLeg.to, adjustment.newStop)

      // Replace the last transit leg with the updated leg
      for (let i = updatedItinerary.legs.length - 1; i >= 0; i--) {
        const leg = updatedItinerary.legs[i]
        if (leg.transitLeg) {
          updatedItinerary.legs[i] = updatedLeg
          break
        }
      }
    }

    // Replace the last walk leg with the custom walk leg
    for (let i = updatedItinerary.legs.length - 1; i >= 0; i--) {
      const leg = updatedItinerary.legs[i]
      if (leg.mode === 'WALK') {
        let walkLegObject
        try {
          walkLegObject = JSON.parse(customWalkLegGeometry(updatedLeg.endTime))
        } catch (error) {
          console.error('unable to parse custom walk leg', error)
        }
        const updatedWalkLeg = walkLegObject ?? leg
        updatedItinerary.legs[i] = {
          ...updatedWalkLeg,
          to: {
            ...updatedWalkLeg.to,
            name: zoneName || updatedWalkLeg.to.name
          }
        }
        break
      }
    }
  }

  // Update itinerary time and distance values based on updated legs
  updatedItinerary.startTime = Number(updatedItinerary.legs[0].startTime)
  updatedItinerary.endTime =
    updatedItinerary.legs[updatedItinerary.legs.length - 1].endTime
  updatedItinerary.duration =
    (updatedItinerary.endTime - updatedItinerary.startTime) / 1000
  updatedItinerary.walkDistance = updatedItinerary.legs
    .filter((leg) => leg.mode === 'WALK')
    .map((leg) => leg.distance)
    .reduce((accumulator, currentValue) => accumulator + currentValue)
  updatedItinerary.walkTime = updatedItinerary.legs
    .filter((leg) => leg.mode === 'WALK')
    .map((leg) => leg.duration)
    .reduce((accumulator, currentValue) => accumulator + currentValue)

  return updatedItinerary
}

export const updateItinerariesWithStopAdjustments = (
  accessible: boolean,
  customRoutingZones: CustomRoutingZone[],
  itineraries: ItineraryWithIndex[]
): ItineraryWithIndex[] => {
  const updatedItineraries = [...itineraries]
  const indicesToRemove: Set<number> = new Set()

  for (let i = 0; i < updatedItineraries.length; i++) {
    let itin = updatedItineraries[i]

    const firstTransitLeg = getFirstTransitLeg(itin)
    const lastTransitLeg = getLastTransitLeg(itin)

    const {
      destinationRouteExclusionRules,
      destinationStopAdjustmentRule,
      destinationZoneName,
      originRouteExclusionRules,
      originStopAdjustmentRule,
      originZoneName
    } = extractRulesFromZones(
      accessible,
      itin,
      customRoutingZones,
      firstTransitLeg,
      lastTransitLeg
    )

    // check if any transit leg violates route exclusion rules
    const routeExclusionRules = [
      ...destinationRouteExclusionRules,
      ...originRouteExclusionRules
    ]
    for (let j = 0; j < routeExclusionRules.length; j++) {
      if (indicesToRemove.has(i)) break
      const rule = routeExclusionRules[j]
      let ruleRouteUsed = false
      let ruleProhibitedRouteUsed = false
      for (let k = 0; k < itin.legs.length; k++) {
        const leg = itin.legs[k]
        if (legUsesRuleRoute(leg, rule)) ruleRouteUsed = true
        if (legUsesProhibitedRoute(leg, rule)) ruleProhibitedRouteUsed = true
        if (ruleRouteUsed && ruleProhibitedRouteUsed) {
          indicesToRemove.add(i)
          break
        }
      }
    }

    if (originStopAdjustmentRule) {
      // apply rule stop adjustments (if applicable) to the first transit leg, first stop
      const adjustment = originStopAdjustmentRule.stopAdjustments.find(
        (adj) => adj.originalStop === firstTransitLeg?.from?.name
      )?.adjustment
      console.log('origin adjustment', adjustment)
      const updatedItinerary = adjustItinerary(
        originStopAdjustmentRule.customWalkLegGeometry,
        itin,
        'origin',
        adjustment,
        originZoneName
      )
      itin = updatedItinerary
    }

    if (destinationStopAdjustmentRule) {
      // apply rule stop adjustments (if applicable) to the last transit leg, last stop
      const adjustment = destinationStopAdjustmentRule.stopAdjustments.find(
        (adj) => adj.originalStop === lastTransitLeg?.to?.name
      )?.adjustment
      console.log('destination adjustment', adjustment)
      const updatedItinerary = adjustItinerary(
        destinationStopAdjustmentRule.customWalkLegGeometry,
        itin,
        'destination',
        adjustment,
        destinationZoneName
      )
      itin = updatedItinerary
    }

    updatedItineraries[i] = itin
  }

  const finalItineraries = []

  // remove itineraries that violated route exclusion rules
  for (let i = 0; i < updatedItineraries.length; i++) {
    if (!indicesToRemove.has(i)) finalItineraries.push(updatedItineraries[i])
  }

  return finalItineraries
}
