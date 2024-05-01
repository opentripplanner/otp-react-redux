import { Bicycle } from '@styled-icons/fa-solid/Bicycle'
import { Company } from '@opentripplanner/types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
// @ts-expect-error icons doesn't have typescript?
import { getCompanyIcon } from '@opentripplanner/icons/lib/companies'
import { Parking } from '@styled-icons/fa-solid/Parking'
import React, { Suspense } from 'react'

import { AppReduxState } from '../../../util/state-types'
import { IconWithText } from '../../util/styledIcon'

import { Card, CardBody, CardHeader, CardSubheader, CardTitle } from './styled'
import DistanceDisplay from './distance-display'

type Props = {
  companies?: Company[]
  fromToSlot: JSX.Element
  place: any
}
const RentalStation = ({ companies, fromToSlot, place }: Props) => {
  const { networks } = place
  const network = networks.length === 1 ? networks[0] : null
  const company = companies?.find((c) => c.id === network)?.label
  const { bikesAvailable, spacesAvailable } = place

  const StationIcon = () => {
    const CompanyIcon = getCompanyIcon(network)
    return CompanyIcon ? (
      <Suspense fallback={<span>{company}</span>}>
        <CompanyIcon height={22} style={{ marginRight: '5px' }} width={22} />
      </Suspense>
    ) : (
      <Bicycle />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <IconWithText Icon={StationIcon}>{place.name}</IconWithText>
        </CardTitle>
        <CardSubheader>
          {company || (
            <FormattedMessage id="components.NearbyView.bikeRentalStation" />
          )}
        </CardSubheader>
        <DistanceDisplay distance={place.distance} />
      </CardHeader>
      <CardBody>
        <div>
          <IconWithText Icon={Bicycle}>
            <FormattedMessage
              id="components.NearbyView.bikesAvailable"
              values={{ bikesAvailable }}
            />
          </IconWithText>
        </div>
        <div>
          <IconWithText Icon={Parking}>
            <FormattedMessage
              id="components.NearbyView.spacesAvailable"
              values={{ spacesAvailable }}
            />
          </IconWithText>
        </div>
        {fromToSlot}
      </CardBody>
    </Card>
  )
}

const mapStateToProps = (state: AppReduxState) => {
  const { config } = state.otp
  return {
    companies: config.companies
  }
}

export default connect(mapStateToProps)(RentalStation)
