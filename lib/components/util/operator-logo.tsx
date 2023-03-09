import { TransitOperator } from '@opentripplanner/types'
import React from 'react'
import styled from 'styled-components'

const OperatorImg = styled.img`
  height: 25px;
`

type Props = {
  operator?: TransitOperator
}

const OperatorLogo = ({ operator }: Props): JSX.Element | null => {
  if (!operator?.logo) return null
  return <OperatorImg alt={operator.name} src={operator.logo} />
}

export default OperatorLogo
