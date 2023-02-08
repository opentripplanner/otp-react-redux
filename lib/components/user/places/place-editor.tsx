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
  display: flex;
`
const FlexFormGroup = styled(FormGroup)`
  flex-grow: 1;
`
const StyledButtonGroup = styled(ButtonGroup)`
  & > label {
    padding: 5px;
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
    const { errors, handleBlur, handleChange, intl, values: place } = this.props
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
            <FormGroup validationState={errorStates.name}>
              <ControlLabel htmlFor="name">
                <FormattedMessage id="components.PlaceEditor.namePrompt" />
              </ControlLabel>
              {/* onBlur, onChange, and value are passed automatically. */}
              <Field
                as={FormControl}
                id="name"
                name="name"
                placeholder={nameExample}
              />
              <FormControl.Feedback />
              {errors.name && (
                <HelpBlock>
                  <FormattedValidationError type={errors.name} />
                </HelpBlock>
              )}
            </FormGroup>
            <FormGroup>
              <StyledButtonGroup>
                <legend>
                  <FormattedMessage id="components.PlaceEditor.locationTypePrompt" />
                </legend>
                {Object.keys(CUSTOM_PLACE_TYPES).map((k, index) => {
                  // @ts-expect-error TODO: add types to CUSTOM_PLACE_TYPES
                  const { icon, type } = CUSTOM_PLACE_TYPES[k]
                  const title = capitalizeFirst(getFormattedPlaces(k, intl))
                  const inputId = `location-type-${type}`
                  const isChecked = place.type === type
                  return (
                    <Fragment key={type}>
                      {/* Note: labels are placed after inputs so that the CSS focus selector can be easily applied. */}
                      <input
                        checked={isChecked}
                        id={inputId}
                        name="type"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        type="radio"
                        value={type}
                      />
                      <label
                        className={`btn ${
                          isChecked ? 'btn-primary active' : 'btn-default'
                        }`}
                        htmlFor={inputId}
                        // An inline style needs to be used for the first element.
                        // The bootstrap CSS will otherwise override .btn:first-child content.
                        style={
                          index === 0
                            ? {
                                borderBottomLeftRadius: '4px',
                                borderTopLeftRadius: '4px'
                              }
                            : {}
                        }
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

        <FlexContainer>
          {/* For fixed places, just show the icon for place type instead of all inputs and selectors */}
          {isFixed && (
            <FixedPlaceIconWrapper size="1.5x">
              <SvgIcon iconName={place.icon} />
            </FixedPlaceIconWrapper>
          )}

          <FlexFormGroup validationState={errorStates.address}>
            <ControlLabel>
              <FormattedMessage id="components.PlaceEditor.addressPrompt" />
            </ControlLabel>
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
              location={makeLocationFieldLocation(place)}
              locationType="to"
              onLocationSelected={this._handleLocationChange}
              showClearButton={false}
              static={isMobile()}
            />
            <FormControl.Feedback />
            {errors.address && (
              <HelpBlock>
                <FormattedValidationError type={errors.address} />
              </HelpBlock>
            )}
          </FlexFormGroup>
        </FlexContainer>
      </div>
    )
  }
}

export default injectIntl(PlaceEditor)
