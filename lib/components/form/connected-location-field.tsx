import { IntlShape, useIntl } from 'react-intl'
import {
  LocationFieldProps,
  LocationSelectedEvent
} from '@opentripplanner/location-field/lib/types'
import React, { useCallback, useState } from 'react'

import * as formActions from '../../actions/form'
import * as mapActions from '../../actions/map'

import { StyledLocationField } from './styled'
import connectLocationField from './connect-location-field'

type Props = Omit<
  LocationFieldProps,
  'geocoderConfig' | 'getCurrentPosition'
> & {
  handleLocationSelected: (intl: IntlShape, e: LocationSelectedEvent) => void
  selfValidate?: boolean
}

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
