import styled from 'styled-components'

import { FieldSet } from '../user/styled'

const ButtonGroup = styled(FieldSet).attrs({
  className: 'btn-group'
})`
  label::first-letter {
    text-transform: uppercase;
  }

  input {
    clip: rect(0, 0, 0, 0);
    height: 0;
    /* Firefox will still render (tiny) controls, even if their bounds are empty,
       so move them out of sight. */
    left: -20px;
    position: relative;
    width: 0;
  }

  input:focus + label {
    outline: 5px auto blue;
    /* This next line enhances the visuals in Chromium (webkit) browsers */
    outline: 5px auto -webkit-focus-ring-color;
    outline-offset: -2px;
  }

  /* Without !important, round borders get overwritten by bootstrap's CSS. */
  label:first-of-type {
    border-bottom-left-radius: 4px !important;
    border-top-left-radius: 4px !important;
  }

  /* This is to have the between-labels border to be 1px. */
  label:not(label:first-of-type) {
    margin-left: -1px;
  }
`

export default ButtonGroup
