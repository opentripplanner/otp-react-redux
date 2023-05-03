import { IntlShape, useIntl } from 'react-intl'
import {
  LocationFieldProps,
  LocationSelectedEvent
} from '@opentripplanner/location-field/lib/types'
import React, { useCallback } from 'react'

import * as formActions from '../../actions/form'
import * as mapActions from '../../actions/map'

import { StyledLocationField } from './styled'
import connectLocationField from './connect-location-field'

interface Props extends LocationFieldProps {
  handleLocationSelected: (intl: IntlShape, e: LocationSelectedEvent) => void
}

/**
 * Wrapper component around LocationField that handles onLocationSelected.
 */
const LocationFieldWithHandler = ({
  handleLocationSelected,
  ...otherProps
}: Props) => {
  const intl = useIntl()

  const onLocationSelected = useCallback(
    (e: LocationSelectedEvent) => handleLocationSelected(intl, e),
    [intl, handleLocationSelected]
  )

  return (
    <StyledLocationField
      {...otherProps}
      onLocationSelected={onLocationSelected}
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
