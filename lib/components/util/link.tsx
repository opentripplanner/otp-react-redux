import { connect } from 'react-redux'
import React, { HTMLAttributes } from 'react'

import { AppReduxState } from '../../util/state-types'
import { combineQueryParams } from '../../util/api'
import { isBlank } from '../../util/ui'

interface Props extends OwnProps, HTMLAttributes<HTMLAnchorElement> {
  href: string
}

interface OwnProps {
  to: string
  toParams?: Record<string, unknown>
}

/**
 * Renders an anchor element <a> with specified path and query params,
 * that preserves other existing query params.
 */
const Link = ({ children, className, href, style }: Props): JSX.Element => (
  <a className={className} href={href} style={style}>
    {children}
  </a>
)

// connect to the redux store so that the search params get updated in timely fashion.

const mapStateToProps = (state: AppReduxState, ownProps: OwnProps) => {
  const queryParams = combineQueryParams(ownProps.toParams)
  const href = `#${ownProps.to}${isBlank(queryParams) ? '' : `?${queryParams}`}`
  return {
    href
  }
}

export default connect(mapStateToProps)(Link)
