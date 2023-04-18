import { Checkbox, ControlLabel, FormGroup } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import React from 'react'

import { LinkOpensNewWindow } from '../util/externalLink'
import {
  TERMS_OF_SERVICE_PATH,
  TERMS_OF_STORAGE_PATH
} from '../../util/constants'

/**
 * User terms of use pane.
 */
/* eslint-disable react/prop-types */
/* TODO: Prop Types */
const TermsOfUsePane = ({
  disableCheckTerms,
  handleBlur,
  handleChange,
  values: userData
}) => {
  const intl = useIntl()
  const { hasConsentedToTerms, storeTripHistory } = userData

  return (
    <div>
      <ControlLabel>
        <FormattedMessage id="components.TermsOfUsePane.mustAgreeToTerms" />
      </ControlLabel>
      <FormGroup>
        <Checkbox
          checked={hasConsentedToTerms}
          disabled={disableCheckTerms}
          name="hasConsentedToTerms"
          onBlur={disableCheckTerms ? null : handleBlur}
          onChange={disableCheckTerms ? null : handleChange}
        >
          <FormattedMessage
            id="components.TermsOfUsePane.termsOfServiceStatement"
            values={{
              termsOfUseLink: (contents) => (
                <LinkOpensNewWindow
                  contents={contents}
                  isInline
                  url={`/#${TERMS_OF_SERVICE_PATH}`}
                />
              )
            }}
          />
        </Checkbox>
      </FormGroup>
      <FormGroup>
        <Checkbox
          checked={storeTripHistory}
          name="storeTripHistory"
          onBlur={handleBlur}
          onChange={(e) => {
            // Show alert when user is unchecking the checkbox
            if (storeTripHistory) {
              // Do nothing if the user hits cancel
              if (
                // eslint-disable-next-line no-restricted-globals
                !confirm(
                  intl.formatMessage({
                    id: 'components.TermsOfUsePane.confirmDeletionPrompt'
                  })
                )
              ) {
                return
              }
            }

            handleChange(e)
          }}
        >
          <FormattedMessage
            id="components.TermsOfUsePane.termsOfStorageStatement"
            values={{
              termsOfStorageLink: (contents) => (
                <LinkOpensNewWindow
                  contents={contents}
                  isInline
                  url={`/#${TERMS_OF_STORAGE_PATH}`}
                />
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
