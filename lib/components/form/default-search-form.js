import TriMetModeIcon from '@opentripplanner/icons/lib/trimet-mode-icon'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import LocationField from './connected-location-field'
import TabbedFormPanel from './tabbed-form-panel'
import SwitchButton from './switch-button'

// Use the icons props to override icons for certain modes in the mode selector panel.
// If no icon is provided for a specific mode, the default OTP-ui icon will be used. 
const customIcons = {
  TRANSIT: <TriMetModeIcon label='rail' />
}

export default class DefaultSearchForm extends Component {
  static propTypes = {
    icons: PropTypes.object,
    mobile: PropTypes.bool
  }

  static defaultProps = {
    icons: customIcons,
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
    const actionText = mobile ? 'tap' : 'click'

    return (
      <div>
        <div className='locations'>
          <LocationField
            inputPlaceholder={`Enter start location or ${actionText} on map...`}
            locationType='from'
            showClearButton
          />

          <LocationField
            inputPlaceholder={`Enter destination or ${actionText} on map...`}
            locationType='to'
            showClearButton={!mobile}
          />

          <div className='switch-button-container'>
            <SwitchButton content={<i className='fa fa-exchange fa-rotate-90' />} />
          </div>
        </div>

        <TabbedFormPanel icons={icons} />
      </div>
    )
  }
}
