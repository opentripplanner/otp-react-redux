import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap'
import { VelocityTransitionGroup } from 'velocity-react'
import { connect } from 'react-redux'

import Icon from '../narrative/icon'

import { setMainPanelContent, setViewedRoute } from '../../actions/ui'
import { findRoutes, findRoute } from '../../actions/api'
import { routeComparator } from '../../util/itinerary'

class RouteViewer extends Component {
  static propTypes = {
    hideBackButton: PropTypes.bool,
    routes: PropTypes.object
  }

  _backClicked = () => {
    this.props.setMainPanelContent(null)
    this.props.setViewedRoute(null)
  }

  componentWillMount () {
    this.props.findRoutes()
  }

  render () {
    const { routes, viewedRoute, hideBackButton, findRoute, setViewedRoute } = this.props

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
            Route Viewer
          </div>
          <div style={{ clear: 'both' }} />
        </div>

        <div className='route-viewer-body'>
          {routes && Object.values(routes).sort(routeComparator).map(route => {
            const isActiveRoute = viewedRoute && viewedRoute.routeId === route.id
            let activeRouteData
            if (isActiveRoute) {
              activeRouteData = routes[viewedRoute.routeId]
            }
            return (
              <div style={{ borderBottom: '1px solid gray' }} key={route.id}>
                <Button className='clear-button-formatting' style={{ padding: 8 }}
                  onClick={() => {
                    findRoute({ routeId: route.id })
                    setViewedRoute({ routeId: route.id })
                  }}
                >
                  <b>{route.shortName}</b> {route.longName}
                </Button>
                <VelocityTransitionGroup enter={{animation: 'slideDown'}} leave={{animation: 'slideUp'}}>
                  {isActiveRoute && (
                    <div style={{ padding: 8 }}>
                      {activeRouteData.url && (
                        <a href={activeRouteData.url} target='_blank'>Route Details</a>
                      )}
                    </div>
                  )}
                </VelocityTransitionGroup>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}

// connect to redux store

const mapStateToProps = (state, ownProps) => {
  return {
    routes: state.otp.transitIndex.routes,
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
