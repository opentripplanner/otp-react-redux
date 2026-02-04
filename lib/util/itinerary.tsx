/* eslint-disable complexity */
import { differenceInMinutes } from 'date-fns'
import {
  FareProductSelector,
  Itinerary,
  Leg,
  Place
} from '@opentripplanner/types'
import { isTransitLeg } from '@opentripplanner/core-utils/lib/itinerary'
import { utcToZonedTime } from 'date-fns-tz'
import coreUtils from '@opentripplanner/core-utils'
import hash from 'object-hash'
import memoize from 'lodash.memoize'

import { AppConfig, CO2Config } from './config-types'
import { checkForRouteModeOverride } from './config'
import { WEEKDAYS, WEEKEND_DAYS } from './monitored-trip'

interface CustomRoutingZone {
  bbox: number[]
  destinationRoutingRules: Rule[]
  name: string
  originRoutingRules: Rule[]
}

interface StopAdjustment {
  // distance??
  duration: number
  endTime: number
  intermediateStops: number
  itineraryDuration: number
  itineraryEndTime: number
  legGeometry: {
    length: number
    pointsToAdd: string
    pointsToCut: string
  }
  stopCalls: number
  toOrFrom: {
    lat: number
    lon: number
    name: string
    stop: {
      gtfsId: string
      id: string
      lat: number
      lon: number
      name: string
    }
    stopId: string
  }
}

interface Rule {
  accessibleStopToUse: string
  customWalkLegGeometry: string
  // multiple headsigns??
  headsign: string
  route: string
  stopAdjustments: { adjustment: StopAdjustment; originalStop: string }[]
}

// EXAMPLES

// need to update the "realtime" values in here such as start and end time
const STADIUM_TO_ZONE_WALK_LEG =
  '{"accessibilityScore":null,"agency":null,"alerts":[],"arrivalDelay":0,"departureDelay":0,"distance":503.56,"dropOffBookingInfo":{"latestBookingTime":null},"dropoffType":"SCHEDULED","duration":493,"endTime":1769811163000,"fareProducts":[],"from":{"lat":47.592285,"lon":-122.326988,"name":"Stadium","rentalVehicle":null,"stop":{"alerts":[],"code":null,"gtfsId":"40:99260","id":"U3RvcDo0MDo5OTI2MA","lat":47.592285,"lon":-122.326988},"vertexType":"TRANSIT","stopCode":null,"stopId":"40:99260"},"headsign":null,"id":null,"interlineWithPreviousLeg":false,"intermediateStops":null,"legGeometry":{"length":67,"points":"wjnaHt~riV@??D?L?B?D?H?J?B?D?F?H?B?F?\\\\?@@BC@C@?D?D?jA?fC@FBFBD@??BCXAPA\\\\ZrADNFFHFDDFDH@D?DE@ABG?GCGEMW]GCKAI@IBGDIJEHCLCL?J?~C?T?@?n@BD?LSBE@?nAMCWG"},"mode":"WALK","pickupBookingInfo":null,"pickupType":"SCHEDULED","realTime":false,"realtimeState":null,"rentedBike":false,"rideHailingEstimate":null,"startTime":1769810670000,"steps":[{"absoluteDirection":"WEST","alerts":[],"area":false,"distance":6.91,"elevationProfile":[],"lat":47.5922729,"lon":-122.3269878,"relativeDirection":"DEPART","stayOn":false,"streetName":"SODO Trail"},{"absoluteDirection":"WEST","alerts":[],"area":false,"distance":131.37,"elevationProfile":[],"lat":47.5922724,"lon":-122.32708,"relativeDirection":"CONTINUE","stayOn":false,"streetName":"path"},{"absoluteDirection":"SOUTHWEST","alerts":[],"area":false,"distance":8.14,"elevationProfile":[],"lat":47.5922964,"lon":-122.3288022,"relativeDirection":"LEFT","stayOn":false,"streetName":"4th Avenue South"},{"absoluteDirection":"WEST","alerts":[],"area":false,"distance":29.35,"elevationProfile":[],"lat":47.5922467,"lon":-122.3288776,"relativeDirection":"RIGHT","stayOn":false,"streetName":"sidewalk"},{"absoluteDirection":"SOUTHWEST","alerts":[],"area":true,"distance":261.64,"elevationProfile":[],"lat":47.5922872,"lon":-122.3292643,"relativeDirection":"SLIGHTLY_LEFT","stayOn":true,"streetName":"open area"},{"absoluteDirection":"NORTH","alerts":[],"area":false,"distance":10.64,"elevationProfile":[],"lat":47.5923255,"lon":-122.3311355,"relativeDirection":"RIGHT","stayOn":false,"streetName":"South Royal Brougham Way"},{"absoluteDirection":"WEST","alerts":[],"area":false,"distance":34,"elevationProfile":[],"lat":47.5924202,"lon":-122.3311558,"relativeDirection":"LEFT","stayOn":true,"streetName":"South Royal Brougham Way"},{"absoluteDirection":"NORTH","alerts":[],"area":false,"distance":21.53,"elevationProfile":[],"lat":47.5924575,"lon":-122.3315618,"relativeDirection":"RIGHT","stayOn":false,"streetName":"service road"}],"stopCalls":[],"to":{"lat":47.5927964,"lon":-122.3317254,"name":"Freeway Park, Seattle, WA, USA","rentalVehicle":null,"stop":null,"vertexType":"NORMAL"},"transitLeg":false,"trip":null,"alightRule":"scheduled","boardRule":"scheduled","bookingRuleInfo":{"dropOff":{},"pickUp":{}},"routeColor":"333333","routeTextColor":""}'
