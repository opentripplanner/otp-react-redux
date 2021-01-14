import { withAuthenticationRequired } from '@auth0/auth0-react'
import clone from 'clone'
import { Field, Form, Formik } from 'formik'
import React, { Component } from 'react'
import {
  Button,
  FormControl,
  FormGroup,
  HelpBlock,
  ToggleButton,
  ToggleButtonGroup
} from 'react-bootstrap'
import { connect } from 'react-redux'
import styled from 'styled-components'
import * as yup from 'yup'

import * as uiActions from '../../../actions/ui'
import * as userActions from '../../../actions/user'
import DesktopNav from '../../app/desktop-nav'
import {
  FavoriteLocationField,
  makeLocationFieldLocation
} from './favorite-location-controls'
import Icon from '../../narrative/icon'
import { getErrorStates, RETURN_TO_CURRENT_ROUTE } from '../../../util/ui'
import { cloneForEditing, isHomeOrWork, PLACE_TYPES } from '../../../util/user'
import withLoggedInUserSupport from '../with-logged-in-user-support'

// Styled components
const SaveButton = styled(Button)`
  float: right;
`
const BackButton = styled(Button)`
  padding: 0;
`
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

// Custom places without home or work
const customPlaces = clone(PLACE_TYPES)
delete customPlaces.home
delete customPlaces.work

const BLANK_PLACE = {
  ...PLACE_TYPES.custom,
  address: '',
  name: ''
}

// The form fields to validate.
const validationSchemaShape = {
  address: yup.string().required('Please set a location for this place'),
  name: yup.string().required('Please enter a name for this place')
}

/**
 * Contains the fields for editing a favorite place.
 * This component uses Formik props that are passed
 * within the Formik context set up by FavoritePlaceScreen.
 */
class FavoritePlaceEditor extends Component {
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
      <div style={{marginTop: '40px'}}>
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
            {/* TODO: Validate/m ake sure names are not duplicate */}
            {errors.name && <HelpBlock>{errors.name}</HelpBlock>}
          </FormGroup>

          <FormGroup>
            <ToggleButtonGroup
              name='type'
              type='radio'
              defaultValue={place.type}
            >
              {Object.values(customPlaces).map(({ icon, text, type }) => (
                <ToggleButton
                  key={type}
                  // onBlur and onChange have to be set on individual controls instead of the control group
                  // in order for Formik to correcly process the changes.
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
          {/* For fixed locations, just show the icon for place type instead of all inputs and selectors */}
          {isFixed && <FixedPlaceIcon name={place.icon} />}

          <FormGroup style={{flexGrow: 1}} validationState={errorStates.address}>
            <FavoriteLocationField // TODO: mobile version.
              className='form-control'
              inputPlaceholder={isFixed ? `Search for ${place.name} location` : 'Search for location'}
              location={makeLocationFieldLocation(place)}
              locationType='to'
              onLocationSelected={this._handleLocationChange}
              showClearButton={false}
            />
            <FormControl.Feedback />
            {errors.address && <HelpBlock>{errors.address}</HelpBlock>}

            {/* TODO: Implement setting location using map. */}
          </FormGroup>
        </div>

        <FormGroup>
          {/* TODO: Remove */}
          <p>DEV NOTE: Changes take effect immediately after clicking Save.</p>
        </FormGroup>
      </div>
    )
  }
}

/**
 * Renders a user favorite location,
 * and lets the user edit the details (address, type, nickname) of the location.
 */
class FavoritePlaceScreen extends Component {
  /**
   * Navigates back to the previous browser location,
   * whether it is the accounts page or another page that linked to the current URL.
   */
  // TODO: Refine this behavior.
  _handleBack = () => {
    window.history.back()
  }

