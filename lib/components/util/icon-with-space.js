import React from 'react'
import FontAwesome from 'react-fontawesome'
import styled from 'styled-components'

/**
 * A Font Awesome icon followed by a with a pseudo-element equivalent to a single space.
 */
const StyledFontAwesome = styled(FontAwesome)`
  &::after {
    content: "";
    margin: 0 0.125em;
  }
`

/**
 * Icon component with CSS spacing after the icon to replace the {' '} workaround,
 * and that should work for both left-to-right and right-to-left layouts.
 */
export default function IconWithSpace ({ fixedWidth, type, ...props }) {
  return (
    <StyledFontAwesome
      fixedWidth={fixedWidth}
      name={type}
      {...props}
    />
  )
}
