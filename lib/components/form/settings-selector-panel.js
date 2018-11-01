import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { Row, Col, Button, ButtonGroup } from 'react-bootstrap'

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

    // Create object to contain multiple parameter updates if needed (i.e. 'mode', 'compainies')
    const queryParamUpdate = {}

    if (this._lastTransitMode) {
      // Restore previous transit selection, if present
      queryModes = this._lastTransitMode.split(',').filter(m => !isAccessMode(m))
      this._lastTransitMode = null
    } else {
      // Otherwise, retain any currently selected transit modes
      queryModes = queryModes.filter(m => !isAccessMode(m))
    }

    // If no transit modes selected, select all
    // TODO: populate based on config
    if (!queryModes || queryModes.length === 0) queryModes = ['BUS', 'TRAM', 'RAIL', 'GONDOLA']

    // Add the access mode
    queryModes.push(modeStr)

    // Do extra stuff if mode selected was a TNC
    queryParamUpdate.companies = modeStr === 'CAR_HAIL' ? mode.company.toUpperCase() : null

    queryParamUpdate.mode = queryModes.join(',')

    this.props.setQueryParam(queryParamUpdate)
  }

  render () {
    const { mode, icons, queryModes } = this.props

    const modeHasTransit = hasTransit(mode)

    // TODO: make configurable
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

    return (
      <div className='settings-selector-panel'>
        <div className='modes-panel'>
          {/* Take Transit button */}
          <Row className='mode-group-row'>
            <Col xs={12}>
              <ModeButton
                enabled
                active={modeHasTransit && this._modeIsActive({ mode: 'WALK' })}
                icons={icons}
                mode={'TRANSIT'}
                height={54}
                label={'Take Transit'}
                inlineLabel
                onClick={() => this._setAccessMode('WALK')}
              />
            </Col>
          </Row>

          {/* transit access mode selector */}
          <Row className='mode-group-row'>
            {accessModes.map((mode, k) => {
              return <Col xs={4} key={k}>
                <ModeButton
                  enabled
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

          <Row className='mode-group-row'>
            <Col xs={2} />
            <Col xs={4}>
              <ModeButton
                enabled
                active={mode === 'WALK'}
                icons={icons}
                mode={'WALK'}
                height={36}
                label={'Walk Only'}
                inlineLabel
                onClick={this._setWalkOnly}
              />
            </Col>
            <Col xs={4}>
              <ModeButton
                enabled
                active={!modeHasTransit && hasBike(mode)}
                icons={icons}
                mode={'BICYCLE'}
                height={36}
                label={'Bike Only'}
                inlineLabel
                onClick={this._setBikeOnly}
              />
            </Col>
            <Col xs={2} />
          </Row>

          {/* Transit mode selector */}
          <Row className='mode-group-row'>
            <Col xs={12}>
              <div className='group-header'>
                <div className='group-name' style={{ color: modeHasTransit ? '#000' : '#ccc' }}>Filter Transit Modes</div>
              </div>
            </Col>
            <Col xs={12} style={{ textAlign: 'center' }}>
              {transitModes.map((mode, k) => {
                return (<div style={{ display: 'inline-block', width: 64 }} key={k}>
                  <ModeButton
                    enabled={modeHasTransit}
                    active={this._modeIsActive(mode)}
                    icons={icons}
                    mode={mode}
                    label={mode.label}
                    showCheck
                    height={44}
                    onClick={() => this._toggleTransitMode(mode)}
                  />
                </div>)
              })}
            </Col>
          </Row>

        </div>

        {/* Travel Preferences */}
        <Row>
          <Col xs={12} className='general-settings-panel'>
            <div style={{ fontSize: 18, margin: '16px 0px' }}>Travel Preferences</div>

            {/* The bike trip type selector */}
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

            {/* Other general settings */}
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
