import { blue, DARK_TEXT_GREY, getBaseColor, grey } from '../util/colors'
import styled from 'styled-components'

interface RenderProps {
  backgroundColor?: string
  full?: boolean
  routeColor?: string
  textColor?: string
}

/** Route Details */
export const Container = styled.div<RenderProps>`
  height: 100%;
  overflow-y: hidden;
`

export const RouteNameContainer = styled.div`
  padding: 8px;
  background-color: inherit;
`
export const LogoLinkContainer = styled.div`
  display: flex;
  box-shadow: rgba(50, 50, 93, 0.25) 0px 13px 27px -5px,
    rgba(0, 0, 0, 0.3) 0px 8px 16px -8px;
  align-items: center;
  gap: 10px;
  padding: 15px;
  margin-top: -10px;

  a {
    color: #333;
    svg {
      color: ${getBaseColor()};
    }
  }
`
export const HeadsignSelectLabel = styled.label`
  font-size: 18px;
  margin-bottom: 0;
`

export const PatternContainer = styled.div`
  align-items: center;
  background-color: inherit;
  color: inherit;
  display: flex;
  justify-content: space-between;
  margin: 0;
  padding: 8px;

  label {
    width: 15%;
  }

  // Styling for SortResultsDropdown

  & > span {
    width: 80%;

    button#headsign-selector-label {
      align-items: center;
      display: flex;
      justify-content: space-between;
      width: 95%;

      span {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
    }
  }
`

export const StopContainer = styled.ol<RenderProps>`
  color: ${(props) => props?.textColor || DARK_TEXT_GREY};
  overflow-y: scroll;
  /* Calculate the height of the container a little short to ensure all stops 
  are shown when browsers don't calculate 100% sensibly. */
  height: calc(100% - 140px);
  padding: 15px 0 0px;
`
export const StopLink = styled.button<RenderProps>`
  color: ${DARK_TEXT_GREY};
  background-color: transparent;
  border: none;
  padding: 0;
  text-align: left;
  width: 95%;

  &:hover {
    color: ${blue[900]};
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
    border: 5px solid ${(props) => props.routeColor};
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
    background: ${(props) => props.routeColor};
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

export const PatternRowItem = styled.li`
  list-style-type: none;

  & .header {
    align-items: center;
    display: grid;
    grid-template-columns: 2fr 1fr;
    overflow: hidden;
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
