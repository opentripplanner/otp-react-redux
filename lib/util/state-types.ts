import { RouterState } from 'connected-react-router'

import {
  ItineraryExistence,
  MonitoredTrip,
  User
} from '../components/user/types'
import { Leg, Location, ModeSetting } from '@opentripplanner/types'

import { AppConfig, PopupTargetConfig } from './config-types'

export type NearbyFilterKey =
  | 'Stop'
  | 'RentalVehicle'
  | 'VehicleParking'
  | 'BikeRentalStation'
export type NearbyFilters = Record<NearbyFilterKey, boolean>

export type LatLonObj = { lat: number; lon: number }

export interface OtpState {
  // TODO: Add other OTP states
  activeSearchId?: string
  config: AppConfig
  currentQuery: any
  filter: FilterType
  location: any
  modeSettingDefinitions: ModeSetting[]
  overlay: any
  serviceTimeRange?: {
    end: number
    start: number
  }
  transitIndex: any
  // TODO: Finish ui typing
  ui: {
    diagramLeg: Leg
    errors: any
    highlightedLocation: Location | null
    highlightedStop: any
    locale: string
    localizedMessages: any
    mainPanelContent: number
    mobileScreen: number
    nearbyView: {
      filters: NearbyFilters
    }
    nearbyViewCoords: LatLonObj
    popup: PopupTargetConfig
    printView: boolean
    routeViewer: any
    viewedRoute: {
      patternId: string
      routeId: string
    }
    viewedStop?: any
  }
}

export interface SortType {
  direction: string
  type: string
}

export interface FilterType {
  sort: SortType
}

export interface UserState {
  itineraryExistence?: ItineraryExistence
  localUser?: any
  loggedInUser: User
  loggedInUserMonitoredTrips?: MonitoredTrip[]
  // TODO: Add other user states.
}

export interface AppReduxState {
  calltaker?: any // TODO
  otp: OtpState
  router: RouterState
  user: UserState
}
