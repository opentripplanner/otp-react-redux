import { ArrowLeft } from '@styled-icons/fa-solid/ArrowLeft'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage, injectIntl, IntlShape } from 'react-intl'
import { getMostReadableTextColor } from '@opentripplanner/core-utils/lib/route'
import { TransitOperator } from '@opentripplanner/types'
import React, { Component } from 'react'

import * as apiActions from '../../actions/api'
import * as uiActions from '../../actions/ui'
import { ComponentContext } from '../../util/contexts'
import {
  extractHeadsignFromPattern,
  getModeFromRoute,
  getRouteColorBasedOnSettings
} from '../../util/viewer'
import { getFormattedMode } from '../../util/i18n'
import { getOperatorAndRoute, getRouteOperator } from '../../util/state'
import {
  SetViewedRouteHandler,
  ViewedRouteObject,
  ViewedRouteState
} from '../util/types'
import { StyledIconWrapper } from '../util/styledIcon'
import PageTitle from '../util/page-title'

import { RouteName } from './RouteRow'
import RouteDetails from './route-details'

interface Props {
  findRoutesIfNeeded: () => void
  hideBackButton?: boolean
  intl: IntlShape
  setViewedRoute: SetViewedRouteHandler
  transitOperators: TransitOperator[]
  vehicleIconHighlight: boolean
  viewedRoute?: ViewedRouteState
  viewedRouteObject?: ViewedRouteObject
}

class PatternViewer extends Component<Props> {
  static contextType = ComponentContext

  /**
   * If we're viewing a pattern's stops, route to main route viewer.
   */
  _backClicked = () => {
    const { setViewedRoute, viewedRoute } = this.props
    if (viewedRoute?.routeId) {
      setViewedRoute({
        ...viewedRoute,
        patternId: undefined
      })
    }
  }

  /**
   * Gets a breadcrumbs-like title so we don't need to internationalize the title bar structure.
   * Display the agency, user-facing route number, and pattern destination (except while loading).
   */
  getTitle = () => {
    const { intl, transitOperators, viewedRoute, viewedRouteObject } =
      this.props
    const { patternId } = viewedRoute || {}
    const { patterns, pending, shortName } = viewedRouteObject || {}

    if (!viewedRouteObject || pending || !patternId) {
      return intl.formatMessage({ id: 'components.RouteViewer.title' })
    }

    const pattern = patterns?.[patternId]
    return (
      getOperatorAndRoute(viewedRouteObject, transitOperators, intl) +
      (patternId && pattern
        ? ` ${intl.formatMessage({
            id: 'components.RouteDetails.stopsTo'
          })} ${extractHeadsignFromPattern(pattern, shortName)}`
        : '')
    )
  }

  componentDidMount() {
    this.props.findRoutesIfNeeded()
  }

  render() {
    const {
      hideBackButton,
      intl,
      transitOperators,
      vehicleIconHighlight,
      viewedRoute,
      viewedRouteObject
    } = this.props

    const { ModeIcon, RouteRenderer } = this.context

    // If patternId is present, we're looking at a specific pattern's stops
    if (viewedRoute?.patternId && viewedRouteObject) {
      const { patternId } = viewedRoute
      const route = viewedRouteObject
      // Find operator based on agency_id (extracted from OTP route ID).
      const operator = getRouteOperator(viewedRouteObject, transitOperators)
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
          <PageTitle title={this.getTitle()} />
          {/* Header Block */}
          <div
            className="route-viewer-header"
            style={{ backgroundColor: routeColor }}
          >
            {/* Back button */}
            {!hideBackButton && (
              <div className="back-button-container">
                <Button bsSize="small" onClick={this._backClicked}>
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
                  basicRender
                  route={route}
                  RouteRenderer={RouteRenderer}
                />
              </h1>
            </div>
          </div>
          <RouteDetails
            operator={operator}
            pattern={route?.patterns?.[patternId]}
            route={route}
          />
        </div>
      )
    }

    return null
  }
}

// connect to redux store

const mapStateToProps = (state: any) => {
  return {
    transitOperators: state.otp.config.transitOperators,
    vehicleIconHighlight: state.otp.config?.routeViewer?.vehicleIconHighlight,
    viewedRoute: state.otp.ui.viewedRoute,
    viewedRouteObject:
      state.otp.transitIndex.routes?.[state.otp.ui.viewedRoute?.routeId]
  }
}

const mapDispatchToProps = {
  findRoutesIfNeeded: apiActions.findRoutesIfNeeded,
  setViewedRoute: uiActions.setViewedRoute
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(PatternViewer))
