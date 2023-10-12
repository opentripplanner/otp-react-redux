import { AppConfig } from './config-types'

export interface OtpState {
  config: AppConfig
  // TODO: Add other OTP states
  ui: any // TODO
}

export interface AppReduxState {
  calltaker?: any // TODO
  otp: OtpState
  user: any // TODO
}
