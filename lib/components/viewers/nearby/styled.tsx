import styled from 'styled-components'

export const NearbySidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.5rem;
`

export const Card = styled.div`
  border-radius: 10px;
  background: white;
  padding: 0 0.5rem;
  display: flex;
  flex-direction: column;
`

export const CardHeader = styled.div`
  font-size: 22px;
  padding-top: 0.5rem;
`

export const StyledAlert = styled.div`
  /* 'clear: both' prevents the date selector from overlapping with the alert. */
  clear: both;
  margin: 0.1rem 0;
  padding: 5px 10px;
  text-align: center;
`

export const PatternRowContainer = styled.ul`
  list-style-type: none;
  padding-left: 0;
  border-radius: 10px;
  box-shadow: 2px 2px 5px 1px rgb(0 0 0/10%);
`
