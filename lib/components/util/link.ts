import { ComponentType, HTMLAttributes } from 'react'
import { connect } from 'react-redux'

import { AppReduxState } from '../../util/state-types'
import { combineQueryParams } from '../../util/api'
import { isBlank } from '../../util/ui'

interface OwnProps extends HTMLAttributes<HTMLAnchorElement> {
  to: string
  toParams?: Record<string, unknown>
}

/**
 * Renders an anchor element <a> with specified path and query params,
 * that preserves other existing query params.
 */
const Link: ComponentType = 'a' as unknown as ComponentType

// connect to the redux store so that the search params get updated in timely fashion.

const mapStateToProps = (state: AppReduxState, ownProps: OwnProps) => {
  const queryParams = combineQueryParams(ownProps.toParams)
  const href = `#${ownProps.to}${isBlank(queryParams) ? '' : `?${queryParams}`}`
  return {
    href,
    // Remove the passed to and toParams props from the rendered HTML.
    to: undefined,
    toParams: undefined
  }
}

export default connect(mapStateToProps)(Link)