// '{"accessibilityScore":null,"agency":null,"alerts":[],"arrivalDelay":0,"departureDelay":0,"distance":503.56,"dropOffBookingInfo":{"latestBookingTime":null},"dropoffType":"SCHEDULED","duration":493,"endTime":1769811163000,"fareProducts":[],"from":{"lat":47.592285,"lon":-122.326988,"name":"Stadium","rentalVehicle":null,"stop":{"alerts":[],"code":null,"gtfsId":"40:99260","id":"U3RvcDo0MDo5OTI2MA","lat":47.592285,"lon":-122.326988},"vertexType":"TRANSIT","stopCode":null,"stopId":"40:99260"},"headsign":null,"id":null,"interlineWithPreviousLeg":false,"intermediateStops":null,"legGeometry":{"length":67,"points":"wjnaHt~riV@??D?L?B?D?H?J?B?D?F?H?B?F?\\?@@BC@C@?D?D?jA?fC@FBFBD@??BCXAPA\\ZrADNFFHFDDFDH@D?DE@ABG?GCGEMW]GCKAI@IBGDIJEHCLCL?J?~C?T?@?n@BD?LSBE@?nAMCWG"},"mode":"WALK","pickupBookingInfo":null,"pickupType":"SCHEDULED","realTime":false,"realtimeState":null,"rentedBike":false,"rideHailingEstimate":null,"startTime":1769810670000,"steps":[{"absoluteDirection":"WEST","alerts":[],"area":false,"distance":6.91,"elevationProfile":[],"lat":47.5922729,"lon":-122.3269878,"relativeDirection":"DEPART","stayOn":false,"streetName":"SODO Trail"},{"absoluteDirection":"WEST","alerts":[],"area":false,"distance":131.37,"elevationProfile":[],"lat":47.5922724,"lon":-122.32708,"relativeDirection":"CONTINUE","stayOn":false,"streetName":"path"},{"absoluteDirection":"SOUTHWEST","alerts":[],"area":false,"distance":8.14,"elevationProfile":[],"lat":47.5922964,"lon":-122.3288022,"relativeDirection":"LEFT","stayOn":false,"streetName":"4th Avenue South"},{"absoluteDirection":"WEST","alerts":[],"area":false,"distance":29.35,"elevationProfile":[],"lat":47.5922467,"lon":-122.3288776,"relativeDirection":"RIGHT","stayOn":false,"streetName":"sidewalk"},{"absoluteDirection":"SOUTHWEST","alerts":[],"area":true,"distance":261.64,"elevationProfile":[],"lat":47.5922872,"lon":-122.3292643,"relativeDirection":"SLIGHTLY_LEFT","stayOn":true,"streetName":"open area"},{"absoluteDirection":"NORTH","alerts":[],"area":false,"distance":10.64,"elevationProfile":[],"lat":47.5923255,"lon":-122.3311355,"relativeDirection":"RIGHT","stayOn":false,"streetName":"South Royal Brougham Way"},{"absoluteDirection":"WEST","alerts":[],"area":false,"distance":34,"elevationProfile":[],"lat":47.5924202,"lon":-122.3311558,"relativeDirection":"LEFT","stayOn":true,"streetName":"South Royal Brougham Way"},{"absoluteDirection":"NORTH","alerts":[],"area":false,"distance":21.53,"elevationProfile":[],"lat":47.5924575,"lon":-122.3315618,"relativeDirection":"RIGHT","stayOn":false,"streetName":"service road"}],"stopCalls":[],"to":{"lat":47.5927964,"lon":-122.3317254,"name":"Freeway Park, Seattle, WA, USA","rentalVehicle":null,"stop":null,"vertexType":"NORMAL"},"transitLeg":false,"trip":null,"alightRule":"scheduled","boardRule":"scheduled","bookingRuleInfo":{"dropOff":{},"pickUp":{}},"routeColor":"333333","routeTextColor":""}'

const PIONEER_SQUARE_TO_ZONE_WALK_LEG =
  '{"accessibilityScore":null,"agency":null,"alerts":[],"arrivalDelay":0,"departureDelay":0,"distance":745.26,"dropOffBookingInfo":{"latestBookingTime":null},"dropoffType":"SCHEDULED","duration":692,"endTime":1770068732000,"fareProducts":[],"from":{"lat":47.60256,"lon":-122.331216,"name":"Pioneer Square (Sound Transit)","rentalVehicle":null,"stop":null,"vertexType":"NORMAL"},"headsign":null,"id":null,"interlineWithPreviousLeg":false,"intermediateStops":null,"legGeometry":{"length":76,"points":"}jpaHdysiV`A{@HIHGDL@DBC^hABHDLJ@@?B?FBHB@?B??t@?@?F?D?P?`@?BnAgAd@?P?F?F?LA@B@?vB?L??FB?H?@AJA@?@C@?~B?B?DEF?@?B?H?DD@?lC?@@BAJ@N@B??CdC@@MPADAR@B?D?T?B?D?T?B?D?F?F@F??M?E"},"mode":"WALK","pickupBookingInfo":null,"pickupType":"SCHEDULED","realTime":false,"realtimeState":null,"rentedBike":false,"rideHailingEstimate":null,"startTime":1770068040000,"steps":[{"absoluteDirection":"SOUTHEAST","alerts":[],"area":false,"distance":67.67,"elevationProfile":[],"lat":47.6025566,"lon":-122.3312243,"relativeDirection":"DEPART","stayOn":false,"streetName":"3rd Avenue"},{"absoluteDirection":"SOUTHWEST","alerts":[],"area":false,"distance":67.23,"elevationProfile":[],"lat":47.6020628,"lon":-122.330919,"relativeDirection":"RIGHT","stayOn":false,"streetName":"sidewalk"},{"absoluteDirection":"WEST","alerts":[],"area":false,"distance":19.78,"elevationProfile":[],"lat":47.6016432,"lon":-122.3314587,"relativeDirection":"RIGHT","stayOn":false,"streetName":"Yesler Way Cycletrack"},{"absoluteDirection":"WEST","alerts":[],"area":false,"distance":4.19,"elevationProfile":[],"lat":47.6016435,"lon":-122.3317225,"relativeDirection":"CONTINUE","stayOn":false,"streetName":"2nd Avenue Cycletrack"},{"absoluteDirection":"WEST","alerts":[],"area":false,"distance":21.76,"elevationProfile":[],"lat":47.6016407,"lon":-122.3317781,"relativeDirection":"CONTINUE","stayOn":false,"streetName":"path"},{"absoluteDirection":"SOUTHWEST","alerts":[],"area":false,"distance":1.83,"elevationProfile":[],"lat":47.6016489,"lon":-122.3320681,"relativeDirection":"SLIGHTLY_LEFT","stayOn":false,"streetName":"Yesler Way Cycletrack"},{"absoluteDirection":"SOUTHEAST","alerts":[],"area":false,"distance":72.6,"elevationProfile":[],"lat":47.6016401,"lon":-122.3320888,"relativeDirection":"LEFT","stayOn":false,"streetName":"2nd Avenue Extension South"},{"absoluteDirection":"SOUTH","alerts":[],"area":false,"distance":28.66,"elevationProfile":[],"lat":47.6010566,"lon":-122.3317253,"relativeDirection":"CONTINUE","stayOn":false,"streetName":"2nd Avenue South"},{"absoluteDirection":"SOUTH","alerts":[],"area":false,"distance":274.69,"elevationProfile":[],"lat":47.600806,"lon":-122.3317388,"relativeDirection":"LEFT","stayOn":true,"streetName":"2nd Avenue South"},{"absoluteDirection":"SOUTHEAST","alerts":[],"area":false,"distance":2.07,"elevationProfile":[],"lat":47.5983823,"lon":-122.3317495,"relativeDirection":"SLIGHTLY_LEFT","stayOn":false,"streetName":"South King Street"},{"absoluteDirection":"SOUTH","alerts":[],"area":false,"distance":15.82,"elevationProfile":[],"lat":47.5983677,"lon":-122.3317323,"relativeDirection":"RIGHT","stayOn":false,"streetName":"path"},{"absoluteDirection":"SOUTH","alerts":[],"area":false,"distance":78.21,"elevationProfile":[],"lat":47.5982265,"lon":-122.3317585,"relativeDirection":"CONTINUE","stayOn":false,"streetName":"Stadium Place South"},{"absoluteDirection":"EAST","alerts":[],"area":false,"distance":5.09,"elevationProfile":[],"lat":47.5975354,"lon":-122.3317431,"relativeDirection":"LEFT","stayOn":true,"streetName":"Stadium Place South"},{"absoluteDirection":"SOUTH","alerts":[],"area":false,"distance":78.53,"elevationProfile":[],"lat":47.5975208,"lon":-122.3316787,"relativeDirection":"RIGHT","stayOn":false,"streetName":"path"},{"absoluteDirection":"EAST","alerts":[],"area":false,"distance":7.17,"elevationProfile":[],"lat":47.5968155,"lon":-122.331671,"relativeDirection":"LEFT","stayOn":true,"streetName":"parking aisle"}],"stopCalls":[],"to":{"lat":47.5968293,"lon":-122.3315754,"name":"Muckleshoot Heritage Plaza, Seattle, WA, USA","rentalVehicle":null,"stop":null,"vertexType":"NORMAL"},"transitLeg":false,"trip":null,"alightRule":"scheduled","boardRule":"scheduled","bookingRuleInfo":{"dropOff":{},"pickUp":{}},"routeColor":"333333","routeTextColor":""}'
