import React, { Component, PropTypes } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import { routingQuery } from '../../actions/api'
import { setMainPanelContent } from '../../actions/ui'
import { isMobile } from '../../util/ui'

class PlanTripButton extends Component {
  static propTypes = {
    routingType: PropTypes.string,
    text: PropTypes.string,
    onClick: PropTypes.func,
    planTrip: PropTypes.func,
    profileTrip: PropTypes.func
  }

  _onClick = () => {
    this.props.routingQuery()
    if (typeof this.props.onClick === 'function') this.props.onClick()
    if (!isMobile()) this.props.setMainPanelContent(null)
  }

  render () {
    const { currentQuery, text } = this.props
    const disabled = this.props.disabled === undefined
      ? !currentQuery.from || !currentQuery.to
      : this.props.disabled

    return (
      <Button
        className='plan-trip-button'
        disabled={disabled}
        onClick={this._onClick}
      >{text || 'Plan Trip'}</Button>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return { currentQuery: state.otp.currentQuery }
}

const mapDispatchToProps = { routingQuery, setMainPanelContent }

export default connect(mapStateToProps, mapDispatchToProps)(PlanTripButton)
