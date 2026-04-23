import { Leg, Place, Stop } from '@opentripplanner/types'
import clone from 'clone'

import {
  getFirstTransitLeg,
  getLastTransitLeg,
  ItineraryWithIndex
} from './itinerary'

/* eslint-disable complexity */
export interface CustomRoutingZone {
  /** The bounding box of the routing zone */
  bbox: BoundingBox
  /** Route exclusion rules to use if the destination of an itinerary falls within the zone */
  destinationRouteExclusionRules?: RouteExclusionRule[]
  /** Stop adjustment rules to use if the destination of an itinerary falls within the zone */
  destinationStopAdjustmentRules: StopAdjustmentRule[]
  /** Name of the zone, to be shown on the overview map and in the itinerary */
  name: string
  /** Route exclusion rules to use if the origin of an itinerary falls within the zone */
  originRouteExclusionRules?: RouteExclusionRule[]
  /** Stop adjustment rules to use if the origin of an itinerary falls within the zone */
  originStopAdjustmentRules: StopAdjustmentRule[]
  /** Time windows where the custom routing should take effect. Formatted as milliseconds since the unix epoch */
  times: { end: number; start: number }[]
}

/** Describes an adjustment to be made to a transit leg */
export interface StopAdjustment {
  /** Difference in leg duration between the original stop and the new stop, expressed in seconds */
  duration: number
  /** Difference in end time between the original stop and the new stop, expressed in milliseconds */
  endTime: number
  /** Stops to add to the transit leg. For origin adjustments, stops are added to the beginning of the leg.
   * For destination adjustments, stops are added to the end of the leg
   */
  intermediateStopsToAdd?: NewStop[]
  /** Stops to remove from the transit leg. Since the stops are removed, only a number of stops is required.
   * For origin adjustments, stops are removed from the beginning of the leg. For destination adjustments,
   * stops are removed from the end of the leg
   */
  intermediateStopsToRemove?: number
  /** Leg geometry adjustments to make */
  legGeometry: {
    /** Change in length of the leg geometry */
    length: number
    /** Leg geometry points to be added. Format should be encoded polyline points. For more information, see here:
     * https://developers.google.com/maps/documentation/utilities/polylineutility
     */
    pointsToAdd: string
    /** Leg geometry points to be removed. Format should be encoded polyline points. For more information, see here:
     * https://developers.google.com/maps/documentation/utilities/polylineutility
     */
    pointsToCut: string[]
  }
  /** Information for the new stop that should be used as the boarding or alighting point of the updated transit leg */
  newStop: NewStop
}

/** Information for the new stop that will be used in a stop adjustment. Since lat and lon are optional in the Stop type,
 * we need to make them required here
 */
interface NewStop extends Omit<Stop, 'lat' | 'lon'> {
  lat: number
  lon: number
}

interface BoundingBox {
  maxLat: number
  maxLon: number
  minLat: number
  minLon: number
}

/** Rule for adjusting stops in an itinerary based on certain trip rules. When an itinerary's transit leg matches one
 * of the trips in the rule, the leg will be updated according to the relevant stopAdjustment, if one exists
 */
export interface StopAdjustmentRule {
  /** A custom walk leg geometry that will be inserted into the itinerary. Formatted as a function that takes in
   * the relevant start time for the walk leg
   */
  customWalkLegGeometry: (timeToAdjust: number) => string
  /** Adjustments to make to a transit leg if the originalStop is included in that leg */
  stopAdjustments: { adjustment: StopAdjustment; originalStop: string }[]
  /** Transit trips that should potentially trigger stop adjustments */
  trips: { accessible: boolean; headsigns: string[]; route: string }[]
}

/** Rule that prohibits itineraries from containing certain routes. If an itinerary contains the given route with one of the given headsigns,
 * the itinerary will be deleted if one of the prohibitedRoutes is also used within that itinerary
 */
interface RouteExclusionRule {
  headsigns: string[]
  prohibitedRoutes: string[]
  route: string
}

/**
 * Note that the legGeometry.points string may contain double-escaped characters when copied from the OTP response (for example, "sdaf\\sdaf" would evaluate to "sdafsdaf").
 * These double-escaped characters need to be escaped again. So, in the example, "sdaf\\sdaf" would need to be updated to "sdaf\\\\sdaf".
 *
 * The legs are formatted as functions so that the relevant time may be used when generating the walk leg string. For example, a destination adjustment would use the end time
 * of the final transit leg as the timeToAdjust parameter value, since that's when the walk leg would start. The function would then use that time as the startTime and, using
 * the duration of the custom walk leg, provide the correct end time as well.
 */