// '{"accessibilityScore":null,"agency":null,"alerts":[],"arrivalDelay":0,"departureDelay":0,"distance":745.26,"dropOffBookingInfo":{"latestBookingTime":null},"dropoffType":"SCHEDULED","duration":692,"endTime":1770068732000,"fareProducts":[],"from":{"lat":47.60256,"lon":-122.331216,"name":"Pioneer Square (Sound Transit)","rentalVehicle":null,"stop":null,"vertexType":"NORMAL"},"headsign":null,"id":null,"interlineWithPreviousLeg":false,"intermediateStops":null,"legGeometry":{"length":76,"points":"}jpaHdysiV`A{@HIHGDL@DBC^hABHDLJ@@?B?FBHB@?B??t@?@?F?D?P?`@?BnAgAd@?P?F?F?LA@B@?vB?L??FB?H?@AJA@?@C@?~B?B?DEF?@?B?H?DD@?lC?@@BAJ@N@B??CdC@@MPADAR@B?D?T?B?D?T?B?D?F?F@F??M?E"},"mode":"WALK","pickupBookingInfo":null,"pickupType":"SCHEDULED","realTime":false,"realtimeState":null,"rentedBike":false,"rideHailingEstimate":null,"startTime":1770068040000,"steps":[{"absoluteDirection":"SOUTHEAST","alerts":[],"area":false,"distance":67.67,"elevationProfile":[],"lat":47.6025566,"lon":-122.3312243,"relativeDirection":"DEPART","stayOn":false,"streetName":"3rd Avenue"},{"absoluteDirection":"SOUTHWEST","alerts":[],"area":false,"distance":67.23,"elevationProfile":[],"lat":47.6020628,"lon":-122.330919,"relativeDirection":"RIGHT","stayOn":false,"streetName":"sidewalk"},{"absoluteDirection":"WEST","alerts":[],"area":false,"distance":19.78,"elevationProfile":[],"lat":47.6016432,"lon":-122.3314587,"relativeDirection":"RIGHT","stayOn":false,"streetName":"Yesler Way Cycletrack"},{"absoluteDirection":"WEST","alerts":[],"area":false,"distance":4.19,"elevationProfile":[],"lat":47.6016435,"lon":-122.3317225,"relativeDirection":"CONTINUE","stayOn":false,"streetName":"2nd Avenue Cycletrack"},{"absoluteDirection":"WEST","alerts":[],"area":false,"distance":21.76,"elevationProfile":[],"lat":47.6016407,"lon":-122.3317781,"relativeDirection":"CONTINUE","stayOn":false,"streetName":"path"},{"absoluteDirection":"SOUTHWEST","alerts":[],"area":false,"distance":1.83,"elevationProfile":[],"lat":47.6016489,"lon":-122.3320681,"relativeDirection":"SLIGHTLY_LEFT","stayOn":false,"streetName":"Yesler Way Cycletrack"},{"absoluteDirection":"SOUTHEAST","alerts":[],"area":false,"distance":72.6,"elevationProfile":[],"lat":47.6016401,"lon":-122.3320888,"relativeDirection":"LEFT","stayOn":false,"streetName":"2nd Avenue Extension South"},{"absoluteDirection":"SOUTH","alerts":[],"area":false,"distance":28.66,"elevationProfile":[],"lat":47.6010566,"lon":-122.3317253,"relativeDirection":"CONTINUE","stayOn":false,"streetName":"2nd Avenue South"},{"absoluteDirection":"SOUTH","alerts":[],"area":false,"distance":274.69,"elevationProfile":[],"lat":47.600806,"lon":-122.3317388,"relativeDirection":"LEFT","stayOn":true,"streetName":"2nd Avenue South"},{"absoluteDirection":"SOUTHEAST","alerts":[],"area":false,"distance":2.07,"elevationProfile":[],"lat":47.5983823,"lon":-122.3317495,"relativeDirection":"SLIGHTLY_LEFT","stayOn":false,"streetName":"South King Street"},{"absoluteDirection":"SOUTH","alerts":[],"area":false,"distance":15.82,"elevationProfile":[],"lat":47.5983677,"lon":-122.3317323,"relativeDirection":"RIGHT","stayOn":false,"streetName":"path"},{"absoluteDirection":"SOUTH","alerts":[],"area":false,"distance":78.21,"elevationProfile":[],"lat":47.5982265,"lon":-122.3317585,"relativeDirection":"CONTINUE","stayOn":false,"streetName":"Stadium Place South"},{"absoluteDirection":"EAST","alerts":[],"area":false,"distance":5.09,"elevationProfile":[],"lat":47.5975354,"lon":-122.3317431,"relativeDirection":"LEFT","stayOn":true,"streetName":"Stadium Place South"},{"absoluteDirection":"SOUTH","alerts":[],"area":false,"distance":78.53,"elevationProfile":[],"lat":47.5975208,"lon":-122.3316787,"relativeDirection":"RIGHT","stayOn":false,"streetName":"path"},{"absoluteDirection":"EAST","alerts":[],"area":false,"distance":7.17,"elevationProfile":[],"lat":47.5968155,"lon":-122.331671,"relativeDirection":"LEFT","stayOn":true,"streetName":"parking aisle"}],"stopCalls":[],"to":{"lat":47.5968293,"lon":-122.3315754,"name":"Muckleshoot Heritage Plaza, Seattle, WA, USA","rentalVehicle":null,"stop":null,"vertexType":"NORMAL"},"transitLeg":false,"trip":null,"alightRule":"scheduled","boardRule":"scheduled","bookingRuleInfo":{"dropOff":{},"pickUp":{}},"routeColor":"333333","routeTextColor":""}'

