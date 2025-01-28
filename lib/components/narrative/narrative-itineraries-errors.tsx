import { ExclamationTriangle } from '@styled-icons/fa-solid/ExclamationTriangle'
import { useIntl } from 'react-intl'
import React from 'react'
import styled from 'styled-components'

import { getErrorMessage } from '../../util/state'
import { StyledIconWrapper } from '../util/styledIcon'
import CompanyIcon from '../util/company-icon'

const IssueContainer = styled.div`
  border-top: 1px solid grey;
  display: flex;
  padding: 10px;
`

const IssueIconContainer = styled.div`
  font-size: 18px;
  height: 24px;
  width: 24px;
`

const IssueContents = styled.div`
  font-size: 14px;
  margin-left: 10px;
  text-align: left;
`

export default function NarrativeItinerariesErrors({
  errors
}: {
  // FIXME: what are these types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errorMessages: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any
}): JSX.Element {
  const intl = useIntl()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return errors.map((error: { network: any }, idx: number) => (
    <IssueContainer key={idx}>
      <IssueIconContainer>
        <CompanyIcon
          company={error.network}
          fallbackContent={
            <StyledIconWrapper className="text-warning">
              <ExclamationTriangle />
            </StyledIconWrapper>
          }
        />
      </IssueIconContainer>
      <IssueContents>{getErrorMessage(error, intl)}</IssueContents>
    </IssueContainer>
  ))
}
