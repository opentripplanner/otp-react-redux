import React from 'react'
import FontAwesome from 'react-fontawesome'
import styled from 'styled-components'

const StyledFontAwesome = styled(FontAwesome)`
  margin-inline-end: 0.25em;
`

/**
 * Icon component with CSS spacing after the icon to replace the {' '} workaround,
 * and that should work for both lft-to-right and right-to-left layouts.
 * Note: some legacy browsers might ignore the CSS spacing,
 * see https://developer.mozilla.org/en-US/docs/Web/CSS/margin-inline-end.
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
