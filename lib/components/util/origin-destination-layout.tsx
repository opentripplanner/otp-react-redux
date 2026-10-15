import { IntlShape } from 'react-intl'
import LocationIcon from '@opentripplanner/location-icon'
import React from 'react'
import styled from 'styled-components'

const ICON_SIZE = 14

export const TextWIcon = styled.div`
  align-items: flex-start;
  display: flex;
  gap: 7px;
  justify-content: left;
  // TODO: Do this in grid
  svg {
    flex-shrink: 0;
  }
`

const OriginDestination = ({
  from,
  intl,
  to
}: {
  from: any
  intl: IntlShape
  to: any
}) => {
  return (
    <>
      <TextWIcon>
        {/* Location Icon does not allow a title prop so use a span wrapper for a title tooltip */}
        <span
          title={intl.formatMessage({
            id: 'components.BatchSettings.origin'
          })}
        >
          <LocationIcon size={ICON_SIZE} type="from" />
        </span>
        <span>{from}</span>
      </TextWIcon>
      <TextWIcon>
        <span
          title={intl.formatMessage({
            id: 'components.BatchSettings.destination'
          })}
        >
          <LocationIcon size={ICON_SIZE} type="to" />
        </span>
        <span>{to}</span>
      </TextWIcon>
    </>
  )
}

export default OriginDestination