const STADIUM_TO_ZONE_WALK_LEG = (timeToAdjust: number): string =>
  `{ "accessibilityScore": null, "agency": null, "alerts": [], "arrivalDelay": 0, "departureDelay": 0, "distance": 1187.45, "dropOffBookingInfo": { "latestBookingTime": null }, "dropoffType": "SCHEDULED", "duration": 948, "endTime": ${
    timeToAdjust + 948000
  }, "fareProducts": [], "from": { "lat": 47.5922848, "lon": -122.3269941, "name": "Stadium", "rentalVehicle": null, "stop": null, "vertexType": "NORMAL" }, "headsign": null, "id": null, "interlineWithPreviousLeg": false, "intermediateStops": null, "legGeometry": { "length": 85, "points": "ujnaHv~riV?B?L?B?D?H?J?B?D?F?H?@?@?F?\\\\@DC@C@?D?D?L?dE@FBFBD@??BCXAPA\\\\ZrADNFFHFDDFDH@V?N?AWAIEOEKGMGGIGIGKAK?K@IBKHGHGJENENAN?P?lD@T?V?FE?S??Z?bA?bH?DCDE?_@@qH@]A]P_D@W??DAHeA?k@AgF?????S?S?A?" }, "mode": "WALK", "pickupBookingInfo": null, "pickupType": "SCHEDULED", "realTime": false, "realtimeState": null, "rentedBike": false, "rideHailingEstimate": null, "startTime": ${timeToAdjust}, "steps": [ { "absoluteDirection": "WEST", "alerts": [], "area": false, "distance": 6.46, "elevationProfile": [], "lat": 47.5922729, "lon": -122.3269938, "relativeDirection": "DEPART", "stayOn": false, "streetName": "SODO Trail" }, { "absoluteDirection": "WEST", "alerts": [], "area": false, "distance": 131.38, "elevationProfile": [], "lat": 47.5922724, "lon": -122.32708, "relativeDirection": "CONTINUE", "stayOn": false, "streetName": "path" }, { "absoluteDirection": "SOUTHWEST", "alerts": [], "area": false, "distance": 8.14, "elevationProfile": [], "lat": 47.5922964, "lon": -122.3288022, "relativeDirection": "LEFT", "stayOn": false, "streetName": "4th Avenue South" }, { "absoluteDirection": "WEST", "alerts": [], "area": false, "distance": 29.35, "elevationProfile": [], "lat": 47.5922467, "lon": -122.3288776, "relativeDirection": "RIGHT", "stayOn": false, "streetName": "sidewalk" }, { "absoluteDirection": "SOUTHWEST", "alerts": [], "area": true, "distance": 90.44, "elevationProfile": [], "lat": 47.5922872, "lon": -122.3292643, "relativeDirection": "SLIGHTLY_LEFT", "stayOn": true, "streetName": "open area" }, { "absoluteDirection": "EAST", "alerts": [], "area": false, "distance": 207.69, "elevationProfile": [], "lat": 47.5917061, "lon": -122.3299114, "relativeDirection": "LEFT", "stayOn": false, "streetName": "South Royal Brougham Way" }, { "absoluteDirection": "NORTH", "alerts": [], "area": false, "distance": 168.02, "elevationProfile": [], "lat": 47.5923984, "lon": -122.3310633, "relativeDirection": "RIGHT", "stayOn": false, "streetName": "sidewalk" }, { "absoluteDirection": "NORTH", "alerts": [], "area": false, "distance": 331.13, "elevationProfile": [], "lat": 47.5925717, "lon": -122.3330691, "relativeDirection": "RIGHT", "stayOn": true, "streetName": "sidewalk" }, { "absoluteDirection": "NORTH", "alerts": [], "area": false, "distance": 214.88, "elevationProfile": [], "lat": 47.5954986, "lon": -122.3332531, "relativeDirection": "RIGHT", "stayOn": false, "streetName": "Occidental Avenue South" } ], "stopCalls": [], "to": { "lat": 47.597431, "lon": -122.3332496, "name": "47.59743, -122.33325", "rentalVehicle": null, "stop": null, "vertexType": "NORMAL" }, "transitLeg": false, "trip": null, "alightRule": "scheduled", "boardRule": "scheduled", "bookingRuleInfo": { "dropOff": {}, "pickUp": {} }, "routeColor": "333333", "routeTextColor": "" }`

const PIONEER_SQUARE_TO_ZONE_WALK_LEG = (timeToAdjust: number): string =>
  `{ "accessibilityScore": null, "agency": null, "alerts": [], "arrivalDelay": 0, "departureDelay": 0, "distance": 681.08, "dropOffBookingInfo": { "latestBookingTime": null }, "dropoffType": "SCHEDULED", "duration": 586, "endTime": ${
    timeToAdjust + 586000
  }, "fareProducts": [], "from": { "lat": 47.6021725, "lon": -122.3309562, "name": "Pioneer Square", "rentalVehicle": null, "stop": null, "vertexType": "NORMAL" }, "headsign": null, "id": null, "interlineWithPreviousLeg": false, "intermediateStops": null, "legGeometry": { "length": 61, "points": "mhpaHxwsiVLMBCTn@HXBHDLJ@@?B?FBJBB??t@?@?F?@?B?L?B?\`@?B?@?B?TAfB@@D??F?LR?@???Z?Z@^?LAT?L?b@?dB@J?B?L@@?jC@@?D?J?J?P?v@?dA?N??H?R?f@Z?xA?x@???" }, "mode": "WALK", "pickupBookingInfo": null, "pickupType": "SCHEDULED", "realTime": false, "realtimeState": null, "rentedBike": false, "rideHailingEstimate": null, "startTime": ${timeToAdjust}, "steps": [ { "absoluteDirection": "SOUTHEAST", "alerts": [], "area": false, "distance": 11.8, "elevationProfile": [], "lat": 47.6021526, "lon": -122.3310028, "relativeDirection": "DEPART", "stayOn": false, "streetName": "3rd Avenue" }, { "absoluteDirection": "SOUTHWEST", "alerts": [], "area": false, "distance": 67.23, "elevationProfile": [], "lat": 47.6020628, "lon": -122.330919, "relativeDirection": "RIGHT", "stayOn": false, "streetName": "sidewalk" }, { "absoluteDirection": "WEST", "alerts": [], "area": false, "distance": 19.78, "elevationProfile": [], "lat": 47.6016432, "lon": -122.3314587, "relativeDirection": "RIGHT", "stayOn": false, "streetName": "Yesler Way Cycletrack" }, { "absoluteDirection": "WEST", "alerts": [], "area": false, "distance": 4.19, "elevationProfile": [], "lat": 47.6016435, "lon": -122.3317225, "relativeDirection": "CONTINUE", "stayOn": false, "streetName": "2nd Avenue Cycletrack" }, { "absoluteDirection": "WEST", "alerts": [], "area": false, "distance": 21.76, "elevationProfile": [], "lat": 47.6016407, "lon": -122.3317781, "relativeDirection": "CONTINUE", "stayOn": false, "streetName": "path" }, { "absoluteDirection": "SOUTHWEST", "alerts": [], "area": false, "distance": 1.83, "elevationProfile": [], "lat": 47.6016489, "lon": -122.3320681, "relativeDirection": "SLIGHTLY_LEFT", "stayOn": false, "streetName": "Yesler Way Cycletrack" }, { "absoluteDirection": "NORTHWEST", "alerts": [], "area": false, "distance": 56.79, "elevationProfile": [], "lat": 47.6016401, "lon": -122.3320888, "relativeDirection": "RIGHT", "stayOn": true, "streetName": "Yesler Way Cycletrack" }, { "absoluteDirection": "WEST", "alerts": [], "area": false, "distance": 5.35, "elevationProfile": [], "lat": 47.6016148, "lon": -122.3327947, "relativeDirection": "CONTINUE", "stayOn": false, "streetName": "path" }, { "absoluteDirection": "SOUTH", "alerts": [], "area": false, "distance": 492.34, "elevationProfile": [], "lat": 47.601615, "lon": -122.332866, "relativeDirection": "LEFT", "stayOn": false, "streetName": "Occidental Avenue South" } ], "stopCalls": [], "to": { "lat": 47.5974222, "lon": -122.3332358, "name": "Nirmal’s, Seattle, WA, USA", "rentalVehicle": null, "stop": null, "vertexType": "NORMAL" }, "transitLeg": false, "trip": null, "alightRule": "scheduled", "boardRule": "scheduled", "bookingRuleInfo": { "dropOff": {}, "pickUp": {} }, "routeColor": "333333", "routeTextColor": "" }`

