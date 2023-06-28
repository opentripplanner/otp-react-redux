/* eslint-disable react/prop-types */
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import coreUtils from '@opentripplanner/core-utils'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import { routingQuery } from '../../actions/api'
import { setMainPanelContent } from '../../actions/ui'

class PlanTripButton extends Component {
  static propTypes = {
    onClick: PropTypes.func,
    planTrip: PropTypes.func,
    profileTrip: PropTypes.func,
    routingType: PropTypes.string,
    text: PropTypes.string
  }

  static defaultProps = {
    disabled: false
  }

  _onClick = () => {
    this.props.routingQuery()
    if (typeof this.props.onClick === 'function') this.props.onClick()
    if (!coreUtils.ui.isMobile()) this.props.setMainPanelContent(null)
  }

  render() {
    const { currentQuery, text } = this.props
    const locationMissing = !currentQuery.from || !currentQuery.to
    const disabled = locationMissing || this.props.disabled
    return (
      <Button
        className="plan-trip-button"
        disabled={disabled}
        onClick={this._onClick}
      >
        {text || <FormattedMessage id="components.PlanTripButton.planTrip" />}
      </Button>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return { currentQuery: state.otp.currentQuery }
}

const mapDispatchToProps = { routingQuery, setMainPanelContent }

export default connect(mapStateToProps, mapDispatchToProps)(PlanTripButton)
