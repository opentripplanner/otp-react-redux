import { connect } from 'react-redux'
import {
  DropdownContainer,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  MenuItemA
} from '@opentripplanner/location-field/lib/styled'
import { LocationFieldProps } from '@opentripplanner/location-field/lib/types'
import LocationField from '@opentripplanner/location-field'
import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

import * as formActions from '../../actions/form'
import * as mapActions from '../../actions/map'

import connectLocationField from './connect-location-field'

interface Props extends LocationFieldProps {
  selfValidate?: boolean
}

const StyledLocationField = styled(LocationField)`
  width: 100%;

  ${DropdownContainer} {
    display: grid;
    grid-template-columns: 30px 1fr 30px;
  }

  ${FormGroup} {
    display: table;
    padding: 6px 12px;
    width: 100%;
  }

  ${Input} {
    padding: 6px 12px;
  }

  ${InputGroup} {
    width: 100%;
  }

  ${InputGroupAddon} {
    align-self: baseline;
    justify-self: center;
  }

  ${MenuItemA} {
    text-decoration: none;
  }

  ${MenuItemA}:hover {
    color: #333;
  }
`

const ConnectedLocationField = connectLocationField(StyledLocationField, {
  includeLocation: true
})

const LocationFieldWithChangedState = ({
  onClearLocation,
  onLocationSelected,
  selfValidate,
  ...otherProps
}: Props): JSX.Element => {
  const [fieldChanged, setFieldChanged] = useState(false)

  const handleLocationSelected = useCallback(
    (intl, e) => {
      setFieldChanged(true)
      onLocationSelected(intl, e)
    },
    [onLocationSelected, setFieldChanged]
  )

  const handleClearLocation = useCallback(
    (e) => {
      setFieldChanged(true)
      onClearLocation(e)
    },
    [onClearLocation, setFieldChanged]
  )

  return (
    <ConnectedLocationField
      {...otherProps}
      onClearLocation={handleClearLocation}
      onLocationSelected={handleLocationSelected}
      selfValidate={selfValidate || fieldChanged}
    />
  )
}

const mapDispatchToProps = {
  clearLocation: formActions.clearLocation,
  onLocationSelected: mapActions.onLocationSelected
}

export default connect(null, mapDispatchToProps)(LocationFieldWithChangedState)
