import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import RouteViewer from '../viewers/route-viewer'
import DefaultMap from '../map/default-map'
import { setViewedRoute, setMainPanelContent } from '../../actions/ui'
import { ComponentContext } from '../../util/contexts'

import MobileNavigationBar from './navigation-bar'
import MobileContainer from './container'

class MobileRouteViewer extends Component {
  static propTypes = {
    setMainPanelContent: PropTypes.func,
    setViewedRoute: PropTypes.func
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
          onBackClicked={this._backClicked}
          showBackButton
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
  setMainPanelContent,
  setViewedRoute
}

export default connect(mapStateToProps, mapDispatchToProps)(MobileRouteViewer)
