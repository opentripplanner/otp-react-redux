import PropTypes from 'prop-types'
import React from 'react'
import { Button, FormGroup } from 'react-bootstrap'
import styled from 'styled-components'

// Styles
const StyledFormGroup = styled(FormGroup)`
  padding: 20px 0px;
`
const LeftButton = styled(Button)`
  float: left;
`
const RightButton = styled(Button)`
  float: right;
`

/**
 * The button bar at the bottom of the account screen.
 */
const FormNavigationButtons = ({
  backButton,
  okayButton
}) => (
  <StyledFormGroup>
    <nav aria-label='...'>
      {backButton && (
        <LeftButton
          disabled={backButton.disabled}
          onClick={backButton.onClick}
        >
          {backButton.text}
        </LeftButton>
      )}
      {okayButton && (
        <RightButton
          bsStyle='primary'
          disabled={okayButton.disabled}
          onClick={okayButton.onClick}
        >
          {okayButton.text}
        </RightButton>
      )}
    </nav>
  </StyledFormGroup>
)

const buttonType = PropTypes.shape({
  disabled: PropTypes.bool,
  /** Triggered when the button is clicked. */
  onClick: PropTypes.func.isRequired,
  /** The text to display on the button. */
  text: PropTypes.string
})

FormNavigationButtons.propTypes = {
  /** Information about the back button. */
  backButton: buttonType,
  /** Information about the okay (action) button. */
  okayButton: buttonType
}

FormNavigationButtons.defaultProps = {
  backButton: null,
  okayButton: null
}

export default FormNavigationButtons