  /**
   * Silently save the changes to the loggedInUser, and go to the previous URL.
   */
  _handleSave = async placeToSave => {
    // Update the place icon for the location type.
    placeToSave.icon = PLACE_TYPES[placeToSave.type].icon

    // Save changes to loggedInUser
    const { createOrUpdateUser, loggedInUser, match } = this.props

    // Get the places as shown (and not as retrieved from db), so that the index passed from URL applies
    // (indexes 0 and 1 are for Home and Work locations).
    const clonedUser = cloneForEditing(loggedInUser)
    const placeIndex = match.params.id

    if (placeIndex === 'new') {
      clonedUser.savedLocations.push(placeToSave)
    } else {
      clonedUser.savedLocations[placeIndex] = placeToSave
    }

    await createOrUpdateUser(clonedUser, true)

    this._handleBack()
  }

  /**
   * Based on the URL, returns an existing place or a new place for editing,
   * or null if the requested place is not found.
   */
  _getPlaceToEdit = user => {
    const { match } = this.props
    const { params, path } = match
    if (user && path === '/places/:id') {
      const placeIndex = params.id

      if (placeIndex === 'new') {
        return BLANK_PLACE
      } else if (user.savedLocations) {
        return user.savedLocations[placeIndex]
      }
    }

    return null
  }

  /**
   * Obtains a schema that validates the given place name against
   * other place names used by the user, including 'Work' and 'Home'.
   */
  _getFullValidationSchema = (places, place) => {
    const otherPlaceNames = (place
      ? places.filter(pl => pl.name !== place.name)
      : places
    ).map(pl => pl.name)

    const clonedSchemaShape = clone(validationSchemaShape)
    clonedSchemaShape.name = yup.string()
      .required('Please enter a name for this place')
      .notOneOf(otherPlaceNames, 'You are already using this name for another place. Please enter a different name.')

    return yup.object(clonedSchemaShape)
  }

  render () {
    const { loggedInUser, match } = this.props
    // Get the places as shown (and not as retrieved from db), so that the index passed from URL applies
    // (indexes 0 and 1 are for Home and Work locations).
    const clonedUser = cloneForEditing(loggedInUser)
    const place = this._getPlaceToEdit(clonedUser)
    const isNew = match.params.id === 'new'
    const isFixed = place && isHomeOrWork(place)

    let heading
    if (!place) {
      heading = 'Place not found'
    } else if (isNew) {
      heading = 'Add a new place'
    } else if (isFixed) {
      heading = `Edit ${place.name}`
    } else {
      heading = 'Edit place'
    }

    return (
      <div className='otp'>
        {/* TODO: Do mobile view. */}
        <DesktopNav />

        <Formik
          initialValues={clone(place)}
          onSubmit={this._handleSave}
          // Avoid validating on change as it is annoying. Validating on blur is enough.
          validateOnChange={false}
          validateOnBlur
          validationSchema={this._getFullValidationSchema(clonedUser.savedLocations, place)}
        >
          {
            // Formik props provide access to the current user data state and errors,
            // (in props.values, props.touched, props.errors)
            // and to its own blur/change/submit event handlers that automate the state.
            // We pass the Formik props below to the components rendered so that individual controls
            // can be wired to be managed by Formik.
            props => {
              return (
                <Form className='container' noValidate>
                  <div>
                    <BackButton
                      bsStyle='link'
                      onClick={this._handleBack}
                    >
                      <Icon name='arrow-left' /> Back
                    </BackButton>
                  </div>
                  <div>
                    {place && <SaveButton bsStyle='primary' type='submit'>Save</SaveButton>}
                    <h1>{heading}</h1>
                  </div>

                  {place
                    ? <FavoritePlaceEditor {...props} />
                    : <p>Sorry, the requested place was not found.</p>
                  }
                </Form>
              )
            }
          }
        </Formik>
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    loggedInUser: state.user.loggedInUser
  }
}

const mapDispatchToProps = {
  createOrUpdateUser: userActions.createOrUpdateUser,
  routeTo: uiActions.routeTo
}

export default withLoggedInUserSupport(
  withAuthenticationRequired(
    connect(mapStateToProps, mapDispatchToProps)(FavoritePlaceScreen),
    RETURN_TO_CURRENT_ROUTE
  ),
  true
)
