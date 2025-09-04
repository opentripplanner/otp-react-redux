import { ArrowLeft } from '@styled-icons/fa-solid'
import React from 'react'
import styled from 'styled-components'

const StyledBackButton = styled.button`
  background: transparent;
  border: none;
`

const BackButton = ({
  closeButtonText,
  id,
  onClick
}: {
  closeButtonText: string
  id: string
  onClick: () => void
}): JSX.Element => {
  return (
    <StyledBackButton
      aria-label={closeButtonText}
      id={id}
      onClick={() => {
        onClick()
      }}
      title={closeButtonText}
    >
      <ArrowLeft size={22} />
    </StyledBackButton>
  )
}

export default BackButton
