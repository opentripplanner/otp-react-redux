import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'

import { setMainPanelContent, setViewedTrip } from '../../actions/ui'

class ViewTripButton extends Component {
  static propTypes = {
    fromIndex: PropTypes.number,
    text: PropTypes.element,
    toIndex: PropTypes.number,
    tripId: PropTypes.string
  }

  _onClick = () => {
    this.props.setMainPanelContent(null)
    this.props.setViewedTrip({
      fromIndex: this.props.fromIndex,
      toIndex: this.props.toIndex,
      tripId: this.props.tripId
    })
  }

  render () {
    return (
      <Button
        bsSize='xsmall'
        className='view-trip-button'
        onClick={this._onClick}
      >
        {this.props.text || <FormattedMessage id='components.TripViewer.header' />}
      </Button>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return { }
}

const mapDispatchToProps = {
  setMainPanelContent,
  setViewedTrip
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewTripButton)
