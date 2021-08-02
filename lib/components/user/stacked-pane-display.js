import PropTypes from 'prop-types'
import React, {useState} from 'react'
import { FormattedMessage } from 'react-intl'

import FormNavigationButtons from './form-navigation-buttons'
import { PageHeading, StackedPaneContainer } from './styled'

/**
 * This component handles the flow between screens for new OTP user accounts.
 */
const StackedPaneDisplay = ({ onCancel, paneSequence, title }) => {
  // Create indicator of if cancel button was clicked so that child components can know
  const [isBeingCanceled, updateBeingCanceled] = useState(false)

  return (
    <>
      {title && <PageHeading>{title}</PageHeading>}
      {paneSequence.map(({ pane: Pane, props, title }, index) => (
        <StackedPaneContainer key={index}>
          <h3>{title}</h3>
          <div>
            <Pane canceled={isBeingCanceled} {...props} />
          </div>
        </StackedPaneContainer>
      ))}

      <FormNavigationButtons
        backButton={{
          onClick: () => {
            updateBeingCanceled(true)
            onCancel()
          },
          text: <FormattedMessage id='components.StackedPaneDisplay.cancel' />
        }}
        okayButton={{
          text: <FormattedMessage id='components.StackedPaneDisplay.save' />,
          type: 'submit'
        }}
      />
    </>
  )
}

StackedPaneDisplay.propTypes = {
  onCancel: PropTypes.func.isRequired,
  paneSequence: PropTypes.array.isRequired
}

export default StackedPaneDisplay
