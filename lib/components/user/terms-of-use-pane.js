import React from 'react'
import { connect } from 'react-redux'
import { Checkbox, ControlLabel, FormGroup } from 'react-bootstrap'
import { FormattedMessage, useIntl } from 'react-intl'

import { TERMS_OF_SERVICE_PATH, TERMS_OF_STORAGE_PATH } from '../../util/constants'

/**
 * User terms of use pane.
 */
const TermsOfUsePane = ({
  disableCheckTerms,
  handleBlur,
  handleChange,
  termsOfStorageSet,
  values: userData
}) => {
  const intl = useIntl()
  const {
    hasConsentedToTerms,
    storeTripHistory
  } = userData

  return (
    <div>
      <ControlLabel>
        <FormattedMessage id='components.TermsOfUsePane.mustAgreeToTerms' />
      </ControlLabel>
      <FormGroup>
        <Checkbox
          checked={hasConsentedToTerms}
          disabled={disableCheckTerms}
          name='hasConsentedToTerms'
          onBlur={disableCheckTerms ? null : handleBlur}
          onChange={disableCheckTerms ? null : handleChange}
        >
          <FormattedMessage
            id='components.TermsOfUsePane.termsOfServiceStatement'
            values={{
              termsOfUseLink: contents => (
                <a href={`/#${TERMS_OF_SERVICE_PATH}`} target='_blank'>{contents}</a>
              )
            }}
          />
        </Checkbox>
      </FormGroup>
      <FormGroup>
        <Checkbox
          checked={storeTripHistory}
          name='storeTripHistory'
          onBlur={handleBlur}
          onChange={(e) => {
            // Show alert when user is unchecking the checkbox
            if (storeTripHistory) {
              // Do nothing if the user hits cancel
              if (!confirm(intl.formatMessage({id: 'components.TermsOfUsePane.confirmDeletionPrompt'}))) {
                return
              }
            }

            handleChange(e)
          }}
        >
          <FormattedMessage
            id='components.TermsOfUsePane.termsOfStorageStatement'
            values={{
              termsOfStorageLink: contents => (
                <a href={`/#${TERMS_OF_STORAGE_PATH}`} target='_blank'>{contents}</a>
              )
            }}
          />
        </Checkbox>
      </FormGroup>
    </div>
  )
}
const mapStateToProps = (state) => {
  return {
    termsOfStorageSet: state.otp.config.persistence?.terms_of_storage
  }
}
export default connect(mapStateToProps)(TermsOfUsePane)
