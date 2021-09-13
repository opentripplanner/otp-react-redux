import { Field } from 'formik'
import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'
import {
  FormControl,
  FormGroup,
  HelpBlock,
  ToggleButton,
  ToggleButtonGroup
} from 'react-bootstrap'
import { FormattedMessage, injectIntl } from 'react-intl'
import styled from 'styled-components'

import Icon from '../../util/icon'
import { capitalizeFirst, getErrorStates } from '../../../util/ui'
import { CUSTOM_PLACE_TYPES, isHomeOrWork } from '../../../util/user'

import {
  makeLocationFieldLocation,
  PlaceLocationField
} from './place-location-field'

const { isMobile } = coreUtils.ui

// Styled components
const LargeIcon = styled(Icon)`
  font-size: 150%;
`
const FixedPlaceIcon = styled(LargeIcon)`
  margin-right: 10px;
  padding-top: 6px;
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
    const { errors, handleBlur, handleChange, intl, values: place } = this.props
    const isFixed = isHomeOrWork(place)
    const errorStates = getErrorStates(this.props)
    const namePlaceholder = intl.formatMessage({id: 'components.PlaceEditor.namePlaceholder'})

    return (
      <div>
        {!isFixed && (
        <>
          <FormGroup validationState={errorStates.name} >
            {/* onBlur, onChange, and value are passed automatically. */}
            <Field aria-label={namePlaceholder}
              as={FormControl}
              name='name'
              placeholder={namePlaceholder}
            />
            <FormControl.Feedback />
            {errors.name && (
              <HelpBlock>
                <FormattedMessage id={errors.name} />
              </HelpBlock>
            )}
          </FormGroup>

          <FormGroup>
            <StyledToggleButtonGroup
              defaultValue={place.type}
              name='type'
              type='radio'
            >
              {Object.keys(CUSTOM_PLACE_TYPES).map(k => {
                const { icon, type } = CUSTOM_PLACE_TYPES[k]
                const title = capitalizeFirst(intl.formatMessage({id: `common.places.${k}`}))
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
                    <LargeIcon name={icon} />
                  </ToggleButton>
                )
              })}
            </StyledToggleButtonGroup>
          </FormGroup>
        </>
        )}

        <FlexContainer>
          {/* For fixed places, just show the icon for place type instead of all inputs and selectors */}
          {isFixed && <FixedPlaceIcon name={place.icon} />}

          <FlexFormGroup validationState={errorStates.address}>
            <PlaceLocationField
              className='form-control'
              inputPlaceholder={intl.formatMessage(
                {
                  id: `components.PlaceEditor.${isFixed ? 'locationPlaceholder' : 'genericLocationPlaceholder'}`
                },
                {
                  // Rendered only for fixed locations
                  placeName: place.name
                }
              )}
              location={makeLocationFieldLocation(place)}
              locationType='to'
              onLocationSelected={this._handleLocationChange}
              showClearButton={false}
              static={isMobile()}
            />
            <FormControl.Feedback />
            {errors.address && (
              <HelpBlock>
                <FormattedMessage id={errors.address} />
              </HelpBlock>
            )}
          </FlexFormGroup>
        </FlexContainer>
      </div>
    )
  }
}

export default injectIntl(PlaceEditor)
