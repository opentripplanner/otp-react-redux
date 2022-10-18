/**
 * To customize certain UI features, create a file like this one and specify it
 * during build/start to override this default version of the file:
 *    yarn start --env.JS_CONFIG=/path/to/config.js
 *
 * Caveats: This file cannot import the following:
 * - other files
 * - modules not installed in the node_modules of this project.
 */
import { ClassicLegIcon, ClassicModeIcon } from '@opentripplanner/icons'
import React from 'react'

import {
  BatchResultsScreen,
  BatchRoutingPanel,
  BatchSearchScreen,
  MetroItinerary
} from './index'

const ItineraryBody = MetroItinerary
const LegIcon = ClassicLegIcon
const ModeIcon = ClassicModeIcon
/**
 * Renders additional information below itinerary details.
 */
const ItineraryFooter = () => <div />

/**
 * @param  {Object} otpConfig The contents of the yml config file as json.
 * @return  This function must return an object with the following attributes.
 * All attributes are React components(*), unless noted.
 * - defaultMobileTitle (JSX markup, optional) The title bar contents.
 * - ItineraryBody (required) The component for itinerary details.
 * - ItineraryFooter (optional) The component rendered below itinerary details.
 * - LegIcon (required) An existing, imported LegIcon component
 *    from @opentripplanner/icons, but it is possible to create a custom component if desired.)
 * - MainControls (optional) Floating component over the main UI, if any.
 * - MainPanel (required) The component that renders the main (side) panel.
 * - MapWindows (optional) Floating window component over the map, if any.
 * - MobileResultsScreen (required) The component that renders the mobile search results.
 * - MobileSearchScreen (required) The component that renders the mobile search form.
 * - ModeIcon (required) An existing, imported ModeIcon component
 *    from @opentripplanner/icons, but it is possible to create a custom component if desired.)
 * - TermsOfService (required if otpConfig.persistence.strategy === 'otp_middleware')
 *    A component that renders terms of service, if any.
 * - TermsOfStorage (required if otpConfig.persistence.strategy === 'otp_middleware')
 *    A component that renders terms of storage, if any.
 *
 *   (*) Attributes that are React components can be defined using components imported,
 *   declared in the same file, or declared inline as a functional component,
 *       e.g. () => <div>{content}</div>
 */
export function configure(otpConfig) {
  return {
    ItineraryBody,
    ItineraryFooter,
    LegIcon,
    MainPanel: BatchRoutingPanel,
    MobileResultsScreen: BatchResultsScreen,
    MobileSearchScreen: BatchSearchScreen,
    ModeIcon
  }
}
