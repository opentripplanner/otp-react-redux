import { Bicycle } from '@styled-icons/fa-solid/Bicycle'
import { Company } from '@opentripplanner/types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
// @ts-expect-error icons doesn't have typescript?
import { getCompanyIcon } from '@opentripplanner/icons/lib/companies'
import { Parking } from '@styled-icons/fa-solid/Parking'
import { useMap } from 'react-map-gl'
import FromToLocationPicker from '@opentripplanner/from-to-location-picker'
import React, { Suspense } from 'react'

import * as mapActions from '../../../actions/map'
import { IconWithText } from '../../util/styledIcon'

import { Card, CardBody, CardHeader, CardSubheader, CardTitle } from './styled'

type Props = {
  companies: Company[]
  place: any
  setLocation: (args: any) => void
  zoomToPlace: (map: any, stopData: any) => void
}
const RentalStation = ({
  companies,
  place,
  setLocation,
  zoomToPlace
}: Props) => {
  const map = useMap().default
  const { networks } = place
  const network = networks.length === 1 ? networks[0] : null
  const company = companies.find((c) => c.id === network)?.label
  const { bikesAvailable, spacesAvailable } = place
  const setLocationFromPlace = (locationType: 'from' | 'to') => {
    const location = {
      ...place
    }
    setLocation({ location, locationType, reverseGeocode: false })
  }

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
    <Card onMouseEnter={() => zoomToPlace(map, place)}>
      <CardHeader>
        <CardTitle>
          <IconWithText Icon={StationIcon}>{place.name}</IconWithText>
        </CardTitle>
        <CardSubheader>
          {company || (
            <FormattedMessage id="components.NearbyView.bikeRentalStation" />
          )}
        </CardSubheader>
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
        <div role="group">
          <FromToLocationPicker
            label
            onFromClick={() => setLocationFromPlace('from')}
            onToClick={() => setLocationFromPlace('to')}
          />
        </div>
      </CardBody>
    </Card>
  )
}

const mapDispatchToProps = {
  setLocation: mapActions.setLocation,
  zoomToPlace: mapActions.zoomToPlace
}

const mapStateToProps = (state: any) => {
  const { config } = state.otp
  return {
    companies: config.companies
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RentalStation)
