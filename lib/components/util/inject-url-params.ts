import { Component } from 'react'
import { connect } from 'react-redux'
import coreUtils from '@opentripplanner/core-utils'
import qs from 'qs'

import * as uiActions from '../../actions/ui'
import { AppReduxState } from '../../util/state-types'
import { isBlank } from '../../util/ui'

interface Props {
  injectUrlParams: (params: string[]) => void
  params: any
  path: string
  routeTo: (path: string, search: string) => void
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
    const { params, path, routeTo } = this.props

    // Append filter params to existing search params.
    const urlParams = coreUtils.query.getUrlParams()

    // If the params are already present (e.g. user is reloading the page), do nothing.
    let altered = false
    Object.keys(params).forEach((key) => {
      const newParam = params[key]
      if (
        urlParams[key] === undefined &&
        newParam !== undefined &&
        newParam !== null
      ) {
        urlParams[key] = newParam
        altered = true
      }
    })

    if (altered) {
      const paramString = qs.stringify(urlParams, { skipNulls: true })
      routeTo(path, isBlank(paramString) ? '' : `?${paramString}`)
    }
  }

  componentWillUnmount(): void {
    console.log('inject url parms UNmount')
    const { params, path, routeTo, subtractUrlParams } = this.props

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
      const paramString = qs.stringify(urlParamsOnLeave, { skipNulls: true })
      routeTo(path, isBlank(paramString) ? '' : `?${paramString}`)
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
  routeTo: uiActions.routeTo,
  subtractUrlParams: uiActions.subtractUrlParams
}

export default connect(mapStateToProps, mapDispatchToProps)(InjectUrlParams)
