import { Field } from 'formik'
import React, { Component } from 'react'
import { Alert, Checkbox, ControlLabel, FormControl, FormGroup, HelpBlock, Radio } from 'react-bootstrap'

class TripNotificationsPane extends Component {
  /**
   * Handles the conversion of 'true'/'false' strings in event data into boolean
   * to update the Formik state.
   */
  _handleIsActiveChange = e => {
    const { handleChange } = this.props
    handleChange({ target: {
      name: 'isActive',
      value: e.target.value === 'true'
    }})
  }

  render () {
    const { values: monitoredTrip } = this.props

    return (
      <div>
        <FormGroup>
          <ControlLabel id='is-active-label'>Would you like to receive notifications about this trip?</ControlLabel>
          <div role='group' aria-labelledby='is-active-label'>
            <Radio
              checked={monitoredTrip.isActive}
              name='isActive'
              onChange={this._handleIsActiveChange}
              value
            >
              Yes
            </Radio>
            <Radio
              checked={!monitoredTrip.isActive}
              name='isActive'
              onChange={this._handleIsActiveChange}
              value={false}
            >
              No
            </Radio>
          </div>
          <HelpBlock>
            {/* TODO: populate either email or SMS below */}
            Note: you will be notified by [email|SMS]. This can be changed in your account settings once the trip has been saved.
          </HelpBlock>
        </FormGroup>

        <FormGroup>
          <ControlLabel>When would you like to receive notifications about delays or disruptions to your trip?</ControlLabel>

          <FormGroup>
            <ControlLabel>Check for delays or disruptions:</ControlLabel>
            <Field
              as={FormControl}
              componentClass='select'
              name='leadTimeInMinutes'
            >
              <option value={15}>15 min. prior</option>
              <option value={30}>30 min. prior (default)</option>
              <option value={45}>45 min. prior</option>
              <option value={60}>60 min. prior</option>
            </Field>
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
