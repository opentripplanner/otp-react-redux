import { ArrowRight } from '@styled-icons/fa-solid'
import { FormattedMessage } from 'react-intl'

import { grey } from '../util/colors'
import React from 'react'
import styled from 'styled-components'

interface Props {
  onClick: () => void
}

const StyledTransparentButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  color: ${grey[700]};
  display: flex;
  gap: 7px;
  margin-bottom: 5px;

  float: right;
`

const AdvancedSettingsButton = ({ onClick }: Props): JSX.Element => {
  return (
    <StyledTransparentButton onClick={onClick}>
      <FormattedMessage id="components.BatchSearchScreen.moreOptions" />
      <ArrowRight size={18} />
    </StyledTransparentButton>
  )
}

export default AdvancedSettingsButton
