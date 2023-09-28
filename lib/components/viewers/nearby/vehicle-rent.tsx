import { Bicycle } from '@styled-icons/fa-solid/Bicycle'
import { Company } from '@opentripplanner/types'
import { connect } from 'react-redux'
import { IntlShape, useIntl } from 'react-intl'
import { useMap } from 'react-map-gl'
// @ts-expect-error icons doesn't have typescript?
import { Micromobility } from '@opentripplanner/icons'
import React from 'react'

import * as mapActions from '../../../actions/map'

import { Card, CardBody, CardHeader } from './styled'
import { IconWithText } from '../../util/styledIcon'

type VehicleFormFactor =
  | 'BICYCLE'
  | 'CARGO_BICYCLE'
  | 'MOPED'
  | 'SCOOTER'
  | 'SCOOTER_STANDING'
  | 'SCOOTER_SEATED'
  | 'OTHER'

const getVehicleIcon = (vehicleType: VehicleFormFactor) => {
  switch (vehicleType) {
    case 'BICYCLE':
    case 'CARGO_BICYCLE':
      return Bicycle
    case 'SCOOTER':
    case 'SCOOTER_SEATED':
    case 'SCOOTER_STANDING':
      return Micromobility
    default:
      return Bicycle
  }
}

const getVehicleText = (
  vehicleType: VehicleFormFactor,
  company: string,
  intl: IntlShape
) => {
  switch (vehicleType) {
    case 'BICYCLE':
    case 'CARGO_BICYCLE':
      return intl.formatMessage(
        {
          id: 'components.NearbyView.companyBicycle'
        },
        {
          company
        }
      )
    case 'SCOOTER':
    case 'SCOOTER_SEATED':
    case 'SCOOTER_STANDING':
    default:
      return intl.formatMessage(
        {
          id: 'components.NearbyView.companyScooter'
        },
        {
          company
        }
      )
  }
}

const Vehicle = ({
  companies,
  vehicle,
  zoomToPlace
}: {
  companies: Company[]
  vehicle: any
  zoomToPlace: (map: any, stopData: any) => void
}): JSX.Element => {
  const intl = useIntl()
  const map = useMap().default
  const company = companies.find((c) => c.id === vehicle.network)?.label ?? ''
  const { formFactor } = vehicle.vehicleType
  return (
    <Card onMouseEnter={() => zoomToPlace(map, vehicle)}>
      <CardHeader>
        <IconWithText Icon={getVehicleIcon(formFactor)}>
          {getVehicleText(formFactor, company, intl)}
        </IconWithText>
      </CardHeader>
      <CardBody>{vehicle.name}</CardBody>
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

export default connect(mapStateToProps, mapDispatchToProps)(Vehicle)
