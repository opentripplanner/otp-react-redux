import { injectIntl, IntlShape, WithIntlProps } from 'react-intl'
import FontAwesome from 'react-fontawesome'
import React from 'react'
import styled from 'styled-components'

import { getFormattedMode } from '../../util/i18n'

export type IconProps = {
  className?: string
  fixedWidth?: boolean
  intl: IntlShape
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
  intl,
  type,
  withSpace = false,
  ...props
}: IconProps): JSX.Element => {
  const FontComponent = withSpace ? FontAwesomeWithSpace : FontAwesome
  return (
    <FontComponent
      aria-label={getFormattedMode(type, intl, true)}
      fixedWidth={fixedWidth}
      name={type}
      {...props}
    />
  )
}

export default injectIntl(Icon)
