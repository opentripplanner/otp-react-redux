import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import MobileContainer from './container'
import MobileNavigationBar from './navigation-bar'

import RouteViewer from '../viewers/route-viewer'
import DefaultMap from '../map/default-map'

import { setViewedRoute, setMainPanelContent } from '../../actions/ui'
import { ComponentContext } from '../../util/contexts'

class MobileRouteViewer extends Component {
  static propTypes = {
    setViewedRoute: PropTypes.func,
    setMainPanelContent: PropTypes.func
  }

  static contextType = ComponentContext

  _backClicked = () => {
    this.props.setViewedRoute(null)
    this.props.setMainPanelContent(null)
  }

  render () {
    const { ModeIcon } = this.context
    return (
      <MobileContainer>
        <MobileNavigationBar
          headerText={this.props.languageConfig.routeViewer || 'Route Viewer'}
          showBackButton
          onBackClicked={this._backClicked}
        />
        <div className='viewer-map'>
          <DefaultMap />
        </div>

        <div className='viewer-container'>
          <RouteViewer hideBackButton ModeIcon={ModeIcon} />
        </div>
      </MobileContainer>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    languageConfig: state.otp.config.language
  }
}

const mapDispatchToProps = {
  setViewedRoute,
  setMainPanelContent
}

export default connect(mapStateToProps, mapDispatchToProps)(MobileRouteViewer)
