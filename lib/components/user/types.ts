import { Itinerary } from '@opentripplanner/types'

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
  notificationChannel?: string
  phoneNumber?: string
  pushDevices?: number
  savedLocations?: UserSavedLocation[]
  storeTripHistory?: boolean
}

export type EditedUser = Omit<User, 'notificationChannel'> & {
  notificationChannel: string[]
}

export const ALL_DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
] as const

export type DaysOfWeek = typeof ALL_DAYS[number]

export interface ItineraryExistenceDay {
  valid: boolean
}

export type ItineraryExistence = Record<DaysOfWeek, ItineraryExistenceDay>

export interface MonitoredTrip extends Record<DaysOfWeek, boolean> {
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
