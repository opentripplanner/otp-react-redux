import styled, {css} from 'styled-components'

import DateTimePreview from '../form/date-time-preview'

const activeCss = css`
  background: #e5e5e5;
  -webkit-box-shadow: inset 0px 0px 5px #c1c1c1;
     -moz-box-shadow: inset 0px 0px 5px #c1c1c1;
          box-shadow: inset 0px 0px 5px #c1c1c1;
   outline: none;
`

export const buttonCss = css`
  height: 45px;
  width: 45px;
  margin: 0px;
  border: 0px;
  border-radius: 5px;
  &:active {
    ${activeCss}
  }
`

export const Button = styled.button`
  ${buttonCss}
`

export const StyledDateTimePreview = styled(DateTimePreview)`
  ${buttonCss}
  background-color: rgb(239, 239, 239);
  cursor: pointer;
  font-size: 12px;
  margin-right: 5px;
  padding: 7px 5px;
  text-align: left;
  white-space: nowrap;
  width: 120px;
  ${props => props.expanded ? activeCss : null}
`
export const SettingsPreview = styled(Button)`
  line-height: 22px;
  margin-right: 5px;
  padding: 10px 0px;
  position: relative;
  ${props => props.expanded ? activeCss : null}
`

export const Dot = styled.div`
  position: absolute;
  top: -3px;
  right: -3px;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #f00;
`

export const PlanTripButton = styled(Button)`
  background-color: #F5F5A7;
  margin-left: auto;
  padding: 5px;
  &:active {
    ${activeCss}
    background-color: #ededaf
  }
`

const expandableBoxCss = css`
  background-color: rgb(239, 239, 239);
  box-shadow: rgba(0, 0, 0, 0.32) 7px 12px 10px;
  height: 245px;
  border-radius: 5px 5px 5px 5px;
  position: absolute;
  width: 96%; // FIXME: come up with a better value
  z-index: 99999;
`

export const DateTimeModalContainer = styled.div`
  ${expandableBoxCss}
  padding: 10px 20px;
`

export const BatchSettingsPanelContainer = styled.div`
  ${expandableBoxCss}
  padding: 5px 10px;
`

export const MainSettingsRow = styled.div`
  align-items: top;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-bottom: 5px;
`
