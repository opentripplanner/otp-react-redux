import { getCompanyIcon } from '@opentripplanner/icons/lib/companies'
import { useIntl } from 'react-intl'
import styled from 'styled-components'

import Icon from '../util/icon'
import { getErrorMessage } from '../../util/state'

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

export default function NarrativeItinerariesErrors ({ errors }) {
  const intl = useIntl()
  return errors.map((error, idx) => {
    let icon = <Icon className='text-warning' type='exclamation-triangle' />
    if (error.network) {
      const CompanyIcon = getCompanyIcon(error.network)
      // check if company icon exists to avoid rendering undefined
      if (CompanyIcon) {
        icon = <CompanyIcon />
      }
    }
    return (
      <IssueContainer key={idx}>
        <IssueIconContainer>
          {icon}
        </IssueIconContainer>
        <IssueContents>
          {getErrorMessage(error, intl)}
        </IssueContents>
      </IssueContainer>
    )
  })
}
