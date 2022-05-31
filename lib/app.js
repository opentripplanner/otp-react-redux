// TODO: Typescript
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import React from 'react'

// import OTP-RR components
import {
  BatchResultsScreen,
  BatchRoutingPanel,
  BatchSearchScreen,
  CallHistoryWindow,
  CallTakerControls,
  CallTakerPanel,
  DefaultItinerary,
  DefaultMainPanel,
  FieldTripWindows,
  MailablesWindow,
  otpUtils,
  ResponsiveWebapp
} from './index'

// Loads a yaml config file which is set in the webpack section of the craco.config.js file.
// This setting is defined from a custom environment setting passed into webpack or
// defaults to ./config.yml
// defined in webpack config:
// The YAML_CONFIG variable is passed to this file by webpack's `DefinePlugin` that replaces the variable
// with its content at compile time (like C's `#define` preprocessor directive).
// eslint-disable-next-line no-undef
const otpConfig = require(YAML_CONFIG)

// Loads a JavaScript file which is set in the webpack section of the craco.config.js file.
// This setting is defined from a custom environment setting passed into webpack or
// defaults to ./config.js
// defined in webpack config:
// The JS_CONFIG variable is passed to this file by webpack's `DefinePlugin` that replaces the variable
// with its content at compile time (like C's `#define` preprocessor directive).
// eslint-disable-next-line no-undef
const jsConfig = require(JS_CONFIG).configure(otpConfig)

const {
  ItineraryBody,
  LegIcon,
  MainPanel,
  MobileResultsScreen,
  MobileSearchScreen,
  ModeIcon
} = jsConfig

// Stubs for terms of service/storage for development purposes only.
// They are required if otpConfig.persistence.strategy === 'otp_middleware'
// (otherwise, a "Content not found" box will be shown).
// These components should be placed in their own files with appropriate content.
const TermsOfService = () => (
  <>
    <h1>Terms of Service</h1>
    <p>Content for terms of service.</p>
  </>
)
const TermsOfStorage = () => (
  <>
    <h1>Terms of Storage</h1>
    <p>Content for terms of storage.</p>
  </>
)
const isBatchRoutingEnabled =
  otpUtils.itinerary.isBatchRoutingEnabled(otpConfig)
const isCallTakerModuleEnabled = !!otpConfig.datastoreUrl

const components = {
  // eslint-disable-next-line sort-keys, react/display-name
  defaultMobileTitle: () => <div className="navbar-title">OpenTripPlanner</div>,

  getCustomMapOverlays: () => [],

  /**
   * Example of a custom route label provider to pass to @opentripplanner/core-utils/map#itineraryToTransitive.
   * @param {*} itineraryLeg The OTP itinerary leg for which to obtain a custom route label.
   * @returns A string with the custom label to display for the given leg, or null to render no label.
   */
  getTransitiveRouteLabel: (itineraryLeg) => {
    if (itineraryLeg.mode === 'RAIL') return 'Train'
    if (itineraryLeg.mode === 'BUS') return itineraryLeg.routeShortName
    return null // null or undefined or empty string will tell transitive-js to not render a route label.
  },

  ItineraryBody: DefaultItinerary,

  MainControls: isCallTakerModuleEnabled ? CallTakerControls : null,

  MainPanel: isCallTakerModuleEnabled
    ? CallTakerPanel
    : isBatchRoutingEnabled
    ? BatchRoutingPanel
    : DefaultMainPanel,

  MapWindows: isCallTakerModuleEnabled ? (
    <>
      <CallHistoryWindow />
      <FieldTripWindows />
      <MailablesWindow />
    </>
  ) : null,

  MobileResultsScreen: isBatchRoutingEnabled
    ? BatchResultsScreen
    : MobileResultsScreen,

  MobileSearchScreen: isBatchRoutingEnabled
    ? BatchSearchScreen
    : MobileSearchScreen,

  ModeIcon,

  TermsOfService,

  TermsOfStorage
}

const Webapp = () => (
  <ResponsiveWebapp components={{ ...components, ...jsConfig }} />
)

export default Webapp
