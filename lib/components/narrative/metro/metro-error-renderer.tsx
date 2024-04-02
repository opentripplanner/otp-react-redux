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
  grid-template-columns: 1fr 3fr;
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
  exclusiveErrors,
  mutedErrors
}: {
  errors: Error
  exclusiveErrors?: string[]
  mutedErrors?: string[]
}): JSX.Element => {
  const intl = useIntl()

  return (
    <List>
      {Object.keys(errors)
        .filter((error: string) => {
          // The search window is hardcoded in otp-rr and can't be changed by the user.
          // Do not tell them what's happening as they can't act on the issue.
          if (error === 'NO_TRANSIT_CONNECTION_IN_SEARCH_WINDOW') {
            return false
          }

          // Don't show errors that have been muted in the config
          if (mutedErrors?.includes(error)) return false

          return true
        })
        .filter((err: string, _: any, array: string[]) => {
          if (array.length > 1 && exclusiveErrors?.includes(err)) return false

          return true
        })
        .map((error: string) => {
          const localizedInputFieldList = Array.from(errors[error])?.map(
            (inputField) =>
              intl.formatMessage({
                id: `components.OTP2ErrorRenderer.inputFields.${inputField}`
              })
          )

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
  return {
    exclusiveErrors: itinerary?.exclusiveErrors || ['NO_TRANSIT_CONNECTION'],
    mutedErrors: itinerary?.mutedErrors
  }
}
export default connect(mapStateToProps)(ErrorRenderer)

export type { Error }
