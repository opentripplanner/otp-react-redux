import { connect } from 'react-redux'
import { ExclamationCircle } from '@styled-icons/fa-solid/ExclamationCircle'
import { FormattedMessage, useIntl } from 'react-intl'
import React from 'react'
import styled from 'styled-components'

import { AppReduxState } from '../../../util/state-types'
import { Icon } from '../../util/styledIcon'
import { LinkOpensNewWindow } from '../../util/externalLink'

type Error = Record<string, string[]>

const List = styled.ul`
  margin: 0;
  padding: 0;
`
const Container = styled.li`
  background: rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: 1fr 4fr;
  grid-template-rows: 1fr max-content;
  list-style-type: none;
  margin: 0;
  padding: 0 1em;

  h3 {
    grid-column: 2;
    grid-row: 1;
  }

  span {
    grid-column: 1;
    grid-row: 1 / -1;
    place-self: center;
  }

  p {
    grid-column: 2;
    grid-row: 2;
    padding-bottom: 10px;
  }
`

const ErrorRenderer = ({
  errors,
  itinerariesLength,
  mutedErrors
}: {
  errors: Error
  itinerariesLength: number
  mutedErrors?: string[]
}): JSX.Element => {
  const intl = useIntl()

  // The search window is hardcoded in otp-rr and can't be changed by the user.
  // Do not tell them what's happening as they can't act on the issue.
  const ignoredErrors = ['NO_TRANSIT_CONNECTION_IN_SEARCH_WINDOW']
  mutedErrors && ignoredErrors.push(...mutedErrors)

  const errorList = Object.keys(errors).filter((err) => {
    return !ignoredErrors.includes(err)
  })
  // If there are no itineraries and no displayed errors, generate a default error
  // so we're not left with an empty results container.
  if (errorList.length === 0 && itinerariesLength === 0) {
    errorList.push('DEFAULT_ERROR_MESSAGE')
  }
  return (
    <List>
      {errorList.map((error: string) => {
        const localizedInputFieldList = errors[error]
          ? Array.from(errors[error]).map((inputField) =>
              intl.formatMessage({
                id: `components.OTP2ErrorRenderer.inputFields.${inputField}`
              })
            )
          : []

        return (
          <Container key={error}>
            <Icon Icon={ExclamationCircle} size="3x" />
            <h3>
              <FormattedMessage
                id={`components.OTP2ErrorRenderer.${error}.header`}
              />
            </h3>
            <p>
              <FormattedMessage
                id={`components.OTP2ErrorRenderer.${error}.body`}
                values={{
                  inputFields: intl.formatList(localizedInputFieldList),
                  inputFieldsCount: localizedInputFieldList.length,
                  link: (contents: JSX.Element) => (
                    <LinkOpensNewWindow
                      contents={contents}
                      inline
                      style={{ color: 'inherit' }}
                      url={intl.formatMessage({
                        id: `components.OTP2ErrorRenderer.${error}.link`
                      })}
                    />
                  )
                }}
              />
            </p>
          </Container>
        )
      })}
    </List>
  )
}

const mapStateToProps = (state: AppReduxState) => {
  const { itinerary } = state.otp.config
  return { mutedErrors: itinerary?.mutedErrors }
}
export default connect(mapStateToProps)(ErrorRenderer)

export type { Error }
