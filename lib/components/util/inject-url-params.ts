import { connect } from 'react-redux'
import { useEffect } from 'react'
import coreUtils from '@opentripplanner/core-utils'
import qs from 'qs'

import * as uiActions from '../../actions/ui'
import { AppReduxState } from '../../util/state-types'
import { isBlank } from '../../util/ui'

interface Props {
  params: any
  path: string
  routeTo: (path: string, search: string) => void
}

/**
 * Invisible component that adds the specified URL params when the component is mounted,
 * and removes them when the component is unmounted.
 */
const InjectUrlParams = ({ params, path, routeTo }: Props) => {
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
      const paramString = qs.stringify(urlParams, { skipNulls: true })
      routeTo(path, isBlank(paramString) ? '' : `?${paramString}`)
    }

    // Remove the injected URL params when the component unmounts.
    return () => {
      const urlParams = coreUtils.query.getUrlParams()
      // Remove injected params by setting them to null
      Object.keys(params).forEach((key) => (urlParams[key] = null))

      const paramString = qs.stringify(urlParams, { skipNulls: true })
      routeTo(path, isBlank(paramString) ? '' : `?${paramString}`)
    }
  }, [params, path, routeTo])

  // Component renders nothing
  return null
}

// connect to redux store

const mapStateToProps = (state: AppReduxState) => ({
  path: state.router.location.pathname
})

const mapDispatchToProps = {
  routeTo: uiActions.routeTo
}

export default connect(mapStateToProps, mapDispatchToProps)(InjectUrlParams)
