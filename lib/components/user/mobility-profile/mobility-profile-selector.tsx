import { DropdownSelector } from '@opentripplanner/trip-form'
import { QueryParamChangeEvent } from '@opentripplanner/trip-form/lib/types'
import { useIntl } from 'react-intl'
import React, { useCallback, useState } from 'react'
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
  value = 'None'
}: {
  name: string
  onSettingsUpdate: (args: Record<string, unknown>) => void
  options: {
    text: string
    value: string
  }[]
  value?: string
}): JSX.Element => {
  const intl = useIntl()
  const [selectedProfile, setSelectedProfile] = useState<string>(value)

  const onMobilityProfileChange = useCallback(
    (evt: QueryParamChangeEvent) => {
      const value = evt[name]
      setSelectedProfile(value as string)
      onSettingsUpdate({ [name]: value })
    },
    [name, setSelectedProfile, onSettingsUpdate]
  )

  return (
    <MobilityProfileDropdown
      label={intl.formatMessage({
        id: 'components.MobilityProfile.dropdownLabel'
      })}
      name={name}
      onChange={onMobilityProfileChange}
      options={options}
      value={selectedProfile}
    />
  )
}

export default MobilityProfileSelector
