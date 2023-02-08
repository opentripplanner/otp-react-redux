import styled from 'styled-components'

const ButtonGroup = styled.fieldset.attrs({
  className: 'btn-group'
})`
  display: block;

  /* Format <legend> like labels. */
  legend {
    border: none;
    font-size: inherit;
    font-weight: 700;
    margin-bottom: 5px;
  }

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
`

export default ButtonGroup
