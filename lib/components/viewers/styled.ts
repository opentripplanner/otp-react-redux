import styled from 'styled-components'

interface RenderProps {
  backgroundColor?: string
  full?: boolean
  routeColor?: string
  textColor?: string
}

/** Route Details */
export const Container = styled.div<RenderProps>`
  background-color: ${(props) =>
    props.full ? props.backgroundColor || '#ddd' : 'inherit'};
  color: ${(props) => (props.full ? props.textColor : 'inherit')};
  height: 100%;
  overflow-y: hidden;
`

export const RouteNameContainer = styled.div`
  padding: 8px;
  background-color: inherit;
`
export const LogoLinkContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`
export const HeadsignSelectLabel = styled.label`
  font-size: 18px;
`

export const PatternContainer = styled.div`
  align-items: flex-start;
  background-color: inherit;
  color: inherit;
  display: flex;
  gap: 16px;
  justify-content: flex-start;
  margin: 0;
  padding: 8px;

  label { 
    width: 15%;
  }

  // Styling for SortResultsDropdown

  & > span {
    width: 85%;

    button {
      align-items: center;
      display: flex;
      justify-content: space-between;
      width: 95%;

      span {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space nowrap;
      }
      
    }
  }
  }
}
`

export const StopContainer = styled.ol<RenderProps>`
  color: ${(props) => props?.textColor || '#333'};
  background-color: ${(props) => props?.backgroundColor || '#fff'};
  overflow-y: scroll;
  height: 100%;
  /* 100px bottom padding is needed to ensure all stops 
  are shown when browsers don't calculate 100% sensibly */
  padding: 15px 0 100px;
`
export const StopLink = styled.button<RenderProps>`
  color: ${(props) => props?.textColor + 'da' || '#333'};
  background-color: transparent;
  border: none;
  padding: 0;
  text-align: left;
  width: 95%;

  &:hover {
    color: ${(props) => props?.textColor || '#23527c'};
    text-decoration: underline;
  }
`

export const Stop = styled.li<RenderProps>`
  cursor: pointer;
  display: block;
  white-space: nowrap;
  margin-left: 45px;
  /* negative margin accounts for the height of the stop blob */
  margin-top: -28px;

  /* this is the station blob */
  &::before {
    content: '';
    display: block;
    height: 20px;
    width: 20px;
    border: 5px solid ${(props) => props.textColor + 'ee'};
    background: ${(props) => props.routeColor};
    position: relative;
    top: 20px;
    left: -35px;
    border-radius: 20px;
  }

  /* this is the line between the blobs */
  &::after {
    content: '';
    display: block;
    height: 1.65rem; /* set position in line-height agnostic way */
    width: 10px;
    background: ${(props) => props.textColor + 'ee'};
    position: relative;
    left: -30px;
    /* this is a few pixels into the blob (to make it look attached) + 3.5rem so that each
    stop's bar connects the previous bar with the current one */
    top: -3.5rem; /* adjust position in a way that is agnostic to line-height */
  }

  /* hide the first line between blobs */
  &:first-of-type::after {
    background: transparent;
  }
`

export const PatternRowItem = styled.li<{ roundedTop?: boolean }>`
  list-style-type: none;

  & .header {
    align-items: center;
    display: grid;
    grid-template-columns: 2fr 1fr;
    overflow: hidden;
  }

  &:first-of-type .header.stop-view {
    border-top-left-radius: ${({ roundedTop }) => (roundedTop ? '10px' : '0')};
    border-top-right-radius: ${({ roundedTop }) => (roundedTop ? '10px' : '0')};
  }

  &:last-of-type .header.stop-view {
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }
`

export const NextTripPreview = styled.ol`
  display: grid;
  grid-template-rows: fit-content(8ch);
  list-style-type: none;
  padding: 15px;
  text-align: right;
  white-space: nowrap;

  & li:first-of-type {
    font-size: 24px;
    font-weight: 700;
  }
`
