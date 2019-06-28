import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { Row, Col, Button } from 'react-bootstrap'

import { setQueryParam } from '../../actions/form'
import ModeButton from './mode-button'
import {
  getIcon,
  isAccessMode,
  hasBike,
  isTransit,
  hasMicromobility,
  hasHail,
  hasRental,
  hasTransit,
  getTransitModes
} from '../../util/itinerary'
import GeneralSettingsPanel from './general-settings-panel'

class SettingsSelectorPanel extends Component {
  static propTypes = {
    icons: PropTypes.object
  }

  constructor (props) {
    super(props)
    this.state = { activePanel: 'MODES' }
  }

  // returns whether a micromobility company is selected or not
  _companyIsActive (company) {
    const {companies} = this.props
    return companies && companies.indexOf(company.id) > -1
  }

  // Returns whether a particular mode or TNC agency is active
  _modeIsActive (mode) {
    const {companies, queryModes} = this.props
    if (mode.mode === 'CAR_HAIL' || mode.mode === 'CAR_RENT') {
      return Boolean(companies && mode.company && companies.includes(mode.company.toUpperCase()))
    }

    for (const m of queryModes) {
      if (m === mode.mode) return true
    }
    return false
  }

  _setSoloMode (mode) {
    // save current access/transit modes
    if (hasTransit(this.props.mode)) this._lastTransitMode = this.props.mode
    this.props.setQueryParam({ mode })
  }

  _setWalkOnly = () => { this._setSoloMode('WALK') }

  _setBikeOnly = () => { this._setSoloMode('BICYCLE') }

  _setMicromobilityOnly = () => { this._setSoloMode('MICROMOBILITY') }

  /**
   * Replace own mode with new mode. The only mode will have already been set,
   * so this toggles whether the own mode includes a rental.
   */
  _replaceOwnMode = (newMode, referenceOwnMode) => {
    const { queryModes, setQueryParam } = this.props
    const nonOwnModes = queryModes.filter(m => !m.startsWith(referenceOwnMode))
    setQueryParam({ mode: [...nonOwnModes, newMode].join(',') })
  }

  _setOwnBike = () => this._replaceOwnMode('BICYCLE', 'BICYCLE')

  _setRentedBike = () => this._replaceOwnMode('BICYCLE_RENT', 'BICYCLE')

  _setOwnMicromobility = () => this._replaceOwnMode('MICROMOBILITY', 'MICROMOBILITY')

  _setRentedMicromobility = () => {
    this._replaceOwnMode('MICROMOBILITY_RENT', 'MICROMOBILITY')
    this.props.setQueryParam({ companies: this._getCompaniesForMode('MICROMOBILITY_RENT') })
  }

  _getCompaniesForMode = (modeStr) => {
    const {config} = this.props
    return config.companies
      .filter(co => co.modes.indexOf(modeStr) > -1)
      .map(co => co.id)
      .join(',')
  }

  _toggleCompany (company) {
    const {companies, setQueryParam} = this.props

    // set company if no companies set yet
    if (!companies) {
      setQueryParam({ companies: company })
      return
    }

    // add or remove from existing companies
    if (companies.indexOf(company) > -1) {
      // company already present in query, remove
      setQueryParam({
        companies: companies
          .split(',')
          .filter(co => co !== company)
          .join(',')
      })
    } else {
      // company not yet present, add to string list
      setQueryParam({ companies: `${companies},${company}` })
    }
  }

  _toggleTransitMode (mode) {
    const {queryModes, setQueryParam} = this.props
    const modeStr = mode.mode || mode
    let newQueryModes = queryModes.slice(0) // Clone the modes array

    // do not allow the last transit mode to be deselected
    const transitModes = newQueryModes.filter(m => isTransit(m))
    if (transitModes.length === 1 && transitModes[0] === modeStr) return

    // If mode is currently selected, deselect it
    if (newQueryModes.includes(modeStr)) {
      newQueryModes = newQueryModes.filter(m => m !== modeStr)
    // Or, if mode is currently not selected, select it
    } else if (!newQueryModes.includes(modeStr)) {
      newQueryModes.push(modeStr)
    }
    setQueryParam({ mode: newQueryModes.join(',') })
  }

  _setAccessMode = (mode) => {
    const {config, queryModes} = this.props
    let newQueryModes = queryModes.slice(0) // Clone the modes array
    const modeStr = mode.mode || mode

    // Create object to contain multiple parameter updates if needed (i.e. 'mode', 'compainies')
    const queryParamUpdate = {}

    if (this._lastTransitMode) {
      // Restore previous transit selection, if present
      newQueryModes = this._lastTransitMode.split(',').filter(m => !isAccessMode(m))
      this._lastTransitMode = null
    } else {
      // Otherwise, retain any currently selected transit modes
      newQueryModes = newQueryModes.filter(m => !isAccessMode(m))
    }

    // If no transit modes selected, select all
    if (!newQueryModes || newQueryModes.length === 0) {
      newQueryModes = getTransitModes(config)
    }

    // Add the access mode
    newQueryModes.push(modeStr)

    // apply needed companies to query
    queryParamUpdate.companies = mode.company
      // mode is associated with a specific company
      ? mode.company.toUpperCase()
      // mode is either a rental or hailing mode, but not associated with
      // a specific company
      : (hasRental(modeStr) || hasHail(modeStr))
        // when switching, add all companies at first
        ? this._getCompaniesForMode(modeStr)
        // mode is not renting or hailing and not associated with any company
        : null

    queryParamUpdate.mode = newQueryModes.join(',')

    this.props.setQueryParam(queryParamUpdate)
  }

