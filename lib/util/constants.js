export const AUTH0_AUDIENCE = 'https://otp-middleware'
export const AUTH0_SCOPE = ''
export const DEFAULT_APP_TITLE = 'OpenTripPlanner'
export const PERSISTENCE_STRATEGY_OTP_MIDDLEWARE = 'otp_middleware'

// Gets the root URL, e.g. https://otp-instance.example.com:8080, computed once for all.
// TODO: support root URLs that involve paths or subfolders, as in https://otp-ui.example.com/path-to-ui/
export const URL_ROOT = `${window.location.protocol}//${window.location.host}`
