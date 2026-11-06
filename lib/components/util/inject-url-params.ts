import { Component } from 'react'
import { connect } from 'react-redux'
import coreUtils from '@opentripplanner/core-utils'

import * as apiActions from '../../actions/api'
import * as uiActions from '../../actions/ui'
import { AppReduxState } from '../../util/state-types'
import { isBlank } from '../../util/ui'

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

  componentDidUpdate(prevProps: Props) {
    const { params, setUrlSearch } = this.props

    // Append filter params to existing search params.
    const urlParams = coreUtils.query.getUrlParams()

    // If the URL params are already present (e.g. user is reloading the page), do nothing.
    // If the props params have changed, update the URL.
    // If the value of a props parameter is null/undefined/blank, remove that from URL parameters.
    let altered = false
    Object.keys(params).forEach((key) => {
      const newValue = params[key]
      const newParam = isBlank(newValue) ? undefined : newValue
      const urlParamMissing =
        !(key in urlParams) && newParam !== undefined && newParam !== null
      const urlParamNeedsUpdating =
        key in urlParams &&
        key in prevProps.params &&
        prevProps.params[key] !== params[key]

      if (urlParamMissing || urlParamNeedsUpdating) {
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
