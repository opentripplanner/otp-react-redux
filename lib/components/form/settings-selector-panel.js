import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { Row, Col, Button } from 'react-bootstrap'

import {
  clearDefaultSettings,
  resetForm,
  setQueryParam,
  storeDefaultSettings
} from '../../actions/form'
import ModeButton from './mode-button'
import Icon from '../narrative/icon'
import {
  getModeIcon,
  isAccessMode,
  hasBike,
  isTransit,
  hasTransit,
  getTransitModes
} from '../../util/itinerary'
import { getTripOptionsFromQuery, isNotDefaultQuery } from '../../util/query'
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
    const { companies, queryModes } = this.props
    if (mode.mode === 'CAR_HAIL' || mode.mode === 'CAR_RENT') {
      return Boolean(companies && mode.company && companies.includes(mode.company.toUpperCase()))
    }

    for (const m of queryModes) {
      if (m === mode.mode) return true
    }
    // All transit modes are selected
    // if (isTransit(mode.mode) && queryModes.indexOf('TRANSIT') !== -1) return true
    return false
  }

  _setSoloMode (mode) {
    // save current access/transit modes
    if (hasTransit(this.props.mode)) this._lastTransitMode = this.props.mode
    this.props.setQueryParam({ mode })
  }

  _setWalkOnly = () => { this._setSoloMode('WALK') }

  _setBikeOnly = () => { this._setSoloMode('BICYCLE') }

  _addBikeModeToQueryModes = (bikeMode) => {
    const { queryModes, setQueryParam } = this.props
    const nonBikeModes = queryModes.filter(m => !m.startsWith('BICYCLE'))
    setQueryParam({ mode: [...nonBikeModes, bikeMode].join(',') })
  }

  _setOwnBike = () => this._addBikeModeToQueryModes('BICYCLE')

  _setRentedBike = () => this._addBikeModeToQueryModes('BICYCLE_RENT')

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

  _getStoredSettings = () => window.localStorage.getItem('otp.defaultQuery')

  _toggleStoredSettings = () => {
    const options = getTripOptionsFromQuery(this.props.query)
    if (this._getStoredSettings()) this.props.clearDefaultSettings()
    else this.props.storeDefaultSettings(options)
  }

  _resetForm = () => this.props.resetForm()

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
    if (!queryModes || queryModes.length === 0) {
      queryModes = getTransitModes(this.props.config)
    }

    // Add the access mode
    queryModes.push(modeStr)

    // Do extra stuff if mode selected was a TNC
    queryParamUpdate.companies = (modeStr === 'CAR_HAIL' || modeStr === 'CAR_RENT')
      ? mode.company.toUpperCase()
      : null

    queryParamUpdate.mode = queryModes.join(',')

    this.props.setQueryParam(queryParamUpdate)
  }

  render () {
    const { config, mode, icons, query, queryModes } = this.props

    const modeHasTransit = hasTransit(mode)
    // TODO: make configurable
    const { transitModes, accessModes, bicycleModes } = config.modes
    // Do not permit remembering trip options if they do not differ from the
    // defaults and nothing has been stored
    const queryIsDefault = !isNotDefaultQuery(query, config)
    const rememberIsDisabled = queryIsDefault && !this._getStoredSettings()
    return (
      <div className='settings-selector-panel'>
        <div className='modes-panel'>
          <div style={{ marginBottom: '5px' }} className='pull-right'>
            <Button
              bsStyle='link'
              bsSize='xsmall'
              disabled={rememberIsDisabled}
              onClick={this._toggleStoredSettings}
            >{this._getStoredSettings()
                ? <span><Icon type='times' /> Forget my options</span>
                : <span><Icon type='lock' /> Remember trip options</span>
              }</Button>
            <Button
              bsStyle='link'
              bsSize='xsmall'
              disabled={queryIsDefault}
              onClick={this._resetForm}
            >
              <Icon type='undo' />{' '}
              Restore{this._getStoredSettings() ? ' my' : ''} defaults
            </Button>
          </div>
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
          {/* <Row className='mode-group-row'>
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
          </Row> */}

        </div>

        {/* Travel Preferences */}
        <Row>
          <Col xs={12} className='general-settings-panel'>
            <div style={{ fontSize: 18, margin: '16px 0px' }}>Travel Preferences</div>

            {/* The transit mode selected */}
            {hasTransit(mode) && (<div style={{ marginBottom: 16 }}>
              <div className='setting-label'>Use</div>
              <div style={{ textAlign: 'left' }}>
                {transitModes.map((mode, k) => {
                  let classNames = ['select-button']
                  if (this._modeIsActive(mode)) classNames.push('active')
                  return <Button key={mode.mode}
                    className={classNames.join(' ')}
                    style={{ marginTop: 3, marginBottom: 3, marginLeft: 0, marginRight: 5 }}
                    onClick={() => this._toggleTransitMode(mode)}
                  >
                    <div
                      className='mode-icon'
                      style={{ display: 'inline-block', fill: '#000', width: 16, height: 16, marginRight: 5, verticalAlign: 'middle' }}>
                      {getModeIcon(mode, icons)}
                    </div>
                    {mode.label}
                  </Button>
                })}
              </div>
              <div style={{ clear: 'both' }} />
            </div>)}

            {/* The bike trip type selector */}
            {hasBike(mode) && !hasTransit(mode) && (<div style={{ marginBottom: 16 }}>
              <div className='setting-label' style={{ float: 'left' }}>Use</div>
              <div style={{ textAlign: 'right' }}>
                {bicycleModes.map((option, k) => {
                  let action = this._setOwnBike
                  if (option.mode === 'BICYCLE_RENT') action = this._setRentedBike
                  let classNames = ['select-button']
                  if (queryModes.includes(option.mode)) classNames.push('active')
                  // TODO: Handle different bikeshare networks
                  return (
                    <Button key={k}
                      className={classNames.join(' ')}
                      onClick={action}
                    >
                      <div style={{ display: 'inline-block', width: option.iconWidth, height: 18, fill: '#000', verticalAlign: 'middle', marginRight: 10 }}>
                        {getModeIcon(option.mode, icons)}
                      </div>
                      <span style={{ verticalAlign: 'middle' }}>{option.label}</span>
                    </Button>
                  )
                })}
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
  const { config, currentQuery, defaults } = state.otp
  const { companies, mode, routingType } = currentQuery
  return {
    defaults,
    query: currentQuery,
    config,
    mode,
    companies,
    modeGroups: config.modeGroups,
    queryModes: !mode || mode.length === 0 ? [] : mode.split(','),
    routingType
  }
}

const mapDispatchToProps = {
  clearDefaultSettings,
  resetForm,
  setQueryParam,
  storeDefaultSettings
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsSelectorPanel)