const ZONE_TO_PIONEER_SQUARE_WALK_LEG = (timeToAdjust: number): string =>
  `{ "accessibilityScore": null, "agency": null, "alerts": [], "arrivalDelay": 0, "departureDelay": 0, "distance": 812.94, "dropOffBookingInfo": { "latestBookingTime": null }, "dropoffType": "SCHEDULED", "duration": 735, "endTime": ${
    timeToAdjust + 735000
  }, "fareProducts": [], "from": { "lat": 47.5974118, "lon": -122.333247, "name": "47.59741, -122.33325", "rentalVehicle": null, "stop": null, "vertexType": "NORMAL" }, "headsign": null, "id": null, "interlineWithPreviousLeg": false, "intermediateStops": null, "legGeometry": { "length": 68, "points": "yjoaHxetiVA?y@?yA?[??g@?Y?CA?M?eA?s@?U?K?K?E?A?kCAA?MAC?K?iCAM?U?M@_@?YAs@??M?GE?AA@gB?U?C?A?C?a@?Q?C?A?G?A?u@C?KCGCC?A?KAEMCIIWUq@CBAEEMIFEDA@A@MJ}@v@URKJKJ{@t@" }, "mode": "WALK", "pickupBookingInfo": null, "pickupType": "SCHEDULED", "realTime": false, "realtimeState": null, "rentedBike": false, "rideHailingEstimate": null, "startTime": ${timeToAdjust}, "steps": [ { "absoluteDirection": "NORTH", "alerts": [], "area": false, "distance": 493.53, "elevationProfile": [], "lat": 47.5974118, "lon": -122.3332452, "relativeDirection": "DEPART", "stayOn": false, "streetName": "Occidental Avenue South" }, { "absoluteDirection": "EAST", "alerts": [], "area": false, "distance": 5.35, "elevationProfile": [], "lat": 47.601615, "lon": -122.332866, "relativeDirection": "RIGHT", "stayOn": false, "streetName": "path" }, { "absoluteDirection": "EAST", "alerts": [], "area": false, "distance": 56.79, "elevationProfile": [], "lat": 47.6016148, "lon": -122.3327947, "relativeDirection": "CONTINUE", "stayOn": false, "streetName": "Yesler Way Cycletrack" }, { "absoluteDirection": "NORTHEAST", "alerts": [], "area": false, "distance": 1.83, "elevationProfile": [], "lat": 47.6016401, "lon": -122.3320888, "relativeDirection": "LEFT", "stayOn": true, "streetName": "Yesler Way Cycletrack" }, { "absoluteDirection": "EAST", "alerts": [], "area": false, "distance": 21.76, "elevationProfile": [], "lat": 47.6016489, "lon": -122.3320681, "relativeDirection": "SLIGHTLY_RIGHT", "stayOn": false, "streetName": "path" }, { "absoluteDirection": "EAST", "alerts": [], "area": false, "distance": 4.19, "elevationProfile": [], "lat": 47.6016407, "lon": -122.3317781, "relativeDirection": "CONTINUE", "stayOn": false, "streetName": "2nd Avenue Cycletrack" }, { "absoluteDirection": "EAST", "alerts": [], "area": false, "distance": 19.78, "elevationProfile": [], "lat": 47.6016435, "lon": -122.3317225, "relativeDirection": "CONTINUE", "stayOn": false, "streetName": "Yesler Way Cycletrack" }, { "absoluteDirection": "NORTH", "alerts": [], "area": false, "distance": 78.71, "elevationProfile": [], "lat": 47.6016432, "lon": -122.3314587, "relativeDirection": "LEFT", "stayOn": false, "streetName": "sidewalk" }, { "absoluteDirection": "NORTHWEST", "alerts": [], "area": false, "distance": 131.01, "elevationProfile": [], "lat": 47.6021255, "lon": -122.3308333, "relativeDirection": "LEFT", "stayOn": false, "streetName": "3rd Avenue" } ], "stopCalls": [], "to": { "lat": 47.6021972, "lon": -122.3309194, "name": "Pioneer Square", "rentalVehicle": null, "stop": null, "vertexType": "NORMAL" }, "transitLeg": false, "trip": null, "alightRule": "scheduled", "boardRule": "scheduled", "bookingRuleInfo": { "dropOff": {}, "pickUp": {} }, "routeColor": "333333", "routeTextColor": "" }`

