import { withAuthenticationRequired } from '@auth0/auth0-react'
import clone from 'clone'
import { Form, Formik } from 'formik'
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import styled from 'styled-components'
import * as yup from 'yup'

import AccountPage from '../account-page'
import BackLink from '../back-link'
import * as userActions from '../../../actions/user'
import { RETURN_TO_CURRENT_ROUTE } from '../../../util/ui'
import { isHomeOrWork, PLACE_TYPES } from '../../../util/user'
import withLoggedInUserSupport from '../with-logged-in-user-support'
import PlaceEditor from './place-editor'
import { PageHeading } from '../styled'

// Styled components
const SaveButton = styled(Button)`
  float: right;
`

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
 * Lets the user edit the details (address, type, nickname)
 * of a new or existing favorite place.
 */
class FavoritePlaceScreen extends Component {
  /**
   * Silently save the changes to the loggedInUser, and go to the previous URL.
   */
  _handleSave = async placeToSave => {
    // Update the icon for the place type.
    placeToSave.icon = PLACE_TYPES[placeToSave.type].icon

    // Save changes to loggedInUser.
    const { placeIndex, saveUserPlace } = this.props
    await saveUserPlace(placeToSave, placeIndex)

    // Return to previous location when done.
    window.history.back()
  }

  /**
   * Based on the URL, returns an existing place or a new place for editing,
   * or null if the requested place is not found.
   */
  _getPlaceToEdit = user => {
    const { isCreating, placeIndex } = this.props
    return isCreating
      ? BLANK_PLACE
      : (user.savedLocations
        ? user.savedLocations[placeIndex]
        : null
      )
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
    const { isCreating, loggedInUser } = this.props
    // Get the places as shown (and not as retrieved from db), so that the index passed from URL applies
    // (indexes 0 and 1 are for Home and Work locations).
    const place = this._getPlaceToEdit(loggedInUser)
    const isFixed = place && isHomeOrWork(place)

    let heading
    if (!place) {
      heading = 'Place not found'
    } else if (isCreating) {
      heading = 'Add a new place'
    } else if (isFixed) {
      heading = `Edit ${place.name}`
    } else {
      heading = 'Edit place'
    }

    return (
      <AccountPage>
        <BackLink />
        <Formik
          initialValues={clone(place)}
          onSubmit={this._handleSave}
          validateOnBlur
          // Avoid validating on change as it is annoying. Validating on blur is enough.
          validateOnChange={false}
          validationSchema={this._getFullValidationSchema(loggedInUser.savedLocations, place)}
        >
          {
            // We pass the Formik props below to the components rendered so that individual controls
            // can be wired to be managed by Formik.
            props => {
              return (
                <Form noValidate>
                  <div>
                    {place && <SaveButton bsStyle='primary' type='submit'>Save</SaveButton>}
                    <PageHeading>{heading}</PageHeading>
                  </div>

                  {place
                    ? <PlaceEditor {...props} />
                    : <p>Sorry, the requested place was not found.</p>
                  }
                </Form>
              )
            }
          }
        </Formik>
      </AccountPage>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const placeIndex = ownProps.match.params.id
  return {
    isCreating: placeIndex === 'new',
    loggedInUser: state.user.loggedInUser,
    placeIndex
  }
}

const mapDispatchToProps = {
  saveUserPlace: userActions.saveUserPlace
}

export default withLoggedInUserSupport(
  withAuthenticationRequired(
    connect(mapStateToProps, mapDispatchToProps)(FavoritePlaceScreen),
    RETURN_TO_CURRENT_ROUTE
  ),
  true
)
