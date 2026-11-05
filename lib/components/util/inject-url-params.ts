import { connect } from 'react-redux'
import { useEffect } from 'react'
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
const InjectUrlParams = ({
  injectUrlParams,
  params,
  path,
  routeTo,
  subtractUrlParams
}: Props) => {
  useEffect(() => {
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
      injectUrlParams(Object.keys(params))
      const paramString = qs.stringify(urlParams, { skipNulls: true })
      routeTo(path, isBlank(paramString) ? '' : `?${paramString}`)
    }

    // Remove the injected URL params when the component unmounts.
    return () => {
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
  }, [injectUrlParams, params, path, routeTo, subtractUrlParams])

  // Component renders nothing
  return null
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
