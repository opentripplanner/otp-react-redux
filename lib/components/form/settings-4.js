import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { Row, Col, Button, ButtonGroup } from 'react-bootstrap'
import { VelocityTransitionGroup } from 'velocity-react'

import { setQueryParam } from '../../actions/form'
import ModeButton from './mode-button'
import { getModeIcon, isAccessMode, hasBike, isTransit, hasTransit } from '../../util/itinerary'
import GeneralSettingsPanel from './general-settings-panel'

class SettingsSelectorPanel extends Component {
  static propTypes = {
    icons: PropTypes.object
  }

  constructor (props) {
    super(props)
    this.state = { activePanel: 'MODES' }
  }

  // Returns whether a particular mode or TNC agency is active
  _modeIsActive (mode) {
    const {companies, queryModes} = this.props
    if (mode.mode === 'CAR_HAIL') {
      return Boolean(companies && companies.includes(mode.company.toUpperCase()))
    }

    for (const m of queryModes) {
      if (m.startsWith(mode.mode)) return true
    }
    return false
  }

  _setSoloMode (mode) {
    // save current access/transit modes
    if (hasTransit(this.props.mode)) this._lastTransitMode = this.props.mode
    this.props.setQueryParam({ mode })
  }

  _setTransit = () => {
    if (this._lastTransitMode) {
      // returning to transit from active mode
      this.props.setQueryParam({ mode: this._lastTransitMode })
      this._lastTransitMode = null
    } else {
      this.props.setQueryParam({ mode: 'WALK,TRAM,BUS,RAIL,GONDOLA' })
    }
  }

  _setWalkOnly = () => { this._setSoloMode('WALK') }

  _setBikeOnly = () => { this._setSoloMode('BICYCLE') }

  _setOwnBike = () => {
    const nonBikeModes = this.props.queryModes.filter(m => !m.startsWith('BICYCLE'))
    this.props.setQueryParam({ mode: 'BICYCLE,' + nonBikeModes.join(',') })
  }

  _setRentedBike = () => {
    const nonBikeModes = this.props.queryModes.filter(m => !m.startsWith('BICYCLE'))
    this.props.setQueryParam({ mode: 'BICYCLE_RENT,' + nonBikeModes.join(',') })
  }

  _toggleTransitMode (mode) {
    const modeStr = mode.mode || mode
    let queryModes = this.props.queryModes.slice(0) // Clone the modes array

    // do not allow the last transit mode to be deselected
    const transitModes = queryModes.filter(m => isTransit(m))
    if (transitModes.length === 1 && transitModes[0] === modeStr) return

    // If mode is currently selected, deselect it
    if (queryModes.includes(modeStr)) {
      queryModes = queryModes.filter(m => m !== modeStr)
    // Or, if mode is currently not selected, select it
    } else if (!queryModes.includes(modeStr)) {
      queryModes.push(modeStr)
    }
    this.props.setQueryParam({ mode: queryModes.join(',') })
  }

  _setAccessMode = (mode) => {
    let queryModes = this.props.queryModes.slice(0) // Clone the modes array
    const modeStr = mode.mode || mode
    const queryParamUpdate = {}

    queryModes = queryModes.filter(m => !isAccessMode(m))
    queryModes.push(modeStr)

    // do extra stuff if mode selected was a TNC
    queryParamUpdate.companies = modeStr === 'CAR_HAIL' ? mode.company.toUpperCase() : null

    queryParamUpdate.mode = queryModes.join(',')

    this.props.setQueryParam(queryParamUpdate)
  }