const ZONE_TO_STADIUM_WALK_LEG = (timeToAdjust: number): string =>
  `{ "accessibilityScore": null, "agency": null, "alerts": [], "arrivalDelay": 0, "departureDelay": 0, "distance": 1223.68, "dropOffBookingInfo": { "latestBookingTime": null }, "dropoffType": "SCHEDULED", "duration": 979, "endTime": ${
    timeToAdjust + 979000
  }, "fareProducts": [], "from": { "lat": 47.5971302, "lon": -122.33328, "name": "539 Occidental Avenue South, Seattle, WA, USA", "rentalVehicle": null, "stop": null, "vertexType": "NORMAL" }, "headsign": null, "id": null, "interlineWithPreviousLeg": false, "intermediateStops": null, "legGeometry": { "length": 86, "points": "{joaHxetiVX?^???tE?pA@^?D?R??I?E~CA\\\\Q\\\\@\`HAn@AD?BE?E?cH?cA?U?ER?D??U?IAU?mD?Q@ODODOFKFIJIHCJAJ?J@HFHFFFFLDJDN@H@VO?W?IAGEEEIGGGCIAE[sA@]@QBY?CA?CECGAG?gC?kA?E?EBABAAE?]?G???C?I?G?E?C?K\\\\?T?d@?@?????" }, "mode": "WALK", "pickupBookingInfo": null, "pickupType": "SCHEDULED", "realTime": false, "realtimeState": null, "rentedBike": false, "rideHailingEstimate": null, "startTime": ${timeToAdjust}, "steps": [ { "absoluteDirection": "SOUTH", "alerts": [], "area": false, "distance": 228.45, "elevationProfile": [], "lat": 47.5974218, "lon": -122.3332452, "relativeDirection": "DEPART", "stayOn": false, "streetName": "Occidental Avenue South" }, { "absoluteDirection": "EAST", "alerts": [], "area": false, "distance": 317.93, "elevationProfile": [], "lat": 47.5953673, "lon": -122.3332544, "relativeDirection": "LEFT", "stayOn": false, "streetName": "path" }, { "absoluteDirection": "EAST", "alerts": [], "area": false, "distance": 168.01, "elevationProfile": [], "lat": 47.5925717, "lon": -122.3330691, "relativeDirection": "LEFT", "stayOn": true, "streetName": "sidewalk" }, { "absoluteDirection": "EAST", "alerts": [], "area": false, "distance": 207.68, "elevationProfile": [], "lat": 47.5923984, "lon": -122.3310633, "relativeDirection": "LEFT", "stayOn": false, "streetName": "South Royal Brougham Way" }, { "absoluteDirection": "NORTH", "alerts": [], "area": false, "distance": 119.79, "elevationProfile": [], "lat": 47.5917061, "lon": -122.3299114, "relativeDirection": "RIGHT", "stayOn": false, "streetName": "path" }, { "absoluteDirection": "NORTHEAST", "alerts": [], "area": false, "distance": 8.14, "elevationProfile": [], "lat": 47.5922467, "lon": -122.3288776, "relativeDirection": "LEFT", "stayOn": false, "streetName": "4th Avenue South" }, { "absoluteDirection": "EAST", "alerts": [], "area": false, "distance": 123.28, "elevationProfile": [], "lat": 47.5922964, "lon": -122.3288022, "relativeDirection": "RIGHT", "stayOn": false, "streetName": "sidewalk" }, { "absoluteDirection": "SOUTH", "alerts": [], "area": false, "distance": 50.41, "elevationProfile": [], "lat": 47.5922728, "lon": -122.3271879, "relativeDirection": "RIGHT", "stayOn": false, "streetName": "SODO Trail" } ], "stopCalls": [], "to": { "lat": 47.5918194, "lon": -122.3272998, "name": "Stadium", "rentalVehicle": null, "stop": null, "vertexType": "NORMAL" }, "transitLeg": false, "trip": null, "alightRule": "scheduled", "boardRule": "scheduled", "bookingRuleInfo": { "dropOff": {}, "pickUp": {} }, "routeColor": "333333", "routeTextColor": "" }`

const INTERNATIONAL_DISTRICT_TO_ZONE_WALK_LEG = (
  timeToAdjust: number
): string =>
  `{ "accessibilityScore": 1, "agency": null, "alerts": [], "arrivalDelay": 0, "departureDelay": 0, "distance": 652.99, "dropOffBookingInfo": { "latestBookingTime": null }, "dropoffType": "SCHEDULED", "duration": 578, "endTime": ${
    timeToAdjust + 578000
  }, "fareProducts": [], "from": { "lat": 47.5976363, "lon": -122.3280653, "name": "Int'l Dist/Chinatown", "rentalVehicle": null, "stop": null, "vertexType": "NORMAL" }, "headsign": null, "id": null, "interlineWithPreviousLeg": false, "intermediateStops": null, "legGeometry": { "length": 58, "points": "eloaHlesiVaAq@W?_@A[@I?_@AA?_A?C?K?WPA?GAE??V?R?^?\`@???f@?h@?b@?XB@J?@B?B?f@?D@@?B?T@L?N@BAH?h@AB?H?FCN?L?TAD?fE@D@@B@~B?@?@A?DDVR?R?jC?J?" }, "mode": "WALK", "pickupBookingInfo": null, "pickupType": "SCHEDULED", "realTime": false, "realtimeState": null, "rentedBike": false, "rideHailingEstimate": null, "startTime": ${timeToAdjust}, "steps": [ { "absoluteDirection": "NORTHEAST", "alerts": [], "area": true, "distance": 40.7, "elevationProfile": [], "lat": 47.5976378, "lon": -122.3280693, "relativeDirection": "DEPART", "stayOn": false, "streetName": "open area" }, { "absoluteDirection": "NORTH", "alerts": [], "area": false, "distance": 31.7, "elevationProfile": [], "lat": 47.5979603, "lon": -122.3278127, "relativeDirection": "SLIGHTLY_LEFT", "stayOn": false, "streetName": "5th Avenue South" }, { "absoluteDirection": "NORTH", "alerts": [], "area": false, "distance": 15.16, "elevationProfile": [], "lat": 47.5982453, "lon": -122.327808, "relativeDirection": "CONTINUE", "stayOn": false, "streetName": "South King Street" }, { "absoluteDirection": "NORTH", "alerts": [], "area": false, "distance": 85.11, "elevationProfile": [], "lat": 47.5983816, "lon": -122.3278101, "relativeDirection": "CONTINUE", "stayOn": false, "streetName": "5th Avenue Cycletrack" }, { "absoluteDirection": "NORTH", "alerts": [], "area": false, "distance": 7.67, "elevationProfile": [], "lat": 47.5991318, "lon": -122.3278947, "relativeDirection": "CONTINUE", "stayOn": false, "streetName": "path" }, { "absoluteDirection": "WEST", "alerts": [], "area": false, "distance": 95.9, "elevationProfile": [], "lat": 47.5992001, "lon": -122.3278808, "relativeDirection": "LEFT", "stayOn": false, "streetName": "South Jackson Street" }, { "absoluteDirection": "SOUTH", "alerts": [], "area": false, "distance": 8.75, "elevationProfile": [], "lat": 47.5992035, "lon": -122.32916, "relativeDirection": "LEFT", "stayOn": false, "streetName": "path" }, { "absoluteDirection": "SOUTHWEST", "alerts": [], "area": false, "distance": 64.49, "elevationProfile": [], "lat": 47.599125, "lon": -122.3291684, "relativeDirection": "RIGHT", "stayOn": true, "streetName": "sidewalk" }, { "absoluteDirection": "WEST", "alerts": [], "area": false, "distance": 27.85, "elevationProfile": [], "lat": 47.599099, "lon": -122.3300074, "relativeDirection": "CONTINUE", "stayOn": false, "streetName": "3rd Avenue South" }, { "absoluteDirection": "WEST", "alerts": [], "area": false, "distance": 80.03, "elevationProfile": [], "lat": 47.5991273, "lon": -122.3303743, "relativeDirection": "CONTINUE", "stayOn": false, "streetName": "South Jackson Street" }, { "absoluteDirection": "SOUTH", "alerts": [], "area": false, "distance": 77.24, "elevationProfile": [], "lat": 47.5991285, "lon": -122.3314377, "relativeDirection": "LEFT", "stayOn": false, "streetName": "2nd Avenue South" }, { "absoluteDirection": "WEST", "alerts": [], "area": false, "distance": 2.02, "elevationProfile": [], "lat": 47.5984359, "lon": -122.33145, "relativeDirection": "RIGHT", "stayOn": false, "streetName": "South King Street" }, { "absoluteDirection": "WEST", "alerts": [], "area": false, "distance": 9.2, "elevationProfile": [], "lat": 47.5984359, "lon": -122.3314769, "relativeDirection": "SLIGHTLY_LEFT", "stayOn": false, "streetName": "path" }, { "absoluteDirection": "SOUTH", "alerts": [], "area": false, "distance": 11.42, "elevationProfile": [], "lat": 47.5984054, "lon": -122.331591, "relativeDirection": "LEFT", "stayOn": false, "streetName": "2nd Avenue South" }, { "absoluteDirection": "SOUTH", "alerts": [], "area": false, "distance": 95.79, "elevationProfile": [], "lat": 47.5983027, "lon": -122.3315944, "relativeDirection": "CONTINUE", "stayOn": false, "streetName": "Stadium Place South" } ], "stopCalls": [], "to": { "lat": 47.5974413, "lon": -122.3316037, "name": "Stadium Place South, Seattle, WA, USA", "rentalVehicle": null, "stop": null, "vertexType": "NORMAL" }, "transitLeg": false, "trip": null, "alightRule": "scheduled", "boardRule": "scheduled", "bookingRuleInfo": { "dropOff": {}, "pickUp": {} }, "routeColor": "333333", "routeTextColor": "" }`

