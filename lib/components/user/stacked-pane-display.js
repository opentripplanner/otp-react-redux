import PropTypes from 'prop-types'
import React from 'react'

import FormNavigationButtons from './form-navigation-buttons'

/**
 * This component handles the flow between screens for new OTP user accounts.
 */
const StackedPaneDisplay = ({ onCancel, onComplete, paneSequence }) => (
  <>
    <h1>My Account</h1>
    {
      paneSequence.map(({ pane: Pane, props, title }, index) => (
        <div key={index} style={{borderBottom: '1px solid #c0c0c0'}}>
          <h3 style={{marginTop: '0.5em'}}>{title}</h3>
          <div style={{marginLeft: '10%'}}>
            <Pane {...props} />
          </div>
        </div>
      ))
    }

    <FormNavigationButtons
      backButton={{
        onClick: onCancel,
        text: 'Cancel'
      }}
      okayButton={{
        onClick: onComplete,
        text: 'Save Preferences'
      }}
    />
  </>
)

StackedPaneDisplay.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
  paneSequence: PropTypes.array.isRequired
}

export default StackedPaneDisplay
