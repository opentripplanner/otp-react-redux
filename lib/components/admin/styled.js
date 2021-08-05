import { Button as BsButton } from 'react-bootstrap'
import styled, {css} from 'styled-components'

import Icon from '../narrative/icon'

import DefaultCounter from './call-time-counter'

// Call Taker Controls Components

const RED = '#C35134'
const BLUE = '#1C4D89'
const GREEN = '#6B931B'
const PURPLE = '#8134D3'

const circleButtonStyle = css`
  border: none;
  border-radius: 50%;
  box-shadow: 2px 2px 4px #000000;
  color: white;
  position: absolute;
  z-index: 999999;
`

export const CallHistoryButton = styled.button`
  ${circleButtonStyle}
  background-color: ${GREEN};
  height: 40px;
  margin-left: 69px;
  top: 140px;
  width: 40px;
`

export const CallTimeCounter = styled(DefaultCounter)`
  background-color: ${BLUE};
  border-radius: 20px;
  box-shadow: 2px 2px 4px #000000;
  color: white;
  font-weight: 600;
  margin-left: -8px;
  position: absolute;
  text-align: center;
  top: 241px;
  width: 80px;
  z-index: 999999;
`

export const ControlsContainer = styled.div`
  position: relative;
`

export const FieldTripsButton = styled.button`
  ${circleButtonStyle}
  background-color: ${PURPLE};
  height: 50px;
  margin-left: 80px;
  top: 190px;
  width: 50px;
`

export const ToggleCallButton = styled.button`
  ${circleButtonStyle}
  background-color: ${props => props.callInProgress ? RED : BLUE};
  height: 80px;
  margin-left: -8px;
  top: 154px;
  width: 80px;
`

// Field Trip Windows Components

export const Bold = styled.strong``

export const Button = styled(BsButton)`
  margin-left: 5px;
`

export const Container = styled.div`
  display: flex;
  flex-flow: row wrap;
`

export const Half = styled.div`
  width: 50%
`

export const CallRecordRow = styled.div`

`

export const CallRecordButton = styled.button`
  display: flex;
  flexDirection: row;
  width: 100%;
`

export const CallRecordIcon = styled(Icon)`
  margin-right: 3px;
  padding-top: 4px;
`

// Make sure button extends to end of window.
export const FieldTripRecordButton = styled.button`
  display: inline-block;
  width: 100%;
  width: -moz-available;
  width: -webkit-fill-available;
  width: fill-available;
`

export const Full = styled.div`
  width: 100%
`

export const FullWithMargin = styled(Full)`
  margin-top: 10px;
`

export const Header = styled.h4`
  margin-bottom: 5px;
  width: 100%;
`

export const InlineHeader = styled(Header)`
  display: inline;
`

export const textCss = css`
  font-size: 0.9em;
  margin-bottom: 0px;
`

export const Para = styled.p`
  ${textCss}
`

export const QueryList = styled.ul`
  list-style: none;
  margin-left: 22px;
  padding-left: 0;
`

export const Text = styled.span`
  ${textCss}
`

export const Val = styled.span`
  :empty:before {
    color: #685C5C; /* from "gray" to meet WCAG */
    content: 'N/A';
  }
`

export const WindowHeader = styled.h3`
  font-size: 18px;
  margin-bottom: 10px;
  margin-top: 10px;
`

// Mailables components

export const MailablesList = styled.div`
  max-height: 120px;
  overflow-y: scroll;
`

const mailableItemCss = css`
  background-color: #eaeaea;
  display: block;
  margin: 0px 0px 2px 0px;
  max-width: 290px;
  padding: 3px 2px;
  width: 100%;
`

export const SelectableMailableButton = styled.button`
  ${mailableItemCss}
`

export const SelectedMailableContainer = styled.div`
  ${mailableItemCss}
`

export const SelectedMailableOptionsContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`
