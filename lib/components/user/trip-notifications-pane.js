import React, { Component } from 'react'
import { Alert, Checkbox, ControlLabel, FormControl, FormGroup, Radio } from 'react-bootstrap'

class TripNotificationsPane extends Component {
  _handleIsActiveChange = e => {
    const { onMonitoredTripChange } = this.props
    onMonitoredTripChange({ isActive: e.target.value })
  }

  _handleExcludeFedHolidaysChange = e => {
    const { onMonitoredTripChange } = this.props
    onMonitoredTripChange({ excludeFederalHolidays: e.target.value })
  }

  _handleLeadTimeChange = e => {
    const { onMonitoredTripChange } = this.props
    onMonitoredTripChange({ leadTimeInMinutes: e.target.value })
  }

  render () {
    const { monitoredTrip } = this.props

    return (
      <div>
        <FormGroup>
          <ControlLabel>Would you like to receive notifications about this trip?</ControlLabel>
          <Radio
            name='isActive'
            onChange={this._handleIsActiveChange}
            value={monitoredTrip.isActive}
          >
            Yes
          </Radio>
          <Radio
            name='isActive'
            onChange={this._handleIsActiveChange}
            value={!monitoredTrip.isActive}
          >
            No
          </Radio>

          <p>[small] Note: you will be notified by [email|SMS]. This can be changed in your account settings once the trip has been saved.</p>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Would you like to disable notifications during US federal holidays?</ControlLabel>
          <Radio
            name='excludeFedHolidays'
            onChange={this._handleExcludeFedHolidaysChange}
            value={monitoredTrip.excludeFederalHolidays}
          >
            Yes
          </Radio>
          <Radio
            name='excludeFedHolidays'
            onChange={this._handleExcludeFedHolidaysChange}
            value={!monitoredTrip.excludeFederalHolidays}
          >
            No
          </Radio>

          <p>[small] Note: you can always pause notifications for this trip once the trip has been saved.</p>
        </FormGroup>

        <FormGroup>
          <ControlLabel>When would you like to receive notifications about delays or disruptions to your trip?</ControlLabel>

          <FormGroup>
            <ControlLabel>Check for delays or disruptions:</ControlLabel>
            <FormControl
              componentClass='select'
              defaultValue={30}
              onChange={this._handleLeadTimeChange}
              placeholder='select'
              value={monitoredTrip.leadTimeInMinutes}
            >
              <option value={15}>15 min. prior</option>
              <option value={30}>30 min. prior (default)</option>
              <option value={45}>45 min. prior</option>
              <option value={60}>60 min. prior</option>
            </FormControl>
          </FormGroup>

          <Alert bsStyle='warning'>
            Under construction!
            <FormGroup>
              <ControlLabel>Notify me if:</ControlLabel>
              <Checkbox>A different route or transfer point is recommended</Checkbox>
              <Checkbox>There is an alert for a route or stop that is part of my journey</Checkbox>

              Your arrival or departure time changes by more than:
              <FormControl componentClass='select' defaultValue={5} placeholder='select'>
                <option value={5}>5 min. (default)</option>
                <option value={10}>10 min.</option>
                <option value={15}>15 min.</option>
              </FormControl>
            </FormGroup>
          </Alert>
        </FormGroup>

      </div>
    )
  }
}

export default TripNotificationsPane