const ZONE_TO_PIONEER_SQUARE_WALK_LEG =
  '{"accessibilityScore":null,"agency":null,"alerts":[],"arrivalDelay":0,"departureDelay":0,"distance":785.48,"dropOffBookingInfo":{"latestBookingTime":null},"dropoffType":"SCHEDULED","duration":742,"endTime":1770148762000,"fareProducts":[],"from":{"lat":47.596411,"lon":-122.33143,"name":"Muckleshoot Heritage Plaza, Pioneer Square, Seattle, WA","rentalVehicle":null,"stop":null,"vertexType":"NORMAL"},"headsign":null,"id":null,"interlineWithPreviousLeg":false,"intermediateStops":null,"legGeometry":{"length":81,"points":"qdoaHlzsiVq@\\\\C?AAIIAAK?G?Q?C?E?S?E?C?U?E?E?Q?E?K@EMgC@?@C?OE?J?RE?M?iCCS?C?A?O@K?aA?c@@Q?G?G?A?M?EAkB@KBA?I?MAIGGEKG?AEGGKWTOPGDYXa@\\\\?Q?E?G?A?u@C?A?ICGCC?A?KAEMCICI[_ACBAEEMIFIHaAz@"},"mode":"WALK","pickupBookingInfo":null,"pickupType":"SCHEDULED","realTime":false,"realtimeState":null,"rentedBike":false,"rideHailingEstimate":null,"startTime":1770148020000,"steps":[{"absoluteDirection":"NORTH","alerts":[],"area":true,"distance":29.94,"elevationProfile":[],"lat":47.596411,"lon":-122.33143,"relativeDirection":"DEPART","stayOn":false,"streetName":"Muckleshoot Heritage Plaza"},{"absoluteDirection":"NORTH","alerts":[],"area":false,"distance":93.93,"elevationProfile":[],"lat":47.5966617,"lon":-122.3315757,"relativeDirection":"SLIGHTLY_RIGHT","stayOn":false,"streetName":"path"},{"absoluteDirection":"NORTHEAST","alerts":[],"area":false,"distance":5.87,"elevationProfile":[],"lat":47.5974935,"lon":-122.3315114,"relativeDirection":"RIGHT","stayOn":false,"streetName":"Stadium Place South"},{"absoluteDirection":"NORTH","alerts":[],"area":false,"distance":78.73,"elevationProfile":[],"lat":47.5975255,"lon":-122.3314491,"relativeDirection":"LEFT","stayOn":true,"streetName":"Stadium Place South"},{"absoluteDirection":"NORTH","alerts":[],"area":false,"distance":8.68,"elevationProfile":[],"lat":47.5982271,"lon":-122.3314627,"relativeDirection":"CONTINUE","stayOn":false,"streetName":"path"},{"absoluteDirection":"WEST","alerts":[],"area":false,"distance":12.25,"elevationProfile":[],"lat":47.5983022,"lon":-122.331431,"relativeDirection":"LEFT","stayOn":false,"streetName":"South King Street"},{"absoluteDirection":"NORTH","alerts":[],"area":false,"distance":316.98,"elevationProfile":[],"lat":47.5983027,"lon":-122.3315944,"relativeDirection":"RIGHT","stayOn":false,"streetName":"2nd Avenue South"},{"absoluteDirection":"NORTHWEST","alerts":[],"area":false,"distance":71.3,"elevationProfile":[],"lat":47.6011028,"lon":-122.331387,"relativeDirection":"LEFT","stayOn":false,"streetName":"2nd Avenue Extension South"},{"absoluteDirection":"EAST","alerts":[],"area":false,"distance":8.93,"elevationProfile":[],"lat":47.6016441,"lon":-122.3318971,"relativeDirection":"HARD_RIGHT","stayOn":false,"streetName":"path"},{"absoluteDirection":"EAST","alerts":[],"area":false,"distance":4.19,"elevationProfile":[],"lat":47.6016407,"lon":-122.3317781,"relativeDirection":"CONTINUE","stayOn":false,"streetName":"2nd Avenue Cycletrack"},{"absoluteDirection":"EAST","alerts":[],"area":false,"distance":19.78,"elevationProfile":[],"lat":47.6016435,"lon":-122.3317225,"relativeDirection":"CONTINUE","stayOn":false,"streetName":"Yesler Way Cycletrack"},{"absoluteDirection":"NORTH","alerts":[],"area":false,"distance":78.71,"elevationProfile":[],"lat":47.6016432,"lon":-122.3314587,"relativeDirection":"LEFT","stayOn":false,"streetName":"sidewalk"},{"absoluteDirection":"NORTHWEST","alerts":[],"area":false,"distance":56.19,"elevationProfile":[],"lat":47.6021255,"lon":-122.3308333,"relativeDirection":"LEFT","stayOn":false,"streetName":"3rd Avenue"}],"stopCalls":[],"to":{"lat":47.60256,"lon":-122.331216,"name":"Pioneer Square (Sound Transit)","rentalVehicle":null,"stop":null,"vertexType":"NORMAL"},"transitLeg":false,"trip":null,"alightRule":"scheduled","boardRule":"scheduled","bookingRuleInfo":{"dropOff":{},"pickUp":{}},"routeColor":"333333","routeTextColor":""}'
// {"accessibilityScore":null,"agency":null,"alerts":[],"arrivalDelay":0,"departureDelay":0,"distance":785.48,"dropOffBookingInfo":{"latestBookingTime":null},"dropoffType":"SCHEDULED","duration":742,"endTime":1770148762000,"fareProducts":[],"from":{"lat":47.596411,"lon":-122.33143,"name":"Muckleshoot Heritage Plaza, Pioneer Square, Seattle, WA","rentalVehicle":null,"stop":null,"vertexType":"NORMAL"},"headsign":null,"id":null,"interlineWithPreviousLeg":false,"intermediateStops":null,"legGeometry":{"length":81,"points":"qdoaHlzsiVq@\\C?AAIIAAK?G?Q?C?E?S?E?C?U?E?E?Q?E?K@EMgC@?@C?OE?J?RE?M?iCCS?C?A?O@K?aA?c@@Q?G?G?A?M?EAkB@KBA?I?MAIGGEKG?AEGGKWTOPGDYXa@\\?Q?E?G?A?u@C?A?ICGCC?A?KAEMCICI[_ACBAEEMIFIHaAz@"},"mode":"WALK","pickupBookingInfo":null,"pickupType":"SCHEDULED","realTime":false,"realtimeState":null,"rentedBike":false,"rideHailingEstimate":null,"startTime":1770148020000,"steps":[{"absoluteDirection":"NORTH","alerts":[],"area":true,"distance":29.94,"elevationProfile":[],"lat":47.596411,"lon":-122.33143,"relativeDirection":"DEPART","stayOn":false,"streetName":"Muckleshoot Heritage Plaza"},{"absoluteDirection":"NORTH","alerts":[],"area":false,"distance":93.93,"elevationProfile":[],"lat":47.5966617,"lon":-122.3315757,"relativeDirection":"SLIGHTLY_RIGHT","stayOn":false,"streetName":"path"},{"absoluteDirection":"NORTHEAST","alerts":[],"area":false,"distance":5.87,"elevationProfile":[],"lat":47.5974935,"lon":-122.3315114,"relativeDirection":"RIGHT","stayOn":false,"streetName":"Stadium Place South"},{"absoluteDirection":"NORTH","alerts":[],"area":false,"distance":78.73,"elevationProfile":[],"lat":47.5975255,"lon":-122.3314491,"relativeDirection":"LEFT","stayOn":true,"streetName":"Stadium Place South"},{"absoluteDirection":"NORTH","alerts":[],"area":false,"distance":8.68,"elevationProfile":[],"lat":47.5982271,"lon":-122.3314627,"relativeDirection":"CONTINUE","stayOn":false,"streetName":"path"},{"absoluteDirection":"WEST","alerts":[],"area":false,"distance":12.25,"elevationProfile":[],"lat":47.5983022,"lon":-122.331431,"relativeDirection":"LEFT","stayOn":false,"streetName":"South King Street"},{"absoluteDirection":"NORTH","alerts":[],"area":false,"distance":316.98,"elevationProfile":[],"lat":47.5983027,"lon":-122.3315944,"relativeDirection":"RIGHT","stayOn":false,"streetName":"2nd Avenue South"},{"absoluteDirection":"NORTHWEST","alerts":[],"area":false,"distance":71.3,"elevationProfile":[],"lat":47.6011028,"lon":-122.331387,"relativeDirection":"LEFT","stayOn":false,"streetName":"2nd Avenue Extension South"},{"absoluteDirection":"EAST","alerts":[],"area":false,"distance":8.93,"elevationProfile":[],"lat":47.6016441,"lon":-122.3318971,"relativeDirection":"HARD_RIGHT","stayOn":false,"streetName":"path"},{"absoluteDirection":"EAST","alerts":[],"area":false,"distance":4.19,"elevationProfile":[],"lat":47.6016407,"lon":-122.3317781,"relativeDirection":"CONTINUE","stayOn":false,"streetName":"2nd Avenue Cycletrack"},{"absoluteDirection":"EAST","alerts":[],"area":false,"distance":19.78,"elevationProfile":[],"lat":47.6016435,"lon":-122.3317225,"relativeDirection":"CONTINUE","stayOn":false,"streetName":"Yesler Way Cycletrack"},{"absoluteDirection":"NORTH","alerts":[],"area":false,"distance":78.71,"elevationProfile":[],"lat":47.6016432,"lon":-122.3314587,"relativeDirection":"LEFT","stayOn":false,"streetName":"sidewalk"},{"absoluteDirection":"NORTHWEST","alerts":[],"area":false,"distance":56.19,"elevationProfile":[],"lat":47.6021255,"lon":-122.3308333,"relativeDirection":"LEFT","stayOn":false,"streetName":"3rd Avenue"}],"stopCalls":[],"to":{"lat":47.60256,"lon":-122.331216,"name":"Pioneer Square (Sound Transit)","rentalVehicle":null,"stop":null,"vertexType":"NORMAL"},"transitLeg":false,"trip":null,"alightRule":"scheduled","boardRule":"scheduled","bookingRuleInfo":{"dropOff":{},"pickUp":{}},"routeColor":"333333","routeTextColor":""}

