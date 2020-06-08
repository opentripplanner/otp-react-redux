import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import { routeTo } from '../../actions/ui'

import StackedPaneDisplay from './stacked-pane-display'

/**
 * This component handles the existing account display.
 */
class ExistingAccountDisplay extends Component {
  _handleViewMyTrips = () => {
    this.props.routeTo('/savedtrips')
  }

  render () {
    const { onCancel, onComplete, panes } = this.props
    const paneSequence = [
      {
        pane: () => <Button onClick={this._handleViewMyTrips}>Edit my trips</Button>,
        title: 'My trips'
      },
      {
        pane: panes.terms,
        props: { disableCheckTerms: true },
        title: 'Terms'
      },
      {
        pane: panes.notifications,
        title: 'Notifications'
      },
      {
        pane: panes.locations,
        title: 'My locations'
      }
    ]

    return (
      <StackedPaneDisplay
        onCancel={onCancel}
        onComplete={onComplete}
        paneSequence={paneSequence}
        title='My Account'
      />
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => ({})

const mapDispatchToProps = {
  routeTo
}

export default connect(mapStateToProps, mapDispatchToProps)(ExistingAccountDisplay)
