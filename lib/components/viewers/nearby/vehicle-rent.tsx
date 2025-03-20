import { Bicycle } from '@styled-icons/fa-solid/Bicycle'
import { Company } from '@opentripplanner/types'
import { connect } from 'react-redux'
import { IntlShape, useIntl } from 'react-intl'
// @ts-expect-error icons doesn't have typescript?
import { Micromobility } from '@opentripplanner/icons'
import React, { ReactElement } from 'react'

import { AppReduxState } from '../../../util/state-types'
import { IconWithText } from '../../util/styledIcon'
import CompanyIcon from '../../util/company-icon'

import { Card, CardBody, CardHeader, CardTitle } from './styled'
import DistanceDisplay from './distance-display'

type VehicleFormFactor =
  | 'BICYCLE'
  | 'CARGO_BICYCLE'
  | 'MOPED'
  | 'SCOOTER'
  | 'SCOOTER_STANDING'
  | 'SCOOTER_SEATED'
  | 'OTHER'

export const getVehicleIcon = (
  vehicleType: VehicleFormFactor
): ReactElement => {
  switch (vehicleType) {
    case 'SCOOTER':
    case 'SCOOTER_SEATED':
    case 'SCOOTER_STANDING':
      return <Micromobility />
    default:
      return <Bicycle />
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
  fromToSlot,
  vehicle
}: {
  companies?: Company[]
  fromToSlot: JSX.Element
  vehicle: {
    distance: number
    name: string
    network: string
    vehicleType: {
      formFactor: VehicleFormFactor
    }
  }
}): JSX.Element => {
  const intl = useIntl()
  const companyLabel =
    companies?.find((c) => c.id === vehicle.network)?.label ?? ''
  const { formFactor } = vehicle.vehicleType
  const name =
    vehicle.name === 'Default vehicle type'
      ? getVehicleText(formFactor, companyLabel, intl)
      : vehicle.name
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <IconWithText
            icon={
              <CompanyIcon
                company={vehicle.network || ''}
                fallbackContent={getVehicleIcon(formFactor)}
                height={22}
                style={{ marginRight: '5px' }}
                width={22}
              />
            }
          >
            {name}
          </IconWithText>
        </CardTitle>
        <DistanceDisplay distance={vehicle.distance} />
      </CardHeader>
      <CardBody>
        {vehicle.name !== 'Default vehicle type' && vehicle.name !== name && (
          <div>{vehicle.name}</div>
        )}
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

export default connect(mapStateToProps)(Vehicle)
