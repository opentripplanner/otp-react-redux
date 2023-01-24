import React, { ReactElement } from 'react'
import styled from 'styled-components'

interface Props {
  children: React.ReactNode
}

export default function Alert({ children }: Props): ReactElement {
  const TripDescription = styled.div`
    background-color: rgba(19, 193, 193, 0.2);
    border-radius: 5px;
    box-shadow: 2px 2px 5px 1px rgba(0, 0, 0, 0.02);
    font-size: 12px;
    margin-bottom: 1em;
    padding: 0.75em 1em;
  `

  return <TripDescription>{children}</TripDescription>
}
