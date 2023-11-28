import { AppConfig } from './config-types'

export interface OtpState {
  config: AppConfig
  filter: {
    sort: {
      type: string
    }
  }
  // TODO: Add other OTP states
  ui: any // TODO
}

export interface AppReduxState {
  calltaker?: any // TODO
  otp: OtpState
  user: any // TODO
}
