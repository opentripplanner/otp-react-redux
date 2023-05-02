import { Redo } from '@styled-icons/fa-solid/Redo'
import React from 'react'

import { StyledIconWrapper } from '../util/styledIcon'

type Props = {
  small?: boolean
}

const Loading = ({ small }: Props): JSX.Element => {
  return (
    <p className="text-center percy-hide" style={{ marginTop: '15px' }}>
      <StyledIconWrapper size={small ? '3x' : '5x'} spin>
        <Redo />
      </StyledIconWrapper>
    </p>
  )
}

const InlineLoading = (): JSX.Element => {
  return (
    <StyledIconWrapper spin>
      <Redo />
    </StyledIconWrapper>
  )
}

export default Loading
export { InlineLoading }
