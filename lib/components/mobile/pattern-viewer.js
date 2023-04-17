import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import * as uiActions from '../../actions/ui'
import { ComponentContext } from '../../util/contexts'
import DefaultMap from '../map/default-map'
import PatternViewer from '../viewers/pattern-viewer'

import MobileContainer from './container'
import MobileNavigationBar from './navigation-bar'

class MobilePatternViewer extends Component {
  static propTypes = {
    intl: PropTypes.object,
    setMainPanelContent: PropTypes.func,
    setViewedRoute: PropTypes.func
  }

  static contextType = ComponentContext

  _backClicked = () => {
    this.props.setViewedRoute(null)
    this.props.setMainPanelContent(null)
  }

  render() {
    const { intl } = this.props
    const { ModeIcon } = this.context
    return (
      <MobileContainer>
        <MobileNavigationBar
          headerText={intl.formatMessage({
            id: 'components.RouteViewer.header'
          })}
          onBackClicked={this._backClicked}
        />
        <main tabIndex={-1}>
          <div className="viewer-container">
            <PatternViewer hideBackButton ModeIcon={ModeIcon} />
          </div>

          {/* The map is less important semantically, so keyboard focus and screen readers
              will focus on the route viewer first. The map will still appear first visually. */}
          <div className="viewer-map">
            <DefaultMap />
          </div>
        </main>
      </MobileContainer>
    )
  }
}

// connect to the redux store

const mapDispatchToProps = {
  setMainPanelContent: uiActions.setMainPanelContent,
  setViewedRoute: uiActions.setViewedRoute
}

export default connect(
  null,
  mapDispatchToProps
)(injectIntl(MobilePatternViewer))
