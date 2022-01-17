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
import { CN, ES, FR, KR, US, VN } from 'country-flag-icons/react/3x2'
import React from 'react'

import {
  DefaultMainPanel,
  LineItinerary,
  MobileResultsScreen,
  MobileSearchScreen
} from './index'

/**
 * Renders flag icons for supported languages
 */
// import appropriate flags from flag icon library
// using emojis would be a simpler solution, but they are not available on Windows

const ItineraryBody = LineItinerary
const LegIcon = ClassicLegIcon
const ModeIcon = ClassicModeIcon
/**
 * Renders additional information below itinerary details.
 */
const ItineraryFooter = () => <div />
export const FLAG_ICON_MAPPING = {
  'en-US': <US style={{ width: 15 }} />,
  'es-ES': <ES style={{ width: 15 }} />,
  'fr-FR': <FR style={{ width: 15 }} />,
  'ko-KR': <KR style={{ width: 15 }} />,
  'vi-VN': <VN style={{ width: 15 }} />,
  'zh-CN': <CN style={{ width: 15 }} />
}

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
    MainPanel: DefaultMainPanel,
    MobileResultsScreen,
    MobileSearchScreen,
    ModeIcon
  }
}
