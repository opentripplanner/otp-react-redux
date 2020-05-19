import PropTypes from 'prop-types'
import React from 'react'
import { Checkbox, ControlLabel, FormGroup } from 'react-bootstrap'

const TermsOfUsePane = ({
  checkHistory,
  checkTerms,
  disableCheckTerms,
  onCheckHistoryChange,
  onCheckTermsChange
}) => (
  <div>
    <ControlLabel>You must agree to the terms of service to continue.</ControlLabel>

    <FormGroup>
      <Checkbox
        checked={checkTerms}
        disabled={disableCheckTerms}
        onChange={disableCheckTerms ? null : onCheckTermsChange}
      >
          I have read and consent to the <a href='/#/terms-of-service'>Terms of Service</a> for using the Trip Planner.
      </Checkbox>
    </FormGroup>

    <FormGroup>
      <Checkbox
        checked={checkHistory}
        onChange={onCheckHistoryChange}
      >
          Optional: I consent to the Trip Planner storing my historical planned trips in order to
          improve transit services in my area. <a href='/#/terms-of-storage'>More info...</a>
      </Checkbox>
    </FormGroup>
  </div>
)

TermsOfUsePane.propTypes = {
  /** Whether the checkbox for trip history should be checked. */
  checkHistory: PropTypes.bool.isRequired,
  /** Whether the checkbox for terms should be checked. */
  checkTerms: PropTypes.bool.isRequired,
  /** Whether the checkbox for terms should be disabled. */
  disableCheckTerms: PropTypes.bool.isRequired,
  /** Triggered when the checkbox for trip history is clicked. */
  onCheckHistoryChange: PropTypes.func.isRequired,
  /** Triggered when the checkbox for terms is clicked. */
  onCheckTermsChange: PropTypes.func.isRequired
}

export default TermsOfUsePane
