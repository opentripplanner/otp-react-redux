import { Field, FormikProps } from 'formik'
import {
  FormControl,
  FormGroup,
  HelpBlock,
  ToggleButton,
  ToggleButtonGroup
} from 'react-bootstrap'
import { injectIntl, IntlShape } from 'react-intl'
import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'
import styled from 'styled-components'
import type { Location } from '@opentripplanner/types'
import type { WrappedComponentProps } from 'react-intl'

import { capitalizeFirst, getErrorStates } from '../../../util/ui'
import { ComponentContext } from '../../../util/contexts'
import { CUSTOM_PLACE_TYPES, isHomeOrWork } from '../../../util/user'
import { getFormattedPlaces } from '../../../util/i18n'
import { StyledIconWrapper } from '../../util/styledIcon'
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
const StyledToggleButtonGroup = styled(ToggleButtonGroup)`
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
    const namePlaceholder = intl.formatMessage({
      id: 'components.PlaceEditor.namePlaceholder'
    })

    return (
      <div>
        {!isFixed && (
          <>
            <FormGroup validationState={errorStates.name}>
              <InvisibleA11yLabel as="label" htmlFor="name">
                {namePlaceholder}
              </InvisibleA11yLabel>
              {/* onBlur, onChange, and value are passed automatically. */}
              <Field
                as={FormControl}
                id="name"
                name="name"
                placeholder={namePlaceholder}
              />
              <FormControl.Feedback />
              {errors.name && (
                <HelpBlock>
                  <FormattedValidationError type={errors.name} />
                </HelpBlock>
              )}
            </FormGroup>
            <FormGroup>
              <StyledToggleButtonGroup
                defaultValue={place.type}
                name="type"
                type="radio"
              >
                {Object.keys(CUSTOM_PLACE_TYPES).map((k) => {
                  // @ts-expect-error TODO: add types to CUSTOM_PLACE_TYPES
                  const { icon, type } = CUSTOM_PLACE_TYPES[k]
                  const title = capitalizeFirst(getFormattedPlaces(k, intl))
                  return (
                    <ToggleButton
                      key={type}
                      // onBlur and onChange have to be set on individual controls instead of the control group
                      // in order for Formik to correctly process the changes.
                      onBlur={handleBlur}
                      onChange={handleChange}
                      title={title}
                      value={type}
                    >
                      <StyledIconWrapper size="1.5x">
                        <SvgIcon iconName={icon} />
                      </StyledIconWrapper>
                    </ToggleButton>
                  )
                })}
              </StyledToggleButtonGroup>
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
