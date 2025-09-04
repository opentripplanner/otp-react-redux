import { connect } from 'react-redux'
import { TransitOperator } from '@opentripplanner/types'
import React, { useCallback, useContext, useEffect } from 'react'

import * as apiActions from '../../actions/api'
import * as uiActions from '../../actions/ui'
import { ComponentContext } from '../../util/contexts'
import { getFormattedMode } from '../../util/i18n'
import {
  getModeFromRoute,
  getRouteColorBasedOnSettings,
  getRouteOrPatternViewerTitle
} from '../../util/viewer'
import { getRouteOperator } from '../../util/state'
import {
  SetViewedRouteHandler,
  ViewedRouteObject,
  ViewedRouteState
} from '../util/types'
import BackButton from '../util/back-button'
import PageTitle from '../util/page-title'

import RouteDetails from './route-details'
import RouteName from './route-name'
import VehiclePositionRetriever from './vehicle-position-retriever'

interface Props {
  findRoutesIfNeeded: () => void
  hideBackButton?: boolean
  setViewedRoute: SetViewedRouteHandler
  transitOperators: TransitOperator[]
  vehicleIconHighlight: boolean
  viewedRoute?: ViewedRouteState
  viewedRouteObject?: ViewedRouteObject
}

const PatternViewer = ({
  findRoutesIfNeeded,
  hideBackButton,
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
    const routeColor = getRouteColorBasedOnSettings(operator, route)
    const textColor = getMostReadableTextColor(routeColor, route?.textColor)
    const fill = vehicleIconHighlight === false ? undefined : textColor

    const backButtonText = intl.formatMessage({ id: 'common.forms.back' })
    return (
      <div
        className="route-viewer pattern-viewer"
        style={{
          backgroundColor: routeColor,
          color: textColor,
          fill
        }}
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
        <div
          className="route-viewer-header"
          style={{ backgroundColor: routeColor }}
        >
          {/* Back button */}
          {!hideBackButton && (
            <div className="back-button-container">
              <BackButton
                closeButtonText={backButtonText}
                id="pattern-viewer-back-button"
                onClick={_backClicked}
              />
            </div>
          )}
          <div className="header-text route-expanded">
            <h1 style={{ display: 'contents' }}>
              {!route.pending && ModeIcon && (
                <ModeIcon
                  aria-label={getFormattedMode(
                    getModeFromRoute(route).toLowerCase(),
                    intl
                  )}
                  mode={getModeFromRoute(route)}
                  style={{ maxHeight: 40 }}
                  width={22}
                />
              )}
              <RouteName
                isOnColoredBackground
                route={route}
                RouteRenderer={RouteRenderer}
              />
            </h1>
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