  render () {
    const { mode, icons, queryModes } = this.props

    const modeHasTransit = hasTransit(mode)

    const transitModes = [
      {
        mode: 'BUS',
        label: 'Bus'
      },
      {
        mode: 'TRAM',
        label: 'MAX & Streetcar'
      },
      {
        mode: 'RAIL',
        label: 'Wes'
      },
      {
        mode: 'GONDOLA',
        label: 'Aerial Tram'
      }
    ]

    const accessModes = [
      {
        mode: 'WALK',
        label: 'Walk + Transit'
      },
      {
        mode: 'BICYCLE',
        label: 'Bike + Transit'
      },
      {
        mode: 'CAR_PARK',
        label: 'Park & Ride'
      },
      {
        mode: 'CAR_HAIL',
        company: 'UBER',
        label: 'Uber + Transit'
      },
      {
        mode: 'CAR_HAIL',
        company: 'LYFT',
        label: 'Lyft + Transit'
      },
      {
        mode: 'CAR_RENT',
        label: 'car2go + Transit'
      }
    ]

    const bikeOptions = [
      {
        mode: 'BICYCLE',
        label: 'Own Bike',
        iconWidth: 18,
        action: this._setOwnBike
      },
      {
        mode: 'BICYCLE_RENT',
        label: 'Biketown',
        iconWidth: 36,
        action: this._setRentedBike
      }
    ]

    const sideButtonStyle = {
      height: 30,
      lineHeight: '1.1',
      fontSize: 12,
      borderLeft: '1px solid #f0f0f0',
      textAlign: 'center',
      padding: '6px 0px'
    }
    return (
      <div className='settings-selector-panel'>
        {/* Trip type (Transit / Walk Only / Bike Only) selector */}
        <Row className='button-row'>
          <Col xs={12}>
            <ButtonGroup justified>
              <ButtonGroup key='transit' style={{ width: '100%' }}>
                <Button style={{ height: 60 }}
                  className={modeHasTransit ? 'selected' : ''}
                  onClick={this._setTransit}
                >
                  <div>
                    <div style={{ display: 'inline-block', marginRight: 10, width: 30, height: 30, verticalAlign: 'middle' }}>{getModeIcon('TRANSIT', icons)}</div>
                    <div style={{ display: 'inline-block', fontSize: 28, fontWeight: 500, verticalAlign: 'middle' }}>Take Transit</div>
                  </div>
                </Button>
              </ButtonGroup>
            </ButtonGroup>
          </Col>
        </Row>

        <div className='modes-panel'>
          {/* transit access mode selector */}
          <Row className='mode-group-row'>
            {accessModes.map((mode, k) => {
              return <Col xs={4} key={k}>
                <ModeButton
                  enabled={modeHasTransit}
                  active={modeHasTransit && this._modeIsActive(mode)}
                  icons={icons}
                  mode={mode}
                  height={46}
                  label={mode.label}
                  showPlusTransit
                  onClick={() => this._setAccessMode(mode)}
                />
              </Col>
            })}
          </Row>

          {/* transit mode selector */}
          <Row className='mode-group-row'>
            {/*<div className='group-header'>
              <div className='group-name'>Transit</div>
            </div>*/}
            {transitModes.map((mode, k) => {
              return (
                <Col xs={3} key={k}>
                  <ModeButton
                    enabled={modeHasTransit}
                    active={this._modeIsActive(mode)}
                    icons={icons}
                    mode={mode}
                    label={mode.label}
                    showCheck
                    height={56}
                    onClick={() => this._toggleTransitMode(mode)}
                  />
                </Col>
              )
            })}
          </Row>

        </div>

        {/* Walk/bike only selectors */}
        <Row className='button-row'>
          <Col xs={12}>
            <ButtonGroup justified>
              <ButtonGroup key='walk-only' style={{ width: 45 }}>
                <Button style={sideButtonStyle}
                  className={mode === 'WALK' ? 'selected' : ''}
                  onClick={this._setWalkOnly}
                >
                  <div style={{ display: 'inline-block', marginRight: 5, width: 12, height: 12, verticalAlign: 'middle' }}>{getModeIcon('WALK', icons)}</div>
                  <span style={{ verticalAlign: 'middle' }}>Walk Only</span>
                </Button>
              </ButtonGroup>
              <ButtonGroup key='bike-only' style={{ width: 45 }}>
                <Button style={sideButtonStyle}
                  className={!modeHasTransit && hasBike(mode) ? 'selected' : ''}
                  onClick={this._setBikeOnly}
                >
                  <div style={{ display: 'inline-block', marginRight: 5, width: 12, height: 12, verticalAlign: 'middle' }}>{getModeIcon('BICYCLE', icons)}</div>
                  <span style={{ verticalAlign: 'middle' }}>Bike Only</span>
                </Button>
              </ButtonGroup>
            </ButtonGroup>
          </Col>
        </Row>

        {/* general settings */}
        <Row>
          <Col xs={12} className='general-settings-panel'>
            <div style={{ fontSize: 18, margin: '16px 0px' }}>Travel Preferences</div>
            {hasBike(mode) && (<div style={{ marginBottom: 16 }}>
              <div className='setting-label' style={{ float: 'left' }}>Use</div>
              <div style={{ textAlign: 'right' }}>
                <ButtonGroup>
                  {bikeOptions.map((option, k) => {
                    return (
                      <Button key={k}
                        style={{ backgroundColor: queryModes.includes(option.mode) ? '#000' : '#aaa', color: '#fff', letterSpacing: 1, textTransform: 'uppercase', fontSize: 12 }}
                        onClick={option.action}
                      >
                        <div style={{ display: 'inline-block', width: option.iconWidth, height: 18, fill: '#fff', verticalAlign: 'middle', marginRight: 10 }}>
                          {getModeIcon(option.mode, icons)}
                        </div>
                        <span style={{ verticalAlign: 'middle' }}>{option.label}</span>
                      </Button>
                    )
                  })}
                </ButtonGroup>
              </div>
            </div>)}
            <GeneralSettingsPanel />
          </Col>
        </Row>
      </div>
    )
  }
}

// connect to redux store

const mapStateToProps = (state, ownProps) => {
  const { companies, mode, routingType } = state.otp.currentQuery
  return {
    mode,
    companies,
    modeGroups: state.otp.config.modeGroups,
    queryModes: !mode || mode.length === 0 ? [] : mode.split(','),
    routingType
  }
}

const mapDispatchToProps = { setQueryParam }

export default connect(mapStateToProps, mapDispatchToProps)(SettingsSelectorPanel)
