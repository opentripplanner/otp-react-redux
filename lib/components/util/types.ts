import {
  Agency,
  MapLocationActionArg,
  Place,
  Route,
  Stop
} from '@opentripplanner/types'
import { MapRef } from 'react-map-gl'

export interface StopTimeTrip {
  blockId?: string
  id: string
}

export interface StopTime {
  departureDelay?: number
  headsign: string
  pattern: Pattern
  realtimeDeparture?: number
  realtimeState?: string
  scheduledDeparture: number
  serviceDay: number
  times: Time[]
  trip: StopTimeTrip
}

export interface Pattern {
  desc: string
  headsign: string
  id: string
  patternGeometry?: {
    length: number
    points: string
  }
  route: Route
  stops?: Stop[]
}

export interface Time {
  arrivalDelay: number
  continuousDropOff: number
  continuousPickup: number
  departureDelay: number
  headsign: string
  realtime: boolean
  realtimeArrival: number
  realtimeDeparture: number
  realtimeState: string
  scheduledArrival: number
  scheduledDeparture: number
  serviceAreaRadius: number
  serviceDay: number
  stopCount: number
  stopId: string
  stopIndex: number
  timepoint: boolean
  tripId: string
}

export interface ViewedRouteState {
  patternId?: string
  routeId: string
}

export interface RouteVehicle {
  patternId: string
}

export interface PatternStopTime {
  pattern: Pattern
  stoptimes: StopTime[]
}

// FIXME: add to OTP-UI types
interface AgencyWithGtfsId extends Agency {
  gtfsId: string
}

// FIXME: add to OTP-UI types
interface RouteWithAgencyGtfsId extends Route {
  agency: AgencyWithGtfsId
}

export interface StopData extends Place {
  code?: string
  fetchStatus: number
  gtfsId?: string
  routes?: RouteWithAgencyGtfsId[]
  stoptimesForPatterns?: PatternStopTime[]
}

// Routes have many properties beside id, but none of these are guaranteed.
export interface ViewedRouteObject extends Route {
  patterns?: Record<string, Pattern>
  pending?: boolean
  url?: string
  vehicles?: RouteVehicle[]
}

export type SetViewedRouteHandler = (route?: ViewedRouteState) => void

export type SetViewedStopHandler = (payload: Stop | null) => void

export type SetLocationHandler = (payload: MapLocationActionArg) => void

export type ZoomToPlaceHandler = (
  map?: MapRef,
  place?: { lat: number; lon: number },
  zoom?: number
) => void
