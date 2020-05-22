import PropTypes from 'prop-types'
import React from 'react'
import { Button, FormGroup } from 'react-bootstrap'

/**
 * The button bar at the bottom of the account screen.
 */
const FormNavigationButtons = ({
  backButton,
  okayButton
}) => (
  <FormGroup style={{padding: '20px 0px'}}>
    <nav aria-label='...'>
      {backButton && (
        <Button
          disabled={backButton.disabled}
          onClick={backButton.onClick}
          style={{float: 'left'}}
        >
          {backButton.text}
        </Button>
      )}
      {okayButton && (
        <Button
          bsStyle='primary'
          disabled={okayButton.disabled}
          onClick={okayButton.onClick}
          style={{float: 'right'}}
        >
          {okayButton.text}
        </Button>
      )}
    </nav>
  </FormGroup>
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
