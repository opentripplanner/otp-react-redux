import { TransitOperator } from '@opentripplanner/types'
import React from 'react'
import styled from 'styled-components'

const OperatorImg = styled.img`
  height: 25px;
`

type Props = {
  alt?: string
  operator?: TransitOperator
}

const OperatorLogo = ({ alt, operator }: Props): JSX.Element | null => {
  if (!operator?.logo) return null
  return <OperatorImg alt={alt || operator.name} src={operator.logo} />
}

export default OperatorLogo
