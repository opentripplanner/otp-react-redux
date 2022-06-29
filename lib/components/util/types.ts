// TYPESCRIPT TODO: move this to a larger shared types file, preferably within otp-ui
export interface StopData {
  bikeRental: BikeRental
  fetchStatus: number
  id: string
  lat: number
  locationType: number
  lon: number
  name: string
  nearbyStops: string[]
  parkAndRideLocations: any[]
  routes: Route[]
  stopTimes: StopTime[]
  stopTimesLastUpdated: number
  vehicleRental: VehicleRental
  vehicleType: number
  vehicleTypeSet: boolean
  wheelchairBoarding: number
}

export interface BikeRental {
  stations: any[]
}

export interface Route {
  agencyId: string
  agencyName: string
  id: string
  longName: string
  mode: string
  sortOrder: number
}

// FIXME: incomplete
export interface StopTime {
  departureDelay: number
  headsign: string
  pattern: Pattern
  realtimeDeparture: boolean
  realtimeState: string
  times: Time[]
}

export interface Pattern {
  desc: string
  headsign: string
  id: string
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

export interface VehicleRental {
  errorsByNetwork: { [key: string]: { message?: string; severity?: string } }
  systemInformationDataByNetwork: {
    [key: string]: { message?: string; severity?: string }
  }
}
