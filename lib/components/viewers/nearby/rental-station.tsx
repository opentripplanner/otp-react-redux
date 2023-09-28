import { Bicycle, Parking } from '@styled-icons/fa-solid'
import { Company, Place } from '@opentripplanner/types'
import { connect } from 'react-redux'
import React from 'react'

import * as mapActions from '../../../actions/map'
import { FormattedMessage } from 'react-intl'
import { IconWithText } from '../../util/styledIcon'

import { Card, CardBody, CardHeader, CardSubheader } from './styled'

import { useMap } from 'react-map-gl'

type Props = {
  companies: Company[]
  place: any
  zoomToPlace: (map: any, stopData: any) => void
}
const RentalStation = ({ companies, place, zoomToPlace }: Props) => {
  const map = useMap().default
  const { networks } = place
  const network = networks.length === 1 ? networks[0] : null
  const company = companies.find((c) => c.id === network)?.label
  const { bikesAvailable, spacesAvailable } = place
  return (
    <Card onMouseEnter={() => zoomToPlace(map, place)}>
      <CardHeader>
        {place.name}
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
      </CardBody>
    </Card>
  )
}

const mapDispatchToProps = {
  zoomToPlace: mapActions.zoomToPlace
}

const mapStateToProps = (state: any) => {
  const { config } = state.otp
  return {
    companies: config.companies
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RentalStation)