const soundTransitCustomRoutingZones: CustomRoutingZone[] = [
  {
    // Seattle Stadium zone
    bbox: [47.592266, 47.597533, -122.334768, -122.327691],
    destinationRoutingRules: [
      {
        // NORTHBOUND 1 Line trips TO Seattle Stadium
        accessibleStopToUse: 'CID_stop_id',
        customWalkLegGeometry: STADIUM_TO_ZONE_WALK_LEG,
        headsign: 'Lynnwood City Center',
        route: '1 Line',
        stopAdjustments: [
          {
            adjustment: {
              duration: -120,
              endTime: -120000,
              intermediateStops: -1,
              itineraryDuration: -237,
              itineraryEndTime: -237000,
              legGeometry: {
                length: -24,
                pointsToAdd: '',
                pointsToCut:
                  'uA?g@Be@H[JcBj@o@PsGfBc@H_@D]@]?YC{@Gc@A]?}ADQ?IAKCk@UKAOA_C?'
              },
              stopCalls: -1,
              toOrFrom: {
                lat: 47.592285,
                lon: -122.326988,
                name: 'Stadium',
                stop: {
                  gtfsId: '40:99260',
                  id: 'U3RvcDo0MDo5OTI2MA',
                  lat: 47.592285,
                  lon: -122.326988,
                  name: 'Stadium'
                },
                stopId: '40:99260'
              }
            },
            originalStop: "Int'l Dist/Chinatown"
          }
        ]
      },
      {
        // SOUTHBOUND 1 Line trips TO Seattle Stadium
        accessibleStopToUse: 'CID_stop_id',
        customWalkLegGeometry: PIONEER_SQUARE_TO_ZONE_WALK_LEG,
        headsign: 'Federal Way Downtown',
        route: '1 Line',
        stopAdjustments: [
          {
            adjustment: {
              duration: -120,
              endTime: -120000,
              intermediateStops: -1,
              itineraryDuration: 123, // FIX (how does walk leg  change affect this?)
              itineraryEndTime: 123, // FIX
              legGeometry: {
                length: -19,
                pointsToAdd: '',
                pointsToCut: '??p@m@X[Xc@hEyHR]NQLQLO\\W^SPIPE`@If@AjI?N@J@HB'
              },
              stopCalls: -1,
              toOrFrom: {
                lat: 47.602139,
                lon: -122.331055,
                name: 'Pioneer Square',
                stop: {
                  gtfsId: '40:501',
                  id: 'U3RvcDo0MDo1MDE',
                  lat: 47.602139,
                  lon: -122.331055,
                  name: 'Pioneer Square'
                },
                stopId: '40:501'
              }
            },
            originalStop: "Int'l Dist/Chinatown"
          }
        ]
      },
      {
        // WESTBOUND 2 Line trips TO Seattle Stadium
        accessibleStopToUse: 'CID_stop_id',
        customWalkLegGeometry: '',
        headsign: 'Lynnwood City Center',
        route: '2 Line',
        stopAdjustments: []
      }
    ],
    name: 'Seattle Stadium FIFA Zone',
    originRoutingRules: [
      {
        // NORTHBOUND 1 Line trips FROM Seattle Stadium
        accessibleStopToUse: 'CID_stop_id',
        customWalkLegGeometry: ZONE_TO_PIONEER_SQUARE_WALK_LEG,
        headsign: 'Lynnwood City Center',
        route: '1 Line',
        stopAdjustments: [
          {
            adjustment: {
              // distance: -624.83
              duration: -120,
              endTime: -120000,
              intermediateStops: 1, // note how we use positive here and negative in destination rules
              itineraryDuration: 123, // FIX
              itineraryEndTime: 123, // FIX
              legGeometry: {
                length: -16,
                pointsToAdd: 'unpaHb|siVw@j@',
                pointsToCut:
                  'eqoaHtdsiV_FAi@B_@FQFQF_@R]X[\\OTQZsEhI]f@YZoE|DIH??w@j@'
              },
              stopCalls: 1,
              toOrFrom: {
                lat: 47.603199,
                lon: -122.331581,
                name: 'Pioneer Square',
                stop: {
                  gtfsId: '40:532',
                  id: 'U3RvcDo0MDo1MzI',
                  lat: 47.603199,
                  lon: -122.331581,
                  name: 'Pioneer Square'
                },
                stopId: '40:532'
              }
            },
            originalStop: "Int'l Dist/Chinatown"
          }
        ]
      },
      {
        // SOUTHBOUND 1 Line trips FROM Seattle Stadium
        accessibleStopToUse: 'CID_stop_id',
        customWalkLegGeometry: '',
        headsign: 'Federal Way Downtown',
        route: '1 Line',
        stopAdjustments: []
      },
      {
        // EASTBOUND 2 Line trips FROM Seattle Stadium
        accessibleStopToUse: 'CID_stop_id',
        customWalkLegGeometry: '',
        headsign: 'Downtown Redmond',
        route: '2 Line',
        stopAdjustments: []
      }
    ]
  }
]

