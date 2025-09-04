import { connect } from 'react-redux'
import { TransitOperator } from '@opentripplanner/types'
import { useIntl } from 'react-intl'
import React, { useCallback, useContext, useEffect } from 'react'

import * as apiActions from '../../actions/api'
import * as uiActions from '../../actions/ui'
import { ComponentContext } from '../../util/contexts'
import { getRouteOperator } from '../../util/state'
import { getRouteOrPatternViewerTitle } from '../../util/viewer'
import {
  SetViewedRouteHandler,
  ViewedRouteObject,
  ViewedRouteState
} from '../util/types'
import BackButton from '../util/back-button'
import PageTitle from '../util/page-title'

import { RouteRowDetails } from './route-row'
import RouteDetails from './route-details'
import VehiclePositionRetriever from './vehicle-position-retriever'

interface Props {
  findRoutesIfNeeded: () => void
  setViewedRoute: SetViewedRouteHandler
  transitOperators: TransitOperator[]
  vehicleIconHighlight: boolean
  viewedRoute?: ViewedRouteState
  viewedRouteObject?: ViewedRouteObject
}

const PatternViewer = ({
  findRoutesIfNeeded,
  setViewedRoute,
  transitOperators,
  vehicleIconHighlight,
  viewedRoute,
  viewedRouteObject: route
}: Props) => {
  const intl = useIntl()

  // @ts-expect-error TODO: add type to ComponentContext
  const { ModeIcon, RouteRenderer } = useContext(ComponentContext)

  const routePatternKeys = route?.patterns && Object.keys(route?.patterns)
  const patternId = viewedRoute?.patternId
  const routeId = viewedRoute?.routeId || null

  /**
   * If we're viewing a pattern's stops, route to main route viewer.
   */
  const _backClicked = useCallback(() => {
    // The if test is for typescript checks.
    if (viewedRoute && routeId) {
      setViewedRoute({
        ...viewedRoute,
        patternId: undefined
      })
    }
  }, [viewedRoute, setViewedRoute])

  useEffect(findRoutesIfNeeded, [findRoutesIfNeeded])

  // If the patternId does not exist in the route, course correct back to a valid pattern.
  // (ex. the URL was /route/123/undefined)
  if (patternId && !routePatternKeys?.includes(patternId) && routePatternKeys) {
    // Set the patternId to the first pattern in the route (this will reload the page).
    setViewedRoute({
      patternId: routePatternKeys[0],
      routeId: routeId
    })
  }

  // If patternId is present and route data have been fetched, we're looking at a specific pattern's stops.
  if (patternId && route) {
    // Find operator based on agency_id (extracted from OTP route ID).
    const operator = getRouteOperator(route, transitOperators)

    const backButtonText = intl.formatMessage({ id: 'common.forms.back' })
    return (
      <div
        className="route-viewer pattern-viewer"
        style={{ backgroundColor: 'white' }}
      >
        <VehiclePositionRetriever />
        <PageTitle
          title={getRouteOrPatternViewerTitle(
            transitOperators,
            route,
            patternId,
            intl
          )}
        />
        {/* Header Block */}
        <div className="route-viewer-header">
          {/* Back button */}
          <div className="back-button-container">
            <BackButton
              backButtonText={backButtonText}
              id="pattern-viewer-back-button"
              onClick={_backClicked}
            />
            <div className="header-text route-expanded">
              <h1 style={{ display: 'contents', lineHeight: '1.4' }}>
                {!route.pending && ModeIcon && (
                  <RouteRowDetails
                    intl={intl}
                    isActive={false}
                    ModeIcon={ModeIcon}
                    route={route}
                    RouteRenderer={RouteRenderer}
                  />
                )}
              </h1>
            </div>
          </div>
        </div>
        <RouteDetails operator={operator} patternId={patternId} route={route} />
      </div>
    )
  }

  return null
}

// connect to redux store

const mapStateToProps = (state: any) => {
  const { viewedRoute } = state.otp.ui
  return {
    transitOperators: state.otp.config.transitOperators,
    vehicleIconHighlight: state.otp.config?.routeViewer?.vehicleIconHighlight,
    viewedRoute,
    viewedRouteObject: state.otp.transitIndex.routes?.[viewedRoute?.routeId]
  }
}

const mapDispatchToProps = {
  findRoutesIfNeeded: apiActions.findRoutesIfNeeded,
  setViewedRoute: uiActions.setViewedRoute
}

export default connect(mapStateToProps, mapDispatchToProps)(PatternViewer)
