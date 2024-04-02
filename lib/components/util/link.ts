import { ComponentType, HTMLAttributes } from 'react'
import { connect } from 'react-redux'

import { AppReduxState } from '../../util/state-types'
import { combineQueryParams } from '../../util/api'
import { isBlank } from '../../util/ui'

interface OwnProps extends HTMLAttributes<HTMLAnchorElement> {
  isActive?: boolean
  to?: string
  toParams?: Record<string, unknown>
}

/**
 * Renders an anchor element <a> with specified path and query params,
 * that preserves other existing query params.
 */
const Link: ComponentType = 'a' as unknown as ComponentType

// connect to the redux store so that the search params get updated in timely fashion.

const mapStateToProps = (state: AppReduxState, ownProps: OwnProps) => {
  const { className, isActive, to = '', toParams } = ownProps
  const queryParams = combineQueryParams(toParams)
  const href = `#${to}${isBlank(queryParams) ? '' : `?${queryParams}`}`
  return {
    className:
      className && isActive
        ? `${className} active`
        : isActive
        ? 'active'
        : className,
    href,
    // Remove the passed isActive, to and toParams props from the rendered HTML.
    isActive: undefined,
    to: undefined,
    toParams: undefined
  }
}

// Pass an empty object as mapDispatchToProps to remove dispatch from the rendered HTML.
export default connect(mapStateToProps, {})(Link)
