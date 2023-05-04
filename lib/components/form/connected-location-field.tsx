import { Input, MenuItemA } from '@opentripplanner/location-field/lib/styled'
import { IntlShape, useIntl } from 'react-intl'
import {
  LocationFieldProps,
  LocationSelectedEvent
} from '@opentripplanner/location-field/lib/types'
import LocationField from '@opentripplanner/location-field'
import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

import * as formActions from '../../actions/form'
import * as mapActions from '../../actions/map'

import connectLocationField from './connect-location-field'

type Props = Omit<
  LocationFieldProps,
  'geocoderConfig' | 'getCurrentPosition'
> & {
  handleLocationSelected: (intl: IntlShape, e: LocationSelectedEvent) => void
  selfValidate?: boolean
}

const StyledLocationField = styled(LocationField)`
  display: grid;
  grid-template-columns: 30px 1fr 30px;
  width: 100%;

  ${Input} {
    padding: 6px 12px;
  }

  ${MenuItemA} {
    text-decoration: none;
    &:hover {
      color: inherit;
    }
  }

  ${MenuItemA}:hover {
    color: #333;
  }
`

const ConnectedLocationField = connectLocationField(StyledLocationField, {
  includeLocation: true
})

/**
 * Wrapper component around LocationField that handles onLocationSelected.
 */
const LocationFieldWithHandler = ({
  clearLocation,
  handleLocationSelected,
  selfValidate,
  ...otherProps
}: Props) => {
  const intl = useIntl()
  const [fieldChanged, setFieldChanged] = useState(false)

  const onLocationSelected = useCallback(
    (e: LocationSelectedEvent) => {
      setFieldChanged(true)
      handleLocationSelected(intl, e)
    },
    [intl, handleLocationSelected, setFieldChanged]
  )

  const onClearLocation = useCallback(
    (e) => {
      setFieldChanged(true)
      clearLocation && clearLocation(e)
    },
    [clearLocation, setFieldChanged]
  )

  return (
    <ConnectedLocationField
      {...otherProps}
      clearLocation={onClearLocation}
      onLocationSelected={onLocationSelected}
      selfValidate={selfValidate || fieldChanged}
    />
  )
}

export default connectLocationField(LocationFieldWithHandler, {
  actions: {
    clearLocation: formActions.clearLocation,
    handleLocationSelected: mapActions.onLocationSelected
  },
  includeLocation: true
})
