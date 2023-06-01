import { Checkbox, ControlLabel, FormGroup } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import { Times } from '@styled-icons/fa-solid'
import React from 'react'
import styled from 'styled-components'

import { getErrorStates } from '../../util/ui'
import { LinkOpensNewWindow } from '../util/externalLink'
import { StyledIconWrapper } from '../util/styledIcon'
import {
  TERMS_OF_SERVICE_PATH,
  TERMS_OF_STORAGE_PATH
} from '../../util/constants'

import { FormikUserProps } from './types'

const FlexBox = styled.span`
  display: flex;
  gap: 8px;
`

interface Props extends FormikUserProps {
  disableCheckTerms: boolean
}

/**
 * User terms of use pane.
 */
const TermsOfUsePane = (props: Props) => {
  const {
    disableCheckTerms,
    handleBlur,
    handleChange,
    values: userData
  } = props
  const intl = useIntl()
  const { hasConsentedToTerms, storeTripHistory } = userData
  const errorStates = getErrorStates(props)

  return (
    <div>
      <FormGroup validationState={errorStates.hasConsentedToTerms}>
        <ControlLabel>
          <FormattedMessage id="components.TermsOfUsePane.mustAgreeToTerms" />
        </ControlLabel>
        <Checkbox
          aria-invalid={!userData.hasConsentedToTerms}
          aria-required
          checked={hasConsentedToTerms}
          disabled={disableCheckTerms}
          name="hasConsentedToTerms"
          onBlur={disableCheckTerms ? undefined : handleBlur}
          onChange={disableCheckTerms ? undefined : handleChange}
        >
          <FlexBox>
            {errorStates.hasConsentedToTerms && (
              <StyledIconWrapper>
                <Times />
              </StyledIconWrapper>
            )}
            <span>
              <FormattedMessage
                id="components.TermsOfUsePane.termsOfServiceStatement"
                values={{
                  termsOfUseLink: (contents: JSX.Element) => (
                    <LinkOpensNewWindow
                      contents={contents}
                      inline
                      url={`/#${TERMS_OF_SERVICE_PATH}`}
                    />
                  )
                }}
              />
            </span>
          </FlexBox>
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
    </div>
  )
}
const mapStateToProps = (state: any) => {
  return {
    termsOfStorageSet: state.otp.config.persistence?.terms_of_storage
  }
}
export default connect(mapStateToProps)(TermsOfUsePane)
