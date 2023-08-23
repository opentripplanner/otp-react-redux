import { FormattedMessage } from 'react-intl'
import React from 'react'

interface Props {
  departArrive: string
  time: number
}

/**
 * Returns a FormattedMessage component for date time preview strings such that i18n IDs
 * are hardcoded and can be kept track of by format.js CLI tools
 */
const FormattedTimePreview = ({
  departArrive,
  time
}: Props): JSX.Element | null => {
  if (isNaN(time)) return <>---</>
  switch (departArrive) {
    case 'NOW':
      return <FormattedMessage id="components.DateTimePreview.leaveNow" />
    case 'DEPART':
      return (
        <FormattedMessage
          id="components.DateTimePreview.departAt"
          values={{ departTime: time }}
        />
      )
    case 'ARRIVE':
      return (
        <FormattedMessage
          id="components.DateTimePreview.arriveAt"
          values={{ arriveTime: time }}
        />
      )
    default:
      return null
  }
}

export default FormattedTimePreview
