'use client'

import { applyMiddleware, combineReducers, compose, createStore } from 'redux'
import {
  BatchResultsScreen,
  BatchRoutingPanel,
  BatchSearchScreen,
  createCallTakerReducer,
  createOtpReducer,
  createUserReducer,
  DefaultItinerary
} from 'lib'
import { Briefcase } from '@styled-icons/fa-solid/Briefcase'
import { Clock } from '@styled-icons/fa-regular/Clock'
import { Config } from '@opentripplanner/types'
import { connectRouter, routerMiddleware } from 'connected-react-router'
import { createHashHistory } from 'history'
import { ExternalLinkAlt } from '@styled-icons/fa-solid/ExternalLinkAlt'
import { Home } from '@styled-icons/fa-solid/Home'
import { MapMarker } from '@styled-icons/fa-solid/MapMarker'
import { MobileAlt } from '@styled-icons/fa-solid/MobileAlt'
import { object, string } from 'prop-types'
import { Plus } from '@styled-icons/fa-solid/Plus'
import { Provider } from 'react-redux'
import { QuestionCircle } from '@styled-icons/fa-solid/QuestionCircle'
import { ThumbsDown } from '@styled-icons/fa-solid/ThumbsDown'
import { ThumbsUp } from '@styled-icons/fa-solid/ThumbsUp'
import { Utensils } from '@styled-icons/fa-solid/Utensils'
import Bugsnag from '@bugsnag/js'
import BugsnagPluginReact from '@bugsnag/plugin-react'
import dynamic from 'next/dynamic'
import React from 'react'
import thunk from 'redux-thunk'

const otpConfig = require('../../config.yaml')
const jsConfig = require('../../lib/config.js').configure(otpConfig)

const { ModeIcon, RouteRenderer } = jsConfig

const isCallTakerModuleEnabled = !!otpConfig.datastoreUrl

const ResponsiveWebapp = dynamic(
  () => import('lib/components/app/responsive-webapp'),
  { ssr: false }
)

type Props = {
  jsConfig: any
  otpConfig: Config & { title?: string }
}

// This initializes Bugsnag based on an optional key present in the config
const bugsnagApiKey = otpConfig?.bugsnag?.key
if (bugsnagApiKey) {
  Bugsnag.start({
    apiKey: bugsnagApiKey,
    plugins: [new BugsnagPluginReact()]
  })
}
const ErrorBoundary =
  (bugsnagApiKey && Bugsnag.getPlugin('react')?.createErrorBoundary(React)) ||
  React.Fragment

const history = createHashHistory()

const middleware = [
  thunk,
  routerMiddleware(history) // for dispatching history actions
]

// set up the Redux store
const store = createStore(
  combineReducers({
    callTaker: createCallTakerReducer(otpConfig),
    otp: createOtpReducer(otpConfig),
    router: connectRouter(history),
    user: createUserReducer(otpConfig) // add optional initial query here
  }),
  compose(applyMiddleware(...middleware))
)

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

// eslint-disable-next-line complexity
const SvgIcon = ({ className, iconName, style }) => {
  // const CustomIcon = getCustomIcon && getCustomIcon(iconName)
  // if (CustomIcon) return <CustomIcon className={className} style={style} />
  // Some often used defaults
  switch (iconName) {
    // Used in mode selector for vehicle rental
    case 'mobile':
      return <MobileAlt className={className} style={style} />
    // The following three used in gradation map
    case 'thumbs-down':
      return <ThumbsDown className={className} style={style} />
    case 'question-circle':
      return <QuestionCircle className={className} style={style} />
    case 'thumbs-up':
      return <ThumbsUp className={className} style={style} />
    // The following are for middleware places
    case 'briefcase':
      return <Briefcase className={className} style={style} />
    case 'home':
      return <Home className={className} style={style} />
    case 'map-marker':
      return <MapMarker className={className} style={style} />
    case 'cutlery':
      return <Utensils className={className} style={style} />
    case 'plus':
      return <Plus className={className} style={style} />
    case 'clock-o':
      return <Clock className={className} style={style} />
    default:
      console.warn(
        `Custom icon provider not found for icon ${iconName}. Using fallback icon ExternalLinkAlt.`
      )
      return <ExternalLinkAlt className={className} style={style} />
  }
}

SvgIcon.propTypes = {
  className: string,
  iconName: string,
  style: object
}

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
    return itineraryLeg.routeShortName // null or undefined or empty string will tell transitive-js to not render a route label.
  },

  ItineraryBody: DefaultItinerary,

  MainPanel: BatchRoutingPanel,

  MapWindows: isCallTakerModuleEnabled ? jsConfig.MapWindows : null,

  MobileResultsScreen: BatchResultsScreen,

  MobileSearchScreen: BatchSearchScreen,

  ModeIcon,

  RouteRenderer,

  SvgIcon,

  TermsOfService,

  TermsOfStorage
}

export function ClientOnly({ jsConfig, otpConfig }: Props) {
  // Update title bar right away if one is supplied in config.
  if (otpConfig.title) {
    document.title = otpConfig.title
  }
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <ResponsiveWebapp components={{ ...components, ...jsConfig }} />
      </ErrorBoundary>
    </Provider>
  )
}
