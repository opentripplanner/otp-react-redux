import styled, { keyframes } from 'styled-components'

/** Route Details */

export const RouteNameContainer = styled.div`
  padding: 8px;
  background-color: inherit;
`

const backgroundColorTransition = keyframes`
    from {
      background-color: white;
    }
`
const fade = keyframes`
    0% { opacity: 0%; }
    100 { opacity: 100%; }
`
const fadeDelay = keyframes`
0% { opacity: 0%; }
50% { opacity: 0% }
100 { opacity: 100%; }
`

export const StyledRouteViewerContainer = styled.div`
  animation: ${(props) => props.patternView && backgroundColorTransition} 150ms
      linear,
    ${(props) => (props.fade ? fade : 'none')} 100ms reverse linear forwards;
  background-color: ${(props) =>
    props.routeColor ? props.routeColor : '#fff'};
  color: ${(props) => (props.textColor ? props.textColor : 'inherit')};
  fill: ${(props) => (props.textColor ? props.textColor : 'inherit')};
  display: flex;
  flex-direction: column;
  flex-flow: column;
  height: 100%;

  & > * {
    animation: ${(props) => props.patternView && fadeDelay} 300ms linear
      forwards;

    @media (prefers-reduced-motion) {
      animation: none;
    }
  }

  @media (prefers-reduced-motion) {
    animation: none;
  }
`

export const Container = styled.div`
  color: ${(props) => (props.full ? props.textColor : 'inherit')};
  height: 100%;
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
  align-items: baseline;
  background-color: inherit;
  color: inherit;
  display: flex;
  gap: 16px;
  justify-content: flex-start;
  margin: 0;
  padding: 8px;

  label { 
    width: 30%;
  }
  
  select {
    color: #333;
    text-overflow: ellipsis;
    width: 100%;
  }
}
`

export const StopContainer = styled.ol`
  color: ${(props) => props?.textColor || '#333'};
  background-color: transparent;
  overflow-y: scroll;
  height: 100%;
  /* 100px bottom padding is needed to ensure all stops 
  are shown when browsers don't calculate 100% sensibly */
  padding: 15px 0 100px;
`
export const StopLink = styled.button`
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
export const Stop = styled.li`
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
