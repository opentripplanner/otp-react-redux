import { connect } from 'react-redux'
import {
  ControlLabel,
  FormControl,
  FormGroup,
  HelpBlock
} from 'react-bootstrap'
import { Field, FormikProps } from 'formik'
import {
  FormattedMessage,
  injectIntl,
  IntlShape,
  WrappedComponentProps
} from 'react-intl'
import { Location } from '@opentripplanner/types'
import { LocationSelectedEvent } from '@opentripplanner/location-field/lib/types'
import coreUtils from '@opentripplanner/core-utils'
import getGeocoder, { GeocoderConfig } from '@opentripplanner/geocoder'
import React, { Component, Fragment } from 'react'
import styled from 'styled-components'

import * as locationActions from '../../../actions/location'
import { capitalizeFirst, getErrorStates } from '../../../util/ui'
import { ComponentContext } from '../../../util/contexts'
import { CUSTOM_PLACE_TYPES, isHomeOrWork } from '../../../util/user'
import { getFormattedPlaces } from '../../../util/i18n'
import { StyledIconWrapper } from '../../util/styledIcon'
import { UserSavedLocation } from '../types'
import ButtonGroup from '../../util/button-group'
import FormattedValidationError from '../../util/formatted-validation-error'
import InvisibleA11yLabel from '../../util/invisible-a11y-label'

import { PlaceLocationField } from './place-location-field'

type Props = WrappedComponentProps &
  FormikProps<UserSavedLocation> & {
    geocoderConfig: GeocoderConfig
    getCurrentPosition: (
      ...args: Parameters<typeof locationActions.getCurrentPosition>
    ) => void
    intl: IntlShape
  }

const { isMobile } = coreUtils.ui

// Styled components
const FixedPlaceIconWrapper = styled(StyledIconWrapper)`
  margin-right: 5px;
`
const FlexContainer = styled.div`
  align-items: center;
  display: flex;
`
const StyledButtonGroup = styled(ButtonGroup)`
  & > label {
    padding: 5px;
  }
`
// Move invalid symbol a few pixels down to center vertically inside text fields.
const StyledFormGroup = styled(FormGroup)`
  &.has-feedback label ~ .form-control-feedback {
    top: 28px;
  }
`

/**
 * Create a LocationField location object from a persisted user location object.
 */
function makeLocationFieldLocation(favoriteLocation: UserSavedLocation) {
  const { address, lat, lon } = favoriteLocation
  return {
    lat,
    lon,
    name: address
  }
}

/**
 * Contains the fields for editing a favorite place.
 * This component uses Formik props that are passed
 * within the Formik context set up by FavoritePlaceScreen.
 */
class PlaceEditor extends Component<Props> {
  static contextType = ComponentContext

  _setLocation = (location: Location) => {
    const { intl, setValues, values } = this.props
    const { category, lat, lon, name } = location
    setValues({
      ...values,
      address:
        // If the raw current location is passed without a name attribute (i.e. the address),
        // set the "address" as the formatted coordinates of the current location at that time.
        category === 'CURRENT_LOCATION'
          ? intl.formatMessage({ id: 'common.coordinates' }, { lat, lon })
          : name,
      lat,
      lon
    })
  }

  _handleLocationChange = (e: LocationSelectedEvent) => {
    this._setLocation(e.location)
  }

  _handleGetCurrentPosition = () => {
    const { geocoderConfig, getCurrentPosition, intl } = this.props
    getCurrentPosition(
      intl,
      locationActions.PLACE_EDITOR_LOCATION,
      ({ coords }) => {
        const { latitude: lat, longitude: lon } = coords
        // Populate the "address" field with the coordinates at first.
        // If geocoding succeeds, the resulting address will appear there.
        this._setLocation({
          category: 'CURRENT_LOCATION',
          lat,
          lon
        })
        getGeocoder(geocoderConfig)
          .reverse({ point: coords })
          .then(this._setLocation)
          .catch((err: Error) => {
            console.warn(err)
          })
      }
    )
  }

