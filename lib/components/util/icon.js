import PropTypes from 'prop-types'
import React from 'react'
import FontAwesome from 'react-fontawesome'
import styled from 'styled-components'

/**
 * A Font Awesome icon followed by a with a pseudo-element equivalent to a single space,
 * if so specified in the withSpace prop.
 */
const StyledFontAwesome = styled(FontAwesome)`
  ${props => props.withSpace ? `
    &::after {
      content: "";
      margin: 0 0.125em;
    }
  ` : ''}
`

/**
 * Wrapper for the FontAwesome component that, if specified in the withSpace prop,
 * supports CSS spacing after the icon to replace the {' '} workaround,
 * and that should work for both left-to-right and right-to-left layouts.
 * Other props from FontAwesome are passed to that component.
 */
const Icon = ({ fixedWidth = true, type, withSpace, ...props }) => (
  <StyledFontAwesome
    fixedWidth={fixedWidth}
    name={type}
    withSpace={withSpace}
    {...props}
  />
)

Icon.propTypes = {
  type: PropTypes.string.isRequired,
  withSpace: PropTypes.bool
}

export default Icon
