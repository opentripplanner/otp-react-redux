import { hot } from 'react-hot-loader/root'
import React from 'react'

// import OTP-RR components
import { ResponsiveWebapp } from './index'

// Loads a yaml config file which is set in the webpack.config.js file. This
// setting is defined from a custom environment setting passed into webpack or
// defaults to ./config.yml
const otpConfig = require(YAML_CONFIG)

// Loads a JavaScript file which is set in the webpack.config.js file. This
// setting is defined from a custom environment setting passed into webpack or
// defaults to ./config.js
const jsConfig = require(JS_CONFIG).configure(otpConfig)

const {
  ItineraryBody,
  LegIcon,
  MainPanel,
  MobileResultsScreen,
  MobileSearchScreen,
  ModeIcon
} = jsConfig

const requiredComponents = {
  ItineraryBody,
  LegIcon,
  MainPanel,
  MobileResultsScreen,
  MobileSearchScreen,
  ModeIcon
}
const missingComponents = Object.keys(requiredComponents).filter(
  (key) => !requiredComponents[key]
)

// Check that the required components are defined in the configuration.
if (missingComponents.length > 0) {
  throw new Error(
    `The following required components are missing from config.js: ${missingComponents.join(
      ', '
    )}`
  )
}

const Webapp = () => <ResponsiveWebapp components={jsConfig} />

export default hot(Webapp)
