export const AUTH0_AUDIENCE = 'https://otp-middleware'
// This should match the value expected in otp-middleware OtpUser#AUTH0_SCOPE
export const AUTH0_SCOPE = 'otp-user'
export const DEFAULT_APP_TITLE = 'OpenTripPlanner'
export const PERSIST_TO_LOCAL_STORAGE = 'localStorage'
export const PERSIST_TO_OTP_MIDDLEWARE = 'otp_middleware'

export const FETCH_STATUS = {
  ERROR: -1,
  FETCHED: 2,
  FETCHING: 1,
  UNFETCHED: 0
}
export const ACCOUNT_PATH = '/account'
export const ACCOUNT_SETTINGS_PATH = `${ACCOUNT_PATH}/settings`
export const TRIPS_PATH = `${ACCOUNT_PATH}/trips`
export const PLACES_PATH = `${ACCOUNT_PATH}/places`
export const CREATE_ACCOUNT_PATH = `${ACCOUNT_PATH}/create`
export const CREATE_ACCOUNT_TERMS_PATH = `${CREATE_ACCOUNT_PATH}/terms`
export const CREATE_ACCOUNT_VERIFY_PATH = `${CREATE_ACCOUNT_PATH}/verify`
export const CREATE_ACCOUNT_PLACES_PATH = `${CREATE_ACCOUNT_PATH}/places`
export const CREATE_TRIP_PATH = `${TRIPS_PATH}/new`
export const TERMS_OF_SERVICE_PATH = '/terms-of-service'
export const TERMS_OF_STORAGE_PATH = '/terms-of-storage'

// Gets the root URL, e.g. https://otp-instance.example.com:8080, computed once for all.
// TODO: support root URLs that involve paths or subfolders, as in https://otp-ui.example.com/path-to-ui/
export const URL_ROOT = `${window.location.protocol}//${window.location.host}`
