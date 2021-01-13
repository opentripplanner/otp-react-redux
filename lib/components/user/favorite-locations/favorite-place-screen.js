import { Field, Form, Formik } from 'formik'
import React, { Component } from 'react'
import {
  Button,
  FormControl,
  FormGroup,
  ToggleButton,
  ToggleButtonGroup
} from 'react-bootstrap'

import {
  FavoriteLocationField,
  makeFavoriteLocation,
  makeLocationFieldLocation
} from './favorite-location-controls'

import DesktopNav from '../../app/desktop-nav'
import Icon from '../../narrative/icon'

const MESSAGES = {
  SET_PLACE_NAME: 'Set place name'
}

const customLocationType = {
  icon: 'map-marker',
  text: 'Custom',
  type: 'custom'
}

const locationTypes = [
  // TODO: add more non-home/work types
  {
    icon: 'cutlery',
    text: 'Dining',
    type: 'dining'
  },
  customLocationType
]

/**
 * Renders a user favorite location,
 * and lets the user edit the details (address, type, nickname) of the location.
 */
class FavoritePlaceScreen extends Component {
  _handleLocationChange = ({ location }) => {
    const { arrayHelpers, index, location: oldLocation } = this.props
    const { icon, name, type } = oldLocation
    arrayHelpers.replace(index, makeFavoriteLocation(location, type, icon, name))
  }

  _handleLocationTypeChange = ({ icon, type }) => {
    const { arrayHelpers, index, location } = this.props
    const newLocation = {
      ...location,
      icon,
      type
    }
    arrayHelpers.replace(index, newLocation)
  }

  render () {
    return (
      <div className='otp'>
        {/* TODO: Do mobile view. */}
        <DesktopNav />
        <Formik
          // Force Formik to reload initialValues when we update them (e.g. user gets assigned an id).
          enableReinitialize
          // initialValues={cloneForFormik(loggedInUser)}
          onSubmit={this._handleSaveAndExit}
          // Avoid validating on change as it is annoying. Validating on blur is enough.
          validateOnChange={false}
          validateOnBlur
          // validationSchema={validationSchema}
        >
          {
            // Formik props provide access to the current user data state and errors,
            // (in props.values, props.touched, props.errors)
            // and to its own blur/change/submit event handlers that automate the state.
            // We pass the Formik props below to the components rendered so that individual controls
            // can be wired to be managed by Formik.
            formikProps => {
              return (
                <Form className='container' noValidate>
                  <div>
                    <Button bsStyle='link' style={{padding: 0}}><Icon name='arrow-left' /> Back</Button>
                  </div>
                  <div style={{marginBottom: '40px'}}>
                    <Button bsStyle='primary' style={{float: 'right'}}>Save</Button>
                    <h1>New/Edit place</h1>
                  </div>

                  <FormGroup /* validationState={tripNameValidationState} */ >
                    {/* onBlur, onChange, and value are passed automatically. */}
                    <Field as={FormControl}
                      aria-label={MESSAGES.SET_PLACE_NAME}
                      name='name'
                      placeholder={MESSAGES.SET_PLACE_NAME}
                    />
                    <FormControl.Feedback />
                    {/* TODO: Validate/m ake sure names are not duplicate */}
                    {/* errors.tripName && <HelpBlock>{errors.tripName}</HelpBlock> */}
                  </FormGroup>

                  <FormGroup>
                    <ToggleButtonGroup
                      name='type'
                      type='radio'
                      defaultValue='custom'
                    >
                      {locationTypes.map(({ icon, text, type }) => (
                        <ToggleButton
                          key={type}
                          // onBlur and onChange have to be set on individual controls instead of the control group
                          // in order for Formik to correcly process the changes.
                          onBlur={formikProps.handleBlur}
                          onChange={formikProps.handleChange}
                          title={text}
                          value={type}
                        >
                          <Icon name={icon} style={{fontSize: '150%'}} />
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>

                  </FormGroup>

                  <FormGroup>
                    <FavoriteLocationField // TODO: mobile version.
                      className='form-control'
                      inputPlaceholder='Search for location'
                      location={makeLocationFieldLocation(location)}
                      locationType='to'
                      onLocationSelected={this._handleLocationChange}
                      showClearButton={false}
                    />

                    {/* TODO: Implement setting location using map. */}

                  </FormGroup>

                </Form>
              )
            }
          }
        </Formik>
      </div>
    )
  }
}

export default FavoritePlaceScreen
