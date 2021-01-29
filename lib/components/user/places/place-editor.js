import { Field } from 'formik'
import React, { Component } from 'react'
import {
  FormControl,
  FormGroup,
  HelpBlock,
  ToggleButton,
  ToggleButtonGroup
} from 'react-bootstrap'
import styled from 'styled-components'

import Icon from '../../narrative/icon'
import { getErrorStates } from '../../../util/ui'
import { CUSTOM_PLACE_TYPES, isHomeOrWork } from '../../../util/user'
import {
  makeLocationFieldLocation,
  PlaceLocationField
} from './place-location-field'

// Styled components
const LargeIcon = styled(Icon)`
  font-size: 150%;
`
const FixedPlaceIcon = styled(LargeIcon)`
  margin-right: 10px;
  padding-top: 6px;
`

const MESSAGES = {
  SET_PLACE_NAME: 'Set place name'
}

/**
 * Contains the fields for editing a favorite place.
 * This component uses Formik props that are passed
 * within the Formik context set up by FavoritePlaceScreen.
 */
class PlaceEditor extends Component {
  _handleLocationChange = ({ location }) => {
    const { setValues, values } = this.props
    const { lat, lon, name } = location
    setValues({
      ...values,
      address: name,
      lat,
      lon
    })
  }

  render () {
    const { errors, handleBlur, handleChange, values: place } = this.props
    const isFixed = isHomeOrWork(place)
    const errorStates = getErrorStates(this.props)

    return (
      <div>
        {!isFixed && (
        <>
          <FormGroup validationState={errorStates.name} >
            {/* onBlur, onChange, and value are passed automatically. */}
            <Field as={FormControl}
              aria-label={MESSAGES.SET_PLACE_NAME}
              name='name'
              placeholder={MESSAGES.SET_PLACE_NAME}
            />
            <FormControl.Feedback />
            {errors.name && <HelpBlock>{errors.name}</HelpBlock>}
          </FormGroup>

          <FormGroup>
            <ToggleButtonGroup
              defaultValue={place.type}
              name='type'
              type='radio'
            >
              {Object.values(CUSTOM_PLACE_TYPES).map(({ icon, text, type }) => (
                <ToggleButton
                  key={type}
                  // onBlur and onChange have to be set on individual controls instead of the control group
                  // in order for Formik to correctly process the changes.
                  onBlur={handleBlur}
                  onChange={handleChange}
                  title={text}
                  value={type}
                >
                  <LargeIcon name={icon} />
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </FormGroup>
        </>
        )}

        <div style={{ display: 'flex' }}>
          {/* For fixed places, just show the icon for place type instead of all inputs and selectors */}
          {isFixed && <FixedPlaceIcon name={place.icon} />}

          <FormGroup style={{flexGrow: 1}} validationState={errorStates.address}>
            <PlaceLocationField // TODO: mobile version.
              className='form-control'
              inputPlaceholder={isFixed ? `Search for ${place.name} location` : 'Search for location'}
              location={makeLocationFieldLocation(place)}
              locationType='to'
              onLocationSelected={this._handleLocationChange}
              showClearButton={false}
            />
            <FormControl.Feedback />
            {errors.address && <HelpBlock>{errors.address}</HelpBlock>}
          </FormGroup>
        </div>
      </div>
    )
  }
}

export default PlaceEditor
