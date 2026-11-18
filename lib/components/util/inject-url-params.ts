import { Component } from 'react'
import { connect } from 'react-redux'
import coreUtils from '@opentripplanner/core-utils'

import * as apiActions from '../../actions/api'
import * as uiActions from '../../actions/ui'

interface Props {
  injectUrlParams: (params: string[]) => void
  params: any
  setUrlSearch: (params: any, replace: boolean) => void
  subtractUrlParams: (params: string[]) => void
}

/**
 * Invisible component that adds the specified URL params when the component is mounted,
 * and removes them when the component is unmounted.
 */
class InjectUrlParams extends Component<Props> {
  componentDidMount() {
    // Should happen only once when the parent is first created/rendered.
    this.props.injectUrlParams(Object.keys(this.props.params))
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
      subtractUrlParams(Object.keys(params))
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
  subtractUrlParams: uiActions.subtractUrlParams
}

export default connect(null, mapDispatchToProps)(InjectUrlParams)