const ZONE_TO_INTERNATIONAL_DISTRICT_WALK_LEG = (
  timeToAdjust: number
): string =>
  `{ "accessibilityScore": null, "agency": null, "alerts": [], "arrivalDelay": 0, "departureDelay": 0, "distance": 584.01, "dropOffBookingInfo": { "latestBookingTime": null }, "dropoffType": "SCHEDULED", "duration": 543, "endTime": ${
    timeToAdjust + 543000
  }, "fareProducts": [], "from": { "lat": 47.5974371, "lon": -122.3316037, "name": "47.59744, -122.3316", "rentalVehicle": null, "stop": null, "vertexType": "NORMAL" }, "headsign": null, "id": null, "interlineWithPreviousLeg": false, "intermediateStops": null, "legGeometry": { "length": 61, "points": "}joaHp{siV?A?QK@EM_A@gA??@C?OEIEI?G??HwB?I?CAAAAE?gE@E?U?MBO?G?I@C?i@@IAC?OAM?U?CAA?E?g@?CAC?[?]KEC??i@?g@?u@???K?S?WD?F@@?VQJ?B?~@?@?^@H?VA" }, "mode": "WALK", "pickupBookingInfo": null, "pickupType": "SCHEDULED", "realTime": false, "realtimeState": null, "rentedBike": false, "rideHailingEstimate": null, "startTime": ${timeToAdjust}, "steps": [ { "absoluteDirection": "EAST", "alerts": [], "area": false, "distance": 7.25, "elevationProfile": [], "lat": 47.5974337, "lon": -122.3316037, "relativeDirection": "DEPART", "stayOn": false, "streetName": "parking aisle" }, { "absoluteDirection": "NORTH", "alerts": [], "area": false, "distance": 6.72, "elevationProfile": [], "lat": 47.5974331, "lon": -122.331507, "relativeDirection": "LEFT", "stayOn": true, "streetName": "path" }, { "absoluteDirection": "NORTHEAST", "alerts": [], "area": false, "distance": 5.87, "elevationProfile": [], "lat": 47.5974935, "lon": -122.3315114, "relativeDirection": "RIGHT", "stayOn": false, "streetName": "Stadium Place South" }, { "absoluteDirection": "NORTH", "alerts": [], "area": false, "distance": 78.72, "elevationProfile": [], "lat": 47.5975255, "lon": -122.3314491, "relativeDirection": "LEFT", "stayOn": true, "streetName": "Stadium Place South" }, { "absoluteDirection": "NORTH", "alerts": [], "area": false, "distance": 15.34, "elevationProfile": [], "lat": 47.5982271, "lon": -122.3314627, "relativeDirection": "CONTINUE", "stayOn": false, "streetName": "path" }, { "absoluteDirection": "NORTH", "alerts": [], "area": false, "distance": 89.11, "elevationProfile": [], "lat": 47.5983598, "lon": -122.3314068, "relativeDirection": "CONTINUE", "stayOn": false, "streetName": "2nd Avenue South" }, { "absoluteDirection": "EAST", "alerts": [], "area": false, "distance": 80.03, "elevationProfile": [], "lat": 47.5991285, "lon": -122.3314377, "relativeDirection": "RIGHT", "stayOn": false, "streetName": "South Jackson Street" }, { "absoluteDirection": "EAST", "alerts": [], "area": false, "distance": 27.85, "elevationProfile": [], "lat": 47.5991273, "lon": -122.3303743, "relativeDirection": "CONTINUE", "stayOn": false, "streetName": "3rd Avenue South" }, { "absoluteDirection": "EAST", "alerts": [], "area": false, "distance": 86.67, "elevationProfile": [], "lat": 47.599099, "lon": -122.3300074, "relativeDirection": "CONTINUE", "stayOn": false, "streetName": "sidewalk" }, { "absoluteDirection": "NORTH", "alerts": [], "area": false, "distance": 9.14, "elevationProfile": [], "lat": 47.5991238, "lon": -122.3288726, "relativeDirection": "LEFT", "stayOn": true, "streetName": "path" }, { "absoluteDirection": "EAST", "alerts": [], "area": false, "distance": 71.61, "elevationProfile": [], "lat": 47.599203, "lon": -122.32884, "relativeDirection": "RIGHT", "stayOn": false, "streetName": "South Jackson Street" }, { "absoluteDirection": "SOUTH", "alerts": [], "area": false, "distance": 7.67, "elevationProfile": [], "lat": 47.5992001, "lon": -122.3278808, "relativeDirection": "RIGHT", "stayOn": false, "streetName": "path" }, { "absoluteDirection": "SOUTH", "alerts": [], "area": false, "distance": 85.11, "elevationProfile": [], "lat": 47.5991318, "lon": -122.3278947, "relativeDirection": "CONTINUE", "stayOn": false, "streetName": "5th Avenue Cycletrack" }, { "absoluteDirection": "SOUTH", "alerts": [], "area": false, "distance": 12.64, "elevationProfile": [], "lat": 47.5983816, "lon": -122.3278101, "relativeDirection": "CONTINUE", "stayOn": false, "streetName": "South King Street" } ], "stopCalls": [], "to": { "lat": 47.5982677, "lon": -122.3278357, "name": "Int'l Dist/Chinatown", "rentalVehicle": null, "stop": null, "vertexType": "NORMAL" }, "transitLeg": false, "trip": null, "alightRule": "scheduled", "boardRule": "scheduled", "bookingRuleInfo": { "dropOff": {}, "pickUp": {} }, "routeColor": "333333", "routeTextColor": "" }`