export interface ItineraryStartTime {
  itinerary: ItineraryWithIndex
  legs: Leg[]
  realtime: boolean
}

interface OtpResponse {
  plan: {
    itineraries: Itinerary[]
  }
}

export interface ItineraryWithIndex extends Itinerary {
  index: number
}

export interface ItineraryWithCO2Info extends Itinerary {
  co2: number
  co2VsBaseline: number
}

export interface ItineraryWithSortingCosts extends Itinerary {
  rank: number
  totalFare: number
  transitFare?: number
}

export interface ItineraryFareSummary {
  fareCurrency?: string
  maxTNCFare: number
  minTNCFare: number
  transitFare?: number
}

/**
 * Determines whether the specified Itinerary can be monitored.
 * @returns true if an itinerary has no rental or ride hail leg (e.g. CAR_RENT, CAR_HAIL, BICYCLE_RENT, etc.).
 *   (We use the corresponding fields returned by OTP to get transit legs and rental/ride hail legs.)
 */
export function itineraryCanBeMonitored(itinerary?: Itinerary): boolean {
  return (
    !!itinerary?.legs &&
    !itinerary.legs.some(
      (leg: Leg) => leg.rentedBike || !!leg.rideHailingEstimate
    )
  )
}

export function getMinutesUntilItineraryStart(itinerary: Itinerary): number {
  return differenceInMinutes(new Date(itinerary.startTime), new Date())
}

/**
 * Gets the first transit leg of the given itinerary, or null if none found.
 */
function getFirstTransitLeg(itinerary: Itinerary) {
  return itinerary?.legs?.find((leg) => leg.transitLeg)
}

function getLastTransitLeg(itinerary: Itinerary) {
  const legs = itinerary?.legs
  for (let i = legs.length - 1; i >= 0; i--) {
    if (legs[i].transitLeg) return legs[i]
  }
  return null
}

/**
 * Get the first stop ID from the itinerary in the underscore format required by
 * the startTransitStopId query param (e.g., TRIMET_12345 instead of TRIMET:12345).
 */
export function getFirstStopId(itinerary: Itinerary): string | undefined {
  return getFirstTransitLeg(itinerary)?.from.stopId?.replace(':', '_')
}

/**
 * Returns the set of monitored days that will be initially shown to the user
 * for the given itinerary.
 * @param itinerary The itinerary from which the default monitored days are extracted.
 * @returns ['monday' thru 'friday'] if itinerary happens on a weekday,
 *          ['saturday', 'sunday'] if itinerary happens on a saturday/sunday,
 *          based on the itinerary startTime.
 */
export function getItineraryDefaultMonitoredDays(
  itinerary: Itinerary,
  timeZone = coreUtils.time.getUserTimezone()
): string[] {
  const startDate = utcToZonedTime(new Date(itinerary.startTime), timeZone)
  const dayOfWeek = startDate.getDay()
  return dayOfWeek === 0 || dayOfWeek === 6 ? WEEKEND_DAYS : WEEKDAYS
}

function legLocationsAreEqual(legLocation: Place, other: Place) {
  return (
    !!legLocation &&
    !!other &&
    legLocation.lat === other.lat &&
    legLocation.lon === other.lon
  )
}

export function itinerariesAreEqual(
  itinerary: Itinerary,
  other: Itinerary,
  defaultFareType: FareProductSelector
): boolean {
  return (
    getFare(itinerary, defaultFareType).transitFare ===
      getFare(other, defaultFareType).transitFare &&
    itinerary.legs.length === other.legs.length &&
    itinerary.legs.every((leg, index) => {
      const otherLeg = other?.legs?.[index]
      return (
        otherLeg.mode === leg.mode &&
        legLocationsAreEqual(otherLeg?.to, leg?.to) &&
        legLocationsAreEqual(otherLeg?.from, leg?.from)
      )
    })
  )
}

export function getFirstLegStartTime(legs: Leg[]): number {
  return +legs[0].startTime
}

export function getLastLegEndTime(legs: Leg[]): number {
  return +legs[legs.length - 1].endTime
}

export function sortStartTimes(
  startTimes: ItineraryStartTime[]
): ItineraryStartTime[] {
  return startTimes?.sort(
    (a, b) => getFirstLegStartTime(a.legs) - getFirstLegStartTime(b.legs)
  )
}

// Ignore certain keys that could add significant calculation time to hashing.
// The alerts are irrelevant, but the intermediateStops, legGeometry and
// steps could have the legGeometry substitute as an equivalent hash value
const blackListedKeys = ['alerts', 'intermediateStops', 'legGeometry', 'steps']

// make blackListedKeys into an object due to superior lookup performance
const blackListedKeyLookup: Record<string, boolean> = {}
blackListedKeys.forEach((key) => {
  blackListedKeyLookup[key] = true
})

/**
 * A memoized function to hash the itinerary.
 * NOTE: It can take a while (>30ms) for the object-hash library to calculate
 * an itinerary's hash for some lengthy itineraries. If better performance is
 * desired, additional values to blackListedKeys should be added to avoid
 * spending extra time hashing values that wouldn't result in different
 * itineraries.
 */
const hashItinerary = memoize((itinerary) =>
  hash(itinerary, { excludeKeys: (key) => blackListedKeyLookup[key] })
)

/**
 * Returns a list of itineraries from the redux-stored responses, without duplicates.
 */
