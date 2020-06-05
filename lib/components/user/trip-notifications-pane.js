import React, { Component } from 'react'
import { Checkbox, ControlLabel, FormControl, FormGroup, Radio } from 'react-bootstrap'

class TripNotificationsPane extends Component {
  render () {
    // const { monitoredTrip } = this.props

    return (
      <div>
        <FormGroup>
          <ControlLabel>Would you like to receive notifications about this trip?</ControlLabel>
          <Radio
            name='enableTripNotifications'
            // onChange={}
            value
          >
            Yes
          </Radio>
          <Radio
            name='enableTripNotifications'
            // onChange={}
            value={false}
          >
            No
          </Radio>

          <p>[small] Note: you will be notified by [email|SMS]. This can be changed in your account settings once the trip has been saved.</p>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Would you like to disable notifications during US federal holidays?</ControlLabel>
          <Radio
            name='enableTripNotifications'
            // onChange={}
            value
          >
            Yes
          </Radio>
          <Radio
            name='enableTripNotifications'
            // onChange={}
            value={false}
          >
            No
          </Radio>

          <p>[small] Note: you can always pause notifications for this trip once the trip has been saved.</p>
        </FormGroup>

        <FormGroup>
          <ControlLabel>When would you like to receive notifications about delays or disruptions to your trip?</ControlLabel>

          <FormGroup>
            <ControlLabel>Check for delays or disruptions:</ControlLabel>
            <FormControl componentClass='select' defaultValue={30} placeholder='select'>
              <option value={15}>15 min. prior</option>
              <option value={30}>30 min. prior (default)</option>
              <option value={45}>45 min. prior</option>
              <option value={60}>60 min. prior</option>
            </FormControl>
          </FormGroup>

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

        </FormGroup>

      </div>
    )
  }
}

export default TripNotificationsPane
