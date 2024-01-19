import styled, { css } from 'styled-components'

export const buttonPixels = 51

export const activeCss = css`
  /* Make elements slightly darker on hover. */
  filter: brightness(90%);
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
    background: #e5e5e5;
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
  align-items: flex-start;
  display: flex;
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

    input {
      margin: 0;
    }
  }
`

export const MainSettingsRow = styled.div`
  align-items: top;
  display: flex;
  flex-flow: wrap;
  gap: 5px 0;
  justify-content: space-between;
  margin-bottom: 5px;

  label {
    /* Cancel bottom margin of bootstrap labels in mode selector. */
    margin-bottom: 0;
  }
`
