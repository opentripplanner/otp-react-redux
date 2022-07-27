import styled from 'styled-components'

/** Route Details */
export const Container = styled.div`
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
export const PatternContainer = styled.div`
  background-color: inherit;
  color: inherit;
  display: flex;
  justify-content: flex-start;
  align-items: baseline;
  gap: 16px;
  padding: 0 8px 8px;
  margin: 0;

  overflow-x: scroll;

  h4 {
      margin-bottom: 0px;
      white-space: nowrap;
  }

  select {
    color: #333;
  }
}
`

export const StopContainer = styled.div`
  color: ${(props) => props?.textColor || '#333'};
  background-color: ${(props) => props?.backgroundColor || '#fff'};
  overflow-y: scroll;
  height: 100%;
  /* 100px bottom padding is needed to ensure all stops 
  are shown when browsers don't calculate 100% sensibly */
  padding: 15px 0 100px;
`
export const Stop = styled.a`
  cursor: pointer;
  color: ${(props) => props?.textColor + 'da' || '#333'};
  display: block;
  white-space: nowrap;
  margin-left: 45px;
  /* negative margin accounts for the height of the stop blob */
  margin-top: -28px;

  &:hover {
    color: ${(props) => props?.textColor || '#23527c'};
  }

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
