import { RouterState } from 'connected-react-router'

import {
  ItineraryExistence,
  MonitoredTrip,
  User
} from '../components/user/types'

import { AppConfig } from './config-types'

export interface OtpState {
  // TODO: Add other OTP states
  activeSearchId?: string
  config: AppConfig
  currentQuery: any // TODO
  filter: {
    sort: {
      type: string
    }
  }
  location: any
  overlay: any
  serviceTimeRange?: {
    end: number
    start: number
  }
  transitIndex: any
  // TODO: Add other OTP states
  ui: any // TODO
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
