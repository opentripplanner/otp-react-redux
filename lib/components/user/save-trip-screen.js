import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withLoginRequired } from 'use-auth0-hooks'

import { addTrip, updateTrip } from '../../util/middleware'
import { routeTo } from '../../actions/ui'
import AppNav from '../app/app-nav'

import SavedTripEditor from './saved-trip-editor'
import SavedTripWizard from './saved-trip-wizard'
import TripBasicsPane from './trip-basics-pane'
import TripNotificationsPane from './trip-notifications-pane'
import TripSummaryPane from './trip-summary-pane'

/**
 * This screen handles saving a trip from an OTP query for the logged-in user.
 */
class SaveTripScreen extends Component {
  static propTypes = {
    originalUrl: PropTypes.string
  }

  static defaultProps = {
    originalUrl: '/'
  }

  constructor (props) {
    super(props)

    this.state = {
      // New trip: deep clone active trip to make edits.
      monitoredTrip: {}
    }
  }

  _updateMonitoredTripState = newMonitoredTrip => {
    const { monitoredTrip } = this.state
    this.setState({
      monitoredTrip: {
        ...monitoredTrip,
        ...newMonitoredTrip
      }
    })
  }

  _updateMonitoredTrip = async () => {
    const { auth, loggedInUser, persistence, wizard } = this.props

    if (persistence && persistence.otp_middleware) {
      const { accessToken } = auth
      const { id } = loggedInUser
      const { monitoredTrip } = this.state

      // TODO: Change state of Save button.

      let result
      if (wizard) {
        result = await addTrip(persistence.otp_middleware, accessToken, monitoredTrip)
      } else {
        result = await updateTrip(persistence.otp_middleware, accessToken, monitoredTrip)
      }

      // TODO: improve this.
      if (result.status === 'success') {
        alert('Your preferences have been saved.')
      } else {
        alert(`An error was encountered:\n${JSON.stringify(result)}`)
      }
    }
  }

  _handleExit = () => {
    const { originalUrl } = this.props
    this.props.routeTo(originalUrl)
  }

  _handleExitAndSave = async () => {
    await this._updateMonitoredTrip()
    this._handleExit()
  }

  /**
   * Hook monitoredTrip, onMonitoredTripChange on some panes upon rendering.
   * This returns a new render function for the passed component
   * that allows passing other props to it later if needed.
   */
  _hookMonitoredTrip = Pane => props => {
    const { monitoredTrip } = this.state
    return (
      <Pane
        onMonitoredTripChange={this._updateMonitoredTripState}
        monitoredTrip={monitoredTrip}
        {...props}
      />
    )
  }

  // Make an index of pane components, so we don't render all panes at once on every render.
  // Hook some panes to the monitoredTrip and onMonitoredTripChange props.
  _panes = {
    basics: this._hookMonitoredTrip(TripBasicsPane),
    notifications: this._hookMonitoredTrip(TripNotificationsPane),
    summary: this._hookMonitoredTrip(TripSummaryPane)
  }

  // TODO: Update title bar during componentDidMount.

  render () {
    const { monitoredTrip, wizard } = this.props

    let content
    if (wizard) {
      content = (
        <SavedTripWizard
          onComplete={this._handleExitAndSave}
          panes={this._panes}
        />
      )
    } else {
      content = (
        <SavedTripEditor
          onCancel={this._handleExit}
          onComplete={this._handleExitAndSave}
          monitoredTrip={monitoredTrip}
          panes={this._panes}
        />
      )
    }

    return (
      <div className='otp'>
        {/* TODO: Do mobile view. */}
        <AppNav />
        <form className='container'>
          {content}
        </form>
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    loggedInUser: state.otp.user.loggedInUser,
    persistence: state.otp.config.persistence
  }
}

const mapDispatchToProps = {
  routeTo
}

export default withLoginRequired(connect(mapStateToProps, mapDispatchToProps)(SaveTripScreen))
