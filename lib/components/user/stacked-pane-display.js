import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import React, { useState } from 'react'

import { PageHeading, StackedPaneContainer } from './styled'
import FormNavigationButtons from './form-navigation-buttons'

/**
 * This component handles the flow between screens for new OTP user accounts.
 *
 * TODO: add types once Pane type exists
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
const StackedPaneDisplay = ({ onCancel, paneSequence, title }) => {
  // Create indicator of if cancel button was clicked so that child components can know
  const [isBeingCanceled, updateBeingCanceled] = useState(false)

  return (
    <>
      {title && <PageHeading>{title}</PageHeading>}
      {paneSequence.map(
        ({ hidden, pane: Pane, props, title }, index) =>
          !hidden && (
            <StackedPaneContainer key={index}>
              <h3>{title}</h3>
              <div>
                <Pane canceled={isBeingCanceled} {...props} />
              </div>
            </StackedPaneContainer>
          )
      )}

      <FormNavigationButtons
        backButton={{
          onClick: () => {
            updateBeingCanceled(true)
            onCancel()
          },
          text: <FormattedMessage id="common.forms.cancel" />
        }}
        okayButton={{
          text: (
            <FormattedMessage id="components.StackedPaneDisplay.savePreferences" />
          ),
          type: 'submit'
        }}
      />
    </>
  )
}

StackedPaneDisplay.propTypes = {
  onCancel: PropTypes.func.isRequired,
  paneSequence: PropTypes.array.isRequired,
  title: PropTypes.string
}

export default StackedPaneDisplay
