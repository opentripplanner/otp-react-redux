import styled from 'styled-components'

/** Converts text color (either black or white) to rgb */
const textHexToRgb = (color) => (color === '#ffffff' ? '255,255,255' : '0,0,0')

/** Route Details */
export const Container = styled.div`
  background-color: ${(props) => props.backgroundColor};
  color: ${(props) => props.textColor};
  overflow-y: hidden;
  height: 100%;
`
export const RouteNameContainer = styled.div`
  padding: 8px;
  color: ${props => props.textColor};
`
export const LogoLinkContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`
export const MoreDetailsLink = styled.a`
    color: ${(props) => props.color};
    background-color: rgba(${(props) => textHexToRgb(props.color)},0.1);
    padding: 5px;
    display: block;
    border-radius: 5px;
    transition: 0.1s all ease-in-out;

    &:hover {
        background-color: rgba(255,255,255,0.8);
        color: #333;
    }
}
`
export const PatternContainer = styled.div`
  background-color: ${(props) => props.routeColor};
  color: ${(props) => props.textColor};
  display: flex;
  justify-content: flex-start;
  align-items: baseline;
  gap: 16px;
  padding: 0 8px;
  margin: 0;

  overflow-x: scroll;

  h4 {
      margin-bottom: 0px;
      white-space: nowrap;
  }

  button {
      color: inherit;
      border-bottom: 3px solid ${(props) => props.textColor};
  }

  button:hover, button:focus, button:visited {
    text-decoration: none;
  }
  button:hover,  button:focus, button.active {
      color: ${(props) => props.color};
      background-color: ${(props) => props.textColor};
  }
}
`

export const StopContainer = styled.div`
  color: #333;
  background-color: #fff;
  overflow-y: scroll;
  height: 100%;
  /* 150px bottom padding is needed to ensure all stops 
  are shown when browsers don't calculate 100% sensibly */
  padding: 15px 0 100px;
`
export const Stop = styled.a`
  cursor: pointer;
  color: #333;
  display: block;
  white-space: nowrap;
  margin-left: 45px;
  /* negative margin accounts for the height of the stop blob */
  margin-top: -25px;

  &:hover {
    color: #23527c;
  }

  /* this is the station blob */
  &::before {
    content: '';
    display: block;
    height: 20px;
    width: 20px;
    border: 5px solid ${props => props.routeColor};
    background: #fff;
    position: relative;
    top: 20px;
    left: -35px;
    border-radius: 20px;
  }

  /* this is the line between the blobs */
  &::after {
    content: '';
    display: block;
    height: 20px;
    width: 10px;
    background: ${props => props.routeColor};
    position: relative;
    left: -30px;
    /* this is 2px into the blob (to make it look attached) + 30px so that each
    stop's bar connects the previous bar with the current one */
    top: -37px;
  }
`
