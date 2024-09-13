import { TransitOperator } from '@opentripplanner/types'
import React from 'react'
import styled from 'styled-components'

const OperatorImg = styled.img<{ marginRight?: number; maxHeight?: number }>`
  &:not(:last-of-type) {
    margin-right: 0.5ch;
  }
  margin-right: ${(props) => props.marginRight && props.marginRight}ch;
  max-height: ${(props) => props.maxHeight && props.maxHeight}em;
  // Make sure icons stay square
  max-width: ${(props) => props.maxHeight && props.maxHeight}em;
  width: 25px;
`

type Props = {
  alt?: string
  marginRight?: number
  maxHeight?: number
  operator?: TransitOperator
}

const OperatorLogo = ({
  alt,
  marginRight,
  maxHeight,
  operator
}: Props): JSX.Element | null => {
  if (!operator?.logo) return null
  return (
    <OperatorImg
      alt={alt || operator.name}
      marginRight={marginRight}
      maxHeight={maxHeight}
      src={operator.logo}
    />
  )
}

export default OperatorLogo
