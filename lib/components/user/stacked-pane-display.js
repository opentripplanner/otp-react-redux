import PropTypes from 'prop-types'
import React from 'react'
import { Button } from 'react-bootstrap'

import FormNavigationButtons from './form-navigation-buttons'
import { PageHeading, StackedPaneContainer } from './styled'

/**
 * This component handles the flow between screens for new OTP user accounts.
 */
const StackedPaneDisplay = ({ onCancel, paneSequence, title }) => (
  <>
    {title && (
      <PageHeading>
        <Button bsStyle='primary' className='pull-right' type='submit'>Save</Button>
        {title}
      </PageHeading>
    )}
    {
      paneSequence.map(({ pane: Pane, props, title }, index) => (
        <StackedPaneContainer key={index}>
          <h3>{title}</h3>
          <div><Pane {...props} /></div>
        </StackedPaneContainer>
      ))
    }

    <FormNavigationButtons
      backButton={{
        onClick: onCancel,
        text: 'Cancel'
      }}
      okayButton={{
        text: 'Save',
        type: 'submit'
      }}
    />
  </>
)

StackedPaneDisplay.propTypes = {
  onCancel: PropTypes.func.isRequired,
  paneSequence: PropTypes.array.isRequired
}

export default StackedPaneDisplay
