import { DropdownSelector } from '@opentripplanner/trip-form'
import { FormattedMessage, useIntl } from 'react-intl'
import { QueryParamChangeEvent } from '@opentripplanner/trip-form/lib/types'
import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

const VisibleSubheader = styled.h2`
  display: block;
  font-size: 18px;
  font-weight: 700;
  height: auto;
  margin: 1em 0;
  position: static;
  width: auto;
`

const MobilityProfileContainer = styled.div`
  margin: 60px 0 60px 5px;
`

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
    <MobilityProfileContainer>
      <VisibleSubheader>
        <FormattedMessage id="components.MobilityProfile.MobilityPane.header" />
      </VisibleSubheader>
      <FormattedMessage id="components.MobilityProfile.MobilityPane.planTripDescription" />
      <MobilityProfileDropdown
        label={intl.formatMessage({
          id: 'components.MobilityProfile.dropdownLabel'
        })}
        name={name}
        onChange={onMobilityProfileChange}
        options={options}
        value={selectedProfile}
      />
    </MobilityProfileContainer>
  )
}

export default MobilityProfileSelector
