import PropTypes from 'prop-types'
import React from 'react'
import { Checkbox, ControlLabel, FormGroup } from 'react-bootstrap'

/**
 * User terms of use pane.
 */
const TermsOfUsePane = ({
  disableCheckTerms,
  handleBlur,
  handleChange,
  values: userData
}) => {
  const {
    hasConsentedToTerms,
    storeTripHistory
  } = userData

  return (
    <div>
      <ControlLabel>You must agree to the terms of service to continue.</ControlLabel>

      <FormGroup>
        <Checkbox
          checked={hasConsentedToTerms}
          disabled={disableCheckTerms}
          name='hasConsentedToTerms'
          onBlur={disableCheckTerms ? null : handleBlur}
          onChange={disableCheckTerms ? null : handleChange}
        >
          {/* TODO: Implement the link */}
            I have read and consent to the <a href='/#/terms-of-service'>Terms of Service</a> for using the Trip Planner.
        </Checkbox>
      </FormGroup>

      <FormGroup>
        <Checkbox
          checked={storeTripHistory}
          name='storeTripHistory'
          onBlur={handleBlur}
          onChange={handleChange}
        >
          {/* TODO: Implement the link */}
            Optional: I consent to the Trip Planner storing my historical planned trips in order to
            improve transit services in my area. <a href='/#/terms-of-storage'>More info...</a>
        </Checkbox>
      </FormGroup>
    </div>
  )
}

TermsOfUsePane.propTypes = {
  disableCheckTerms: PropTypes.bool,
  handleBlur: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  values: PropTypes.object.isRequired
}

TermsOfUsePane.defaultProps = {
  disableCheckTerms: false
}

export default TermsOfUsePane
