import coreUtils from '@opentripplanner/core-utils'
import React, { Component, PureComponent } from 'react'
import PropTypes from 'prop-types'
import { Label, Button } from 'react-bootstrap'
import { VelocityTransitionGroup } from 'velocity-react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import tinycolor from 'tinycolor2'

import Icon from '../narrative/icon'
import { setMainPanelContent, setViewedRoute } from '../../actions/ui'
import { findRoutes, findRoute } from '../../actions/api'
import { ComponentContext } from '../../util/contexts'
import { getModeFromRoute } from '../../util/viewer'

import RouteDetails from './route-details'

/**
 * Determine the appropriate contrast color for text (white or black) based on
 * the input hex string (e.g., '#ff00ff') value.
 *
 * From https://stackoverflow.com/a/11868398/915811
 *
 * TODO: Move to @opentripplanner/core-utils once otp-rr uses otp-ui library.
 */
function getContrastYIQ (hexcolor) {
  return tinycolor
    .mostReadable(hexcolor, ['#fff', '#000'], { level: 'AAA' })
    .toHexString()
    // Have to do this to remain compatible with former version of this function
    .split('#')[1]
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
      routes,
      setViewedRoute,
      transitOperators,
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
  background-color: ${props => props.isActive ? props.routeColor : 'white'};
  border-bottom: 1px solid gray;
`

const RouteRowButton = styled(Button)`
  align-items: center;
  display: flex;
  padding: 6px;
  width: 100%;
  transition: all ease-in-out 0.1s;

  &:hover {
    background-color: ${(props) =>
    !props.isActive && tinycolor(props.routeColor)
      .brighten(90)
      .toHexString()};
    border-radius: 0;
  }

  &:active:focus,
  &:active:hover {
    background-color: ${(props) => props.routeColor};
    border-radius: 0;
  }
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

  getCleanRouteLongName ({ longNameSplitter, route }) {
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
    const { isActive, operator, route } = this.props
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
    const longName = this.getCleanRouteLongName({ longNameSplitter, route })
    return (
      <StyledRouteRow isActive={isActive} routeColor={backgroundColor}>
        <RouteRowButton
          className='clear-button-formatting'
          isActive={isActive}
          onClick={this._onClick}
          routeColor={backgroundColor}
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
            <ModeIcon height={22} mode={getModeFromRoute(route)} style={{fill: isActive && color}} width={22} />
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
            <RouteDetails route={route} routeColor={backgroundColor} />
          )}
        </VelocityTransitionGroup>
      </StyledRouteRow>
    )
  }
}
// connect to redux store

const mapStateToProps = (state, ownProps) => {
  return {
    languageConfig: state.otp.config.language,
    routes: state.otp.transitIndex.routes,
    transitOperators: state.otp.config.transitOperators,
    viewedRoute: state.otp.ui.viewedRoute
  }
}

const mapDispatchToProps = {
  findRoute,
  findRoutes,
  setMainPanelContent,
  setViewedRoute
}

export default connect(mapStateToProps, mapDispatchToProps)(RouteViewer)
