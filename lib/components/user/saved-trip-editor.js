import React, { Component } from 'react'
import { Button, ButtonGroup } from 'react-bootstrap'

import LinkButton from './link-button'
import StackedPaneDisplay from './stacked-pane-display'
import TripSummaryPane from './trip-summary-pane'

/**
 * This component handles displaying and editing saved trips.
 */
class SavedTripEditor extends Component {
  _handleTripSelect = index => () => {
    const { onMonitoredTripSelect } = this.props
    if (onMonitoredTripSelect) onMonitoredTripSelect(index)

    // TODO: Add URL handling so URL shows as #/savedtrips/trip-id-123
  }

  render () {
    const { monitoredTrip, onComplete, onDeleteTrip, panes, trips } = this.props

    // TODO: Improve navigation.
    const accountLink = <p><LinkButton to='/account'>Back to My Account</LinkButton></p>

    if (monitoredTrip) {
      const paneSequence = [
        {
          pane: panes.basics,
          title: 'Trip overview'
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
      return (
        <>
          <h1>{monitoredTrip.tripName}</h1>
          <StackedPaneDisplay
            onCancel={this._handleTripSelect(null)}
            onComplete={onComplete}
            paneSequence={paneSequence}
          />
        </>
      )
    } else if (trips.length === 0) {
      return (
        <>
          {accountLink}
          <h1>You have no saved trips</h1>
          <p>Perform a trip search from the map first.</p>
        </>
      )
    } else {
      // Stack the saved trip summaries. When the user clicks on one, they can edit that trip.
      return (
        <>
          {accountLink}
          <h1>My saved trips</h1>
          <p>Click on a saved trip below to modify it.</p>
          <ButtonGroup vertical block>
            {trips.map((trip, index) => (
              <Button key={index} onClick={this._handleTripSelect(index)} style={{textAlign: 'left'}}>
                <TripSummaryPane monitoredTrip={trip} />
              </Button>
            ))}
          </ButtonGroup>
        </>
      )
    }
  }
}

export default SavedTripEditor
