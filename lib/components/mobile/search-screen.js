import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Row, Col } from 'react-bootstrap'

import DateTimePreview from '../form/date-time-preview'
import DefaultMap from '../map/default-map'
import LocationField from '../form/location-field'
import PlanTripButton from '../form/plan-trip-button'
import SettingsPreview from '../form/settings-preview'

import MobileContainer from './container'
import MobileNavigationBar from './navigation-bar'

import { MobileScreens, setMobileScreen } from '../../actions/ui'

class MobileSearchScreen extends Component {
  static propTypes = {
    icons: PropTypes.object,
    map: PropTypes.element,

    setMobileScreen: PropTypes.func
  }

  _fromFieldClicked = () => {
    this.props.setMobileScreen(MobileScreens.SET_FROM_LOCATION)
  }

  _toFieldClicked = () => {
    this.props.setMobileScreen(MobileScreens.SET_TO_LOCATION)
  }

  _expandDateTimeClicked = () => {
    this.props.setMobileScreen(MobileScreens.SET_DATETIME)
  }

  _expandOptionsClicked = () => {
    this.props.setMobileScreen(MobileScreens.SET_OPTIONS)
  }

  _planTripClicked = () => {
    this.props.setMobileScreen(MobileScreens.RESULTS_SUMMARY)
  }

  render () {
    const { icons } = this.props

    return (
      <MobileContainer>
        <MobileNavigationBar headerText='Plan Your Trip' />
        <div className='mobile-padding'>
          <LocationField
            type='from'
            onClick={this._fromFieldClicked}
            showClearButton={false}
          />
          <LocationField
            type='to'
            onClick={this._toFieldClicked}
            showClearButton={false}
          />

          <Row>
            <Col xs={6} style={{ borderRight: '2px solid #ccc' }}>
              <DateTimePreview
                onClick={this._expandDateTimeClicked}
                compressed
              />
            </Col>
            <Col xs={6}>
              <SettingsPreview
                onClick={this._expandOptionsClicked}
                icons={icons}
                compressed
              />
            </Col>
          </Row>

          <PlanTripButton onClick={this._planTripClicked} />
        </div>
        <div className='search-map'>
          <DefaultMap />
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
  setMobileScreen
}

export default connect(mapStateToProps, mapDispatchToProps)(MobileSearchScreen)
