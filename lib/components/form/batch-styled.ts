import * as TripFormClasses from '@opentripplanner/trip-form/lib/styled'
import { SettingsSelectorPanel } from '@opentripplanner/trip-form'
import styled, { css } from 'styled-components'

import { commonInputCss, modeButtonButtonCss } from './styled'
import DateTimePreview from './date-time-preview'

const activeCss = css`
  background: #d5d5d5;
`

const buttonTransitionCss = css`
  transition: all 250ms ease-out;
`

// TODO: this needs to be in line with the mode selector buttons, ideally importing the styles
export const buttonCss = css`
  border-radius: 5px;
  border: 0px;
  height: 51px;
  margin: 0px;
  width: 51px;
  ${buttonTransitionCss}

  &:active {
    background: #e5e5e5;
  }

  &:hover {
    box-shadow: rgba(0, 0, 0, 0.1) 0 0 20px;
  }

  svg {
    max-height: 36px;
  }
`

export const Button = styled.button`
  ${buttonCss}
`

export const StyledDateTimePreviewContainer = styled(Button)<{
  expanded?: boolean
}>`
  ${buttonCss}
  margin-right: 5px;
  padding: 0;
  position: relative;
  min-width: 90px;
  max-width: 120px;
  width: 100%;
  ${(props) => (props.expanded ? activeCss : null)}
`

export const StyledDateTimePreview = styled(DateTimePreview)`
  font-size: 12px;
  margin-right: 5px;
  padding: 4px 5px;
  text-align: left;
  white-space: nowrap;
`
export const SettingsPreview = styled(Button)<{ expanded?: boolean }>`
  margin-right: 5px;
  position: relative;
  padding: 0;
  ${(props) => (props.expanded ? activeCss : null)}
`
export const PlanTripButton = styled(Button)`
  background-color: green;
  color: #ffffffdd;
  padding: 5px;

  &:active {
    ${activeCss}
    background: green;
    filter: saturate(50%);
  }

  span {
    display: inline-block;
    margin-top: -5px;
  }
`

export const ModeSelectorContainer = styled.div<{ squashed?: boolean }>`
  display: flex;
  align-items: flex-start;
  float: right;

  ${PlanTripButton} {
    border-bottom-left-radius: ${(props) => (props.squashed ? 0 : 'invalid')};
    border-top-left-radius: ${(props) => (props.squashed ? 0 : 'invalid')};
    margin-top: 0px;
    margin-left: ${(props) => (props.squashed ? 0 : '3px')};
  }
  label:last-of-type {
    border-bottom-right-radius: ${(props) => (props.squashed ? 0 : 'invalid')};
    border-top-right-radius: ${(props) => (props.squashed ? 0 : 'invalid')};
  }
  fieldset {
    gap: 0 2px;
    margin: 0 2px 0 0;
  }
`

const expandableBoxCss = css`
  background-color: rgb(239, 239, 239);
  border-radius: 5px 5px 5px 5px;
  box-shadow: rgba(0, 0, 0, 0.2) 0 0 20px;
  left: 10px;
  position: absolute;
  right: 10px;
  z-index: 99999;
`

export const DateTimeModalContainer = styled.div`
  ${expandableBoxCss}
  padding: 10px 20px;
`

export const BatchPreferencesContainer = styled.div`
  ${expandableBoxCss}
  margin-top: 50px;
  padding: 5px 10px;
`
export const MainSettingsRow = styled.div`
  align-items: top;
  display: flex;
  flex-flow: wrap;
  gap: 5px 0;
  justify-content: space-between;
  margin-bottom: 5px;
`

// FIXME: This is identical to StyledSettingsSelectorPanel, with a
// couple of items set to display: none (SettingsHeader and ModeSelector)
export const StyledBatchPreferences = styled(SettingsSelectorPanel)`
  ${modeButtonButtonCss}

  ${TripFormClasses.SettingLabel} {
    color: #686868;
    font-size: 14px;
    /* Override bootstrap's font-weight on labels so they don't appear bold in batch settings. */
    font-weight: inherit;
    letter-spacing: 1px;
    padding-top: 8px;
    text-transform: uppercase;
  }
  ${TripFormClasses.SettingsHeader} {
    display: none;
    color: #333333;
    font-size: 18px;
    margin: 16px 0px;
  }
  ${TripFormClasses.SettingsSection} {
    margin-bottom: 16px;
  }
  ${TripFormClasses.DropdownSelector} {
    select {
      ${commonInputCss}
      -webkit-appearance: none;
      border-radius: 3px;
      font-size: 14px;
      height: 34px;
      line-height: 1.42857;
      margin-bottom: 20px;

      &:focus {
        border-color: #66afe9;
        box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075),
          0 0 8px rgba(102, 175, 233, 0.6);
        outline: 0;
      }
    }
    > div:last-child::after {
      box-sizing: border-box;
      color: #000;
      content: '▼';
      font-size: 67%;
      pointer-events: none;
      position: absolute;
      right: 8px;
      top: 10px;
    }
  }

  ${TripFormClasses.ModeSelector} {
    display: none;
    font-weight: 300;
    ${TripFormClasses.ModeButton.Button} {
      box-shadow: none;
      outline: none;
      padding: 3px;
    }
    ${TripFormClasses.ModeButton.Title} {
      font-size: 10px;
      line-height: 12px;
      padding: 4px 0px 0px;

      &.active {
        font-weight: 600;
      }
    }
  }
  ${TripFormClasses.ModeSelector.MainRow} {
    box-sizing: border-box;
    font-size: 170%;
    margin: 0px -10px 18px;
    padding: 0px 5px;
    ${TripFormClasses.ModeButton.Button} {
      height: 54px;
      width: 100%;
      &.active {
        font-weight: 600;
      }
    }
  }
  ${TripFormClasses.ModeSelector.SecondaryRow} {
    margin: 0px -10px 10px;
    ${TripFormClasses.ModeButton.Button} {
      font-size: 130%;
      font-weight: 800;
      height: 46px;
      > svg {
        margin: 0 0.2em;
      }
    }
  }
  ${TripFormClasses.ModeSelector.TertiaryRow} {
    font-size: 80%;
    font-weight: 300;
    margin: 0px -10px 10px;
    text-align: center;
    ${TripFormClasses.ModeButton.Button} {
      height: 36px;
    }
  }
  ${TripFormClasses.SubmodeSelector.Row} {
    font-size: 12px;
    > * {
      padding: 3px 5px 3px 0px;
    }
    > :last-child {
      padding-right: 0px;
    }
    ${TripFormClasses.ModeButton.Button} {
      height: 35px;
    }
    svg,
    img {
      margin-left: 0px;
    }
  }
  ${TripFormClasses.SubmodeSelector} {
    ${TripFormClasses.SettingLabel} {
      margin-bottom: 0;
    }
  }
  ${TripFormClasses.SubmodeSelector.InlineRow} {
    margin: -3px 0px;
    svg,
    img {
      height: 18px;
      max-width: 32px;
    }
  }
`
