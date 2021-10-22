import React from 'react'
import FontAwesome from 'react-fontawesome'
import styled from 'styled-components'

export type IconProps = {
  className?: string
  fixedWidth?: boolean
  style?: Record<string, unknown>
  type: string
  withSpace?: boolean
}

/**
 * A Font Awesome icon followed by a with a pseudo-element equivalent to a single space.
 */
const FontAwesomeWithSpace = styled(FontAwesome)`
  &::after {
    content: '';
    margin: 0 0.125em;
  }
`

/**
 * Wrapper for the FontAwesome component that, if specified in the withSpace prop,
 * supports CSS spacing after the specified icon type, to replace the {' '} workaround,
 * and that should work for both left-to-right and right-to-left layouts.
 * Other props from FontAwesome are passed to that component.
 */
const Icon = ({
  fixedWidth = true,
  type,
  withSpace = false,
  ...props
}: IconProps): JSX.Element => {
  const FontComponent = withSpace ? FontAwesomeWithSpace : FontAwesome
  return <FontComponent fixedWidth={fixedWidth} name={type} {...props} />
}

export default Icon
