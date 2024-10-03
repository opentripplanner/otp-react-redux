import { TransitOperator } from '@opentripplanner/types'
import React from 'react'
import styled from 'styled-components'

const OperatorImg = styled.img<{ marginRight?: number; maxHeight?: number }>`
  &:not(:last-of-type) {
    margin-right: 0.5ch;
  }
  width: 25px;
`

const StyledOperatorImg = styled(OperatorImg)`
  margin-right: 0.5ch;
  max-height: 1em;
  // Make sure icons stay square
  max-width: 1em;
`

type Props = {
  alt?: string
  operator?: TransitOperator
  styled?: boolean
}

const OperatorLogo = ({ alt, operator, styled }: Props): JSX.Element | null => {
  if (!operator?.logo) return null
  if (styled)
    return <StyledOperatorImg alt={alt || operator.name} src={operator.logo} />

  return <OperatorImg alt={alt || operator.name} src={operator.logo} />
}

export default OperatorLogo
