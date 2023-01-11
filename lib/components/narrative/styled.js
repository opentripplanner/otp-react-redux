import { ButtonGroup } from 'react-bootstrap'
import styled from 'styled-components'

export const FlexButtonGroup = styled(ButtonGroup)`
  display: flex;
  flex: 1;
  margin-top: 5px;
  button {
    flex: 1;
  }
`

export const NarrativeItinerariesContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`

export const SingleModeRowContainer = styled.ul`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 0 0 15px 0;
  gap: 10px;
  list-style: none;

  &:first-of-type {
    margin-top: 15px;
  }
`