  render() {
    const { errors, intl, values: place } = this.props
    const { SvgIcon } = this.context
    const isFixed = isHomeOrWork(place)
    const errorStates = getErrorStates(this.props)
    const nameExample = intl.formatMessage({
      id: 'components.PlaceEditor.nameExample'
    })

    return (
      <div>
        {!isFixed && (
          <>
            <StyledFormGroup validationState={errorStates.name}>
              <ControlLabel htmlFor="name">
                <FormattedMessage id="components.PlaceEditor.namePrompt" />
              </ControlLabel>
              {/* onBlur, onChange, and value are passed automatically. */}
              <Field
                aria-invalid={!!errors.name}
                aria-required
                as={FormControl}
                id="name"
                name="name"
                placeholder={nameExample}
              />
              <FormControl.Feedback />
              <HelpBlock role="alert">
                {errorStates.name && (
                  <FormattedValidationError type={errors.name} />
                )}
              </HelpBlock>
            </StyledFormGroup>
            <FormGroup>
              <StyledButtonGroup>
                <legend>
                  <FormattedMessage id="components.PlaceEditor.locationTypePrompt" />
                </legend>
                {Object.keys(CUSTOM_PLACE_TYPES).map((k) => {
                  // @ts-expect-error TODO: add types to CUSTOM_PLACE_TYPES
                  const { icon, type } = CUSTOM_PLACE_TYPES[k]
                  const title = capitalizeFirst(getFormattedPlaces(k, intl))
                  const inputId = `location-type-${type}`
                  const isChecked = place.type === type
                  return (
                    <Fragment key={type}>
                      {/* Note: labels are placed after their respective input <Field>
                          so that the CSS focus selector can be easily applied. */}
                      <Field
                        id={inputId}
                        name="type"
                        type="radio"
                        value={type}
                      />
                      <label
                        className={
                          isChecked
                            ? 'btn btn-primary active'
                            : 'btn btn-default'
                        }
                        htmlFor={inputId}
                      >
                        <StyledIconWrapper size="1.5x">
                          <SvgIcon iconName={icon} />
                        </StyledIconWrapper>
                        <InvisibleA11yLabel>{title}</InvisibleA11yLabel>
                      </label>
                    </Fragment>
                  )
                })}
              </StyledButtonGroup>
            </FormGroup>
          </>
        )}

        <StyledFormGroup validationState={errorStates.address}>
          <ControlLabel>
            <FormattedMessage id="components.PlaceEditor.addressPrompt" />
          </ControlLabel>
          <FlexContainer>
            {/* For fixed places, just show the icon for place type instead of all inputs and selectors */}
            {isFixed && (
              <FixedPlaceIconWrapper size="1.5x">
                <SvgIcon iconName={place.icon} />
              </FixedPlaceIconWrapper>
            )}

            <PlaceLocationField
              className="form-control"
              getCurrentPosition={this._handleGetCurrentPosition}
              inputPlaceholder={
                isFixed
                  ? intl.formatMessage(
                      { id: 'components.PlaceEditor.locationPlaceholder' },
                      { placeName: place.name }
                    )
                  : intl.formatMessage({
                      id: 'components.PlaceEditor.genericLocationPlaceholder'
                    })
              }
              isRequired
              location={makeLocationFieldLocation(place)}
              locationType="to"
              onLocationSelected={this._handleLocationChange}
              selfValidate={!!errorStates.address}
              showClearButton={false}
              static={isMobile()}
            />
          </FlexContainer>
          <FormControl.Feedback />
          <HelpBlock role="alert">
            {errorStates.address && (
              <FormattedValidationError type={errors.address} />
            )}
          </HelpBlock>
        </StyledFormGroup>
      </div>
    )
  }
}

const mapStateToProps = (state: any) => {
  return {
    geocoderConfig: state.otp.config.geocoder
  }
}

const mapDispatchToProps = {
  getCurrentPosition: locationActions.getCurrentPosition
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(PlaceEditor))
