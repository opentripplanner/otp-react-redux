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
  options,
  setQueryParam,
  value
}: {
  name: string
  options: {
    text: string
    value: string
  }[]
  setQueryParam: (args: Record<string, unknown>) => void
  value?: string
}): JSX.Element => {
  const intl = useIntl()
  const [selectedProfile, setSelectedProfile] = useState<string | undefined>(
    value
  )

  const onMobilityProfileChange = useCallback(
    (evt: QueryParamChangeEvent) => {
      const value = evt[name]
      setSelectedProfile(value as string)
      setQueryParam({
        [name]: value
      })
    },
    [name, setSelectedProfile, setQueryParam]
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
