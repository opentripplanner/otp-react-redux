import { Component } from 'react'
import { connect } from 'react-redux'
import coreUtils from '@opentripplanner/core-utils'

import * as apiActions from '../../actions/api'
import * as uiActions from '../../actions/ui'

interface Props {
  injectUrlParams: (params: unknown) => void
  params: Record<string, unknown>
  setUrlSearch: (params: unknown, replace: boolean) => void
  subtractUrlParams: (params: unknown) => void
  syncUrlToParams: (params: unknown) => void
}

/**
 * Invisible component that adds the specified URL params when the component is mounted,
 * and removes them when the component is unmounted.
 */
class InjectUrlParams extends Component<Props> {
  componentDidMount() {
    const { injectUrlParams, params } = this.props
    // Should happen only once when the parent is first created/rendered.
    injectUrlParams(params)
  }

  componentDidUpdate() {
    const { params, syncUrlToParams } = this.props
    syncUrlToParams(params)
  }

  componentWillUnmount(): void {
    const { params, setUrlSearch, subtractUrlParams } = this.props

    const urlParams = coreUtils.query.getUrlParams()
    // Remove injected params by setting them to null
    let altered = false
    Object.keys(params).forEach((key) => {
      if (key in urlParams) {
        urlParams[key] = null
        altered = true
      }
    })

    if (altered) {
      subtractUrlParams(params)
      setUrlSearch(urlParams, true)
    }
  }

  render() {
    // Component renders nothing
    return null
  }
}

// connect to redux store

const mapDispatchToProps = {
  injectUrlParams: uiActions.injectUrlParams,
  setUrlSearch: apiActions.setUrlSearch,
  subtractUrlParams: uiActions.subtractUrlParams,
  syncUrlToParams: uiActions.syncUrlToParams
}

export default connect(null, mapDispatchToProps)(InjectUrlParams)
