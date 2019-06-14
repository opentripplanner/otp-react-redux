import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Label, Button } from 'react-bootstrap'
import { VelocityTransitionGroup } from 'velocity-react'
import { connect } from 'react-redux'

import Icon from '../narrative/icon'

import { setMainPanelContent, setViewedRoute } from '../../actions/ui'
import { findRoutes, findRoute } from '../../actions/api'
import { routeComparator } from '../../util/itinerary'

function operatorForRoute (operators, route) {
  return operators.find(o =>
    o.id.toLowerCase() === route.agency.id.split(':')[0].toLowerCase())
}

function operatorIndexForRoute (operators, route) {
  const index = operators.findIndex(o =>
    o.id.toLowerCase() === route.agency.id.split(':')[0].toLowerCase())
  if (index !== -1 && typeof operators[index].order !== 'undefined') return operators[index].order
  else return 0
}

class RouteViewer extends Component {
  static propTypes = {
    hideBackButton: PropTypes.bool,
    routes: PropTypes.object
  }

  _backClicked = () => this.props.setMainPanelContent(null)

  componentWillMount () {
    this.props.findRoutes()
  }

  componentDidMount () {
    // this.props.findRoute({ routeId: 'TriMet:1' })
    // this.props.setViewedRoute({ routeId: 'TriMet:1' })
  }

  render () {
    const { operators, routes, hideBackButton, languageConfig } = this.props
    const sortedRoutes = routes ? Object.values(routes).sort(routeComparator) : []
    const agencySortedRoutes = operators.length > 0
      ? sortedRoutes.sort((a, b) => {
        const aOperator = operatorIndexForRoute(operators, a)
        const bOperator = operatorIndexForRoute(operators, b)
        if (aOperator - bOperator > 0) return 1
        if (aOperator - bOperator < 0) return -1
        else return 0
      })
      : sortedRoutes
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
          {agencySortedRoutes
            .map(route => {
              // Find operator based on agency_id (extracted from OTP route ID).
              const operator = operatorForRoute(operators, route) || {}
              return (
                <RouteRow
                  key={route.id}
                  operator={operator}
                  route={route}
                  {...this.props} />
              )
            })
          }
        </div>
      </div>
    )
  }
}

class RouteRow extends Component {
  isActiveRoute = () => {
    const { route, viewedRoute } = this.props
    return viewedRoute && viewedRoute.routeId === route.id
  }

  _onClick = () => {
    const { route, findRoute, setViewedRoute } = this.props
    if (this.isActiveRoute()) {
      // Deselect current route if active.
      setViewedRoute({ routeId: null })
    } else {
      // Otherwise, set active and fetch route patterns.
      findRoute({ routeId: route.id })
      setViewedRoute({ routeId: route.id })
    }
  }

  render () {
    const { operator, route, routes, viewedRoute } = this.props
    const isActive = this.isActiveRoute()
    const {defaultRouteColor, defaultRouteTextColor, longNameSplitter} = operator
    const activeRouteData = isActive ? routes[viewedRoute.routeId] : null
    const color = `#${defaultRouteTextColor || route.textColor || '000000'}`
    const backgroundColor = `#${defaultRouteColor || route.color || 'ffffff'}`
    const longName = (longNameSplitter && route.longName && route.longName.split(longNameSplitter).length > 1)
      ? route.longName.split(longNameSplitter)[1]
      : route.longName
    return (
      <div
        style={{
          borderBottom: '1px solid gray',
          backgroundColor: isActive ? '#f6f8fa' : 'white'
        }}>
        <Button className='clear-button-formatting' style={{ padding: 8, width: '100%' }}
          onClick={this._onClick}
        >
          <div style={{display: 'inline-block'}}>
            {operator && <img src={operator.logo} style={{marginRight: '5px'}} height={25}/>}
          </div>
          <div style={{display: 'inline-block', marginTop: '2px'}}>
            <Label
              style={{
                backgroundColor: backgroundColor === '#ffffff' ? 'rgba(0,0,0,0)' : backgroundColor,
                fontSize: 'medium',
                fontWeight: 400,
                color
              }}>
              <b>{route.shortName}</b> {longName}
            </Label>
          </div>
        </Button>
        <VelocityTransitionGroup enter={{animation: 'slideDown'}} leave={{animation: 'slideUp'}}>
          {isActive && (
            <div style={{ padding: 8 }}>
              {activeRouteData.url
                ? <a href={activeRouteData.url} target='_blank'>Route Details</a>
                : 'No route URL provided.'
              }
            </div>
          )}
        </VelocityTransitionGroup>
      </div>
    )
  }
}
// connect to redux store

const mapStateToProps = (state, ownProps) => {
  return {
    operators: state.otp.config.operators,
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
