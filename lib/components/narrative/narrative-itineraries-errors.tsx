import { ExclamationTriangle } from '@styled-icons/fa-solid/ExclamationTriangle'
// @ts-expect-error No typescript
import { getCompanyIcon } from '@opentripplanner/icons/lib/companies'
import { useIntl } from 'react-intl'
import React, { Suspense } from 'react'
import styled from 'styled-components'

import { getErrorMessage } from '../../util/state'
import { StyledIconWrapper } from '../util/styledIcon'

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
  return errors.map((error: { network: any }, idx: number) => {
    let icon = (
      <StyledIconWrapper className="text-warning">
        <ExclamationTriangle />
      </StyledIconWrapper>
    )
    if (error.network) {
      const CompanyIcon = getCompanyIcon(error.network)
      // check if company icon exists to avoid rendering undefined
      if (CompanyIcon) {
        icon = (
          <Suspense fallback={<span>Loading...</span>}>
            <CompanyIcon />
          </Suspense>
        )
      }
    }
    return (
      <IssueContainer key={idx}>
        <IssueIconContainer>{icon}</IssueIconContainer>
        <IssueContents>{getErrorMessage(error, intl)}</IssueContents>
      </IssueContainer>
    )
  })
}
