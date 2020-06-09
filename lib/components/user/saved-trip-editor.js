import React, { Component } from 'react'
import { Button, Col, Nav, NavItem, Row } from 'react-bootstrap'

import StackedPaneDisplay from './stacked-pane-display'

/**
 * This component handles editing saved trips.
 */
class SavedTripEditor extends Component {
  _handleMonitoredTripSelect = selectedKey => {
    const { onMonitoredTripSelect, trips } = this.props
    if (onMonitoredTripSelect) onMonitoredTripSelect(trips[selectedKey])
  }

  render () {
    const { monitoredTrip, onCancel, onComplete, onDeleteTrip, panes, trips } = this.props
    const paneSequence = monitoredTrip
      ? [
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
          pane: () => <Button bsStyle='danger' onClick={onDeleteTrip}>Delete Trip</Button>,
          title: 'Danger zone'
        }
      ]
      : [
        {
          pane: () => (
            <div>Add trips from the map.</div>
          ),
          title: 'You have no saved trips.'
        }
      ]

    return (
      <>
        <h1>My saved trips</h1>

        <Row className='clearfix'>
          <Col sm={4}>
            <Nav activeKey={trips.indexOf(monitoredTrip)} bsStyle='pills' onSelect={this._handleMonitoredTripSelect} stacked>
              {trips.map((trip, index) => (
                <NavItem eventKey={index} key={index}>{trip.tripName}</NavItem>
              ))}
            </Nav>
          </Col>
          <Col sm={8}>
            <StackedPaneDisplay
              onCancel={onCancel}
              onComplete={onComplete}
              paneSequence={paneSequence}
            />
          </Col>
        </Row>
      </>
    )
  }
}

export default SavedTripEditor
