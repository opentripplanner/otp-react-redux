import React, { Component } from 'react'
import { Button, Col, Nav, NavItem, Row } from 'react-bootstrap'
import { connect } from 'react-redux'

import { deleteTrip, getTrips } from '../../util/middleware'

import StackedPaneDisplay from './stacked-pane-display'

/**
 * This component handles the existing account display.
 */
class SavedTripEditor extends Component {
  constructor (props) {
    super(props)

    this.state = {
      trips: []
    }
  }

  _fetchTrips = async () => {
    const { auth, persistence } = this.props
    const fetchResult = await getTrips(persistence.otp_middleware, auth.accessToken)

    if (fetchResult.status === 'success') {
      this.setState({ trips: fetchResult.data })
      if (fetchResult.data.length) {
        this._handleMonitoredTripSelect(0)
      }
    }
  }

  _handleDeleteTrip = async () => {
    if (confirm('This will delete the trip from your save trips.')) {
      const { auth, monitoredTrip, persistence } = this.props
      await deleteTrip(persistence.otp_middleware, auth.accessToken, monitoredTrip)
    }
  }

  _handleMonitoredTripSelect = selectedKey => {
    const { onMonitoredTripSelect } = this.props
    const { trips } = this.state
    if (onMonitoredTripSelect) onMonitoredTripSelect(trips[selectedKey])
  }

  async componentDidMount () {
    await this._fetchTrips()
  }

  render () {
    const { monitoredTrip, onCancel, onComplete, panes } = this.props
    const { trips } = this.state

    const paneSequence = [
      {
        pane: () => (
          <div>{monitoredTrip.queryParams}</div>
        ),
        title: monitoredTrip.tripName
      },
      {
        pane: panes.notifications,
        title: 'Trip notifications'
      },
      {
        pane: () => <Button bsStyle='danger' onClick={this._handleDeleteTrip}>Delete Trip</Button>,
        title: 'Danger zone'
      }
    ]

    return (
      <Row className='clearfix'>
        <Col sm={4}>
          <Nav bsStyle='pills' onSelect={this._handleMonitoredTripSelect} stacked>
            {trips.map((trip, index) => (
              <NavItem eventKey={index}>{trip.tripName}</NavItem>
            ))}
          </Nav>
        </Col>
        <Col sm={8}>
          <StackedPaneDisplay
            onCancel={onCancel}
            onComplete={onComplete}
            paneSequence={paneSequence}
            title='My Saved Trips'
          />
        </Col>
      </Row>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    persistence: state.otp.config.persistence
  }
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(SavedTripEditor)
