import { Component } from 'react'
import { connect } from 'react-redux'
import coreUtils from '@opentripplanner/core-utils'

import * as apiActions from '../../actions/api'
import * as uiActions from '../../actions/ui'
import { AppReduxState } from '../../util/state-types'

interface Props {
  injectUrlParams: (params: string[]) => void
  params: any
  path: string
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

  componentDidUpdate() {
    const { params, setUrlSearch } = this.props

    // Append filter params to existing search params.
    const urlParams = coreUtils.query.getUrlParams()

    // If the params are already present (e.g. user is reloading the page), do nothing.
    let altered = false
    Object.keys(params).forEach((key) => {
      const newParam = params[key]
      if (!(key in urlParams) && newParam !== undefined && newParam !== null) {
        urlParams[key] = newParam
        altered = true
      }
    })

    if (altered) {
      setUrlSearch(urlParams, true)
    }
  }

  componentWillUnmount(): void {
    const { params, setUrlSearch, subtractUrlParams } = this.props

    const urlParamsOnLeave = coreUtils.query.getUrlParams()
    // Remove injected params by setting them to null
    let finalAltered = false
    Object.keys(params).forEach((key) => {
      if (key in urlParamsOnLeave) {
        urlParamsOnLeave[key] = null
        finalAltered = true
      }
    })

    if (finalAltered) {
      subtractUrlParams(Object.keys(params))
      setUrlSearch(urlParamsOnLeave, true)
    }
  }

  render() {
    // Component renders nothing
    return null
  }
}

// connect to redux store

const mapStateToProps = (state: AppReduxState) => ({
  path: state.router.location.pathname
})

const mapDispatchToProps = {
  injectUrlParams: uiActions.injectUrlParams,
  setUrlSearch: apiActions.setUrlSearch,
  subtractUrlParams: uiActions.subtractUrlParams
}

export default connect(mapStateToProps, mapDispatchToProps)(InjectUrlParams)
