import styled, { css } from 'styled-components'

import { getBaseColor, grey } from '../util/colors'

export interface RenderProps {
  backgroundColor?: string
  full?: boolean
  routeColor?: string
  textColor?: string
  useRouteColorAsBg?: boolean
}

/** Route Details */
export const Container = styled.div<RenderProps>`
  background-color: ${(props) =>
    props.full ? props.backgroundColor || grey[100] : 'inherit'};
  color: ${(props) => (props.full ? props.textColor : 'inherit')};
  height: 100%;
  overflow-y: hidden;
`

export const RouteNameContainer = styled.div`
  padding: 8px;
  background-color: inherit;
`
export const LogoLinkContainer = styled.div<{
  textColor?: string
  useRouteBgColor?: boolean
}>`
  display: flex;
  border-top: 1px solid
    ${(props) => (props.useRouteBgColor ? props.textColor + '33' : '#33333333')};
  align-items: center;
  gap: 10px;
  padding: 15px 10px;
  margin-top: -10px;

  a {
    color: ${(props) => props.textColor};
    svg {
      color: ${(props) =>
        props.useRouteBgColor ? props.textColor : getBaseColor()};
    }
  }
`

const headsignStyle = css`
  font-size: 18px;
  margin-bottom: 0;
`

export const HeadsignSelectLabel = styled.label`
  ${headsignStyle}
`

export const HeadsignLabel = styled.span`
  ${headsignStyle}
  font-weight: bold;
  width: auto !important;
`

export const PatternContainer = styled.div`
  align-items: center;
  background-color: inherit;
  color: inherit;
  display: flex;
  justify-content: space-between;
  padding: 8px 10px;

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
