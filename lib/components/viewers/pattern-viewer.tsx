import { ArrowLeft } from '@styled-icons/fa-solid/ArrowLeft'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import { getMostReadableTextColor } from '@opentripplanner/core-utils/lib/route'
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
import { StyledIconWrapper } from '../util/styledIcon'
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

  /**
   * If we're viewing a pattern's stops, route to main route viewer.
   */
  const _backClicked = useCallback(() => {
    // The if test is for typescript checks.
    if (viewedRoute?.routeId) {
      setViewedRoute({
        ...viewedRoute,
        patternId: undefined
      })
    }
  }, [viewedRoute, setViewedRoute])

  useEffect(findRoutesIfNeeded, [findRoutesIfNeeded])

  // @ts-expect-error TODO: add type to ComponentContext
  const { ModeIcon, RouteRenderer } = useContext(ComponentContext)

  // If patternId is present and route data have been fetched, we're looking at a specific pattern's stops.
  if (viewedRoute?.patternId && route) {
    const { patternId } = viewedRoute
    // Find operator based on agency_id (extracted from OTP route ID).
    const operator = getRouteOperator(route, transitOperators)
    const routeColor = getRouteColorBasedOnSettings(operator, route)
    const textColor = getMostReadableTextColor(routeColor, route?.textColor)
    const fill = vehicleIconHighlight === false ? undefined : textColor

    return (
      <div
        className="route-viewer"
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
              <Button bsSize="small" onClick={_backClicked}>
                <StyledIconWrapper>
                  <ArrowLeft />
                </StyledIconWrapper>
                <FormattedMessage id="common.forms.back" />
              </Button>
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