export function collectItinerariesWithoutDuplicates(
  response: OtpResponse[]
): ItineraryWithIndex[] {
  const itineraries: ItineraryWithIndex[] = []
  // keep track of itinerary hashes in order to not include duplicate
  // itineraries. Duplicate itineraries can occur in batch routing where a walk
  // to transit trip can sometimes still be the most optimal trip even when
  // additional modes such as bike rental were also requested
  const seenItineraryHashes: Record<string, boolean> = {}
  response?.forEach((res) => {
    res?.plan?.itineraries?.forEach((itinerary) => {
      // hashing takes a while on itineraries
      const itineraryHash = hashItinerary(itinerary)
      if (!seenItineraryHashes[itineraryHash]) {
        itineraries.push({ ...itinerary, index: itineraries.length })
        seenItineraryHashes[itineraryHash] = true
      }
    })
  })

  console.log(itineraries)

  const isInBBox = (lat: number, lon: number, bbox: number[]) => {
    const [minLat, maxLat, minLon, maxLon] = bbox
    return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon
  }

  // only works for single-zone configs

  itineraries.forEach((itin) => {
    const origin = { lat: itin.legs[0].from.lat, lon: itin.legs[0].from.lon }
    const destination = {
      lat: itin.legs[itin.legs.length - 1].to.lat,
      lon: itin.legs[itin.legs.length - 1].to.lon
    }

    let firstTransitLeg = getFirstTransitLeg(itin)
    let lastTransitLeg = getLastTransitLeg(itin)

    soundTransitCustomRoutingZones.forEach((zone) => {
      let originRule
      let destinationRule
      if (isInBBox(origin.lat, origin.lon, zone.bbox)) {
        originRule = zone.originRoutingRules.find(
          (rule) =>
            rule.headsign === firstTransitLeg?.headsign &&
            rule.route === firstTransitLeg?.routeShortName
        )
      }

      if (isInBBox(destination.lat, destination.lon, zone.bbox)) {
        destinationRule = zone.destinationRoutingRules.find(
          (rule) =>
            rule.headsign === lastTransitLeg?.headsign &&
            rule.route === lastTransitLeg?.routeShortName
        )
      }

      if (originRule) {
        // apply rule stop adjustments (if applicable) to the first transit leg, first stop
        const adjustment = originRule.stopAdjustments.find(
          (adj) => adj.originalStop === firstTransitLeg?.from?.name
        )?.adjustment
        console.log('origin adjustment', adjustment)
        if (firstTransitLeg && adjustment) {
          firstTransitLeg = {
            ...firstTransitLeg,
            duration: firstTransitLeg.duration + adjustment.itineraryDuration,
            endTime: firstTransitLeg.endTime + adjustment.itineraryEndTime,
            from: {
              ...firstTransitLeg.from,
              lat: adjustment.toOrFrom.lat,
              lon: adjustment.toOrFrom.lon,
              name: adjustment.toOrFrom.name,
              stop: {
                ...firstTransitLeg.from.stop,
                gtfsId: adjustment.toOrFrom.stop.gtfsId,
                id: adjustment.toOrFrom.stop.id,
                lat: adjustment.toOrFrom.stop.lat,
                lon: adjustment.toOrFrom.stop.lon,
                name: adjustment.toOrFrom.stop.name
              },
              stopId: adjustment.toOrFrom.stopId
            },
            intermediateStops: firstTransitLeg.intermediateStops.slice(
              adjustment.intermediateStops
            ),
            legGeometry: {
              ...firstTransitLeg.legGeometry,
              length:
                firstTransitLeg.legGeometry.length +
                adjustment.legGeometry.length,
              points: firstTransitLeg.legGeometry.points.replace(
                adjustment.legGeometry.pointsToCut,
                adjustment.legGeometry.pointsToAdd
              )
            },
            stopCalls: firstTransitLeg.stopCalls?.slice(adjustment.stopCalls)
          }

          for (let i = 0; i <= itin.legs.length; i++) {
            const leg = itin.legs[i]
            if (leg.transitLeg) {
              itin.legs[i] = firstTransitLeg
              break
            }
          }

          for (let i = 0; i < itin.legs.length; i++) {
            const leg = itin.legs[i]
            if (leg.mode === 'WALK') {
              const obj = JSON.parse(originRule.customWalkLegGeometry)
              itin.legs[i] = {
                ...obj,
                from: {
                  ...obj.from,
                  name: zone.name
                }
              }
              break
            }
          }
        }
      }

      if (destinationRule) {
        // apply rule stop adjustments (if applicable) to the last transit leg, last stop
        const adjustment = destinationRule.stopAdjustments.find(
          (adj) => adj.originalStop === lastTransitLeg?.to?.name
        )?.adjustment
        console.log('destination adjustment', adjustment)
        if (lastTransitLeg && adjustment) {
          lastTransitLeg = {
            ...lastTransitLeg,
            duration: lastTransitLeg.duration + adjustment.itineraryDuration,
            endTime: lastTransitLeg.endTime + adjustment.itineraryEndTime,
            intermediateStops: lastTransitLeg.intermediateStops.slice(
              0,
              adjustment.intermediateStops
            ),
            legGeometry: {
              ...lastTransitLeg.legGeometry,
              length:
                lastTransitLeg.legGeometry.length +
                adjustment.legGeometry.length,
              // points: adjustment.legGeometry.points
              points: lastTransitLeg.legGeometry.points.replace(
                adjustment.legGeometry.pointsToCut,
                adjustment.legGeometry.pointsToAdd
              )
            },
            stopCalls: lastTransitLeg.stopCalls?.slice(0, adjustment.stopCalls),
            to: {
              ...lastTransitLeg.to,
              lat: adjustment.toOrFrom.lat,
              lon: adjustment.toOrFrom.lon,
              name: adjustment.toOrFrom.name,
              stop: {
                ...lastTransitLeg.to.stop,
                gtfsId: adjustment.toOrFrom.stop.gtfsId,
                id: adjustment.toOrFrom.stop.id,
                lat: adjustment.toOrFrom.stop.lat,
                lon: adjustment.toOrFrom.stop.lon,
                name: adjustment.toOrFrom.stop.name // oddly, this doesn't show up in the OTP response but is required in this type
              },
              stopId: adjustment.toOrFrom.stopId
            }
          }

          for (let i = itin.legs.length - 1; i >= 0; i--) {
            const leg = itin.legs[i]
            if (leg.transitLeg) {
              itin.legs[i] = lastTransitLeg
              break
            }
          }

          for (let i = itin.legs.length - 1; i >= 0; i--) {
            const leg = itin.legs[i]
            if (leg.mode === 'WALK') {
              const obj = JSON.parse(destinationRule.customWalkLegGeometry)
              itin.legs[i] = {
                ...obj,
                to: {
                  ...obj.to,
                  name: zone.name
                }
              }
              break
            }
          }
        }
      }
    })
  })

  console.log(JSON.stringify(itineraries?.[0]?.legs?.[1]))
  console.log(itineraries?.[0]?.legs?.[1]?.legGeometry?.points)

  return itineraries
}

/**
 * Whether an itinerary is car-only.
 */
function isCarOnly(itin: Pick<Itinerary, 'legs'>) {
  return itin.legs.length === 1 && itin.legs[0].mode.startsWith('CAR')
}

/**
 * Returns a car itinerary if there is one, otherwise returns false.
 */
function getCarItinerary(itineraries: Pick<Itinerary, 'legs'>[]) {
  return (
    !!itineraries.filter(isCarOnly).length && itineraries.filter(isCarOnly)[0]
  )
}

/**
 * Compute the carbon emitted while driving (the baseline for comparison).
 */
function computeCarbonBaseline(itineraries: Itinerary[], co2Config: CO2Config) {
  // Sums the sum of the leg distances for each leg
  const avgDistance =
    itineraries.reduce(
      (sum, itin) =>
        sum + itin.legs.reduce((legsum, leg) => legsum + leg.distance, 0),
      0
    ) / itineraries.length

  // If we do not have a drive yourself itinerary, estimate the distance based on avg of transit distances.
  return coreUtils.itinerary.calculateEmissions(
    getCarItinerary(itineraries) || {
      legs: [{ distance: avgDistance, mode: 'CAR' }] as Leg[]
    },
    co2Config?.carbonIntensity,
    co2Config?.massUnit
  )
}

/**
 * Add carbon info to an itinerary.
 */
function addCarbonInfo<T extends Itinerary>(
  itin: T,
  co2Config: CO2Config,
  baselineCo2: number
) {
  const emissions = coreUtils.itinerary.calculateEmissions(
    itin,
    co2Config?.carbonIntensity,
    co2Config?.massUnit
  )
  return {
    ...itin,
    co2: emissions,
    co2VsBaseline: (emissions - baselineCo2) / baselineCo2
  }
}

