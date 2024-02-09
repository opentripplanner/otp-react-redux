import { Button, Panel } from 'react-bootstrap'
import styled, { css } from 'styled-components'

import { RED_ON_WHITE } from '../util/colors'

export const PageHeading = styled.h2`
  margin: 10px 0px 45px 0px;
`

export const SequentialPaneContainer = styled.div`
  min-height: 20em;
`

export const StackedPaneContainer = styled.div`
  margin-bottom: 20px;
  padding-bottom: 20px;
  > h3 {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }
`

export const SubNavContainer = styled.div`
  border-bottom: solid 1px #adadad;
  margin-bottom: 25px;
  padding: 5px 0px 10px 0px;
`

export const SubNavLinks = styled.div`
  margin-top: 11px;

  .btn-link {
    border-bottom: 3px solid transparent;
    font-size: 17px;
    margin-left: 8px;
    paddisng: 0px 3px;
  }

  .btn-link.active {
    border: none;
    border-bottom: 3px solid #adadad;
  }
`

export const TripHeader = styled.h3`
  margin-top: 0px;
`

export const TripPannelTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const TripPanelHeading = styled(Panel.Heading)`
  background-color: white !important;
  border-color: #fff !important;
  padding: 20px 25px 0 25px;

  button {
    background: transparent;
    border: 0;
  }

  h3 {
    margin: 0;
  }
`

export const TripPanelAlert = styled.button`
  background: none;
  border: none;
  color: ${RED_ON_WHITE};
  cursor: pointer;
  float: right;
  text-decoration: underline;
  &:hover {
    opacity: 80%;
  }
`

export const TripPanelFooter = styled(Panel.Footer)`
  background-color: white !important;
  padding: 0px;
  border: none;
`

/** Formats non-<label> elements like <label>s. */
const labelStyle = css`
  border: none;
  cursor: default;
  font-size: inherit;
  font-weight: 700;
  margin-bottom: 5px;
`

/** Fieldset with a legend that looks like labels. */
export const FieldSet = styled.fieldset`
  /* Format <legend> like labels. */
  legend {
    ${labelStyle}
  }
`

/** A container with spacing between controls. */
export const ControlStrip = styled.span`
  display: block;
  & > * {
    margin-right: 4px;
  }
`
/** Styles for phone editing fields */
export const phoneFieldStyle = css`
  display: inline-block;
  vertical-align: middle;
  width: 14em;
`
