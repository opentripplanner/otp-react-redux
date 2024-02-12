import { IntlShape, useIntl } from 'react-intl'
import {
  LocationFieldProps,
  LocationSelectedEvent
} from '@opentripplanner/location-field/lib/types'
import { MapPin } from '@styled-icons/fa-solid'
import React, { useCallback, useContext, useState } from 'react'

import * as formActions from '../../actions/form'
import * as mapActions from '../../actions/map'
import { ComponentContext } from '../../util/contexts'
import { IconWrapper } from '../user/places/place'

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

export function GeocodedOptionIcon({
  feature = {}
}: {
  feature: {
    properties?: { modes?: string[]; source: string }
  }
}): React.ReactElement {
  // FIXME: add types to context
  // @ts-expect-error No type on ComponentContext
  const { ModeIcon } = useContext(ComponentContext)

  const { properties } = feature
  if (feature && properties) {
    const { modes } = properties
    if (modes && modes.length > 0) {
      return (
        <IconWrapper>
          {/* role="img" is syntactically incorrect, but is needed for correct rendering in Webkit */}
          <ModeIcon aria-hidden mode={modes[0].toLowerCase()} role="img" />
        </IconWrapper>
      )
    }
  }
  return <MapPin size={13} />
}

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
      GeocodedOptionIconComponent={GeocodedOptionIcon}
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
