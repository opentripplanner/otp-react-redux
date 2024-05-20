import { Checkbox, ControlLabel, FormGroup } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import { FormikProps } from 'formik'
import React, { useEffect } from 'react'

import { AppReduxState } from '../../util/state-types'
import { CheckboxDefaultState } from '../../util/config-types'
import { LinkOpensNewWindow } from '../util/externalLink'
import {
  TERMS_OF_SERVICE_PATH,
  TERMS_OF_STORAGE_PATH
} from '../../util/constants'

import { EditedUser } from './types'

interface Props extends FormikProps<EditedUser> {
  disableCheckTerms: boolean
  locale: string
  termsOfServiceLink?: string
  termsOfStorageDefault?: CheckboxDefaultState
}

/**
 * User terms of use pane.
 */
const TermsOfUsePane = ({
  disableCheckTerms,
  handleBlur,
  handleChange,
  locale,
  setFieldValue,
  termsOfServiceLink,
  termsOfStorageDefault = CheckboxDefaultState.VISIBLE_UNCHECKED,
  values: userData
}: Props) => {
  const intl = useIntl()
  const { hasConsentedToTerms, id, storeTripHistory } = userData

  const TOSLinkWithI18n = termsOfServiceLink?.replace('{locale}', locale)

  const termsURL = TOSLinkWithI18n || `/#${TERMS_OF_SERVICE_PATH}`

  const showStorageTerms = termsOfStorageDefault.startsWith('visible-')

  useEffect(() => {
    // When creating a new account, pre-check the storage field per defaults.
    if (
      !id &&
      (termsOfStorageDefault === CheckboxDefaultState.HIDDEN_CHECKED ||
        termsOfStorageDefault === CheckboxDefaultState.VISIBLE_CHECKED)
    ) {
      setFieldValue('storeTripHistory', true)
    }
  }, [id, setFieldValue, termsOfStorageDefault])

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
          onBlur={disableCheckTerms ? undefined : handleBlur}
          onChange={disableCheckTerms ? undefined : handleChange}
        >
          <FormattedMessage
            id="components.TermsOfUsePane.termsOfServiceStatement"
            values={{
              termsOfUseLink: (contents: JSX.Element) => (
                <LinkOpensNewWindow contents={contents} inline url={termsURL} />
              )
            }}
          />
        </Checkbox>
      </FormGroup>
      {showStorageTerms ? (
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
                termsOfStorageLink: (contents: JSX.Element) => (
                  <LinkOpensNewWindow
                    contents={contents}
                    inline
                    url={`/#${TERMS_OF_STORAGE_PATH}`}
                  />
                )
              }}
            />
          </Checkbox>
        </FormGroup>
      ) : null}
    </div>
  )
}
const mapStateToProps = (state: AppReduxState) => {
  return {
    locale: state.otp.ui?.locale,
    termsOfServiceLink: state.otp.config.termsOfServiceLink,
    termsOfStorageDefault: state.otp.config.persistence?.termsOfStorageDefault
  }
}

export default connect(mapStateToProps)(TermsOfUsePane)
