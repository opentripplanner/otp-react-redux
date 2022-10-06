import { TransitOperator } from '@opentripplanner/types'
import { useIntl } from 'react-intl'
import React from 'react'

import { OperatorImg } from '../viewers/RouteRow'

type Props = {
  operator?: TransitOperator
}

const OperatorLogo = ({ operator }: Props): JSX.Element | null => {
  const intl = useIntl()

  if (!operator?.logo) return null

  return (
    <OperatorImg
      alt={intl.formatMessage(
        {
          id: 'components.RouteRow.operatorLogoAltText'
        },
        { operatorName: operator.name }
      )}
      src={operator.logo}
    />
  )
}

export default OperatorLogo
