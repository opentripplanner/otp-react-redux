import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { injectIntl } from 'react-intl'

import LocationField from './connected-location-field'
import TabbedFormPanel from './tabbed-form-panel'
import SwitchButton from './switch-button'

export class DefaultSearchForm extends Component {
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
    const { intl, mobile } = this.props

    return (
      <div>
        <div className='locations' style={{marginTop: '5px'}}>
          <LocationField
            inputPlaceholder={
              intl.formatMessage(
                { id: 'common.searchForms.enterStartLocation' },
                { mobile }
              )
            }
            locationType='from'
            showClearButton
          />

          <LocationField
            inputPlaceholder={
              intl.formatMessage(
                { id: 'common.searchForms.enterDestination' },
                { mobile }
              )
            }
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

export default injectIntl(DefaultSearchForm)
