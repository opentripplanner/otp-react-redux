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
  preferredLocale?: string
  pushDevices?: number
  savedLocations?: UserSavedLocation[]
  storeTripHistory?: boolean
}

export type EditedUser = Omit<User, 'notificationChannel'> & {
  notificationChannel: string[]
}