const INTERNATIONAL_DISTRICT_TO_ZONE_WALK_LEG_ACCESSIBLE = (
  timeToAdjust: number
): string =>
  `{ "accessibilityScore": 1, "agency": null, "alerts": [], "arrivalDelay": 0, "departureDelay": 0, "distance": 191.12, "dropOffBookingInfo": { "latestBookingTime": null }, "dropoffType": "SCHEDULED", "duration": 281, "endTime": ${
    timeToAdjust + 281000
  }, "fareProducts": [], "from": { "lat": 47.5976157, "lon": -122.3281594, "name": "Int'l Dist/Chinatown", "rentalVehicle": null, "stop": null, "vertexType": "NORMAL" }, "headsign": null, "id": null, "interlineWithPreviousLeg": false, "intermediateStops": null, "legGeometry": { "length": 23, "points": "aloaH~esiVDR@dAAh@?HCB?D?V@^?DAD?^?HAxA?Z?j@?????BTRB@?\\\\@?" }, "mode": "WALK", "pickupBookingInfo": null, "pickupType": "SCHEDULED", "realTime": false, "realtimeState": null, "rentedBike": false, "rideHailingEstimate": null, "startTime": ${timeToAdjust}, "steps": [ { "absoluteDirection": "SOUTHWEST", "alerts": [], "area": false, "distance": 34.44, "elevationProfile": [], "lat": 47.597616, "lon": -122.3281596, "relativeDirection": "DEPART", "stayOn": false, "streetName": "open area" }, { "absoluteDirection": "WEST", "alerts": [], "area": false, "distance": 24.1, "elevationProfile": [], "lat": 47.5975791, "lon": -122.3286081, "relativeDirection": "CONTINUE", "stayOn": false, "streetName": "South Weller Street" }, { "absoluteDirection": "WEST", "alerts": [], "area": false, "distance": 25.35, "elevationProfile": [], "lat": 47.5976022, "lon": -122.3289176, "relativeDirection": "CONTINUE", "stayOn": false, "streetName": "path" }, { "absoluteDirection": "WEST", "alerts": [], "area": false, "distance": 76.81, "elevationProfile": [], "lat": 47.5976091, "lon": -122.3292521, "relativeDirection": "SLIGHTLY_LEFT", "stayOn": false, "streetName": "South Weller Street Overpass" }, { "absoluteDirection": "SOUTH", "alerts": [], "area": false, "distance": 0, "elevationProfile": [], "lat": 47.5976152, "lon": -122.3302764, "relativeDirection": "LEFT", "stayOn": false, "streetName": "ElevatorBoardEdge" }, { "absoluteDirection": null, "alerts": [], "area": false, "distance": 0, "elevationProfile": [], "lat": 47.5976152, "lon": -122.3302764, "relativeDirection": "ELEVATOR", "stayOn": false, "streetName": "elevator" }, { "absoluteDirection": "WEST", "alerts": [], "area": false, "distance": 1.51, "elevationProfile": [], "lat": 47.5976152, "lon": -122.3302764, "relativeDirection": "RIGHT", "stayOn": false, "streetName": "South Weller Street" }, { "absoluteDirection": "SOUTHWEST", "alerts": [], "area": true, "distance": 16.55, "elevationProfile": [], "lat": 47.5976151, "lon": -122.3302966, "relativeDirection": "LEFT", "stayOn": false, "streetName": "open area" }, { "absoluteDirection": "WEST", "alerts": [], "area": false, "distance": 12.39, "elevationProfile": [], "lat": 47.5974844, "lon": -122.3304, "relativeDirection": "RIGHT", "stayOn": true, "streetName": "service road" } ], "stopCalls": [], "to": { "lat": 47.5974785, "lon": -122.3305568, "name": "ChargePoint, Seattle, WA, USA", "rentalVehicle": null, "stop": null, "vertexType": "NORMAL" }, "transitLeg": false, "trip": null, "alightRule": "scheduled", "boardRule": "scheduled", "bookingRuleInfo": { "dropOff": {}, "pickUp": {} }, "routeColor": "333333", "routeTextColor": "" }`

