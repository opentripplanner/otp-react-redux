import {
  ControlLabel,
  FormControl,
  FormGroup,
  HelpBlock
} from 'react-bootstrap'
import { Field, FormikProps } from 'formik'
import { FormattedMessage, injectIntl, IntlShape } from 'react-intl'
import coreUtils from '@opentripplanner/core-utils'
import React, { Component, Fragment } from 'react'
import styled from 'styled-components'
import type { Location } from '@opentripplanner/types'
import type { WrappedComponentProps } from 'react-intl'

import { capitalizeFirst, getErrorStates } from '../../../util/ui'
import { ComponentContext } from '../../../util/contexts'
import { CUSTOM_PLACE_TYPES, isHomeOrWork } from '../../../util/user'
import { getFormattedPlaces } from '../../../util/i18n'
import { StyledIconWrapper } from '../../util/styledIcon'
import ButtonGroup from '../../util/button-group'
import FormattedValidationError from '../../util/formatted-validation-error'
import InvisibleA11yLabel from '../../util/invisible-a11y-label'

import {
  makeLocationFieldLocation,
  PlaceLocationField
} from './place-location-field'

// TODO: Share with OTP middleware user types.
interface Fields {
  address?: string
  icon?: string
  lat?: number
  lon?: number
  name?: string
  type?: string
}

type Props = WrappedComponentProps & FormikProps<Fields>

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
 * Contains the fields for editing a favorite place.
 * This component uses Formik props that are passed
 * within the Formik context set up by FavoritePlaceScreen.
 */
class PlaceEditor extends Component<Props> {
  static contextType = ComponentContext

  _handleLocationChange = (
    _: IntlShape, // Ignore intl object.
    { location }: { location: Location }
  ) => {
    const { setTouched, setValues, values } = this.props
    const { lat, lon, name } = location
    setValues({
      ...values,
      address: name,
      lat,
      lon
    })
    setTouched({ address: true })
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
              isValid={!!errors.address}
              location={makeLocationFieldLocation(place)}
              locationType="to"
              onLocationSelected={this._handleLocationChange}
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

export default injectIntl(PlaceEditor)
