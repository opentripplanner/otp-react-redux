/* eslint-disable react/prop-types */
import { ExchangeAlt } from '@styled-icons/fa-solid/ExchangeAlt'
import { injectIntl } from 'react-intl'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import { StyledIconWrapper } from '../util/styledIcon'

import LocationField from './connected-location-field'
import SwitchButton from './switch-button'
import TabbedFormPanel from './tabbed-form-panel'

export class DefaultSearchForm extends Component {
  static propTypes = {
    mobile: PropTypes.bool
  }

  static defaultProps = {
    showFrom: true,
    showTo: true
  }

  constructor() {
    super()
    this.state = {
      desktopDateTimeExpanded: false,
      desktopSettingsExpanded: false
    }
  }

  render() {
    const { intl, mobile } = this.props

    return (
      <div>
        <div className="locations" style={{ marginTop: '5px' }}>
          <LocationField
            inputPlaceholder={intl.formatMessage(
              { id: 'common.searchForms.enterStartLocation' },
              { mobile }
            )}
            locationType="from"
            showClearButton
          />

          <LocationField
            inputPlaceholder={intl.formatMessage(
              { id: 'common.searchForms.enterDestination' },
              { mobile }
            )}
            locationType="to"
            showClearButton={!mobile}
          />

          <div className="switch-button-container">
            <SwitchButton
              content={
                <StyledIconWrapper rotate90>
                  <ExchangeAlt />
                </StyledIconWrapper>
              }
            />
          </div>
        </div>

        <TabbedFormPanel />
      </div>
    )
  }
}

export default injectIntl(DefaultSearchForm)
