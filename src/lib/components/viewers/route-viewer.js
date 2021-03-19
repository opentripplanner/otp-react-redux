import coreUtils from '@opentripplanner/core-utils'
import React, { Component, PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Label, Button } from 'react-bootstrap'
import { VelocityTransitionGroup } from 'velocity-react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import Icon from '../narrative/icon'

import { setMainPanelContent, setViewedRoute } from '../../actions/ui'
import { findRoutes, findRoute } from '../../actions/api'
import { ComponentContext } from '../../util/contexts'
import { getModeFromRoute } from '../../util/viewer'

/**
 * Determine the appropriate contrast color for text (white or black) based on
 * the input hex string (e.g., '#ff00ff') value.
 *
 * From https://stackoverflow.com/a/11868398/915811
 *
 * TODO: Move to @opentripplanner/core-utils once otp-rr uses otp-ui library.
 */
function getContrastYIQ (hexcolor) {
  hexcolor = hexcolor.replace('#', '')
  const r = parseInt(hexcolor.substr(0, 2), 16)
  const g = parseInt(hexcolor.substr(2, 2), 16)
  const b = parseInt(hexcolor.substr(4, 2), 16)
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
  return (yiq >= 128) ? '000000' : 'ffffff'
}

class RouteViewer extends Component {
  static propTypes = {
    hideBackButton: PropTypes.bool,
    routes: PropTypes.object
  }

  _backClicked = () => this.props.setMainPanelContent(null)

  componentDidMount () {
    this.props.findRoutes()
  }

  render () {
    const {
      findRoute,
      hideBackButton,
      languageConfig,
      transitOperators,
      routes,
      setViewedRoute,
      viewedRoute
    } = this.props
    const sortedRoutes = routes
      ? Object.values(routes).sort(
        coreUtils.route.makeRouteComparator(transitOperators)
      )
      : []
    return (
      <div className='route-viewer'>
        {/* Header Block */}
        <div className='route-viewer-header'>
          {/* Back button */}
          {!hideBackButton && (
            <div className='back-button-container'>
              <Button
                bsSize='small'
                onClick={this._backClicked}
              ><Icon type='arrow-left' />Back</Button>
            </div>
          )}

          {/* Header Text */}
          <div className='header-text'>
            {languageConfig.routeViewer || 'Route Viewer'}
          </div>
          <div className=''>
            {languageConfig.routeViewerDetails}
          </div>
          <div style={{ clear: 'both' }} />
        </div>

        <div className='route-viewer-body'>
          {sortedRoutes
            .map(route => {
              // Find operator based on agency_id (extracted from OTP route ID).
              const operator = coreUtils.route.getTransitOperatorFromOtpRoute(
                route,
                transitOperators
              ) || {}
              return (
                <RouteRow
                  findRoute={findRoute}
                  isActive={viewedRoute && viewedRoute.routeId === route.id}
                  key={route.id}
                  operator={operator}
                  route={route}
                  setViewedRoute={setViewedRoute}
                />
              )
            })
          }
        </div>
      </div>
    )
  }
}

const StyledRouteRow = styled.div`
  background-color: ${props => props.isActive ? '#f6f8fa' : 'white'};
  border-bottom: 1px solid gray;
`

const RouteRowButton = styled(Button)`
  align-items: center;
  display: flex;
  padding: 6px;
  width: 100%;
`

const RouteRowElement = styled.span`
`

const OperatorImg = styled.img`
  height: 25px;
  margin-right: 8px;
`

const ModeIconElement = styled.span`
  display: inline-block;
  vertical-align: bottom;
  height: 22px;
`

const RouteNameElement = styled(Label)`
  background-color: ${props => (
    props.backgroundColor === '#ffffff' || props.backgroundColor === 'white'
      ? 'rgba(0,0,0,0)'
      : props.backgroundColor
  )};
  color: ${props => props.color};
  flex: 0 1 auto;
  font-size: medium;
  font-weight: 400;
  margin-left: ${props => (
    props.backgroundColor === '#ffffff' || props.backgroundColor === 'white'
      ? 0
      : '8px'
  )};
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
`

const RouteDetails = styled.div`
  padding: 8px;
`

class RouteRow extends PureComponent {
  static contextType = ComponentContext

  _onClick = () => {
    const { findRoute, isActive, route, setViewedRoute } = this.props
    if (isActive) {
      // Deselect current route if active.
      setViewedRoute({ routeId: null })
    } else {
      // Otherwise, set active and fetch route patterns.
      findRoute({ routeId: route.id })
      setViewedRoute({ routeId: route.id })
    }
  }

  getCleanRouteLongName ({ route, longNameSplitter }) {
    let longName = ''
    if (route.longName) {
      // Attempt to split route name if splitter is defined for operator (to
      // remove short name value from start of long name value).
      const nameParts = route.longName.split(longNameSplitter)
      longName = (longNameSplitter && nameParts.length > 1)
        ? nameParts[1]
        : route.longName
      // If long name and short name are identical, set long name to be an empty
      // string.
      if (longName === route.shortName) longName = ''
    }
    return longName
  }

  render () {
    const { isActive, route, operator } = this.props
    const { ModeIcon } = this.context

    const {defaultRouteColor, defaultRouteTextColor, longNameSplitter} = operator || {}
    const backgroundColor = `#${defaultRouteColor || route.color || 'ffffff'}`
    // NOTE: text color is not a part of short response route object, so there
    // is no way to determine from OTP what the text color should be if the
    // background color is, say, black. Instead, determine the appropriate
    // contrast color and use that if no text color is available.
    const contrastColor = getContrastYIQ(backgroundColor)
    const color = `#${defaultRouteTextColor || route.textColor || contrastColor}`
    // Default long name is empty string (long name is an optional GTFS value).
    const longName = this.getCleanRouteLongName({ route, longNameSplitter })
    return (
      <StyledRouteRow isActive={isActive}>
        <RouteRowButton
          className='clear-button-formatting'
          onClick={this._onClick}
        >
          <RouteRowElement>
            {operator && operator.logo &&
              <OperatorImg
                alt={`${operator.name} logo`}
                src={operator.logo}
              />
            }
          </RouteRowElement>
          <ModeIconElement>
            <ModeIcon height={22} mode={getModeFromRoute(route)} width={22} />
          </ModeIconElement>
          <RouteNameElement
            backgroundColor={backgroundColor}
            color={color}
            title={`${route.shortName} ${longName}`}
          >
            <b>{route.shortName}</b> {longName}
          </RouteNameElement>
        </RouteRowButton>
        <VelocityTransitionGroup enter={{animation: 'slideDown'}} leave={{animation: 'slideUp'}}>
          {isActive && (
            <RouteDetails>
              {route.url
                ? <a href={route.url} target='_blank'>Route Details</a>
                : 'No route URL provided.'
              }
            </RouteDetails>
          )}
        </VelocityTransitionGroup>
      </StyledRouteRow>
    )
  }
}
// connect to redux store

const mapStateToProps = (state, ownProps) => {
  return {
    transitOperators: state.otp.config.transitOperators,
    routes: state.otp.transitIndex.routes,
    viewedRoute: state.otp.ui.viewedRoute,
    languageConfig: state.otp.config.language
  }
}

const mapDispatchToProps = {
  findRoute,
  findRoutes,
  setMainPanelContent,
  setViewedRoute
}

export default connect(mapStateToProps, mapDispatchToProps)(RouteViewer)