/**
 * Add carbon info to the given set of itineraries.
 */
export function addCarbonInfoToAll<T extends Itinerary>(
  itineraries: T[],
  co2Config: CO2Config
): ItineraryWithCO2Info[] {
  const baselineCo2 = computeCarbonBaseline(itineraries, co2Config)
  return (
    itineraries?.map((itin) => addCarbonInfo(itin, co2Config, baselineCo2)) ||
    []
  )
}

/**
 * Get total drive time (i.e., total duration for legs with mode=CAR) for an
 * itinerary.
 */
function getDriveTime(itinerary: Itinerary): number {
  if (!itinerary) return 0
  let driveTime = 0
  itinerary.legs.forEach((leg) => {
    if (leg.mode === 'CAR') driveTime += leg.duration
  })
  return driveTime
}

/**
 * Parses OTP itinerary fare object and returns fares along with overridden currency
 */
export function getFare(
  itinerary: Itinerary,
  defaultFareType?: FareProductSelector
): ItineraryFareSummary {
  const { maxTNCFare, minTNCFare } =
    coreUtils.itinerary.calculateTncFares(itinerary)

  const itineraryCost = coreUtils.itinerary.getItineraryCost(
    itinerary?.legs,
    defaultFareType?.mediumId || null,
    defaultFareType?.riderCategoryId || null
  )

  return {
    fareCurrency: itineraryCost?.currency.code,
    maxTNCFare,
    minTNCFare,
    transitFare: itineraryCost?.amount
  }
}

/**
 * Default costs for modes that currently have no costs evaluated in
 * OpenTripPlanner.
 */
const DEFAULT_COSTS = {
  // $2 per trip? This is a made up number.
  bikeshareTripCostCents: 2 * 100,
  // $2 for 3 hours of parking?
  carParkingCostCents: 3 * 2.0 * 100,
  // FL per diem rate: https://www.flcourts.org/content/download/219314/1981830/TravelInformation.pdf
  drivingCentsPerMile: 0.445 * 100
}

/**
 * Returns total fare for itinerary (in cents)
 * FIXME: Move to otp-ui?
 * TODO: Add GBFS fares
 */
export function getTotalFare(
  itinerary: Itinerary,
  configCosts = {},
  defaultFareType: FareProductSelector = {
    mediumId: undefined,
    riderCategoryId: undefined
  }
): number | null {
  // Get TNC fares.
  const { maxTNCFare, transitFare } = getFare(itinerary, defaultFareType)
  // Start with default cost values.
  const costs = DEFAULT_COSTS
  // If config contains values to override defaults, apply those.
  if (configCosts) Object.assign(costs, configCosts)
  // Calculate total cost from itinerary legs.
  let drivingCost = 0
  let hasBikeshare = false
  let transitFareNotProvided = false
  let rideHailTrip = false
  itinerary.legs.forEach((leg) => {
    rideHailTrip = rideHailTrip || !!leg?.rideHailingEstimate
    if (leg.mode === 'CAR' && !rideHailTrip) {
      // Convert meters to miles and multiple by cost per mile.
      drivingCost += leg.distance * 0.000621371 * costs.drivingCentsPerMile
    }
    if (
      leg.mode === 'BICYCLE_RENT' ||
      leg.mode === 'MICROMOBILITY' ||
      leg.mode === 'SCOOTER' ||
      leg.rentedBike
    ) {
      hasBikeshare = true
    }
    if (isTransitLeg(leg) && transitFare == null) {
      transitFareNotProvided = true
    }
  })
  // If our itinerary includes a transit leg, but transit fare data is not provided
  // return no fare information, rather than an underestimate
  if (transitFareNotProvided) return null
  const bikeshareCost = hasBikeshare ? costs.bikeshareTripCostCents : 0
  // If some leg uses driving, add parking cost to the total.
  if (drivingCost > 0 && !rideHailTrip) drivingCost += costs.carParkingCostCents
  return bikeshareCost + drivingCost + (transitFare || 0) + maxTNCFare * 100
}

/**
 * Default constants for calculating itinerary "cost", i.e., how preferential a
 * particular itinerary is based on factors like wait time, total fare, drive
 * time, etc.
 */
const DEFAULT_WEIGHTS = {
  driveReluctance: 2,
  durationFactor: 0.25,
  fareFactor: 0.5,
  transferReluctance: 0.9,
  waitReluctance: 0.1,
  walkReluctance: 0.1
}

/**
 * This calculates the "cost" (not the monetary cost, but the cost according to
 * multiple factors like duration, total fare, and walking distance) for a
 * particular itinerary, for use in sorting itineraries.
 * FIXME: Do major testing to get this right.
 */
export function calculateItineraryCost(
  itinerary: Itinerary,
  config: Pick<AppConfig, 'itinerary'> = {}
): number {
  // Initialize weights to default values.
  const weights = DEFAULT_WEIGHTS
  // If config contains values to override defaults, apply those.
  const configWeights = config.itinerary && config.itinerary.weights
  if (configWeights) Object.assign(weights, configWeights)
  return (
    (getTotalFare(
      itinerary,
      config.itinerary?.costs,
      config.itinerary?.defaultFareType
    ) || 0) *
      weights.fareFactor +
    itinerary.duration * weights.durationFactor +
    (itinerary.walkDistance || 0) * weights.walkReluctance +
    getDriveTime(itinerary) * weights.driveReluctance +
    itinerary.waitingTime * weights.waitReluctance +
    (itinerary.transfers || 0) * weights.transferReluctance
  )
}

/**
 * Computes and add cost attributes to avoid recomputing those costs during sorting.
 */
export function addSortingCosts<T extends Itinerary>(
  itinerary: T,
  config: AppConfig
): ItineraryWithSortingCosts {
  const configCosts = config.itinerary?.costs
  const totalFareResult = getTotalFare(itinerary, configCosts)
  const totalFare =
    totalFareResult === null ? Number.MAX_VALUE : totalFareResult

  const rank = calculateItineraryCost(itinerary, config)
  const transitFare = getFare(itinerary).transitFare
  return {
    ...itinerary,
    rank,
    totalFare,
    transitFare
  }
}

interface LegWithOriginalMode extends Leg {
  originalMode?: string
}

/** Applies route mode overrides to an itinerary. */
export function applyRouteModeOverrides(
  itinerary: Itinerary,
  routeModeOverrides: Record<string, string>
): void {
  itinerary.legs.forEach((leg: LegWithOriginalMode) => {
    // Use OTP2 leg route first, fallback on legacy leg routeId.
    const routeId = typeof leg.route === 'object' ? leg.route.id : leg.routeId
    if (routeId) {
      leg.originalMode = leg.mode
      leg.mode = checkForRouteModeOverride(
        {
          id: routeId,
          mode: leg.mode
        },
        routeModeOverrides
      )
    }
  })
}

/** Remove mode overrides from an itinerary */
export function copyAndRemoveRouteModeOverrides(
  itinerary: Itinerary
): Itinerary {
  return {
    ...itinerary,
    legs: itinerary.legs.map((leg: LegWithOriginalMode) => ({
      ...leg,
      mode: leg.originalMode || leg.mode
    }))
  }
}
