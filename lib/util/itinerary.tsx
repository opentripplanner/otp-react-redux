import { differenceInMinutes } from 'date-fns'
import { Itinerary, Leg, Place } from '@opentripplanner/types'
import { toDate, utcToZonedTime } from 'date-fns-tz'
import coreUtils from '@opentripplanner/core-utils'
import hash from 'object-hash'
import memoize from 'lodash.memoize'

import { CO2Config } from './config-types'
import { WEEKDAYS, WEEKEND_DAYS } from './monitored-trip'

interface ItineraryStartTime {
  itinerary: Itinerary
  legs: Leg[]
  realtime: boolean
}

// FIXME: replace with OTP2 logic.
interface ItineraryWithOtp1HailedCar extends Itinerary {
  legs: (Leg & { hailedCar?: boolean })[]
}

interface OtpResponse {
  plan: {
    itineraries: Itinerary[]
  }
}

export interface ItineraryWithIndex extends Itinerary {
  index: number
}

export interface ItineraryWithCO2Info extends ItineraryWithIndex {
  co2: number
  co2VsBaseline: number
}

/**
 * Determines whether the specified Itinerary can be monitored.
 * @returns true if at least one Leg of the specified Itinerary is a transit leg,
 *   and none of the legs is a rental or ride hail leg (e.g. CAR_RENT, CAR_HAIL, BICYCLE_RENT, etc.).
 *   (We use the corresponding fields returned by OTP to get transit legs and rental/ride hail legs.)
 */
export function itineraryCanBeMonitored(
  itinerary: ItineraryWithOtp1HailedCar
): boolean {
  let hasTransit = false
  let hasRentalOrRideHail = false

  if (itinerary && itinerary.legs) {
    for (const leg of itinerary.legs) {
      if (leg.transitLeg) {
        hasTransit = true
      }
      if (
        leg.rentedBike ||
        leg.rentedCar ||
        leg.rentedVehicle ||
        leg.hailedCar
      ) {
        hasRentalOrRideHail = true
      }
    }
  }

  return hasTransit && !hasRentalOrRideHail
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
 * @returns ['monday' thru 'friday'] if itinerary happens on a weekday(*),
 *          ['saturday', 'sunday'] if itinerary happens on a saturday/sunday(*).
 * (*) For transit itineraries, the first transit leg is used to make
 * the determination. Otherwise, the itinerary startTime is used.
 */
export function getItineraryDefaultMonitoredDays(
  itinerary: Itinerary,
  timeZone = coreUtils.time.getUserTimezone()
): string[] {
  const firstTransitLeg = getFirstTransitLeg(itinerary)
  // firstTransitLeg should be non-null because only transit trips can be monitored at this time.
  // - using serviceDate covers legs that start past midnight.
  // - The format of serviceDate can either be 'yyyyMMdd' (OTP v1) or 'yyyy-MM-dd' (OTP v2)
  //   and both formats are correctly handled by toDate from date-fns-tz.
  const startDate = firstTransitLeg
    ? toDate(firstTransitLeg.serviceDate || '', { timeZone })
    : utcToZonedTime(new Date(itinerary.startTime), timeZone)

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
  other: Itinerary
): boolean {
  return (
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
// The alerts are irrelevant, but the intermediateStops, interStopGeometry and
// steps could have the legGeometry substitute as an equivalent hash value
const blackListedKeys = [
  'alerts',
  'intermediateStops',
  'interStopGeometry',
  'steps'
]
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
function addCarbonInfo(
  itin: ItineraryWithIndex,
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
export function addCarbonInfoToAll(
  itineraries: ItineraryWithIndex[],
  co2Config: CO2Config
): ItineraryWithCO2Info[] {
  const baselineCo2 = computeCarbonBaseline(itineraries, co2Config)
  return (
    itineraries?.map((itin) => addCarbonInfo(itin, co2Config, baselineCo2)) ||
    []
  )
}
