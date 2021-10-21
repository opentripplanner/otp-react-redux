import PropTypes from 'prop-types'
import React from 'react'
import { Button, FormGroup } from 'react-bootstrap'
import { injectIntl } from 'react-intl'
import styled from 'styled-components'

// Styles
const StyledFormGroup = styled(FormGroup)`
  padding: 20px 0px;
  margin-bottom: 100px
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
  intl,
  okayButton
}) => (
  <StyledFormGroup>
    <nav aria-label={intl.formatMessage({id: 'components.FormNavigationButtons.ariaLabel'})}>
      {backButton && (
        <LeftButton
          disabled={backButton.disabled}
          onClick={backButton.onClick}
          type='button'
        >
          {backButton.text}
        </LeftButton>
      )}
      {okayButton && (
        <RightButton
          bsStyle='primary'
          disabled={okayButton.disabled}
          onClick={okayButton.onClick}
          type={okayButton.type || 'button'}
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
  onClick: PropTypes.func,
  /** The text to display on the button (JSX elements accepted). */
  text: PropTypes.element,
  /** The HTML type of the button ('button', 'reset', 'submit'). */
  type: PropTypes.string
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

export default injectIntl(FormNavigationButtons)
