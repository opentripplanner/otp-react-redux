import { DropdownSelector } from '@opentripplanner/trip-form'
import { QueryParamChangeEvent } from '@opentripplanner/trip-form/lib/types'
import { useIntl } from 'react-intl'
import React, { useCallback } from 'react'
import styled from 'styled-components'

const MobilityProfileDropdown = styled(DropdownSelector)`
  margin: 20px 0px;
  label {
    padding-left: 0;
  }
`

const MobilityProfileSelector = ({
  name,
  onSettingsUpdate,
  options,
  value
}: {
  name: string
  onSettingsUpdate: (args: Record<string, unknown>) => void
  options: {
    text: string
    value: string
  }[]
  value: string
}): JSX.Element => {
  const intl = useIntl()

  const onMobilityProfileChange = useCallback(
    (evt: QueryParamChangeEvent) => {
      const paramValue = evt[name]
      onSettingsUpdate({ [name]: paramValue })
    },
    [name, onSettingsUpdate]
  )

  return (
    <MobilityProfileDropdown
      label={intl.formatMessage({
        id: 'components.MobilityProfile.dropdownLabel'
      })}
      name={name}
      onChange={onMobilityProfileChange}
      options={options}
      value={value}
    />
  )
}

export default MobilityProfileSelector
