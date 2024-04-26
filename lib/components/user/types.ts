import { Itinerary, Place } from '@opentripplanner/types'

import { DaysOfWeek } from '../../util/monitored-trip'

/**
 * A user-saved, favorite location.
 */
export interface UserSavedLocation {
  address?: string
  icon?: string
  lat?: number
  lon?: number
  name?: string
  type?: string
}

export const visionLimitations = [
  'none',
  'low-vision',
  'legally-blind'
] as const

export type VisionLimitation = typeof visionLimitations[number]

export interface MobilityProfile {
  isMobilityLimited: boolean
  mobilityDevices: string[]
  visionLimitation: VisionLimitation
}

/**
 * Type definition for an OTP-middleware (OTP-personas) user.
 */
export interface User {
  accessibilityRoutingByDefault?: boolean
  // email always exists per Auth0.
  email: string
  hasConsentedToTerms?: boolean
  id?: string
  isPhoneNumberVerified?: boolean
  mobilityProfile?: MobilityProfile
  notificationChannel?: string
  phoneNumber?: string
  preferredLocale?: string
  pushDevices?: number
  savedLocations?: UserSavedLocation[]
  storeTripHistory?: boolean
}

export type EditedUser = Omit<User, 'notificationChannel'> & {
  notificationChannel: string[]
}

export interface ItineraryExistenceDay {
  valid: boolean
}

export type ItineraryExistence = Record<DaysOfWeek, ItineraryExistenceDay>

export type MonitoredTrip = Record<DaysOfWeek, boolean> & {
  arrivalVarianceMinutesThreshold: number
  departureVarianceMinutesThreshold: number
  excludeFederalHolidays?: boolean
  id: string
  isActive: boolean
  itinerary: Itinerary
  itineraryExistence?: ItineraryExistence
  leadTimeInMinutes: number
  queryParams: string
  tripName: string
  userId: string
}

export interface MonitoredTripProps {
  from?: Place
  handleTogglePauseMonitoring?: () => void
  monitoredTrip: MonitoredTrip
  pendingRequest?: boolean | string
  to?: Place
}

export interface MonitoredTripRenderData {
  bodyText: React.ReactNode
  headingText: React.ReactNode
  shouldRenderAlerts: boolean
}
