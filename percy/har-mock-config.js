/**
 * To customize certain UI features, create a file like this one and enter its path
 * in the jsConfigFile entry of deploy-config.yml for your deployment, e.g.:
 *    # deploy-config.yml
 *    jsConfigFile: /path/to/config.js
 *
 * Caveats: This file cannot import the following:
 * - other files
 * - modules not installed in the node_modules of this project.
 */
import { StandardLegIcon, StandardModeIcon } from '@opentripplanner/icons'
import React from 'react'

import {
  BatchResultsScreen,
  BatchRoutingPanel,
  BatchSearchScreen,
  MetroItinerary
  // Webpack sets this file to run from a subdirectory within otp-react-redux
  // ../lib points to the index file of otp-react-redux's source code
} from '../lib'

/**
 * Custom itinerary footer for this deployment.
 */
const ItineraryFooter = () => (
  <div className="disclaimer">
    <div className="link-row">
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a href="#" target="_blank">
        Terms of Use
      </a>{' '}
      • {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a href="#" target="_blank">
        Privacy Policy
      </a>
    </div>
  </div>
)

const TermsOfService = () => (
  <>
    <h1>Terms of Service</h1>
    <p>
      NO WARRANTIES: This site and its content is made available by the
      DEPARTMENT on an “as is”, “as available” basis without warranties of any
      kind, express or implied. DISCLAIMER OF LIABILITY: The user of this
      application and data assumes all responsibility and risk for the use of
      both. Under no circumstances, including negligence, shall the DEPARTMENT,
      or its employees be liable for any DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
      EXEMPLARY, or CONSEQUENTIAL DAMAGES, or LOST PROFIT that results from the
      use, misuse or inability to use the application and data. Nor shall the
      DEPARTMENT, or its employees be liable for any damages resulting from or
      related to reliance, mistakes, omissions, interruptions, deletion of
      files, computer viruses, errors defects, or any failure of performance,
      communication failure, theft, destruction or unauthorized access to the
      application and data.
    </p>
  </>
)
const TermsOfStorage = () => (
  <>
    <h1>Terms of Storage</h1>
    <p>TODO: Content for terms of storage.</p>
  </>
)

/**
 * @param  {Object} otpConfig The contents of the yml config file as json.
 * @return An object with attributes defining the components that handle various parts of the UI.
 *         See /otp/default-config.js for a complete description of these attributes.
 */
export function configure(otpConfig) {
  return {
    defaultMobileTitle: <div className={`icon-${otpConfig.branding} mobile`} />,
    ItineraryBody: MetroItinerary,
    ItineraryFooter,
    LegIcon: StandardLegIcon,
    MainPanel: BatchRoutingPanel,
    MobileResultsScreen: BatchResultsScreen,
    MobileSearchScreen: BatchSearchScreen,
    ModeIcon: StandardModeIcon,
    TermsOfService,
    TermsOfStorage
  }
}