const ZONE_TO_INTERNATIONAL_DISTRICT_WALK_LEG_ACCESSIBLE = (
  timeToAdjust: number
): string =>
  `{ "accessibilityScore": 1, "agency": null, "alerts": [], "arrivalDelay": 0, "departureDelay": 0, "distance": 288.69, "dropOffBookingInfo": { "latestBookingTime": null }, "dropoffType": "SCHEDULED", "duration": 360, "endTime": ${
    timeToAdjust + 360000
  }, "fareProducts": [], "from": { "lat": 47.5974843, "lon": -122.3305559, "name": "ChargePoint, Seattle, WA, USA", "rentalVehicle": null, "stop": null, "vertexType": "NORMAL" }, "headsign": null, "id": null, "interlineWithPreviousLeg": false, "intermediateStops": null, "legGeometry": { "length": 26, "points": "gkoaH~tsiV?]CAUS?C?????k@?[@yA?I?_@@E?EA_@?W?EBC?I@i@AeAkAwA]?YA[@?N" }, "mode": "WALK", "pickupBookingInfo": null, "pickupType": "SCHEDULED", "realTime": false, "realtimeState": null, "rentedBike": false, "rideHailingEstimate": null, "startTime": ${timeToAdjust}, "steps": [ { "absoluteDirection": "EAST", "alerts": [], "area": false, "distance": 11.69, "elevationProfile": [], "lat": 47.597484, "lon": -122.3305559, "relativeDirection": "DEPART", "stayOn": false, "streetName": "service road" }, { "absoluteDirection": "NORTH", "alerts": [], "area": false, "distance": 16.55, "elevationProfile": [], "lat": 47.5974844, "lon": -122.3304, "relativeDirection": "LEFT", "stayOn": true, "streetName": "path" }, { "absoluteDirection": "EAST", "alerts": [], "area": false, "distance": 1.51, "elevationProfile": [], "lat": 47.5976151, "lon": -122.3302966, "relativeDirection": "RIGHT", "stayOn": false, "streetName": "South Weller Street" }, { "absoluteDirection": "SOUTH", "alerts": [], "area": false, "distance": 0, "elevationProfile": [], "lat": 47.5976152, "lon": -122.3302764, "relativeDirection": "RIGHT", "stayOn": false, "streetName": "ElevatorBoardEdge" }, { "absoluteDirection": null, "alerts": [], "area": false, "distance": 0, "elevationProfile": [], "lat": 47.5976152, "lon": -122.3302764, "relativeDirection": "ELEVATOR", "stayOn": false, "streetName": "elevator" }, { "absoluteDirection": "EAST", "alerts": [], "area": false, "distance": 76.81, "elevationProfile": [], "lat": 47.5976152, "lon": -122.3302764, "relativeDirection": "LEFT", "stayOn": false, "streetName": "South Weller Street Overpass" }, { "absoluteDirection": "SOUTHEAST", "alerts": [], "area": false, "distance": 29.78, "elevationProfile": [], "lat": 47.5976091, "lon": -122.3292521, "relativeDirection": "SLIGHTLY_RIGHT", "stayOn": false, "streetName": "sidewalk" }, { "absoluteDirection": "EAST", "alerts": [], "area": false, "distance": 19.67, "elevationProfile": [], "lat": 47.597589, "lon": -122.3288691, "relativeDirection": "LEFT", "stayOn": false, "streetName": "South Weller Street" }, { "absoluteDirection": "EAST", "alerts": [], "area": true, "distance": 79.85, "elevationProfile": [], "lat": 47.5975791, "lon": -122.3286081, "relativeDirection": "CONTINUE", "stayOn": false, "streetName": "open area" }, { "absoluteDirection": "NORTH", "alerts": [], "area": false, "distance": 31.69, "elevationProfile": [], "lat": 47.5979603, "lon": -122.3278127, "relativeDirection": "SLIGHTLY_LEFT", "stayOn": false, "streetName": "5th Avenue South" }, { "absoluteDirection": "NORTH", "alerts": [], "area": false, "distance": 15.16, "elevationProfile": [], "lat": 47.5982453, "lon": -122.327808, "relativeDirection": "CONTINUE", "stayOn": false, "streetName": "South King Street" }, { "absoluteDirection": "WEST", "alerts": [], "area": false, "distance": 6.01, "elevationProfile": [], "lat": 47.5983816, "lon": -122.3278101, "relativeDirection": "LEFT", "stayOn": false, "streetName": "path" } ], "stopCalls": [], "to": { "lat": 47.5983401, "lon": -122.3278901, "name": "Int'l Dist/Chinatown", "rentalVehicle": null, "stop": null, "vertexType": "NORMAL" }, "transitLeg": false, "trip": null, "alightRule": "scheduled", "boardRule": "scheduled", "bookingRuleInfo": { "dropOff": {}, "pickUp": {} }, "routeColor": "333333", "routeTextColor": "" }`

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
    bbox: {
      maxLat: 47.597523,
      maxLon: -122.329477,
      minLat: 47.592241,
      minLon: -122.333457
    },
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
        // NORTHBOUND ACCESSIBLE 1 Line trips TO Seattle Stadium
        customWalkLegGeometry:
          INTERNATIONAL_DISTRICT_TO_ZONE_WALK_LEG_ACCESSIBLE,
        stopAdjustments: [
          {
            adjustment: {
              duration: 120,
              endTime: 120000,
              intermediateStopsToAdd: [STOPS.STADIUM],
              legGeometry: {
                length: 24,
                pointsToAdd:
                  '??uA?g@Be@H[JcBj@o@PsGfBc@H_@D]@]?YC{@Gc@A]?}ADQ?IAKCk@UKAOA_C?',
                pointsToCut: []
              },
              newStop: STOPS.INTERNATIONAL_DISTRICT_CHINATOWN
            },
            originalStop: 'Stadium'
          }
        ],
        trips: [
          {
            accessible: true,
            headsigns: ['Lynnwood City Center'],
            route: '1 Line'
          }
        ]
      },
      {
        // SOUTHBOUND 1 & 2 Line trips TO Seattle Stadium
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
        // SOUTHBOUND ACCESSIBLE 1 & 2 Line trips TO Seattle Stadium
        customWalkLegGeometry:
          INTERNATIONAL_DISTRICT_TO_ZONE_WALK_LEG_ACCESSIBLE,
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
          },
          {
            accessible: true,
            headsigns: ['Downtown Redmond'],
            route: '2 Line'
          }
        ]
      },
      {
        // WESTBOUND 2 Line trips TO Seattle Stadium
        customWalkLegGeometry: INTERNATIONAL_DISTRICT_TO_ZONE_WALK_LEG,
        stopAdjustments: [],
        trips: [
          {
            accessible: false,
            headsigns: ['Lynnwood City Center'],
            route: '2 Line'
          }
        ]
      },
      {
        // WESTBOUND ACCESSIBLE 2 Line trips TO Seattle Stadium
        customWalkLegGeometry:
          INTERNATIONAL_DISTRICT_TO_ZONE_WALK_LEG_ACCESSIBLE,
        stopAdjustments: [],
        trips: [
          {
            accessible: true,
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
                  'eqoaHtdsiV_FAi@B_@FQFQF_@R]X[\\OTQZsEhI]f@YZoE|DIH??w@j@',
                  'eqoaHndsiVcB?s@@gA@i@B_@FQFQF_@R]X[\\OTQZsEhI]f@YZoE|DIH??w@j@'
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
                pointsToAdd: 'knpaHx{siV',
                pointsToCut: [
                  'wjnaHj_siVuA?g@Be@H[JcBj@o@PsGfBc@H_@D]@]?YC{@Gc@A]?}ADQ?IAKCk@UKAOA_C???_FAi@B_@FQFQF_@R]X[\\OTQZsEhI]f@YZoE|D'
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
        // NORTHBOUND ACCESSIBLE 1 & 2 Line trips FROM Seattle Stadium
        customWalkLegGeometry:
          ZONE_TO_INTERNATIONAL_DISTRICT_WALK_LEG_ACCESSIBLE,
        stopAdjustments: [
          {
            adjustment: {
              duration: -120,
              endTime: -180000,
              intermediateStopsToRemove: 1,
              legGeometry: {
                length: -24,
                pointsToAdd: 'eqoaHtdsiV',
                pointsToCut: [
                  'wjnaHj_siVuA?g@Be@H[JcBj@o@PsGfBc@H_@D]@]?YC{@Gc@A]?}ADQ?IAKCk@UKAOA_C???'
                ]
              },
              newStop: STOPS.INTERNATIONAL_DISTRICT_CHINATOWN
            },
            originalStop: 'Stadium'
          }
        ],
        trips: [
          {
            accessible: true,
            headsigns: ['Lynnwood City Center'],
            route: '1 Line'
          },
          {
            accessible: true,
            headsigns: ['Lynnwood City Center'],
            route: '2 Line'
          }
        ]
      },
      {
        // SOUTHBOUND 1 Line trips FROM Seattle Stadium
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
      },
      {
        // SOUTHBOUND ACCESSIBLE 1 Line trips FROM Seattle Stadium
        customWalkLegGeometry:
          ZONE_TO_INTERNATIONAL_DISTRICT_WALK_LEG_ACCESSIBLE,
        stopAdjustments: [
          {
            adjustment: {
              duration: 120,
              endTime: 120000,
              intermediateStopsToRemove: 1,
              legGeometry: {
                length: 24,
                pointsToAdd:
                  '??uA?g@Be@H[JcBj@o@PsGfBc@H_@D]@]?YC{@Gc@A]?}ADQ?IAKCk@UKAOA_C?',
                pointsToCut: []
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
        // EASTBOUND 2 Line trips FROM Seattle Stadium
        customWalkLegGeometry: ZONE_TO_INTERNATIONAL_DISTRICT_WALK_LEG,
        stopAdjustments: [],
        trips: [
          {
            accessible: false,
            headsigns: ['Downtown Redmond'],
            route: '2 Line'
          }
        ]
      },
      {
        // EASTBOUND ACCESSIBLE 2 Line trips FROM Seattle Stadium
        customWalkLegGeometry:
          ZONE_TO_INTERNATIONAL_DISTRICT_WALK_LEG_ACCESSIBLE,
        stopAdjustments: [],
        trips: [
          {
            accessible: true,
            headsigns: ['Downtown Redmond'],
            route: '2 Line'
          }
        ]
      }
    ],
    times: [
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

const isInBBox = (lat: number, lon: number, bbox: BoundingBox) => {
  const { maxLat, maxLon, minLat, minLon } = bbox
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
    const sliceStart =
      type === 'destination' ? 0 : adjustment.intermediateStopsToRemove

    const sliceEnd =
      type === 'destination'
        ? -1 * adjustment.intermediateStopsToRemove
        : undefined

    updatedLeg.intermediateStops = leg.intermediateStops.slice(
      sliceStart,
      sliceEnd
    )

    updatedLeg.stopCalls = leg.stopCalls?.slice(sliceStart, sliceEnd)
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

const updateLegIdWithNewStop = (
  leg: Leg,
  adjustment: StopAdjustment
): string | undefined => {
  const oldLegId = leg.id
  const oldStopCode = leg.to.stop?.gtfsId
  const newStopCode = adjustment.newStop.gtfsId
  if (oldLegId && oldStopCode) {
    try {
      const bytes = Uint8Array.fromBase64(oldLegId, {
        alphabet: 'base64url'
      })
      const decoded = new TextDecoder().decode(bytes)
      const updatedDecoded = decoded.replace(oldStopCode, newStopCode)
      const duplicateCheck = updatedDecoded.indexOf(oldStopCode)
      if (duplicateCheck !== -1) {
        console.warn('leg ID contains duplicate stop codes')
        return oldLegId
      }
      const updatedEncoded = new TextEncoder().encode(updatedDecoded)
      return updatedEncoded.toBase64()
    } catch (error) {
      console.warn('error updating leg ID with new stop', error)
    }
  }
  return oldLegId
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
          const newLegId = updateLegIdWithNewStop(leg, adjustment)
          updatedLeg.id = newLegId
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
          const newLegId = updateLegIdWithNewStop(leg, adjustment)
          updatedLeg.id = newLegId
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
  const updatedItineraries = clone(itineraries)
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
      // if the trip starts in a custom zone, we should delete any itineraries that contain a micromobility leg
      // that occurs before a transit leg
      let micromobilityLegFound = false
      for (let j = 0; j < itin.legs.length; j++) {
        const leg = itin.legs[j]
        if (leg.rentedBike || leg.rentedVehicle) micromobilityLegFound = true
        if (leg.transitLeg && micromobilityLegFound) {
          indicesToRemove.add(i)
          break
        }
      }
      if (indicesToRemove.has(i)) continue

      // apply rule stop adjustments (if applicable) to the first transit leg, first stop
      const adjustment = originStopAdjustmentRule.stopAdjustments.find(
        (adj) => adj.originalStop === firstTransitLeg?.from?.name
      )?.adjustment
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
      // if the trip ends in a custom zone, we should delete any itineraries that contain a micromobility leg
      // that occurs after a transit leg
      let transitLegFound = false
      for (let j = 0; j < itin.legs.length; j++) {
        const leg = itin.legs[j]
        if (leg.transitLeg) transitLegFound = true
        if ((leg.rentedBike || leg.rentedVehicle) && transitLegFound) {
          indicesToRemove.add(i)
          break
        }
      }
      if (indicesToRemove.has(i)) continue

      // apply rule stop adjustments (if applicable) to the last transit leg, last stop
      const adjustment = destinationStopAdjustmentRule.stopAdjustments.find(
        (adj) => adj.originalStop === lastTransitLeg?.to?.name
      )?.adjustment
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
