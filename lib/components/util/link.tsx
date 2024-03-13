import { Link as RouterLink } from 'react-router-dom'
import React, { HTMLAttributes } from 'react'

import { combineQueryParams } from '../../util/api'

interface Props extends HTMLAttributes<HTMLSpanElement> {
  to: string
  toParams?: Record<string, unknown>
}

/**
 * Renders an anchor element <a> with specified path and query params,
 * that preserves other existing query params.
 */
const Link = ({
  children,
  className,
  style,
  to,
  toParams
}: Props): JSX.Element =>
  typeof jest !== 'undefined' ? (
    // Do not render router links in snapshots.
    <a href="test-link">{children}</a>
  ) : (
    <RouterLink
      className={className}
      style={style}
      to={{
        pathname: to,
        search: combineQueryParams(toParams)
      }}
    >
      {children}
    </RouterLink>
  )

export default Link
