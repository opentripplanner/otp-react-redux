import { AnchorHTMLAttributes, ComponentType } from 'react'
import { connect } from 'react-redux'
import cn from 'classnames'

import { AppReduxState } from '../../util/state-types'
import { combineQueryParams } from '../../util/api'
import { isBlank } from '../../util/ui'

interface OwnProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to?: string
  toParams?: Record<string, unknown>
  /** If true, an 'active' CSS class will be applied if the URL starts the same as the `to` prop. */
  tracking?: boolean
}

/** Determines whether the given path is a subpath of the 'to' prop. */
export function isSubpath(path: string, to: string): boolean {
  return !isBlank(to) && (path === to || path.startsWith(`${to}/`))
}

/**
 * Renders an anchor element <a> with specified path and query params,
 * that preserves other existing query params.
 */
const Link: ComponentType = 'a' as unknown as ComponentType

// connect to the redux store so that the search params get updated in timely fashion.

const mapStateToProps = (state: AppReduxState, ownProps: OwnProps) => {
  const { className, to = '', toParams, tracking } = ownProps
  const queryParams = combineQueryParams(toParams)
  const href = `#${to}${isBlank(queryParams) ? '' : `?${queryParams}`}`

  const isActive = tracking && isSubpath(state.router.location.pathname, to)
  return {
    className: cn(className, isActive && 'active'),
    href
  }
}

// Pass an empty object as mapDispatchToProps to remove dispatch from the rendered HTML.
export default connect(mapStateToProps, {})(Link)
