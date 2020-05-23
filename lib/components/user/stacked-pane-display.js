import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

import FormNavigationButtons from './form-navigation-buttons'

// Styles.
// TODO: Improve layout.
const PaneContainer = styled.div`
  border-bottom: 1px solid #c0c0c0;
  > h3 {
    margin-top: 0.5em;
  }
  > div {
    margin-left: 10%;
  }
`

/**
 * This component handles the flow between screens for new OTP user accounts.
 */
const StackedPaneDisplay = ({ onCancel, onComplete, paneSequence }) => (
  <>
    <h1>My Account</h1>
    {
      paneSequence.map(({ pane: Pane, props, title }, index) => (
        <PaneContainer key={index}>
          <h3>{title}</h3>
          <div><Pane {...props} /></div>
        </PaneContainer>
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
