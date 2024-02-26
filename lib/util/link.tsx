import { Link as RouterLink } from 'react-router-dom'
import coreUtils from '@opentripplanner/core-utils'
import qs from 'qs'
import React, { HTMLAttributes } from 'react'

interface Props extends HTMLAttributes<HTMLSpanElement> {
  to: string
  toParams: Record<string, unknown>
}

const { getUrlParams } = coreUtils.query

/**
 * Helper function to add/modify parameters from the URL bar
 * while preserving the other ones.
 */
function queryParams(addedParams: Record<string, unknown>) {
  const search = {
    ...qs.parse(getUrlParams()),
    ...addedParams
  }
  return qs.stringify(search)
}

const Link = ({
  children,
  className,
  style,
  to,
  toParams
}: Props): JSX.Element => (
  <RouterLink
    className={className}
    style={style}
    to={{
      pathname: to,
      search: queryParams(toParams)
    }}
  >
    {children}
  </RouterLink>
)

export default Link
