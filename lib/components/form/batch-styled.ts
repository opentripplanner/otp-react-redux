import { grey } from '../util/colors'
import styled, { css } from 'styled-components'

export const buttonPixels = 51

export const activeCss = css`
  /* Make elements internal content slightly transparent on hover. */
  & > * {
    opacity: 90%;
  }
`

const buttonTransitionCss = css`
  transition: all 250ms ease-out;
`

export const boxShadowCss = css`
  box-shadow: rgba(0, 0, 0, 0.15) 0 0 20px;
`

// TODO: this needs to be in line with the mode selector buttons, ideally importing the styles
export const buttonCss = css`
  border-radius: 5px;
  border: 0px;
  height: ${buttonPixels}px;
  margin: 0px;
  width: ${buttonPixels}px;
  ${buttonTransitionCss}

  &:active {
    background: ${grey[50]};
  }

  &:hover {
    ${boxShadowCss}
  }

  svg {
    max-height: 36px;
  }
`

export const Button = styled.button`
  ${buttonCss}
`

export const TripFormButtonContainer = styled.div`
  display: flex;
  gap: 2px;
`

export const AdvancedOptionsContainer = styled.div`
  align-items: center;
  color: ${grey[800]};
  display: flex;
  justify-content: space-between;

  #date-time-depart-arrive-wrapper {
    order: 0;
  }

  #open-advanced-settings-button {
    order: 1;
  }
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

export const ModeSelectorContainer = styled.div`
  align-items: flex-start;
  display: flex;
  float: right;
  justify-content: space-between;
  width: 100%;

  ${PlanTripButton} {
    margin-top: 0px;
  }
  fieldset {
    gap: 0 2px;
    margin: 0 2px 0 0;

    input {
      margin: 0;
    }
  }
`

export const MainSettingsRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`
