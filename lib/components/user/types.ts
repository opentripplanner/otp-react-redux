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
  mobilityMode: string
  visionLimitation: VisionLimitation
}

export interface CompanionInfo {
  acceptKey?: string
  email: string
  nickname?: string
  status?: 'PENDING' | 'CONFIRMED' | 'INVALID'
}

export interface DependentInfo {
  email: string
  mobilityMode: string
  name?: string
  userId: string
}

/**
 * Type definition for an OTP-middleware (OTP-personas) user.
 */
export interface User {
  accessibilityRoutingByDefault?: boolean
  dependents?: string[]
  dependentsInfo?: DependentInfo[]
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
  relatedUsers?: CompanionInfo[]
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

export interface JourneyState {
  matchingItinerary?: Itinerary
}

export type MonitoredTrip = Record<DaysOfWeek, boolean> & {
  arrivalVarianceMinutesThreshold: number
  companion?: CompanionInfo
  departureVarianceMinutesThreshold: number
  excludeFederalHolidays?: boolean
  id: string
  isActive: boolean
  itinerary: Itinerary
  itineraryExistence?: ItineraryExistence
  journeyState?: JourneyState
  leadTimeInMinutes: number
  observers?: CompanionInfo[]
  otp2QueryParams: Record<string, unknown>
  primary?: DependentInfo
  queryParams: Record<string, unknown>
  secondary?: CompanionInfo
  tripName: string
  userId: string
}

export interface MonitoredTripProps {
  from?: Place
  handleTogglePauseMonitoring?: () => void
  isReadOnly?: boolean
  monitoredTrip: MonitoredTrip
  pendingRequest?: boolean | string
  to?: Place
}

export interface MonitoredTripRenderData {
  bodyText: React.ReactNode
  headingText: React.ReactNode
  shouldRenderAlerts: boolean
}
