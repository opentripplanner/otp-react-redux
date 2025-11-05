import { ArrowLeft } from '@styled-icons/fa-solid'
import React from 'react'
import styled from 'styled-components'

const StyledBackButton = styled.button`
  background: transparent;
  border: none;
`

const BackButton = ({
  backButtonText,
  id,
  onClick
}: {
  backButtonText: string
  id?: string
  onClick: () => void
}): JSX.Element => {
  return (
    <StyledBackButton
      aria-label={backButtonText}
      id={id}
      onClick={() => {
        onClick()
      }}
      title={backButtonText}
    >
      <ArrowLeft size={22} />
    </StyledBackButton>
  )
}

export default BackButton
