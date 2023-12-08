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

export const TripPanelHeading = styled(Panel.Heading)`
  background-color: white !important;
`

export const TripPanelAlert = styled.a`
  color: ${RED_ON_WHITE};
  cursor: pointer;
  float: right;
  text-decoration: underline;
  &:hover {
    background-color: transparent;
    color: ${RED_ON_WHITE};
    opacity: 80%;
  }
`

export const TripPanelFooter = styled(Panel.Footer)`
  background-color: white !important;
  padding: 0px;
  button {
    border: 0px;
    padding: 13px 0px;
    width: 33.333%;
  }

  button:first-child {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  button:nth-child(2) {
    border-radius: 0;
    border-left: 1px solid #ddd;
    border-right: 1px solid #ddd;
  }

  button:last-child {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom-left-radius: 0;
  }
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
