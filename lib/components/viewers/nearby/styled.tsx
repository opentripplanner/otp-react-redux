import styled from 'styled-components'

export const FloatingLoadingIndicator = styled.div`
  aspect-ratio: 1;
  background: white;
  border-radius: 1rem;
  color: black;
  left: 0px;
  margin: 5px;
  padding: 3px;
  position: fixed;
`

export const NearbySidebarContainer = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 1em;
  padding: 0 1em;
  list-style: none;
`

export const Card = styled.div`
  background: white;
  border-radius: 10px;
  color: #222;
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  }

  .highlighted & {
    box-shadow: 0 0 6px 0px #facc15, 0 0 0 4px #facc15;
  }
`

export const CardHeader = styled.div`
  align-items: center;
  display: grid;
  grid-template-columns: 25fr 1fr;
  padding: 1rem 1.2rem 0;
`

export const CardTitle = styled.p`
  align-items: center;
  display: flex;
  font-size: 22px;
  font-weight: 600;
  gap: 0.5ch;
  grid-column: 1;
  margin: 0;
  /* Prevent svg and images to be taller than the text. */
  svg {
    max-height: 1em;
  }
`

export const CardSubheader = styled.p`
  color: #444;
  font-size: 16px;
  font-weight: 400;
  grid-column: 1;
  margin: 0;
`

export const CardAside = styled.p`
  color: #444444ba;
  grid-column: -1;
  grid-row: 1;
  text-align: right;
`

export const CardBody = styled.div`
  margin-bottom: 1rem;
  margin-top: 1rem;
  padding: 0rem 1.2rem;
`

export const StyledAlert = styled.div`
  /* 'clear: both' prevents the date selector from overlapping with the alert. */
  clear: both;
  margin: 0.1rem 0;
  padding: 5px 10px;
  text-align: center;
`

export const PatternRowContainer = styled.ul`
  border-radius: 10px;
  box-shadow: 2px 2px 5px 1px rgb(0 0 0/10%);
  list-style-type: none;
  margin: 0;
  padding-left: 0;
`
export const Scrollable = styled.div`
  height: 100%;
  overflow-y: scroll;
`
