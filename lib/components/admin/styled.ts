import { Button as BsButton } from 'react-bootstrap'
import styled, { css } from 'styled-components'

import { blue } from '../util/colors'
import { NavbarButton } from '../app/nav-item'

import DefaultCounter from './call-time-counter'

// Call Taker Controls Components

export const CallTimeCounter = styled(DefaultCounter)``

export const ControlsContainer = styled.div``

type ToggleCallButtonProps = {
  callInProgress?: boolean
}

export const ToggleCallButton = styled(NavbarButton)<ToggleCallButtonProps>``

// Field Trip Windows Components

export const Button = styled(BsButton)`
  margin-left: 5px;
`

export const Container = styled.div`
  display: flex;
  flex-flow: row wrap;
`

export const Half = styled.div`
  width: 50%;
`

export const CallRecordContainer = styled.div``

export const CallRecordHeader = styled.span`
  display: flex;
  font-weight: 700;
  font-size: 14px;
  gap: 10px;
  padding: 0.5em;
  width: 100%;
`

export const OriginDestinationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding-left: 1rem;
  border-left: solid 1px #747474;
`

export const QueryRecordButton = styled.button`
  align-items: center;
  display: flex;
  flex-direction: row;
  width: 100%;
  padding: 1em 0;
  div.search-container {
    color: ${blue[800]};
    padding-right: 1rem;
    display: flex;
    align-items: center;
  }
`

export const Full = styled.div`
  width: 100%;
`

export const FullWithMargin = styled(Full)`
  margin-top: 10px;
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
    color: #685c5c;
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
