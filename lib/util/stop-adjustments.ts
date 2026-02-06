import { Leg } from '@opentripplanner/types'

import {
  getFirstTransitLeg,
  getLastTransitLeg,
  ItineraryWithIndex
} from './itinerary'

/* eslint-disable complexity */
export interface CustomRoutingZone {
  bbox: number[]
  destinationRoutingRules: Rule[]
  name: string
  originRoutingRules: Rule[]
}

export interface StopAdjustment {
  duration: number
  endTime: number
  intermediateStops: number
  legGeometry: {
    length: number
    pointsToAdd: string
    pointsToCut: string
  }
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

export interface Rule {
  accessibleStopToUse: string
  customWalkLegGeometry: (timeToAdjust: number) => string
  headsigns: string[]
  route: string
  stopAdjustments: { adjustment: StopAdjustment; originalStop: string }[]
}

/**
 * Note that the legGeometry.points string may contain double-escaped characters when copied from the OTP response (for example, "sdaf\\sdaf" would evaluate to "sdafsdaf").
 * These double-escaped characters need to be escaped again. So, in the example, "sdaf\\sdaf" would need to be updated to "sdaf\\\\sdaf".
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

export const soundTransitCustomRoutingZones: CustomRoutingZone[] = [
  {
    // Seattle Stadium zone
    bbox: [47.592266, 47.597533, -122.334768, -122.327691],
    destinationRoutingRules: [
      {
        // NORTHBOUND 1 Line trips TO Seattle Stadium
        accessibleStopToUse: 'CID_stop_id',
        customWalkLegGeometry: STADIUM_TO_ZONE_WALK_LEG,
        headsigns: ['Lynnwood City Center'],
        route: '1 Line',
        stopAdjustments: [
          {
            adjustment: {
              duration: -120,
              endTime: -120000,
              intermediateStops: 1,
              legGeometry: {
                length: -24,
                pointsToAdd: '',
                pointsToCut:
                  'uA?g@Be@H[JcBj@o@PsGfBc@H_@D]@]?YC{@Gc@A]?}ADQ?IAKCk@UKAOA_C?'
              },
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
        headsigns: ['Federal Way Downtown'],
        route: '1 Line',
        stopAdjustments: [
          {
            adjustment: {
              duration: -120,
              endTime: -120000,
              intermediateStops: 1,
              legGeometry: {
                length: -19,
                pointsToAdd: '',
                pointsToCut: '??p@m@X[Xc@hEyHR]NQLQLO\\W^SPIPE`@If@AjI?N@J@HB'
              },
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
        customWalkLegGeometry: () => '',
        headsigns: ['Lynnwood City Center'],
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
        headsigns: ['Lynnwood City Center'],
        route: '1 Line',
        stopAdjustments: [
          {
            adjustment: {
              duration: -120,
              endTime: -120000,
              intermediateStops: 1,
              legGeometry: {
                length: -16,
                pointsToAdd: 'unpaHb|siVw@j@',
                pointsToCut:
                  'eqoaHtdsiV_FAi@B_@FQFQF_@R]X[\\OTQZsEhI]f@YZoE|DIH??w@j@'
              },
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
        customWalkLegGeometry: ZONE_TO_STADIUM_WALK_LEG,
        headsigns: ['Federal Way Downtown'],
        route: '1 Line',
        stopAdjustments: [
          {
            adjustment: {
              duration: -180,
              endTime: -180000,
              intermediateStops: 1,
              legGeometry: {
                length: -15,
                pointsToAdd: '{gnaHj`siV',
                pointsToCut:
                  'eloaHpesiVB@f@RJBJ@xGCt@CZCZEr@MnFyA|C{@b@Gd@CpD???'
              },
              toOrFrom: {
                lat: 47.591824,
                lon: -122.327354,
                name: 'Stadium',
                stop: {
                  gtfsId: '40:99101',
                  id: 'U3RvcDo0MDo5OTEwMQ',
                  lat: 47.591824,
                  lon: -122.327354,
                  name: 'Stadium'
                },
                stopId: '40:99101'
              }
            },
            originalStop: "Int'l Dist/Chinatown"
          }
        ]
      },
      {
        // EASTBOUND 2 Line trips FROM Seattle Stadium
        accessibleStopToUse: 'CID_stop_id',
        customWalkLegGeometry: () => '',
        headsigns: ['Downtown Redmond'],
        route: '2 Line',
        stopAdjustments: []
      }
    ]
  }
]

const isInBBox = (lat: number, lon: number, bbox: number[]) => {
  const [minLat, maxLat, minLon, maxLon] = bbox
  return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon
}

const legTriggersRule = (leg?: Leg) => (rule: Rule) =>
  leg &&
  leg.headsign &&
  rule.headsigns.includes(leg.headsign) &&
  rule.route === leg.routeShortName

// if multiple zones apply, only returns rule(s) from the last one that matches
const extractRulesFromZones = (
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

  let originRule: Rule | undefined
  let destinationRule: Rule | undefined

  let originZoneName: string | undefined
  let destinationZoneName: string | undefined

  zones.forEach((zone) => {
    if (isInBBox(origin.lat, origin.lon, zone.bbox)) {
      originRule = zone.originRoutingRules.find(
        legTriggersRule(firstTransitLeg)
      )
      originZoneName = zone.name
    }

    if (isInBBox(destination.lat, destination.lon, zone.bbox)) {
      destinationRule = zone.destinationRoutingRules.find(
        legTriggersRule(lastTransitLeg)
      )
      destinationZoneName = zone.name
    }
  })

  return { destinationRule, destinationZoneName, originRule, originZoneName }
}

export const adjustItinerary = (
  adjustment: StopAdjustment,
  customWalkLegGeometry: (timeToAdjust: number) => string,
  itinerary: ItineraryWithIndex,
  type: 'destination' | 'origin',
  zoneName?: string
): ItineraryWithIndex => {
  const relevantLeg =
    type === 'destination'
      ? getLastTransitLeg(itinerary)
      : getFirstTransitLeg(itinerary)

  if (!relevantLeg) return itinerary

  const updatedItinerary = { ...itinerary }

  const sliceArgs = {
    end: type === 'destination' ? -1 * adjustment.intermediateStops : undefined,
    start: type === 'destination' ? 0 : adjustment.intermediateStops
  }

  const updatedLeg: Leg = {
    ...relevantLeg,
    duration: relevantLeg.duration + adjustment.duration,
    endTime: relevantLeg.endTime + adjustment.endTime,
    intermediateStops: relevantLeg.intermediateStops.slice(
      sliceArgs.start,
      sliceArgs.end
    ),
    legGeometry: {
      ...relevantLeg.legGeometry,
      length: relevantLeg.legGeometry.length + adjustment.legGeometry.length,
      points: relevantLeg.legGeometry.points.replace(
        adjustment.legGeometry.pointsToCut,
        adjustment.legGeometry.pointsToAdd
      )
    },
    stopCalls: relevantLeg.stopCalls?.slice(sliceArgs.start, sliceArgs.end)
  }

  // there's a better way to do this....
  if (type === 'origin') {
    updatedLeg.from = {
      ...relevantLeg.from,
      lat: adjustment.toOrFrom.lat,
      lon: adjustment.toOrFrom.lon,
      name: adjustment.toOrFrom.name,
      stop: {
        ...relevantLeg.from.stop,
        gtfsId: adjustment.toOrFrom.stop.gtfsId,
        id: adjustment.toOrFrom.stop.id,
        lat: adjustment.toOrFrom.stop.lat,
        lon: adjustment.toOrFrom.stop.lon,
        name: adjustment.toOrFrom.stop.name
      },
      stopId: adjustment.toOrFrom.stopId
    }

    for (let i = 0; i <= updatedItinerary.legs.length; i++) {
      const leg = updatedItinerary.legs[i]
      if (leg.transitLeg) {
        updatedItinerary.legs[i] = updatedLeg
        break
      }
    }

    for (let i = 0; i < updatedItinerary.legs.length; i++) {
      const leg = updatedItinerary.legs[i]
      if (leg.mode === 'WALK') {
        try {
          const obj = JSON.parse(
            customWalkLegGeometry(updatedItinerary.startTime)
          )
          updatedItinerary.legs[i] = {
            ...obj,
            from: {
              ...obj.from,
              name: zoneName || obj.from.name
            }
          }
        } catch (error) {
          console.error('unable to parse custom walk leg', error)
          updatedItinerary.legs[i] = {
            ...leg,
            from: {
              ...leg.from,
              name: zoneName || leg.from.name
            }
          }
        }
        break
      }
    }
  }

  if (type === 'destination') {
    updatedLeg.to = {
      ...relevantLeg.to,
      lat: adjustment.toOrFrom.lat,
      lon: adjustment.toOrFrom.lon,
      name: adjustment.toOrFrom.name,
      stop: {
        ...relevantLeg.to.stop,
        gtfsId: adjustment.toOrFrom.stop.gtfsId,
        id: adjustment.toOrFrom.stop.id,
        lat: adjustment.toOrFrom.stop.lat,
        lon: adjustment.toOrFrom.stop.lon,
        name: adjustment.toOrFrom.stop.name // oddly, this doesn't show up in the OTP response but is required in this type
      },
      stopId: adjustment.toOrFrom.stopId
    }

    for (let i = updatedItinerary.legs.length - 1; i >= 0; i--) {
      const leg = updatedItinerary.legs[i]
      if (leg.transitLeg) {
        updatedItinerary.legs[i] = updatedLeg
        break
      }
    }

    for (let i = updatedItinerary.legs.length - 1; i >= 0; i--) {
      const leg = updatedItinerary.legs[i]
      if (leg.mode === 'WALK') {
        try {
          const obj = JSON.parse(customWalkLegGeometry(updatedLeg.endTime))
          updatedItinerary.legs[i] = {
            ...obj,
            to: {
              ...obj.to,
              name: zoneName || obj.to.name
            }
          }
        } catch (error) {
          console.error('unable to parse custom walk leg', error)
          updatedItinerary.legs[i] = {
            ...leg,
            to: {
              ...leg.to,
              name: zoneName || leg.to.name
            }
          }
        }
        break
      }
    }
  }

  updatedItinerary.startTime = Number(updatedItinerary.legs[0].startTime)
  updatedItinerary.endTime =
    updatedItinerary.legs[updatedItinerary.legs.length - 1].endTime
  updatedItinerary.duration =
    (updatedItinerary.endTime - updatedItinerary.startTime) / 1000

  return updatedItinerary
}

export const updateItinerariesWithStopAdjustments = (
  itineraries: ItineraryWithIndex[]
): ItineraryWithIndex[] => {
  const updatedItineraries = [...itineraries]
  for (let i = 0; i < updatedItineraries.length; i++) {
    let itin = updatedItineraries[i]

    const firstTransitLeg = getFirstTransitLeg(itin)
    const lastTransitLeg = getLastTransitLeg(itin)

    const { destinationRule, destinationZoneName, originRule, originZoneName } =
      extractRulesFromZones(
        itin,
        soundTransitCustomRoutingZones,
        firstTransitLeg,
        lastTransitLeg
      )

    if (originRule) {
      // apply rule stop adjustments (if applicable) to the first transit leg, first stop
      const adjustment = originRule.stopAdjustments.find(
        (adj) => adj.originalStop === firstTransitLeg?.from?.name
      )?.adjustment
      console.log('origin adjustment', adjustment)
      if (!adjustment) continue
      const updatedItinerary = adjustItinerary(
        adjustment,
        originRule.customWalkLegGeometry,
        itin,
        'origin',
        originZoneName
      )
      itin = updatedItinerary
    }

    if (destinationRule) {
      // apply rule stop adjustments (if applicable) to the last transit leg, last stop
      const adjustment = destinationRule.stopAdjustments.find(
        (adj) => adj.originalStop === lastTransitLeg?.to?.name
      )?.adjustment
      console.log('destination adjustment', adjustment)
      if (!adjustment) continue
      const updatedItinerary = adjustItinerary(
        adjustment,
        destinationRule.customWalkLegGeometry,
        itin,
        'destination',
        destinationZoneName
      )
      itin = updatedItinerary
    }

    // note that, if both origin and destination have rules, currently only the destination rule will take effect...
    updatedItineraries[i] = itin
  }

  return updatedItineraries
}
