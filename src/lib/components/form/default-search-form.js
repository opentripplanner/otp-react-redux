import PropTypes from 'prop-types'
import React, { Component } from 'react'

import LocationField from './connected-location-field'
import TabbedFormPanel from './tabbed-form-panel'
import SwitchButton from './switch-button'

export default class DefaultSearchForm extends Component {
  static propTypes = {
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
    const { mobile } = this.props
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

        <TabbedFormPanel />
      </div>
    )
  }
}