  _renderCompanies = () => {
    const {companies: queryCompanies, config, icons, mode} = this.props
    const {companies: configCompanies, modes} = config
    const {accessModes} = modes

    // check if a single company has an exclusive button
    if (queryCompanies && accessModes.some(
      accessMode => accessMode.company === queryCompanies.toUpperCase())
    ) {
      // a match has been found for an access mode that exclusively belongs to
      // a particular company
      return null
    }

    // hack for TriMet-MOD project, don't show companies if Biketown enabled
    // when using just bike rentals
    if (mode && mode.indexOf('BICYCLE_RENT') > -1) {
      return null
    }

    // check if renting or hailing
    if (hasRental(mode) || hasHail(mode)) {
      const queryModes = mode.split(',')
      const activeCompanies = configCompanies
        .filter(company =>
          company.modes
            .split(',')
            .some(companyMode => queryModes.indexOf(companyMode) > -1)
        )

      return (
        <div style={{ marginBottom: 16 }}>
          <div className='setting-label'>Use Companies</div>
          <div style={{ textAlign: 'left' }}>
            {activeCompanies.length === 0 &&
              <p>No comapnies available for this mode!</p>
            }
            {activeCompanies.map((company) => {
              let classNames = ['select-button']
              if (this._companyIsActive(company)) classNames.push('active')
              return <Button key={company.id}
                className={classNames.join(' ')}
                style={{ marginTop: 3, marginBottom: 3, marginLeft: 0, marginRight: 5 }}
                onClick={() => this._toggleCompany(company.id)}
              >
                <div
                  className='mode-icon'
                  style={{
                    display: 'inline-block',
                    fill: '#000',
                    width: 16,
                    height: 16,
                    marginRight: 5,
                    verticalAlign: 'middle'
                  }}
                >
                  {getIcon(company.id, icons)}
                </div>
                {company.label}
              </Button>
            })}
          </div>
          <div style={{ clear: 'both' }} />
        </div>
      )
    }
  }

  _renderExclusiveAccessSelectors = () => {
    const {config, mode, icons} = this.props
    const {exclusiveModes} = config.modes
    const modeHasTransit = hasTransit(mode)

    if (!exclusiveModes) return null

    // create an array of children to display within a mode-group-row
    // at most 2 exclusive modes will be displayed side-by-side
    const children = []
    const spacer = (
      <Col xs={2} style={{ height: 44 }}>&nbsp;</Col>
    )

    exclusiveModes.forEach((exclusiveMode, idx) => {
      // add left padding for every evenly indexed exclusiveMode
      if (idx % 2 === 0) {
        children.push(spacer)
      }

      switch (exclusiveMode) {
        case 'WALK':
          children.push(
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
          )
          break
        case 'BICYCLE':
          children.push(
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
          )
          break
        case 'MICROMOBILITY':
          children.push(
            <Col xs={4}>
              <ModeButton
                enabled
                active={!modeHasTransit && hasMicromobility(mode)}
                icons={icons}
                mode={'MICROMOBILITY'}
                height={36}
                label={'eScooter Only'}
                inlineLabel
                onClick={this._setMicromobilityOnly}
              />
            </Col>
          )
          break
        default:
          throw new Error(`Unsupported exclusive mode: ${exclusiveMode}`)
      }

      // add right padding for every odd indexed exclusiveMode
      if (idx % 2 !== 0) {
        children.push(spacer)
      }
    })

    return (
      <Row className='mode-group-row'>
        {children}
      </Row>
    )
  }

  render () {
    const { config, mode, icons, queryModes } = this.props

    const modeHasTransit = hasTransit(mode)

    const { transitModes, accessModes, bicycleModes, micromobilityModes } = config.modes

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

          {this._renderExclusiveAccessSelectors()}

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

            {/* The bike trip type selector */}
            {hasBike(mode) && !hasTransit(mode) && (
              <div style={{ marginBottom: 16 }}>
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
                          {getIcon(option.mode, icons)}
                        </div>
                        <span style={{ verticalAlign: 'middle' }}>{option.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* The micromobility trip type selector */}
            {hasMicromobility(mode) && !hasTransit(mode) && (
              <div style={{ marginBottom: 16 }}>
                <div className='setting-label' style={{ float: 'left' }}>Use</div>
                <div style={{ textAlign: 'right' }}>
                  {micromobilityModes.map((option, k) => {
                    let action = this._setOwnMicromobility
                    if (option.mode === 'MICROMOBILITY_RENT') action = this._setRentedMicromobility
                    let classNames = ['select-button']
                    if (queryModes.includes(option.mode)) classNames.push('active')
                    // TODO: Handle different bikeshare networks
                    return (
                      <Button key={k}
                        className={classNames.join(' ')}
                        onClick={action}
                      >
                        <div style={{ display: 'inline-block', width: option.iconWidth, height: 18, fill: '#000', verticalAlign: 'middle', marginRight: 10 }}>
                          {getIcon(option.mode, icons)}
                        </div>
                        <span style={{ verticalAlign: 'middle' }}>{option.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}

            {this._renderCompanies()}

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
                      style={{
                        display: 'inline-block',
                        fill: '#000',
                        width: 16,
                        height: 16,
                        marginRight: 5,
                        verticalAlign: 'middle'
                      }}
                    >
                      {getIcon(mode.mode, icons)}
                    </div>
                    {mode.label}
                  </Button>
                })}
              </div>
              <div style={{ clear: 'both' }} />
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
    config: state.otp.config,
    mode,
    companies,
    modeGroups: state.otp.config.modeGroups,
    queryModes: !mode || mode.length === 0 ? [] : mode.split(','),
    routingType
  }
}

const mapDispatchToProps = { setQueryParam }

export default connect(mapStateToProps, mapDispatchToProps)(SettingsSelectorPanel)
