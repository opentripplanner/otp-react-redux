import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { VelocityTransitionGroup } from 'velocity-react'

import DateTimeModal from './date-time-modal'
import LocationField from './location-field'
import DateTimePreview from './date-time-preview'
import SettingsPreview from './settings-preview'
import SettingsSelectorPanel from './settings-selector-panel'
import SwitchButton from './switch-button'

export default class DefaultSearchForm extends Component {
  static propTypes = {
    icons: PropTypes.object,
    mobile: PropTypes.bool
  }

  static defaultProps = {
    showFrom: true,
    showTo: true
  }

  constructor () {
    super()
    this.state = {
      desktopDateTimeExpanded: false,
      desktopSettingsExpanded: false
    }
  }

  render () {
    const { icons, mobile } = this.props
    const actionText = mobile ? 'long press' : 'right-click'

    return (
      <div>
        <div className='locations'>
          <LocationField
            type='from'
            label={`Enter start location or ${actionText} on map...`}
            showClearButton
          />

          <LocationField
            type='to'
            label={`Enter destination or ${actionText} on map...`}
            showClearButton={!mobile}
          />

          <div className='switch-button-container'>
            <SwitchButton content={<i className='fa fa-exchange fa-rotate-90' />} />
          </div>
        </div>

        <div>
          <DateTimePreview caret={this.state.desktopDateTimeExpanded ? 'up' : 'down'}
            onClick={() => { this.setState({ desktopDateTimeExpanded: !this.state.desktopDateTimeExpanded }) }}
          />
          <VelocityTransitionGroup enter={{animation: 'slideDown'}} leave={{animation: 'slideUp'}}>
            {this.state.desktopDateTimeExpanded ? <DateTimeModal /> : null}
          </VelocityTransitionGroup>
        </div>

        <div>
          <SettingsPreview icons={icons} caret={this.state.desktopSettingsExpanded ? 'up' : 'down'}
            onClick={() => { this.setState({ desktopSettingsExpanded: !this.state.desktopSettingsExpanded }) }}
          />
          <VelocityTransitionGroup enter={{animation: 'slideDown'}} leave={{animation: 'slideUp'}}>
            {this.state.desktopSettingsExpanded ? <SettingsSelectorPanel icons={icons} /> : null}
          </VelocityTransitionGroup>
        </div>
      </div>
    )
  }
}
