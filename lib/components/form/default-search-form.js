import React, { Component } from 'react'
import PropTypes from 'prop-types'

import LocationField from './connected-location-field'
import SwitchButton from './switch-button'
import TabbedFormPanel from './tabbed-form-panel'
import defaultIcons from '../icons'

export default class DefaultSearchForm extends Component {
  static propTypes = {
    icons: PropTypes.object,
    mobile: PropTypes.bool
  }

  static defaultProps = {
    icons: defaultIcons,
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
