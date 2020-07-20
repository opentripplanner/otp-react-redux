import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Checkbox, ControlLabel, FormGroup } from 'react-bootstrap'

/**
 * User terms of use pane.
 */
class TermsOfUsePane extends Component {
  static propTypes = {
    disableCheckTerms: PropTypes.bool,
    onUserDataChange: PropTypes.func.isRequired,
    userData: PropTypes.object.isRequired
  }

  _handleCheckHistoryChange = e => {
    const { onUserDataChange } = this.props
    onUserDataChange({ storeTripHistory: e.target.checked })
  }

  _handleCheckTermsChange = e => {
    const { onUserDataChange } = this.props
    onUserDataChange({ hasConsentedToTerms: e.target.checked })
  }

  render () {
    const { disableCheckTerms, userData } = this.props
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
            onChange={disableCheckTerms ? null : this._handleCheckTermsChange}
          >
            {/* TODO: Implement the link */}
            I have read and consent to the <a href='/#/terms-of-service'>Terms of Service</a> for using the Trip Planner.
          </Checkbox>
        </FormGroup>

        <FormGroup>
          <Checkbox
            checked={storeTripHistory}
            onChange={this._handleCheckHistoryChange}
          >
            {/* TODO: Implement the link */}
            Optional: I consent to the Trip Planner storing my historical planned trips in order to
            improve transit services in my area. <a href='/#/terms-of-storage'>More info...</a>
          </Checkbox>
        </FormGroup>
      </div>
    )
  }
}

export default TermsOfUsePane
