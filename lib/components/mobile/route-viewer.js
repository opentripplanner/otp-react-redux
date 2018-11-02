import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import MobileContainer from './container'
import MobileNavigationBar from './navigation-bar'

import RouteViewer from '../viewers/route-viewer'
import DefaultMap from '../map/default-map'

import { setViewedRoute, setMainPanelContent } from '../../actions/ui'

class MobileRouteViewer extends Component {
  static propTypes = {
    setViewedRoute: PropTypes.func,
    setMainPanelContent: PropTypes.func
  }

  _backClicked = () => {
    this.props.setViewedRoute(null)
    this.props.setMainPanelContent(null)
  }

  render () {
    return (
      <MobileContainer>
        <MobileNavigationBar
          headerText={'Route Viewer'}
          showBackButton
          onBackClicked={this._backClicked}
        />
        <div className='viewer-map'>
          <DefaultMap />
        </div>

        <div className='viewer-container'>
          <RouteViewer hideBackButton />
        </div>
      </MobileContainer>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return { }
}

const mapDispatchToProps = {
  setViewedRoute,
  setMainPanelContent
}

export default connect(mapStateToProps, mapDispatchToProps)(MobileRouteViewer)
