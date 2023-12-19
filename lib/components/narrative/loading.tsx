import { Redo } from '@styled-icons/fa-solid/Redo'
import React from 'react'

import { StyledIconWrapper } from '../util/styledIcon'

type Props = {
  extraSmall?: boolean
  small?: boolean
}

const Loading = ({ extraSmall, small }: Props): JSX.Element => {
  return (
    <div className="text-center percy-hide">
      <StyledIconWrapper size={small ? '3x' : extraSmall ? '1x' : '5x'} spin>
        <Redo />
      </StyledIconWrapper>
    </div>
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
