/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
/* eslint-disable sort-imports-es6-autofix/sort-imports-es6 */
import { withAuthenticationRequired } from '@auth0/auth0-react'
import clone from 'clone'
import { Form, Formik } from 'formik'
import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { injectIntl, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import styled from 'styled-components'
import * as yup from 'yup'

import AccountPage from '../account-page'
import * as userActions from '../../../actions/user'
import BackLink from '../back-link'
import FormNavigationButtons from '../form-navigation-buttons'
import { PageHeading } from '../styled'
import { CREATE_ACCOUNT_PLACES_PATH } from '../../../util/constants'
import { getFormattedPlaces } from '../../../util/i18n'
import { isBlank, navigateBack, RETURN_TO_CURRENT_ROUTE } from '../../../util/ui'
import { isHomeOrWork, PLACE_TYPES } from '../../../util/user'
import withLoggedInUserSupport from '../with-logged-in-user-support'
import { InlineLoading } from '../../narrative/loading'
import PageTitle from '../../util/page-title'
import { toastOnPlaceSaved } from '../../util/toasts'

import PlaceEditor from './place-editor'

const { isMobile } = coreUtils.ui

// Styled components
const SaveButton = styled(Button)`
  float: right;
`
const BLANK_PLACE = {
  ...PLACE_TYPES.custom,
  address: '',
  name: ''
}

// Make space between place details and form buttons.
const Container = styled.div`
  margin-bottom: 100px;
`

// The form fields to validate.
const validationSchemaShape = {
  address: yup.string().required('invalid-address'), // Text constant to display components.FavoritePlaceScreen.invalidAddress
  name: yup.string().required('invalid-name') // Text constant to display components.FavoritePlaceScreen.invalidName
}

/**
 * Lets the user edit the details (address, type, nickname)
 * of a new or existing favorite place.
 */
class FavoritePlaceScreen extends Component {
  state = {
    pendingSave: false
  }

  /**
   * Silently save the changes to the loggedInUser, and go to the previous URL.
   */
  _handleSave = async placeToSave => {
    this.setState({pendingSave: true})
    // Update the icon for the place type.
    placeToSave.icon = PLACE_TYPES[placeToSave.type].icon

    // Save changes to loggedInUser.
    const { intl, placeIndex, saveUserPlace } = this.props
    const result = await saveUserPlace(placeToSave, placeIndex, intl)
    if (result === userActions.UserActionResult.SUCCESS) {
      toastOnPlaceSaved(placeToSave, intl)
    }

    // Return to previous location when done.
    navigateBack()
  }

  /**
   * Based on the URL, returns an existing place or a new place for editing,
   * or null if the requested place is not found.
   */
  _getPlaceToEdit = user => {
    const { isNewPlace, placeIndex } = this.props
    return isNewPlace
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
      ? places.filter(pl => !isBlank(pl.name) && pl.name !== place.name)
      : places
    ).map(pl => pl.name)

    const clonedSchemaShape = clone(validationSchemaShape)
    clonedSchemaShape.name = yup.string()
      .required('invalid-name') // text constant for components.FavoritePlaceScreen.invalidName
      .notOneOf(otherPlaceNames, 'placename-already-used') // text constant for components.FavoritePlaceScreen.nameAlreadyUsed

    return yup.object(clonedSchemaShape)
  }

  render () {
    const { intl, isCreating, isNewPlace, loggedInUser } = this.props
    const { pendingSave } = this.state
    // Get the places as shown (and not as retrieved from db), so that the index passed from URL applies
    // (indexes 0 and 1 are for Home and Work locations).
    // Clone the place to avoid improper state mutation in the lines below.
    const place = clone(this._getPlaceToEdit(loggedInUser))
    // For <input> controls, the value must be at least ''.
    if (place?.name === null) {
      place.name = ''
    }

    // Set name for nameless places
    const isFixed = place && isHomeOrWork(place)
    if (isFixed) {
      place.name = place.type
    }

    const isMobileView = isMobile()

    let heading
    if (!place) {
      heading = intl.formatMessage({ id: 'components.FavoritePlaceScreen.placeNotFound' })
    } else if (isNewPlace) {
      heading = intl.formatMessage({ id: 'components.FavoritePlaceScreen.addNewPlace' })
    } else if (isFixed) {
      heading = intl.formatMessage(
        { id: 'components.FavoritePlaceScreen.editPlace' },
        {
          placeName: getFormattedPlaces(place.type, intl)
        }
      )
    } else {
      heading = intl.formatMessage({ id: 'components.FavoritePlaceScreen.editPlaceGeneric' })
    }

    return (
      <AccountPage subnav={!isCreating}>
        {isMobileView && <BackLink />}
        <PageTitle title={[heading, !isCreating ? intl.formatMessage({
          id: 'components.SubNav.myAccount'
        }) : '']} />
        <Formik
          initialValues={place}
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
                    {isMobileView && place && (
                      <SaveButton bsStyle='primary' disabled={pendingSave} type='submit'>
                        {pendingSave ? <InlineLoading />:<FormattedMessage id='common.forms.save' />}
                      </SaveButton>
                    )}
                    <PageHeading as={isCreating ? 'h1' : 'h2'}>{heading}</PageHeading>
                  </div>
                  <Container>
                    {place
                      ? <PlaceEditor {...props} />
                      : (
                        <p>
                          <FormattedMessage id='components.FavoritePlaceScreen.placeNotFoundDescription' />
                        </p>
                      )}
                  </Container>

                  {!isMobileView && <FormNavigationButtons
                    backButton={{
                      onClick: navigateBack,
                      text: <FormattedMessage id='common.forms.back' />
                    }}
                    okayButton={place && {
                      text: pendingSave ? <InlineLoading /> : <FormattedMessage id='common.forms.save' />,
                      type: 'submit'
                    }}
                  />}
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
  const { params, path } = ownProps.match
  const placeIndex = params.id
  return {
    isCreating: path.startsWith(CREATE_ACCOUNT_PLACES_PATH),
    isNewPlace: placeIndex === 'new',
    loggedInUser: state.user.loggedInUser,
    placeIndex
  }
}

const mapDispatchToProps = {
  saveUserPlace: userActions.saveUserPlace
}

export default withLoggedInUserSupport(
  withAuthenticationRequired(
    connect(mapStateToProps, mapDispatchToProps)(
      injectIntl(FavoritePlaceScreen)
    ),
    RETURN_TO_CURRENT_ROUTE
  ),
  true
)
